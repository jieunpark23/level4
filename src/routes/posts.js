import express from 'express';
import authMiddleware from '../middlewares/auth.js';
// import { prisma } from '../../prisma/index.js'; // 이거는 어떻게 해야할지 잘 모르겠음
// import { PostsController } from '../controllers/posts.js';
import PostsRepository from '../repositories/posts.js';
import PostsService from '../services/posts.js';
import PostsController from '../controllers/posts.js';  

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다. 

const postsRepository = new PostsRepository();
const postsService = new PostsService(postsRepository);
const postsController = new PostsController(postsService);

/**게시글 생성 API*/
router.post('/', authMiddleware, postsController.createPost)

/**게시글 조회 API */
router.get('/', postsController.getPosts) // postsController라는 인스턴스를 통해 getPosts 메서드를 호출합니다.

/**게시글 상세조회 API */
router.get('/:postId', postsController.getPostById)

/**게시글 수정 API */
router.post('/:postId', authMiddleware, postsController.updatePost)

/**게시글 삭제 API */
router.delete('/:postId', authMiddleware, postsController.deletePost)

export default router; // 생성한 라우터를 모듈로서 내보냅니다.
