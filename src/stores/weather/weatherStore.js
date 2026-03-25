import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

const WMO_CODES = {
    0: 'Clear Sky',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    80: 'Rain Showers',
    81: 'Rain Showers',
    82: 'Violent Rain Showers',
    85: 'Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm',
    99: 'Thunderstorm'
};

const WMO_ICONS = {
    0: '☀️',
    1: '🌤️',
    2: '⛅',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌦️',
    53: '🌦️',
    55: '🌧️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    71: '🌨️',
    73: '🌨️',
    75: '🌨️',
    80: '🌦️',
    81: '🌧️',
    82: '⛈️',
    85: '🌨️',
    86: '🌨️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️'
};

export const useWeatherStore = defineStore(
    'weather',
    () => {
        const temperature = ref(null);
        const condition = ref(null);
        const icon = ref(null);
        const city = ref(null);
        const coords = ref(null);
        const loading = ref(false);
        const error = ref(null);
        const lastFetched = ref(null);

        const display = computed(() => ({
            temperature: temperature.value !== null ? `${Math.round(temperature.value)}°C` : '--',
            condition: condition.value || 'Unknown',
            icon: icon.value || '🌡️',
            city: city.value || 'Unknown'
        }));

        async function resolveCity(lat, lng) {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
                const data = await res.json();
                const address = data.address;
                const place = address.city || address.town || address.village || address.county;
                const country = address.country_code?.toUpperCase();
                return place && country ? `${place}, ${country}` : null;
            } catch {
                return null;
            }
        }

        async function fetchWeather() {
            // Data is still fresh — render from persisted state, no API call needed
            if (lastFetched.value && Date.now() - lastFetched.value < 30 * 60 * 1000) return;

            loading.value = true;
            error.value = null;

            try {
                let latitude, longitude;

                if (coords.value) {
                    // Coords already persisted — no permission prompt
                    ({ latitude, longitude } = coords.value);
                } else {
                    // First time ever — ask for permission once
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    ({ latitude, longitude } = position.coords);
                    coords.value = { latitude, longitude };
                }

                const [weatherRes, resolvedCity] = await Promise.all([
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,windspeed_10m&temperature_unit=celsius`),
                    city.value ? Promise.resolve(city.value) : resolveCity(latitude, longitude)
                ]);

                const weather = await weatherRes.json();
                const code = weather.current.weathercode;
                const wind = weather.current.windspeed_10m;

                temperature.value = weather.current.temperature_2m;
                condition.value = wind > 40 ? 'Strong Winds' : (WMO_CODES[code] ?? 'Unknown');
                icon.value = wind > 40 ? '💨' : (WMO_ICONS[code] ?? '🌡️');
                city.value = resolvedCity || city.value;
                lastFetched.value = Date.now();
            } catch (err) {
                error.value = err.code === 1 ? 'Location access denied' : 'Could not fetch weather';
            } finally {
                loading.value = false;
            }
        }

        return { temperature, condition, icon, city, coords, loading, error, display, fetchWeather };
    },
    {
        persist: {
            key: 'weather-store',
            pick: ['coords', 'temperature', 'condition', 'icon', 'city', 'lastFetched']
        }
    }
);
