import express from 'express';
import { signUp, signIn, checkId, logout, auth } from '../controller/authController.js';
import { userUpload } from '../middleware/fileUpload.js';

const userRouter = express.Router();

userRouter.get('/', auth);
userRouter.post('/signIn', signIn);
userRouter.post('/signUp', userUpload.single('profile'), signUp);
userRouter.post('/checkId', checkId);
userRouter.post('/logOut', logout);

export default userRouter;
