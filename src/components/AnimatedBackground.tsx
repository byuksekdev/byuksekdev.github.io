import React, { memo } from 'react';

const AnimatedBackground = memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-0 -left-40 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: 'var(--orb-1)' }} />
      <div className="absolute top-1/4 -right-40 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: 'var(--orb-2)' }} />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: 'var(--orb-3)' }} />
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

export default AnimatedBackground;