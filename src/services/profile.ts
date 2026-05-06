import { apiGet, apiPatch, apiPostForm } from '../api';

export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    age: number | null;
    profilePicture: string | null;
    drivingLicense: string | null;
    createdAt: string;
}

export interface UpdateProfilePayload {
    name?: string;
    phone?: string;
    age?: string;
}

export async function fetchProfile(): Promise<UserProfile> {
    return apiGet<UserProfile>('auth/profile');
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
    console.log("payload", payload);

    const data = await apiPatch<{ message: string; user: UserProfile }>(
        'auth/profile',
        payload
    );
    return data.user;
}

export async function uploadProfilePicture(file: File): Promise<string> {
    const form = new FormData();
    form.append('profilePicture', file);
    const data = await apiPostForm<{ message: string; path: string }>(
        'auth/upload/profile-picture',
        form
    );
    return data.path;
}

export async function uploadDrivingLicense(file: File): Promise<string> {
    const form = new FormData();
    form.append('drivingLicense', file);
    const data = await apiPostForm<{ message: string; path: string }>(
        'auth/upload/driving-license',
        form
    );
    return data.path;
}