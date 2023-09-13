import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// 게시글 좋아요 조회 API
router.get('/like', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    const posts = await prisma.posts.findMany({
      //Likes 테이블에서 로그인한 유저가 좋아요를 누른 게시글을 찾습니다.
      where: {
        Likes: {
          some: {
            UserId: Number(userId),
          },
        },
      },
      select: {
        postId: true,
        UserId: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        User: {
          select: {
            nickname: true,
          },
        },
        // Prisma에서는 특정 필드의 개수를 조회할 수 있습니다.
        _count: {
          select: {
            Likes: true,
          },
        },
      },
      orderBy: [
        {
          // 관계 집계 값을 기준으로 정렬. 좋아요 개수가 많은 순으로 정렬
          Likes: {
            _count: 'desc',
          },
        },
        // 좋아요 개수가 동일할 경우 최신순으로 정렬
        {
          createdAt: 'desc',
        },
      ],
    });

    return res.status(200).json({ data: posts });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ message: '좋아요 게시글 조회에 실패하였습니다.' });
  }
});

// 게시글 좋아요 등록, 취소 API
router.put('/:postId/like', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { postId } = req.params;

    const post = await prisma.posts.findUnique({
      where: {
        postId: Number(postId),
      },
    });
    if (!post) {
      return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });
    }

    let isLike = await prisma.likes.findFirst({
      where: {
        PostId: Number(postId),
        UserId: Number(userId),
      },
    });

    // 로그인한 유저가 해당 게시글에 좋아요를 눌렀는지 확인합니다.
    if (!isLike) {
      await prisma.likes.create({
        data: {
          PostId: Number(postId),
          UserId: Number(userId),
        },
      });

      return res
        .status(200)
        .json({ message: '게시글의 좋아요를 등록하였습니다.' });
    } else {
      await prisma.likes.delete({
        // 좋아요를 누른 게시글의 좋아요 아이디를 찾아서 삭제합니다.
        where: { likeId: Number(isLike.likeId) },
      });

      return res
        .status(200)
        .json({ message: '게시글의 좋아요를 취소하였습니다.' });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: '게시글 좋아요에 실패하였습니다.' });
  }
});

export default router;
