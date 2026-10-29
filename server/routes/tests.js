const express = require('express');
const router = express.Router();
const questions = require('../data/questions');

// In-memory submission storage
const submissions = new Map();

// GET /api/tests/:testId
router.get('/:testId', (req, res) => {
  const { testId } = req.params;

  // Strip correct answers before sending to client
  const clientQuestions = questions.map(({ correctAnswer, ...rest }) => rest);

  const test = {
    id: testId,
    title: 'Data Structures and Algorithms',
    description: 'Test your understanding of fundamental DSA concepts including trees, graphs, sorting, and complexity analysis.',
    duration: 1800, // 30 minutes in seconds
    totalQuestions: questions.length,
    questions: clientQuestions,
  };

  console.log(`[tests] Serving test ${testId} (${questions.length} questions)`);

  return res.json(test);
});

// POST /api/tests/:testId/submit
router.post('/:testId/submit', (req, res) => {
  const { testId } = req.params;
  const { answers, sessionId, timeSpent } = req.body;

  if (!answers || !sessionId) {
    return res.status(400).json({
      success: false,
      message: 'Answers and session ID are required.',
    });
  }

  // Grade the submission
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  const detailed = questions.map((question) => {
    const studentAnswer = answers[question.id] || null;
    const isCorrect = studentAnswer === question.correctAnswer;

    if (!studentAnswer) {
      unanswered++;
    } else if (isCorrect) {
      correct++;
    } else {
      incorrect++;
    }

    return {
      questionId: question.id,
      studentAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
    };
  });

  const score = Math.round((correct / questions.length) * 100);

  const submission = {
    testId,
    sessionId,
    answers,
    timeSpent: timeSpent || 0,
    submittedAt: Date.now(),
    results: {
      score,
      correct,
      incorrect,
      unanswered,
      total: questions.length,
      detailed,
    },
  };

  // Store by sessionId for retrieval
  const key = `${testId}:${sessionId}`;
  submissions.set(key, submission);

  console.log(`[tests] Submission from ${sessionId}: ${correct}/${questions.length} (${score}%)`);

  return res.json({
    success: true,
    score,
    correct,
    incorrect,
    unanswered,
    total: questions.length,
    message: `You scored ${score}%. ${correct} out of ${questions.length} correct.`,
  });
});

// GET /api/tests/:testId/results/:sessionId
router.get('/:testId/results/:sessionId', (req, res) => {
  const { testId, sessionId } = req.params;
  const key = `${testId}:${sessionId}`;

  const submission = submissions.get(key);

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'No submission found for this session.',
    });
  }

  return res.json({
    success: true,
    ...submission.results,
    timeSpent: submission.timeSpent,
    submittedAt: submission.submittedAt,
  });
});

module.exports = router;
