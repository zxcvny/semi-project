from sqlalchemy.orm import Session, joinedload
from schemas import user_schema, category_schema, product_schema
from models import user_model, category_model, product_model
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
        product_tag=product.product_tag,
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
        .order_by(product_model.Product.create_at.desc())\
        .all()

def update_product(
    db: Session,
    db_product: product_model.Product,
    product_update: product_schema.ProductUpdate
):
    """상품 정보 수정"""
    # ProductUpdate 스키마의 데이터를 dict로 변환 (None값 제외)
    update_data = product_update.model_dump(exclude_unset=True)

    if "images" in update_data:
        new_images_data = update_data.pop("images")

        for old_img in db_product.images:
            db.delete(old_img)

        new_images = []
        for img_data in new_images_data:
            new_img = product_model.ProductImage(
                image_url=img_data["image_url"],
                is_representative=img_data["is_representative"],
                product_id=db_product.product_id
            )
            new_images.append(new_img)

        db.add_all(new_images)
    
    for key, value in update_data.items():
        setattr(db_product, key, value)

    db.add(db_product)
    db.commit()
    db.refresh(db_product)

    return db_product

def delete_product(db: Session, db_product: product_model.Product):
    """상품 삭제"""
    db.delete(db_product)
    db.commit()

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