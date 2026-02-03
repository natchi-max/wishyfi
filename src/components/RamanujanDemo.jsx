import React, { useState, useEffect } from 'react';
import './RamanujanDemo.css';

const RamanujanDemo = () => {
    const [date, setDate] = useState('22/12/1887');
    const [step, setStep] = useState(0);
    const [components, setComponents] = useState({ DD: 22, MM: 12, CC: 18, YY: 87 });

    useEffect(() => {
        const parts = date.split('/');
        if (parts.length === 3) {
            const DD = parseInt(parts[0]) || 0;
            const MM = parseInt(parts[1]) || 0;
            const YYYY = parseInt(parts[2]) || 0;
            const CC = Math.floor(YYYY / 100);
            const YY = YYYY % 100;
            setComponents({ DD, MM, CC, YY });
        }
    }, [date]);

    const { DD, MM, CC, YY } = components;
    
    const square = [
        [DD, MM, CC, YY],
        [YY + 1, CC - 1, MM - 3, DD + 3],
        [MM - 2, DD + 2, YY + 2, CC - 2],
        [CC + 1, YY - 1, DD + 1, MM - 1]
    ];

    const getCellClass = (r, c) => {
        if (step === 0) return 'empty';
        if (step === 1 && r === 0) {
            return c === 0 ? 'yellow' : c === 1 ? 'blue' : c === 2 ? 'orange' : 'green';
        }
        if (step === 2 && r === 1) {
            return c === 0 ? 'green' : c === 1 ? 'orange' : c === 2 ? 'blue' : 'yellow';
        }
        if (step === 3 && r === 2) {
            return c === 0 ? 'blue' : c === 1 ? 'yellow' : c === 2 ? 'green' : 'orange';
        }
        if (step === 4 && r === 3) {
            return c === 0 ? 'orange' : c === 1 ? 'green' : c === 2 ? 'yellow' : 'blue';
        }
        return 'empty';
    };

    const isVisible = (r, c) => {
        if (step === 0) return false;
        if (step === 1) return r === 0;
        if (step === 2) return r <= 1;
        if (step === 3) return r <= 2;
        return true;
    };

    return (
        <div className="ramanujan-demo">
            <h3>Enter your date of birth<br/>in DD-MM-CC-YY format<br/>below to create a Magic Square</h3>
            
            <input 
                type="text" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                placeholder="22/12/1887"
                className="date-input"
            />

            <div className="magic-grid">
                {square.map((row, r) => 
                    row.map((val, c) => (
                        <div 
                            key={`${r}-${c}`}
                            className={`cell ${getCellClass(r, c)} ${isVisible(r, c) ? 'visible' : ''}`}
                        >
                            {isVisible(r, c) && (
                                <>
                                    <span className="value">{val}</span>
                                    {step === 1 && r === 0 && (
                                        <span className="label">
                                            {c === 0 ? 'DD' : c === 1 ? 'MM' : c === 2 ? 'CC' : 'YY'}
                                        </span>
                                    )}
                                    {step === 2 && r === 1 && (
                                        <span className="formula">
                                            {c === 0 ? 'YY+1' : c === 1 ? 'CC-1' : c === 2 ? 'MM-3' : 'DD+3'}
                                        </span>
                                    )}
                                    {step === 3 && r === 2 && (
                                        <span className="formula">
                                            {c === 0 ? 'MM-2' : c === 1 ? 'DD+2' : c === 2 ? 'YY+2' : 'CC-2'}
                                        </span>
                                    )}
                                    {step === 4 && r === 3 && (
                                        <span className="formula">
                                            {c === 0 ? 'CC+1' : c === 1 ? 'YY-1' : c === 2 ? 'DD+1' : 'MM-1'}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            <div className="controls">
                <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>←</button>
                <button onClick={() => setStep(Math.min(4, step + 1))} disabled={step === 4}>→</button>
                <button onClick={() => setStep(0)}>Reset</button>
            </div>
        </div>
    );
};

export default RamanujanDemo;