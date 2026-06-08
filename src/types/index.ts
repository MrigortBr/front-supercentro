export type ActivityStatus = "Projetado" | "Planejado" | "Em andamento" | "Concluído";

export type InstitutionStatus = "Não iniciado" | "Em andamento" | "Concluído" | "Atrasado" | "Pendente";

export interface ActivityObservation {
    id?: number;
    id_activities?: number;
    date_observation: string;
    text_observation: string;
}

export interface Activity {
    name: string;
    responsible: string;
    observation?: ActivityObservation[];
    start_date: string;
    end_date: string;
    status: ActivityStatus;
}

export interface Institution {
    id: number;
    name: string;
    state: string;
    responsible: string;
    status: InstitutionStatus;
    observations: string;
    activities: Activity[];
    datepreview?: Date;
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

export type ViewType = "list" | "gantt" | "map";

export type InstitutionPhoto = {
    id: number;
    id_instituicion: number;
    photo: { type: "Buffer"; data: number[] } | string;
    original_name?: string | null;
    mime_type?: string | null;
    size?: number | null;
    created_at: string;
};
