import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    const handleStartToday = () => {
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

    const handleSampleBirthday = () => {
        // Navigate to create with sample data
        navigate('/create', {
            state: {
                sampleData: {
                    date: '14/07/2000',
                    recipientName: 'Alex',
                    occasion: 'birthday'
                }
            }
        });
    };

    return (
        <div className="home-root">
            {/* Header */}
            <header className="home-header">
                <div className="header-container">
                    <div className="brand">
                        <div className="brand-logo">W</div>
                        <span className="brand-name">Wishyfi</span>
                    </div>
                    <nav className="header-nav">
                        <a href="#how-it-works" className="nav-link">How it works</a>
                        <a href="#examples" className="nav-link">Examples</a>
                        <button
                            onClick={handleStartToday}
                            className="btn-create-small"
                        >
                            Create a wish
                        </button>
                    </nav>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section className="hero-section">
                    <div className="hero-container">
                        {/* Left column */}
                        <div className="hero-content">
                            <p className="hero-tag">
                                Date‑coded wishes · Birthday · Holidays
                            </p>
                            <h1 className="hero-title">
                                Turn any date into a <span className="highlight-underline">personalized wish grid</span>.
                            </h1>
                            <p className="hero-description">
                                Wishyfi creates unique greetings from dates. Type a birthday or
                                special occasion, get a beautiful number grid, and share it
                                instantly with friends and family.
                            </p>
                            <div className="hero-actions" id="start">
                                <button
                                    onClick={handleStartToday}
                                    className="btn-start"
                                >
                                    Start with today&apos;s date
                                </button>
                                <button
                                    onClick={handleSampleBirthday}
                                    className="btn-sample"
                                >
                                    Try a sample birthday →
                                </button>
                            </div>
                            <p className="hero-footer-note">
                                No sign‑up needed. Create and share in under 30 seconds.
                            </p>
                        </div>

                        {/* Right column: preview card */}
                        <div className="hero-preview">
                            <div className="preview-card">
                                <div className="preview-header">
                                    <span>Preview</span>
                                    <span>Birthday · 07 · 14 · 2026</span>
                                </div>
                                <div className="preview-grid-box">
                                    <p className="grid-label">For Alex</p>
                                    <div className="grid-display">
                                        {[30, 3, 20, 7, 8, 19, 0, 33, 1, 32, 9, 18, 21, 6, 31, 2].map((num, i) => (
                                            <div key={i} className="grid-cell">{num < 10 ? `0${num}` : num}</div>
                                        ))}
                                    </div>
                                    <p className="grid-message">
                                        Every number in this grid is from the day you were born.
                                        Here&apos;s to another year filled with tiny, magical moments.
                                    </p>
                                </div>
                                <p className="preview-footer-note">
                                    Change the date, recipient name, and message to instantly
                                    generate a new grid.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section id="how-it-works" className="how-it-works">
                    <div className="section-container">
                        <h2 className="section-title">How Wishyfi works</h2>
                        <p className="section-subtitle">
                            Turn any date into a shareable greeting in three quick steps.
                        </p>

                        <div className="steps-grid">
                            <div className="step-card">
                                <p className="step-number">1 · Pick a date</p>
                                <p className="step-title">Enter a birthday or special occasion.</p>
                                <p className="step-desc">
                                    Wishyfi converts the date into a clean numeric grid.
                                </p>
                            </div>

                            <div className="step-card">
                                <p className="step-number">2 · Personalize</p>
                                <p className="step-title">Add names and a short message.</p>
                                <p className="step-desc">
                                    Choose layout, colors, and occasion style.
                                </p>
                            </div>

                            <div className="step-card">
                                <p className="step-number">3 · Share</p>
                                <p className="step-title">Download or share a link.</p>
                                <p className="step-desc">
                                    Send it over WhatsApp, email, or social media in one tap.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Examples */}
                <section id="examples" className="examples">
                    <div className="section-container">
                        <h2 className="section-title">Built for every occasion</h2>
                        <p className="section-subtitle">
                            Use date grids for birthdays, holidays, milestones, and more.
                        </p>

                        <div className="examples-grid">
                            {[
                                {
                                    title: "Birthday",
                                    subtitle: "Make their date of birth the hero.",
                                },
                                {
                                    title: "Anniversary",
                                    subtitle: "Celebrate the day it all began.",
                                },
                                {
                                    title: "New Year & holidays",
                                    subtitle: "Turn 01·01 or 12·25 into art.",
                                },
                            ].map((card) => (
                                <div
                                    key={card.title}
                                    className="example-mini-card"
                                >
                                    <div>
                                        <p className="example-mini-title">{card.title}</p>
                                        <p className="example-mini-subtitle">
                                            {card.subtitle}
                                        </p>
                                    </div>
                                    <div className="mini-grid">
                                        {[14, 7, 20, 0, 1, 19, 11, 9, 10, 8, 13, 11, 17, 12, 4, 11].map((num, i) => (
                                            <div key={i} className="mini-grid-cell">{num < 10 ? `0${num}` : num}</div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="home-footer">
                <div className="footer-container">
                    <p>
                        © {new Date().getFullYear()} Wishyfi. Made for meaningful wishes.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
