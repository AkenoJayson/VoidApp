// backgrounds/index.js
// Central export file for all backgrounds

import liquidGlass from './liquidGlass';
import cleanChart from './cleanChart';
import darkMode from './darkMode';
import gradientMesh from './gradientMesh';
import subtlePattern from './subtlePattern';
import vortex from './vortex';

export const backgrounds = {
    liquidGlass,
    cleanChart,
    darkMode,
    gradientMesh,
    subtlePattern,
    vortex,
    default: darkMode // Fallback background
};

// Global state to track which component background is active
let activeComponentBackground = null;

export const applyBackground = (type) => {
    const body = document.body;
    const bg = backgrounds[type] || backgrounds.default;

    // Clear all previous background styles
    body.style.background = '';
    body.style.backgroundColor = '';
    body.style.backgroundImage = '';
    body.style.backgroundSize = '';
    body.style.backgroundPosition = '';
    body.style.color = '';
    body.style.minHeight = '';
    body.style.boxShadow = '';
    body.style.textShadow = '';
    body.style.position = '';

    // Store if this is a component-based background
    if (bg.isComponent) {
        activeComponentBackground = type;
    } else {
        activeComponentBackground = null;
    }

    // Apply new background styles (skip component-specific props)
    Object.keys(bg).forEach((key) => {
        if (key !== 'name' && key !== 'description' && key !== 'overlay' && key !== 'isComponent' && key !== 'componentProps') {
            body.style[key] = bg[key];
        }
    });
};

export const getBackgroundInfo = (type) => {
    const bg = backgrounds[type];
    if (!bg) return null;

    return {
        name: bg.name,
        description: bg.description,
        isComponent: bg.isComponent || false,
        componentProps: bg.componentProps || null
    };
};

export const getActiveComponentBackground = () => {
    if (!activeComponentBackground) return null;
    return getBackgroundInfo(activeComponentBackground);
};
