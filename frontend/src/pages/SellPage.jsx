import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { FaCamera,FaTimes } from 'react-icons/fa';
import { PiImages } from "react-icons/pi";
import { GoTag } from "react-icons/go";

import Header from '../components/layout/Header'

import '../styles/SellPage.css'

// 간단한 지역 데이터
const locationData = {
  '서울시': ['강남구', '마포구', '용산구', '성동구', '종로구'],
  '경기도': ['수원시', '성남시', '고양시', '용인시', '안양시'],
  '인천시': ['부평구', '남동구', '서구', '연수구'],
};

const cities = Object.keys(locationData);

const SellPage = ({ user, handleLogout, isAuthReady }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(0);
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [tag, setTag] = useState('NONE');

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [selectedDistrict, setSelectedDistrict] = useState(locationData[cities[0]][0]);

  const navigate = useNavigate();
  const alertShown = useRef(false);

  // 로그인 상태 확인
  useEffect(() => {
    if (!isAuthReady) return;
    if (!user && !alertShown.current) {
      alertShown.current = true;
      if (window.confirm('로그인이 필요한 서비스입니다. 로그인하시겠습니까?')) {
        navigate('/login');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, isAuthReady]);

  // 카테고리 목록 가져오기
  useEffect(() => {
    fetch('http://localhost:8000/categories')
      .then(response => response.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0].category_id);
        }
      })
      .catch(error => console.error("카테고리 정보를 가져오는 데 실패했습니다:", error));
  }, []);

  // '무료나눔' 선택 시 가격을 0으로 설정하고 수정 불가 처리
  useEffect(() => {
    if (tag === 'FREE') {
      setPrice('0');
    }
  }, [tag]);

  useEffect(() => {
    const hasUnsavedChanges = title || price > 0 || content || images.length > 0;

    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [title, price, content, images]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      alert('이미지는 최대 10개까지 업로드할 수 있습니다.');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    // 메모리 누수 방지를 위해 URL 해제
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const handleCityChange = (e) => {
    const newCity = e.target.value;
    setSelectedCity(newCity);
    setSelectedDistrict(locationData[newCity][0]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    if (images.length === 0) {
      alert('이미지를 1개 이상 등록해주세요.');
      return;
    }

    setLoading(true);

    const formData = new FormData();

    // 선택된 tag 값(예: 'NONE')에 해당하는 한글 label(예: '선택안함') 찾기
    const selectedTagOption = tagOptions.find(option => option.value === tag);
    const productTagValueToSend = selectedTagOption ? selectedTagOption.label : tag;

    formData.append('title', title);
    formData.append('content', content);
    formData.append('price', Number(price));
    formData.append('category_id', Number(categoryId));
    formData.append('trade_city', selectedCity);
    formData.append('trade_district', selectedDistrict);
    formData.append('product_tag', productTagValueToSend);

    formData.append('representative_image_index', 0);

    images.forEach((imageFile) => {
      formData.append('images', imageFile);
    });

    try {
      const productResponse = await fetch('http://localhost:8000/products/', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!productResponse.ok) {
        const errorData = await productResponse.json();
        throw new Error(errorData.detail || '상품 등록에 실패했습니다.');
      }

      const result = await productResponse.json();
      alert('상품이 성공적으로 등록되었습니다!');
      navigate(`/products/${result.product_id}`);

    } catch (error) {
      console.error("상품 등록 중 오류 발생:", error);
      alert(error.message || '상품 등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const tagOptions = [
    { value: 'NONE', label: '선택안함' },
    { value: 'FREE', label: '무료나눔' },
    { value: 'NEW', label: '미개봉' },
    { value: 'USED', label: '중고' },
    { value: 'URGENT', label: '급매' }
  ];

  return (
    <>
      <Header user={user} handleLogout={handleLogout} />
      <div className="app-sell">
        <div className="sell-header">
          <h2>판매할 상품을 등록해보세요</h2>
          <p>상품 정보를 자세히 입력할수록 빠르게 판매할 수 있어요</p>
        </div>
        <div className="sell-container">
          <form onSubmit={handleFormSubmit} className="sell-form">
            <section className="form-section">
              <h2><PiImages className="section-icon" />상품 이미지 ({images.length}/10)</h2>
              <p>이미지는 상품 등록 시 필수입니다. 첫 번째 이미지가 대표 이미지로 사용됩니다.</p>
              <div className="image-uploader">
                <label htmlFor="image-upload" className="image-upload-button">
                  <FaCamera />
                  <span>이미지 등록</span>
                </label>
                <input 
                  id="image-upload" 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageChange}
                />
                <div className="image-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={preview} alt={`preview ${index}`} />
                    <button type="button" onClick={() => handleRemoveImage(index)} className="remove-image-btn">
                        <FaTimes />
                    </button>
                  </div>
                ))}
                </div>
              </div>
            </section>
            <section className="form-section">
              <h2><GoTag className="section-icon" />기본 정보</h2>
              <div className="sell-input-group">
                <label htmlFor="title">제목</label>
                <input
                  type="text"
                  id="title"
                  placeholder="예: 아이폰 14 Pro 256GB 실버 판매합니다"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="sell-input-group">
                <label htmlFor="category">카테고리</label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="sell-input-group">
                <label>상품 상태</label>
                <div className="tag-radio-group">
                  {tagOptions.map(option => (
                    <label key={option.value} className="radio-label">
                      <input
                        type="radio"
                        name="tag"
                        value={option.value}
                        checked={tag === option.value}
                        onChange={(e) => setTag(e.target.value)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>
            </section>
            <section className="form-section">
              <h2><PiImages className="section-icon" />가격 및 거래 정보</h2>
              <div className="sell-input-group">
                <label htmlFor="price">가격</label>
                <input
                  type="number"
                  id="price"
                  placeholder="가격을 입력해주세요"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={tag === 'FREE'} // '무료나눔' 선택 시 비활성화
                  required
                />
              </div>
              <div className="sell-input-group">
                <label htmlFor="location">거래 희망 지역</label>
                <div className="location-select-group">
                  <select
                    id="city"
                    value={selectedCity}
                    onChange={handleCityChange}
                  >
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <select
                    id="district"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                  >
                    {locationData[selectedCity].map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
            <section className="form-section">
              <h2><PiImages className="section-icon" />상세 설명</h2>
              <div className="sell-input-group">
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="10"
                    placeholder="상품에 대한 설명을 자세하게 적어주세요."
                    required
                ></textarea>
              </div>
            </section>
            <button type="submit" className="sell-btn" disabled={loading}>
              {loading ? '등록 중...' : '상품 등록하기'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default SellPage;