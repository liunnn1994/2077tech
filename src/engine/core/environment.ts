import WebGL from 'three/addons/capabilities/WebGL.js';
import { UAParser } from 'ua-parser-js';
import { events } from './events';

export type DeviceKind = 'desktop' | 'mobile' | 'tablet';
export type OperatingSystemName = 'unknown' | 'mac' | 'ios' | 'windows' | 'android' | 'linux';
export type BrowserName =
  | 'unknown'
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'edge'
  | 'opera'
  | 'ie'
  | 'facebook';
export type EnvironmentQuery = Readonly<Record<string, string | null>>;

export interface VersionInfo<Name extends string> {
  name: Name;
  fullVersion: string;
  /** The captured compatibility rules compare the first two version components. */
  version: number;
}
export interface ScreenInfo {
  dpr: number;
  aspectRatio: number;
  width: number;
  height: number;
  /** Camera and input code use these aliases of width and height. */
  w: number;
  h: number;
}
export interface Capabilities {
  webgl2: boolean;
  touch: boolean;
  offscreenCanvas: boolean;
  userMedia: boolean;
  fullScreen: boolean;
  geo: boolean;
  imageBitmap: boolean;
}
interface LegacyNavigatorCapabilities {
  readonly userLanguage?: string;
  readonly msMaxTouchPoints?: number;
  readonly getUserMedia?: unknown;
  readonly webkitGetUserMedia?: unknown;
  readonly mozGetUserMedia?: unknown;
  readonly msGetUserMedia?: unknown;
}
interface LegacyDocumentCapabilities {
  readonly mozFullscreenEnabled?: boolean;
  readonly webkitFullscreenEnabled?: boolean;
  readonly msFullscreenEnabled?: boolean;
}

/** Keep property-style query reads, including null for absent parameters. */
function readQuery(search: string): EnvironmentQuery {
  const parameters = new URLSearchParams(search);
  return new Proxy<Record<string, string | null>>(
    {},
    {
      get: (_target, key): string | null | undefined =>
        typeof key === 'string' ? parameters.get(key) : undefined,
    },
  );
}

export const webGLCapabilities = WebGL;

/** Browser facts and viewport events shared by the render, input and audio layers. */
export class Environment {
  readonly #parser = new UAParser();
  readonly #html = document.documentElement;
  #isIos = false;
  #listening = false;
  #resizeTimer: number | undefined;

  relativePath = '';
  absolutePath = window.location.origin;
  readonly UAInfo = this.#parser.getResult();
  readonly query = readQuery(window.location.search);
  readonly language: string;
  device: DeviceKind = 'desktop';
  visible = true;
  focused = true;
  readonly electron = this.UAInfo.ua.toLowerCase().includes(' electron/');
  oldIphone = false;
  devScene = false;
  readonly os: VersionInfo<OperatingSystemName> = { name: 'unknown', fullVersion: '0', version: 0 };
  readonly browser: VersionInfo<BrowserName> = { name: 'unknown', fullVersion: '0', version: 0 };
  readonly screen: ScreenInfo = {
    dpr: window.devicePixelRatio || 1,
    aspectRatio: 1,
    width: 0,
    height: 0,
    w: 0,
    h: 0,
  };
  readonly capabilities: Capabilities;

  readonly boundVisibilityChange = (): void => {
    this.#updateVisibility();
  };
  readonly boundFocusChange = (): void => {
    this.#updateFocus();
  };
  readonly boundDebouncedResize = (): void => {
    if (this.#resizeTimer !== undefined) window.clearTimeout(this.#resizeTimer);
    this.#resizeTimer = window.setTimeout(
      () => {
        this.#resizeTimer = undefined;
        this.#updateSize();
      },
      this.#isIos ? 500 : 50,
    );
  };

  constructor() {
    // Legacy capabilities remain local extensions; no untyped Window/Navigator bag.
    const browserNavigator = navigator as Navigator & LegacyNavigatorCapabilities;
    const browserDocument = document as Document & LegacyDocumentCapabilities;
    this.language = (navigator.language || browserNavigator.userLanguage || 'en').slice(0, 2);
    this.capabilities = {
      webgl2: WebGL.isWebGL2Available(),
      touch:
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (browserNavigator.msMaxTouchPoints ?? 0) > 0,
      offscreenCanvas: Boolean(HTMLCanvasElement.prototype.transferControlToOffscreen),
      userMedia: Boolean(
        navigator.mediaDevices?.getUserMedia ||
        browserNavigator.getUserMedia ||
        browserNavigator.webkitGetUserMedia ||
        browserNavigator.mozGetUserMedia ||
        browserNavigator.msGetUserMedia,
      ),
      fullScreen: Boolean(
        document.fullscreenEnabled ||
        browserDocument.mozFullscreenEnabled ||
        browserDocument.webkitFullscreenEnabled ||
        browserDocument.msFullscreenEnabled,
      ),
      geo: typeof navigator.geolocation !== 'undefined',
      imageBitmap: true,
    };
    this.#classifyPlatform();
    this.#classifyBrowser();
    this.#applyImageBitmapCompatibility();
    this.#html.classList.add(this.language, this.device);
    if (this.os.name !== 'unknown') this.#html.classList.add(this.os.name);
    if (this.browser.name !== 'unknown') this.#html.classList.add(this.browser.name);
    this.#isIos = this.os.name === 'ios';
    this.init();
  }

  #classifyPlatform(): void {
    const deviceType = (this.UAInfo.device.type ?? '').toLowerCase();
    if (deviceType === 'mobile' || deviceType === 'tablet') this.device = deviceType;
    const systemName = (this.UAInfo.os.name ?? '')
      .toLowerCase()
      .replace(/(mobile|phone)+/g, '')
      .trim();
    switch (systemName) {
      // UAParser 2 calls this macOS; the captured deployment used Mac OS.
      case 'macos':
      case 'mac os':
        this.os.name = 'mac';
        break;
      case 'ios':
      case 'windows':
      case 'android':
        this.os.name = systemName;
        break;
      case 'linux':
      case 'mint':
      case 'ubuntu':
      case 'debian':
      case 'suse':
      case 'fedora':
        this.os.name = 'linux';
        break;
    }
    if (this.os.name !== 'unknown' && this.os.name !== 'linux') {
      this.os.fullVersion = this.UAInfo.os.version || this.os.fullVersion;
      this.os.version = Environment.#majorMinorVersion(this.os.fullVersion);
    }
    // iPad desktop UAs deliberately report macOS while retaining touch support.
    if (this.os.name === 'mac' && this.capabilities.touch) {
      this.device = 'tablet';
      this.os.name = 'ios';
    }
    this.oldIphone =
      this.device === 'mobile' && this.os.name === 'ios' && window.devicePixelRatio < 3;
  }

  #classifyBrowser(): void {
    const browserName = (this.UAInfo.browser.name ?? '')
      .toLowerCase()
      .replace(/(mobile|phone)+/g, '')
      .trim();
    switch (browserName) {
      case 'chrome':
      case 'firefox':
      case 'safari':
      case 'edge':
      case 'opera':
      case 'ie':
      case 'facebook':
        this.browser.name = browserName;
        this.browser.fullVersion = this.UAInfo.browser.version || this.browser.fullVersion;
        this.browser.version = Environment.#majorMinorVersion(this.browser.fullVersion);
        break;
    }
  }

  #applyImageBitmapCompatibility(): void {
    if (
      (this.browser.name === 'safari' && this.browser.version < 17.5) ||
      (this.browser.name === 'firefox' && this.browser.version < 100) ||
      (this.os.name === 'ios' && this.browser.name !== 'safari')
    )
      this.capabilities.imageBitmap = false;
  }

  static #majorMinorVersion(version: string): number {
    const [major, minor] = version.split('.');
    return Number(`${major ?? '0'}.${minor || ''}`);
  }

  init(): void {
    if (this.#listening) return;
    this.#listening = true;
    window.addEventListener('resize', this.boundDebouncedResize);
    window.addEventListener('orientationchange', this.boundDebouncedResize);
    this.#updateSize();
    this.boundDebouncedResize();
    document.addEventListener('visibilitychange', this.boundVisibilityChange);
    window.addEventListener('focus', this.boundFocusChange);
    window.addEventListener('blur', this.boundFocusChange);
    this.#updateVisibility();
    this.#updateFocus();
  }

  #updateSize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.screen.width = this.screen.w = width;
    this.screen.height = this.screen.h = height;
    this.screen.aspectRatio = width / height;
    if (this.#isIos && Math.min(window.screen.width, window.screen.height) !== height)
      this.#html.scrollTop = -1;
    events.emit('resize', width, height);
  }

  #updateVisibility(): void {
    this.visible = document.visibilityState === 'visible';
    events.emit('visibility_change', this.visible);
  }

  #updateFocus(): void {
    this.focused = document.hasFocus();
    events.emit('focus_change', this.focused);
  }

  setRelativePath(path: string): void {
    this.relativePath = path.replace(/^\/+|\/+$/g, '');
    this.absolutePath = `${window.location.origin}${this.relativePath ? `/${this.relativePath}` : ''}`;
  }

  dispose(): void {
    if (this.#resizeTimer !== undefined) window.clearTimeout(this.#resizeTimer);
    this.#resizeTimer = undefined;
    window.removeEventListener('resize', this.boundDebouncedResize);
    window.removeEventListener('orientationchange', this.boundDebouncedResize);
    document.removeEventListener('visibilitychange', this.boundVisibilityChange);
    window.removeEventListener('focus', this.boundFocusChange);
    window.removeEventListener('blur', this.boundFocusChange);
    this.#listening = false;
  }
}

export const environment = new Environment();
