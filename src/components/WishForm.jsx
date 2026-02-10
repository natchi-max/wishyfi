import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRandomTemplate } from '../utils/templates';
import { OCCASION_CATEGORIES } from '../utils/imageGenerator';
import './WishForm.css';

const WishForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialData = location.state?.wishData || location.state?.sampleData || null;

    // Get today's date in DD/MM/YYYY format
    const getTodayDate = () => {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const [formData, setFormData] = useState({
        occasion: initialData?.occasion || 'birthday',
        customOccasion: initialData?.customOccasion || '',
        greetingTitle: initialData?.greetingTitle || 'Happy Birthday!',
        recipientName: initialData?.recipientName || '',
        senderName: initialData?.senderName || '',
        date: initialData?.date || getTodayDate(), // Prepopulate with today's date
        message: initialData?.message || '',
        colorHighlight: initialData?.colorHighlight || '#667eea',
        colorBg: initialData?.colorBg || '#ffffff',
        selectedTheme: initialData?.selectedTheme || 'main',
        themeImage: initialData?.themeImage || null
    });

    const [errors, setErrors] = useState({});
    const [occasionSearch, setOccasionSearch] = useState('');
    const [showOccasionDropdown, setShowOccasionDropdown] = useState(false);

    // Build flat list of all occasions for searching
    const allOccasions = useMemo(() => {
        const list = [];
        for (const [category, items] of Object.entries(OCCASION_CATEGORIES)) {
            items.forEach(item => {
                list.push({ ...item, category });
            });
        }
        list.push({ key: 'other', label: '✨ Other (Custom)', category: 'Custom' });
        return list;
    }, []);

    // Filter occasions based on search
    const filteredOccasions = useMemo(() => {
        if (!occasionSearch.trim()) return allOccasions;
        const search = occasionSearch.toLowerCase();
        return allOccasions.filter(occ =>
            occ.label.toLowerCase().includes(search) ||
            occ.key.toLowerCase().includes(search) ||
            occ.category.toLowerCase().includes(search)
        );
    }, [occasionSearch, allOccasions]);

    // Get current occasion label
    const currentOccasionLabel = useMemo(() => {
        const found = allOccasions.find(o => o.key === formData.occasion);
        return found ? found.label : 'Select Occasion';
    }, [formData.occasion, allOccasions]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Validate date format and value
    const validateDate = (dateString) => {
        if (!dateString) {
            return 'Please select a date';
        }

        const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dateRegex.test(dateString)) {
            return 'Date must be in DD/MM/YYYY format';
        }

        const [d, m, y] = dateString.split('/').map(Number);
        const dt = new Date(y, m - 1, d);

        if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) {
            return 'Please enter a valid real date';
        }

        return '';
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.greetingTitle.trim()) {
            newErrors.greetingTitle = 'Please enter a greeting title';
        }

        if (!formData.recipientName.trim()) {
            newErrors.recipientName = 'Please enter recipient name';
        }

        if (!formData.senderName.trim()) {
            newErrors.senderName = 'Please enter your name';
        }

        const dateError = validateDate(formData.date);
        if (dateError) {
            newErrors.date = dateError;
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
            navigate('/animation', { state: { wishData: formData } });
        }
    };

    const handleUseTemplate = () => {
        const found = allOccasions.find(o => o.key === formData.occasion);
        const label = found ? found.label.replace(/[^\w\s]/gi, '').trim() : '';

        // Get template data without using hooks in callback
        const template = getRandomTemplate(formData.occasion, label);
        if (template) {
            setFormData(prev => ({
                ...prev,
                message: template.message
            }));
        }
    };

    const handleBack = () => {
        navigate('/');
    };


    const selectOccasion = (key) => {
        const found = allOccasions.find(o => o.key === key);
        const label = found ? found.label : '';

        // Default greeting logic
        let defaultGreeting = `Happy ${label}!`;
        // Handle special cases without "Happy" prefix if needed, or rely on user edit
        if (key === 'sympathy') defaultGreeting = 'With Deepest Sympathy';
        if (key === 'getwellsoon') defaultGreeting = 'Get Well Soon!';
        if (key === 'thankyou') defaultGreeting = 'Thank You!';
        if (key === 'other') defaultGreeting = 'Best Wishes!';

        setFormData(prev => ({
            ...prev,
            occasion: key,
            greetingTitle: defaultGreeting
        }));
        setShowOccasionDropdown(false);
        setOccasionSearch('');
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
                        Fill in the details to create a personalized magical wish animation
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="wish-form">
                    {/* Occasion Selection with Search */}
                    <div className="form-group">
                        <label>🎉 Occasion Category</label>
                        <div className="occasion-selector">
                            <div
                                className="occasion-selected"
                                onClick={() => setShowOccasionDropdown(!showOccasionDropdown)}
                            >
                                <span>{currentOccasionLabel}</span>
                                <span className="dropdown-arrow">{showOccasionDropdown ? '▲' : '▼'}</span>
                            </div>

                            {showOccasionDropdown && (
                                <div className="occasion-dropdown">
                                    <input
                                        type="text"
                                        className="occasion-search"
                                        placeholder="🔍 Search occasions..."
                                        value={occasionSearch}
                                        onChange={(e) => setOccasionSearch(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="occasion-list">
                                        {filteredOccasions.length === 0 ? (
                                            <div className="occasion-no-results">No occasions found</div>
                                        ) : (
                                            filteredOccasions.map(occ => (
                                                <div
                                                    key={occ.key}
                                                    className={`occasion-item ${formData.occasion === occ.key ? 'active' : ''}`}
                                                    onClick={() => selectOccasion(occ.key)}
                                                >
                                                    <span className="occasion-label">{occ.label}</span>
                                                    <span className="occasion-category">{occ.category}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Title Input */}
                        <div className="mt-md mb-md">
                            <label htmlFor="greetingTitle">✨ Greeting Title (Card Header)</label>
                            <input
                                type="text"
                                id="greetingTitle"
                                name="greetingTitle"
                                value={formData.greetingTitle}
                                onChange={handleChange}
                                placeholder="e.g. Happy Birthday! or Pongal Vazhthukkal!"
                                className={`form-input ${errors.greetingTitle ? 'error' : ''}`}
                            />
                            {errors.greetingTitle && (
                                <span className="error-message">{errors.greetingTitle}</span>
                            )}
                        </div>

                        {formData.occasion === 'other' && (
                            <div className="custom-occasion-input">
                                <input
                                    type="text"
                                    placeholder="Describe your occasion..."
                                    value={formData.customOccasion}
                                    onChange={(e) => setFormData(prev => ({ ...prev, customOccasion: e.target.value }))}
                                    className="form-input"
                                />
                            </div>
                        )}
                        {/* Theme & Background Selection */}
                        {formData.occasion && formData.occasion !== 'other' && (
                            <div className="theme-selection">
                                <div className="preview-label">🎨 Choose Theme & Background</div>

                                {/* Theme Options - Strictly relevant to occasion */}
                                <div className="theme-options-simple">
                                    {/* Main occasion image */}
                                    <div
                                        className={`theme-option-large ${formData.selectedTheme === 'main' || !formData.selectedTheme ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            selectedTheme: 'main',
                                            themeImage: `/images/festivals/${prev.occasion}.png`
                                        }))}
                                    >
                                        <img
                                            src={`/images/festivals/${formData.occasion === 'namingceremony' ? 'babyshower' : formData.occasion}.png`}
                                            alt={currentOccasionLabel}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="theme-fallback-large">
                                            <span className="fallback-emoji">✨</span>
                                            <span className="fallback-text">Official Theme</span>
                                        </div>
                                        <span className="theme-label-large">Classic {currentOccasionLabel}</span>
                                    </div>

                                    {/* Sub-theme / Variation for specific occasions */}
                                    {(formData.occasion === 'birthday' || formData.occasion === 'anniversary') && (
                                        <div
                                            className={`theme-option-large ${formData.selectedTheme === 'alternate' ? 'active' : ''}`}
                                            onClick={() => setFormData(prev => ({
                                                ...prev,
                                                selectedTheme: 'alternate',
                                                themeImage: `/images/festivals/${prev.occasion === 'birthday' ? 'party' : 'love'}.png`
                                            }))}
                                        >
                                            <img
                                                src={`/images/festivals/${formData.occasion === 'birthday' ? 'party' : 'love'}.png`}
                                                alt="Variation"
                                                onError={(e) => e.target.style.display = 'none'}
                                            />
                                            <span className="theme-label-large">Elegant Style</span>
                                        </div>
                                    )}

                                    {/* Gradient only option */}
                                    <div
                                        className={`theme-option-large gradient-option-large ${formData.selectedTheme === 'gradient' ? 'active' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, selectedTheme: 'gradient', themeImage: null }))}
                                        style={{ background: `linear-gradient(135deg, ${formData.colorBg}, ${formData.colorHighlight})` }}
                                    >
                                        <span className="gradient-icon-large">🌈</span>
                                        <span className="theme-label-large">Minimalist Art</span>
                                    </div>
                                </div>

                                {/* Background Color Options */}
                                <div className="bg-color-section">
                                    <div className="color-label">🎨 Background Color</div>
                                    <div className="color-options">
                                        {[
                                            { name: 'White', color: '#ffffff' },
                                            { name: 'Cream', color: '#fef9e7' },
                                            { name: 'Pink', color: '#fff0f5' },
                                            { name: 'Lavender', color: '#f3e8ff' },
                                            { name: 'Sky', color: '#e0f2fe' },
                                            { name: 'Mint', color: '#ecfdf5' },
                                            { name: 'Dark', color: '#1a1a2e' }
                                        ].map(opt => (
                                            <div
                                                key={opt.color}
                                                className={`color-swatch ${formData.colorBg === opt.color ? 'active' : ''}`}
                                                style={{ backgroundColor: opt.color }}
                                                onClick={() => setFormData(prev => ({ ...prev, colorBg: opt.color }))}
                                                title={opt.name}
                                            />
                                        ))}
                                        <input
                                            type="color"
                                            value={formData.colorBg}
                                            onChange={(e) => setFormData(prev => ({ ...prev, colorBg: e.target.value }))}
                                            className="color-picker-mini"
                                            title="Custom Color"
                                        />
                                    </div>
                                </div>

                                {/* Highlight Color Options */}
                                <div className="bg-color-section">
                                    <div className="color-label">✨ Accent Color</div>
                                    <div className="color-options">
                                        {[
                                            { name: 'Purple', color: '#667eea' },
                                            { name: 'Rose', color: '#ec4899' },
                                            { name: 'Gold', color: '#f59e0b' },
                                            { name: 'Emerald', color: '#10b981' },
                                            { name: 'Blue', color: '#3b82f6' },
                                            { name: 'Red', color: '#ef4444' },
                                            { name: 'Teal', color: '#14b8a6' }
                                        ].map(opt => (
                                            <div
                                                key={opt.color}
                                                className={`color-swatch ${formData.colorHighlight === opt.color ? 'active' : ''}`}
                                                style={{ backgroundColor: opt.color }}
                                                onClick={() => setFormData(prev => ({ ...prev, colorHighlight: opt.color }))}
                                                title={opt.name}
                                            />
                                        ))}
                                        <input
                                            type="color"
                                            value={formData.colorHighlight}
                                            onChange={(e) => setFormData(prev => ({ ...prev, colorHighlight: e.target.value }))}
                                            className="color-picker-mini"
                                            title="Custom Color"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
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
                            placeholder="Recipient's Name"
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
                            placeholder="Your Name"
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
                                type="date"
                                id="date"
                                name="date"
                                value={(() => {
                                    // Convert DD/MM/YYYY to YYYY-MM-DD for date input
                                    const parts = formData.date.split('/');
                                    if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
                                        return `${parts[2]}-${parts[1]}-${parts[0]}`;
                                    }
                                    // Fallback to today's date in YYYY-MM-DD format
                                    return new Date().toISOString().split('T')[0];
                                })()}
                                onChange={(e) => {
                                    // Convert YYYY-MM-DD to DD/MM/YYYY
                                    const dateValue = e.target.value;
                                    if (dateValue) {
                                        const [year, month, day] = dateValue.split('-');
                                        const formattedDate = `${day}/${month}/${year}`;
                                        setFormData(prev => ({ ...prev, date: formattedDate }));
                                        // Clear error when user changes date
                                        if (errors.date) {
                                            setErrors(prev => ({ ...prev, date: '' }));
                                        }
                                    }
                                }}
                                className={errors.date ? 'error date-picker' : 'date-picker'}
                                required
                            />
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
                                onClick={handleUseTemplate}
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

                    <button type="submit" className="btn btn-primary btn-large btn-block mt-lg">
                        Create Animation ✨
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WishForm;
