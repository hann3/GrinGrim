import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRouter from './router/authRouter.js';

dotenv.config();

const app = express();
const port = 8000;

const corsOption = {
  origin: '*', // 접근 권한을 부여하는 도메인
  optionsSuccessStatus: 200, // 응답 상태 200으로 설정
  credentials: true // 응답 헤더에 Access-Control-Allow-Credentials 추가
};

app.use(express.static('public'));
app.use(cors(corsOption));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/auth', authRouter);

app.listen(port, () => {
  console.log('hi2');
});
