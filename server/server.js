const express = require('express');
const app = express();
const PORT = 3000;
const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

app.listen(PORT, () => console.log('listening on', PORT));