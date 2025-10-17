import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { FaCamera, FaTimes } from 'react-icons/fa';
import '../styles/SellPage.css';

const SellPage = () => {
  // 폼 필드를 위한 State
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('선택안함');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // 드롭다운 메뉴를 위한 카테고리 목록 가져오기
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/categories')
      .then(response => response.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) {
          setCategoryId(data[0].category_id); // 기본 카테고리 설정
        }
      })
      .catch(error => console.error("카테고리 정보를 가져오는 데 실패했습니다:", error));
  }, []);

  // 이미지 선택 처리
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
  
  // 이미지 제거 처리
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    // 메모리 누수 방지를 위해 URL 해제
    URL.revokeObjectURL(imagePreviews[index]);
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
        alert('상품 이미지를 1개 이상 등록해주세요.');
        return;
    }
    if (!title.trim()) {
        alert('상품 제목을 입력해주세요.');
        return;
    }
    if (!price || isNaN(price)) {
        alert('가격을 올바르게 입력해주세요.');
        return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category_id', categoryId);
    formData.append('price', price);
    formData.append('location', location);
    formData.append('content', content);
    formData.append('tag', tag);
    images.forEach(image => {
      formData.append('images', image);
    });
    
    // 실제 앱에서는 이 데이터를 API로 전송합니다.
    console.log("다음 데이터를 전송합니다:");
    for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
    }
    
    // API 호출 시뮬레이션
    setTimeout(() => {
        setIsLoading(false);
        alert('상품이 성공적으로 등록되었습니다!');
        navigate('/'); // 등록 후 홈으로 이동
    }, 1500);
  };

  return (
    <>
      <Header />
      <div className="sell-page-container">
        <form onSubmit={handleSubmit} className="sell-form">
          <h1>상품 정보 등록</h1>

          <section className="form-section">
            <h2>상품 이미지 ({images.length}/10)</h2>
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
            <h2>상품 정보</h2>
            <div className="input-group">
              <label htmlFor="title">제목</label>
              <input 
                type="text" 
                id="title" 
                placeholder="상품 제목을 입력해주세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
             <div className="input-group">
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
            <div className="input-group">
              <label htmlFor="price">가격 (원)</label>
              <input 
                type="number" 
                id="price" 
                placeholder="숫자만 입력해주세요"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="location">거래 희망 지역</label>
              <input 
                type="text" 
                id="location" 
                placeholder="예) 서울시 강남구"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>상품 상태</label>
              <div className="tag-options">
                {['선택안함', '무료나눔', '미개봉', '급매'].map(option => (
                    <label key={option}>
                        <input 
                            type="radio" 
                            name="tag" 
                            value={option} 
                            checked={tag === option} 
                            onChange={(e) => setTag(e.target.value)}
                        />
                        {option}
                    </label>
                ))}
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="content">상품 설명</label>
              <textarea 
                id="content" 
                rows="10" 
                placeholder="상품에 대한 설명을 자세히 적어주세요."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
            </div>
          </section>
          
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? '등록 중...' : '판매글 등록하기'}
          </button>
        </form>
      </div>
    </>
  );
};

export default SellPage;
