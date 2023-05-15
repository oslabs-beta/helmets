const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');

const models = require('./models/dataModel');
const dataController = require('./controllers/dataController');

const sample_path_payload = require('./sample_data/sample_path_payload');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

// helmets-specific routes
// POST to /chart
app.post('/chart', dataController.addFiles, (req, res) => {
  res.status(200).json(res.locals.responseData)
});

// GET to /chart
app.get('/chart', dataController.getTemplate, (req, res) => {
  res.status(200).json(res.locals.responseData)
});

// GET to /path
app.get('/path', dataController.getPath, (req, res) => {
  res.status(200).json(sample_path_payload);
});

// unknown route handler 
app.use((req, res)=> {
  res.status(404).send('Invalid request')
});

// global error handler
app.use((err, req, res) => {
  const defaultError = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err : 'An error occurred' }
  };
  const errorObj = Object.assign({}, defaultError, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => console.log('listening on', PORT));