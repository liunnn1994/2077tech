/// <reference types="cypress" />
import 'cypress-real-events';
import { installBrowserHealth } from '../support/browser-health';
import type { StudyRuntime } from '../../src/experience/runtime';

function ready() {
  cy.get('main', { timeout: 120000 }).should('have.attr', 'data-status', 'ready');
  cy.get('#loader').should('not.exist');
  cy.window().its('__DEMO_STUDY__').should('exist');
  cy.window().should((win) => {
    const state = win.__DEMO_STUDY__!.snapshot();
    expect(state.section).to.eq('home');
    expect(state.drawCalls).to.be.greaterThan(0);
    expect(state.width).to.be.greaterThan(0);
  });
}
function renderer(action: (runtime: StudyRuntime) => void) {
  return cy.window().then((win) => action(win.__DEMO_STUDY__!));
}
function wheel(deltaY: number) {
  cy.get('#webgl').realMouseWheel({ deltaY });
}
function clickTarget(name: string) {
  cy.window().then((win) => {
    const target = win.__DEMO_STUDY__!.targets()[name];
    expect(Boolean(target), `original raycast target ${name}`).to.eq(true);
    cy.get('#webgl').realMouseMove(target!.x, target!.y);
    cy.wait(150);
    cy.get('#webgl').realClick({ x: target!.x, y: target!.y });
  });
}

describe('IceStructure offline / real Chrome + WebGL2', () => {
  installBrowserHealth();
  let consoleErrors: string[];
  beforeEach(() => {
    consoleErrors = [];
    cy.on('window:before:load', (win) => {
      const original = win.console.error;
      win.console.error = (...values: unknown[]) => {
        consoleErrors.push(values.map(String).join(' '));
        original(...values);
      };
    });
  });
  afterEach(() => {
    expect(consoleErrors, 'application and shader errors').to.deep.eq([]);
  });
  it('renders the actual ice world, scrolls and contains all asset requests locally', () => {
    // Chrome observes page and worker traffic passively. DNS blocks external
    // hosts; no pass-through interception pauses decoder/texture requests.
    cy.visit('/');
    cy.title().should('eq', 'DEMO');
    ready();
    cy.get('#webgl').realHover({ position: 'center' });
    let start = 0;
    renderer((r) => {
      start = r.snapshot().scroll;
    });
    wheel(1300);
    cy.window().should((win) =>
      expect(win.__DEMO_STUDY__!.snapshot().scroll).to.be.greaterThan(start + 0.1),
    );
    clickTarget('sound');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().muted).to.eq(false));
    clickTarget('sound');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().muted).to.eq(true));
    cy.task('browser:network').then((value) => {
      const network = value as { requests: string[]; failures: string[] };
      const requests = network.requests.map((url) => new URL(url).pathname);
      const failures = network.failures.filter((entry) =>
        new URL(entry).pathname.startsWith('/assets/'),
      );
      const blockedBrowserRequests = network.requests.filter(
        (url) => !['localhost', '127.0.0.1'].includes(new URL(url).hostname),
      );
      expect(requests).to.include('/assets/libs/basis/basis_transcoder.wasm');
      expect(requests).to.include('/assets/libs/draco/draco_decoder.wasm');
      expect(requests).to.include('/assets/images/cubes_env.exr');
      expect(failures).to.deep.eq([]);
      expect(blockedBrowserRequests).to.deep.eq([]);
      cy.window().then((win) => {
        const appRemoteResources = win.performance
          .getEntriesByType('resource')
          .map((r) => r.name)
          .filter((url) => /^https?:/.test(url) && new URL(url).origin !== win.location.origin);
        expect(appRemoteResources).to.deep.eq([]);
      });
    });
  });

  it('opens a portfolio deep link, scrolls real text, and closes through the original canvas UI', () => {
    cy.viewport(1440, 650);
    cy.visit('/portfolio/pudgy-penguins');
    cy.get('main', { timeout: 120000 }).should('have.attr', 'data-status', 'ready');
    cy.window().should((win) => {
      const state = win.__DEMO_STUDY__!.snapshot();
      expect(state.detailOpen).to.eq(true);
      expect(state.section).to.eq('project');
    });
    cy.wait(3000);
    wheel(1200);
    cy.window().should((win) => {
      const state = win.__DEMO_STUDY__!.snapshot();
      expect(state.projectScroll).to.be.greaterThan(10);
      expect(Math.abs(state.projectScroll - state.projectScrollTarget)).to.be.lessThan(1);
    });
    // This click hits the original raycast Close mesh in the WebGL canvas.
    clickTarget('website');
    cy.get('[aria-label="离线外链"]').should('be.visible').and('contain', 'pudgypenguins.com');
    cy.contains('button', '返回场景').realClick();
    clickTarget('close');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().detailOpen).to.eq(false));
  });

  it('exposes an optional Svelte study panel with actual renderer controls', () => {
    cy.visit('/?learn');
    ready();
    cy.get('[aria-label="源码学习面板"]').should('be.visible');
    cy.contains('button', '冰块').realClick();
    cy.window().should((win) =>
      expect(win.__DEMO_STUDY__!.snapshot().scenes[1]?.visible).to.eq(true),
    );
    cy.wait(2000);
    cy.contains('button', '体积粒子').realHover();
    cy.wait(150);
    cy.contains('button', '体积粒子').realClick();
    cy.window().should((win) =>
      expect(win.__DEMO_STUDY__!.snapshot().scenes[2]?.visible).to.eq(true),
    );
    cy.wait(2000);
    cy.contains('button', '暂停动画').realHover();
    cy.wait(150);
    cy.contains('button', '暂停动画').realClick();
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().active).to.eq(false));
    let frame = 0;
    renderer((r) => {
      frame = r.snapshot().renderFrame;
    });
    cy.wait(350);
    renderer((r) => expect(r.snapshot().renderFrame).to.eq(frame));
    cy.contains('button', '继续动画').realClick();
    cy.window().should((win) =>
      expect(win.__DEMO_STUDY__!.snapshot().renderFrame).to.be.greaterThan(frame),
    );
    let muted = true;
    renderer((r) => {
      muted = r.snapshot().muted;
    });
    cy.contains('button', '切换声音').realClick();
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().muted).to.eq(!muted));
  });

  it('supports the narrow viewport and original Escape handling on Overpass', () => {
    cy.viewport(390, 844);
    cy.visit('/portfolio/overpass');
    cy.get('main', { timeout: 120000 }).should('have.attr', 'data-status', 'ready');
    cy.window().should((win) => {
      expect(win.__DEMO_STUDY__!.snapshot().detailOpen).to.eq(true);
      expect(win.__DEMO_STUDY__!.snapshot().detailIndex).to.eq(1);
      expect(win.__DEMO_STUDY__!.canvas().getBoundingClientRect().width).to.eq(390);
    });
    cy.wait(2000);
    cy.realPress('Escape');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().detailOpen).to.eq(false));
  });
});
