<template>
    <div class="map-container">
        <!-- Header bar -->
        <div class="map-header">
            <div class="header-left">
                <span class="status-dot" :class="{ active: mapLoaded }"></span>
                <span class="header-title">TRACKING</span>
            </div>
            <div class="header-center">
                <span class="header-time">{{ currentTime }}</span>
            </div>
            <div class="header-right">
                <span class="header-label">LIVE</span>
            </div>
        </div>

        <!-- Map iframe -->
        <div class="map-wrapper">
            <div v-if="!mapLoaded" class="map-loading">
                <div class="loading-ring"></div>
                <span class="loading-text">ACQUIRING SIGNAL</span>
            </div>
            <iframe :src="mapUrl" class="map-frame" :class="{ visible: mapLoaded }" frameborder="0" allowfullscreen @load="onMapLoad" />
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    token: {
        type: String,
        required: true,
        default: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJjZTBhMjg4MjZhZjA0MTE1YWE4NjQ0NjJmNTNjMzA4NSIsImlhdCI6MTc3MzAzODU3NSwiZXhwIjoyMDg4Mzk4NTc1fQ.Swm2K12ub8Vb7159aaywyPAjDS3tJ5DSGT1k9rzmqxU'
    },
    haUrl: {
        type: String,
        default: 'https://ha.voidtech.uk'
    }
});

const mapLoaded = ref(false);
const currentTime = ref('');

const mapUrl = computed(() => `${props.haUrl}/ha-auth?token=${props.token}`);

const onMapLoad = () => {
    mapLoaded.value = true;
};

let clockInterval = null;

const updateTime = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('en-ZA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

onMounted(() => {
    updateTime();
    clockInterval = setInterval(updateTime, 1000);
});

onUnmounted(() => {
    clearInterval(clockInterval);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@300;400;600&display=swap');

.map-container {
    width: 90vw;
    height: 85vh;
    background: #080c10;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-family: 'Rajdhani', sans-serif;
}

/* ── Header ── */
.map-header {
    height: 48px;
    min-height: 48px;
    background: #0a0f14;
    border-bottom: 1px solid #1a3a2a;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    position: relative;
    z-index: 10;
}

.map-header::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #00ff6a33, transparent);
}

.header-left,
.header-right {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 120px;
}

.header-right {
    justify-content: flex-end;
}

.status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #333;
    transition: background 0.5s;
}

.status-dot.active {
    background: #00ff6a;
    box-shadow: 0 0 8px #00ff6a;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.4;
    }
}

.header-title {
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    letter-spacing: 4px;
    color: #00ff6a;
}

.header-center {
    font-family: 'Share Tech Mono', monospace;
    font-size: 15px;
    color: #4a9a6a;
    letter-spacing: 3px;
}

.header-label {
    font-family: 'Share Tech Mono', monospace;
    font-size: 10px;
    letter-spacing: 3px;
    color: #ff4444;
    animation: blink 1.5s step-end infinite;
}

@keyframes blink {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0;
    }
}

/* ── Map ── */
.map-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.map-loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    background: #080c10;
    z-index: 5;
}

.loading-ring {
    width: 48px;
    height: 48px;
    border: 2px solid #1a3a2a;
    border-top-color: #00ff6a;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-text {
    font-family: 'Share Tech Mono', monospace;
    font-size: 11px;
    letter-spacing: 4px;
    color: #2a6a4a;
    animation: pulse 1.5s infinite;
}

.map-frame {
    width: 100%;
    height: 100%;
    border: none;
    opacity: 0;
    transition: opacity 0.6s ease;
}

.map-frame.visible {
    opacity: 1;
}
</style>
