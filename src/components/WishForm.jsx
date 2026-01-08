import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { wishTemplates, getRandomTemplate } from '../utils/templates';
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
        recipientName: initialData?.recipientName || '',
        senderName: initialData?.senderName || '',
        date: initialData?.date || getTodayDate(), // Prepopulate with today's date
        message: initialData?.message || '',
        colorHighlight: initialData?.colorHighlight || '#667eea',
        colorBg: initialData?.colorBg || '#ffffff',
        selectedTheme: initialData?.selectedTheme || 'main',
        themeImage: initialData?.themeImage || null
    });

    const [isDateMetaEdited, setIsDateMetaEdited] = useState(!!initialData?.date);

    const [showDateDropdown, setShowDateDropdown] = useState(false);
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
            navigate('/animate', { state: { wishData: formData } });
        }
    };

    const useTemplate = (occasion) => {
        const found = allOccasions.find(o => o.key === occasion);
        const label = found ? found.label.replace(/[^\w\s]/gi, '').trim() : '';
        const template = getRandomTemplate(occasion, label);
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

    const handleDateInputChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');

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
        setIsDateMetaEdited(true);

        // Instant validation - validate as user types
        if (value.length === 10) {
            const dateError = validateDate(value);
            if (dateError) {
                setErrors(prev => ({
                    ...prev,
                    date: dateError
                }));
            } else {
                setErrors(prev => ({
                    ...prev,
                    date: ''
                }));
            }
        } else if (errors.date) {
            // Clear error if user is still typing
            setErrors(prev => ({
                ...prev,
                date: ''
            }));
        }
    };

    const selectOccasion = (key) => {
        setFormData(prev => ({ ...prev, occasion: key }));
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
                        <label>🎉 Occasion</label>
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

                    <button type="submit" className="btn btn-primary btn-large btn-block mt-lg">
                        Create Animation ✨
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WishForm;
