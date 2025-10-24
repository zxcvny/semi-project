import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { FaCamera, FaTimes } from 'react-icons/fa';
import { PiImages } from "react-icons/pi";
import { GoTag } from "react-icons/go";

import Header from '../components/layout/Header';

const locationData = {
    '서울시': ['강남구', '마포구', '용산구', '성동구', '종로구'],
    '경기도': ['수원시', '성남시', '고양시', '용인시', '안양시'],
    '인천시': ['부평구', '남동구', '서구', '연수구'],
};
const cities = Object.keys(locationData);

const ProductEditPage = ({ user, handleLogout, isAuthReady }) => {
    const { productId } = useParams();
    const navigate = useNavigate();

    // --- 폼 상태 ---
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(''); // 초기값 빈 문자열로 변경
    const [content, setContent] = useState('');
    const [categories, setCategories] = useState([]);
    const [categoryId, setCategoryId] = useState('');
    const [tag, setTag] = useState('NONE'); // 기존 상품 태그 값으로 초기화 필요
    const [status, setStatus] = useState('FOR_SALE'); // 상품 상태 추가

    // --- 이미지 상태 ---
    const [existingImages, setExistingImages] = useState([]); // { image_id, image_url, is_representative }
    const [newImageFiles, setNewImageFiles] = useState([]); // File 객체 배열
    const [imagePreviews, setImagePreviews] = useState([]); // { id, url, isExisting, file?, isRepresentative? }
    const [representativeImageId, setRepresentativeImageId] = useState(null); // 대표 이미지 ID (기존 or 신규)

    const [loading, setLoading] = useState(true); // 페이지 로딩 상태
    const [submitting, setSubmitting] = useState(false); // 폼 제출 상태
    const [error, setError] = useState(null);

    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');

    const alertShown = useRef(false);

    // 태그 옵션 (SellPage와 동일)
    const tagOptions = [
        { value: 'NONE', label: '선택안함' },
        { value: 'FREE', label: '무료나눔' },
        { value: 'NEW', label: '미개봉' },
        { value: 'USED', label: '중고' },
        { value: 'URGENT', label: '급매' }
    ];
    // 상품 상태 옵션 추가
    const statusOptions = [
        { value: 'FOR_SALE', label: '판매중' },
        { value: 'RESERVED', label: '예약중' },
        { value: 'SOLD_OUT', label: '판매완료' },
    ];

    // 로그인 및 상품 소유권 확인, 데이터 로딩
    useEffect(() => {
        if (!isAuthReady) return;

        const fetchInitialData = async () => {
            if (!user) {
                if (!alertShown.current) {
                    alertShown.current = true;
                    if (window.confirm('로그인이 필요한 서비스입니다. 로그인하시겠습니까?')) {
                        navigate('/login');
                    } else {
                        navigate('/');
                    }
                }
                return;
            }

            try {
                // 카테고리 로딩
                const catResponse = await fetch('http://localhost:8000/categories');
                if (!catResponse.ok) throw new Error('카테고리 정보를 가져올 수 없습니다.');
                const catData = await catResponse.json();
                setCategories(catData);

                // 상품 정보 로딩
                const prodResponse = await fetch(`http://localhost:8000/products/${productId}`);
                if (!prodResponse.ok) {
                        if (prodResponse.status === 404) throw new Error('상품 정보를 찾을 수 없습니다.');
                        throw new Error('상품 정보를 불러오는데 실패했습니다.');
                }
                const productData = await prodResponse.json();

                // 소유권 확인
                if (productData.seller.user_id !== user.user_id) {
                    alert('수정 권한이 없습니다.');
                    navigate(`/products/${productId}`);
                    return;
                }

                // 상태 업데이트
                setTitle(productData.title);
                setPrice(productData.price.toString()); // 문자열로 설정해야 input value가 제대로 표시됨
                setContent(productData.content);
                setCategoryId(productData.category.category_id);
                setTag(productData.product_tag);
                setStatus(productData.product_status); // 상태 설정
                setSelectedCity(productData.trade_city || cities[0]); // 기본값 설정
                setSelectedDistrict(productData.trade_district || locationData[productData.trade_city || cities[0]][0]);

                const loadedPreviews = productData.images.map(img => ({
                    id: img.image_id,
                    url: `http://localhost:8000${img.image_url.replace('../static', '/static')}`,
                    isExisting: true,
                    isRepresentative: img.is_representative,
                }));
                setImagePreviews(loadedPreviews);
                setExistingImages(productData.images); // 기존 이미지 정보 저장

                const repImage = productData.images.find(img => img.is_representative);
                if (repImage) {
                    setRepresentativeImageId(repImage.image_id);
                }
            } catch (err) {
                console.error("데이터 로딩 중 오류:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();

    }, [productId, user, navigate, isAuthReady]);


    // '무료나눔' 태그 시 가격 0 고정 (SellPage와 동일)
    useEffect(() => {
    if (tag === 'FREE') {
        setPrice('0');
    }
    }, [tag]);

    // 지역 선택 핸들러 (SellPage와 유사)
    const handleCityChange = (e) => {
        const newCity = e.target.value;
        setSelectedCity(newCity);
        // 해당 도시의 첫 번째 구/군으로 자동 설정 (또는 기존 값 유지 로직 추가 가능)
        setSelectedDistrict(locationData[newCity]?.[0] || '');
    };

    // --- 이미지 핸들러 ---
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = imagePreviews.length + files.length;

        if (totalImages > 10) {
            alert('이미지는 최대 10개까지 업로드할 수 있습니다.');
            return;
        }

        const newFilesToAdd = files.slice(0, 10 - imagePreviews.length); // 최대 10개 제한

        setNewImageFiles(prev => [...prev, ...newFilesToAdd]);

        const newPreviewsToAdd = newFilesToAdd.map(file => ({
            id: `new_${Date.now()}_${Math.random()}`, // 임시 ID
            url: URL.createObjectURL(file),
            isExisting: false,
            file: file, // 파일 객체 저장
            isRepresentative: false,
        }));

    // 첫 이미지 업로드 시 대표 이미지로 설정
        if (imagePreviews.length === 0 && newPreviewsToAdd.length > 0) {
        newPreviewsToAdd[0].isRepresentative = true;
        setRepresentativeImageId(newPreviewsToAdd[0].id);
        }

        setImagePreviews(prev => [...prev, ...newPreviewsToAdd]);
    };

    const handleRemoveImage = (idToRemove) => {
        const targetPreview = imagePreviews.find(p => p.id === idToRemove);
        if (!targetPreview) return;

        // 미리보기 및 파일 상태 업데이트
        const updatedPreviews = imagePreviews.filter(p => p.id !== idToRemove);
        setImagePreviews(updatedPreviews);

        if (!targetPreview.isExisting) {
            // 새로 추가된 이미지 파일 제거
            setNewImageFiles(prev => prev.filter(file => file !== targetPreview.file));
            URL.revokeObjectURL(targetPreview.url); // 메모리 해제
        }
        // 기존 이미지는 제거 목록에 추가할 필요 없음 (백엔드에서 처리)

        // 대표 이미지가 삭제된 경우, 첫 번째 이미지를 새 대표 이미지로 설정
        if (representativeImageId === idToRemove) {
            if (updatedPreviews.length > 0) {
                updatedPreviews[0].isRepresentative = true;
                setRepresentativeImageId(updatedPreviews[0].id);
                // 기존 이미지 상태도 업데이트 (isRepresentative 플래그)
                if (updatedPreviews[0].isExisting) {
                    setExistingImages(prev => prev.map(img =>
                    img.image_id === updatedPreviews[0].id ? { ...img, is_representative: true } : { ...img, is_representative: false }
                ));
                }
            } else {
                setRepresentativeImageId(null); // 이미지가 없으면 null
            }
        }
    };

    // 대표 이미지 설정 핸들러
    const handleSetRepresentative = (idToSet) => {
        if (representativeImageId === idToSet) return; // 이미 대표 이미지면 변경 없음

        setImagePreviews(prev => prev.map(p => ({
            ...p,
            isRepresentative: p.id === idToSet
        })));
        setRepresentativeImageId(idToSet);

        // 기존 이미지 상태 업데이트
        setExistingImages(prev => prev.map(img => ({
            ...img,
            is_representative: img.image_id === idToSet
        })));
    };


    // --- 폼 제출 핸들러 ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (imagePreviews.length === 0) {
            alert('이미지를 1개 이상 등록해주세요.');
            return;
        }
        if (!representativeImageId) {
            alert('대표 이미지를 설정해주세요.');
            return;
        }

        setSubmitting(true);

        const formData = new FormData();

        const selectedTagOption = tagOptions.find(option => option.value === tag);
        const productTagValueToSend = selectedTagOption ? selectedTagOption.label : tag;

        const selectedStatusOption = statusOptions.find(option => option.value === status);
        const productStatusValueToSend = selectedStatusOption ? selectedStatusOption.label : status;

        // 텍스트 필드 추가
        formData.append('title', title);
        formData.append('content', content);
        formData.append('price', Number(price));
        formData.append('category_id', Number(categoryId));
        formData.append('trade_city', selectedCity);
        formData.append('trade_district', selectedDistrict);
        formData.append('product_tag', productTagValueToSend);
        formData.append('product_status', productStatusValueToSend);

        // 이미지 관련 정보 추가
        let repIndex = -1;
        let imageCounter = 0;

        // 유지할 기존 이미지 URL 추가
        imagePreviews.forEach((preview, index) => {
            if (preview.isExisting) {
                formData.append('keep_image_ids', preview.id.toString()); // ID 목록 전달
                if (preview.id === representativeImageId) {
                    repIndex = index; // 전체 이미지 목록에서의 인덱스
                }
                imageCounter++;
            }
        });

        // 새로 추가된 이미지 파일 추가
        newImageFiles.forEach((file) => {
            formData.append('new_images', file);
                const preview = imagePreviews.find(p => p.file === file);
                if (preview && preview.id === representativeImageId) {
                    // 새로 추가된 파일 중 대표 이미지가 있다면 그 인덱스를 찾음
                    repIndex = imageCounter; // 기존 이미지 뒤에 붙는 순서
                }
            imageCounter++;
        });

        // 대표 이미지 인덱스 설정 (전체 이미지 목록 기준)
        formData.append('representative_image_index', repIndex.toString());


        try {
            // PUT 요청으로 변경
            const response = await fetch(`http://localhost:8000/products/${productId}`, {
                method: 'PUT', // 메소드 변경
                body: formData,
                credentials: 'include',
                // 'Content-Type' 헤더는 FormData 사용 시 브라우저가 자동으로 설정하므로 제거
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || '상품 수정에 실패했습니다.');
            }

            const result = await response.json();
            alert('상품 정보가 성공적으로 수정되었습니다!');
            navigate(`/products/${result.product_id}`); // 수정된 상품 상세 페이지로 이동

        } catch (err) {
            console.error("상품 수정 중 오류 발생:", err);
            alert(err.message || '상품 수정 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };


    // --- 렌더링 ---
    if (loading) return <div>상품 정보를 불러오는 중...</div>;
    if (error) return <div>오류: {error}</div>;

    return (
    <>
        <Header user={user} handleLogout={handleLogout} />
        <div className="app-sell">
        <div className="sell-header">
            <h2>상품 정보 수정</h2>
            <p>상품 정보를 업데이트 해주세요.</p>
        </div>
        <div className="sell-container">
            <form onSubmit={handleFormSubmit} className="sell-form">
            {/* --- 이미지 섹션 --- */}
            <section className="form-section">
                <h2><PiImages className="section-icon" />상품 이미지 ({imagePreviews.length}/10)</h2>
                <p>첫 번째 이미지가 대표 이미지로 사용됩니다. 클릭하여 대표 이미지를 변경할 수 있습니다.</p>
                <div className="image-uploader">
                <label htmlFor="image-upload" className="image-upload-button">
                    <FaCamera />
                    <span>이미지 추가</span>
                </label>
                <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                />
                <div className="image-preview-grid">
                    {imagePreviews.map((preview) => (
                    <div
                        key={preview.id}
                        className={`image-preview-item ${preview.id === representativeImageId ? 'representative' : ''}`}
                        onClick={() => handleSetRepresentative(preview.id)} // 대표 이미지 설정 클릭 핸들러
                        style={{ cursor: 'pointer', border: preview.id === representativeImageId ? '3px solid #fac608' : '1px solid #e9ecef' }} // 대표 이미지 표시
                    >
                        <img src={preview.url} alt={`preview ${preview.id}`} />
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveImage(preview.id); }} className="remove-image-btn">
                            <FaTimes />
                        </button>
                        {preview.id === representativeImageId && <div className="representative-badge" style={{position: 'absolute', top: '5px', left: '5px', background: '#fac608', color: '#333', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold'}}>대표</div>}
                    </div>
                    ))}
                </div>
                </div>
            </section>

            {/* --- 기본 정보 섹션 --- */}
            <section className="form-section">
                <h2><GoTag className="section-icon" />기본 정보</h2>
                {/* 제목 */}
                <div className="sell-input-group">
                <label htmlFor="title">제목</label>
                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                {/* 카테고리 */}
                <div className="sell-input-group">
                <label htmlFor="category">카테고리</label>
                <select id="category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required >
                    {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                    ))}
                </select>
                </div>
                {/* 상품 상태 (Tag) */}
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
                {/* 판매 상태 (Status) */}
                <div className="sell-input-group">
                <label>판매 상태</label>
                    <div className="tag-radio-group">
                    {statusOptions.map(option => (
                        <label key={option.value} className="radio-label">
                        <input
                            type="radio"
                            name="status"
                            value={option.value}
                            checked={status === option.value}
                            onChange={(e) => setStatus(e.target.value)}
                        />
                        <span>{option.label}</span>
                        </label>
                    ))}
                    </div>
                </div>
            </section>

                {/* --- 가격 및 거래 정보 섹션 --- */}
                <section className="form-section">
                <h2><PiImages className="section-icon" />가격 및 거래 정보</h2>
                {/* 가격 */}
                <div className="sell-input-group">
                    <label htmlFor="price">가격</label>
                    <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} disabled={tag === 'FREE'} required />
                </div>
                {/* 거래 희망 지역 */}
                <div className="sell-input-group">
                    <label htmlFor="location">거래 희망 지역</label>
                    <div className="location-select-group">
                    <select id="city" value={selectedCity} onChange={handleCityChange}>
                        {cities.map(city => ( <option key={city} value={city}>{city}</option> ))}
                    </select>
                    <select id="district" value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} >
                        {locationData[selectedCity]?.map(district => ( <option key={district} value={district}>{district}</option> )) || <option value="">--</option>}
                    </select>
                    </div>
                </div>
                </section>

                {/* --- 상세 설명 섹션 (SellPage와 유사) --- */}
                <section className="form-section">
                <h2><PiImages className="section-icon" />상세 설명</h2>
                <div className="sell-input-group">
                    <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="10" required />
                </div>
                </section>

            {/* --- 제출 버튼 --- */}
            <button type="submit" className="sell-btn" disabled={submitting}>
                {submitting ? '수정 중...' : '상품 수정 완료'}
            </button>
            </form>
        </div>
        </div>
    </>
    );
};

export default ProductEditPage;