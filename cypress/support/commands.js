import saveAs from 'file-saver';

Cypress.Commands.add('generateAndDownloadJson', (jsonData, fileName) => {
  //const jsonString = JSON.stringify(jsonData, null, 2);
  //const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  //saveAs(blob, fileName);
  cy.writeFile(fileName, jsonData);
});


Cypress.Commands.add('exportToCsv', (data, fileName) => {
  let oldData = [];
  const filePath = 'download/data.csv';
    cy.readFile(filePath, 'utf-8').then((csvData) => {
      const lines = csvData.split('\n');
      const updatedData = lines.map((line, index) => {
        if (index === 0) {
          return line; 
        }
        oldData.push(lines[index].split(',')); 
      });
      let oldContent ='';
      oldData.forEach((a, index) => {
        oldContent += oldData[index].join(',') + '\n';
      })
      const nameColumn = data.map(item => item.name).join(',');
      const countColumn = data.map(item => item.count).join(',');
      const indicatorColumn = data.map(item => item.indicator).join(',');
      cy.log('oldContent', oldContent);
     
      const currentDate = new Date();
      let formattedDate = currentDate.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      formattedDate = formattedDate.replace(',','');
    
      cy.log('oldData', oldData);
      cy.log('oldDatalength', oldData[0]);
    
      const csvContent = `Name,${nameColumn}\n${oldContent}${formattedDate},${countColumn}`;
      cy.log('csvContent', csvContent)
      cy.writeFile(filePath, `Name,${formattedDate}`)
      .then(() => {
        cy.writeFile(filePath, csvContent);
      });
    });
   
  });

  // cypress/support/commands/jsonCommands.js

const fs = require('fs');

Cypress.Commands.add('readAndUpdateJsonFile', (filePath, defaultData) => {
      cy.readFile(filePath).then((jsonData) => {
        // Perform updates on jsonData as needed
        cy.log(jsonData);
        cy.log(defaultData);

        jsonData = [...jsonData, ...defaultData];
        // Write the updated JSON data back to the file
        cy.writeFile(filePath, jsonData).then(() => {
          // Continue with your test or assertions (if needed)
          cy.log('JSON file updated successfully!');
        });
      });
    

  // if (fs.readFileSync(filePath)) {
  //   // If the file exists, read and update the JSON data
  //   cy.readFile(filePath).then((jsonData) => {
  //     // Perform updates on jsonData as needed
      
  //     jsonData = [...jsonData, ...defaultData];
  //     // Write the updated JSON data back to the file
  //     cy.writeFile(filePath, jsonData).then(() => {
  //       // Continue with your test or assertions (if needed)
  //       cy.log('JSON file updated successfully!');
  //     });
  //   });
  // } else {
  //   // If the file does not exist, create it with default data
  //   cy.writeFile(filePath, defaultData).then(() => {
  //     // Continue with your test or assertions (if needed)
  //     cy.log('JSON file created successfully!');
  //   });
  // }
});

