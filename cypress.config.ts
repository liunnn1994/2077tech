import { defineConfig } from 'cypress';
import { readdirSync } from 'node:fs';
import { BrowserDiagnostics } from './cypress/browser-diagnostics.ts';
export default defineConfig({
  video: false,
  viewportWidth: 1440,
  viewportHeight: 900,
  defaultCommandTimeout: 30000,
  pageLoadTimeout: 120000,
  e2e: {
    baseUrl: 'http://127.0.0.1:5173',
    supportFile: false,
    setupNodeEvents(on) {
      let debugPort = 0;
      const diagnostics = new BrowserDiagnostics();
      on('task', {
        'browser:start': () => diagnostics.start(debugPort),
        'browser:network': () => diagnostics.network(),
        'browser:report': () => diagnostics.report(),
        'assets:geometries': () =>
          readdirSync(new URL('./public/assets/geometries/', import.meta.url), {
            recursive: true,
            encoding: 'utf8',
          })
            .filter((name) => /\.(drc|bin)$/.test(name))
            .map((name) => name.replaceAll('\\', '/')),
      });
      on('before:browser:launch', (browser, options) => {
        if (browser.family === 'chromium') {
          debugPort = Number(
            options.args.find((arg) => arg.startsWith('--remote-debugging-port='))?.split('=')[1],
          );
          options.args.push(
            '--autoplay-policy=no-user-gesture-required',
            '--window-size=1920,1200',
            '--force-device-scale-factor=1',
          );
          options.args.push(
            '--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1',
          );
        }
        return options;
      });
    },
  },
});
