import { Institution } from "../types";

export interface SessionUser {
    id?: number;
    name: string;
    email: string;
}

export interface LoginResponse {
    status: boolean;
    message?: string;
    token?: string;
    user?: SessionUser;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface InstituicionListResponse {
    data: Institution[];
    pagination: Pagination;
}
