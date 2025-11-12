import { createRouter, createWebHistory } from 'vue-router'
import { setupRouterGuards } from './guards'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('../layouts/LandingLayout.vue'),
            children: [
                {
                    path: '',
                    name: 'home',
                    component: () => import('../views/home/HomeView.vue'),
                    meta: { isPublic: true },
                },
                {
                    path: 'topics',
                    name: 'topics',
                    component: () => import('../views/home/TopicView.vue'),
                    meta: { isPublic: true },
                },
                {
                    path: 'topics/:id',
                    name: 'TopicTests',
                    component: () => import('@/views/home/components/TopicTestView.vue'),
                },
                {
                    path: 'tickets',
                    name: 'tickets',
                    component: () => import('../views/home/TicketView.vue'),
                    meta: { isPublic: true },
                },
                {
                    path: 'tickets/:id',
                    name: 'TicketTests',
                    component: () => import('@/views/home/components/TickerTestView.vue'),
                },
                {
                    path: 'exams',
                    name: 'exams',
                    component: () => import('../views/home/ExamsView.vue'),
                    meta: { isPublic: true },
                },
            ],
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/auth/Index.vue'),
            meta: { isPublic: true },
        },
        {
            path: '/admin',
            component: () => import('../layouts/DashboardLayout.vue'),
            children: [
                {
                    path: 'dashboard',
                    name: 'dashboard',
                    component: () => import('../views/dashboard/DashboardView.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin'] },
                },
                {
                    path: 'question',
                    name: 'question',
                    component: () => import('../views/dashboard/QuestionView.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin'] },
                },
                {
                    path: 'question/:id',
                    name: 'answer',
                    component: () => import('../views/dashboard/AnswerView.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin'] },
                },
                {
                    path: 'subject',
                    name: 'subject',
                    component: () => import('../views/dashboard/SubjectView.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin'] },
                },
                {
                    path: 'ticket',
                    name: 'ticket',
                    component: () => import('../views/dashboard/TicketView.vue'),
                    meta: { requiresAuth: true, roles: ['super_admin'] },
                },
            ],
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: () => import('../views/static/404NotFoundView.vue'),
            meta: { isPublic: true },
        },
    ],
})

setupRouterGuards(router)

export default router
