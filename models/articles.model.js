const db = require('../db/connection');

exports.fetchArticle = (article_id) => {
  return db.query(`SELECT * FROM articles WHERE article_id = $1`, [article_id]).then((result) => {
    const output = result.rows[0];
    if (!output){
      return Promise.reject({
        status: 404,
        msg: 'No article with that ID',
      })
    }
    return output;
  })
}

exports.fetchArticlesPlusCommentCount = () => {
  return db
    .query(
      `
      SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comment_id) AS INTEGER) AS comment_count
      FROM articles
      LEFT JOIN comments ON articles.article_id = comments.article_id
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC;
    `
    )
    .then((result) => {
      return result.rows;
    });
}