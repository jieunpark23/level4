import express from 'express';
import cookieParser from 'cookie-parser';
import LogMiddleware from './middlewares/log.js';
import ErrorHandlingMiddleware from './middlewares/error-handling.js';
import routes from './routes/index.js';

const app = express();
const PORT = 3017;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  return res.json({ message: '우당탕탕 삼뿅알 화이팅!!><' });
});

app.use(LogMiddleware);
app.use(cookieParser()); // cookie를 req.cookies에 객체 형태로 담아주는 미들웨어

app.use('/api', routes);
app.use(ErrorHandlingMiddleware); // 에러처리 미들웨어는 라우터 뒤에 위치해야 합니다. 클라이언트 요청이 실패하였을 때, 맨 마지막에 실행되기 때문에 맨 마지막에 작성합니다. 

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
