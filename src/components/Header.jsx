import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <header className="site-header">
            <div className="header-container">
                <div className="brand" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                    <div className="brand-logo">W</div>
                    <span className="brand-name">WishyFi</span>
                </div>
            </div>
        </header>
    );
};

export default Header;
