const express = require('express');
const getTopics = require('./controllers/topics.controller');
const getArticles = require('./controllers/articles.controller')
const {
  invalidPathErrors,
  handleServerErrors,
  badPSQLRequests,
  customErrors,
} = require('./controllers/error-handling.controller');

const app = express();
app.use(express.json());

app.get('/api', (req, res) => {
  res.status(200).send({ msg: 'Server is up and running...' });
});
app.get('/api/topics', getTopics);
app.get('/api/articles/:article_id', getArticles);

app.use(customErrors);
app.use(badPSQLRequests);
app.all('/*', invalidPathErrors);

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send('Server Error!');
});

module.exports = app;
