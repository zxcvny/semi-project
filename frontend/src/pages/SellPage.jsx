import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { FaCamera } from 'react-icons/fa';
import { PiImages } from "react-icons/pi";
import { GoTag } from "react-icons/go";

import Header from '../components/layout/Header'

import '../styles/SellPage.css'

const SellPage = ({ user, handleLogout, isAuthReady }) => {

  const navigate = useNavigate();
  const alertShown = useRef(false);

  // 로그인 상태 확인
  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!user && !alertShown.current) {
      alertShown.current = true;
      if (window.confirm('로그인이 필요한 서비스입니다. 로그인하시겠습니까?')) {
        navigate('/login');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, isAuthReady]);

  return (
    <>
      <Header user={user} handleLogout={handleLogout} />
      <div className="app-sell">
        <div className="sell-header">
          <h2>판매할 상품을 등록해보세요</h2>
          <p>상품 정보를 자세히 입력할수록 빠르게 판매할 수 있어요</p>
        </div>
        <div className="sell-container">
          <form className="sell-form">
            <section className="form-section">
              <h2><PiImages className="section-icon" />상품 이미지 (0/10)</h2>
              <p>이미지는 상품 등록 시 필수입니다. 첫 번째 이미지가 대표 이미지로 사용됩니다.</p>
              <div className="image-uploader">
                <label htmlFor="image-upload" className="image-upload-button">
                  <FaCamera />
                  <span>이미지 등록</span>
                </label>
                <input
                  id="image-upload"
                  type="file"
                />
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
                />
              </div>
              <div className="sell-input-group">
                <label htmlFor="category">카테고리</label>
                <select
                  id="category"
                  placeholder="예: 아이폰 14 Pro 256GB 실버 판매합니다"
                >
                </select>
              </div>
              <div className="sell-input-group">
                <label>상품 상태</label>
                {/* 선택 안함, 급매, 미개봉, 중고, 무료 나눔(무료나눔 선택 시 가격 0원 고정, 수정 불가) */}
              </div>
            </section>
            <section className="form-section">
              <h2><PiImages className="section-icon" />가격 및 거래 정보</h2>
              <div className="sell-input-group">
                <label htmlFor="price">가격</label>
              </div>
              <div className="sell-input-group">
                <label htmlFor="location">거래 희망 지역</label>
                {/* 구, 동 선택지 */}
              </div>
            </section>
            <section className="form-section">
              <h2><PiImages className="section-icon" />상세 설명</h2>
              <div className="sell-input-group">
                <textarea></textarea>
              </div>
            </section>
            <button type="submit" className="sell-btn"></button>
          </form>
        </div>
      </div>
    </>
  )
}

export default SellPage;