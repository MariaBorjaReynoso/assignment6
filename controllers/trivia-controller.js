/*
  Name: Maria Reynoso
  Date: 11/19/2026
  CSC 372-01

  Controller logic for Triviabook API endpoints. Validates inputs and handles HTTP responses.
*/

const triviaModel = require('../models/trivia-model');

let VALID_DIFFICULTIES = ['easy', 'medium', 'hard'];

/**
 * GET /triviabook/topics
 * Responds with a list of all topics in the database.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @return {Promise<void>}
 */
async function fetchTopics(req, res) {
  try {
    let topics = await triviaModel.getAllTopics();
    res.json({ topics: topics.map(t => t.name) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve topics.' });
  }
}

/**
 * GET /triviabook/topic/:topic
 * Responds with questions for a given topic, supporting optional difficulty and limit query params.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @return {Promise<void>}
 */
async function fetchQuestionsByTopic(req, res) {
  try {
    let topicParam = req.params.topic;
    let { difficulty, limit } = req.query;

    let topicExists = await triviaModel.getTopicByName(topicParam);
    if (!topicExists) {
      return res.status(404).json({ error: `Topic '${topicParam}' not found.` });
    }

    if (difficulty && !VALID_DIFFICULTIES.includes(difficulty.toLowerCase())) {
      return res.status(400).json({
        error: "Invalid difficulty. Must be 'easy', 'medium', or 'hard'."
      });
    }

    let parsedLimit = null;
    if (limit !== undefined) {
      parsedLimit = parseInt(limit, 10);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return res.status(400).json({ error: 'Limit must be a positive integer.' });
      }
    }

    let questions = await triviaModel.getQuestionsByTopic(
      topicParam,
      difficulty || null,
      parsedLimit
    );
    res.json({ topic: topicExists.name, questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve questions for topic.' });
  }
}

/**
 * GET /triviabook/random
 * Responds with one random question without the answer.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @return {Promise<void>}
 */
async function fetchRandomQuestion(req, res) {
  try {
    let question = await triviaModel.getRandomQuestion();
    if (!question) {
      return res.status(404).json({ error: 'No questions available in the database.' });
    }
    res.json(question);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve a random question.' });
  }
}

/**
 * POST /triviabook/answer
 * Checks a user's guess against the stored answer (case-insensitive, trimmed).
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @return {Promise<void>}
 */
async function checkAnswer(req, res) {
  try {
    let { id, guess } = req.body;

    if (id === undefined || guess === undefined || String(guess).trim() === '') {
      return res.status(400).json({ error: 'Both id and guess are required.' });
    }

    let questionRecord = await triviaModel.getQuestionById(id);
    if (!questionRecord) {
      return res.status(404).json({ error: `Question with id ${id} does not exist.` });
    }

    let isCorrect =
      String(guess).trim().toLowerCase() === questionRecord.answer.trim().toLowerCase();

    res.json({
      id: questionRecord.id,
      correct: isCorrect,
      correctAnswer: questionRecord.answer
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify answer.' });
  }
}

/**
 * POST /triviabook/question/add
 * Adds a new question (and creates topic if new), returning updated topic questions.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @return {Promise<void>}
 */
async function createQuestion(req, res) {
  try {
    let { topic, question, answer, difficulty } = req.body;

    if (!topic || !question || !answer || !difficulty) {
      return res.status(400).json({
        error: 'All four attributes (topic, question, answer, difficulty) are required.'
      });
    }

    if (!VALID_DIFFICULTIES.includes(String(difficulty).toLowerCase())) {
      return res.status(400).json({
        error: "Invalid difficulty. Must be 'easy', 'medium', or 'hard'."
      });
    }

    let updatedQuestions = await triviaModel.addQuestion(
      topic,
      question,
      answer,
      difficulty
    );

    res.status(201).json({
      topic: topic.trim().toLowerCase(),
      questions: updatedQuestions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add question.' });
  }
}

module.exports = {
  fetchTopics,
  fetchQuestionsByTopic,
  fetchRandomQuestion,
  checkAnswer,
  createQuestion
};