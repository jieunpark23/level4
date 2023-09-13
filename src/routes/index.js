// export { default as postsRouter } from './posts.js';
// export { default as commentsRouter } from './comments.js';

import express from 'express'; 
import Likes from './likes.js';
import Users from './users.js';
import Posts from './posts.js';
import Comments from './comments.js';
import Login from './login.js';

const router = express.Router();

router.use('/', [Users, Login]);
router.use('/posts', [Likes, Posts, Comments]);

export default router;