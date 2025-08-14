# Kwiz API

An API for creating and managing quizzes, which supports sign up and authentication.

## Documentation

Go to [Kwiz API Docs](https://kwiz-api.vercel.app/) for a Swagger UI interface

## Authentication

All endpoints except `/api/signin` requires authentication in form of `JWT` tokens in `Authorization` header:

```
Authorization: Bearer <your_token>
```

## Endpoints

- `/`: A Swagger UI interface for the API

### `GET`
- `/api`: Home page of the API giving a brief of endpoints
- `/api/kwizes/{id}`: Get a kwiz with it's ID
- `/api/questions/{id}`: Get a question with it's ID

### `POST`
- `/api/signup`: Make an account to start using the API
- `/api/auth`: Get a JWT token for authentication
- `/api/kwizes/{id}`: Create a new quiz
- `/api/questions/{id}`: Create a new question for a kwiz

### `PUT`
- `/api/kwizes/{id}`: Batch edit all questions of a kwiz at once
- `/api/password`: Change the password of the authenticated user

### `DELETE`
- `/api/kwizes/{id}`: Delete a kwiz with it's ID
-  `/api/questions/{id}`: Delete a question with it's ID

## Tech Used
- **JWT**: Used for Authentication 
- **PostgreSQL**: SQL based database to store all kwizes
- **Vercel Serverless Functions**: Each route of the API is a server function
- **Typescript**: The whole API is written in typescript

> NOTE: This is a **testing** API and is not meant for production use.

## Authors
- [Krish](https://github.com/ikrishagarwal)