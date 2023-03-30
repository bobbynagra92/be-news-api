exports.handleServerErrors = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: 'Internal Server Error' })
}

exports.invalidPathErrors = (req, res, next) => {
  res.status(404).send({msg: 'Invalid path'})
}

exports.badPSQLRequests = (err, req, res, next) => {
  if (err.code === '22P02' || err.code === '23502'){
    res.status(400).send({ msg: 'Invalid input' });
  }
  else if (err.code === '23503' && err.constraint === 'comments_author_fkey'){
    res.status(404).send({msg: 'Username does not currently exist in database'})
  }
  else if (err.code === '23503' && err.constraint === 'comments_article_id_fkey') {
    res.status(404).send({ msg: 'No article with that ID' });
  } else next(err);
}

exports.customErrors = (err, req, res, next) => {
  if(err.status && err.msg){
    res.status(err.status).send({msg: err.msg});
  }
  else next(err)
}
