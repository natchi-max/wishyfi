import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { wishTemplates, getRandomTemplate } from '../utils/templates';
import './WishForm.css';

const WishForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialData = location.state?.wishData || null;

    const [formData, setFormData] = useState({
        occasion: initialData?.occasion || 'birthday',
        customOccasion: initialData?.customOccasion || '',
        recipientName: initialData?.recipientName || '',
        senderName: initialData?.senderName || '',
        date: initialData?.date || '',
        message: initialData?.message || '',
        colorHighlight: initialData?.colorHighlight || '#667eea',
        colorBg: initialData?.colorBg || '#ffffff',
        animationStyle: initialData?.animationStyle || 'digital'
    });

    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [errors, setErrors] = useState({});

    const occasions = [
        { value: 'birthday', label: '🎂 Birthday', emoji: '🎂' },
        { value: 'anniversary', label: '💑 Anniversary', emoji: '💑' },
        { value: 'love', label: '❤️ Love', emoji: '❤️' },
        { value: 'wedding', label: '💍 Wedding', emoji: '💍' },
        { value: 'newyear', label: '🎆 New Year', emoji: '🎆' },
        { value: 'diwali', label: '🪔 Diwali', emoji: '🪔' },
        { value: 'christmas', label: '🎄 Christmas', emoji: '🎄' },
        { value: 'pongal', label: '🌾 Pongal', emoji: '🌾' },
        { value: 'eid', label: '☪️ Eid', emoji: '☪️' },
        { value: 'graduation', label: '🎓 Graduation', emoji: '🎓' },
        { value: 'other', label: '✨ Other', emoji: '✨' }
    ];

    const colorPresets = [
        { name: 'Pure Elegance', highlight: '#667eea', bg: '#ffffff' },
        { name: 'Classic Gold', highlight: '#d97706', bg: '#f8fafc' },
        { name: 'Warm Rose', highlight: '#db2777', bg: '#fff0f5' },
        { name: 'Mint Fresh', highlight: '#059669', bg: '#f0fdf4' },
        { name: 'Royal White', highlight: '#7c3aed', bg: '#faf5ff' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.recipientName.trim()) {
            newErrors.recipientName = 'Please enter recipient name';
        }

        if (!formData.senderName.trim()) {
            newErrors.senderName = 'Please enter your name';
        }

        if (!formData.date) {
            newErrors.date = 'Please select a date';
        } else {
            // Validate date format
            const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
            if (!dateRegex.test(formData.date)) {
                newErrors.date = 'Date must be in DD/MM/YYYY format';
            }
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Please enter a wish message';
        } else if (formData.message.length > 200) {
            newErrors.message = 'Message is too long (max 200 characters)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            const route = formData.animationStyle === 'digital' ? '/digital' : '/animate';
            navigate(route, { state: { wishData: formData } });
        }
    };

    const useTemplate = (occasion) => {
        const template = getRandomTemplate(occasion);
        if (template) {
            setFormData(prev => ({
                ...prev,
                message: template.message,
                colorHighlight: template.color
            }));
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    const handleDateInputChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

        // Format as DD/MM/YYYY
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        if (value.length >= 5) {
            value = value.slice(0, 5) + '/' + value.slice(5, 9);
        }

        setFormData(prev => ({
            ...prev,
            date: value
        }));

        if (errors.date) {
            setErrors(prev => ({
                ...prev,
                date: ''
            }));
        }
    };

    return (
        <div className="wish-form-page page">
            <div className="wish-form-container fade-in">
                <button className="back-button" onClick={handleBack}>
                    ← Back
                </button>

                <div className="form-header text-center mb-xl">
                    <h2 className="text-gradient">Create Your Magical Wish</h2>
                    <p className="text-secondary">
                        Fill in the details to generate a personalized Ramanujan magic square
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="wish-form">
                    {/* Occasion Selection - Dropdown */}
                    <div className="form-group">
                        <label htmlFor="occasion">🎉 Occasion</label>
                        <select
                            id="occasion"
                            name="occasion"
                            value={formData.occasion}
                            onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))}
                            className="form-select"
                        >
                            {occasions.map(occ => (
                                <option key={occ.value} value={occ.value}>
                                    {occ.label}
                                </option>
                            ))}
                        </select>

                        {/* Custom Occasion Input */}
                        {formData.occasion === 'other' && (
                            <div className="custom-occasion-input">
                                <input
                                    type="text"
                                    placeholder="Enter custom occasion (e.g., Holi, Valentine's Day)"
                                    value={formData.customOccasion}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customOccasion: e.target.value }))}
                                    className="form-input"
                                />
                            </div>
                        )}
                    </div>

                    {/* Animation Style Selection */}
                    <div className="form-group">
                        <label>Animation Style</label>
                        <div className="animation-style-selector">
                            <div 
                                className={`style-option ${formData.animationStyle === 'digital' ? 'active' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, animationStyle: 'digital' }))}
                            >
                                <div className="style-preview digital-preview">
                                    <div className="preview-grid">
                                        <div className="preview-cell highlight"></div>
                                        <div className="preview-cell"></div>
                                        <div className="preview-cell"></div>
                                        <div className="preview-cell"></div>
                                    </div>
                                </div>
                                <div className="style-info">
                                    <h4>Clean Reveal</h4>
                                    <p>Simple 8-step pattern reveal</p>
                                    <span className="style-badge new">NEW</span>
                                </div>
                            </div>
                            
                            <div 
                                className={`style-option ${formData.animationStyle === 'classic' ? 'active' : ''}`}
                                onClick={() => setFormData(prev => ({ ...prev, animationStyle: 'classic' }))}
                            >
                                <div className="style-preview classic-preview">
                                    <div className="preview-square">
                                        <div className="preview-sparkle">✨</div>
                                    </div>
                                </div>
                                <div className="style-info">
                                    <h4>Magic Square</h4>
                                    <p>Traditional animation with effects</p>
                                    <span className="style-badge">CLASSIC</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recipient Name */}
                    <div className="form-group">
                        <label htmlFor="recipientName">👤 Recipient Name</label>
                        <input
                            type="text"
                            id="recipientName"
                            name="recipientName"
                            value={formData.recipientName}
                            onChange={handleChange}
                            placeholder="e.g., Sanjeev"
                            className={errors.recipientName ? 'error' : ''}
                        />
                        {errors.recipientName && (
                            <span className="error-message">{errors.recipientName}</span>
                        )}
                    </div>

                    {/* Sender Name */}
                    <div className="form-group">
                        <label htmlFor="senderName">✍️ Your Name</label>
                        <input
                            type="text"
                            id="senderName"
                            name="senderName"
                            value={formData.senderName}
                            onChange={handleChange}
                            placeholder="e.g., Sanjeev"
                            className={errors.senderName ? 'error' : ''}
                        />
                        {errors.senderName && (
                            <span className="error-message">{errors.senderName}</span>
                        )}
                    </div>

                    {/* Special Date */}
                    <div className="form-group">
                        <label htmlFor="date">📅 Special Date</label>

                        <div className="date-input-container">
                            <input
                                type="text"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleDateInputChange}
                                onFocus={() => setShowDateDropdown(true)}
                                placeholder="30/03/2007"
                                maxLength="10"
                                className={errors.date ? 'error' : ''}
                            />
                            <button
                                type="button"
                                className="date-dropdown-btn"
                                onClick={() => setShowDateDropdown(!showDateDropdown)}
                            >
                                📅
                            </button>

                            {showDateDropdown && (
                                <div className="date-dropdown-panel">
                                    <select
                                        value={formData.date.split('/')[0] || ''}
                                        onChange={(e) => {
                                            const day = e.target.value;
                                            const parts = formData.date.split('/');
                                            const newDate = `${day.padStart(2, '0')}/${parts[1] || '01'}/${parts[2] || new Date().getFullYear()}`;
                                            setFormData(prev => ({ ...prev, date: newDate }));
                                        }}
                                        className="date-select-small"
                                    >
                                        <option value="">Day</option>
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={formData.date.split('/')[1] || ''}
                                        onChange={(e) => {
                                            const month = e.target.value;
                                            const parts = formData.date.split('/');
                                            const newDate = `${parts[0] || '01'}/${month.padStart(2, '0')}/${parts[2] || new Date().getFullYear()}`;
                                            setFormData(prev => ({ ...prev, date: newDate }));
                                        }}
                                        className="date-select-small"
                                    >
                                        <option value="">Month</option>
                                        {[
                                            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                                        ].map((month, i) => (
                                            <option key={i + 1} value={i + 1}>{month}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={formData.date.split('/')[2] || ''}
                                        onChange={(e) => {
                                            const year = e.target.value;
                                            const parts = formData.date.split('/');
                                            const newDate = `${parts[0] || ''}/${parts[1] || ''}/${year}`;
                                            setFormData(prev => ({ ...prev, date: newDate }));
                                            setShowDateDropdown(false);
                                        }}
                                        className="date-select-small"
                                    >
                                        <option value="">Year</option>
                                        {Array.from({ length: 50 }, (_, i) => 2024 - i).map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {errors.date && (
                            <span className="error-message">{errors.date}</span>
                        )}
                        <span className="helper-text">
                            This date will be embedded in the magic square
                        </span>
                    </div>

                    {/* Wish Message */}
                    <div className="form-group">
                        <div className="message-header">
                            <label htmlFor="message">💬 Wish Message</label>
                            <button
                                type="button"
                                className="template-btn"
                                onClick={() => useTemplate(formData.occasion)}
                                title="Get suggestion for this occasion"
                            >
                                ✨ Suggest
                            </button>
                        </div>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Write your heartfelt wish here..."
                            className={errors.message ? 'error' : ''}
                            rows="4"
                        />
                        <div className="message-meta">
                            {errors.message && (
                                <span className="error-message">{errors.message}</span>
                            )}
                            <span className="char-count">
                                {formData.message.length}/200
                            </span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>🎨 Quick Themes</label>
                        <div className="color-presets">
                            {colorPresets.map(preset => (
                                <div
                                    key={preset.name}
                                    className={`preset-item ${formData.colorHighlight === preset.highlight ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        colorHighlight: preset.highlight,
                                        colorBg: preset.bg
                                    }))}
                                >
                                    <button
                                        type="button"
                                        className="preset-btn"
                                        style={{
                                            '--p-highlight': preset.highlight,
                                            '--p-bg': preset.bg,
                                            border: formData.colorHighlight === preset.highlight ? '3px solid var(--accent-purple)' : '2px solid rgba(0,0,0,0.15)'
                                        }}
                                        title={preset.name}
                                    />
                                    <span className="preset-name">{preset.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group row-flex">
                        <div className="color-input-group">
                            <label htmlFor="colorHighlight">Highlight Color</label>
                            <input
                                type="color"
                                id="colorHighlight"
                                value={formData.colorHighlight}
                                onChange={(e) => setFormData({ ...formData, colorHighlight: e.target.value })}
                                className="color-picker"
                            />
                            <span className="helper-text">Click to customize</span>
                        </div>
                        <div className="color-input-group">
                            <label htmlFor="colorBg">Background Color</label>
                            <input
                                type="color"
                                id="colorBg"
                                value={formData.colorBg}
                                onChange={(e) => setFormData({ ...formData, colorBg: e.target.value })}
                                className="color-picker"
                            />
                            <span className="helper-text">Click to customize</span>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-large btn-block mt-lg">
                        Create Animation ✨
                    </button>
                </form>
            </div>

            <footer className="site-footer">
                <a href="http://wishyfi.com/" target="_blank" rel="noopener noreferrer">wishyfi.com</a>
            </footer>
        </div>
    );
};

export default WishForm;
