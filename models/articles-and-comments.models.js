const db = require('../db/connection');

exports.fetchArticle = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then((result) => {
      const output = result.rows[0];
      if (!output) {
        return Promise.reject({
          status: 404,
          msg: 'No article with that ID',
        });
      }
      return output;
    });
};

exports.fetchArticlesPlusCommentCount = (topic, sort_by, order) => {
  let retrieveArticlesQueryString = `
      SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comment_id) AS INTEGER) AS comment_count
      FROM articles
      LEFT JOIN comments ON articles.article_id = comments.article_id
    `;
  const queryParameters = [];

  if (topic) {
    retrieveArticlesQueryString += ` WHERE topic = $1`
    queryParameters.push(topic);
  }

  retrieveArticlesQueryString += ` GROUP BY articles.article_id`

  if (!sort_by && !order) {
    retrieveArticlesQueryString += ` ORDER BY articles.created_at DESC;`;
  }

  if (sort_by && !order){
    retrieveArticlesQueryString += ` ORDER BY articles.${sort_by} DESC;`
    if (!['author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count'].includes(sort_by)) {
    return Promise.reject({ status: 400, msg: 'Invalid sort query' });
  }
  }

  else if (sort_by && order){
    retrieveArticlesQueryString += ` ORDER BY articles.${sort_by} ${order};`

      if (!['author', 'title', 'article_id', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count'].includes(sort_by)) {
        return Promise.reject({ status: 400, msg: 'Invalid sort query' });}

      if (!['asc', 'desc', 'ASC', 'DESC'].includes(order)) {
       return Promise.reject({ status: 400, msg: 'Invalid order query' });
     } 
  }

  return db
    .query(retrieveArticlesQueryString, queryParameters)
    .then((result) => {
      return result.rows;
    });
};

exports.fetchArticleComments = (article_id) => {
  return db
    .query(
      `
    SELECT * FROM comments
    WHERE article_id = $1
    ORDER BY created_at DESC;
  `,
      [article_id]
    )
    .then((result) => {
      return result.rows;
    });
};

exports.addComment = (article_id, comment) => {
  let votes = 0;
  if (comment.hasOwnProperty('votes')) {
    votes = comment.votes;
  }
  return db
    .query(
      `
    INSERT INTO comments
      (body, votes, author, article_id)
    VALUES
      ($1, $2, $3, $4)
    RETURNING *;
`,
      [comment.body, votes, comment.username, article_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.changeVotes = (article_id, votes) => {
  return db
    .query(
      `
      UPDATE articles SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *;
  `,
      [votes, article_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.removeComment = (comment_id) => {
  return db
    .query(
      `
    DELETE FROM comments
    WHERE comment_id = $1
    RETURNING *
    ;
  `,
      [comment_id]
    )
    .then((result) => {
      const output = result.rows[0]
      if (!output) {
        return Promise.reject({
          status: 404,
          msg: 'No comment with that ID',
        });
      }
    });
};
