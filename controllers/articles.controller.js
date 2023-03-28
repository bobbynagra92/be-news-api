const fetchArticle = require('../models/articles.model')

function getArticles(req,res, next){
  const {article_id} = req.params; 
  fetchArticle(article_id).then((article) => {
    res.status(200).send({article});
  })
  .catch(next)
}

module.exports = getArticles