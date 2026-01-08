import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
                                    <span>✨ Preview</span>
                                    <span className="preview-date-badge">Birthday</span>
                                </div>
                                <div className="preview-grid-box">
                                    <p className="grid-label">For Alex</p>
                                    <p className="grid-date-display">14 · 07 · 2000</p>
                                    <div className="grid-display">
                                        {[14, 7, 20, 0, 1, 19, 11, 10, 9, 12, 8, 13, 17, 3, 2, 18].map((num, i) => (
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
        </div>
    );
};

export default LandingPage;
