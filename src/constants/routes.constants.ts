import { RouteRecordRaw } from 'vue-router'

export interface MenuItem {
    id: number
    title: string
    icon: string
    path: string
    role: string[]
}

export const menuItems: MenuItem[] = [
    {
        id: 1,
        title: 'Users',
        icon: 'teachers',
        path: 'dashboard',
        role: ['super_admin', 'admin'],
    },
    {
        id: 2,
        title: 'Subjects',
        icon: 'subject',
        path: 'subject',
        role: ['super_admin', 'admin'],
    },
    {
        id: 3,
        title: 'Tickets',
        icon: 'ticket',
        path: 'ticket',
        role: ['super_admin', 'admin'],
    },
    {
        id: 4,
        title: 'Questions',
        icon: 'question',
        path: 'question',
        role: ['super_admin', 'admin'],
    },
    {
        id: 5,
        title: 'Exams',
        icon: 'exams',
        path: 'exam',
        role: ['super_admin', 'admin'],
    },
    // {
    //     id: 4,
    //     title: 'Kurslar',
    //     icon: 'courses',
    //     path: '/courses',
    //     role: ['super_admin', 'admin'],
    // },
    // {
    //     id: 5,
    //     title: 'Kurslar',
    //     icon: 'courses',
    //     path: '/teacher-courses',
    //     role: ['teacher'],
    // },
    // {
    //     id: 5,
    //     title: 'Sozlamalar',
    //     icon: 'settings',
    //     path: '/settings',
    //     role: ['admin', 'manager']
    // }
]

export const routesMeta = {
    ustozlar: {
        title: 'Ustozlar',
        desc: "O'qituvchilar ro'yxati va ma'lumotlari",
    },
    oquvchilar: {
        title: "O'quvchilar",
        desc: "O'quvchilar ro'yxati va ma'lumotlari",
    },
    guruhlar: {
        title: 'Guruhlar',
        desc: "O'quv guruhlari ro'yxati",
    },
    kurslar: {
        title: 'Kurslar',
        desc: "Mavjud kurslar ro'yxati",
    },
    sozlamalar: {
        title: 'Sozlamalar',
        desc: 'Tizim sozlamalari',
    },
}
