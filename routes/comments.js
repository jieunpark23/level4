/**
 * 파일명 변경: comments.router.js -> comments.js
 *
 * Express 프레임워크에서는 라우터 파일의 이름에 굳이 'router'라는 접미어를 붙일 필요가 없음.
 * 이는 Express 프레임워크가 폴더 구조를 통해 라우터와 다른 모듈을 자연스럽게 구분하기 때문임.
 * 예를 들어, 'routes' 폴더 내에 위치한 'comments.js' 파일은 라우터로써의 역할을 명확히 하므로,
 * 'router'라는 접미어 없이도 충분히 의미가 전달됨.
 *
 * 해당 네이밍 규칙은 프로젝트의 일관성을 높이며, 불필요한 정보를 줄여서 코드의 가독성을 향상시킴.
 */

/**
 * 댓글 라우터 모듈
 *
 * 이 모듈은 댓글 기능과 관련된 라우트를 처리합니다. 댓글 생성, 읽기, 업데이트, 삭제 API를 제공합니다.
 *
 * @module commentsRouter
 */

import express from 'express';
import { prisma } from '../utils/prisma/index.js';

// express.Router()를 이용해 라우터를 생성합니다.
const router = express.Router(); 

const handleError = (res, error) => {
    console.error(error);
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
};

/**
 * 댓글 생성 - POST '/'
 *
 * 이 비동기 함수는 새로운 댓글을 생성하기 위한 API 호출을 처리합니다.
 * 요청 본문에서 `user`, `password`, `content` 필드를 읽습니다.
 * `postId`는 요청 매개변수에서 읽어 해당 댓글이 어느 게시글에 속하는지를 확인합니다.
 * 데이터베이스를 쿼리해 해당 게시글이 존재하는지 확인합니다. 게시글이 존재한다면, 그 게시글에 연결된 새 댓글을 생성합니다.
 * 마지막으로 상태 코드 201을 가진 응답을 반환합니다.
 *
 * @async
 * @function
 * @param {object} req - 사용자 입력을 담고 있는 익스프레스 요청 객체
 * @param {object} res - 클라이언트에게 결과를 반환하기 위한 익스프레스 응답 객체
 * @param {function} next - 익스프레스 파이프라인 내의 next 미들웨어 함수
 */
router.post('/:postId/comments', async(req, res, next) => {
    try{
    const { user, password, content } = req.body;
    const { postId } = req.params;

    const post = await prisma.posts.findUnique({ where: { postId: Number(postId) } });
    if (!post) return res.status(404).json({message: "존재하지 않는 포스트입니다."});

    await prisma.comments.create({ data : { user, password, content, postId: post.postId } });
    res.status(201).json({ message: "댓글을 생성하였습니다."});
    } catch(error) {
        handleError(res, error);
    }
});

/**
 * 댓글 목록 조회 - GET '/'
 *
 * 이 비동기 함수는 특정 게시글에 대한 모든 댓글을 나열하기 위한 API 호출을 처리합니다.
 * 요청 매개변수에서 `postId`를 읽습니다. 그 다음 데이터베이스를 쿼리해 주어진 게시글에 연결된 모든 댓글을 가져옵니다.
 * 작성일자를 기준으로 내림차순으로 정렬합니다. 마지막으로 댓글 목록을 담은 응답을 반환합니다.
 *
 * @async
 * @function
 * @param {object} req - 사용자 입력을 담고 있는 익스프레스 요청 객체
 * @param {object} res - 클라이언트에게 결과를 반환하기 위한 익스프레스 응답 객체
 * @param {function} next - 익스프레스 파이프라인 내의 next 미들웨어 함수
 */
router.get('/:postId/comments', async(req, res, next) => {
    try {
        const {postId} = req.params;
        const comments = await prisma.comments.findMany({
            where: { postId : Number(postId)},
            select: { postId: false },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ data: comments });
    } catch (error) {
        handleError(res, error);
    }
});

/**
 * 댓글 수정 - PUT '/:commentId'
 *
 * 이 비동기 함수는 기존 댓글을 업데이트하기 위한 API 호출을 처리합니다.
 * URL 매개변수에서 `commentId`를 읽고, 요청 본문에서 `password`와 `content`를 읽습니다.
 * 먼저 댓글이 존재하는지 그리고 비밀번호가 일치하는지 확인합니다. 
 * 모든 조건이 충족되면 댓글의 내용을 업데이트하고 200 상태 코드를 반환합니다.
 *
 * @async
 * @function
 * @param {object} req - 사용자 입력을 담고 있는 익스프레스 요청 객체
 * @param {object} res - 클라이언트에게 결과를 반환하기 위한 익스프레스 응답 객체
 * @param {function} next - 익스프레스 파이프라인 내의 next 미들웨어 함수
 */
router.put('/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const { postId, commentId } = req.params;
        const { password, content } = req.body;

        if (!content) return res.status(400).json({ message : "댓글 내용을 입력해주세요." });
        if(!postId || !commentId) return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
        
        const post = await prisma.posts.findUnique({ where: { postId: +postId } });
        if(!post) return res.status(404).json({ message : "게시글이 존재하지 않습니다." });

        const comment = await prisma.comments.findUnique({ where: { commentId: Number(commentId) } });
        if(!comment)return res.status(404).json({ message : "댓글이 존재하지 않습니다." });

        if(post.password !== password) return res.status(401).json({ message: "비밀번호가 일치하지 않습니다."})
        
        await prisma.comments.update({ data: { content }, where: { commentId: Number(commentId) } });
        res.status(200).json({data : "댓글을 수정하였습니다."});
    } catch(error) {
        handleError(res, error);
    }
});

/**
 * 댓글 삭제 - DELETE '/:commentId'
 *
 * 이 비동기 함수는 댓글을 삭제하기 위한 API 호출을 처리합니다.
 * URL 매개변수에서 `commentId`를 읽고, 요청 본문에서 `password`를 읽습니다.
 * 데이터베이스를 쿼리해 댓글이 존재하는지 그리고 비밀번호가 일치하는지 확인합니다.
 * 모든 조건이 충족되면 데이터베이스에서 댓글을 삭제하고 200 상태 코드를 반환합니다.
 *
 * @async
 * @function
 * @param {object} req - 사용자 입력을 담고 있는 익스프레스 요청 객체
 * @param {object} res - 클라이언트에게 결과를 반환하기 위한 익스프레스 응답 객체
 * @param {function} next - 익스프레스 파이프라인 내의 next 미들웨어 함수
 */
router.delete('/:postId/comments/:commentId', async (req, res, next) => {

    try {
        const { commentId } = req.params;
        const { password } = req.body;
        
        const comment = await prisma.comments.findUnique({ where: { commentId: Number(commentId) } });
    
        if(!comment)return res.status(404).json({ message : "댓글 조회에 실패하였습니다." });

        if(comment.password !== password) return res.status(401).json({ message: "비밀번호가 일치하지 않습니다."})
    
        await prisma.comments.delete({where : { commentId: Number(commentId) }});
        res.status(200).json({ data : "댓글 삭제가 완료되었습니다." });
    } catch (error) {
        handleError(res, error)
    }
});
    

export default router