const db = require('../db/connection')

function fetchTopics() {
  return db.query('SELECT * FROM topics').then(({rows}) => rows); 
}

module.exports = fetchTopics;
