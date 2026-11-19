# Triviabook

A full-stack Node.js, Express, and PostgreSQL trivia web application built for CSC 372-01.

## Live Links
- **GitHub Repository:** https://github.com/MariaBorjaReynoso/assignment6
- **Live Render Application:** https://assignment6-lu9e.onrender.com/

## API Endpoints
- `GET /triviabook/topics`: Returns a JSON array of all available trivia topics.
- `GET /triviabook/topic/:topic`: Returns questions for a specific topic. Supports optional `?difficulty=easy|medium|hard` and `?limit=<number>` query parameters.
- `GET /triviabook/random`: Returns one random trivia question without exposing the answer.
- `POST /triviabook/answer`: Accepts `{ "id": <number>, "guess": "<string>" }` and returns whether the guess is correct along with the `correctAnswer`.
- `POST /triviabook/question/add`: Accepts `{ "topic": "<string>", "question": "<string>", "answer": "<string>", "difficulty": "easy|medium|hard" }` and returns the updated question list for that topic.