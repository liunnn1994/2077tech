/// <reference types="cypress" />
import type {} from '../../src/experience/runtime';
import { installBrowserHealth } from '../support/browser-health';

describe('Draco assets / native Chrome workers', () => {
  installBrowserHealth();
  it('starts the complete landscape without hidden worker decode errors', () => {
    cy.visit('/?learn');
    cy.get('main', { timeout: 120000 }).should('have.attr', 'data-status', 'ready');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().section).to.eq('home'));
    cy.task<string[]>('assets:geometries')
      .then((paths) => cy.window().then((win) => win.__DEMO_STUDY__!.geometryAssets(paths)))
      .then((results) => {
        expect(results.length).to.be.greaterThan(20);
        for (const geometry of results)
          expect(geometry.vertices, geometry.path).to.be.greaterThan(0);
        for (const path of ['landscape/structure-outline.drc', 'intro_particles.drc']) {
          const points = results.find((result) => result.path === path)!;
          expect(points.vertices, path).to.be.greaterThan(100);
          expect(points.indices, 'point cloud has no triangle index').to.eq(0);
        }
      });
  });
});
