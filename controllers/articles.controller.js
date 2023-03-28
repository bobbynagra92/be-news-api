const {fetchArticle, fetchArticlesPlusCommentCount} = require('../models/articles.model')

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

