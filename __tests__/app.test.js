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
  test('GET 200: Responds with a JSON object of all the available endpoint', () => {
    return request(app)
      .get('/api')
      .expect(200)
      .then(({ body }) => {
        expect(body.msg).toMatchObject({
          'GET /api': expect.any(Object),
          'GET /api/topics': expect.any(Object),
          'GET /api/articles': expect.any(Object),
          'GET /api/articles/:article_id': expect.any(Object),
          'GET /api/articles/:article_id/comments': expect.any(Object),
          'GET /api/users': expect.any(Object),
          'POST /api/articles/:article_id/comments': expect.any(Object),
          'PATCH /api/articles/:article_id': expect.any(Object),
          'DELETE /api/comments/:comment_id': expect.any(Object),
        });
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
          votes: 0,
          created_at: expect.any(String),
          author: 'lurker',
          body: 'test',
          article_id: 1,
        });
      });
  });
  test('POST 201: Adds comment and responds with posted comment when extra inputs are specified', () => {
    const newComment = {
      username: 'lurker',
      body: 'test',
      votes: 20,
    };
    return request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toMatchObject({
          comment_id: 19,
          votes: 20,
          created_at: expect.any(String),
          author: 'lurker',
          body: 'test',
          article_id: 1,
        });
      });
  });
  test('ERROR 400: Responds with an error message when attempting to POST an invalid body', () => {
    const newComment = {
      username: 'lurker',
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
  test('ERROR 404: Responds with an error message when attempting to POST an invalid username not yet in our database', () => {
    const newComment = {
      username: 'bobby',
      body: 'test',
    };
    return request(app)
      .post('/api/articles/1/comments')
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Username does not currently exist in database');
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
  test('ERROR 404: Responds with an error message when passed an article_id which does not yet exist', () => {
    const newComment = {
      username: 'lurker',
      body: 'test',
    };
    return request(app)
      .post('/api/articles/99999/comments')
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('No article with that ID');
      });
  });
});

describe('/api/articles/:article_id', () => {
  test('PATCH 200: Responds with the updated article with increased votes', () => {
    const patchVotes = { inc_votes: 10 };
    return request(app)
      .patch('/api/articles/5')
      .send(patchVotes)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          author: 'rogersop',
          title: 'UNCOVERED: catspiracy to bring down democracy',
          article_id: 5,
          topic: 'cats',
          body: 'Bastet walks amongst us, and the cats are taking arms!',
          created_at: '2020-08-03T13:14:00.000Z',
          votes: 10,
          article_img_url:
            'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
        });
      });
  });
  test('PATCH 200: Responds with the updated article with decreased votes', () => {
    const patchVotes = { inc_votes: -10 };
    return request(app)
      .patch('/api/articles/5')
      .send(patchVotes)
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          author: 'rogersop',
          title: 'UNCOVERED: catspiracy to bring down democracy',
          article_id: 5,
          topic: 'cats',
          body: 'Bastet walks amongst us, and the cats are taking arms!',
          created_at: '2020-08-03T13:14:00.000Z',
          votes: -10,
          article_img_url:
            'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
        });
      });
  });
  test('ERROR 400: Responds with an error message when missing required PATCH information', () => {
    const patchVotes = {};
    return request(app)
      .patch('/api/articles/5')
      .send(patchVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid input');
      });
  });
  test('ERROR 400: Responds with an error message when attempting to PATCH with an invalid request body', () => {
    const patchVotes = { inc_votes: 'hello' };
    return request(app)
      .patch('/api/articles/5')
      .send(patchVotes)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid input');
      });
  });
  test(
    'ERROR 404: Responds with an error message when passed an article_id which does not yet exist', () => {
      const patchVotes = { inc_votes: 10 };
      return request(app)
        .patch('/api/articles/999999')
        .send(patchVotes)
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe('No article with that ID');
        });
    }
  );
  test(
    'ERROR 400: Responds with an error message when passed an invalid api request', () => {
      const patchVotes = { inc_votes: 10 };
      return request(app)
        .patch('/api/articles/not-a-num')
        .send(patchVotes)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe('Invalid input');
        });
    }
  );
});

describe('/api/comments/:comment_id', () => {
  test('DELETE 204: Responds with empty object', () => {
    return request(app).delete('/api/comments/1').expect(204);
  });
  test('ERROR 400: Responds with an error message when passed an invalid api request', () => {
    return request(app)
      .delete('/api/comments/not-a-num')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid input');
      });
  });
  test('ERROR 404: Responds with an error message when passed an comment_id which does not yet exist', () => {
    return request(app)
      .delete('/api/comments/999999')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('No comment with that ID');
      });
  });
});

describe('/api/users', () => {
  test('GET 200: Responds with an array of all the stored users', () => {
    return request(app).get('/api/users').expect(200).then(({body}) => {
      const {users} = body;
      expect(users).toHaveLength(4);
      users.forEach(user => {
        expect(user).toMatchObject({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String),
        })
      })
    })
  })
  test('ERROR 404: Responds with an error message when passed an invalid path', () => {
    return request(app)
      .get('/api/not-a-valid-path')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe('Invalid path');
      });
  });
});

describe('/api/articles', () => {
  test('GET 200: Accepts a Topic query which responds with only articles of that topic', () => {
    return request(app)
      .get('/api/articles?topic=mitch')
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(11);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: 'mitch',
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test('GET 200: Accepts a Topic and sort_by query which responds with only articles of that topic sorted in descending order', () => {
    return request(app)
      .get('/api/articles?topic=mitch&sort_by=votes')
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(11);
        expect(articles).toBeSorted({
          key: 'votes',
          descending: true,
        });
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: 'mitch',
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test('GET 200: Accepts a Topic, sort_by and order query which responds with only articles of the topic tag', () => {
    return request(app)
      .get('/api/articles?topic=mitch&sort_by=author&order=ASC')
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(11);
        expect(articles).toBeSorted({
          key: 'author',
          ascending: true,
        });
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: 'mitch',
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test('GET 200: Returns an empty array when a topic exists but has no associated articles', () => {
    return request(app)
      .get('/api/articles?topic=paper')
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toEqual([]);
      });
  });
  test('ERROR 400: Returns an error message when sort_by is invalid', () => {
    return request(app)
      .get('/api/articles?topic=mitch&sort_by=vegetable')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('Invalid sort query');
      });
  });
  test('ERROR 400: Returns an error message when order is invalid', () => {
    return request(app)
      .get('/api/articles?topic=mitch&sort_by=votes&order=happy')
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toEqual('Invalid order query');
      });
  });
  test('ERROR 404: Returns an error message when a topic does not yet exist in the database', () => {
    return request(app)
      .get('/api/articles?topic=football')
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toEqual('Invalid topic query');
      });
  });
});

describe('/api/articles/:article_id', () => {
  test('GET 200: Return article object with comment_count', () => {
    return request(app)
      .get('/api/articles/9')
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 9,
          topic: expect.any(String),
          body: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: 2,
        });
      });
  })
})