import axios from "axios";
import { InstituicionListResponse } from "./type";
import { Institution } from "../types";

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
}

export const api = new Api();
