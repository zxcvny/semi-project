import { useState, useEffect } from 'react';
import ProductItem from '../../../features/products/components/ProductItem'; 
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import '../../../styles/MyInfoSections.css'; 


const ITEMS_PER_SLIDE = 4; 

/* ============================================= */
/* == WishlistSection 컴포넌트 == */
/* ============================================= */
// user prop을 받도록 수정 (찜 목록 API 호출 시 user_id 사용 위함)
const WishlistSection = ({ user }) => {
  // --- State 정의 ---
  const [wishlistItems, setWishlistItems] = useState([]); // 찜 목록 아이템 배열
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태 추가
  const [slideIndex, setSlideIndex] = useState(0); // 현재 슬라이드 인덱스

  // --- 데이터 로드 (API 호출) ---
  useEffect(() => {
    // 로그인 상태일 때만 데이터 로드 (user prop 확인)
    // 실제 앱에서는 isAuthReady 같은 상태를 함께 확인하는 것이 더 안전합니다.
    if (user && user.user_id) {
        setLoading(true); // 로딩 시작
        setError(null); // 이전 에러 초기화

        // --- 👇 API 호출 로직 ---
        // 실제 찜 목록 API 엔드포인트
        const apiUrl = `http://localhost:8000/users/me/likes`; // [수정됨]

        console.log("WishlistSection: API 호출 주소:", apiUrl); // API URL 로그

        fetch(apiUrl, { credentials: 'include' }) // [수정됨] - 인증 쿠키 전송
            .then(response => {
                console.log("WishlistSection: 응답 상태 코드:", response.status);
                if (!response.ok) {
                    // 404 등 에러 처리
                    throw new Error(`찜 목록 로드 실패 (HTTP 상태: ${response.status})`);
                }
                return response.json(); // 성공 시 JSON 파싱
            })
            .then(data => {
                // 응답 데이터가 배열인지 확인
                if (Array.isArray(data)) {
                    console.log("WishlistSection: 받은 데이터:", data);
                    setWishlistItems(data); // API 결과로 state 업데이트
                    setSlideIndex(0); // 슬라이드 인덱스 초기화
                } else {
                    console.error("WishlistSection: API 응답이 배열 형식이 아님:", data);
                    throw new Error("API 응답 형식이 올바르지 않습니다.");
                }
            })
            .catch(err => {
                // 네트워크 오류 또는 위에서 throw된 에러 처리
                console.error("WishlistSection: 데이터 로딩 중 에러:", err);
                setError(err.message); // 에러 메시지 state 업데이트
                setWishlistItems([]); // 에러 발생 시 목록 비움
            })
            .finally(() => {
                setLoading(false); // 로딩 완료 (성공/실패 무관)
                console.log("WishlistSection: 로딩 완료.");
            });
        // --- API 호출 로직 끝 ---

    } else {
        // 비로그인 상태 처리
        setWishlistItems([]); // 찜 목록 비우기
        setLoading(false); // 로딩 상태 해제
        // 필요 시 "로그인 필요" 메시지 표시 가능 (아래 렌더링 부분 참고)
    }
  }, [user]); // user prop이 변경될 때마다 (로그인/로그아웃 시) 재실행

  // --- 이벤트 핸들러 (캐러셀 이동) ---
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
      <div className="product-carousel-section">
        <h3 className="section-title">찜 목록</h3>
        <p>찜 목록을 불러오는 중...</p>
      </div>
    );
  }

  // --- 에러 발생 시 표시 ---
  if (error) {
    return (
      <div className="product-carousel-section">
        <h3 className="section-title">찜 목록</h3>
        {/* CSS로 .error-message 스타일 정의 필요 (예: 빨간색 글씨) */}
        <p className="error-message">오류: {error}</p>
      </div>
    );
  }

  // --- 메인 렌더링 ---
  return (
    // 공통 캐러셀 섹션 스타일 적용
    <div className="product-carousel-section">
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
              {/* 전체 찜 목록 아이템 렌더링 */}
              {wishlistItems.map(item => (
                // 각 아이템에 고유 key 할당 ('wishlist-' 접두사 사용)
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
        // 아이템 없을 때 메시지 (로그인 여부에 따라 다르게 표시)
        user ? <p className="empty-message">찜한 상품이 없습니다.</p> : <p className="empty-message">로그인 후 찜 목록을 확인하세요.</p>
      )}
    </div>
  );
};

export default WishlistSection; // 컴포넌트 내보내기