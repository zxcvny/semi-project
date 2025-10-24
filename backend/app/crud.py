import os
from sqlalchemy.orm import Session, joinedload
from schemas import user_schema, category_schema, product_schema
from models import user_model, category_model, product_model
from typing import List
import utils

# ----- 회원 관련 ------
def create_user(db: Session, user: user_schema.UserCreate):
    """새로운 사용자 생성"""
    new_user = user_model.User(
        email=user.email,
        hashed_password=utils.hash_password(user.password),
        nickname=user.nickname,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

def get_user_by_email(db: Session, email: str):
    """이메일로 사용자 조회"""
    return db.query(user_model.User).filter(user_model.User.email == email).first()

def get_user_by_nickname(db: Session, nickname: str):
    """닉네임으로 사용자 조회"""
    return db.query(user_model.User).filter(user_model.User.nickname == nickname).first()

def update_user(db: Session, db_user: user_model.User, user_update: user_schema.UserUpdate):
    """회원 정보 수정 (닉네임, 비밀번호)"""
    update_data = user_update.model_dump(exclude_unset=True)
    
    if "nickname" in update_data:
        db_user.nickname = update_data["nickname"]
    
    if "password" in update_data:
        db_user.hashed_password = utils.hash_password(update_data["password"])
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# ----- 카테고리 관련 ------
def create_category(db: Session, category: category_schema.CategoryCreate):
    """새로운 카테고리 생성"""
    new_category = category_model.Category(
        name=category.name,
        icon_name=category.icon_name
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)

    return new_category

def get_category(db: Session, category_id: int):
    """ID로 카테고리 조회"""
    return db.query(category_model.Category).filter(category_model.Category.category_id == category_id).first()

def get_category_by_name(db: Session, name: str):
    """이름으로 카테고리 조회"""
    return db.query(category_model.Category).filter(category_model.Category.name == name).first()

def get_all_categories(db: Session):
    """모든 카테고리 목록 조회"""
    return db.query(category_model.Category).order_by(category_model.Category.category_id).all()

# ----- 상품 관련 -----
def create_product(db: Session, product: product_schema.ProductCreate, seller_id: int):
    """새상품 등록 (이미지 포함)"""

    new_product = product_model.Product(
        title=product.title,
        content=product.content,
        price=product.price,
        trade_city=product.trade_city,
        trade_district=product.trade_district,
        product_tag=product.product_tag.name,
        category_id=product.category_id,
        seller_id=seller_id
    )
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    new_images = []
    for img in product.images:
        new_img = product_model.ProductImage(
            image_url=img.image_url,
            is_representative=img.is_representative,
            product_id=new_product.product_id
        )
        new_images.append(new_img)

    db.add_all(new_images)
    db.commit()
    db.refresh(new_product)

    return new_product

def get_product(db: Session, product_id: int):
    """ID로 상품 조회"""
    return db.query(product_model.Product)\
        .options(
            joinedload(product_model.Product.seller),
            joinedload(product_model.Product.category),
            joinedload(product_model.Product.images)
        )\
        .filter(product_model.Product.product_id == product_id)\
        .first()

def get_all_product(db: Session, skip: int = 0, limit: int = 16):
    """상품 전체 조회"""
    return db.query(product_model.Product)\
        .options(
            joinedload(product_model.Product.seller),
            joinedload(product_model.Product.category),
            joinedload(product_model.Product.images)
        )\
        .order_by(product_model.Product.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_products_by_category(db: Session, category_id: int, skip: int = 0, limit: int = 16):
    """카테고리별 상품 목록 조회"""
    return db.query(product_model.Product)\
        .options(
            joinedload(product_model.Product.seller),
            joinedload(product_model.Product.category),
            joinedload(product_model.Product.images)
        )\
        .filter(product_model.Product.category_id == category_id)\
        .order_by(product_model.Product.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_products_by_category_name(db: Session, category_name: str, skip: int = 0, limit: int = 16):
    """카테고리 이름으로 상품 목록 조회"""
    category = get_category_by_name(db, name=category_name)
    if not category:
        return []

    return db.query(product_model.Product)\
        .options(
            joinedload(product_model.Product.seller),
            joinedload(product_model.Product.category),
            joinedload(product_model.Product.images)
        )\
        .filter(product_model.Product.category_id == category.category_id)\
        .order_by(product_model.Product.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_products_by_user(db: Session, user_id: int):
    """특정 사용자가 등록한 모든 상품 목록 조회"""
    return db.query(product_model.Product)\
        .options(
            joinedload(product_model.Product.seller),
            joinedload(product_model.Product.category),
            joinedload(product_model.Product.images)
        )\
        .filter(product_model.Product.seller_id == user_id)\
        .order_by(product_model.Product.created_at.desc())\
        .all()

def update_product(
    db: Session,
    db_product: product_model.Product,
    product_update: product_schema.ProductUpdate,
    images_to_delete: List[product_model.ProductImage] = [] # 삭제할 이미지 객체 목록 받기
):
    """상품 정보 수정 (이미지 처리 포함)"""
    update_data = product_update.model_dump(exclude_unset=True)

    # 1. 이미지 외 필드 업데이트
    for key, value in update_data.items():
        if key != "images":
            # Enum 값 처리 추가
            if key == "product_tag" and isinstance(value, str):
                setattr(db_product, key, product_model.ProductTagEnum(value))
            elif key == "product_status" and isinstance(value, str):
                setattr(db_product, key, product_model.ProductStatusEnum(value))
            else:
                setattr(db_product, key, value)

    # 2. 이미지 처리
    if "images" in update_data:
        new_images_data = update_data["images"] # ProductImageCreate 스키마 리스트

        # 2-1. 기존 이미지 레코드 삭제 (DB에서만)
        # 실제 파일 삭제는 images_to_delete 리스트를 기반으로 아래에서 처리
        db.query(product_model.ProductImage).filter(
            product_model.ProductImage.product_id == db_product.product_id
        ).delete(synchronize_session=False)

        # 2-2. 새로운 이미지 레코드 추가 (DB에만)
        new_db_images = []
        for img_data in new_images_data:
            if isinstance(img_data, dict):
                new_db_img = product_model.ProductImage(
                    image_url=img_data['image_url'],
                    is_representative=img_data['is_representative'],
                    product_id=db_product.product_id
                )
                new_db_images.append(new_db_img)
            else:
                # 예상치 못한 타입이 들어온 경우 로그 또는 오류 처리
                print(f"Warning: Unexpected item type in new_images_data: {type(img_data)}")
        if new_db_images:
             db.add_all(new_db_images)

    # 3. 삭제 대상 이미지 파일 시스템에서 삭제
    for img_to_delete in images_to_delete:
        # image_url에서 실제 파일 경로 생성 (URL 형식에 따라 조정 필요)
        # 예시: image_url이 "/static/product_images/uuid.jpg" 형태라고 가정
        if img_to_delete.image_url.startswith('/static/'):
             # 프로젝트 루트 기준 상대 경로로 변경 (../ 제거)
             relative_path = img_to_delete.image_url[len('/static/'):]
             # ../static/ 구조에 맞게 실제 파일 경로 구성
             file_path = os.path.join("..", "static", relative_path)
             # 절대 경로로 변환 (선택 사항, 경로 설정에 따라 다름)
             # file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", relative_path))
             print(f"Attempting to delete image file: {file_path}")
             if os.path.exists(file_path):
                 try:
                     os.remove(file_path)
                     print(f"Deleted image file: {file_path}")
                 except OSError as e:
                     print(f"Error deleting file {file_path}: {e}")
             else:
                 print(f"Image file not found, skipping deletion: {file_path}")
        else:
            print(f"Skipping deletion for image URL format: {img_to_delete.image_url}")


    db.add(db_product) # 상품 정보 변경사항 추가
    try:
        db.commit() # 모든 변경사항 (상품 정보, 이미지 레코드) 커밋
        db.refresh(db_product) # 업데이트된 상품 정보 로드
        db.refresh(db_product, attribute_names=['images', 'seller', 'category'])
    except Exception as e:
        db.rollback() # 오류 발생 시 롤백
        print(f"Error during product update commit: {e}")
        # 적절한 예외 처리 또는 재 raise
        raise e

    return db_product

def delete_product(db: Session, db_product: product_model.Product):
    """상품 삭제 (이미지 파일 포함)"""
    # 1. 연결된 이미지 파일 삭제
    for image in db_product.images:
        # 이미지 URL을 파일 시스템 경로로 변환 (update_product과 동일 로직)
        if image.image_url.startswith('/static/'):
             relative_path = image.image_url[len('/static/'):]
             file_path = os.path.join("..", "static", relative_path)
             print(f"Attempting to delete image file associated with product {db_product.product_id}: {file_path}")
             if os.path.exists(file_path):
                 try:
                     os.remove(file_path)
                     print(f"Deleted image file: {file_path}")
                 except OSError as e:
                     print(f"Error deleting file {file_path}: {e}")
             else:
                 print(f"Image file not found, skipping deletion: {file_path}")
        else:
             print(f"Skipping deletion for image URL format: {image.image_url}")

    # 2. 연결된 좋아요(찜) 레코드 삭제 (선택 사항, DB 제약 조건에 따라 자동 삭제될 수도 있음)
    db.query(product_model.ProductLike).filter(product_model.ProductLike.product_id == db_product.product_id).delete(synchronize_session=False)

    # 3. 상품 레코드 삭제 (DB에서 cascade 설정 시 이미지 레코드도 자동 삭제될 수 있음)
    db.delete(db_product)

    try:
        db.commit() # 변경사항 커밋
    except Exception as e:
        db.rollback()
        print(f"Error during product delete commit: {e}")
        raise e

# ----- 찜 관련 -----
def get_like(db: Session, user_id: int, product_id: int):
    """특정 찜 정보 가져오기"""
    return db.query(product_model.ProductLike).filter(
        product_model.ProductLike.user_id == user_id,
        product_model.ProductLike.product_id == product_id
    ).first()

def create_like(db: Session, user_id: int, product_id: int):
    """상품 찜하기"""
    db_product = get_product(db, product_id)
    if not db_product:
        return None

    db_like = product_model.ProductLike(user_id=user_id, product_id=product_id)
    db.add(db_like)
    
    # 상품의 likes 카운트 1 증가
    db_product.likes += 1
    db.add(db_product)
    
    db.commit()
    db.refresh(db_like)
    return db_like

def delete_like(db: Session, db_like: product_model.ProductLike):
    """상품 찜 취소하기"""
    db_product = get_product(db, db_like.product_id)
    
    db.delete(db_like)
    
    # 상품의 likes 카운트 1 감소 (0보다 작아지지 않도록)
    if db_product and db_product.likes > 0:
        db_product.likes -= 1
        db.add(db_product)
        
    db.commit()

def get_liked_products_by_user(db: Session, user_id: int):
    """사용자가 찜한 모든 상품 목록 조회"""
    return db.query(product_model.Product).join(product_model.ProductLike).filter(
        product_model.ProductLike.user_id == user_id
    ).all()

# ----- 검색 관련 -----
def search_products_by_title(db: Session, query: str, skip: int = 0, limit: int = 16):
    """상품 제목으로 검색"""
    search_query = f"%{query}%"
    return db.query(product_model.Product)\
        .options(
            joinedload(product_model.Product.seller),
            joinedload(product_model.Product.category),
            joinedload(product_model.Product.images)
        )\
        .filter(product_model.Product.title.ilike(search_query))\
        .order_by(product_model.Product.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()