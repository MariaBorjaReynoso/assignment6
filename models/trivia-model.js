/*
  Name: Maria Reynoso
  Date: 11/19/2026
  CSC 372-01

  Database model for Triviabook which handles all SQL queries for topics and questions.
*/

const pool = require('./db');

/**
 * Retrieves all trivia topics ordered alphabetically.
 * @return {Promise<Array<Object>>} List of topic objects
 */
async function getAllTopics() {
  let result = await pool.query('SELECT id, name FROM topics ORDER BY name ASC;');
  return result.rows;
}

/**
 * Finds a single topic by name.
 * @param {string} topicName - The name of the topic
 * @return {Promise<Object|undefined>} Topic record if found
 */
async function getTopicByName(topicName) {
  let result = await pool.query(
    'SELECT id, name FROM topics WHERE LOWER(name) = LOWER($1);',
    [topicName]
  );
  return result.rows[0];
}

/**
 * Retrieves questions for a specific topic with optional difficulty filter and limit.
 * @param {string} topicName - Name of the topic
 * @param {string|null} difficulty - Optional difficulty filter (easy, medium, hard)
 * @param {number|null} limit - Optional max number of questions to return
 * @return {Promise<Array<Object>>} List of matching questions
 */
async function getQuestionsByTopic(topicName, difficulty, limit) {
  let params = [topicName];
  let query = `
    SELECT q.id, t.name AS topic, q.question, q.answer, q.difficulty
    FROM questions q
    JOIN topics t ON q.topic_id = t.id
    WHERE LOWER(t.name) = LOWER($1)
  `;

  if (difficulty) {
    params.push(difficulty.toLowerCase());
    query += ` AND q.difficulty = $${params.length}`;
  }

  query += ' ORDER BY q.id ASC';

  if (limit) {
    params.push(limit);
    query += ` LIMIT $${params.length}`;
  }

  query += ';';
  let result = await pool.query(query, params);
  return result.rows;
}

/**
 * Retrieves one random question from the database without exposing the answer.
 * @return {Promise<Object|undefined>} Random question object (without answer)
 */
async function getRandomQuestion() {
  let query = `
    SELECT q.id, t.name AS topic, q.question, q.difficulty
    FROM questions q
    JOIN topics t ON q.topic_id = t.id
    ORDER BY RANDOM()
    LIMIT 1;
  `;
  let result = await pool.query(query);
  return result.rows[0];
}

/**
 * Retrieves a single question by ID (including its answer for verification).
 * @param {number} id - Question ID
 * @return {Promise<Object|undefined>} Question object
 */
async function getQuestionById(id) {
  let result = await pool.query(
    'SELECT id, question, answer, difficulty FROM questions WHERE id = $1;',
    [id]
  );
  return result.rows[0];
}

/**
 * Adds a new question to the database, creating the topic first if it does not exist.
 * @param {string} topicName - Topic name
 * @param {string} question - Question text
 * @param {string} answer - Answer text
 * @param {string} difficulty - Difficulty level (easy, medium, hard)
 * @return {Promise<Array<Object>>} Updated list of questions for that topic
 */
async function addQuestion(topicName, question, answer, difficulty) {
  let cleanTopic = topicName.trim().toLowerCase();
  let topic = await getTopicByName(cleanTopic);

  if (!topic) {
    let insertTopic = await pool.query(
      'INSERT INTO topics (name) VALUES ($1) RETURNING id, name;',
      [cleanTopic]
    );
    topic = insertTopic.rows[0];
  }

  await pool.query(
    'INSERT INTO questions (topic_id, question, answer, difficulty) VALUES ($1, $2, $3, $4);',
    [topic.id, question.trim(), answer.trim(), difficulty.toLowerCase()]
  );

  return await getQuestionsByTopic(cleanTopic, null, null);
}

module.exports = {
  getAllTopics,
  getTopicByName,
  getQuestionsByTopic,
  getRandomQuestion,
  getQuestionById,
  addQuestion
};