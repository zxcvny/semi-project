import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import '../styles/HomePage.css';
import ProductList from '../features/products/components/ProductList';
import ProductItem from '../features/products/components/ProductItem';
import '../styles/ProductList.css';

import { FiSmartphone, FiHeadphones, FiWatch } from 'react-icons/fi';
import { FaComputer } from 'react-icons/fa6';
import { FaCameraRetro } from 'react-icons/fa';
import { RiSofaLine, RiShoppingBag4Line } from 'react-icons/ri';
import { LiaBicycleSolid } from 'react-icons/lia';
import { MdHelpOutline } from 'react-icons/md';

const categoryIcons = {
    'FiSmartphone': FiSmartphone,
    'FaComputer': FaComputer,
    'FaCameraRetro': FaCameraRetro,
    'RiSofaLine': RiSofaLine,
    'LiaBicycleSolid': LiaBicycleSolid,
    'RiShoppingBag4Line': RiShoppingBag4Line,
    'FiHeadphones': FiHeadphones,
    'FiWatch': FiWatch,
    'default': MdHelpOutline
};

const HomePage = ({ user, handleLogout }) => {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const { categoryName } = useParams();

    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(true);
    const [searchError, setSearchError] = useState(null);

    // 카테고리 가져오기
    useEffect(() => {
        fetch('http://localhost:8000/categories')
        .then(response => {
            if (!response.ok) {
                throw new Error('카테고리 정보를 불러오는 데 실패했습니다.');
            }
            return response.json()
        })
        .then(data => {
            setCategories(data);
            setLoadingCategories(false);
        })
        .catch(error => {
            console.error("카테고리 데이터를 가져오는 데 실패했습니다:", error);
            setLoadingCategories(false);
        });
    }, []);

    // 검색 결과
    useEffect(() => {
        if (!query) {
          setSearchResults([]);
          setSearchLoading(false);
          return;
        }

        setSearchLoading(true);
        setSearchError(null);
        const apiUrl = `http://localhost:8000/products/search?q=${encodeURIComponent(query)}`;

        fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
            throw new Error('검색 결과를 불러오는 데 실패했습니다.');
            }
            return response.json();
        })
        .then(data => {
            setSearchResults(data);
        })
        .catch(err => {
            setSearchError(err.message);
            setSearchResults([]);
        })
        .finally(() => {
            setSearchLoading(false);
        });
    }, [query]);

    if (loadingCategories) {
        return (
            <>
                <Header user={user} handleLogout={handleLogout}/>
                <div className="main-content">
                    <div>로딩 중 ...</div>
                </div>
            </>
        )
    }

    return(
        <div className="app">
            <Header user={user} handleLogout={handleLogout} /> {/* 고정 헤더 */}
            <div className="main-content">
                <div className="category-container">
                    <nav className="category-nav">
                        {categories.map(cat => {
                            const IconComponent = categoryIcons[cat.icon_name] || categoryIcons.default;
                            return (
                                <Link to={`/categories/${encodeURIComponent(cat.name)}`} key={cat.category_id} className="link-to category-item">
                                    <div className="category-icon-wrapper">
                                        <IconComponent className="category-icon" />
                                    </div>
                                    <span className="category-name">{cat.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                {/* 검색어 있을 때 화면, 없을 때 화면 */}
                {query ? (
                    // 검색어가 있을 때
                    <div className="product-list-container">
                        <div className="list-header">
                            <h2>'{query}' 검색 결과 ({searchResults.length}개)</h2>
                        </div>
                        {searchLoading && <div>검색 중...</div>}
                        {searchError && <div>에러: {searchError}</div>}
                        {!searchLoading && !searchError && searchResults.length === 0 && (
                            <div>'{query}'에 대한 검색 결과가 없습니다.</div>
                        )}
                        {!searchLoading && !searchError && searchResults.length > 0 && (
                            <div className="product-grid">
                            {searchResults.map(product => (
                                <ProductItem key={product.product_id} product={product} />
                            ))}
                            </div>
                        )}
                    </div>
                ) : (
                    // 검색어가 없을 때
                    <ProductList categoryName={categoryName} />
                )}
            </div>
        </div>
    )
}

export default HomePage;