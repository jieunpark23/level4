import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();

/** 사용자 로그인 API  - 비즈니스 로직
1. `nickname`, `password`를 **body**로 전달받습니다.
2. 전달 받은 `nickname`에 해당하는 사용자가 있는지 확인합니다.
3. 전달 받은 `password`와 데이터베이스의 저장된 `password`를 bcrypt를 이용해 검증합니다.
4. 로그인에 성공한다면, 사용자에게 JWT를 발급합니다.
*/
router.post('/login', async (req, res, next) => {
    const { nickname, password } = req.body;
    const user = await prisma.users.findFirst({
        where: { nickname},
    })
    // 사용자가 있는지 확인합니다.
    if(!user){
        return res.status(412).json({ message: '닉네임을 확인해주세요.'});
    }
    // bcrypt를 이용해 패스워드를 검증합니다.
    if(!(await bcrypt.compare(password, user.password))){
        return res.status(412).json({ message: '비밀번호를 확인해주세요.'});
    }

    //로그인에 성공하면, 사용자의 userId를 바탕으로 JWT 토큰을 발급합니다.
    const token = jwt.sign(
        {
        userId: user.userId,
        },
        process.env.SECRET_KEY, // 비밀키를 입력합니다. ( 나중에 dotenv를 이용해서 외부에서 코드를 보더라도 알 수 없게 구현해야 합니다. 예: process.env.JWT_SECRET)
        { expiresIn: '1h' }
    );
    
    // console.log(token);

    // authorization 쿠키에 Bearer 토큰 형식으로 JWT를 저장합니다.
    res.cookie('Authorization', `Bearer ${token}`);     // 우리가 전달할 쿠키는 authorization이라는 이름으로, Bearer 토큰 형식으로 JWT를 저장합니다.
    return res.status(200).json({ token : `${token}`});
});


export default router;