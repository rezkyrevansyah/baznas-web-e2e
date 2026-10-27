// cypress-mochawesome-reporter tidak menyertakan tipe untuk entry plugin.
declare module 'cypress-mochawesome-reporter/plugin' {
  const plugin: (on: Cypress.PluginEvents) => void
  export default plugin
}
