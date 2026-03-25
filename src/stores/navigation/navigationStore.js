import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useNavigationStore = defineStore(
    'navigation',
    () => {
        const visits = ref({});

        function recordVisit(route) {
            const key = route.path;
            const existing = visits.value[key];

            visits.value[key] = {
                path: key,
                name: route.name,
                count: existing ? existing.count + 1 : 1,
                lastVisited: new Date().toISOString()
            };
        }

        const topVisited = computed(() => {
            return Object.values(visits.value)
                .sort((a, b) => b.count - a.count || new Date(b.lastVisited) - new Date(a.lastVisited))
                .slice(0, 5);
        });

        return { visits, recordVisit, topVisited };
    },
    {
        persist: {
            key: 'navigation-store',
            pick: ['visits']
        }
    }
);
