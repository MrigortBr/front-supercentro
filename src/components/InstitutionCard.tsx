import { useState } from "react";
import {
    Card,
    CardContent,
    Box,
    Typography,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Chip,
    CircularProgress,
} from "@mui/material";
import { Edit2, Trash2, Printer } from "lucide-react";
import { Activity, Institution } from "../types";
import StatusChip from "./StatusChip";
import { previewInstitutionDetailPDF } from "../utils/exportInstitutionPDF";
import { api } from "../service";

interface InstitutionCardProps {
    institution: Institution;
    onView: (institution: Institution) => void;
    onEdit: (institution: Institution) => void;
    onDelete: (id: number) => void;
}

export default function InstitutionCard({ institution, onView, onEdit, onDelete }: InstitutionCardProps) {
    const [preview, setPreview] = useState<{ url: string; download: () => void } | null>(null);
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await api.getPhotos(institution.id);
            setPreview(previewInstitutionDetailPDF(institution, true, res.data));
        } catch {
            setPreview(previewInstitutionDetailPDF(institution, true, []));
        } finally {
            setExporting(false);
        }
    };

    const closePreview = () => {
        if (preview) URL.revokeObjectURL(preview.url);
        setPreview(null);
    };

    // const latestEndDate = (i: Institution) => {
    //     return i.activities.reduce((latest, activity) => {
    //         return new Date(activity.end_date) > new Date(latest.end_date) ? activity : latest;
    //     });
    // };

    const calculateProgress = (activity: Activity): number => {
        if (!activity.start_date || !activity.end_date) {
            return 0;
        }

        const start = new Date(activity.start_date).getTime();
        const end = new Date(activity.end_date).getTime();
        const now = Date.now();

        if (end <= start) return 100;
        if (now <= start) return 0;
        if (now >= end) return 100;

        return Math.round(((now - start) / (end - start)) * 100);
    };
    // const activitiesWithDates = institution.activities.filter((a) => a.start_date && a.end_date);
    const avgProgress =
        institution.activities.length > 0
            ? Math.round(institution.activities.reduce((sum, a) => sum + calculateProgress(a), 0) / institution.activities.length)
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
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1 }}>
                    <Typography variant="h3" sx={{ flex: 1, fontSize: "1.125rem", fontWeight: 600, color: "primary.main" }}>
                        {institution.name}
                    </Typography>

                    {/* No mobile: coluna com status + chip de previsão. No desktop: só o status */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, flexShrink: 0 }}>
                        <StatusChip status={institution.status} sx={{ width: { xs: "100%", sm: "auto" } }} />
                        {institution.datepreview && (
                            <Chip
                                label={
                                    <Box sx={{ textAlign: "center" }}>
                                        <Box>Previsão de Entrega:</Box>
                                        <Box>{new Date(institution.datepreview).toLocaleDateString("pt-BR")}</Box>
                                    </Box>
                                }
                                size={"small"}
                                sx={{
                                    display: { xs: "flex", sm: "none" },
                                    backgroundColor: "#FF8C00",
                                    color: "#ffffff",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    borderRadius: "20px",
                                    height: "auto",
                                    width: "100%",
                                    "& .MuiChip-label": { whiteSpace: "normal", py: "4px" },
                                }}
                            />
                        )}
                    </Box>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                    {institution.datepreview ? (
                        <Chip
                            label={"Previsão de entrega: " + new Date(institution.datepreview).toLocaleDateString("pt-BR")}
                            size={"small"}
                            sx={{
                                display: { xs: "none", sm: "flex" },
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
                        disabled={exporting}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleExport();
                        }}
                        sx={{
                            border: "1px solid #dee2e6",
                            borderRadius: 1,
                            bgcolor: "white",
                            color: "#666",
                            "&:hover": { bgcolor: "#f0fff4", color: "#168821", borderColor: "#168821" },
                        }}
                    >
                        {exporting ? <CircularProgress size={16} /> : <Printer size={16} />}
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
                            <CircularProgress variant="determinate" value={avgProgress} size={58} thickness={4} sx={{ color: progressColor }} />
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

            {/* PDF preview dialog */}
            <Dialog
                open={!!preview}
                onClose={closePreview}
                onClick={(e) => e.stopPropagation()}
                fullScreen
                PaperProps={{ sx: { display: "flex", flexDirection: "column" } }}
            >
                <DialogTitle>Pré-visualização do PDF</DialogTitle>
                <DialogContent sx={{ p: 0, flex: 1, minHeight: 0 }}>
                    {preview && (
                        <Box component="iframe" src={preview.url} title="Pré-visualização do PDF" sx={{ width: "100%", height: "100%", border: 0, display: "block" }} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closePreview}>Fechar</Button>
                    <Button
                        onClick={() => {
                            preview?.download();
                        }}
                        variant="contained"
                    >
                        Baixar PDF
                    </Button>
                </DialogActions>
            </Dialog>

            {/* PDF preview dialog */}
            <Dialog
                open={!!preview}
                onClose={closePreview}
                onClick={(e) => e.stopPropagation()}
                fullScreen
                PaperProps={{ sx: { display: "flex", flexDirection: "column" } }}
            >
                <DialogTitle>Pré-visualização do PDF</DialogTitle>
                <DialogContent sx={{ p: 0, flex: 1, minHeight: 0 }}>
                    {preview && (
                        <Box component="iframe" src={preview.url} title="Pré-visualização do PDF" sx={{ width: "100%", height: "100%", border: 0, display: "block" }} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closePreview}>Fechar</Button>
                    <Button
                        onClick={() => {
                            preview?.download();
                        }}
                        variant="contained"
                    >
                        Baixar PDF
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
