import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RamanujanDemo from './RamanujanDemo';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    // Add scroll animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe all sections and cards
        const elements = document.querySelectorAll('.step-card, .example-mini-card, .section-container, .preview-card');
        elements.forEach(el => observer.observe(el));

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        return () => {
            elements.forEach(el => observer.unobserve(el));
        };
    }, []);

    // Set page title for Landing Page only
    useEffect(() => {
        const originalTitle = document.title;
        document.title = "Some days are special. Some memories come only once.";
        return () => {
            document.title = originalTitle;
        };
    }, []);

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
        // Navigate to create with sample data - Alex's Birthday: 14/07/2000
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

    const handleExampleClick = (type) => {
        let sampleData = {};

        switch (type) {
            case 'Anniversary':
                sampleData = {
                    date: '14/02/2020',
                    occasion: 'anniversary',
                    recipientName: 'My Love'
                };
                break;
            case 'holidays':
                sampleData = {
                    date: '25/12/2024',
                    occasion: 'holiday',
                    recipientName: 'Everyone'
                };
                break;
            case 'Birthday':
            default:
                sampleData = {
                    date: '14/07/2000',
                    recipientName: 'Alex',
                    occasion: 'birthday'
                };
                break;
        }

        navigate('/create', { state: { sampleData } });
    };

    const handleWishAnimation = () => {
        navigate('/wish-animation', {
            state: {
                wishData: {
                    recipientName: 'Alex',
                    occasion: 'birthday'
                }
            }
        });
    };

    return (
        <div className="home-root">

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
                                WishyFi creates unique greetings from dates. Type a birthday or
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
                                <button
                                    onClick={handleWishAnimation}
                                    className="btn-sample"
                                    style={{ color: '#ec4899' }}
                                >
                                    See Animation ✨
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
                                    <span>✨ Preview</span>
                                    <span className="preview-date-badge">Birthday</span>
                                </div>
                                <div className="preview-grid-box">
                                    <p className="grid-label">For Alex</p>
                                    <p className="grid-date-display">14 · 07 · 2000</p>
                                    <div className="grid-display">
                                        {[14, 7, 20, 0, 1, 19, 11, 10, 9, 12, 8, 12, 17, 3, 2, 19].map((num, i) => (
                                            <div key={i} className={`grid-cell ${i < 4 ? 'highlight-row' : ''}`}>
                                                {num < 10 ? `0${num}` : num}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="grid-message">
                                        Every number in this grid is from the day you were born.
                                        Here's to another year filled with tiny, magical moments. 🎉
                                    </p>
                                </div>
                                <p className="preview-footer-note">
                                    💡 The first row shows the birthday date: 14 · 07 · 20 · 00
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
                                    key: "Birthday"
                                },
                                {
                                    title: "Anniversary",
                                    subtitle: "Celebrate the day it all began.",
                                    key: "Anniversary"
                                },
                                {
                                    title: "holidays",
                                    subtitle: "Turn 01·01 or 12·25 into art.",
                                    key: "holidays"
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
                                        {[14, 7, 20, 0, 1, 19, 11, 10, 9, 12, 8, 12, 17, 3, 2, 19].map((num, i) => (
                                            <div key={i} className="mini-grid-cell">{num < 10 ? `0${num}` : num}</div>
                                        ))}
                                    </div>
                                    <div className="example-card-action">
                                        <button
                                            className="btn-example-try"
                                            onClick={() => handleExampleClick(card.key)}
                                        >
                                            Try This
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Ramanujan Demo */}
                <section id="how-it-works" className="construction-section">
                    <div className="section-container">
                        <h2 className="section-title">How the Magic Works</h2>
                        <p className="section-subtitle">
                            Watch how any date becomes a perfect magic square using Ramanujan's mathematical formula
                        </p>
                        <RamanujanDemo />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;
