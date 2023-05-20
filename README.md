# Backend News API

This repo is the backend part of my news app. You can view the completed project at https://bbb-news.netlify.app/ . You can find the frontend code for the project at https://github.com/bobbynagra92/nc-news . 

The news app uses JavaScript with Node.js to create API endpoints which are then accessed by the frontend. The API can be accessed at https://be-news-api-m2rq.onrender.com/api . The link provides a list of all the endpoints which exist for the project.

The app uses JavaScript with Node.js and Express. Testing has been carried out using Jest and Supertest.

## Setup
To set up, you can either clone or fork this repo and perform `npm install`, which should also install all peer dependencies automatically. If this doesn't work you can perform any of the following to install any missing dependencies: 

```
npm install jest -d
npm install jest-sorted
npm install supertest -d
npm install pg-format -d
npm install cors
npm install pg
npm instal dotenv
npm install express
```

## Data
User accounts, articles and comments were created with PostgreSQL.

The test and development data for the project can be found within the ***db/data*** folder. The files within these folders show the format which should be followed for each dataset.

`.env` files will need to be added which specify the environment variables which direct the code to your respective database. The code in the file should be as follows:

```
PGDATABASE = <DATABASE_NAME>
```

There should be one database per file and the `.env` files should be named as such; `.env.test` (Test Data) or `.env.development` (Development Data) for the current set-up.

