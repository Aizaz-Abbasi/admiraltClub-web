import { API_ENDPOINTS, apiGet, apiPost, apiPatch, apiDelete } from "../api";

export interface Course {
    id: number;
    name: string;
    isActive: boolean;
    createdAt: string;
}

export interface CoursesResponse {
    success: boolean;
    total: number;
    page: number;
    limit: number;
    courses: Course[];
}

export async function fetchCourses(isActive?: boolean): Promise<Course[]> {
    let url = `${API_ENDPOINTS.courses.list}?page=1&limit=100`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;
    const response = await apiGet<CoursesResponse>(url);
    return response.courses || [];
}

export async function createCourse(data: { name: string }) {
    const response = await apiPost<{ success: boolean; message: string; course: Course }>(
        API_ENDPOINTS.courses.create,
        data
    );
    return response.course;
}

export async function updateCourse(id: number, data: { name?: string; isActive?: boolean }) {
    const response = await apiPatch<{ success: boolean; message: string; course: Course }>(
        `${API_ENDPOINTS.courses.update}/${id}`,
        data
    );
    return response.course;
}

export async function deleteCourse(id: number) {
    const response = await apiDelete<{ success: boolean; message: string }>(
        `${API_ENDPOINTS.courses.delete}/${id}`
    );
    return response;
}