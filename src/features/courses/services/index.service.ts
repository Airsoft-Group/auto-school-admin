import api from '@/services/api';
import type { Course, CreateCourseRequest, UpdateCourseRequest } from '../types';

const BASE_URL = '/courses';

export default {
    async getCourses(filters = {}) {
        const { data } = await api.get(BASE_URL, { params: filters });
        return data;
    },
    async getCourse(id: string) {
        const { data } = await api.get(`${BASE_URL}/${id}`);
        return data;
    },
    async createCourse(course: CreateCourseRequest) {
        const { data } = await api.post(BASE_URL, course);
        return data;
    },
    async updateCourse(course: UpdateCourseRequest) {
        const { data } = await api.put(`${BASE_URL}/${course.id}`, course);
        return data;
    },
    async deleteCourse(id: string) {
        await api.delete(`${BASE_URL}/${id}`);
        return true;
    },
    async getCourseLessons(courseId: string) {
        const { data } = await api.get(`${BASE_URL}/${courseId}/lessons`);
        return data;
    }
};