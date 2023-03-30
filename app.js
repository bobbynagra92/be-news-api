const express = require('express');
const getTopics = require('./controllers/topics.controller');
const {getUsers} = require('./controllers/users.controller');
const {
  getArticleByID,
  getAllArticles,
  getArticleComments,
  postArticleComments,
  patchArticleVotes,
  deleteComment,
} = require('./controllers/articles-and-comments.controllers');
const {
  invalidPathErrors,
  handleServerErrors,
  badPSQLRequests,
  customErrors,
} = require('./controllers/error-handling.controllers');

const app = express();
app.use(express.json());

app.get('/api', (req, res) => {
  res.status(200).send({ msg: 'Server is up and running...' });
});
app.get('/api/topics', getTopics);
app.get('/api/articles/:article_id', getArticleByID);
app.get('/api/articles', getAllArticles);
app.get('/api/articles/:article_id/comments', getArticleComments);
app.get('/api/users', getUsers);
app.post('/api/articles/:article_id/comments', postArticleComments);
app.patch('/api/articles/:article_id', patchArticleVotes);
app.delete('/api/comments/:comment_id', deleteComment);

app.all('/*', invalidPathErrors);
app.use(customErrors);
app.use(badPSQLRequests);

app.use(handleServerErrors);

module.exports = app;
