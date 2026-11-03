/// <reference types="cypress" />
import 'cypress-real-events';
import type {} from '../../src/experience/runtime';
import { installBrowserHealth } from '../support/browser-health';

function openStudy() {
  cy.visit('/?learn');
  cy.get('main', { timeout: 120000 }).should('have.attr', 'data-status', 'ready');
  cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().section).to.eq('home'));
}
function button(text: string) {
  cy.contains('button', text).realHover();
  cy.wait(150);
  cy.contains('button', text).realClick();
}
function jump(text: string, index: number) {
  button(text);
  cy.window().should((win) =>
    expect(win.__DEMO_STUDY__!.snapshot().scenes[index]?.visible).to.eq(true),
  );
}
function wheelTo(target: number, remaining = 100) {
  cy.window().then((win) => {
    const delta = target - win.__DEMO_STUDY__!.snapshot().targetScroll;
    if (Math.abs(delta) < 0.025) return;
    expect(remaining, 'bounded native wheel exploration').to.be.greaterThan(0);
    cy.get('#webgl').realMouseWheel({ deltaY: Math.max(-250, Math.min(250, delta / 0.00075)) });
    cy.wait(120);
    wheelTo(target, remaining - 1);
  });
}
function point(name: string, action: (x: number, y: number) => void) {
  cy.window()
    .should((win) => {
      const target = win.__DEMO_STUDY__!.targets()[name];
      expect(target?.x, `${name} in viewport`).to.be.within(0, win.innerWidth);
      expect(target?.y, `${name} in viewport`).to.be.within(0, win.innerHeight);
    })
    .then((win) => {
      const target = win.__DEMO_STUDY__!.targets()[name];
      expect(Boolean(target), name).to.eq(true);
      expect(target!.x, `${name} x`).to.be.within(0, win.innerWidth);
      expect(target!.y, `${name} y`).to.be.within(0, win.innerHeight);
      action(target!.x, target!.y);
    });
}
function click(name: string) {
  point(name, (x, y) => {
    cy.get('#webgl').realMouseMove(x, y);
    cy.wait(200);
    cy.get('#webgl').realClick({ x, y });
  });
}
function destination(host: string) {
  cy.get('[aria-label="离线外链"]').should('be.visible').and('contain', host);
  button('返回场景');
}

describe('Complete interactive experience / real Chrome', () => {
  installBrowserHealth();
  for (const project of [
    {
      index: 0,
      slug: 'pudgy-penguins',
      social: [
        'x.com/pudgypenguins',
        'instagram.com/pudgypenguins',
        'linkedin.com/company/pudgy-penguins',
        'tiktok.com/@pudgypenguins',
      ],
      website: 'pudgypenguins.com',
    },
    { index: 1, slug: 'overpass', social: ['twitter.com/OverpassIP'], website: 'overpassip.com' },
  ]) {
    it(`hovers and wipes cube ${project.index}, opens ${project.slug}, clicks every social link and website, closes and traverses history`, () => {
      cy.viewport(1440, 650);
      cy.visit('/');
      cy.get('main', { timeout: 120000 }).should('have.attr', 'data-status', 'ready');
      cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().section).to.eq('home'));
      cy.get('#webgl').realHover({ position: 'center' });
      cy.wait(200);
      wheelTo(2.35);
      cy.window().should((win) =>
        expect(win.__DEMO_STUDY__!.snapshot().scenes[1]?.visible).to.eq(true),
      );
      cy.wait(2500);
      if (project.index) {
        wheelTo(3.35);
        cy.wait(3500);
      }
      point(`cube${project.index}`, (x, y) => {
        cy.get('#webgl').realMouseMove(x - 60, y);
        cy.wait(200);
        for (let offset = -50; offset <= 50; offset += 20) {
          cy.get('#webgl').realMouseMove(x + offset, y + 10);
          cy.wait(40);
        }
      });
      cy.window().should((win) => {
        const frost = win.__DEMO_STUDY__!.snapshot().frost[project.index]!;
        expect(Number.isFinite(frost.x) && Number.isFinite(frost.y)).to.eq(true);
        expect(frost.velocity, 'real raycast drives frost feedback').to.be.greaterThan(0);
      });
      click(`cube${project.index}`);
      cy.location('pathname').should('eq', `/portfolio/${project.slug}`);
      cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().section).to.eq('project'));
      cy.wait(2000);
      cy.get('#webgl').realMouseWheel({ deltaY: 10000 });
      cy.window().should((win) => {
        const state = win.__DEMO_STUDY__!.snapshot();
        expect(state.projectScrollMax).to.be.greaterThan(0);
        expect(Math.abs(state.projectScroll - state.projectScrollMax)).to.be.lessThan(1);
      });
      project.social.forEach((host, index) => {
        click(`social${index}`);
        destination(host);
      });
      click('website');
      destination(project.website);
      cy.get('#webgl').realMouseMove(700, 350);
      cy.realPress('ArrowUp');
      cy.window().then((win) => {
        const before = win.__DEMO_STUDY__!.snapshot().projectScroll;
        cy.realPress('ArrowUp');
        cy.window().should((next) =>
          expect(next.__DEMO_STUDY__!.snapshot().projectScroll).to.be.lessThan(before),
        );
      });
      click('close');
      cy.location('pathname').should('eq', '/');
      cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().detailOpen).to.eq(false));
      cy.go('back');
      cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().section).to.eq('project'));
      cy.go('forward');
      cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().section).to.eq('home'));
    });
  }
  it('cycles all particle shapes through canvas arrows, background clicks, keyboard and every destination', () => {
    cy.visit('/');
    cy.get('main', { timeout: 120000 }).should('have.attr', 'data-status', 'ready');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().section).to.eq('home'));
    cy.get('#webgl').realHover({ position: 'center' });
    cy.wait(200);
    wheelTo(8.29);
    cy.window().should((win) =>
      expect(win.__DEMO_STUDY__!.snapshot().particleSelectorEnabled).to.eq(true),
    );
    cy.wait(1000);
    cy.get('#webgl').realMouseMove(300, 300);
    cy.wait(150);
    let pointerX = 0;
    cy.window().then((win) => {
      pointerX = win.__DEMO_STUDY__!.snapshot().particlePointer.x;
    });
    cy.get('#webgl').realMouseMove(950, 500);
    cy.window().should((win) =>
      expect(
        Math.abs(win.__DEMO_STUDY__!.snapshot().particlePointer.x - pointerX),
      ).to.be.greaterThan(0.1),
    );
    for (const [index, host] of [
      [0, 'example.com/demo/linkedin'],
      [1, 'example.com/demo/x'],
      [2, 'example.com/demo/medium'],
    ] as const) {
      cy.window().should((win) =>
        expect(win.__DEMO_STUDY__!.snapshot().particleIndex).to.eq(index),
      );
      click('particleLink');
      destination(host);
      click('particleRight');
    }
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().particleIndex).to.eq(0));
    click('particleLeft');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().particleIndex).to.eq(2));
    cy.get('#webgl').realMouseMove(700, 300);
    cy.realPress('ArrowRight');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().particleIndex).to.eq(0));
    cy.realPress('ArrowLeft');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().particleIndex).to.eq(2));
    cy.get('#webgl').realClick({ x: 900, y: 300 });
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().particleIndex).to.eq(0));
    cy.get('#webgl').realHover({ position: 'center' });
    wheelTo(0.66);
    cy.window().should((win) =>
      expect(win.__DEMO_STUDY__!.snapshot().particleSelectorEnabled).to.eq(false),
    );
  });
  it('handles narrow-screen native swipes, particle shape selection, resize and detail text touch scrolling', () => {
    cy.viewport(390, 844);
    openStudy();
    // The study panel covers a narrow canvas; close it using its actual navigation link.
    cy.contains('a', '返回体验').realClick();
    cy.get('main', { timeout: 120000 }).should('have.attr', 'data-status', 'ready');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().section).to.eq('home'));
    cy.get('#webgl').realSwipe('toTop', { x: 180, y: 650, length: 280, step: 20 });
    cy.window().should((win) =>
      expect(win.__DEMO_STUDY__!.snapshot().targetScroll).to.be.greaterThan(0.7),
    );
    cy.visit('/portfolio/overpass');
    cy.get('main', { timeout: 120000 }).should('have.attr', 'data-status', 'ready');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().section).to.eq('project'));
    cy.wait(1500);
    cy.get('#webgl').realSwipe('toTop', { x: 190, y: 650, length: 250, step: 20 });
    cy.window().should((win) =>
      expect(win.__DEMO_STUDY__!.snapshot().projectScroll).to.be.greaterThan(20),
    );
    cy.viewport(844, 390);
    cy.window().should((win) =>
      expect(win.__DEMO_STUDY__!.canvas().getBoundingClientRect().width).to.eq(844),
    );
    cy.realPress('Escape');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().detailOpen).to.eq(false));
    cy.viewport(390, 844);
    cy.get('#webgl').realHover({ position: 'center' });
    wheelTo(8.29);
    cy.window().should((win) =>
      expect(win.__DEMO_STUDY__!.snapshot().particleSelectorEnabled).to.eq(true),
    );
    cy.get('#webgl').realSwipe('toLeft', { x: 350, y: 420, length: 300, step: 300 });
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().particleIndex).to.eq(2));
    // Let the volume and arrow transition settle before the opposite fling.
    cy.wait(750);
    cy.get('#webgl').realSwipe('toRight', { x: 40, y: 420, length: 300, step: 300 });
    cy.window().then((win) => {
      const swipe = win.__DEMO_STUDY__!.snapshot().lastSwipe!;
      expect(swipe.x, 'native right fling distance').to.eq(300);
      expect(swipe.velocityX, 'native fling exceeds the scene threshold').to.be.greaterThan(1000);
    });
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().particleIndex).to.eq(0));
  });
  it('supports logo hover, keyboard exploration, every scene control and returning to the experience', () => {
    openStudy();
    let logoSeed = 0;
    cy.window().then((win) => {
      logoSeed = win.__DEMO_STUDY__!.snapshot().logoSeed;
    });
    point('logo', (x, y) => {
      cy.get('#webgl').realMouseMove(x, y);
      cy.wait(250);
    });
    cy.window().should((win) =>
      expect(win.__DEMO_STUDY__!.snapshot().logoSeed).not.to.eq(logoSeed),
    );
    let iceX = 0;
    cy.window().then((win) => {
      iceX = win.__DEMO_STUDY__!.snapshot().icePointer.x;
    });
    cy.get('#webgl').realMouseMove(850, 450);
    cy.window().should((win) =>
      expect(Math.abs(win.__DEMO_STUDY__!.snapshot().icePointer.x - iceX)).to.be.greaterThan(0.1),
    );
    cy.get('#webgl').realMouseMove(700, 350);
    cy.window().then((win) => {
      const start = win.__DEMO_STUDY__!.snapshot().scroll;
      cy.realPress('ArrowDown');
      cy.window().should((next) =>
        expect(next.__DEMO_STUDY__!.snapshot().targetScroll).to.be.greaterThan(start),
      );
      cy.realPress('ArrowUp');
    });
    jump('冰块', 1);
    jump('体积粒子', 2);
    jump('冰屋', 0);
    button('暂停动画');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().active).to.eq(false));
    button('继续动画');
    cy.window().should((win) => expect(win.__DEMO_STUDY__!.snapshot().active).to.eq(true));
    cy.window().then((win) => {
      const muted = win.__DEMO_STUDY__!.snapshot().muted;
      button('切换声音');
      cy.window().should((next) => expect(next.__DEMO_STUDY__!.snapshot().muted).to.eq(!muted));
    });
    cy.contains('a', '返回体验').realClick();
    cy.location('search').should('eq', '');
    cy.get('[aria-label="源码学习面板"]').should('not.exist');
    cy.get('main', { timeout: 120000 }).should('have.attr', 'data-status', 'ready');
  });
});
