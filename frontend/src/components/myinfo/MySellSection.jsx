import { useState, useEffect } from 'react';
import ProductItem from '../../features/products/components/ProductItem'; // ProductItem 경로 확인
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
// import { sampleProducts } from '../../data/sampleProducts'; // sampleProducts import 제거
import '../../styles/MyInfoSections.css'; // 통합된 CSS import

/* ============================================= */
/* == 내부 목 데이터 정의 (판매 내역용, 10개) == */
/* ============================================= */
// 실제 API 대신 사용할 임시 판매 내역 데이터 (10개)
// sampleProducts.js를 참조하지 않고 여기에 직접 정의
const mockMySellData = [
  {
    product_id: 201, // 고유 ID 사용
    title: "내가 판매한 상품 1 (아이폰)",
    price: 950000,
    location: "서울 강남구",
    wishlist_count: 24,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1580910051074-3eb694886505?q=80&w=250&h=250&auto=format&fit=crop" // 스마트폰 이미지
  },
  {
    product_id: 202,
    title: "내가 판매한 상품 2 (헤드셋)",
    price: 85000,
    location: "경기 성남시",
    wishlist_count: 9,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=250&h=250&auto=format&fit=crop"
  },
   {
    product_id: 203,
    title: "내가 판매한 상품 3 (신발)",
    price: 110000,
    location: "인천 연수구",
    wishlist_count: 8,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1542291026-7eec264c27ab?q=80&w=250&h=250&auto=format&fit=crop"
  },
   {
    product_id: 204,
    title: "내가 판매한 상품 4 (카메라)",
    price: 2200000,
    location: "부산 해운대구",
    wishlist_count: 31,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1510127034890-ba27e8348bae?q=80&w=250&h=250&auto=format&fit=crop"
  },
   {
    product_id: 205,
    title: "내가 판매한 상품 5 (의자)",
    price: 120000,
    location: "인천 남동구",
    wishlist_count: 15,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1519947486511-46149fa0a254?q=80&w=250&h=250&auto=format&fit=crop"
  },
  {
    product_id: 206,
    title: "내가 판매한 상품 6 (선글라스)",
    price: 90000,
    location: "서울 종로구",
    wishlist_count: 18,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=250&h=250&auto=format&fit=crop"
   },
   {
     product_id: 207,
     title: "내가 판매한 상품 7 (키보드)",
     price: 75000,
     location: "경기 수원시",
     wishlist_count: 11,
     created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
     image_url: "https://images.unsplash.com/photo-1587829741301-dc7ec0645c5c?q=80&w=250&h=250&auto=format&fit=crop"
   },
    {
      product_id: 208,
      title: "내가 판매한 상품 8 (백팩)",
      price: 98000,
      location: "서울 용산구",
      wishlist_count: 7,
      created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      image_url: "https://images.unsplash.com/photo-1553062407-98eeb6877a85?q=80&w=250&h=250&auto=format&fit=crop"
    },
    {
      product_id: 209,
      title: "내가 판매한 상품 9 (시계)",
      price: 350000,
      location: "서울 중구",
      wishlist_count: 22,
      created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      image_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=250&h=250&auto=format&fit=crop"
    },
    {
      product_id: 210,
      title: "내가 판매한 상품 10 (노트북)",
      price: 1150000,
      location: "서울 마포구",
      wishlist_count: 40,
      created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      image_url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=250&h=250&auto=format&fit=crop"
    }
];

const ITEMS_PER_SLIDE = 4; // 캐러셀에 한 번에 보여줄 아이템 개수

/* ============================================= */
/* == MySellSection 컴포넌트 == */
/* ============================================= */
const MySellSection = () => {
  // --- State 정의 ---
  const [mySellItems, setMySellItems] = useState([]); // 판매 상품 목록 배열
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [slideIndex, setSlideIndex] = useState(0); // 현재 슬라이드 인덱스

  // --- 데이터 로드 (컴포넌트 마운트 시 한 번 실행) ---
  useEffect(() => {
    setLoading(true);
    // 실제 API 호출 대신 목 데이터 사용 + 로딩 효과
    setTimeout(() => {
      try {
        // 정의된 목 데이터 전체(10개)를 사용
        setMySellItems(mockMySellData); // state 업데이트
        setSlideIndex(0); // 인덱스 초기화
      } catch (error) {
        console.error("Error setting sell items:", error);
      } finally {
        setLoading(false); // 로딩 완료
      }
    }, 500); // 0.5초 딜레이 (로딩 효과)
  }, []); // 빈 배열: 마운트 시 한 번만 실행

  // --- 이벤트 핸들러 ---
  // 이전 버튼 클릭
  const handlePrev = () => {
    setSlideIndex(prev => Math.max(0, prev - 1));
  };
  // 다음 버튼 클릭
  const handleNext = () => {
    const lastPossibleIndex = Math.max(0, mySellItems.length - ITEMS_PER_SLIDE);
    setSlideIndex(prev => Math.min(lastPossibleIndex, prev + 1));
  };

  // --- 로딩 중 표시 ---
  if (loading) {
    return (
      <div className="product-carousel-section"> {/* 공통 CSS 클래스 사용 */}
        <h3 className="section-title">판매 내역</h3>
        <p>판매 내역을 불러오는 중...</p>
      </div>
    );
  }

  // --- 메인 렌더링 ---
  return (
    // 공통 캐러셀 섹션 스타일 적용
    <div className="product-carousel-section">
      <h3 className="section-title">판매 내역</h3>

      {/* 캐러셀 컨테이너 (아이템이 있을 경우) */}
      {mySellItems.length > 0 ? (
        <div className="carousel-container">
          {/* 이전 버튼: 아이템이 4개 초과이고, 현재 첫 페이지가 아닐 때 표시 */}
          {mySellItems.length > ITEMS_PER_SLIDE && slideIndex > 0 && (
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
              {/* 전체 판매 상품 아이템 렌더링 */}
              {mySellItems.map(item => (
                // 각 아이템에 고유 key 할당 ('mysell-' 접두사 사용)
                <ProductItem key={`mysell-${item.product_id}`} product={item} />
              ))}
             </div>
          </div>

          {/* 다음 버튼: 아이템이 4개 초과이고, 현재 마지막 페이지가 아닐 때 표시 */}
          {mySellItems.length > ITEMS_PER_SLIDE && slideIndex < mySellItems.length - ITEMS_PER_SLIDE && (
            <button className="carousel-arrow next" onClick={handleNext}>
              <FaArrowRight />
            </button>
          )}
        </div>
      ) : (
        // 아이템 없을 때 메시지
        <p className="empty-message">판매 중인 상품이 없습니다.</p>
      )}
    </div>
  );
};

export default MySellSection; // 컴포넌트 내보내기