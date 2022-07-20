import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { addNewUser, findUserByUserId, generateUserId } from '../fakeData/users.js';

const createToken = id => jwt.sign({ id: +id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.ACCESS_EXPIRE });

const setTokenInCookie = (res, accessToken) => {
  res.cookie('accessToken', accessToken, {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true
  });
};

export const auth = (req, res) => {
  const { accessToken } = req.cookies;

  jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (error, decoded) => {
    if (error) {
      res.json(null);
    } else {
      res.status(201).json(decoded.id);
    }
  });
};

export const checkId = (req, res) => {
  try {
    const { checkingId } = req.body;
    const foundedUser = findUserByUserId(checkingId);

    if (foundedUser) res.status(403).json({ message: '이미 존재하는 아이디 입니다.' });
    else res.status(201).json({ message: '사용 가능한 아이디 입니다.' });
  } catch (error) {
    console.error(error);
  }
};

export const signUp = (req, res) => {
  try {
    const { userId, password, nickName } = req.body;
    const { path: profile } = req.file;
    const id = generateUserId();
    const hashedPassword = bcrypt.hashSync(password, 10);
    addNewUser({ id, userId, password: hashedPassword, nickName, profile });

    const accessToken = createToken(id);
    setTokenInCookie(res, accessToken);

    res.status(201).json({ message: '회원가입 성공' });
  } catch (error) {
    console.error(error);
  }
};

export const signIn = (req, res) => {
  try {
    const { userId, password } = req.body;
    const findUser = findUserByUserId(userId);
    if (!findUser) return res.status(401).json({ message: '사용자 정보가 일치하지 않습니다.' });

    const isValidPassword = bcrypt.compareSync(password, findUser.password);
    if (!isValidPassword) return res.status(401).json({ message: '사용자 정보가 일치하지 않습니다.' });

    const accessToken = createToken(findUser.id);
    setTokenInCookie(res, accessToken);

    res.status(201).json({ message: '로그인 성공' });
  } catch (error) {
    console.error(error);
  }
};

export function logout(req, res) {
  try {
    res.clearCookie('accessToken');
    res.status(200).json({ message: '로그아웃 성공' });
  } catch (error) {
    console.error(error);
  }
}
