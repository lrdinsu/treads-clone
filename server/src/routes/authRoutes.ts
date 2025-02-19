import express, { Router } from 'express';

import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  signupUser,
} from '../controllers/authController.js';

export const authRouter: Router = express.Router();

//auth
authRouter.post('/signup', signupUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.get('/refresh-token', refreshAccessToken);
