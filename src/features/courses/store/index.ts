import { defineStore } from 'pinia';
import courseService from '../services/index.service';
import type { Course, CourseFilters } from '../types';

export const useCourseStore = defineStore('courses', {
    state: () => ({
        courses: [] as Course[],
        currentCourse: null as Course | null,
        loading: false,
        error: null as string | null,
        filters: {} as CourseFilters
    }),

    getters: {
        filteredCourses: (state) => {
            // Apply local filtering
            return state.courses;
        },

        courseById: (state) => (id: string) => {
            return state.courses.find(course => course.id === id);
        }
    },

    actions: {
        async fetchCourses(filters = {}) {
            this.loading = true;
            this.error = null;

            try {
                this.courses = await courseService.getCourses(filters);
                this.filters = { ...filters };
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch courses';
                console.error('Error fetching courses:', err);
            } finally {
                this.loading = false;
            }
        },

        async fetchCourseById(id: string) {
            this.loading = true;
            this.error = null;

            try {
                this.currentCourse = await courseService.getCourse(id);
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch course details';
                console.error('Error fetching course details:', err);
            } finally {
                this.loading = false;
            }
        },

        async createCourse(course: any) {
            this.loading = true;
            this.error = null;

            try {
                const newCourse = await courseService.createCourse(course);
                this.courses.push(newCourse);
                return newCourse;
            } catch (err: any) {
                this.error = err.message || 'Failed to create course';
                console.error('Error creating course:', err);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async updateCourse(course: any) {
            this.loading = true;
            this.error = null;

            try {
                const updatedCourse = await courseService.updateCourse(course);
                const index = this.courses.findIndex(c => c.id === course.id);
                if (index !== -1) {
                    this.courses[index] = updatedCourse;
                }
                return updatedCourse;
            } catch (err: any) {
                this.error = err.message || 'Failed to update course';
                console.error('Error updating course:', err);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async deleteCourse(id: string) {
            this.loading = true;
            this.error = null;

            try {
                await courseService.deleteCourse(id);
                this.courses = this.courses.filter(course => course.id !== id);
            } catch (err: any) {
                this.error = err.message || 'Failed to delete course';
                console.error('Error deleting course:', err);
                throw err;
            } finally {
                this.loading = false;
            }
        }
    }
});