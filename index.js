const express = require('express');
const cors = require('cors');
const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const { chromium } = require('playwright');

const app = express();
app.use(cors()); // Enable CORS for all routes
const PORT = 3000; // Replace with your desired port number
const admin = require('firebase-admin');
const config = 'newConfiguration';

const currentDate = new Date();
let formattedNewDate = currentDate.toLocaleString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});
formattedNewDate = formattedNewDate.split("/").join("-");
const filePath = `download/data-${formattedNewDate}.json`;


// const corsOptions = {
//   origin: 'http://example.com', // Replace with the allowed origin
// };

// Enable JSON request body parsing
// Initialize Firebase Admin SDK with your service account credentials
const serviceAccount = require('./serviceAccountKey.json'); // Update with your own path
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://trend-analysis-app-default-rtdb.asia-southeast1.firebasedatabase.app"
});

// Get a Firestore reference
const db = admin.firestore();

app.use(express.json());

let dataList = null;
let configList = null;
let resultList = [];



// Define the time for the job to run (every day at 8:00 PM)
const scheduleTime = '0 18 * * *'; // 'minute hour day month day_of_week' (e.g., '0 20 * * *' for 8:00 PM every day)
const mrgscheduleTime = '1 0 * * *'; // 'minute hour day month day_of_week' (e.g., '0 20 * * *' for 8:00 PM every day)

// Function to be executed as the job
async function myJob() {
  console.log('calling job');
  await runProcessExec();
  console.log('Job executed at', new Date().toLocaleString());
  // Add your job logic here
}

// Schedule the job
cron.schedule(scheduleTime, myJob);
cron.schedule(mrgscheduleTime, myJob);


const getAllDocuments = async (collectionName) => {
  const snapshot = await db.collection(collectionName).get();
  const documents = snapshot.docs.map(doc => doc.data());
  getCount();
  configList = documents;
  return documents;
};


// Create a document
const createDocument = async (docData) => {
  const docRef = db.collection(config).doc();
  await docRef.set(docData);
};

// Update a document
const updateDocument = async (id, index, docData) => {
  //const docRef = db.collection(config).doc(id);
  try {
  const querySnapshot = await db.collection(config)
  .get();
  if (!querySnapshot.empty) {
    const doc = await querySnapshot.docs[index];
    const documentId = doc.id;
    await db.collection(config).doc(documentId).update(docData);
    // querySnapshot.forEach((doc) => {
    // });
  } else {
  }
    // await docRef.update(docData);
  } catch (error) {
    console.error('Error updating Document:', error);
  }
};

// delete a document
const deleteDocument = async (id, index) => {
  try {
  const querySnapshot = await db.collection(config)
  .get();
  if (!querySnapshot.empty) {
    const doc = await querySnapshot.docs[index];
    const documentId = doc.id;
    await db.collection(config).doc(documentId).delete();
    // querySnapshot.forEach((doc) => {
    // });
  } else {
    console.log(`No document found.`);
  }
 }
 catch (error) {
    console.error('Error deleting Document:', error);
  }
};

const getCount = async () => {
  //const filePath = 'download/data.json'; // Replace with the actual path to your file
  await fs.readFile(filePath, 'utf8', async(err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      //return res.status(500).send('Error reading file.');
    }
    // Send the file contents as a response
    //res.send(data);
    dataList = data;
    return data;
  });
};


app.get('/api/run', async(req, res) => {
  const result = await runProcessExec();
  res.json(result);
  // setTimeout(() => {
  //   //res.sendStatus(200);
  //   getCount();
  // }, 10000);
});

// GET all configList
app.get('/api/getAllData', async (req, res) => {
  //const documentId = 'sHwbC30hSIQ8AD5oAhyl'; // Provide an existing document ID
  res.json(await getAllDocuments(config));
});

app.post('/api/edit/:id/:index', async(req, res) => {
  await updateDocument(req.params.id, req.params.index, req.body);
  res.sendStatus(200);
});

// DELETE a config by ID
app.post('/api/delete/:id/:index', async(req, res) => {
  await deleteDocument(req.params.id, req.params.index);
  res.sendStatus(200);
});


app.post("/api/saveData", async (req, res) => {
  const { name, url } = req.body;
  const id = data.length + 1;
  const newItem = { id, name, url };
  data.push(newItem);
  await createDocument(newItem);
  res.sendStatus(200);
});



// GET all configList
app.get('/api/getCount', async (req, res) => {
  res.json(dataList);
  // res.sendStatus(200);
});

// Endpoint to serve the existing CSV file for download
app.get('/api/download', async(req, res) => {
  const csvFilePath = path.join(__dirname, 'download', 'data.csv');
  
  await res.download(csvFilePath, 'data.csv', (error) => {
    if (error) {
      console.error('Error downloading CSV:', error);
      res.status(500).send('Error downloading CSV');
    }
  });
 // res.sendStatus(200);
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function runProcessExec() {
  configList = [{"id":4,"name":"oversold","url":"https://chartink.com/screener/weekly-rsi-overbought-oversold-scan"},{"name":"RSI Oversold","id":4,"url":"https://chartink.com/screener/rsi-overbought-or-oversold-scan"},{"name":"Bullish-rsi-stochastic","id":3,"url":"https://chartink.com/screener/bullish-rsi-stochastic"}];
  console.log(configList);
  resultList=[];
  //item.url
  const browser = await chromium.launch();

   // Create a new browser context
  const context = await browser.newContext();

  // Create a new page
  const page = await context.newPage();
  configList.forEach(async (item) => {

      // Navigate to the desired URL
      //const url = 'https://chartink.com/screener/weekly-rsi-overbought-oversold-scan'; // Replace with the URL you want to visit
      await page.goto(item.url);
  
        // Wait for the div element to appear
      await page.waitForSelector('#DataTables_Table_0_info');
      // Get the value of an input element using its selector
      const inputValue =  await page.$eval('#DataTables_Table_0_info', (input) => {
      const text = input.textContent;
      return text.split(' ')[1] ? text.split(' ')[1].replace(',', ''): text.split(' ')[1]; 
    });
    resultList.push({name: item.name, count: inputValue});
    console.log('Input element value:', resultList);
    // Capture a screenshot (optional)
    //await page.screenshot({ path: 'example.png' });
    // Close the browser
  });
  await browser.close();
  return resultList; 
// await exec('npx cypress run --headless', (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Cypress execution failed: ${error}`);
  //     return;
  //   }

  //   console.log(stdout);
  // });
}


