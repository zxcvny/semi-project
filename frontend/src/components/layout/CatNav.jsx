import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiSmartphone,
  FiHeadphones,
  FiWatch,
} from "react-icons/fi";
import { FaComputer } from "react-icons/fa6";
import { FaCameraRetro } from "react-icons/fa";
import { RiSofaLine, RiShoppingBag4Line } from "react-icons/ri";
import { LiaBicycleSolid } from "react-icons/lia";
import { MdHelpOutline } from "react-icons/md";
import "../../styles/CatNav.css";

const categoryIcons = {
  FiSmartphone,
  FaComputer,
  FaCameraRetro,
  RiSofaLine,
  LiaBicycleSolid,
  RiShoppingBag4Line,
  FiHeadphones,
  FiWatch,
  default: MdHelpOutline,
};

const CatNav = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/categories", {
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error("카테고리를 불러오지 못했습니다.");
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("카테고리 요청 오류:", err);
        setError("카테고리 정보를 불러오는 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <div className="category-loading">로딩 중...</div>;
  if (error) return <div className="category-error">{error}</div>;
  if (!categories.length) return <div className="category-empty">카테고리가 없습니다.</div>;

  return (
    <div className="category-container">
      <h2 className="category-title">카테고리</h2>
      <nav className="category-nav">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat.icon_name] || categoryIcons.default;
          return (
            <Link
              to={`/categories/${encodeURIComponent(cat.name)}`}
              key={cat.category_id}
              className="category-item"
            >
              <div className="category-icon-wrapper">
                <Icon className="category-icon" />
              </div>
              <span className="category-name">{cat.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default CatNav;


















// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   FiSmartphone, FiHeadphones, FiWatch,
// } from 'react-icons/fi';
// import { FaComputer } from 'react-icons/fa6';
// import { FaCameraRetro } from 'react-icons/fa';
// import { RiSofaLine, RiShoppingBag4Line } from 'react-icons/ri';
// import { LiaBicycleSolid } from 'react-icons/lia';
// import { MdHelpOutline } from 'react-icons/md';
// import '../../styles/CatNav.css';

// const categoryIcons = {
//   FiSmartphone,
//   FaComputer,
//   FaCameraRetro,
//   RiSofaLine,
//   LiaBicycleSolid,
//   RiShoppingBag4Line,
//   FiHeadphones,
//   FiWatch,
//   default: MdHelpOutline,
// };

// const CatNav = () => {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // ✅ FastAPI categories 엔드포인트 호출
//     fetch('http://localhost:8000/categories')
//       .then((res) => {
//         if (!res.ok) throw new Error('카테고리 데이터를 불러오지 못했습니다.');
//         return res.json();
//       })
//       .then((data) => {
//         setCategories(data);
//         setLoading(false);
//       })
//       .catch((err) => {
//         console.error('카테고리 불러오기 실패:', err);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <div className="category-loading">로딩 중...</div>;

//   return (
//     <div className="category-container">
//       <h2 className="category-title">카테고리</h2>
//       <nav className="category-nav">
//         {categories.map((cat) => {
//           const Icon = categoryIcons[cat.icon_name] || categoryIcons.default;
//           return (
//             <Link
//               to={`/categories/${encodeURIComponent(cat.name)}`}
//               key={cat.category_id}
//               className="category-item"
//             >
//               <div className="category-icon-wrapper">
//                 <Icon className="category-icon" />
//               </div>
//               <span className="category-name">{cat.name}</span>
//             </Link>
//           );
//         })}
//       </nav>
//     </div>
//   );
// };

// export default CatNav;
