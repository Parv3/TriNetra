const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const proctorRoutes = require('./routes/proctor');
const adminRoutes = require('./routes/admin');
const { sessions } = require('./routes/proctor');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'app://.'],
    methods: ['GET', 'POST'],
  },
});

// Make io accessible to route handlers
app.set('io', io);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'app://.'],
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/proctor', proctorRoutes);
app.use('/api/admin', adminRoutes);

// Compatibility aliases for frontend
app.get('/api/exams', (req, res) => {
  res.json([
    {
      id: 'dsa_core_01',
      title: 'Data Structures and Algorithms',
      description: 'Fundamental DSA concepts including trees, graphs, sorting, and complexity analysis.',
      duration_minutes: 30,
      total_questions: 5,
    },
  ]);
});

app.post('/api/sessions', (req, res, next) => {
  req.url = '/session';
  proctorRoutes(req, res, next);
});

app.post('/api/sessions/:sessionId/start', (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);
  if (session) session.status = 'active';
  res.json({ success: true, status: 'active', sessionId });
});

app.post('/api/sessions/:sessionId/events', (req, res, next) => {
  req.body = {
    sessionId: req.params.sessionId,
    events: [
      {
        type: req.body?.event_type || 'activity',
        severity: req.body?.severity || 'medium',
        confidence: req.body?.confidence || 0.95,
        details: req.body?.metadata || {},
        timestamp: Date.now(),
      },
    ],
  };
  req.url = '/activity';
  proctorRoutes(req, res, next);
});

app.post('/api/sessions/:sessionId/submit', (req, res, next) => {
  req.body = { sessionId: req.params.sessionId };
  req.url = '/report';
  proctorRoutes(req, res, next);
});

app.get('/api/sessions/:sessionId', (req, res, next) => {
  req.url = '/session/' + req.params.sessionId;
  proctorRoutes(req, res, next);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'running',
    uptime: process.uptime(),
    activeSessions: sessions.size,
  });
});

// --- Socket.IO ---

// Track connected sockets per session
const activeSockets = new Map();

io.on('connection', (socket) => {
  console.log(`[socket] Connected: ${socket.id}`);

  // Student joins a proctoring session
  socket.on('proctor:join', ({ sessionId, studentName }) => {
    socket.join(sessionId);
    activeSockets.set(socket.id, sessionId);

    // Update or create session entry
    const session = sessions.get(sessionId);
    if (session) {
      session.socketId = socket.id;
      session.lastHeartbeat = Date.now();
    }

    console.log(`[socket] Student "${studentName || 'unknown'}" joined session ${sessionId}`);

    // Notify admin room
    io.to('admin').emit('proctor:student-joined', {
      sessionId,
      studentName: studentName || 'Anonymous',
      timestamp: Date.now(),
    });
  });

  // Student reports a violation
  socket.on('proctor:violation', (data) => {
    const { sessionId, type, details } = data;

    const session = sessions.get(sessionId);
    if (session) {
      session.violations.push({
        type,
        details: details || null,
        timestamp: Date.now(),
      });

      // Increment risk score based on violation type
      const riskWeights = {
        'tab-switch': 15,
        'window-blur': 10,
        'face-not-detected': 10,
        'multiple-faces': 20,
        'gaze-away': 5,
        'copy-paste': 15,
        'right-click': 5,
        'dev-tools': 25,
      };

      session.riskScore = Math.min(
        100,
        session.riskScore + (riskWeights[type] || 5)
      );
    }

    console.log(`[socket] Violation in ${sessionId}: ${type}`);

    // Broadcast to admin room
    io.to('admin').emit('proctor:violation', {
      sessionId,
      type,
      details,
      riskScore: session ? session.riskScore : 0,
      timestamp: Date.now(),
    });
  });

  // Student heartbeat with status data
  socket.on('proctor:heartbeat', (data) => {
    const { sessionId, faceDetected, gazeStatus, riskScore } = data;

    const session = sessions.get(sessionId);
    if (session) {
      session.lastHeartbeat = Date.now();
      if (faceDetected !== undefined) session.faceDetected = faceDetected;
      if (gazeStatus) session.gazeStatus = gazeStatus;
      if (riskScore !== undefined) session.riskScore = Math.max(session.riskScore, riskScore);
    }

    // Forward to admin room
    io.to('admin').emit('proctor:heartbeat', {
      sessionId,
      faceDetected,
      gazeStatus,
      riskScore: session ? session.riskScore : 0,
      lastHeartbeat: Date.now(),
    });
  });

  // Admin joins the admin monitoring room
  socket.on('admin:join', () => {
    socket.join('admin');
    console.log(`[socket] Admin joined monitoring room (${socket.id})`);

    // Send current state of all sessions
    const allSessions = [];
    sessions.forEach((session, sessionId) => {
      allSessions.push({ sessionId, ...session });
    });

    socket.emit('admin:sessions-snapshot', allSessions);
  });

  // Admin sends warning to a specific student
  socket.on('admin:warn', ({ sessionId, message }) => {
    const session = sessions.get(sessionId);
    if (!session) return;

    const warning = {
      type: 'warning',
      message: message || 'You have been warned by the proctor. Please focus on your test.',
      timestamp: Date.now(),
    };

    session.violations.push(warning);

    io.to(sessionId).emit('admin:warn', warning);
    console.log(`[socket] Admin warned session ${sessionId}`);
  });

  // Admin disqualifies a student
  socket.on('admin:disqualify', ({ sessionId, reason }) => {
    const session = sessions.get(sessionId);
    if (!session) return;

    session.status = 'disqualified';

    const disqualification = {
      type: 'disqualification',
      reason: reason || 'You have been disqualified due to repeated violations.',
      timestamp: Date.now(),
    };

    session.violations.push(disqualification);

    io.to(sessionId).emit('admin:disqualify', disqualification);

    // Notify all admins
    io.to('admin').emit('proctor:student-disqualified', {
      sessionId,
      reason: disqualification.reason,
      timestamp: Date.now(),
    });

    console.log(`[socket] Admin disqualified session ${sessionId}`);
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    const sessionId = activeSockets.get(socket.id);

    if (sessionId) {
      const session = sessions.get(sessionId);
      if (session && session.status !== 'disqualified') {
        session.status = 'disconnected';
      }

      activeSockets.delete(socket.id);

      io.to('admin').emit('proctor:student-disconnected', {
        sessionId,
        timestamp: Date.now(),
      });

      console.log(`[socket] Student disconnected from session ${sessionId}`);
    } else {
      console.log(`[socket] Disconnected: ${socket.id}`);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`\n  Dhristi server running on http://localhost:${PORT}\n`);
});

module.exports = { app, server, io };
