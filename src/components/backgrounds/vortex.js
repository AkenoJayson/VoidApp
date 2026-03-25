// backgrounds/vortex.js
// Perfect for: Hero pages, creative portfolios, immersive landing pages
// Visual style: Animated particle vortex with flowing noise patterns
// Note: This is a component-based background that renders behind page content

export default {
    name: 'vortex',
    description: 'Animated particle vortex effect with simplex noise',
    isComponent: true, // Flag to indicate this is a component-based background

    // Props to pass to the Vortex component
    componentProps: {
        particleCount: 700,
        rangeY: 100,
        baseSpeed: 0.0,
        rangeSpeed: 1.5,
        baseRadius: 1,
        rangeRadius: 2,
        baseHue: 220,
        backgroundColor: '#000000'
    },

    // Body styles (minimal since component handles the visual)
    background: 'transparent',
    backgroundAttachment: 'fixed',
    minHeight: '100vh'
};
