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
          article_id: expect.any(Number),
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
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid input');
      });
  });
  test('ERROR 404: Respond with an error message if the article_id is not in the database', () => {
    return (
      request(app)
      .get('/api/articles/9999999')
        .then(({ body }) => {
          expect
          expect(body.msg).toBe('No article with that ID');
        })
    );
  });
});
