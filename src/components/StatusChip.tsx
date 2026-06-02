import { Chip } from "@mui/material";
import { InstitutionStatus, ActivityStatus } from "../types";

interface StatusChipProps {
    status: InstitutionStatus | ActivityStatus;
    size?: "small" | "medium";
}

const institutionStatusColors: Record<InstitutionStatus, { bg: string; color: string }> = {
    "Não iniciado": { bg: "#e9ecef", color: "#495057" },
    "Em andamento": { bg: "#1351B4", color: "#ffffff" },
    Concluído: { bg: "#168821", color: "#ffffff" },
    Atrasado: { bg: "#E52207", color: "#ffffff" },
    Pendente: { bg: "#FFCD07", color: "#333333" },
};

const activityStatusColors: Record<ActivityStatus, { bg: string; color: string }> = {
    Concluído: { bg: "#168821", color: "#ffffff" },
    "Em andamento": { bg: "#1351B4", color: "#ffffff" },
    Projetado: { bg: "#FF8C00", color: "#ffffff" },
    Planejado: { bg: "#FF8C00", color: "#ffffff" },
};

export default function StatusChip({ status, size = "small" }: StatusChipProps) {
    const colors = (institutionStatusColors as Record<string, { bg: string; color: string }>)[status] ||
        (activityStatusColors as Record<string, { bg: string; color: string }>)[status] || { bg: "#e9ecef", color: "#495057" };

    return (
        <Chip
            label={status}
            size={size}
            sx={{
                backgroundColor: colors.bg,
                color: colors.color,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderRadius: "20px",
                "& .MuiChip-label": {
                    px: size === "small" ? 1.25 : 1.5,
                    py: "3px",
                    display: "block",
                    whiteSpace: "nowrap",
                },
            }}
        />
    );
}
