import { defineConfig } from 'cypress'
import { plugin as cypressGrepPlugin } from '@cypress/grep/plugin'
import mochawesomePlugin from 'cypress-mochawesome-reporter/plugin'

export default defineConfig({
  projectId: undefined,
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    reportPageTitle: 'BAZNAS Web E2E Report',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  expose: {
    // Test dengan tag @known-bug tidak dijalankan secara default.
    // Jalankan khusus dengan: npm run test:known-bug
    grepTags: '-@known-bug',
    grepOmitFiltered: true,
  },
  e2e: {
    baseUrl: 'https://baznas.go.id',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 15000,
    pageLoadTimeout: 90000,
    requestTimeout: 20000,
    responseTimeout: 30000,
    retries: { runMode: 1, openMode: 0 },
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      mochawesomePlugin(on)
      cypressGrepPlugin(config)
      return config
    },
  },
})
