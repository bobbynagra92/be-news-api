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
  test('Status 404: Responds with an error message when passed an invalid path', () => {
    return request(app).get('/api/not-a-valid-path').expect(404).then(({body}) => {
      expect(body.msg).toBe('Invalid path');
    })
  })

});
