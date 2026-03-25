import AppLayout from '@/layout/AppLayout.vue';
import { middleware } from '@/router/middleware/middleware';
import { useNavigationStore } from '@/stores/navigation/navigationStore';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue'),
            meta: { trackVisit: false }
        },
        {
            path: '/',
            component: AppLayout,
            children: [
                //Internal
                {
                    path: '/dash',
                    name: 'InternalDashboard',
                    component: () => import('@/views/dashboards/Internal.vue'),
                    meta: { trackVisit: false }
                },
                {
                    path: '/dashboard',
                    name: 'Dashboard',
                    component: () => import('@/views/dashboards/Minimal.vue'),
                    meta: { background: 'darkMode', trackVisit: false }
                },
                {
                    path: '/pages/empty',
                    name: 'empty',
                    component: () => import('@/views/pages/Empty.vue'),
                    meta: { trackVisit: false }
                },
                //HomeServer
                {
                    path: '/homeserver/hub',
                    name: 'App Hub',
                    component: () => import('@/views/homeserver/hub/AppHub.vue')
                },
                {
                    path: '/homeserver/apps',
                    name: 'Web Apps',
                    component: () => import('@/views/homeserver/apps/Apps.vue')
                },
                //Budget
                {
                    path: '/budget/hub',
                    name: 'Budget Hub',
                    component: () => import('@/views/budget/hub/BudgetHub.vue')
                },
                {
                    path: '/budget/transactions',
                    name: 'Transactions',
                    component: () => import('@/views/budget/transaction/Transactions.vue')
                },
                {
                    path: '/budget/transactioncategories',
                    name: 'Transaction Categories',
                    component: () => import('@/views/budget/transaction/TransactionCategories.vue')
                },
                {
                    path: '/budget/transactionreports',
                    name: 'Transaction Reports',
                    component: () => import('@/views/budget/transaction/TransactionReports.vue')
                },
                {
                    path: '/budget/shoppingbudget',
                    name: 'Shopping Budgets',
                    component: () => import('@/views/budget/ShoppingBudget.vue')
                },
                {
                    path: '/budget/shoppingitems',
                    name: 'Shopping Items',
                    component: () => import('@/views/budget/ShoppingBudgetItems.vue')
                },
                {
                    path: '/budget/shoppinglistitems',
                    name: 'Shopping List Items',
                    component: () => import('@/views/budget/shopping/ShoppingListItems.vue')
                },
                {
                    path: '/budget/shoppinglist',
                    name: 'Shopping List',
                    component: () => import('@/views/budget/shopping/ShoppingLists.vue')
                },
                {
                    path: '/budget/accounts',
                    name: 'Accounts',
                    component: () => import('@/views/dashboards/Banking.vue')
                },
                //Management
                {
                    path: '/management/hub',
                    name: 'Management Hub',
                    component: () => import('@/views/management/hub/ManagementHub.vue')
                },
                {
                    path: '/management/calendar',
                    name: 'Calendar',
                    component: () => import('@/views/management/calendar/Calendar.vue')
                },
                {
                    path: '/management/wishlist',
                    name: 'Wish List',
                    component: () => import('@/views/management/wishlist/Wishlist.vue')
                },
                //Media Library
                {
                    path: '/ytdlp/login',
                    name: 'YTLogin',
                    component: () => import('@/views/yt-dlp/auth/Login.vue'),
                    meta: { trackVisit: false }
                },
                {
                    path: '/ytdlp',
                    name: 'YTMainScreen',
                    component: () => import('@/views/yt-dlp/home/Main.vue')
                },
                //Testing
                {
                    path: '/user/map',
                    name: 'Map',
                    component: () => import('@/views/user/Map.vue')
                }
            ]
        },

        // {
        //     path: '/landing',
        //     name: 'landing',
        //     component: () => import('@/views/pages/Landing.vue')
        // },
        {
            path: '/pages/notfound',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue'),
            meta: { trackVisit: false }
        },
        {
            path: '/auth/access',
            name: 'accessDenied',
            component: () => import('@/views/pages/auth/Access.vue'),
            meta: { trackVisit: false }
        },
        {
            path: '/error',
            name: 'error',
            component: () => import('@/views/pages/Error.vue'),
            meta: { trackVisit: false }
        },
        // {
        //     path: '/auth/register',
        //     name: 'register',
        //     component: () => import('@/views/pages/auth/Register.vue')
        // },
        // {
        //     path: '/auth/forgotpassword',
        //     name: 'forgotpassword',
        //     component: () => import('@/views/pages/auth/ForgotPassword.vue')
        // },
        // {
        //     path: '/auth/newpassword',
        //     name: 'newpassword',
        //     component: () => import('@/views/pages/auth/NewPassword.vue')
        // },
        // {
        //     path: '/auth/verification',
        //     name: 'verification',
        //     component: () => import('@/views/pages/auth/Verification.vue')
        // },
        // {
        //     path: '/auth/lockscreen',
        //     name: 'lockscreen',
        //     component: () => import('@/views/pages/auth/LockScreen.vue')
        // },
        {
            path: '/:pathMatch(.*)*',
            name: 'notfound',
            component: () => import('@/views/pages/NotFound.vue'),
            meta: { trackVisit: false }
        }
    ],
    scrollBehavior() {
        return { left: 0, top: 0 };
    }
});
router.beforeEach(middleware);

router.afterEach((to) => {
    if (to.meta?.trackVisit === false) return;
    const navigationStore = useNavigationStore();
    navigationStore.recordVisit(to);
});

export default router;
