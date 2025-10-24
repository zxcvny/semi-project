import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaEye } from 'react-icons/fa';
import '../../../styles/ProductItem.css';

// 시간 계산 함수 (예: "2분 전", "1시간 전")
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

// 가격 포맷팅 함수 (예: 1,000,000원)
const formatPrice = (price) => {
    return `${price.toLocaleString('ko-KR')}원`;
}

const ProductItem = ({ product }) => {
  let representativeImage = null;
  if (product.images && product.images.length > 0) {
    representativeImage = product.images.find(img => img.is_representative);
    if (!representativeImage) {
      representativeImage = product.images[0];
    }
  }
  const imageUrl = representativeImage
    ? `http://localhost:8000${representativeImage.image_url.replace('../static', '/static')}`
    : 'https://via.placeholder.com/250';

  return (
    <div className="product-card">
      <Link to={`/products/${product.product_id}`} className="link-to">
        <div className="product-image-container">
          <img src={imageUrl} alt={product.title} />
        </div>
        <div className="product-details">
          <h4 className="product-title">{product.title}</h4>
          <p className="product-price">{formatPrice(product.price)}</p>
          <p className="product-location">
            {product.trade_city} {product.trade_district}
          </p>
          <div className="product-meta">
            <span><FaHeart /> {product.likes} <FaEye /> {product.views}</span>
            <span className="time-ago">{formatTimeAgo(product.created_at)}</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductItem;