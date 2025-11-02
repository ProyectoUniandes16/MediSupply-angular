/// <reference types="cypress" />
// Monkey testing for MediSupply Angular app
// Randomly interacts with the UI to surface unexpected errors

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randPick = <T>(arr: T[]): T | undefined => (arr.length ? arr[randInt(0, arr.length - 1)] : undefined);
const randText = (len = 6) => Math.random().toString(36).substring(2, 2 + len);

function clickRandomVisible() {
  const selectors = [
    'button:visible',
    'a:visible',
    '.mat-button-base:visible',
    '[role="button"]:visible',
    '.mat-icon-button:visible',
  ].join(',');

  cy.get('body').then($body => {
    const $candidates = $body.find(selectors).filter(':visible').filter((_, el) => {
      const $el = Cypress.$(el);
      // Avoid external links and downloads
      const href = $el.attr('href') || '';
      return !href.startsWith('mailto:') && !href.startsWith('tel:');
    });

    if ($candidates.length) {
      const el = $candidates.get(randInt(0, $candidates.length - 1));
      cy.wrap(el).click({ force: true });
    }
  });
}

function typeIntoRandomInput() {
  const inputSelector = 'input:visible:not([type=hidden]):not([disabled]):not([readonly]), textarea:visible';
  cy.get('body').then($body => {
    const $inputs = $body.find(inputSelector);
    if ($inputs.length) {
      const el = $inputs.get(randInt(0, $inputs.length - 1));
      cy.wrap(el).clear({ force: true }).type(randText(randInt(3, 10)), { force: true, delay: 10 });
    }
  });
}

function selectRandomOption() {
  // Works for native select and Angular Material, without failing on absence
  cy.get('body').then($body => {
    const $sels = $body.find('select:visible');
    if ($sels.length) {
      const el = $sels.get(randInt(0, $sels.length - 1));
      cy.wrap(el).then($sel => {
        const options = (($sel[0] as unknown) as HTMLSelectElement).options;
        if (options.length) {
          const idx = randInt(0, options.length - 1);
          cy.wrap(el).select(options[idx].value, { force: true });
        }
      });
      return;
    }

    const $matSel = $body.find('mat-select:visible');
    if ($matSel.length) {
      const el = $matSel.get(randInt(0, $matSel.length - 1));
      cy.wrap(el).click({ force: true });
      cy.get('body').then($b2 => {
        const $opts = $b2.find('.mat-select-panel mat-option');
        if ($opts.length) {
          const opt = $opts.get(randInt(0, $opts.length - 1));
          cy.wrap(opt).click({ force: true });
        }
      });
    }
  });
}

function randomScroll() {
  const positions = ['top', 'center', 'bottom'] as const;
  const pos = randPick(positions);
  if (pos) cy.scrollTo(pos, { ensureScrollable: false });
}

function navigateRandomLink() {
  cy.get('body').then($body => {
    const candidates = $body
      .find('a[href]:visible')
      .toArray()
      .filter(a => a.getAttribute('href') && !/^https?:\/\//.test(a.getAttribute('href') || ''));

    if (candidates.length) {
      const el = candidates[randInt(0, candidates.length - 1)];
      cy.wrap(el).click({ force: true });
    }
  });
}

function performRandomAction() {
  const actions = [clickRandomVisible, typeIntoRandomInput, selectRandomOption, randomScroll, navigateRandomLink];
  const action = randPick(actions);
  if (action) action();
}

function ensureLoggedIn() {
  // If we got redirected to login at any point, perform login again
  cy.location('pathname').then((p) => {
    if (p.includes('/auth/login')) {
      loginAsGerente('usuario@ejemplo.com', 'password123');
    }
  });
}

/**
 * Monkey test: perform N random actions with small delay
 */
function loginAsGerente(email: string, password: string) {
  // Stub backend login to ensure we can enter the app with role 'gerente'
  cy.intercept('POST', '**/auth/login', (req) => {
    req.reply({
      statusCode: 200,
      body: {
        data: {
          access_token: 'fake-token',
          user: {
            id: 1,
            nombre: 'Usuario',
            apellido: 'Ejemplo',
            email,
            rol: 'gerente',
            is_active: true,
            created_at: '2025-01-01T00:00:00.000Z',
            updated_at: '2025-01-01T00:00:00.000Z'
          }
        },
        message: 'Login exitoso'
      }
    });
  }).as('login');

  cy.visit('/auth/login');
  cy.get('input[formcontrolname="email"]').clear().type(email, { delay: 10 });
  cy.get('input[formcontrolname="password"]').clear().type(password, { log: false, delay: 10 });
  cy.get('button[type="submit"]').click();
  cy.wait('@login');

  // Should navigate to dashboard after role validation
  cy.url().should('include', '/dashboard');
}

describe('Monkey testing (random UI interactions)', () => {
  it('should login and explore key dashboard sections with random actions', () => {
    const ACTIONS_PER_SECTION = Number(Cypress.env('ACTIONS_PER_SECTION') || 100);
    const DELAY_MS = Number(Cypress.env('DELAY_MS') || 100);
    const SNAPSHOT_EVERY = Number(Cypress.env('SNAPSHOT_EVERY') || 50);

    // Perform login first with provided credentials
    loginAsGerente('usuario@ejemplo.com', 'password123');

    // Snapshot after successful login
    cy.screenshot(`monkey/after-login-${Date.now()}`, { capture: 'viewport' });

    const sections: Array<{ path: string; label: string }> = [
      { path: '/dashboard/proveedores', label: 'proveedores' },
      { path: '/dashboard/vendedores', label: 'vendedores' },
      { path: '/dashboard/productos', label: 'productos' },
      { path: '/dashboard/planes-venta', label: 'planes-venta' },
    ];

    const runSection = (path: string, label: string, actions: number) => {
      // Navigate directly to the section. Tolerate missing routes to keep the monkey going.
      cy.visit(path, { failOnStatusCode: false });
      // If the route redirects to login, log in again and retry navigation once
      cy.location('pathname', { timeout: 10000 }).then((p) => {
        if (p.includes('/auth/login')) {
          loginAsGerente('usuario@ejemplo.com', 'password123');
          cy.visit(path, { failOnStatusCode: false });
        } else if (!p.includes(path)) {
          cy.log(`Aviso: No se confirmó navegación a ${path}. Ruta actual: ${p}`);
        }
      });

      cy.screenshot(`monkey/${label}/start-${Date.now()}`, { capture: 'viewport' });

      for (let i = 1; i <= actions; i++) {
        // Before performing action, make sure we're authenticated
        ensureLoggedIn();
        cy.then(() => performRandomAction());
        cy.wait(DELAY_MS);
        // After action, if bounced to login, log in again
        ensureLoggedIn();
        if (SNAPSHOT_EVERY > 0 && i % SNAPSHOT_EVERY === 0) {
          cy.screenshot(`monkey/${label}/step-${i}-${Date.now()}`, { capture: 'viewport' });
        }
      }

      cy.screenshot(`monkey/${label}/completed-${Date.now()}`, { capture: 'viewport' });
    };

    // Run monkey actions for each target dashboard section
    for (const s of sections) {
      runSection(s.path, s.label, ACTIONS_PER_SECTION);
    }

    cy.log(
      `Monkey test completed with ${ACTIONS_PER_SECTION} actions per section (total ~${ACTIONS_PER_SECTION * sections.length}).`
    );
  });
});
