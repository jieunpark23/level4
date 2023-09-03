
import express from 'express';
import { postsRouter} from './routes/index.js'; 
import { commentsRouter} from './routes/index.js'; 

const app = express();
const PORT = 3017;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  return res.json({message: "우당탕탕 삼뿅알 화이팅!!><"})
})

app.use("/api/posts", postsRouter)
app.use("/api/posts", commentsRouter)

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
