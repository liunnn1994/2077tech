/// <reference types="cypress" />
import 'cypress-real-events';
import { assertBrowserHealth } from '../support/browser-health';
import type {} from '../../src/experience/runtime';

describe('Asset failure and real reload recovery', () => {
  it('shows the failed resource and recovers through the visible Retry button', () => {
    cy.task('browser:start');
    cy.intercept(
      { method: 'GET', url: '**/assets/geometries/landscape/structure-outline.drc', times: 1 },
      { statusCode: 503, body: 'temporarily unavailable' },
    );
    cy.visit('/');
    cy.get('main', { timeout: 30000 }).should('have.attr', 'data-status', 'error');
    cy.get('[role="alert"]').should('be.visible').and('contain', 'structure-outline.drc');
    cy.task('browser:report').then((value) => {
      const report = value as { errors: { text: string }[] };
      expect(report.errors.length, 'the injected real HTTP failure is recorded').to.be.greaterThan(
        0,
      );
      expect(
        report.errors.every((error) => /structure-outline|503/.test(error.text)),
        'only the injected failure is allowed',
      ).to.eq(true);
    });
    cy.task('browser:start');
    cy.contains('button', '重试').realHover();
    cy.wait(150);
    cy.contains('button', '重试').realClick();
    cy.get('main', { timeout: 120000 }).should('have.attr', 'data-status', 'ready');
    cy.get('[role="alert"]').should('not.exist');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().section).to.eq('home'));
    cy.task('browser:report').then((value) => {
      expect((value as { errors: unknown[] }).errors).to.deep.eq([]);
    });
  });
  it('cancels pending audio safely when navigating away and starts the next page normally', () => {
    let requested = false;
    cy.task('browser:start');
    cy.readFile('public/assets/audio/shard.ogg', null).then((audio) => {
      cy.intercept({ method: 'GET', url: '**/assets/audio/shard.ogg', times: 1 }, (req) => {
        requested = true;
        // Delay the actual local audio bytes without pausing a live response.
        req.reply({
          statusCode: 200,
          body: audio,
          headers: { 'content-type': 'audio/ogg' },
          delay: 15000,
        });
      });
    });
    cy.visit('/?learn');
    cy.get('main', { timeout: 120000 }).should('have.attr', 'data-status', 'ready');
    cy.wrap(null).should(() => expect(requested, 'real audio request is pending').to.eq(true));
    cy.get('[aria-label="源码学习面板"] dl').should('be.visible');
    cy.contains('a', '返回体验').realHover();
    cy.wait(150);
    cy.contains('a', '返回体验').realClick();
    cy.location('search').should('eq', '');
    cy.get('main', { timeout: 120000 }).should('have.attr', 'data-status', 'ready');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().section).to.eq('home'));
    cy.task('browser:report').then(assertBrowserHealth);
  });
});
