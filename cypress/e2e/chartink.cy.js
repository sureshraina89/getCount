
const fileExists = require('../../fileExists');

describe('API Testing', () => {
  let testData = [];
  let fileExists = false;
  const currentDate = new Date();
  let formattedNewDate = currentDate.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  formattedNewDate = formattedNewDate.split("/").join("-");
  const fileNameWithDate = `download/data-${formattedNewDate}.json`;
  it('should fetch data from an API', () => {
    cy.request('GET', 'https://get-count.onrender.com/api/getAllData') 
      .then((response) => {
        expect(response.status).to.equal(200); 
        const data = response.body;
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

        data.forEach((item) => {
          cy.visit(item.url)
          cy.get('#DataTables_Table_0_info')
            .invoke('text')
            .then(text => {
              testData.push({name: item.name, count: text.split(' ')[1] ? text.split(' ')[1].replace(',', ''): text.split(' ')[1], indicator: null, currentTime: formattedDate});
            });
          
        });
      });


  });
  after(() => {

    const fileName = 'download/data.json';

    cy.exportToCsv(testData, 'Report');
    cy.generateAndDownloadJson(testData, fileName);
    cy.task('fileExists', fileNameWithDate).then((fileExists) => {
      if(fileExists) {
        cy.readAndUpdateJsonFile(fileNameWithDate, testData);
      } else {
        cy.generateAndDownloadJson(testData, fileNameWithDate);
      }
    });
  });
});
