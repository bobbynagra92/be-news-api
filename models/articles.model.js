const db = require('../db/connection');

function fetchArticle(article_id){
  return db.query(`SELECT * FROM articles WHERE article_id = $1`, [article_id]).then((result) => {
    const output = result.rows[0];
    if (!output){
      console.log('in here')
      return Promise.reject({
        status: 404,
        msg: 'No article with that ID',
      })
    }
    return output;
  })
}

module.exports = fetchArticle