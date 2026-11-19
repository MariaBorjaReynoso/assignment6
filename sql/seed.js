/*
  Name: Maria Reynoso
  Date: 11/19/2026
  CSC 372-01

  Creates the relational database tables and inserts the initial seed data for Triviabook.
*/

const pool = require('../models/db');

let topics = ['science', 'geography'];

let scienceQuestions = [
  { question: 'What planet is known as the Red Planet?', answer: 'Mars', difficulty: 'easy' },
  { question: 'What is the chemical symbol for gold?', answer: 'Au', difficulty: 'medium' },
  { question: 'What is the powerhouse of the cell?', answer: 'Mitochondria', difficulty: 'easy' }
];

let geographyQuestions = [
  { question: 'What is the capital of Australia?', answer: 'Canberra', difficulty: 'medium' },
  { question: 'Which river flows through Cairo?', answer: 'The Nile', difficulty: 'easy' }
];

/**
 * Drops existing tables, recreates schema, and seeds initial trivia data.
 * @return {Promise<void>}
 */
async function seedDatabase() {
  try {
    await pool.query('DROP TABLE IF EXISTS questions;');
    await pool.query('DROP TABLE IF EXISTS topics;');

    await pool.query(`
      CREATE TABLE topics (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE questions (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard'))
      );
    `);

    for (let topicName of topics) {
      let topicRes = await pool.query(
        'INSERT INTO topics (name) VALUES ($1) RETURNING id;',
        [topicName.toLowerCase()]
      );
      let topicId = topicRes.rows[0].id;

      let questionList = topicName === 'science' ? scienceQuestions : geographyQuestions;

      for (let item of questionList) {
        await pool.query(
          'INSERT INTO questions (topic_id, question, answer, difficulty) VALUES ($1, $2, $3, $4);',
          [topicId, item.question, item.answer, item.difficulty]
        );
      }
    }

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await pool.end();
  }
}

seedDatabase();