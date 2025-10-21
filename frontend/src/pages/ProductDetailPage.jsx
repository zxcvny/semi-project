// ... (imports, helper functions, useEffect 등 이전 코드 동일) ...
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import '../styles/ProductDetailPage.css';
import { FaHeart } from 'react-icons/fa';
import { sampleProducts } from '../data/sampleProducts';
import ProductItem from '../features/products/components/ProductItem';

const formatTimeAgo = (dateString) => {
    // ...
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
    // ...
    if (price === 0) return '무료나눔';
    return `${price.toLocaleString('ko-KR')}원`;
};


const ProductDetailPage = ({ user, handleLogout }) => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);

  useEffect(() => {
    // ... (fetchProduct 로직 동일) ...
    const fetchProduct = () => {
      setLoading(true);
      setError(null);
      setRelatedProducts([]);
      setSellerProducts([]);

      setTimeout(() => {
          try {
            const currentProductId = parseInt(productId);
            const foundProduct = sampleProducts.find(
              (p) => p.product_id === currentProductId
            );

            if (!foundProduct) {
              throw new Error('해당 상품이 존재하지 않습니다.');
            }

            const mockedProduct = {
              ...foundProduct,
              seller: { nickname: '샘플 판매자' },
              seller_id: 1,
              category: { name: '디지털기기' },
              tag: '중고', // 태그 예시
              content: '샘플 상품 설명입니다.\n상태 깨끗하고 좋아요.\n직거래 원합니다.샘플 상품 설명입니다.\n상태 깨끗하고 좋아요.\n직거래 원합니다샘플 상품 설명입니다.\n상태 깨끗하고 좋아요.\n직거래 원합니다',
              view_count: 123,
              images: [
                { image_id: 1, image_url: foundProduct.image_url },
                { image_id: 2, image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&h=600&auto=format&fit=crop" },
              ],
            };
            setProduct(mockedProduct);

            const allProducts = sampleProducts;

            const otherSellerProducts = allProducts.filter(
              p => p.product_id !== currentProductId
            ).slice(0, 4);
            setSellerProducts(otherSellerProducts);

            const popularCategoryProducts = allProducts.filter(
              p => p.product_id !== currentProductId &&
                   !otherSellerProducts.some(sp => sp.product_id === p.product_id)
            )
            .sort((a, b) => b.wishlist_count - a.wishlist_count)
            .slice(0, 4);
            setRelatedProducts(popularCategoryProducts);

          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
      }, 300);
    };

    fetchProduct();
  }, [productId]);


  // ... (handleThumbnailClick, 로딩/에러 화면 동일) ...
    const handleThumbnailClick = (index) => {
        setSelectedImage(index);
    };

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

    if (!product) return null;

    const mainImageUrl = product.images && product.images.length > 0
        ? product.images[selectedImage].image_url
        : 'https://via.placeholder.com/600';

  return (
    <>
      <Header user={user} handleLogout={handleLogout} />
      <div className="app product-detail-page">
        <div className="product-detail-container">
          <div className="product-detail-layout">
            {/* 상품 이미지 섹션 (이전 코드와 동일) */}
            <div className="product-image-section">
              {/* ... */}
              <div className="product-main-image">
                  <img src={mainImageUrl} alt={product.title} />
              </div>
              {product.images.length > 1 && (
                  <div className="product-thumbnail-grid">
                  {product.images.map((image, index) => (
                      <div
                      key={image.image_id || index}
                      className={`thumbnail-item ${index === selectedImage ? 'active' : ''}`}
                      onClick={() => handleThumbnailClick(index)}
                      >
                      <img src={image.image_url} alt={`thumbnail ${index + 1}`} />
                      </div>
                  ))}
                  </div>
              )}
            </div>

            {/* 상품 정보 및 구매 섹션 */}
            <div className="product-info-section">
              <div className="product-seller-info">
                  <span>{product.seller.nickname}</span>
                  <span className="seller-location">{product.location}</span>
              </div>
              <div className="divider-simple"></div>

              {/* --- 👇 JSX 구조 변경 --- */}
              {/* 2. 제목 + 태그를 div로 묶음 */}
              <div className="product-title-line">
                <h1 className="product-title-detail">{product.title}</h1>
                {/* 1. 태그를 제목 옆으로 이동 */}
                {product.tag !== '선택안함' && <span className="product-tag-detail">{product.tag}</span>}
              </div>

              <div className="product-meta-detail">
                <Link to={`/category/${encodeURIComponent(product.category.name)}`} className="link-to product-category-detail">
                  {product.category.name}
                </Link>
                <span className="time-ago-detail">{formatTimeAgo(product.created_at)}</span>
              </div>

              {/* 가격 div는 그대로 두지만, 내부에 태그는 없음 */}
              <div className="product-price-detail">
                {formatPrice(product.price)}
              </div>
              {/* --- JSX 구조 변경 끝 --- */}

              <div className="divider-simple"></div>

              <div className="product-content-detail">
                <p>{product.content.split('\n').map((line, i) => (
                  <span key={i}>{line}<br/></span>
                ))}</p>
              </div>

              <div className="product-stats-detail">
                <span>관심 <FaHeart /> {product.wishlist_count}</span>
                <span>조회 {product.view_count}</span>
              </div>

              <div className="product-actions">
                <button className="wishlist-btn">
                  <FaHeart /> 찜하기
                </button>
                <button className="buy-btn">
                  {user && user.user_id === product.seller_id ? '수정하기' : '채팅하기'}
                </button>
              </div>
            </div>
          </div> {/* product-detail-layout 끝 */}

          {/* 관련 상품 섹션 (이전 코드와 동일) */}
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
      </div>
    </>
  );
};

export default ProductDetailPage;