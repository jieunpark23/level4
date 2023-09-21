import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router(); // express.Router()를 이용해 라우터를 생성합니다.

/**
💡 **게시글 생성 API 의 비즈니스 로직
1. `title`, `content`, `password`를 **body**로 전달받는다.
2. `title`, `content`, `password`를 이용해 **Posts** 테이블에 데이터를 삽입 한다.
3. 생성된 게시글을 반환한다. */

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;  // 사용자 정보를 가져옵니다.
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(412)
        .send({ message: '요청한 데이터 형식이 올바르지 않습니다.' });
    }

    /** 질문 형식이 일치하지 않습니다. -> 어떤 의도로 접근해야하는지 형식이라는 부분을 잘 모르겠습니다. */
    if (typeof title !== 'string') {
      return res.status(412).send({ message: '게시글 제목의 형식이 일치하지 않습니다.' });
    }

    if (typeof content !== 'string') {
      return res.status(412).send({ message: '게시글 내용의 형식이 일치하지 않습니다.' });
    }

    const post = await prisma.posts.create({
      data: { 
        UserId: userId, 
        title, 
        content 
      },
    });

    return res.status(201).json({ message: '게시글 작성에 성공하였습니다.' });
  } catch {
    return res
      .status(400)
      .json({ message: '게시글 작성에 실패하였습니다.' });
  }
});

/** 게시글 목록 조회 API */
router.get('/', async (req, res, next) => {
  try{
  // 요구사항 중 게시글 내용이 포함되지 않도록 구현해야 한다.
  const posts = await prisma.posts.findMany({
    select: {
      postId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      User:{
        select: {
          userId: true,
          nickname: true,
        },
      },
      _count:{
        select: {
          Likes: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // 작성 날짜 기준으로 내림차순 정렬
    },
  });

  return res.status(200).json({ posts: posts });
  } catch {
    return res
      .status(400)
      .json({ message: '게시글 조회에 실패하였습니다.' });
  }
});


/** 게시글 상세 조회 API */
router.get('/:postId', async (req, res, next) => {
  try{
  const { postId } = req.params;
  console.log(postId);
  const posts = await prisma.posts.findFirst({
    where: { postId: +postId },
    select: {
      postId: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      User:{
        select: {
          userId: true,
          nickname: true,
        },
      },
      _count: {
        select: {
          Likes: true,
        },
      },
    },
  });

  return res.status(200).json({ post: posts });
  } catch {
    return res
      .status(400)
      .json({ message: '게시글 조회에 실패하였습니다.' });
  }
});

/** 게시글 수정 API */
// API를 호출할 때 입력된 비밀번호를 비교하여 동일할 때만 글이 수정되게 하기
// 1. **Path Parameters**로 어떤 게시글을 수정할 지 `postId`를 전달받습니다.
// 2. 변경할 `title`, `content`와 권한 검증을 위한 `password`를 **body**로 전달받습니다.
// 3. `postId`를 기준으로 게시글을 검색하고, 게시글이 존재하는지 확인합니다.
// 4. 게시글이 조회되었다면 해당하는 게시글의 `password`가 일치하는지 확인합니다.
// 5. 모든 조건을 통과하였다면 **게시글을 수정**합니다.

router.put('/:postId', authMiddleware, async (req, res, next) => {
  try{
  const { userId } = req.user;
  // 1. **Path Parameters**로 어떤 게시글을 수정할 지 `postId`를 전달받습니다.
  const { postId } = req.params;
  // 2. 변경할 `title`, `content`와 권한 검증을 위한 `password`를 **body**로 전달받습니다.
  const { title, content } = req.body;

  if (!title || !content) {
    return res
      .status(412)
      .send({ message: '데이터 형식이 올바르지 않습니다.' });
  }

  if (typeof title !== 'string') {
    return res.status(412).send({ message: '게시글 제목의 형식이 일치하지 않습니다.' });
  }

  if (typeof content !== 'string') {
    return res.status(412).send({ message: '게시글 내용의 형식이 일치하지 않습니다.' });
  }

  
  // 3. `postId`를 기준으로 게시글을 검색하고, 게시글이 존재하는지 확인합니다.
  const post = await prisma.posts.findUnique({
    where: { postId: +postId },
  });

  if (!post) {
    return res.status(404).json({ message: '게시글 조회에 실패하였습니다.' });
  }

  if ( post.UserId !== userId) {  
    return res.status(403).json({ message: '게시글 수정의 권한이 존재하지 않습니다.' });
  }

  // 4.모든 조건을 통과하였다면 **게시글을 수정**합니다.
  await prisma.posts.update({
    data: { title, content },
    where: {
      postId: +postId,
    },
  });

  return res.status(200).json({ data: '게시글을 수정하였습니다.' });
  } catch (error){
    console.log(error);
    return res
      .status(400)
      .json({ message: '게시글 수정에 실패하였습니다.' });
  }
});

/** 게시글 삭제 API */
// 1. **Path Parameters**로 어떤 게시글을 수정할 지 `postId`를 전달받습니다.
// 2. 권한 검증을 위한 `password`를 **body**로 전달받습니다.
// 3. `postId`를 기준으로 게시글을 검색하고, 게시글이 존재하는지 확인합니다.
// 4. 게시글이 조회되었다면 해당하는 게시글의 `password`가 일치하는지 확인합니다.
// 5. 모든 조건을 통과하였다면 **게시글을 삭제**합니다.

router.delete('/:postId', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;
    // 3. `postId`를 기준으로 게시글을 검색하고, 게시글이 존재하는지 확인합니다.
    const post = await prisma.posts.findUnique({
      where: { postId: +postId },
    });

    if (!post) {
      return res
        .status(404)
        .json({ errorMessage: '게시글이 존재하지 않습니다.' });
    }
    if (userId !== post.UserId) {
      return res
        .status(403)
        .json({ errorMessage: '게시글의 삭제 권한이 존재하지 않습니다.' });
    } // 이거 어떻게 인섬니아에서 확인하나요??

    await prisma.posts.delete({
      where: {
        postId: +postId,
      },
    });
    return res.status(200).json({ data: '게시글 삭제가 완료되었습니다.' });
  } catch {
    return res
      .status(400)
      .json({ message: '게시글 삭제에 실패하였습니다.' });
  }
});

export default router;
