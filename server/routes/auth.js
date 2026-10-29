const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory token store
const tokens = new Map();

// POST /api/auth/send-otp
router.post('/send-otp', (req, res) => {
  const { phone } = req.body;

  if (!phone || typeof phone !== 'string' || phone.length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid phone number.',
    });
  }

  const verificationId = crypto.randomUUID();

  console.log(`[auth] OTP sent to ${phone} (verification: ${verificationId})`);

  return res.json({
    success: true,
    verificationId,
    message: 'OTP sent successfully.',
  });
});

// POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => {
  const { verificationId, code } = req.body;

  if (!verificationId) {
    return res.status(400).json({
      success: false,
      message: 'Missing verification ID.',
    });
  }

  if (!code || typeof code !== 'string' || code.length !== 4) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid 4-digit code.',
    });
  }

  // Mock: accept any 4-digit code
  const token = crypto.randomUUID();
  tokens.set(token, {
    verificationId,
    createdAt: Date.now(),
  });

  console.log(`[auth] OTP verified for ${verificationId}`);

  return res.json({
    success: true,
    token,
    message: 'Verified successfully.',
  });
});

// POST /api/auth/verify-face
router.post('/verify-face', (req, res) => {
  const { referenceImage, capturedImage } = req.body;

  if (!referenceImage || !capturedImage) {
    return res.status(400).json({
      success: false,
      message: 'Both reference and captured images are required.',
    });
  }

  console.log('[auth] Face verification completed');

  // Mock: always returns a match
  return res.json({
    match: true,
    confidence: 0.95,
    message: 'Face match confirmed.',
  });
});

module.exports = router;
