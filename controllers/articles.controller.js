const {fetchArticle, fetchArticlesPlusCommentCount, fetchArticleComments, addComment} = require('../models/articles.model')

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

exports.postArticleComments = (req, res, next) => {
  const {article_id} = req.params;
  const comment = req.body;
  addComment(article_id, comment).then(comment => {
    res.status(201).send({comment})
  
  })
  .catch(next)
}
