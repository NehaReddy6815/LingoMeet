import React, { useEffect, useState, useRef } from 'react';
import socket from '../socket';

export default function LiveSubtitles({ maxLines = 200 }) {
  const [lines, setLines] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    const onSubtitle = (payload) => {
      // payload: { userId, translatedText, sourceLang, targetLang }
      const item = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
        userId: payload.userId,
        text: payload.translatedText || payload.text || '',
        sourceLang: payload.sourceLang,
        targetLang: payload.targetLang,
        timestamp: new Date().toLocaleTimeString(),
        speakerName: payload.speakerName || 'Speaker'
      };

      setLines(prev => {
        const next = [...prev, item].slice(-maxLines);
        return next;
      });
    };

    socket.on('subtitle', onSubtitle);
    return () => socket.off('subtitle', onSubtitle);
  }, [maxLines]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [lines]);

  return (
    <div className="w-full h-full flex flex-col">
      <div ref={listRef} className="overflow-auto p-2 space-y-2 flex-1">
        {lines.map(line => (
          <div key={line.id} className="bg-gray-800/60 rounded-md p-2">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold text-white">{line.speakerName}</span>
              <span className="text-xs text-purple-300">{(line.targetLang||'').toUpperCase()}</span>
              <span className="text-xs text-gray-400 ml-auto">{line.timestamp}</span>
            </div>
            <div className="text-gray-200">{line.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
