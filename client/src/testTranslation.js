import React, { useState } from 'react';
import { translateText } from './services/lingoService';

export default function TestTranslation() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    const translated = await translateText(input, 'en', 'es');
    setOutput(translated);
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Test Lingo.dev Translation</h2>
      <textarea 
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text in English"
        rows={4}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <button onClick={handleTranslate} disabled={loading}>
        {loading ? 'Translating...' : 'Translate to Spanish'}
      </button>
      {output && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
          <strong>Translation:</strong> {output}
        </div>
      )}
    </div>
  );
}