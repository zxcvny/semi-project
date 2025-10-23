import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import '../styles/HomePage.css';
import ProductList from '../features/products/components/ProductList';

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
    const [loading, setLoading] = useState(true);
    const { categoryName } = useParams();

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
                <ProductList categoryName={categoryName} />
            </div>
        </div>
    )
}

export default HomePage;