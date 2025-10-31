const express = require('express');
const authController = require('../controllers/authController');
const Poll = require('../models/Poll');

const router = express.Router();
router.use(authController.verifyToken);

router.post('/', async (req, res) => {
  try {
    const { roomId, question, options } = req.body;
    if (!roomId || !question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'roomId, question and 2+ options required' });
    }
    const poll = await Poll.create({ room: roomId, question, options: options.map(t => ({ text: t, votes: [] })), createdBy: req.userId });
    res.status(201).json({ poll });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:roomId', async (req, res) => {
  try {
    const polls = await Poll.find({ room: req.params.roomId }).sort({ createdAt: -1 });
    res.json({ polls });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:pollId/vote', async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });
    // Remove previous votes
    poll.options.forEach(o => {
      o.votes = o.votes.filter(v => v.toString() !== req.userId);
    });
    poll.options[optionIndex]?.votes.push(req.userId);
    await poll.save();
    res.json({ poll });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;




