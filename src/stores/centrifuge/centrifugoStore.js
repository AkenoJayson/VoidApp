import { defineStore } from 'pinia';
import { Centrifuge } from 'centrifuge';
import CentrifugoService from '@/services/centrifuge/CentrifugoService';
import { emitter } from '@/services/global/eventBus';

export const useCentrifugoStore = defineStore('centrifugo', {
    state: () => ({
        centrifuge: null,
        subscription: null,
        isConnected: false
    }),
    actions: {
        async connect() {
            try {
                const response = await CentrifugoService.getToken();
                const centrifugoToken = response.data.token;

                this.centrifuge = new Centrifuge(import.meta.env.VITE_CENTRIFUGO_WS_URL, {
                    token: centrifugoToken
                });

                this.centrifuge.on('connecting', (ctx) => {});

                this.centrifuge.on('connected', (ctx) => {
                    this.isConnected = true;
                });

                this.centrifuge.on('disconnected', (ctx) => {
                    this.isConnected = false;
                });

                this.subscription = this.centrifuge.newSubscription('VoidNetwork');

                this.subscription.on('publication', (ctx) => {
                    emitter.emit('notification', ctx.data);
                });

                this.subscription.subscribe();
                this.centrifuge.connect();
            } catch (error) {
                console.error('Centrifugo connection failed:', error);
            }
        },

        disconnect() {
            if (this.centrifuge) {
                this.centrifuge.disconnect();
                this.centrifuge = null;
                this.subscription = null;
                this.isConnected = false;
            }
        }
    }
});
