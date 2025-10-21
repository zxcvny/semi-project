import { useState, useEffect } from 'react';
import ProductItem from '../../features/products/components/ProductItem'; // ProductItem 경로 확인
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import '../../styles/MyInfoSections.css'; // 통합된 CSS import

// 목 데이터 (10개)
const mockWishlistData = [
  { product_id: 101, title: "찜한 상품 A (카메라)", price: 150000, location: "서울 서초구", wishlist_count: 5, created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), image_url: "https://images.unsplash.com/photo-1510127034890-ba27e8348bae?q=80&w=250&h=250&auto=format&fit=crop" },
  { product_id: 102, title: "찜한 상품 B (헤드폰)", price: 75000, location: "경기 부천시", wishlist_count: 12, created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=250&h=250&auto=format&fit=crop" },
  { product_id: 103, title: "찜한 상품 C (신발)", price: 110000, location: "인천 연수구", wishlist_count: 8, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ab?q=80&w=250&h=250&auto=format&fit=crop" },
  { product_id: 104, title: "찜한 상품 D (시계)", price: 220000, location: "서울 강남구", wishlist_count: 20, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=250&h=250&auto=format&fit=crop" },
  { product_id: 105, title: "찜한 상품 E (노트북)", price: 850000, location: "부산 해운대구", wishlist_count: 15, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=250&h=250&auto=format&fit=crop" },
  { product_id: 106, title: "찜한 상품 F (선글라스)", price: 45000, location: "대구 중구", wishlist_count: 3, created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), image_url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=250&h=250&auto=format&fit=crop" },
  { product_id: 107, title: "찜한 상품 G (의자)", price: 120000, location: "서울 마포구", wishlist_count: 9, created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), image_url: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?q=80&w=250&h=250&auto=format&fit=crop" },
  { product_id: 108, title: "찜한 상품 H (키보드)", price: 65000, location: "경기 수원시", wishlist_count: 11, created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), image_url: "https://images.unsplash.com/photo-1587829741301-dc7ec0645c5c?q=80&w=250&h=250&auto=format&fit=crop" },
  { product_id: 109, title: "찜한 상품 I (백팩)", price: 98000, location: "서울 용산구", wishlist_count: 7, created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), image_url: "https://images.unsplash.com/photo-1553062407-98eeb6877a85?q=80&w=250&h=250&auto=format&fit=crop" },
  { product_id: 110, title: "찜한 상품 J (스마트폰)", price: 720000, location: "경기 고양시", wishlist_count: 25, created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), image_url: "https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=250&h=250&auto=format&fit=crop" }
];

const ITEMS_PER_SLIDE = 4; // 캐러셀에 한 번에 보여줄 아이템 개수

const WishlistSection = () => {
  // --- State 정의 ---
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0); // 슬라이드 인덱스

  // --- 데이터 로드 ---
  useEffect(() => {
    setLoading(true);
    // 목 데이터 사용 + 로딩 효과
    setTimeout(() => {
      setWishlistItems(mockWishlistData); // 목 데이터 사용
      setSlideIndex(0); // 인덱스 초기화
      setLoading(false);
    }, 500); // 0.5초 딜레이 (로딩 효과)
  }, []);

  // --- 이벤트 핸들러 ---
  const handlePrev = () => {
    setSlideIndex(prev => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    const lastPossibleIndex = Math.max(0, wishlistItems.length - ITEMS_PER_SLIDE);
    setSlideIndex(prev => Math.min(lastPossibleIndex, prev + 1));
  };

  // --- 로딩 중 표시 ---
  if (loading) {
    return (
      <div className="product-carousel-section"> {/* 공통 CSS 클래스 사용 */}
        <h3 className="section-title">찜 목록</h3>
        <p>찜 목록을 불러오는 중...</p>
      </div>
    );
  }

  // --- 메인 렌더링 ---
  return (
    <div className="product-carousel-section"> {/* 공통 CSS 클래스 사용 */}
      <h3 className="section-title">찜 목록</h3>

      {/* 캐러셀 컨테이너 (아이템이 있을 경우) */}
      {wishlistItems.length > 0 ? (
        <div className="carousel-container">
          {/* 이전 버튼 */}
          {wishlistItems.length > ITEMS_PER_SLIDE && slideIndex > 0 && (
            <button className="carousel-arrow prev" onClick={handlePrev}>
              <FaArrowLeft />
            </button>
          )}

          {/* 상품 그리드 래퍼 */}
          <div className="product-grid-wrapper">
             {/* 실제 슬라이드되는 그리드 */}
             <div
               className="product-grid"
               style={{ transform: `translateX(-${slideIndex * (100 / ITEMS_PER_SLIDE)}%)` }}
             >
              {wishlistItems.map(item => (
                // key 값 앞에 'wishlist-' 접두사 추가
                <ProductItem key={`wishlist-${item.product_id}`} product={item} />
              ))}
             </div>
          </div>

          {/* 다음 버튼 */}
          {wishlistItems.length > ITEMS_PER_SLIDE && slideIndex < wishlistItems.length - ITEMS_PER_SLIDE && (
            <button className="carousel-arrow next" onClick={handleNext}>
              <FaArrowRight />
            </button>
          )}
        </div>
      ) : (
        // 아이템 없을 때 메시지
        <p className="empty-message">찜한 상품이 없습니다.</p>
      )}
    </div>
  );
};

export default WishlistSection;