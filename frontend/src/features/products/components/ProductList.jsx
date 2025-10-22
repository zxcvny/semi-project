import { useState, useEffect } from 'react';
import ProductItem from './ProductItem';
import '../../../styles/ProductList.css';

const ProductList = ({ categoryName }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    let apiUrl = '';

    if (categoryName) {
      apiUrl = `http://127.0.0.1:8000/categories/${encodeURIComponent(categoryName)}/products`;
    } else {
      apiUrl = 'http://127.0.0.1:8000/products';
    }

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('상품 정보를 찾을 수 없습니다.')
          }
          throw new Error('데이터를 불러오는 데 실패했습니다.');
        }
        return response.json();
      })
      .then(data => {
        setProducts(data);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categoryName]);

  if (loading) return <div>상품 목록을 불러오는 중...</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <div className="product-list-container">
      <div className="list-header">
        <h2>{categoryName || '전체 상품'}</h2>
        <select>
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
        </select>
      </div>
      <div className="product-grid">
        {products.map(product => (
          <ProductItem key={product.product_id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;