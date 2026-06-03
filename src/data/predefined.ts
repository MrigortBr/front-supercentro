import { Activity } from "../types";

const BRAZIL_STATES = [
    "AC",
    "AL",
    "AM",
    "AP",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MG",
    "MS",
    "MT",
    "PA",
    "PB",
    "PE",
    "PI",
    "PR",
    "RJ",
    "RN",
    "RO",
    "RR",
    "RS",
    "SC",
    "SE",
    "SP",
    "TO",
];

export type PredefinedBase = {
    status: {
        text: string;
        background: string;
        foreground: string;
    }[];
    activity: {
        name: {
            name: string;
            responsible: string;
        }[];
        status: string[];
        empty: Activity;
    };
    equipament: {
        SIMB: string[];
        empty: {
            descricao: string;
            id: number;
            id_instituicion: number;
            quantidade: number;
            simb: string;
            status: string;
            marca: string;
            previsao_entrega?: Date;
            created_at: Date;
        };
        description: string[];
        marca: string[];
        status: string[];
    };
    states: typeof BRAZIL_STATES;
};

export const PREDEFINED_BASE: PredefinedBase = {
    status: [
        { text: "Não iniciado", background: "#168821", foreground: "#fff" },
        { text: "Em andamento", background: "#1351B4", foreground: "#fff" },
        { text: "Concluído", background: "#168821", foreground: "#fff" },
        { text: "Atrasado", background: "#168821", foreground: "#fff" },
        { text: "Pendente", background: "#168821", foreground: "#fff" },
    ],
    activity: {
        name: [
            { name: "Entrega Scanner", responsible: "ACC" },
            { name: "Visita Técnica", responsible: "ACC" },
            { name: "Visita do Ministério", responsible: "MS" },
            { name: "Apresentação da arquitetura do Sistema para Implantação", responsible: "ACC" },
            { name: "Início e finalização das obras (construção/adequação) do laboratório", responsible: "Estado" },
            { name: "Mapeamento dos processos na unidade - APLIS", responsible: "ACC" },
            { name: "Aquisição de equipamentos", responsible: "ACC" },
            { name: "Entrega de equipamentos", responsible: "ACC" },
            { name: "Imersão Técnica no AC Camargo", responsible: "ACC/Estado" },
            { name: "Desenvolvimento dos fluxos da unidade no sistema – APLIS", responsible: "ACC" },
            { name: "Contratação/complementação de RH pela unidade (técnicos)", responsible: "ACC/Estado" },
            { name: "Contratação/complementação de patologista na unidade", responsible: "ACC/Estado" },
            { name: "Workshop de Patologia Digital", responsible: "ACC/Estado" },
            { name: "Implantação e validação do equipamento", responsible: "ACC/Estado" },
            { name: "Visita de revisão de processo local", responsible: "ACC" },
            { name: "Entrega de projeto básico", responsible: "ACC" },
            { name: "Validação do projeto básico", responsible: "Estado" },
            { name: "Entrega do Projeto Executivo", responsible: "ACC" },
            { name: "Definição dos municípios para recebimento de amostras/ CIB", responsible: "Estado" },
            { name: "Inauguração", responsible: "Estado" },
            { name: "Início das análises", responsible: "Estado" },
            { name: "Habilitação", responsible: "" },
        ],
        status: ["Projetado", "Em andamento", "Concluído"],
        empty: { name: "", responsible: "", start_date: "", end_date: "", status: "Projetado", observation: [] },
    },
    equipament: {
        empty: {
            descricao: "",
            id: 0,
            id_instituicion: 0,
            quantidade: 0,
            simb: "",
            status: "",
            marca: "",
            previsao_entrega: undefined,
            created_at: new Date(),
        },
        description: [""],
        SIMB: [""],
        marca: [""],
        status: [""],
    },
    states: BRAZIL_STATES,
};
