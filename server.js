/*
  Name: Maria Reynoso
  Date: 11/19/2026
  CSC 372-01

  Main entry point for the Triviabook Express server. Configures middleware,
  static frontend files, and API routes.
*/

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const triviaRoutes = require('./routes/trivia-routes');

let app = express();
let PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/triviabook', triviaRoutes);

app.listen(PORT, () => {
  console.log(`Triviabook server running on port ${PORT}`);
});