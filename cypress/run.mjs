import cypress from 'cypress';
import { createServer, preview } from 'vite';

// Non-interactive runs must not exit when Cypress closes stdin.
process.env.CI = 'true';
process.exitCode = 1;

const development = process.argv.includes('--dev');
const server = development
  ? await createServer({ server: { host: '127.0.0.1', port: 0 } })
  : await preview({ preview: { host: '127.0.0.1', port: 0 } });
try {
  if (development) await server.listen();
  const address = server.httpServer.address();
  if (!address || typeof address === 'string') throw new Error('E2E server is not listening.');
  const spec = process.argv.find((arg) => arg.endsWith('.cy.ts'));
  const result = await cypress.run({
    browser: 'chrome',
    ...(spec ? { spec } : {}),
    config: { baseUrl: `http://127.0.0.1:${address.port}` },
  });
  process.exitCode =
    'totalTests' in result && result.totalTests > 0 && result.totalFailed === 0 ? 0 : 1;
} finally {
  await server.close();
}
