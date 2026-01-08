import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    const handleCreateWish = () => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();

        navigate('/create', {
            state: {
                sampleData: {
                    date: `${dd}/${mm}/${yyyy}`,
                    occasion: 'celebration'
                }
            }
        });
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    return (
        <header className="site-header">
            <div className="header-container">
                <div className="brand" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                    <div className="brand-logo">W</div>
                    <span className="brand-name">Wishyfi</span>
                </div>
                {!isLandingPage && (
                    <nav className="header-nav">
                        <a href="/#how-it-works" className="nav-link">How it works</a>
                        <a href="/#examples" className="nav-link">Examples</a>
                        <button
                            onClick={handleCreateWish}
                            className="btn-create-small"
                        >
                            Create a wish
                        </button>
                    </nav>
                )}
            </div>
        </header>
    );
};

export default Header;
