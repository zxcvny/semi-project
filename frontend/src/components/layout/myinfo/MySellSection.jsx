import { useState, useEffect } from 'react';
import ProductItem from '../../../features/products/components/ProductItem'; 
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'; 
// sampleProducts import 제거
import '../../../styles/MyInfoSections.css'; // 통합된 CSS import

const ITEMS_PER_SLIDE = 4; // 캐러셀에 한 번에 보여줄 아이템 개수

/* ============================================= */
/* == MySellSection 컴포넌트 == */
/* ============================================= */
// user prop을 받도록 수정
const MySellSection = ({ user }) => {
  // --- State 정의 ---
  const [mySellItems, setMySellItems] = useState([]); // 판매 상품 목록 배열
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태 추가
  const [slideIndex, setSlideIndex] = useState(0); // 현재 슬라이드 인덱스

  // --- 데이터 로드 (API 호출) ---
  useEffect(() => {
    // 로그인 상태일 때만 데이터 로드 (user prop 확인)
    if (user && user.user_id) {
        setLoading(true); // 로딩 시작
        setError(null); // 이전 에러 초기화

        // --- 👇 API 호출 로직 ---
        
        // [수정] app/routers/users.py에 정의하신 올바른 주소로 변경
        const apiUrl = `http://localhost:8000/users/me/products`; 

        console.log("MySellSection: API 호출 주소:", apiUrl); // API URL 로그

        // [수정] fetch 호출에 credentials: 'include' 추가
        fetch(apiUrl, { credentials: 'include' })
            .then(response => {
                console.log("MySellSection: 응답 상태 코드:", response.status);
                if (!response.ok) {
                     // 404 Not Found는 판매 상품이 없는 경우일 수 있음
                    if (response.status === 404) {
                        console.log("MySellSection: 판매 중인 상품 없음 (404)");
                        setMySellItems([]); // 빈 배열로 설정
                        return null; // .json() 호출 방지
                    }
                    // 기타 HTTP 오류 처리
                    throw new Error(`판매 내역 로드 실패 (HTTP 상태: ${response.status})`);
                }
                return response.json(); // 성공 시 JSON 파싱
            })
            .then(data => {
                // 응답 데이터 처리
                if (data === null) { // 404 응답 처리
                   setMySellItems([]);
                } else if (Array.isArray(data)) {
                    console.log("MySellSection: 받은 데이터:", data);
                    // API에서 받은 데이터 그대로 사용 (최대 개수 제한은 API에서 하는 것이 좋음)
                    setMySellItems(data); // state 업데이트
                    setSlideIndex(0); // 슬라이드 인덱스 초기화
                } else {
                    console.error("MySellSection: API 응답이 배열 형식이 아님:", data);
                    throw new Error("API 응답 형식이 올바르지 않습니다.");
                }
            })
            .catch(err => {
                // 네트워크 오류 또는 위에서 throw된 에러 처리
                console.error("MySellSection: 데이터 로딩 중 에러:", err);
                setError(err.message); // 에러 메시지 state 업데이트
                setMySellItems([]); // 에러 발생 시 목록 비움
            })
            .finally(() => {
                setLoading(false); // 로딩 완료 (성공/실패 무관)
                console.log("MySellSection: 로딩 완료.");
            });
        // --- API 호출 로직 끝 ---

    } else {
         // 비로그인 상태 처리
        setMySellItems([]); // 판매 내역 비우기
        setLoading(false); // 로딩 상태 해제
    }
  }, [user]); // user prop이 변경될 때마다 재실행

  // --- 이벤트 핸들러 (캐러셀 이동) ---
  const handlePrev = () => {
    setSlideIndex(prev => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    const lastPossibleIndex = Math.max(0, mySellItems.length - ITEMS_PER_SLIDE);
    setSlideIndex(prev => Math.min(lastPossibleIndex, prev + 1));
  };

  // --- 로딩 중 표시 ---
  if (loading) {
    return (
      <div className="product-carousel-section">
        <h3 className="section-title">판매 내역</h3>
        <p>판매중인 상품을 불러오는 중...</p>
      </div>
    );
  }

  // --- 에러 발생 시 표시 ---
    if (error) {
    return (
      <div className="product-carousel-section">
        <h3 className="section-title">판매중</h3>
        {/* CSS로 .error-message 스타일 정의 필요 */}
        <p className="error-message">오류: {error}</p>
      </div>
    );
  }


  // --- 메인 렌더링 ---
  return (
    // 공통 캐러셀 섹션 스타일 적용
    <div className="product-carousel-section">
      <h3 className="section-title">판매중</h3>

      {/* 캐러셀 컨테이너 (아이템이 있을 경우) */}
      {mySellItems.length > 0 ? (
        <div className="carousel-container">
          {/* 이전 버튼 */}
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

          {/* 다음 버튼 */}
          {mySellItems.length > ITEMS_PER_SLIDE && slideIndex < mySellItems.length - ITEMS_PER_SLIDE && (
            <button className="carousel-arrow next" onClick={handleNext}>
              <FaArrowRight />
            </button>
          )}
        </div>
      ) : (
        // 아이템 없을 때 메시지 (로그인 여부에 따라 다르게 표시)
        user ? <p className="empty-message">판매 중인 상품이 없습니다.</p> : <p className="empty-message">로그인 후 판매 내역을 확인하세요.</p>
      )}
    </div>
  );
};

export default MySellSection; // 컴포넌트 내보내기