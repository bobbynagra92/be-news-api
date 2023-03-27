const express = require('express');
const getTopics = require('./controllers/topics.controller');
const {invalidPathErrors, handleServerErrors} = require('./controllers/error-handling.controller')

const app = express();

app.get('/api', (req, res) => {
  res.status(200).send({ msg: 'Server is up and running...' });
});
app.get('/api/topics', getTopics);


app.all('/*', invalidPathErrors)

module.exports = app;
