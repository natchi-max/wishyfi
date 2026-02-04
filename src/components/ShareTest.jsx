import React, { useState, useEffect } from 'react';
import { getShareSupport } from '../utils/shareUtils';

const ShareTest = () => {
    const [shareSupport, setShareSupport] = useState(null);
    const [testResult, setTestResult] = useState('');

    useEffect(() => {
        const support = getShareSupport();
        // Use setTimeout to avoid synchronous setState in effect
        setTimeout(() => {
            setShareSupport(support);
        }, 0);
        console.log('Share Support:', support);
    }, []);

    const createTestGif = () => {
        // Create a simple test GIF blob (1x1 pixel)
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, 1, 1);
        
        return new Promise(resolve => {
            canvas.toBlob(resolve, 'image/gif');
        });
    };

    const testFileShare = async () => {
        try {
            setTestResult('Creating test GIF...');
            const testBlob = await createTestGif();
            
            if (!testBlob) {
                setTestResult('❌ Failed to create test GIF');
                return;
            }

            setTestResult('Testing file share...');
            
            const file = new File([testBlob], 'test.gif', { type: 'image/gif' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file] });
                setTestResult('✅ File sharing works!');
            } else {
                setTestResult('❌ File sharing not supported');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                setTestResult('⚠️ Share cancelled by user');
            } else {
                setTestResult(`❌ Error: ${error.message}`);
            }
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Web Share API Test</h2>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3>Browser Support:</h3>
                {shareSupport && (
                    <ul>
                        <li>Web Share API: {shareSupport.hasWebShare ? '✅' : '❌'}</li>
                        <li>Can Share Check: {shareSupport.hasCanShare ? '✅' : '❌'}</li>
                        <li>File Sharing: {shareSupport.supportsFiles ? '✅' : '❌'}</li>
                        <li>Mobile Device: {shareSupport.isMobile ? '✅' : '❌'}</li>
                        <li>Chrome: {shareSupport.isChrome ? '✅' : '❌'}</li>
                        <li>Safari: {shareSupport.isSafari ? '✅' : '❌'}</li>
                        <li>Overall Support: {shareSupport.isSupported ? '✅' : '❌'}</li>
                    </ul>
                )}
            </div>

            <button 
                onClick={testFileShare}
                style={{
                    padding: '12px 24px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                Test GIF File Sharing
            </button>

            {testResult && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    background: testResult.includes('✅') ? '#d4edda' : testResult.includes('❌') ? '#f8d7da' : '#fff3cd',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }}>
                    {testResult}
                </div>
            )}

            <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
                <p><strong>Note:</strong> File sharing works best on:</p>
                <ul>
                    <li>Mobile Chrome (Android)</li>
                    <li>Mobile Safari (iOS)</li>
                    <li>Some desktop browsers may download instead</li>
                </ul>
            </div>
        </div>
    );
};

export default ShareTest;