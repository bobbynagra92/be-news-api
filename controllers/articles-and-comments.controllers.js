const {
  fetchArticle,
  fetchArticlesPlusCommentCount,
  fetchArticleComments,
  addComment,
  changeVotes,
  removeComment,
} = require('../models/articles-and-comments.models');

exports.getArticleByID = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getAllArticles = (req, res, next) => {
  const {topic, sort_by, order} = req.query;

  fetchArticlesPlusCommentCount(topic, sort_by, order)
  
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  const commentPromises = [
    fetchArticleComments(article_id),
    fetchArticle(article_id),
  ];

  Promise.all(commentPromises)
    .then((result) => {
      res.status(200).send({ comments: result[0] });
    })
    .catch(next);
};

exports.postArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  const comment = req.body;
  addComment(article_id, comment)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

exports.patchArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const votes = req.body.inc_votes;
  Promise.all([changeVotes(article_id, votes), fetchArticle(article_id)])
    .then((result) => {
      res.status(200).send({ article: result[0] });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const {comment_id} = req.params;
  removeComment(comment_id).then(() => {
      res.sendStatus(204)
  })
  .catch(next)
};
