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
  fetchArticleComments(article_id).then((comments) => {
    if (comments.length){
      res.status(200).send({comments});
    }
  })
  .then(() => {
    return fetchArticle(article_id);
  })
  .then(result => {
    if(result.hasOwnProperty('article_id')){
      res.status(200).send([]);
    };
  })
  .catch(next)
}
