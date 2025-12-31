import React, { useState } from 'react';
import './WishForm.css';

const WishForm = ({ onSubmit, onBack }) => {
    const [formData, setFormData] = useState({
        occasion: 'birthday',
        recipientName: '',
        date: '',
        message: '',
        colorHighlight: '#4facfe',
        colorBg: '#0f172a'
    });

    const [errors, setErrors] = useState({});

    const occasions = [
        { value: 'birthday', label: '🎂 Birthday', emoji: '🎂' },
        { value: 'anniversary', label: '💑 Anniversary', emoji: '💑' },
        { value: 'newyear', label: '🎊 New Year', emoji: '🎊' },
        { value: 'wedding', label: '💒 Wedding', emoji: '💒' },
        { value: 'graduation', label: '🎓 Graduation', emoji: '🎓' },
        { value: 'other', label: '✨ Other', emoji: '✨' }
    ];

    const colorPresets = [
        { name: 'Magical Cyan', highlight: '#00f2fe', bg: '#05071a' },
        { name: 'Neon Pink', highlight: '#ff0080', bg: '#0f051d' },
        { name: 'Royal Purple', highlight: '#a855f7', bg: '#1a0533' },
        { name: 'Golden Sun', highlight: '#fee140', bg: '#1a0a0a' },
        { name: 'Emerald', highlight: '#22c55e', bg: '#061a12' }
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
            onSubmit(formData);
        }
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
                <button className="back-button" onClick={onBack}>
                    ← Back
                </button>

                <div className="form-header text-center mb-xl">
                    <h2 className="text-gradient">Create Your Magical Wish</h2>
                    <p className="text-secondary">
                        Fill in the details to generate a personalized Ramanujan magic square
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="wish-form">
                    {/* Occasion Selection */}
                    <div className="form-group">
                        <label htmlFor="occasion">🎉 Occasion</label>
                        <div className="occasion-grid">
                            {occasions.map(occ => (
                                <button
                                    key={occ.value}
                                    type="button"
                                    className={`occasion-btn ${formData.occasion === occ.value ? 'active' : ''}`}
                                    onClick={() => setFormData(prev => ({ ...prev, occasion: occ.value }))}
                                >
                                    <span className="occasion-emoji">{occ.emoji}</span>
                                    <span className="occasion-label">{occ.label.replace(occ.emoji + ' ', '')}</span>
                                </button>
                            ))}
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
                            placeholder="e.g., Kirthi"
                            className={errors.recipientName ? 'error' : ''}
                        />
                        {errors.recipientName && (
                            <span className="error-message">{errors.recipientName}</span>
                        )}
                    </div>

                    {/* Special Date */}
                    <div className="form-group">
                        <label htmlFor="date">📅 Special Date (DD/MM/YYYY)</label>
                        <input
                            type="text"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleDateInputChange}
                            placeholder="30/03/2007"
                            maxLength="10"
                            className={errors.date ? 'error' : ''}
                        />
                        {errors.date && (
                            <span className="error-message">{errors.date}</span>
                        )}
                        <span className="helper-text">
                            This date will be embedded in the magic square
                        </span>
                    </div>

                    {/* Wish Message */}
                    <div className="form-group">
                        <label htmlFor="message">💬 Wish Message</label>
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
                                <button
                                    key={preset.name}
                                    type="button"
                                    className="preset-btn"
                                    style={{
                                        '--p-highlight': preset.highlight,
                                        '--p-bg': preset.bg,
                                        border: formData.colorHighlight === preset.highlight ? '2px solid #fff' : '1px solid rgba(255,255,255,0.2)'
                                    }}
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        colorHighlight: preset.highlight,
                                        colorBg: preset.bg
                                    }))}
                                    title={preset.name}
                                />
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
