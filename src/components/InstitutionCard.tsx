import { useState } from "react";
import { Card, CardContent, Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, CircularProgress } from "@mui/material";
import { Edit2, Trash2, Printer } from "lucide-react";
import { Activity, Institution } from "../types";
import StatusChip from "./StatusChip";
import { exportInstitutionDetailPDF } from "../utils/exportInstitutionPDF";

interface InstitutionCardProps {
    institution: Institution;
    onView: (institution: Institution) => void;
    onEdit: (institution: Institution) => void;
    onDelete: (id: number) => void;
}

export default function InstitutionCard({ institution, onView, onEdit, onDelete }: InstitutionCardProps) {
    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    const handleExport = (withGantt: boolean) => {
        setExportDialogOpen(false);
        exportInstitutionDetailPDF(institution, withGantt);
    };

    // const latestEndDate = (i: Institution) => {
    //     return i.activities.reduce((latest, activity) => {
    //         return new Date(activity.end_date) > new Date(latest.end_date) ? activity : latest;
    //     });
    // };

    const calculateProgress = (activity: Activity): number => {
        const start = new Date(activity.start_date).getTime();
        const end = new Date(activity.end_date).getTime();
        const now = Date.now();
        if (end <= start) return 100;
        if (now <= start) return 0;
        if (now >= end) return 100;
        return Math.round(((now - start) / (end - start)) * 100);
    };

    const activitiesWithDates = institution.activities.filter((a) => a.start_date && a.end_date);
    const avgProgress =
        activitiesWithDates.length > 0
            ? Math.round(activitiesWithDates.reduce((sum, a) => sum + calculateProgress(a), 0) / activitiesWithDates.length)
            : 0;

    const institutionStatusColors: Record<string, string> = {
        "Não iniciado": "#e9ecef",
        "Em andamento": "#1351B4",
        Concluído: "#168821",
        Atrasado: "#E52207",
        Pendente: "#FFCD07",
    };

    const progressColor = institutionStatusColors[institution.status] ?? "#1351B4";

    return (
        <Card
            onClick={() => onView(institution)}
            sx={{ overflow: "hidden", cursor: "pointer", height: "18rem", display: "flex", flexDirection: "column", "&:hover": { boxShadow: 4 } }}
        >
            {/* Card Header */}
            <Box sx={{ p: "1.25rem", bgcolor: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Typography variant="h3" sx={{ flex: 1, fontSize: "1.125rem", fontWeight: 600, color: "primary.main" }}>
                        {institution.name}
                    </Typography>

                    <StatusChip status={institution.status} />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                    {institution.datepreview ? (
                        <Chip
                            label={"Previsão de entrega: " + new Date(institution.datepreview).toLocaleDateString("pt-BR")}
                            size={"small"}
                            sx={{
                                backgroundColor: "#FF8C00",
                                color: "#ffffff",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                borderRadius: "20px",
                                marginRight: "auto",
                            }}
                        />
                    ) : (
                        <></>
                    )}

                    <IconButton
                        size="small"
                        title="Exportar PDF"
                        onClick={(e) => {
                            e.stopPropagation();
                            setExportDialogOpen(true);
                        }}
                        sx={{
                            border: "1px solid #dee2e6",
                            borderRadius: 1,
                            bgcolor: "white",
                            color: "#666",
                            "&:hover": { bgcolor: "#f0fff4", color: "#168821", borderColor: "#168821" },
                        }}
                    >
                        <Printer size={16} />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(institution);
                        }}
                        sx={{
                            border: "1px solid #dee2e6",
                            borderRadius: 1,
                            bgcolor: "white",
                            color: "#666",
                            "&:hover": { bgcolor: "#e7f1ff", color: "primary.main", borderColor: "primary.main" },
                        }}
                    >
                        <Edit2 size={16} />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(institution.id);
                        }}
                        sx={{
                            border: "1px solid #dee2e6",
                            borderRadius: 1,
                            bgcolor: "white",
                            color: "#666",
                            "&:hover": { bgcolor: "#ffe5e5", color: "error.main", borderColor: "error.main" },
                        }}
                    >
                        <Trash2 size={16} />
                    </IconButton>
                </Box>
            </Box>

            {/* Card Body */}
            <CardContent sx={{ p: "1.25rem !important", display: "flex", gap: 2, alignItems: "flex-start" }}>
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", gap: 0.5, mb: 1.5, fontSize: "0.925rem" }}>
                        <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, minWidth: 100 }}>
                            Estado:
                        </Typography>
                        <Typography variant="body2">{institution.state}</Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.5, mb: 1.5, fontSize: "0.925rem" }}>
                        <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, minWidth: 100 }}>
                            Responsável:
                        </Typography>
                        <Typography variant="body2">{institution.responsible}</Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Typography variant="body2" sx={{ color: "#666", fontWeight: 500, minWidth: 100 }}>
                            Observações:
                        </Typography>

                        <Box sx={{ maxHeight: 50, overflowY: "auto", flex: 1 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: institution.observations ? "#495057" : "#adb5bd",
                                    lineHeight: 1.5,
                                    fontStyle: institution.observations ? "normal" : "italic",
                                }}
                            >
                                {institution.observations || "Nenhuma"}
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {institution.activities.length > 0 && (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <Box sx={{ position: "relative", display: "inline-flex" }}>
                            <CircularProgress
                                variant="determinate"
                                value={avgProgress}
                                size={58}
                                thickness={4}
                                sx={{ color: progressColor }}
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.72rem" }}>
                                    {avgProgress}%
                                </Typography>
                            </Box>
                        </Box>
                        <Typography variant="caption" sx={{ color: "#666", mt: 0.5, fontSize: "0.62rem" }}>
                            Progresso
                        </Typography>
                    </Box>
                )}
            </CardContent>

            {/* Export dialog */}
            <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} onClick={(e) => e.stopPropagation()}>
                <DialogTitle>Exportar PDF</DialogTitle>
                <DialogContent>
                    <Typography>Deseja incluir o Gantt da instituição no final do PDF?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleExport(false)}>Sem Gantt</Button>
                    <Button onClick={() => handleExport(true)} variant="contained">
                        Com Gantt
                    </Button>
                </DialogActions>
            </Dialog>

        </Card>
    );
}
