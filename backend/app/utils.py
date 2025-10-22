# 비밀번호 해싱
from passlib.context import CryptContext

# bcrypt 알고리즘을 사용하도록 CryptContext 설정
# deprecated="auto": 안전하지 않은 알고리즘 사용 시 경고.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    """
    비밀번호를 bcrypt 알고리즘으로 해싱하는 함수.
    :param password: 사용자가 입력한 평문 비밀번호
    :return: bcrpyt로 해싱된 비밀번호 문자열
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    """
    입력된 평문 비밀번호와 해싱된 비밀번호를 비교하는 함수.
    :param plain_password: 사용자가 입력한 평문 비밀번호
    :param hashed_password: 데이터베이스에 저장된 해싱된 비밀번호
    :return: 두 비밀번호가 일치하면 True, 그렇지 않으면 False
    """
    return pwd_context.verify(plain_password, hashed_password)