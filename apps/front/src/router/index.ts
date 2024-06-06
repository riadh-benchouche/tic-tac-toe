import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('@/views/auth/Login.vue')
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('@/views/auth/Register.vue')
        },
        {
            path: '/',
            name: 'home',
            component: HomeView
        },
        {
            path: '/chat',
            name: 'ChatView',
            component: HomeView,
            meta: {requiresAuth: true}
        },
        {
            path: '/profile',
            name: 'ProfileView',
            component: HomeView,
            meta: {requiresAuth: true}
        },
        {
            path: '/game/:id',
            name: 'GameView',
            component: () => import('@/views/game/Game.vue'),
            meta: {requiresAuth: true}
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('../views/NotFoundView.vue')
        }
    ]
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')

    if (to.matched.some(record => record.meta.requiresAuth) && token !== null) {
        return next({name: 'login'})
    }

    return next()
})
export default router
