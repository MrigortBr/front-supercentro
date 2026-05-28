import axios from "axios";
import { InstituicionListResponse } from "./type";
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
