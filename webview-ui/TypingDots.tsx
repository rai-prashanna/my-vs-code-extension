import React, { useEffect, useState } from 'react';

export default function TypingDots() {
  return (
    <div className="flex items-center gap-2 text-color-secondary">
      <span>Typing</span>
      <span className="inline-flex gap-1">
        <Dot delay={0} />
        <Dot delay={120} />
        <Dot delay={240} />
      </span>
    </div>
  );
}

function Dot({ delay = 0 }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOn(v => !v), 400 + delay);
    return () => clearInterval(id);
  }, [delay]);
  return (
    <span
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: 999,
        transition: 'opacity 180ms ease',
        opacity: on ? 1 : 0.25,
      }}
      className="bg-current"
    />
  );
}