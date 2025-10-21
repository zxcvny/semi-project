import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import '../styles/ProductDetailPage.css'; // 해당 CSS 파일 import
import { FaHeart, FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa'; // 아이콘 import
import { sampleProducts } from '../data/sampleProducts'; // 샘플 데이터 import
import ProductItem from '../features/products/components/ProductItem'; // 관련 상품 표시용 컴포넌트

/* ============================================= */
/* == 헬퍼 함수 (날짜, 가격 포맷팅) == */
/* ============================================= */
const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const seconds = Math.floor((now - past) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)}년 전`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)}달 전`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)}일 전`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)}시간 전`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)}분 전`;
    return '방금 전';
};

const formatPrice = (price) => {
    if (price === 0) return '무료나눔';
    return `${price.toLocaleString('ko-KR')}원`;
};

/* ============================================= */
/* == ProductDetailPage 컴포넌트 == */
/* ============================================= */
const ProductDetailPage = ({ user, handleLogout }) => {
  // --- State 정의 ---
  const { productId } = useParams(); // URL 파라미터에서 상품 ID 가져오기
  const [product, setProduct] = useState(null); // 현재 페이지 상품 정보
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [selectedImage, setSelectedImage] = useState(0); // 현재 선택된 이미지 인덱스 (메인+팝업)
  const [relatedProducts, setRelatedProducts] = useState([]); // 비슷한 상품 목록
  const [sellerProducts, setSellerProducts] = useState([]); // 판매자의 다른 상품 목록
  const [isModalOpen, setIsModalOpen] = useState(false); // 이미지 팝업 열림/닫힘 상태

  // --- 데이터 로딩 및 관련 상품 필터링 ---
  useEffect(() => {
    const fetchProduct = () => {
      setLoading(true);
      setError(null);
      setRelatedProducts([]);
      setSellerProducts([]);

      // 로딩 효과를 위해 setTimeout 사용 (0.3초)
      setTimeout(() => {
          try {
            const currentProductId = parseInt(productId);
            // sampleProducts에서 현재 상품 찾기
            const foundProduct = sampleProducts.find(
              (p) => p.product_id === currentProductId
            );

            if (!foundProduct) {
              throw new Error('해당 상품이 존재하지 않습니다.');
            }

            // sampleProducts 데이터에 없는 정보(seller, category, content 등) 추가
            const mockedProduct = {
              ...foundProduct,
              seller: { nickname: '샘플 판매자' }, // 가짜 판매자 정보
              seller_id: 1, // 가짜 판매자 ID
              category: { name: '디지털기기' },   // 가짜 카테고리 정보
              tag: '중고', // 가짜 태그 정보
              // 상품 설명을 길게 만들어 스크롤 테스트
              content: '샘플 상품 설명입니다.\n상태 깨끗하고 좋아요.\n직거래 원합니다.\n세 번째 줄입니다.\n네 번째 줄\n다섯 번째 줄\n여섯 번째 줄\n일곱 번째 줄\n여덟 번째 줄\n아홉 번째 줄 - 이제 스크롤이 생겨야 합니다.\n열 번째 줄입니다.',
              view_count: 123, // 가짜 조회수
              // images 배열 생성 (sampleProducts의 image_url 활용)
              images: [
                { image_id: 1, image_url: foundProduct.image_url },
                { image_id: 2, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&h=600&auto=format&fit=crop" }, // 추가 썸네일 이미지
              ],
            };
            setProduct(mockedProduct); // state 업데이트

            // --- 관련 상품 필터링 (sampleProducts 기준) ---
            const allProducts = sampleProducts;

            // "판매자의 다른 상품": 현재 상품 제외하고 앞에서 4개
            const otherSellerProducts = allProducts.filter(
              p => p.product_id !== currentProductId
            ).slice(0, 4);
            setSellerProducts(otherSellerProducts);

            // "카테고리 인기 상품": 현재 상품 및 위 상품 제외하고 wishlist_count 높은 순 4개
            const popularCategoryProducts = allProducts.filter(
              p => p.product_id !== currentProductId &&
                   !otherSellerProducts.some(sp => sp.product_id === p.product_id)
            )
            .sort((a, b) => b.wishlist_count - a.wishlist_count)
            .slice(0, 4);
            setRelatedProducts(popularCategoryProducts);
            // --- 관련 상품 필터링 끝 ---

          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
      }, 300); // 0.3초 딜레이
    };

    fetchProduct(); // 컴포넌트 마운트 시 또는 productId 변경 시 데이터 로드
  }, [productId]); // productId가 바뀔 때마다 재실행

  // --- 이벤트 핸들러 ---
  // 썸네일 클릭 시 메인 이미지 변경
  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
  };

  // 이미지 팝업 열기
  const openModal = () => {
    if (product && product.images && product.images.length > 0) {
      setIsModalOpen(true);
    }
  };

  // 이미지 팝업 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 팝업 내 이전 이미지 보기
  const showPrevImage = () => {
    setSelectedImage((prevIndex) =>
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  // 팝업 내 다음 이미지 보기
  const showNextImage = () => {
    setSelectedImage((prevIndex) =>
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  // --- 로딩 및 에러 화면 렌더링 ---
  if (loading) return (
    <>
      <Header user={user} handleLogout={handleLogout} />
      <div className="app product-detail-page">
        <div className="product-detail-container">
          <p>상품 정보를 불러오는 중...</p>
        </div>
      </div>
    </>
  );

  if (error) return (
     <>
      <Header user={user} handleLogout={handleLogout} />
      <div className="app product-detail-page">
        <div className="product-detail-container">
          <p>에러: {error}</p>
        </div>
      </div>
    </>
  );

  // 상품 정보가 없을 경우 (예: 잘못된 ID)
  if (!product) return null;

  // 현재 선택된 메인 이미지 URL 결정
  const mainImageUrl = product.images && product.images.length > 0
    ? product.images[selectedImage].image_url // sampleProducts의 URL 사용
    : 'https://via.placeholder.com/600'; // 이미지가 없을 경우 기본 이미지

  // --- 메인 화면 렌더링 ---
  return (
    <>
      {/* 헤더 */}
      <Header user={user} handleLogout={handleLogout} />

      {/* 페이지 컨텐츠 영역 */}
      <div className="app product-detail-page">
        <div className="product-detail-container"> {/* 흰색 배경 박스 */}
          <div className="product-detail-layout"> {/* 이미지 + 정보 가로 배치 */}

            {/* == 상품 이미지 섹션 == */}
            <div className="product-image-section">
              {/* 메인 이미지 (클릭 시 팝업 열기) */}
              <div className="product-main-image" onClick={openModal} style={{ cursor: 'pointer' }}>
                <img src={mainImageUrl} alt={product.title} />
              </div>
              {/* 썸네일 (이미지가 2개 이상일 때만 표시) */}
              {product.images.length > 1 && (
                <div className="product-thumbnail-grid">
                  {product.images.map((image, index) => (
                    <div
                      key={image.image_id || index} // 고유 key
                      className={`thumbnail-item ${index === selectedImage ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(index)} // 클릭 시 해당 이미지 선택
                    >
                      <img src={image.image_url} alt={`thumbnail ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* == 상품 정보 섹션 == */}
            <div className="product-info-section">
              {/* 판매자 정보 */}
              <div className="product-seller-info">
                <span>{product.seller.nickname}</span>
                <span className="seller-location">{product.location}</span>
              </div>
              <div className="divider-simple"></div>

              {/* 제목 + 태그 */}
              <div className="product-title-line">
                <h1 className="product-title-detail">{product.title}</h1>
                {product.tag !== '선택안함' && <span className="product-tag-detail">{product.tag}</span>}
              </div>

              {/* 메타 정보 (카테고리 + 시간) */}
              <div className="product-meta-detail">
                <Link to={`/category/${encodeURIComponent(product.category.name)}`} className="link-to product-category-detail">
                  {product.category.name}
                </Link>
                <span className="time-ago-detail">{formatTimeAgo(product.created_at)}</span>
              </div>

              {/* 가격 (오른쪽 정렬) */}
              <div className="product-price-detail">
                {formatPrice(product.price)}
              </div>

              <div className="divider-simple"></div>

              {/* 상품 설명 (스크롤 적용됨) */}
              <div className="product-content-detail">
                {/* 개행 문자를 <br> 태그로 변환하여 렌더링 */}
                {product.content.split('\n').map((line, i) => (
                  <span key={i}>{line}<br/></span>
                ))}
              </div>

              {/* 상품 통계 (관심, 조회수) */}
              <div className="product-stats-detail">
                <span>관심 <FaHeart /> {product.wishlist_count}</span>
                <span>조회 {product.view_count}</span>
              </div>

              {/* 구매 버튼 (찜하기, 채팅하기/수정하기) */}
              <div className="product-actions">
                <button className="wishlist-btn">
                  <FaHeart /> 찜하기
                </button>
                {/* 로그인 상태이고, 현재 유저가 판매자일 경우 '수정하기' 표시 */}
                <button className="buy-btn">
                  {user && user.user_id === product.seller_id ? '수정하기' : '채팅하기'}
                </button>
              </div>
            </div>
          </div> {/* product-detail-layout 끝 */}

          {/* == 관련 상품 섹션 == */}
          {/* 판매자의 다른 상품 */}
          {sellerProducts.length > 0 && (
            <div className="related-products-section">
              <h3 className="section-title">{product.seller.nickname}님의 다른 상품</h3>
              <div className="related-product-grid">
                {sellerProducts.map(p => (
                  <ProductItem key={p.product_id} product={p} />
                ))}
              </div>
            </div>
          )}
          {/* 카테고리 인기 상품 */}
          {relatedProducts.length > 0 && (
            <div className="related-products-section">
              <h3 className="section-title">{product.category.name} 카테고리 인기 상품</h3>
              <div className="related-product-grid">
                {relatedProducts.map(p => (
                   <ProductItem key={p.product_id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div> {/* product-detail-container 끝 */}

        {/* == 이미지 팝업 (모달) == */}
        {/* isModalOpen이 true이고 product 정보가 있을 때만 렌더링 */}
        {isModalOpen && product && product.images && product.images.length > 0 && (
          // 뒷 배경 (클릭 시 닫힘)
          <div className="modal-backdrop" onClick={closeModal}>
            {/* 실제 내용 (클릭해도 닫히지 않음) */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              {/* 닫기 버튼 */}
              <button className="close-button" onClick={closeModal}>
                <FaTimes />
              </button>
              {/* 이전 이미지 버튼 (이미지가 2개 이상일 때) */}
              {product.images.length > 1 && (
                <button className="prev-arrow" onClick={showPrevImage}>
                  <FaArrowLeft />
                </button>
              )}
              {/* 현재 선택된 큰 이미지 */}
              <img
                src={product.images[selectedImage].image_url}
                alt={`${product.title} - image ${selectedImage + 1}`}
                className="modal-image"
              />
              {/* 다음 이미지 버튼 (이미지가 2개 이상일 때) */}
              {product.images.length > 1 && (
                <button className="next-arrow" onClick={showNextImage}>
                  <FaArrowRight />
                </button>
              )}
              {/* 이미지 카운터 (하단 중앙) */}
              <div className="image-counter">
                {selectedImage + 1} / {product.images.length}
              </div>
            </div>
          </div>
        )}
      </div> {/* app product-detail-page 끝 */}
    </>
  );
};

export default ProductDetailPage;