// 샘플 이미지 URL입니다. 실제로는 S3 같은 곳에 업로드된 이미지 주소가 들어갑니다.
const sampleImages = [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2598&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ab?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2671&auto=format&fit=crop"
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
  }
];