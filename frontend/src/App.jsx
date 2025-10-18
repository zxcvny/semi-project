import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import SellPage from './pages/SellPage'
import './styles/App.css'

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/sell" element={<SellPage />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App;