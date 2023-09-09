import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js'; // prisma client * 설명: prisma는 다양한 데이터베이스 시스템과 호환되며 MySQL, PostgreSQL, SQL Server 등을 지원합니다. ORM 기능을 제공하며 데이터베이스 레코드를 자바스크립트 객체로 매핑하고, 객체 지향적으로 데이터베이스 작업을 수행할 수 있도록 합니다. 이를 통해 복잡한 SQL 쿼리를 작성하지 않고도 데이터베이스를 쉽고 빠르게 다룰 수 있습니다.

/**사용자 인증 미들웨어 비즈니스 로직**
1. 클라이언트로 부터 **쿠키(Cookie)**를 전달받습니다.
2. **쿠키(Cookie)**가 **Bearer 토큰** 형식인지 확인합니다.
3. 서버에서 발급한 **JWT가 맞는지 검증**합니다.
4. JWT의 `userId`를 이용해 사용자를 조회합니다.
5. `req.user` 에 조회된 사용자 정보를 할당합니다.
6. 다음 미들웨어를 실행합니다.*/
export default async function (req, res, next) {
  try {
    const { Authorization } = req.cookies; // 쿠키에서 Authorization을 가져옵니다.
    if (!Authorization) throw new Error('토큰이 존재하지 않습니다.'); // 토큰이 존재하지 않는다면 에러를 발생시킵니다.

    const [tokenType, token] = Authorization.split(' '); // Bearer 토큰 형식으로 저장된 토큰을 분리합니다.
    if (tokenType !== 'Bearer')
      throw new Error('토큰 타입이 일치하지 않습니다.');

    const decodedToken = jwt.verify(token, 'customized_secret_key'); // 토큰을 검증합니다.
    const userId = decodedToken.userId; // 토큰에 담긴 userId를 가져옵니다.
    
    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });
    if (!user) {
      res.clearCookie('Authorization'); // 사용자가 존재하지 않는다면, 쿠키를 제거합니다.
      throw new Error('토큰 사용자가 존재하지 않습니다.'); // 이 에러를 잡아서 catch 블록으로 이동합니다.
    }

    // 5. `req.user` 에 조회된 사용자 정보를 할당합니다.
    req.user = user;

    // 6. 다음 미들웨어를 실행합니다.
    next();
  } catch (error) {
    res.clearCookie('Authorization'); // 에러가 발생하면, 쿠키를 제거합니다.

    // switch 문을 써서 에러를 상세하게 분기할 수 있습니다.
    switch (error.message) {
      case 'TokenExpiredError':
        return res.status(401).json({ message: '토큰이 만료되었습니다.' });
        break;
      case 'JsonWebTokenError':
        return res.status(401).json({ message: '토큰이 조작되었습니다.' });
        break;
      default:
        return res
          .status(401)
          .json({ message: error.message ?? '비정상적인 요청입니다.' }); //?? 연산자는 왼쪽 피연산자가 "null 또는 undefined면 오른쪽 피연산자를 사용하고, 그렇지 않으면 왼쪽 피연산자를 사용한다
    }
  }
}
