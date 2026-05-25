import { Institution } from "../types";

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
