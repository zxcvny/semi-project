import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import '../styles/HomePage.css';
import ProductList from '../features/products/components/ProductList'

import { FiSmartphone, FiHeadphones, FiWatch } from 'react-icons/fi';
import { FaComputer } from 'react-icons/fa6';
import { FaCameraRetro } from 'react-icons/fa';
import { RiSofaLine, RiShoppingBag4Line } from 'react-icons/ri';
import { LiaBicycleSolid } from 'react-icons/lia';
import { MdHelpOutline } from 'react-icons/md';

const categoryIcons = {
    '디지털기기': FiSmartphone,
    '컴퓨터': FaComputer,
    '카메라': FaCameraRetro,
    '가구/인테리어': RiSofaLine,
    '자전거': LiaBicycleSolid,
    '패션/잡화': RiShoppingBag4Line,
    '오디오': FiHeadphones,
    '시계/쥬얼리': FiWatch,
    'default': MdHelpOutline
};

const HomePage = ({ user, handleLogout }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/categories')
        .then(response => response.json())
        .then(data => {
            setCategories(data);
            setLoading(false);
        })
        .catch(error => {
            console.error("카테고리 데이터를 가져오는 데 실패했습니다:", error);
            setLoading(false);
        });
    }, []);

    if (loading) {
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
                            const IconComponent = categoryIcons[cat.name] || categoryIcons.default;
                            return (
                                <Link to={`/category/${cat.name}`} key={cat.category_id} className="link-to category-item">
                                    <div className="category-icon-wrapper">
                                        <IconComponent className="category-icon" />
                                    </div>
                                    <span className="category-name">{cat.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <ProductList />
            </div>
        </div>
    )
}

export default HomePage;