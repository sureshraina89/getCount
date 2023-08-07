const { defineConfig } = require("cypress");
const fs = require('fs');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        fileExists(filePath) {
          return new Promise((resolve) => {
            fs.access(filePath, fs.constants.F_OK, (err) => {
              if (err) {
                resolve(false); // File does not exist
              } else {
                resolve(true); // File exists
              }
            });
          });
        },
      });
    },
  },
});
