import React, { useState, useEffect } from 'react'
import Header from '../components/layout/Header'
import '../styles/HomePage.css';
// import ProductList from '../features/products/components/ProductList'

import { FiSmartphone, FiHeadphones, FiWatch } from 'react-icons/fi';
import { FaComputer } from 'react-icons/fa6';
import { FaCameraRetro } from 'react-icons/fa';
import { RiSofaLine, RiShoppingBag4Line } from 'react-icons/ri';
import { LiaBicycleSolid } from 'react-icons/lia';
import { MdHelpOutline } from 'react-icons/md'; // 기본값으로 쓸 아이콘

const categoryIcons = {
    '디지털기기': FiSmartphone,
    '컴퓨터': FaComputer,
    '카메라': FaCameraRetro,
    '가구/인테리어': RiSofaLine,
    '자전거': LiaBicycleSolid,
    '패션/잡화': RiShoppingBag4Line,
    '오디오': FiHeadphones,
    '시계/쥬얼리': FiWatch,
    'default': MdHelpOutline // 혹시 일치하는 이름이 없을 경우 보여줄 기본 아이콘
};

const HomePage = () => {
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
                <Header />
                <div className="main-content">
                    <div>로딩 중 ...</div>
                </div>
            </>
        )
    }

    return(
        <div className="App">
            <Header /> {/* 고정 헤더 */}
            <div className="main-content">
                <div className="container">
                    <nav className="category-nav">
                        {categories.map(cat => {
                            const IconComponent = categoryIcons[cat.name] || categoryIcons.default;
                            return (
                                <div key={cat.category_id} className="category-item">
                                    <div className="category-icon-wrapper">
                                        <IconComponent />
                                    </div>
                                    <span>{cat.name}</span>
                                </div>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    )
}

export default HomePage;