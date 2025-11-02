/// <reference types="cypress" />
// Cypress support/e2e entry
// Keep monkey tests resilient: do not fail the run on app's uncaught exceptions
Cypress.on('uncaught:exception', () => {
  // returning false here prevents Cypress from failing the test
  return false;
});

// Small helpers
export const randomString = (length = 6) => Math.random().toString(36).substring(2, 2 + length);
