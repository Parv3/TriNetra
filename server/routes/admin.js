const express = require('express');
const router = express.Router();
const { sessions, activityLogs } = require('./proctor');

// GET /api/admin/sessions - list all active sessions
router.get('/sessions', (req, res) => {
  const allSessions = [];

  sessions.forEach((session, sessionId) => {
    const logs = activityLogs.get(sessionId) || [];
    allSessions.push({
      sessionId,
      studentName: session.studentName,
      testId: session.testId,
      status: session.status,
      riskScore: session.riskScore,
      faceDetected: session.faceDetected,
      gazeStatus: session.gazeStatus,
      violationCount: session.violations.length,
      totalEvents: logs.length,
      createdAt: session.createdAt,
      lastHeartbeat: session.lastHeartbeat,
    });
  });

  // Sort by risk score descending so the riskiest students appear first
  allSessions.sort((a, b) => b.riskScore - a.riskScore);

  return res.json({
    success: true,
    count: allSessions.length,
    sessions: allSessions,
  });
});

// GET /api/admin/sessions/:sessionId/details - detailed session info
router.get('/sessions/:sessionId/details', (req, res) => {
  const { sessionId } = req.params;

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found.',
    });
  }

  const logs = activityLogs.get(sessionId) || [];

  return res.json({
    success: true,
    session,
    activityLog: logs,
    totalEvents: logs.length,
  });
});

// POST /api/admin/sessions/:sessionId/warn - warn a student
router.post('/sessions/:sessionId/warn', (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found.',
    });
  }

  const warning = {
    type: 'warning',
    message: message || 'You have been warned by the proctor. Please focus on your test.',
    timestamp: Date.now(),
  };

  session.violations.push(warning);

  // If Socket.IO is available, emit to the student
  const io = req.app.get('io');
  if (io) {
    io.to(sessionId).emit('admin:warn', warning);
  }

  console.log(`[admin] Warning sent to session ${sessionId}`);

  return res.json({
    success: true,
    message: 'Warning sent to student.',
  });
});

// POST /api/admin/sessions/:sessionId/disqualify - disqualify a student
router.post('/sessions/:sessionId/disqualify', (req, res) => {
  const { sessionId } = req.params;
  const { reason } = req.body;

  const session = sessions.get(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session not found.',
    });
  }

  session.status = 'disqualified';

  const disqualification = {
    type: 'disqualification',
    reason: reason || 'You have been disqualified due to repeated violations.',
    timestamp: Date.now(),
  };

  session.violations.push(disqualification);

  // If Socket.IO is available, emit to the student
  const io = req.app.get('io');
  if (io) {
    io.to(sessionId).emit('admin:disqualify', disqualification);
  }

  console.log(`[admin] Session ${sessionId} disqualified: ${disqualification.reason}`);

  return res.json({
    success: true,
    message: 'Student has been disqualified.',
  });
});

module.exports = router;
