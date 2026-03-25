// backgrounds/subtlePattern.js
// Perfect for: Documentation, blogs, content-heavy pages, reading interfaces
// Visual style: Soft neutral with subtle texture pattern

export default {
    name: 'subtlePattern',
    description: 'Neutral background with subtle pattern for content focus',
    backgroundColor: '#f7f8fa',
    backgroundImage: `
    linear-gradient(30deg, #f0f1f3 12%, transparent 12.5%, transparent 87%, #f0f1f3 87.5%, #f0f1f3),
    linear-gradient(150deg, #f0f1f3 12%, transparent 12.5%, transparent 87%, #f0f1f3 87.5%, #f0f1f3),
    linear-gradient(30deg, #f0f1f3 12%, transparent 12.5%, transparent 87%, #f0f1f3 87.5%, #f0f1f3),
    linear-gradient(150deg, #f0f1f3 12%, transparent 12.5%, transparent 87%, #f0f1f3 87.5%, #f0f1f3)
  `,
    backgroundSize: '80px 140px',
    backgroundAttachment: 'fixed',
    backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px',
    minHeight: '100vh',
    color: '#2d3748'
};
