import express from "express";
import { getFavorites, getUserBookings, updateFavorite } from "../controllers/userController.js";
import { protectUser } from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.get('/bookings', protectUser, getUserBookings)      // ← added
userRouter.post('/update-favorite', protectUser, updateFavorite) // ← added
userRouter.get('/favorites', protectUser, getFavorites)        // ← added

export default userRouter;