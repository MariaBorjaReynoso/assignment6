/*
  Name: Maria Reynoso
  Date: 11/19/2026
  CSC 372-01

  Express router mapping Triviabook endpoints to controller functions.
*/

const express = require('express');
const router = express.Router();
const triviaController = require('../controllers/trivia-controller');

router.get('/topics', triviaController.fetchTopics);
router.get('/topic/:topic', triviaController.fetchQuestionsByTopic);
router.get('/random', triviaController.fetchRandomQuestion);
router.post('/answer', triviaController.checkAnswer);
router.post('/question/add', triviaController.createQuestion);

module.exports = router;