export interface User {
    id: string
    firstName: string
    lastName: string
    username: string
    phone?: string
    role: 'admin' | 'teacher'
    createdAt?: string
    updatedAt?: string
}

export interface Teacher {
    id: string
    firstName: string
    lastName: string
    username: string
    phone: string
    fullName?: string
    createdAt?: string
    updatedAt?: string
}

export interface Student {
    id: string
    firstName: string
    lastName: string
    username: string
    phone: string
    address: string
    fullName?: string
    createdAt?: string
    updatedAt?: string
}

export interface Course {
    id: string
    name: string
    description: string
    duration: number
    price: number
    createdAt?: string
    updatedAt?: string
    videos?: CourseVideo[]
}

export interface CourseVideo {
    id: string
    title: string
    url: string
    duration: number
    courseId: string
    createdAt?: string
    updatedAt?: string
}

export interface Group {
    id: string
    name: string
    description?: string
    courseId: string
    teacherId: string
    course?: Course
    teacher?: Teacher
    studentsCount?: number
    createdAt?: string
    updatedAt?: string
}

export interface Pagination {
    page: number
    total: number
    limit: number
    lastPage: number
}

export interface ApiResponse<T> {
    data: T[]
    meta?: {
        pagination: Pagination
    }
    message?: string
    error?: string
}
