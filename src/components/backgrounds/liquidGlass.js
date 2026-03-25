// backgrounds/liquidGlass.js
// Perfect for: Dashboards, hero sections, modern landing pages
// Visual style: Frosted glass effect with gradient backdrop

export default {
    name: 'liquidGlass',
    description: 'Glassmorphism effect with vibrant gradient',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundAttachment: 'fixed',
    position: 'relative',

    // Additional styling that can be applied
    overlay: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
    }
};
