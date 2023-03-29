const app = require('../app');
const request = require('supertest');
const db = require('../db/connection')
const data = require('../db/data/test-data')
const seed = require('../db/seeds/seed');

beforeEach(() => {
  return seed(data);
})

afterAll(() => {
  db.end();
})

describe('/api', () => {
  test('GET 200: Responds with a message that the server is up and running', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toBe('Server is up and running...');
      });
  });
});

describe('/api/topics', () => {
  test('GET 200: Responds with an array of the news story topics', () => {
    return request(app)
      .get('/api/topics')
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toBeInstanceOf(Array);
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
  test('ERROR 404: Responds with an error message when passed an invalid path', () => {
    return request(app)
      .get('/api/not-a-valid-path')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid path');
      });
  });
});

describe('/api/articles/:article_id', () => {
  test('GET 200: Responds with an article object', () => {
    return request(app)
      .get('/api/articles/5')
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 5,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test('ERROR 400: Responds with an error message for an invalid article request', () => {
    return request(app)
      .get('/api/articles/not-an-article-id')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid input');
      });
  });
  test('ERROR 404: Respond with an error message if the article_id is not in the database', () => {
    return request(app)
      .get('/api/articles/9999999')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('No article with that ID');
      });
  });
});

describe('/api/articles', () => {
  test('GET 200: Responds with an array of article object with comments attached', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(12);
        expect(articles).toBeSorted({
          key: 'created_at',
          descending: true,
        });
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test('ERROR 404: Responds with an error message when passed an invalid path', () => {
    return request(app)
      .get('/api/not-a-valid-path')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid path');
      });
  });
});

describe('/api/articles/:article_id/comments', () => {
  test('GET 200: Responds with an array of the comments associated to an article', () => {
    return request(app)
      .get('/api/articles/1/comments')
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(11);
        expect(comments).toBeSorted({
          key: 'created_at',
          descending: true,
        });
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
      });
  });

  test('GET 200: Responds with an empty array when there are no comment but article_id is valid', () => {
    return request(app)
      .get('/api/articles/4/comments')
      .expect(200)
      .then(({body}) => {
        const {comments} = body
        expect(comments).toEqual([]);
      })
  })

  test('ERROR 400: Responds with an error message when passed an invalid request input', () => {
    return request(app)
      .get('/api/articles/not-a-num/comments')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid input');
      });
  });

  test('ERROR 404: Responds with an error message for an article_id which is not within the database', () => {
    return request(app)
      .get('/api/articles/99999/comments')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('No article with that ID');
      });
  });
});

describe('/api/articles/:article_id/comments', () => {
  test('POST 201: Adds comment and responds with posted comment', () => {
    const newComment = {
      username: 'lurker',
      body: 'test',
    };
    return request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toMatchObject({
          comment_id: 19,
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          article_id: 1,
        });
      });
  });
  test('ERROR 400: Responds with an error message when attempting to POST an invalid comment', () => {
    const newComment = {
      username: 'bobby',
      body: null,
    };
    return request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid input');
      });
  });
  test('ERROR 400: Responds with an error message when missing required POST field(s)', () => {
    const newComment = {};
    return request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid input');
      });
  });
  test('ERROR 400: Responds with an error message when passed an invalid api request', () => {
     const newComment = {
       username: 'lurker',
       body: 'test',
     };
     return request(app)
       .post('/api/articles/not-a-num/comments')
       .send(newComment)
       .expect(400)
       .then(({ body }) => {
         expect(body.msg).toBe('Invalid input');
       });
  });
});