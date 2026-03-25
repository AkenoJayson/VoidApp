import { useLoadingScreen } from '@/stores/LoadingScreenStore';
import { verifyLogin } from '@/services/axios/axiosVoidApiInstance';
import { applyBackground } from '@/components/backgrounds';

export async function middleware(to, from, next) {
    const loadingScreenStore = useLoadingScreen();
    loadingScreenStore.showLoading();

    const background = to.meta.background || 'default';
    applyBackground(background);

    const publicPages = ['/login', '/auth/access', '/auth/register', '/auth/forgotpassword'];

    const authRequired = !publicPages.includes(to.path);

    try {
        let loggedIn = false;
        try {
            loggedIn = await verifyLogin();
        } catch {
            loggedIn = false;
        }
        if (to.path === '/') {
            if (loggedIn) return next({ name: 'Dashboard' });
            return next({ name: 'login' });
        }
        if (authRequired && !loggedIn) {
            return next({ name: 'login' });
        }
        next();
    } catch (error) {
        next({
            name: 'error',
            query: { errormsg: `Problem occurred during site load. Issue: ${error.message}` }
        });
    } finally {
        loadingScreenStore.hideLoading();
    }
}
