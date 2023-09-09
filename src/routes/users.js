import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';

const router = express.Router();

/** 사용자 회원 가입 API
 * 1. `nickname`,`password`를 **body**로 전달받는다.
 * 2. 동일한 `nickname`이 존재하는지 확인한다.
 * 3. 존재하지 않는다면, Users 테이블에 `nickname`,`password`를 이용해 사용자를 생성한다.
 */

router.post('/signup', async (req, res, next) => {
  try {
    const { nickname, password, confirm } = req.body;

    // 닉네임 형식 검사 (예: 길이, 특수 문자 등에 따라 변경 가능) - 비어있으면 안되기 때문에
    if (!nickname || !password || !confirm) {
      return res
        .status(400)
        .send({ message: '요청한 데이터 형식이 올바르지 않습니다.' });
    }

    // 닉네임 구성 조건 - 최소 3자 이상, 알파벳 대소문자(a~z, A~Z), 숫자(0~9)로 구성하기
    const nicknameRegex = /^[a-zA-Z0-9]{3,}$/;
    if (!nicknameRegex.test(nickname)) {
      return res
        .status(412)
        .json({ message: '닉네임의 형식이 일치하지 않습니다.' });
    }

    // 비밀번호 구성 조건 - 최소 4자 이상이며, 닉네임과 같은 값이 포함된 경우 회원가입에 !실패!로 만들기
    if (password.length < 4 || password.includes(nickname)) {
      return res
        .status(412)
        .json({ message: '패스워드 형식이 일치하지 않습니다.' });
    }

    // 비밀번호와 비밀번호 확인이 일치하는지 검사
    if (password !== confirm) {
      return res.status(412).json({ message: '패스워드가 일치하지 않습니다.' });
    }

    // // 패스워드에 닉네임이 포함되어 있는지 검사
    // if (password.includes(nickname)) {
    //   return res
    //     .status(412)
    //     .json({ message: '패스워드에 닉네임이 포함되어 있습니다.' });
    // }

    // 닉네임 중복 검사
    const isExistUser = await prisma.users.findUnique({
      where: { nickname },
    });
    if (isExistUser) {
      return res.status(409).json({ message: '중복된 닉네임입니다.' });
    }

    // bcrypt를 이용해 패스워드를 암호화합니다.
    const hashedPassword = await bcrypt.hash(password, 10);

    // User 테이블에 사용자를 생성합니다.
    const user = await prisma.users.create({
      data: {
        nickname,
        password: hashedPassword,   // 암호화된 패스워드를 저장합니다.
      },
    });

    return res.status(201).json({ message: '회원가입에 성공하였습니다.' });
  } catch (err) {
    next(err);
  }
});

export default router;
