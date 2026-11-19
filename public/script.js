/*
  Name: Maria Reynoso
  Date: 11/19/2026
  CSC 372-01

  Client-side JavaScript for Triviabook. Connects the UI to the backend
  REST API using fetch() and builds DOM elements dynamically.
*/

let currentRandomId = null;

document.addEventListener('DOMContentLoaded', () => {
  loadTopics();
  document.getElementById('random-btn').addEventListener('click', fetchRandomTrivia);
  document.getElementById('guess-form').addEventListener('submit', handleGuessSubmit);
  document.getElementById('filter-btn').addEventListener('click', loadQuestionsByTopic);
  document.getElementById('add-question-form').addEventListener('submit', handleAddQuestion);
});

/**
 * Fetches all available trivia topics and populates the topic dropdown.
 * @return {Promise<void>}
 */
async function loadTopics() {
  try {
    let response = await fetch('/triviabook/topics');
    if (!response.ok) {
      throw new Error('Could not load topics.');
    }
    let data = await response.json();
    let select = document.getElementById('topic-select');
    select.replaceChildren();

    for (let topic of data.topics) {
      let option = document.createElement('option');
      option.value = topic;
      option.textContent = topic.charAt(0).toUpperCase() + topic.slice(1);
      select.appendChild(option);
    }

    if (data.topics.length > 0) {
      loadQuestionsByTopic();
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Fetches and renders questions for the selected topic, difficulty, and limit.
 * @return {Promise<void>}
 */
async function loadQuestionsByTopic() {
  let topic = document.getElementById('topic-select').value;
  let difficulty = document.getElementById('difficulty-select').value;
  let limit = document.getElementById('limit-input').value;

  if (!topic) {
    return;
  }

  let params = new URLSearchParams();
  if (difficulty) {
    params.append('difficulty', difficulty);
  }
  if (limit) {
    params.append('limit', limit);
  }

  let url = `/triviabook/topic/${encodeURIComponent(topic)}`;
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  try {
    let response = await fetch(url);
    let data = await response.json();
    let container = document.getElementById('questions-container');
    container.replaceChildren();

    if (!response.ok) {
      let errMsg = document.createElement('p');
      errMsg.className = 'incorrect';
      errMsg.textContent = data.error || 'Error loading questions.';
      container.appendChild(errMsg);
      return;
    }

    if (data.questions.length === 0) {
      let emptyMsg = document.createElement('p');
      emptyMsg.textContent = 'No questions found matching those filters.';
      container.appendChild(emptyMsg);
      return;
    }

    for (let item of data.questions) {
      let card = document.createElement('div');
      card.className = 'question-item';

      let badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = `${item.topic} • ${item.difficulty}`;

      let qText = document.createElement('p');
      qText.className = 'question-text';
      qText.textContent = `Q: ${item.question}`;

      let aText = document.createElement('p');
      aText.textContent = `Answer: ${item.answer}`;

      card.appendChild(badge);
      card.appendChild(qText);
      card.appendChild(aText);
      container.appendChild(card);
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Fetches a single random question from the API and displays it for guessing.
 * @return {Promise<void>}
 */
async function fetchRandomTrivia() {
  try {
    let response = await fetch('/triviabook/random');
    let data = await response.json();
    if (!response.ok) {
      return;
    }

    currentRandomId = data.id;
    document.getElementById('random-meta').textContent = `${data.topic} • ${data.difficulty}`;
    document.getElementById('random-question-text').textContent = data.question;
    document.getElementById('guess-input').value = '';
    document.getElementById('guess-feedback').textContent = '';
    document.getElementById('random-question-box').classList.remove('hidden');
  } catch (err) {
    console.error(err);
  }
}

/**
 * Submits the user's guess for the current random question and displays feedback.
 * @param {Event} event - Form submit event
 * @return {Promise<void>}
 */
async function handleGuessSubmit(event) {
  event.preventDefault();
  let guess = document.getElementById('guess-input').value;
  let feedback = document.getElementById('guess-feedback');

  if (!currentRandomId) {
    return;
  }

  try {
    let response = await fetch('/triviabook/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: currentRandomId, guess })
    });
    let data = await response.json();

    if (!response.ok) {
      feedback.className = 'incorrect';
      feedback.textContent = data.error || 'Could not verify answer.';
      return;
    }

    if (data.correct) {
      feedback.className = 'correct';
      feedback.textContent = `Correct! The answer is ${data.correctAnswer}.`;
    } else {
      feedback.className = 'incorrect';
      feedback.textContent = `Incorrect. The correct answer was ${data.correctAnswer}.`;
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * Submits a new trivia question to the API and refreshes the topic list.
 * @param {Event} event - Form submit event
 * @return {Promise<void>}
 */
async function handleAddQuestion(event) {
  event.preventDefault();
  let topic = document.getElementById('new-topic').value;
  let question = document.getElementById('new-question').value;
  let answer = document.getElementById('new-answer').value;
  let difficulty = document.getElementById('new-difficulty').value;
  let feedback = document.getElementById('add-feedback');

  try {
    let response = await fetch('/triviabook/question/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, question, answer, difficulty })
    });
    let data = await response.json();

    if (!response.ok) {
      feedback.className = 'incorrect';
      feedback.textContent = data.error || 'Failed to add question.';
      return;
    }

    feedback.className = 'correct';
    feedback.textContent = `Question added to '${data.topic}'!`;
    document.getElementById('add-question-form').reset();
    await loadTopics();
  } catch (err) {
    console.error(err);
  }
}