// fileExists.js

const fs = require('fs');

module.exports = (filePath) => {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        resolve(false); // File does not exist
      } else {
        resolve(true); // File exists
      }
    });
  });
};
