export type ActivityStatus = "Projetado" | "Planejado" | "Em andamento" | "Concluído";

export type InstitutionStatus = "Não iniciado" | "Em andamento" | "Concluído" | "Atrasado" | "Pendente";

export interface Activity {
    name: string;
    responsible: string;
    observation?: string;
    start_date: string;
    end_date: string;
    status: ActivityStatus;
    observations?: string;
}

export interface Institution {
    id: number;
    name: string;
    state: string;
    responsible: string;
    status: InstitutionStatus;
    observations: string;
    activities: Activity[];
    machine: InstitutionEquipment[];
}

export type InstitutionEquipment = {
    id?: number;
    id_instituicion?: number;
    simb: string;
    descricao: string;
    status: string;
    marca?: string | null;
    quantidade: number;
    previsao_entrega?: Date;
    created_at?: Date;
};

export type ViewType = "list" | "gantt";

export type InstitutionPhoto = {
    id: number;
    id_instituicion: number;
    photo: { type: "Buffer"; data: number[] } | string;
    original_name?: string | null;
    mime_type?: string | null;
    size?: number | null;
    created_at: string;
};
