import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import Header from '../components/layout/Header';
import ProductItem from '../features/products/components/ProductItem';
import '../styles/ProductList.css';

const SearchResultPage = ({ user, handleLogout }) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q'); // URL에서 검색어 가져오기
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!query) {
        setProducts([]);
        setLoading(false);
        return;
        }

        setLoading(true);
        setError(null);
        const apiUrl = `http://localhost:8000/products/search?q=${encodeURIComponent(query)}`;

        fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
            throw new Error('검색 결과를 불러오는 데 실패했습니다.');
            }
            return response.json();
        })
        .then(data => {
            setProducts(data);
        })
        .catch(err => {
            setError(err.message);
            setProducts([]); // 에러 발생 시 상품 목록 비우기
        })
        .finally(() => {
            setLoading(false);
        });
    }, [query]);

    return(
        <div className="app">
        <Header user={user} handleLogout={handleLogout} />
        <div className="main-content" style={{ paddingTop: '93px' }}>
            <div className="product-list-container">
            <div className="list-header">
                {/* 검색 결과 제목 */}
                <h2>'{query}' 검색 결과 ({products.length}개)</h2>
                {/* 정렬 옵션 (필요시 추가) */}
                {/* <select>...</select> */}
            </div>
            {loading && <div>검색 중...</div>}
            {error && <div>에러: {error}</div>}
            {!loading && !error && products.length === 0 && (
                <div>'{query}'에 대한 검색 결과가 없습니다.</div>
            )}
            {!loading && !error && products.length > 0 && (
                <div className="product-grid">
                {products.map(product => (
                    <ProductItem key={product.product_id} product={product} />
                ))}
                </div>
            )}
            </div>
        </div>
    </div>
    )
}

export default SearchResultPage;