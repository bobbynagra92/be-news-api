const express = require('express');
const getTopics = require('./controllers/topics.controller');
const {getArticleByID, getAllArticles, getArticleComments} = require('./controllers/articles.controller')
const {
  invalidPathErrors,
  handleServerErrors,
  badPSQLRequests,
  customErrors,
} = require('./controllers/error-handling.controller');

const app = express();

app.get('/api', (req, res) => {
  res.status(200).send({ msg: 'Server is up and running...' });
});
app.get('/api/topics', getTopics);
app.get('/api/articles/:article_id', getArticleByID);
app.get('/api/articles', getAllArticles)
app.get('/api/articles/:article_id/comments', getArticleComments);

app.all('/*', invalidPathErrors);
app.use(customErrors);
app.use(badPSQLRequests);

app.use(handleServerErrors);

module.exports = app;
