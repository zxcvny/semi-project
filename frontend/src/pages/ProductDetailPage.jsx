import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ProductItem from '../features/products/components/ProductItem';
import '../styles/ProductDetailPage.css';
import { FaHeart, FaEye, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Header from '../components/layout/Header';

const ProductDetailPage = ({ user, handleLogout }) => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [sellerProducts, setSellerProducts] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLiked, setIsLiked] = useState(false);

    const [sellerScrollIndex, setSellerScrollIndex] = useState(0);
    const [relatedScrollIndex, setRelatedScrollIndex] = useState(0);
    const itemsPerPage = 4;

    const sellerGridRef = useRef(null);
    const relatedGridRef = useRef(null);

    // 시간 계산 함수
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

    // 상품 상세 정보 및 관련 데이터 로딩
    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            setError(null);
            setSellerScrollIndex(0);
            setRelatedScrollIndex(0);
            try {
                const productResponse = await fetch(`http://localhost:8000/products/${productId}`);
                if (!productResponse.ok) throw new Error('상품 정보를 불러오는데 실패했습니다.');
                const productData = await productResponse.json();
                setProduct(productData);
                const repIndex = productData.images.findIndex(img => img.is_representative);
                setCurrentImageIndex(repIndex >= 0 ? repIndex : 0);

                // 찜 상태 확인
                if (user) {
                     try {
                         const likedProductsResponse = await fetch(`http://localhost:8000/users/me/likes`, { credentials: 'include' });
                         if (likedProductsResponse.ok) {
                             const likedProductsData = await likedProductsResponse.json();
                             const likedIds = likedProductsData.map(p => p.product_id);
                             setIsLiked(likedIds.includes(parseInt(productId)));
                         } else {
                              console.warn("찜 상태 확인 실패");
                              setIsLiked(false);
                         }
                     } catch (likeErr) {
                         console.error("찜 상태 확인 중 오류:", likeErr);
                         setIsLiked(false);
                     }
                } else {
                    setIsLiked(false);
                }

                // 판매자의 다른 상품 가져오기
                if (productData.seller?.user_id) {
                    const sellerProductsResponse = await fetch(`http://localhost:8000/users/${productData.seller.user_id}/products`);
                    if (sellerProductsResponse.ok) {
                        let sellerProductsData = await sellerProductsResponse.json();
                        sellerProductsData = sellerProductsData.filter(p => p.product_id !== parseInt(productId));
                        setSellerProducts(sellerProductsData);
                    } else {
                        console.error("판매자 상품 로딩 실패:", sellerProductsResponse.statusText);
                        setSellerProducts([]);
                    }
                } else {
                     setSellerProducts([]);
                }

                // 관련 상품 가져오기
                if (productData.category?.name) {
                    const relatedProductsResponse = await fetch(`http://localhost:8000/categories/${encodeURIComponent(productData.category.name)}/products?limit=10`);
                    if (relatedProductsResponse.ok) {
                        let relatedProductsData = await relatedProductsResponse.json();
                        relatedProductsData = relatedProductsData.filter(p => p.product_id !== parseInt(productId)).slice(0, 8);
                        setRelatedProducts(relatedProductsData);
                    } else {
                        console.error("관련 상품 로딩 실패:", relatedProductsResponse.statusText);
                        setRelatedProducts([]);
                    }
                 } else {
                     setRelatedProducts([]);
                 }

            } catch (err) {
                setError(err.message);
                setSellerProducts([]);
                setRelatedProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [productId, user]);

    const handleThumbnailClick = (index) => setCurrentImageIndex(index);
    const openModal = () => product.images && product.images.length > 0 && setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const showPrevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? product.images.length - 1 : prevIndex - 1));
    };

    const showNextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex === product.images.length - 1 ? 0 : prevIndex + 1));
    };

     const handleLike = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        if (isOwner) {
            alert('자신의 상품은 찜할 수 없습니다.');
            return;
        }

        const method = isLiked ? 'DELETE' : 'POST';
        try {
            const response = await fetch(`http://localhost:8000/products/${productId}/like`, {
                method: method,
                credentials: 'include',
            });

            if (response.status === 204) {
                 setIsLiked(!isLiked);
                 setProduct(prev => ({
                     ...prev,
                     likes: isLiked ? prev.likes - 1 : prev.likes + 1
                 }));
            } else if (response.status === 400) {
                 const errorData = await response.json();
                 console.warn("찜 처리 실패 (400):", errorData.detail);
                 if (errorData.detail === "이미 찜한 상품입니다.") setIsLiked(true);
                 if (errorData.detail === "찜하지 않은 상품입니다.") setIsLiked(false);
            } else {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.detail || (isLiked ? '찜 취소 실패' : '찜하기 실패'));
            }
        } catch (err) {
            console.error("찜 처리 중 오류:", err);
            alert(err.message || '찜 처리 중 오류가 발생했습니다.');
        }
    };

    const handleScroll = (direction, type) => {
        const isSeller = type === 'seller';
        const products = isSeller ? sellerProducts : relatedProducts;
        const setScrollIndex = isSeller ? setSellerScrollIndex : setRelatedScrollIndex;
        const currentScrollIndex = isSeller ? sellerScrollIndex : relatedScrollIndex;
        const totalItems = products.length;
        const maxScrollIndex = Math.max(0, totalItems - itemsPerPage);

        let newScrollIndex;
        if (direction === 'right') {
            newScrollIndex = Math.min(currentScrollIndex + itemsPerPage, maxScrollIndex);
        } else {
            newScrollIndex = Math.max(currentScrollIndex - itemsPerPage, 0);
        }
        setScrollIndex(newScrollIndex);
    };

    const calculateTranslateX = (scrollIndex, gridRef) => {
        if (!gridRef.current || gridRef.current.children.length === 0) return '0px';

        const gridElement = gridRef.current;
        const gridStyle = window.getComputedStyle(gridElement);
        const gap = parseInt(gridStyle.gap || '0px');
        let totalWidthBeforeIndex = 0;

        for (let i = 0; i < scrollIndex; i++) {
             if(gridElement.children[i]) {
                const itemWidth = gridElement.children[i].getBoundingClientRect().width;
                totalWidthBeforeIndex += itemWidth + gap;
             }
        }
        return `-${totalWidthBeforeIndex}px`;
    };

    const handleDelete = async () => {
        if (!user || !product || user.user_id !== product.seller.user_id) {
            alert('삭제 권한이 없습니다.');
            return;
        }

        if (window.confirm('정말로 이 상품을 삭제하시겠습니까?\n삭제된 상품은 복구할 수 없습니다.')) {
            try {
                const response = await fetch(`http://localhost:8000/products/${productId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });

                if (response.status === 204) {
                    alert('상품이 삭제되었습니다.');
                    navigate('/'); // 홈으로 이동하거나 마이페이지 등으로 이동
                } else if (response.status === 403) {
                     alert('상품을 삭제할 권한이 없습니다.');
                } else if (response.status === 404) {
                    alert('상품을 찾을 수 없습니다.');
                }
                 else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.detail || '상품 삭제에 실패했습니다.');
                }
            } catch (err) {
                console.error("상품 삭제 중 오류:", err);
                alert(err.message || '상품 삭제 중 오류가 발생했습니다.');
            }
        }
    };

    if (loading) return (
        <>
            <Header user={user} handleLogout={handleLogout} /> {/* 헤더 추가 */}
            <div className="product-detail-page"><div className="loading-container">로딩 중...</div></div>
        </>
    );
    if (error) return (
        <>
             <Header user={user} handleLogout={handleLogout} /> {/* 헤더 추가 */}
             <div className="product-detail-page"><div className="error-container">에러: {error}</div></div>
        </>
    );
    if (!product) return (
        <>
             <Header user={user} handleLogout={handleLogout} /> {/* 헤더 추가 */}
             <div className="product-detail-page"><div className="not-found-container">상품 정보를 찾을 수 없습니다.</div></div>
        </>
    );

     const currentImageUrl = product.images && product.images.length > 0
      ? `http://localhost:8000${product.images[currentImageIndex]?.image_url.replace('../static', '/static')}`
      : 'https://via.placeholder.com/500';

    const isOwner = user && product.seller.user_id === user.user_id;

    return (
        <>
            <Header user={user} handleLogout={handleLogout} /> {/* 헤더 렌더링 */}
            <div className="product-detail-page"> {/* 페이지 메인 컨텐츠 */}
                <div className="product-detail-container">
                    <div className="product-detail-layout">
                        {/* --- 상품 이미지 섹션 --- */}
                        <div className="product-image-section">
                            <div className="product-main-image" onClick={openModal}>
                                <img src={currentImageUrl} alt={product.title} />
                            </div>
                            {product.images && product.images.length > 1 && (
                                <div className="product-thumbnail-grid">
                                    {product.images.map((img, index) => (
                                        <div
                                            key={img.image_id}
                                            className={`thumbnail-item ${index === currentImageIndex ? 'active' : ''}`}
                                            onClick={() => handleThumbnailClick(index)}
                                        >
                                            <img src={`http://localhost:8000${img.image_url.replace('../static', '/static')}`} alt={`상품 이미지 ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* --- 상품 정보 섹션 --- */}
                        <div className="product-info-section">
                            <div className="product-seller-info">
                                <span>{product.seller.nickname}</span>
                                <span className="seller-location">{product.trade_city} {product.trade_district}</span>
                            </div>
                            <div className="divider-simple"></div>
                            <div className="product-title-line">
                                <h1 className="product-title-detail">{product.title}</h1>
                                {product.product_tag && product.product_tag !== "선택안함" && (
                                    <span className="product-tag-detail">{product.product_tag}</span>
                                )}
                            </div>
                            <div className="product-meta-detail">
                                <Link to={`/categories/${encodeURIComponent(product.category.name)}`} className="product-category-detail link-to">{product.category.name}</Link>
                                <span>·</span>
                                <span>{formatTimeAgo(product.created_at)}</span>
                            </div>
                            <p className="product-price-detail">{product.price.toLocaleString('ko-KR')}원</p>
                            <div className="divider-simple"></div>
                            <div className="product-content-detail">
                                {product.content.split('\n').map((line, index) => (
                                    <React.Fragment key={index}>{line}<br /></React.Fragment>
                                ))}
                            </div>
                            <div className="product-stats-detail">
                                <span><FaHeart /> 관심 {product.likes}</span>
                                <span><FaEye /> 조회 {product.views}</span>
                            </div>
                            <div className="product-actions">
                                {isOwner ? (
                                    <div className="owner-actions" style={{ display: 'flex', gap: '15px', width: '100%' }}>
                                        <Link to={`/products/${productId}/edit`} style={{ flex: 1 }} className="wishlist-btn link-to">수정하기</Link>
                                        <button onClick={handleDelete} style={{ flex: 1, background: '#e03131', color: 'white' }} className="buy-btn">삭제하기</button>
                                    </div>
                                ) : (
                                    <>
                                        <button onClick={handleLike} className="wishlist-btn">
                                            <FaHeart style={{ color: isLiked ? '#e03131' : '#adb5bd' }} /> 찜 {product.likes}
                                        </button>
                                        <button className="buy-btn">채팅하기</button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 판매자의 다른 상품 --- */}
                {sellerProducts.length > 0 && (
                    <div className="related-products-section">
                        <h2 className="section-title">{product.seller.nickname}님의 다른 상품</h2>
                        <div className="related-product-carousel">
                            {sellerProducts.length > itemsPerPage && sellerScrollIndex > 0 && (
                                <button className="scroll-arrow left" onClick={() => handleScroll('left', 'seller')}><FaChevronLeft /></button>
                            )}
                            <div className="related-product-scroll-container">
                                <div className="related-product-grid-wrapper" style={{ transform: `translateX(${calculateTranslateX(sellerScrollIndex, sellerGridRef)})` }}>
                                    <div className="related-product-grid" ref={sellerGridRef}>
                                        {sellerProducts.map(p => (
                                            <div className="grid-item" key={p.product_id}><ProductItem product={p} /></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {sellerProducts.length > itemsPerPage && sellerScrollIndex < sellerProducts.length - itemsPerPage && (
                                <button className="scroll-arrow right" onClick={() => handleScroll('right', 'seller')}><FaChevronRight /></button>
                            )}
                        </div>
                    </div>
                )}

                {/* --- 관련 상품 --- */}
                {relatedProducts.length > 0 && (
                    <div className="related-products-section">
                        <h2 className="section-title">이 상품과 관련 있는 상품</h2>
                        <div className="related-product-carousel">
                            {relatedProducts.length > itemsPerPage && relatedScrollIndex > 0 && (
                                <button className="scroll-arrow left" onClick={() => handleScroll('left', 'related')}><FaChevronLeft /></button>
                            )}
                            <div className="related-product-scroll-container">
                                <div className="related-product-grid-wrapper" style={{ transform: `translateX(${calculateTranslateX(relatedScrollIndex, relatedGridRef)})` }}>
                                    <div className="related-product-grid" ref={relatedGridRef}>
                                        {relatedProducts.map(p => (
                                            <div className="grid-item" key={p.product_id}><ProductItem product={p} /></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {relatedProducts.length > itemsPerPage && relatedScrollIndex < relatedProducts.length - itemsPerPage && (
                                <button className="scroll-arrow right" onClick={() => handleScroll('right', 'related')}><FaChevronRight /></button>
                            )}
                        </div>
                    </div>
                )}

                {/* --- 이미지 모달 --- */}
                {isModalOpen && product.images && product.images.length > 0 && (
                    <div className="modal-backdrop" onClick={closeModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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