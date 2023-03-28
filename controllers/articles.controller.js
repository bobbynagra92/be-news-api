const {fetchArticle, fetchArticlesPlusCommentCount, fetchArticleComments} = require('../models/articles.model')

exports.getArticleByID = (req,res, next) => {
  const {article_id} = req.params; 
  fetchArticle(article_id).then((article) => {
    res.status(200).send({article});
  })
  .catch(next);
}

exports.getAllArticles = (req, res, next) => {
  fetchArticlesPlusCommentCount().then((articles) => {
    res.status(200).send({articles});
  })
  .catch(next);
}

exports.getArticleComments = (req, res, next) => {
  const {article_id} = req.params;
  const commentPromises = [fetchArticleComments(article_id), fetchArticle(article_id)]

  Promise.all(commentPromises).then((result) => {
      res.status(200).send({comments: result[0]})
  })
  .catch(next)
}
