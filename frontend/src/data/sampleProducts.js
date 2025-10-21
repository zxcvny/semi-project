// 샘플 이미지 URL입니다. 실제로는 S3 같은 곳에 업로드된 이미지 주소가 들어갑니다.
const sampleImages = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2598&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ab?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2671&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&h=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=600&h=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&h=600&auto=format&fit=crop",
];

export const sampleProducts = [
  {
    "product_id": 1,
    "title": "아이폰 14 Pro 256GB 실버 판매합니다",
    "price": 950000,
    "location": "서울 강남구",
    "wishlist_count": 24,
    "created_at": new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2분 전
    "image_url": sampleImages[0]
  },
  {
    "product_id": 2,
    "title": "맥북 프로 16인치 M2 Pro 512GB",
    "price": 2800000,
    "location": "서울 마포구",
    "wishlist_count": 48,
    "created_at": new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15분 전
    "image_url": sampleImages[3]
  },
  {
    "product_id": 3,
    "title": "소니 A7M4 풀프레임 미러리스 카메라",
    "price": 2200000,
    "location": "부산 해운대구",
    "wishlist_count": 31,
    "created_at": new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30분 전
    "image_url": "https://images.unsplash.com/photo-1510127034890-ba27e8348bae?q=80&w=2592&auto=format&fit=crop"
  },
  {
    "product_id": 4,
    "title": "북유럽 스타일 원목 의자 2개 세트",
    "price": 120000,
    "location": "인천 남동구",
    "wishlist_count": 15,
    "created_at": new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1시간 전
    "image_url": "https://images.unsplash.com/photo-1519947486511-46149fa0a254?q=80&w=2574&auto=format&fit=crop"
  },
  {
    "product_id": 5,
    "title": "깨끗한 게이밍 헤드셋 판매합니다",
    "price": 85000,
    "location": "경기 성남시",
    "wishlist_count": 9,
    "created_at": new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3시간 전
    "image_url": sampleImages[1]
  },
  {
    "product_id": 6,
    "title": "나이키 에어포스 1 '07 (270mm)",
    "price": 110000,
    "location": "대구 중구",
    "wishlist_count": 22,
    "created_at": new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1일 전
    "image_url": sampleImages[2]
  },
  {
    "product_id": 1,
    "title": "아이폰 14 Pro 256GB 실버",
    "content": "상태 아주 좋습니다...",
    "price": 950000,
    "location": "서울 강남구",
    "tag": "중고",
    "status": "판매중",
    "view_count": 120,
    "wishlist_count": 24, // 인기순 정렬 기준
    "created_at": new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    "seller": { "user_id": 101, "nickname": "강남멋쟁이" }, // 판매자 정보
    "category": { "category_id": 1, "name": "디지털기기" }, // 카테고리 정보
    "images": [
        { "image_id": 101, "image_url": sampleImages[0], "image_order": 0 },
        { "image_id": 102, "image_url": sampleImages[1], "image_order": 1 }
    ]
  },
  {
    "product_id": 2,
    "title": "맥북 프로 16인치 M2 Pro",
    // ... (content, price, etc.)
    "wishlist_count": 48,
    "created_at": new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    "seller": { "user_id": 102, "nickname": "애플매니아" },
    "category": { "category_id": 2, "name": "컴퓨터" },
    "images": [ { "image_id": 103, "image_url": sampleImages[2], "image_order": 0 } ]
  },
   { // 판매자 101의 다른 상품 추가
    "product_id": 3,
    "title": "로지텍 MX Master 3S",
    "content": "사무용 마우스 끝판왕...",
    "price": 100000,
    "location": "서울 강남구",
    "tag": "중고",
    "status": "판매중",
    "view_count": 80,
    "wishlist_count": 15,
    "created_at": new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    "seller": { "user_id": 101, "nickname": "강남멋쟁이" }, // 같은 판매자
    "category": { "category_id": 2, "name": "컴퓨터" }, // 다른 카테고리
    "images": [ { "image_id": 104, "image_url": sampleImages[1], "image_order": 0 } ]
  },
   { // 같은 카테고리(디지털기기)의 인기 상품 추가
    "product_id": 4,
    "title": "갤럭시 S23 Ultra 512GB",
    "content": "미개봉 새상품입니다...",
    "price": 1200000,
    "location": "경기 수원시",
    "tag": "미개봉",
    "status": "판매중",
    "view_count": 250,
    "wishlist_count": 55, // 높은 wishlist_count
    "created_at": new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    "seller": { "user_id": 103, "nickname": "삼성팬보이" }, // 다른 판매자
    "category": { "category_id": 1, "name": "디지털기기" }, // 같은 카테고리
    "images": [ { "image_id": 105, "image_url": sampleImages[0], "image_order": 0 } ]
  },
];

