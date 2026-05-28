import express from 'express';
import { createBooking, getOccupiedSeats } from '../controllers/bookingController.js';
import { pesapalIPN, verifyPayment } from '../controllers/pesapalWebhooks.js';
import { protectUser } from '../middleware/auth.js';

const bookingRouter = express.Router();

bookingRouter.post('/create', protectUser, createBooking); // ← added protectUser
bookingRouter.get('/seats/:showId', getOccupiedSeats);
bookingRouter.post('/ipn', pesapalIPN);
bookingRouter.get('/verify/:orderTrackingId', verifyPayment);

export default bookingRouter;