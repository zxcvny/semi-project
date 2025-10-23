import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductItem from '../features/products/components/ProductItem'; // ProductItem 컴포넌트 임포트
import '../styles/ProductDetailPage.css'; // CSS 파일 임포트
import { FaHeart, FaEye } from 'react-icons/fa'; // 아이콘 임포트

const ProductDetailPage = ({ user }) => { // 현재 로그인 사용자 정보를 props로 받음
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [sellerProducts, setSellerProducts] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // 현재 선택된 이미지 인덱스
    const [isModalOpen, setIsModalOpen] = useState(false); // 이미지 팝업 상태

    useEffect(() => {
        // 상품 상세 정보 가져오기
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8000/products/${productId}`);
                if (!response.ok) throw new Error('상품 정보를 불러오는데 실패했습니다.');
                const data = await response.json();
                setProduct(data);
                setCurrentImageIndex(data.images.findIndex(img => img.is_representative) || 0); // 대표 이미지 인덱스 설정

                // 상품 정보 로드 후, 판매자의 다른 상품 및 관련 상품 가져오기
                fetchSellerProducts(data.seller.user_id);
                fetchRelatedProducts(data.category.name); // 카테고리 이름 사용

            } catch (err) {
                setError(err.message);
            } finally {
                // setLoading(false); // 다른 fetch들이 완료된 후 false로 설정
            }
        };

        // 판매자의 다른 상품 가져오기
        const fetchSellerProducts = async (sellerId) => {
            try {
                // 참고: 백엔드에 /users/{user_id}/products 와 같은 엔드포인트 필요 (이미 users.py에 /me/products 가 있음. 사용자 ID 기반 엔드포인트 추가 필요)
                // 임시로 /users/me/products 사용 (실제로는 sellerId를 사용해야 함)
                const response = await fetch(`http://localhost:8000/users/${sellerId}/products`); // 백엔드에 해당 엔드포인트 구현 필요
                if (!response.ok) throw new Error('판매자의 다른 상품 정보를 가져오는데 실패했습니다.');
                let data = await response.json();
                // 현재 상품 제외, 최대 4개만 표시
                data = data.filter(p => p.product_id !== parseInt(productId)).slice(0, 4);
                setSellerProducts(data);
            } catch (err) {
                console.error("판매자 상품 로딩 오류:", err);
                // 에러 상태를 설정할 수도 있음
            }
        };

        // 관련 상품 가져오기 (같은 카테고리 상품)
        const fetchRelatedProducts = async (categoryName) => {
            try {
                const response = await fetch(`http://localhost:8000/categories/${encodeURIComponent(categoryName)}/products?limit=5`); // API 호출
                if (!response.ok) throw new Error('관련 상품 정보를 가져오는데 실패했습니다.');
                let data = await response.json();
                // 현재 상품 제외 (API에서 limit=5 요청 후 여기서 필터링하면 최대 4개)
                data = data.filter(p => p.product_id !== parseInt(productId));
                setRelatedProducts(data);
            } catch (err) {
                console.error("관련 상품 로딩 오류:", err);
                // 에러 상태를 설정할 수도 있음
            } finally {
                 setLoading(false); // 모든 데이터 로딩 완료
            }
        };

        fetchProduct();

    }, [productId]);

    const handleThumbnailClick = (index) => {
        setCurrentImageIndex(index);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const showPrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
        );
    };

    const showNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
        );
    };

    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>에러: {error}</div>;
    if (!product) return <div>상품 정보를 찾을 수 없습니다.</div>;

    // 현재 보여줄 메인 이미지 URL
     const currentImageUrl = product.images && product.images.length > 0
      ? `http://localhost:8000${product.images[currentImageIndex]?.image_url.replace('../static', '/static')}`
      : 'https://via.placeholder.com/500';

    const isOwner = user && product.seller.user_id === user.user_id; // 현재 사용자가 상품 판매자인지 확인

    const handleLike = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }
        if (isOwner) { // 자신의 상품이면 함수 종료
            alert('자신의 상품은 찜할 수 없습니다.');
            return;
        }
        // TODO: 찜하기/찜취소 API 호출 로직 구현
        try {
            // 예시: 찜 상태 확인 후 찜 또는 찜 취소 요청
            // const isLiked = checkIfLiked(productId); // 찜 상태 확인 함수 (구현 필요)
            // const method = isLiked ? 'DELETE' : 'POST';
            const response = await fetch(`http://localhost:8000/products/${productId}/like`, {
                method: 'POST', // 또는 DELETE
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json();
                // 이미 찜한 경우 등의 에러 처리
                if (response.status === 400 && errorData.detail === "이미 찜한 상품입니다.") {
                     // 찜 취소 로직 호출
                     const unlikeResponse = await fetch(`http://localhost:8000/products/${productId}/like`, {
                        method: 'DELETE',
                        credentials: 'include',
                     });
                     if (!unlikeResponse.ok) {
                        const unlikeErrorData = await unlikeResponse.json();
                        throw new Error(unlikeErrorData.detail || '찜 취소에 실패했습니다.');
                     }
                     alert('찜을 취소했습니다.');
                     // UI 업데이트 (찜 수 감소 등)
                     setProduct(prev => ({ ...prev, likes: prev.likes - 1 }));

                } else {
                    throw new Error(errorData.detail || '찜 처리에 실패했습니다.');
                }
            } else {
                alert('상품을 찜했습니다!'); // 성공 메시지
                // UI 업데이트 (찜 수 증가 등)
                setProduct(prev => ({ ...prev, likes: prev.likes + 1 }));
            }
        } catch(err) {
            alert(err.message);
        }
    }

    return (
        <>
        <Header user={user} handleLogout={handleLogout} />
        <div className="product-detail-page">
            <div className="product-detail-container"> {/* 전체 컨테이너 */}
                <div className="product-detail-layout"> {/* 이미지 + 정보 레이아웃 */}
                    {/* 상품 이미지 섹션 */}
                    <div className="product-image-section">
                        <div className="product-main-image" onClick={openModal}>
                             <img src={currentImageUrl} alt={product.title} />
                        </div>
                        {/* 썸네일 이미지 */}
                        {product.images.length > 1 && (
                            <div className="product-thumbnail-grid">
                                {product.images.map((img, index) => (
                                    <div
                                        key={img.image_id}
                                        className={`thumbnail-item ${index === currentImageIndex ? 'active' : ''}`}
                                        onClick={() => handleThumbnailClick(index)}
                                    >
                                        <img src={`http://localhost:8000${img.image_url.replace('../static', '/static')}`} alt={`Thumbnail ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 상품 정보 섹션 */}
                    <div className="product-info-section">
                        <div className="product-seller-info">
                            <span>{product.seller.nickname}</span>
                            <span className="seller-location">{product.trade_city} {product.trade_district}</span>
                        </div>
                        <div className="divider-simple"></div>
                        <div className="product-title-line">
                            <h1 className="product-title-detail">{product.title}</h1>
                            {product.product_tag !== "선택안함" && (
                                <span className="product-tag-detail">{product.product_tag}</span>
                            )}
                        </div>
                         <div className="product-meta-detail">
                            <span className="product-category-detail">{product.category.name}</span>
                            <span>·</span>
                            <span>{new Date(product.created_at).toLocaleString('ko-KR')}</span>
                        </div>
                        <p className="product-price-detail">{product.price.toLocaleString('ko-KR')}원</p>
                        <div className="divider-simple"></div>

                         <div className="product-content-detail">
                            {product.content.split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ))}
                        </div>

                         <div className="product-stats-detail">
                            <span><FaHeart /> 관심 {product.likes}</span>
                            <span><FaEye /> 조회 {product.views}</span>
                        </div>

                         <div className="product-actions">
                            {!isOwner && (
                                <button onClick={handleLike} className="wishlist-btn">
                                    <FaHeart /> 찜 {product.likes}
                                </button>
                            )}
                             {/* 자신의 상품일 경우 수정/삭제 버튼 */}
                            {isOwner && (
                                <div className="owner-actions" style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                    <button style={{ flex: 1, padding: '16px', borderRadius: '8px', border: '1px solid #ccc', background: '#f8f9fa' }}>수정하기</button>
                                    <button style={{ flex: 1, padding: '16px', borderRadius: '8px', border: 'none', background: '#dc3545', color: 'white' }}>삭제하기</button>
                                </div>
                             )}
                            {!isOwner && <button className="buy-btn">채팅하기</button> } {/* TODO: 채팅 기능 연결 */}
                        </div>
                    </div>
                </div>
            </div>

            {/* 판매자의 다른 상품 */}
            {sellerProducts.length > 0 && (
                <div className="related-products-section">
                    <h2 className="section-title">{product.seller.nickname}님의 다른 상품</h2>
                    <div className="related-product-grid">
                        {sellerProducts.map(p => (
                            <ProductItem key={p.product_id} product={p} />
                        ))}
                    </div>
                </div>
            )}

            {/* 관련 상품 */}
            {relatedProducts.length > 0 && (
                 <div className="related-products-section">
                    <h2 className="section-title">이 상품과 관련 있는 상품</h2>
                    <div className="related-product-grid">
                        {relatedProducts.map(p => (
                            <ProductItem key={p.product_id} product={p} />
                        ))}
                    </div>
                </div>
            )}

             {/* 이미지 팝업 모달 */}
            {isModalOpen && product.images.length > 0 && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking image */}
                        <img src={currentImageUrl} alt={product.title} className="modal-image" />
                        <button className="close-button" onClick={closeModal}>×</button>
                        {product.images.length > 1 && (
                            <>
                                <button className="prev-arrow" onClick={showPrevImage}>&#10094;</button>
                                <button className="next-arrow" onClick={showNextImage}>&#10095;</button>
                                <div className="image-counter">{currentImageIndex + 1} / {product.images.length}</div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
        </>
    );
};

export default ProductDetailPage;