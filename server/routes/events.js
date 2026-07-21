const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getEvents);//get all events
router.get('/:id', getEventById);//get events by id
router.post('/', protect, admin, createEvent);//create events (admin only)
router.put('/:id', protect, admin, updateEvent);//update events (admin only)
router.delete('/:id', protect, admin, deleteEvent);//delete events (admin only)

module.exports = router;