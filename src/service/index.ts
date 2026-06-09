import axios from "axios";
import { InstituicionListResponse, LoginResponse } from "./type";
import { Institution, InstitutionPhoto } from "../types";

class Api {
    api;

    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.VITE_API_URL || "http://localhost:3333",

            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    setAuthToken(token: string | null) {
        if (token) {
            this.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete this.api.defaults.headers.common["Authorization"];
        }
    }

    async login(email: string, password: string): Promise<LoginResponse> {
        try {
            const response = await this.api.post("/auth/login", { email, password });
            return { status: true, ...response.data };
        } catch (error: any) {
            const status = error?.response?.status;
            const message = status === 401 || status === 400 || status === 404
                ? "E-mail e/ou senha incorretos"
                : "Sistema SAH está temporariamente fora do ar!";
            return { status: false, message };
        }
    }

    async getInstituicions(page = 1, limit = 10) {
        return await this.api.get<InstituicionListResponse>(`/instituicion?page=${page}&limit=${limit}`);
    }

    async createInstituicion(data: Omit<Institution, "id">) {
        return await this.api.post("/instituicion", data);
    }

    async updateInstituicion(id: number, data: Partial<Institution>) {
        return await this.api.put(`/instituicion/${id}`, data);
    }

    async deleteInstituicion(id: number) {
        return await this.api.delete(`/instituicion/${id}`);
    }

    async getPhotos(institutionId: number) {
        return await this.api.get<InstitutionPhoto[]>(`/photos/${institutionId}`);
    }

    async uploadPhoto(institutionId: number, file: File) {
        const formData = new FormData();
        formData.append("file", file);
        return await this.api.post(`/photos/${institutionId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    }

    async deletePhoto(photoId: number) {
        return await this.api.delete(`/photos/${photoId}`);
    }
}

export const api = new Api();
