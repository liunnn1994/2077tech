/// <reference types="cypress" />
export function assertBrowserHealth(value: unknown) {
  const report = value as {
    errors: unknown[];
    warnings: { text: string }[];
    targets: string[];
  };
  expect(
    report.targets.some((target) => target.startsWith('worker:')),
    'native worker console observed',
  ).to.eq(true);
  expect(report.errors, 'Chrome main thread and worker errors').to.deep.eq([]);
  // Keep known ANGLE rounding diagnostics; all other warnings must be investigated.
  const unexpected = report.warnings.filter(
    (issue) =>
      !issue.text
        .split('\n')
        .filter((line) => line.trim())
        .every((line) => line.includes('warning X4122:')),
  );
  expect(unexpected, 'unexpected shader and application warnings').to.deep.eq([]);
}
export function installBrowserHealth() {
  beforeEach(() => {
    cy.task('browser:start');
  });
  afterEach(() => {
    cy.task('browser:report').then(assertBrowserHealth);
  });
}
