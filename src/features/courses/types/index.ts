// Domain types for the courses feature
export interface Course {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    instructorId: string;
    category: string;
    price: number;
    rating?: number;
    lessonsCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    description: string;
    videoUrl?: string;
    duration: number;
    orderIndex: number;
}

export interface CourseFilters {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'title' | 'date' | 'price' | 'rating';
    sortDirection?: 'asc' | 'desc';
}

// Request/response types
export interface CreateCourseRequest {
    title: string;
    description: string;
    category: string;
    price: number;
}

export interface UpdateCourseRequest {
    id: string;
    title?: string;
    description?: string;
    category?: string;
    price?: number;
}