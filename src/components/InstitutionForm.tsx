import { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Typography,
    Paper,
    IconButton,
    Chip,
    Divider,
    Autocomplete,
    CircularProgress,
    LinearProgress,
    Collapse,
} from "@mui/material";
import { Plus, Pencil, Trash2, Calendar, X, Upload, MessageSquare } from "lucide-react";
import { Institution, Activity, InstitutionStatus, ActivityStatus, InstitutionEquipment, InstitutionPhoto, ActivityObservation } from "../types";
import { chipColors } from "../data/const";
import { api } from "../service";
import { PREDEFINED_BASE } from "../data/predefined";

export interface InstitutionFormProps {
    institution: Institution | null;
    onSave: (data: Omit<Institution, "id">) => void;
    onCancel: () => void;
    onEdit?: () => void;
    readOnly?: boolean;
    allData: Institution[];
}

type MuiColor = "primary" | "secondary" | "error" | "warning" | "info" | "success" | "inherit";

const activityStatusColors: Record<ActivityStatus, { bg: string; color: string; colorMui: MuiColor }> = {
    Concluído: { bg: "#168821", color: "#fff", colorMui: "success" },
    "Em andamento": { bg: "#1351B4", color: "#fff", colorMui: "primary" },
    Projetado: { bg: "#FF8C00", color: "#fff", colorMui: "warning" },
    Planejado: { bg: "#FF8C00", color: "#fff", colorMui: "warning" },
};

export default function InstitutionForm({ institution, onSave, onCancel, onEdit, readOnly = false, allData }: InstitutionFormProps) {
    const [predefinedCamp, setPredefinedCamp] = useState(PREDEFINED_BASE);
    const [formData, setFormData] = useState<Omit<Institution, "id">>(
        institution
            ? { ...institution }
            : { name: "", state: "", responsible: "", status: "Não iniciado", observations: "", activities: [], machine: [], datepreview: new Date() }
    );
    const [newActivity, setNewActivity] = useState<Activity>({ ...PREDEFINED_BASE.activity.empty });
    const [editingActivityIdx, setEditingActivityIdx] = useState<number | null>(null);
    const [editingActivityData, setEditingActivityData] = useState<Activity>({ ...PREDEFINED_BASE.activity.empty });
    const [editingMachineData, setEditingMachineData] = useState<InstitutionEquipment>({ ...PREDEFINED_BASE.equipament.empty });
    const [editingMachineIdx, setEditingMachineDataIdx] = useState<number | null>(null);
    const todayISO = new Date().toISOString().split("T")[0];
    const [newObsForEdit, setNewObsForEdit] = useState<Omit<ActivityObservation, "id" | "id_activities">>({
        date_observation: todayISO,
        text_observation: "",
    });
    const [newObsForNew, setNewObsForNew] = useState<Omit<ActivityObservation, "id" | "id_activities">>({
        date_observation: todayISO,
        text_observation: "",
    });
    const [editingObsInEditIdx, setEditingObsInEditIdx] = useState<number | null>(null);
    const [editingObsInNewIdx, setEditingObsInNewIdx] = useState<number | null>(null);
    const [expandedObsIdx, setExpandedObsIdx] = useState<number | null>(null);

    const [photos, setPhotos] = useState<InstitutionPhoto[]>([]);
    const [loadingPhotos, setLoadingPhotos] = useState(false);
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState<InstitutionPhoto | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fieldLabels: Record<string, string> = {
        previsao_entrega: "Previsão de Entrega",
    };

    const formatKey = (value: string) => {
        if (value.toLocaleLowerCase() == "simb") return "";
        else return `${value}:`;
    };

    const formatValue = (value: unknown) => {
        if (!value) return "";

        // Date real
        if (value instanceof Date) {
            return value.toLocaleDateString("pt-BR");
        }

        // ISO Date string
        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
            return new Date(value).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
            });
        }

        return String(value);
    };

    const photoToDataUrl = (photo: InstitutionPhoto): string => {
        const mt = photo.mime_type || "image/jpeg";
        const data = photo.photo;
        if (typeof data === "string") {
            if (data.startsWith("data:")) return data;
            return `data:${mt};base64,${data}`;
        }
        if (data && typeof data === "object" && (data as any).type === "Buffer" && Array.isArray((data as any).data)) {
            const bytes = new Uint8Array((data as any).data);
            let binary = "";
            for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
            return `data:${mt};base64,${btoa(binary)}`;
        }
        return "";
    };

    useEffect(() => {
        if (!institution?.id) return;
        const load = async () => {
            setLoadingPhotos(true);
            try {
                const res = await api.getPhotos(institution.id);
                setPhotos(res.data);
            } catch {
                // silent
            } finally {
                setLoadingPhotos(false);
            }
        };
        load();
    }, [institution?.id]);

    const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !institution?.id) return;
        e.target.value = "";
        setLoadingUpload(true);
        try {
            await api.uploadPhoto(institution.id, file);
            const res = await api.getPhotos(institution.id);
            setPhotos(res.data);
        } catch {
            // silent
        } finally {
            setLoadingUpload(false);
        }
    };

    const [deletingPhotoId, setDeletingPhotoId] = useState<number | null>(null);

    const handleDeletePhoto = async (photoId: number) => {
        setDeletingPhotoId(photoId);
    };

    const confirmDeletePhoto = async () => {
        if (deletingPhotoId === null) return;
        const id = deletingPhotoId;
        setDeletingPhotoId(null);
        try {
            await api.deletePhoto(id);
            setPhotos((prev) => prev.filter((p) => p.id !== id));
        } catch {
            // silent
        }
    };

    const calculateProgress = (activity: Activity): number => {
        const start = new Date(activity.start_date).getTime();
        const end = new Date(activity.end_date).getTime();
        const now = Date.now();

        if (!end && !start) return 0;

        // Evita divisão por zero
        if (end <= start) return 100;

        // Ainda não começou
        if (now <= start) return 0;

        // Já terminou
        if (now >= end) return 100;

        const progress = ((now - start) / (end - start)) * 100;

        return Math.round(progress);
    };

    useEffect(() => {
        const description = [...new Set(allData.flatMap((d) => d.machine.map((a) => a.descricao ?? "")).filter(Boolean))];

        const SIMB = [...new Set(allData.flatMap((d) => d.machine.map((a) => a.simb ?? "")).filter(Boolean))];

        const marca = [...new Set(allData.flatMap((d) => d.machine.map((a) => a.marca ?? "")).filter(Boolean))];

        const status = [...new Set(allData.flatMap((d) => d.machine.map((a) => a.status ?? "")).filter(Boolean))];

        setPredefinedCamp((prev) => ({
            ...prev,
            equipament: {
                ...prev.equipament,
                SIMB,
                description,
                status,
                marca,
            },
        }));
    }, [allData]);

    const startEditActivity = (idx: number) => {
        setEditingActivityIdx(idx);
        setEditingActivityData({ ...formData.activities[idx] });
    };

    const saveEditActivity = () => {
        if (editingActivityIdx === null) return;
        setFormData((prev) => ({
            ...prev,
            activities: prev.activities.map((a, i) => (i === editingActivityIdx ? { ...editingActivityData } : a)),
        }));
        setEditingActivityIdx(null);
    };

    const removeActivity = (idx: number) => {
        setFormData((prev) => ({
            ...prev,
            activities: prev.activities.filter((_, i) => i !== idx),
        }));
    };

    const addObsToEdit = () => {
        if (!newObsForEdit.text_observation.trim() || !newObsForEdit.date_observation) return;
        if (editingObsInEditIdx !== null) {
            setEditingActivityData((prev) => ({
                ...prev,
                observation: (prev.observation || []).map((o, i) => (i === editingObsInEditIdx ? { ...newObsForEdit } : o)),
            }));
            setEditingObsInEditIdx(null);
        } else {
            setEditingActivityData((prev) => ({ ...prev, observation: [...(prev.observation || []), { ...newObsForEdit }] }));
        }
        setNewObsForEdit({ date_observation: todayISO, text_observation: "" });
    };

    const removeObsFromEdit = (idx: number) => {
        setEditingActivityData((prev) => ({ ...prev, observation: (prev.observation || []).filter((_, i) => i !== idx) }));
        if (editingObsInEditIdx === idx) {
            setEditingObsInEditIdx(null);
            setNewObsForEdit({ date_observation: todayISO, text_observation: "" });
        }
    };

    const addObsToNew = () => {
        if (!newObsForNew.text_observation.trim() || !newObsForNew.date_observation) return;
        if (editingObsInNewIdx !== null) {
            setNewActivity((prev) => ({
                ...prev,
                observation: (prev.observation || []).map((o, i) => (i === editingObsInNewIdx ? { ...newObsForNew } : o)),
            }));
            setEditingObsInNewIdx(null);
        } else {
            setNewActivity((prev) => ({ ...prev, observation: [...(prev.observation || []), { ...newObsForNew }] }));
        }
        setNewObsForNew({ date_observation: todayISO, text_observation: "" });
    };

    const removeObsFromNew = (idx: number) => {
        setNewActivity((prev) => ({ ...prev, observation: (prev.observation || []).filter((_, i) => i !== idx) }));
    };

    const addActivity = () => {
        if (newActivity.name.trim()) {
            setFormData((prev) => ({ ...prev, activities: [...(prev.activities || []), { ...newActivity }] }));
            setNewActivity({ ...predefinedCamp.activity.empty });
        }
    };

    const startEditMachine = (idx: number) => {
        setEditingMachineDataIdx(idx);
        setEditingMachineData({ ...formData.machine[idx] });
    };

    const saveEditMachine = () => {
        if (editingMachineIdx === null) return;

        setFormData((prev) => ({
            ...prev,
            machine: prev.machine.map((machine, i) => (i === editingMachineIdx ? { ...editingMachineData } : machine)),
        }));

        setEditingMachineDataIdx(null);
    };

    const removeMachine = (idx: number) => {
        setFormData((prev) => ({
            ...prev,
            machine: prev.machine.filter((_, i) => i !== idx),
        }));
    };

    const addMachine = () => {
        if (editingMachineData.simb.trim()) {
            setFormData((prev) => ({
                ...prev,
                machine: [...(prev.machine || []), { ...editingMachineData }],
            }));

            setEditingMachineData({ ...predefinedCamp.equipament.empty });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, state, responsible, status, observations, datepreview } = formData;
        onSave({
            name,
            state,
            responsible,
            status,
            observations,
            datepreview,
            activities: formData.activities.map(({ name, responsible, observation, start_date, end_date, status }) => ({
                name,
                responsible,
                start_date,
                end_date,
                status,
                observation: (observation || []).map(({ id, id_activities, date_observation, text_observation }) => ({
                    ...(id ? { id } : {}),
                    ...(id_activities ? { id_activities } : {}),
                    date_observation,
                    text_observation,
                })),
            })),
            machine: formData.machine.map(({ simb, descricao, status, marca, quantidade, previsao_entrega }) => ({
                simb,
                descricao,
                status,
                marca,
                quantidade,
                previsao_entrega,
            })),
        });
    };

    return (
        <>
            <Dialog open onClose={onCancel} fullWidth maxWidth="md" PaperProps={{ sx: { maxHeight: "90vh" } }}>
                <DialogTitle
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: "#f8f9fa",
                        borderBottom: "1px solid #dee2e6",
                        py: 2,
                    }}
                >
                    <Typography variant="h2" sx={{ color: "primary.main", fontSize: "1.5rem" }}>
                        {readOnly ? "Detalhes da Instituição" : institution ? "Editar Instituição" : "Nova Instituição"}
                    </Typography>
                    <IconButton onClick={onCancel} size="small" sx={{ color: "#666" }}>
                        <X size={20} />
                    </IconButton>
                </DialogTitle>

                <form
                    onSubmit={handleSubmit}
                    style={{ display: "flex", flexDirection: "column", flex: "1 1 auto", overflow: "hidden", minHeight: 0 }}
                >
                    <DialogContent sx={{ p: 3 }}>
                        <Box sx={{ mb: 2.5 }}>
                            <TextField
                                label="Nome da Instituição"
                                fullWidth
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: FCECON – Manaus"
                                required
                                disabled={readOnly}
                            />
                        </Box>

                        {/* State + Status row */}
                        <Grid container spacing={2} sx={{ mb: 2.5 }}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small" required disabled={readOnly}>
                                    <InputLabel>Estado</InputLabel>
                                    <Select
                                        label="Estado"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    >
                                        <MenuItem value="">
                                            <em>Selecione</em>
                                        </MenuItem>
                                        {predefinedCamp.states.map((s) => (
                                            <MenuItem key={s} value={s}>
                                                {s}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small" required disabled={readOnly}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        label="Status"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as InstitutionStatus })}
                                    >
                                        {predefinedCamp.status
                                            .map((d) => d.text)
                                            .map((s) => (
                                                <MenuItem key={s} value={s}>
                                                    {s}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        {/* Responsible */}
                        <Grid container spacing={2} sx={{ mb: 2.5 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Responsável"
                                    fullWidth
                                    value={formData.responsible}
                                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                                    placeholder="Ex: ACC"
                                    required
                                    disabled={readOnly}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    type="date"
                                    label="Data prevista"
                                    fullWidth
                                    value={formData.datepreview ? new Date(formData.datepreview).toISOString().split("T")[0] : ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            datepreview: e.target.value ? new Date(e.target.value) : undefined,
                                        })
                                    }
                                    disabled={readOnly}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>

                        {/* Observations */}
                        <Box sx={{ mb: 2.5 }}>
                            <TextField
                                label="Observações"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.observations}
                                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                                placeholder="Informações adicionais..."
                                disabled={readOnly}
                            />
                        </Box>

                        {/* Activities */}
                        <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "#f8f9fa" }} style={{ marginBottom: "5vh" }}>
                            <Typography variant="body1" fontWeight={600} sx={{ mb: 2, color: "#495057" }}>
                                Atividades e Cronograma
                            </Typography>

                            {/* Existing activities */}
                            {formData.activities.length > 0 && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
                                    {formData.activities.map((activity, idx) => {
                                        const colors = activityStatusColors[activity.status] || { bg: "#1351B4", color: "#fff" };
                                        const isEditing = editingActivityIdx === idx;
                                        const progress = calculateProgress(activity);

                                        if (!readOnly && isEditing) {
                                            return (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        bgcolor: "white",
                                                        p: 1.5,
                                                        borderRadius: 1,
                                                        border: "1px solid #1351B4",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 1.5,
                                                    }}
                                                >
                                                    <Grid container spacing={1.5}>
                                                        <Grid item xs={12} sm={8}>
                                                            <Autocomplete
                                                                freeSolo
                                                                size="small"
                                                                options={predefinedCamp.activity.name.map((a) => a.name)}
                                                                value={editingActivityData.name}
                                                                onInputChange={(_, value) =>
                                                                    setEditingActivityData({ ...editingActivityData, name: value })
                                                                }
                                                                onChange={(_, value) => {
                                                                    if (!value) return;
                                                                    const preset = predefinedCamp.activity.name.find((a) => a.name === value);
                                                                    setEditingActivityData({
                                                                        ...editingActivityData,
                                                                        name: value,
                                                                        responsible: preset ? preset.responsible : editingActivityData.responsible,
                                                                    });
                                                                }}
                                                                renderInput={(params) => <TextField {...params} placeholder="Nome da atividade *" />}
                                                            />
                                                        </Grid>

                                                        <Grid item xs={12} sm={4}>
                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                placeholder="Responsável"
                                                                value={editingActivityData.responsible}
                                                                onChange={(e) =>
                                                                    setEditingActivityData({ ...editingActivityData, responsible: e.target.value })
                                                                }
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                    {/* Observações */}
                                                    <Box>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{ color: "#666", fontWeight: 600, mb: 1, display: "block" }}
                                                        >
                                                            Observações
                                                        </Typography>
                                                        {(editingActivityData.observation || []).length > 0 && (
                                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1 }}>
                                                                {(editingActivityData.observation || []).map((obs, obsIdx) => (
                                                                    <Box
                                                                        key={obsIdx}
                                                                        sx={{
                                                                            display: "flex",
                                                                            alignItems: "center",
                                                                            gap: 1,
                                                                            bgcolor: editingObsInEditIdx === obsIdx ? "#fff9e6" : "#f8f9fa",
                                                                            p: 0.75,
                                                                            borderRadius: 1,
                                                                            border: `1px solid ${editingObsInEditIdx === obsIdx ? "#f0ad00" : "#dee2e6"}`,
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            variant="caption"
                                                                            sx={{ color: "#666", minWidth: 80, flexShrink: 0 }}
                                                                        >
                                                                            {new Date(obs.date_observation).toLocaleDateString("pt-BR", {
                                                                                timeZone: "UTC",
                                                                            })}
                                                                        </Typography>
                                                                        <Typography variant="caption" sx={{ flex: 1 }}>
                                                                            {obs.text_observation}
                                                                        </Typography>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => {
                                                                                setEditingObsInEditIdx(obsIdx);
                                                                                setNewObsForEdit({
                                                                                    date_observation: obs.date_observation?.split("T")[0] ?? "",
                                                                                    text_observation: obs.text_observation,
                                                                                });
                                                                            }}
                                                                            sx={{ color: "primary.main", p: 0.25 }}
                                                                        >
                                                                            <Pencil size={12} />
                                                                        </IconButton>
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => removeObsFromEdit(obsIdx)}
                                                                            sx={{ color: "error.main", p: 0.25 }}
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </IconButton>
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        )}
                                                        <Grid container spacing={1} alignItems="flex-end">
                                                            <Grid item xs={12} sm={3}>
                                                                <TextField
                                                                    size="small"
                                                                    fullWidth
                                                                    type="date"
                                                                    label="Data"
                                                                    value={newObsForEdit.date_observation}
                                                                    onChange={(e) =>
                                                                        setNewObsForEdit({ ...newObsForEdit, date_observation: e.target.value })
                                                                    }
                                                                    InputLabelProps={{ shrink: true }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} sm={7}>
                                                                <TextField
                                                                    size="small"
                                                                    fullWidth
                                                                    placeholder="Texto da observação"
                                                                    value={newObsForEdit.text_observation}
                                                                    onChange={(e) =>
                                                                        setNewObsForEdit({ ...newObsForEdit, text_observation: e.target.value })
                                                                    }
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} sm={2}>
                                                                <Button
                                                                    variant="outlined"
                                                                    fullWidth
                                                                    size="small"
                                                                    startIcon={
                                                                        editingObsInEditIdx !== null ? <Pencil size={14} /> : <Plus size={14} />
                                                                    }
                                                                    onClick={addObsToEdit}
                                                                    sx={{
                                                                        height: 40,
                                                                        borderColor: editingObsInEditIdx !== null ? "#f0ad00" : "primary.main",
                                                                        color: editingObsInEditIdx !== null ? "#f0ad00" : "primary.main",
                                                                        bgcolor: editingObsInEditIdx !== null ? "#fff9e6" : "#e7f1ff",
                                                                        "&:hover": { bgcolor: editingObsInEditIdx !== null ? "#fff3cc" : "#cce0ff" },
                                                                    }}
                                                                >
                                                                    {editingObsInEditIdx !== null ? "Salvar" : "Adicionar"}
                                                                </Button>
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                    <Grid container spacing={1.5} alignItems="flex-end">
                                                        <Grid item xs={12} sm={3}>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{ display: "block", color: "#666", mb: 0.5, fontWeight: 500 }}
                                                            >
                                                                Data Início
                                                            </Typography>

                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                type="date"
                                                                value={
                                                                    editingActivityData.start_date
                                                                        ? new Date(editingActivityData.start_date).toISOString().split("T")[0]
                                                                        : ""
                                                                }
                                                                onChange={(e) => {
                                                                    const newStartDate = e.target.value;

                                                                    setEditingActivityData({
                                                                        ...editingActivityData,
                                                                        start_date: newStartDate,
                                                                    });
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            />
                                                        </Grid>

                                                        <Grid item xs={12} sm={3}>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{ display: "block", color: "#666", mb: 0.5, fontWeight: 500 }}
                                                            >
                                                                Data Fim
                                                            </Typography>

                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                inputProps={{
                                                                    max: editingActivityData.end_date || undefined,
                                                                }}
                                                                type="date"
                                                                value={
                                                                    editingActivityData.end_date
                                                                        ? new Date(editingActivityData.end_date).toISOString().split("T")[0]
                                                                        : ""
                                                                }
                                                                onChange={(e) => {
                                                                    const newEndDate = e.target.value;

                                                                    setEditingActivityData({
                                                                        ...editingActivityData,
                                                                        end_date: newEndDate,
                                                                    });
                                                                }}
                                                                InputLabelProps={{ shrink: true }}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={12} sm={3}>
                                                            <Typography
                                                                variant="caption"
                                                                sx={{ display: "block", color: "#666", mb: 0.5, fontWeight: 500 }}
                                                            >
                                                                Status
                                                            </Typography>
                                                            <FormControl fullWidth size="small">
                                                                <Select
                                                                    value={editingActivityData.status}
                                                                    onChange={(e) =>
                                                                        setEditingActivityData({
                                                                            ...editingActivityData,
                                                                            status: e.target.value as ActivityStatus,
                                                                        })
                                                                    }
                                                                >
                                                                    {predefinedCamp.activity.status.map((s) => (
                                                                        <MenuItem key={s} value={s}>
                                                                            {s}
                                                                        </MenuItem>
                                                                    ))}
                                                                </Select>
                                                            </FormControl>
                                                        </Grid>
                                                        <Grid item xs={12} sm={3}>
                                                            <Box sx={{ display: "flex", gap: 1 }}>
                                                                <Button
                                                                    variant="outlined"
                                                                    fullWidth
                                                                    onClick={() => setEditingActivityIdx(null)}
                                                                    sx={{ height: 40 }}
                                                                >
                                                                    Cancelar
                                                                </Button>
                                                                <Button variant="contained" fullWidth onClick={saveEditActivity} sx={{ height: 40 }}>
                                                                    Salvar
                                                                </Button>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            );
                                        }

                                        return (
                                            <Box
                                                key={idx}
                                                onClick={() => setExpandedObsIdx(expandedObsIdx === idx ? null : idx)}
                                                sx={{
                                                    bgcolor: "white",
                                                    p: 1.5,
                                                    borderRadius: 1,
                                                    border: "1px solid #dee2e6",
                                                    cursor: "pointer",
                                                    transition: "box-shadow 0.18s ease",
                                                    "&:hover": { boxShadow: "0 2px 10px rgba(0,0,0,0.10)" },
                                                }}
                                            >
                                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {activity.name}
                                                            </Typography>
                                                            {(activity.observation?.length ?? 0) > 0 ? (
                                                                <Box
                                                                    sx={{
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        gap: 0.5,
                                                                        bgcolor: "#f0f4ff",
                                                                        px: 0.75,
                                                                        py: 0.25,
                                                                        borderRadius: 1,
                                                                        flexShrink: 0,
                                                                        marginLeft: "auto",
                                                                    }}
                                                                >
                                                                    <MessageSquare size={11} color="#1351B4" />
                                                                    <Typography variant="caption" sx={{ fontSize: "0.65rem", color: "#1351B4" }}>
                                                                        {activity.observation!.length} obs.
                                                                    </Typography>
                                                                </Box>
                                                            ) : (
                                                                <Box
                                                                    sx={{
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        gap: 0.5,
                                                                        flexShrink: 0,
                                                                        marginLeft: "auto",
                                                                    }}
                                                                >
                                                                    <MessageSquare size={11} color="#adb5bd" />
                                                                    <Typography variant="caption" sx={{ fontSize: "0.65rem", color: "#adb5bd" }}>
                                                                        0 obs.
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
                                                            <Chip
                                                                label={activity.status}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: colors.bg,
                                                                    color: colors.color,
                                                                    fontSize: "0.65rem",
                                                                    fontWeight: 600,
                                                                    textTransform: "uppercase",
                                                                    height: 20,
                                                                }}
                                                            />
                                                            {activity.responsible && (
                                                                <Chip
                                                                    label={`Resp: ${activity.responsible}`}
                                                                    size="small"
                                                                    sx={{ bgcolor: "#e7f1ff", color: "#1351B4", fontSize: "0.65rem", height: 20 }}
                                                                />
                                                            )}
                                                            {activity.start_date && activity.end_date && (
                                                                <Box
                                                                    sx={{
                                                                        display: "inline-flex",
                                                                        alignItems: "center",
                                                                        gap: 0.5,
                                                                        bgcolor: "#f0fdf4",
                                                                        color: "#168821",
                                                                        px: 0.75,
                                                                        py: 0.25,
                                                                        borderRadius: 1,
                                                                    }}
                                                                >
                                                                    <Calendar size={11} />
                                                                    <Typography variant="caption" sx={{ color: "#168821", fontSize: "0.65rem" }}>
                                                                        {activity.start_date?.split("T")[0].split("-").reverse().join("/")} –{" "}
                                                                        {activity.end_date?.split("T")[0].split("-").reverse().join("/")}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                            {progress > -1 && (
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, marginLeft: "auto" }}>
                                                                    <Typography variant="caption" sx={{ minWidth: 40 }}>
                                                                        {progress}%
                                                                    </Typography>
                                                                    <LinearProgress
                                                                        variant="determinate"
                                                                        color={colors.colorMui}
                                                                        value={progress}
                                                                        aria-label="Export data"
                                                                        sx={{ width: "10dvw" }}
                                                                    />
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                    {!readOnly && (
                                                        <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => startEditActivity(idx)}
                                                                sx={{
                                                                    bgcolor: "#e7f1ff",
                                                                    border: "1px solid #1351B4",
                                                                    color: "primary.main",
                                                                    borderRadius: 1,
                                                                    "&:hover": { bgcolor: "#cce0ff" },
                                                                }}
                                                            >
                                                                <Pencil size={14} />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => removeActivity(idx)}
                                                                sx={{
                                                                    bgcolor: "#ffe5e5",
                                                                    border: "1px solid #E52207",
                                                                    color: "error.main",
                                                                    borderRadius: 1,
                                                                    "&:hover": { bgcolor: "#ffcccc" },
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </IconButton>
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Collapse in={expandedObsIdx === idx}>
                                                    <Box
                                                        sx={{
                                                            mt: 1,
                                                            pt: 1,
                                                            borderTop: "1px solid #dee2e6",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: 0.5,
                                                        }}
                                                    >
                                                        {(activity.observation || []).map((obs, obsIdx) => (
                                                            <Box key={obsIdx} sx={{ display: "flex", gap: 1 }}>
                                                                <Typography
                                                                    variant="caption"
                                                                    sx={{ color: "#888", minWidth: 70, fontSize: "0.6rem", flexShrink: 0 }}
                                                                >
                                                                    {new Date(obs.date_observation).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ fontSize: "0.6rem", color: "#495057" }}>
                                                                    {obs.text_observation}
                                                                </Typography>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Collapse>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}

                            {!readOnly && <Divider sx={{ my: 2 }} />}

                            {/* Add new activity */}
                            {!readOnly && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                    <Grid container spacing={1.5}>
                                        <Grid item xs={12} sm={8}>
                                            <Autocomplete
                                                freeSolo
                                                size="small"
                                                options={predefinedCamp.activity.name.map((a) => a.name)}
                                                value={newActivity.name}
                                                onInputChange={(_, value) => setNewActivity({ ...newActivity, name: value })}
                                                onChange={(_, value) => {
                                                    if (!value) return;
                                                    const preset = predefinedCamp.activity.name.find((a) => a.name === value);
                                                    setNewActivity({
                                                        ...newActivity,
                                                        name: value,
                                                        responsible: preset ? preset.responsible : newActivity.responsible,
                                                    });
                                                }}
                                                renderInput={(params) => <TextField {...params} placeholder="Nome da atividade *" />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                placeholder="Responsável"
                                                value={newActivity.responsible}
                                                onChange={(e) => setNewActivity({ ...newActivity, responsible: e.target.value })}
                                            />
                                        </Grid>
                                    </Grid>

                                    {/* Observações */}
                                    <Box>
                                        <Typography variant="caption" sx={{ color: "#666", fontWeight: 600, mb: 1, display: "block" }}>
                                            Observações
                                        </Typography>
                                        {(newActivity.observation || []).length > 0 && (
                                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1 }}>
                                                {(newActivity.observation || []).map((obs, obsIdx) => (
                                                    <Box
                                                        key={obsIdx}
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 1,
                                                            bgcolor: editingObsInNewIdx === obsIdx ? "#fff9e6" : "#f8f9fa",
                                                            p: 0.75,
                                                            borderRadius: 1,
                                                            border: `1px solid ${editingObsInNewIdx === obsIdx ? "#f0ad00" : "#dee2e6"}`,
                                                        }}
                                                    >
                                                        <Typography variant="caption" sx={{ color: "#666", minWidth: 80, flexShrink: 0 }}>
                                                            {new Date(obs.date_observation).toLocaleDateString("pt-BR", { timeZone: "UTC" })}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ flex: 1 }}>
                                                            {obs.text_observation}
                                                        </Typography>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setEditingObsInNewIdx(obsIdx);
                                                                setNewObsForNew({
                                                                    date_observation: obs.date_observation?.split("T")[0] ?? "",
                                                                    text_observation: obs.text_observation,
                                                                });
                                                            }}
                                                            sx={{ color: "primary.main", p: 0.25 }}
                                                        >
                                                            <Pencil size={12} />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeObsFromNew(obsIdx)}
                                                            sx={{ color: "error.main", p: 0.25 }}
                                                        >
                                                            <Trash2 size={12} />
                                                        </IconButton>
                                                    </Box>
                                                ))}
                                            </Box>
                                        )}
                                        <Grid container spacing={1} alignItems="flex-end">
                                            <Grid item xs={12} sm={3}>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    type="date"
                                                    label="Data"
                                                    value={newObsForNew.date_observation}
                                                    onChange={(e) => setNewObsForNew({ ...newObsForNew, date_observation: e.target.value })}
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={7}>
                                                <TextField
                                                    size="small"
                                                    fullWidth
                                                    placeholder="Texto da observação"
                                                    value={newObsForNew.text_observation}
                                                    onChange={(e) => setNewObsForNew({ ...newObsForNew, text_observation: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={2}>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    size="small"
                                                    startIcon={editingObsInNewIdx !== null ? <Pencil size={14} /> : <Plus size={14} />}
                                                    onClick={addObsToNew}
                                                    sx={{
                                                        height: 40,
                                                        borderColor: editingObsInNewIdx !== null ? "#f0ad00" : "primary.main",
                                                        color: editingObsInNewIdx !== null ? "#f0ad00" : "primary.main",
                                                        bgcolor: editingObsInNewIdx !== null ? "#fff9e6" : "#e7f1ff",
                                                        "&:hover": { bgcolor: editingObsInNewIdx !== null ? "#fff3cc" : "#cce0ff" },
                                                    }}
                                                >
                                                    {editingObsInNewIdx !== null ? "Salvar" : "Adicionar"}
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    <Grid container spacing={1.5} alignItems="flex-end">
                                        <Grid item xs={12} sm={3}>
                                            <Typography variant="caption" sx={{ display: "block", color: "#666", mb: 0.5, fontWeight: 500 }}>
                                                Data Início
                                            </Typography>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                type="date"
                                                value={newActivity.start_date}
                                                onChange={(e) => setNewActivity({ ...newActivity, start_date: e.target.value })}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3}>
                                            <Typography variant="caption" sx={{ display: "block", color: "#666", mb: 0.5, fontWeight: 500 }}>
                                                Data Fim
                                            </Typography>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                type="date"
                                                value={newActivity.end_date}
                                                onChange={(e) => setNewActivity({ ...newActivity, end_date: e.target.value })}
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>

                                        <Grid item xs={12} sm={3}>
                                            <Typography variant="caption" sx={{ display: "block", color: "#666", mb: 0.5, fontWeight: 500 }}>
                                                Status
                                            </Typography>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={newActivity.status}
                                                    onChange={(e) => setNewActivity({ ...newActivity, status: e.target.value as ActivityStatus })}
                                                >
                                                    {predefinedCamp.activity.status.map((s) => (
                                                        <MenuItem key={s} value={s}>
                                                            {s}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        {/* <Grid item xs={12} sm={1}>
                                            <Button
                                                variant="outlined"
                                                sx={{
                                                    height: 40,
                                                    bgcolor: "#ecf59a96",
                                                    borderColor: "#485002",
                                                    color: "primary.main",
                                                    "&:hover": { bgcolor: "#ecf59a" },
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                <Star size={18} color="#282900" fill="#fbff00" />
                                            </Button>
                                        </Grid> */}
                                        <Grid item xs={12} sm={3}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                startIcon={<Plus size={16} />}
                                                onClick={addActivity}
                                                sx={{
                                                    height: 40,
                                                    bgcolor: "#e7f1ff",
                                                    borderColor: "primary.main",
                                                    color: "primary.main",
                                                    "&:hover": { bgcolor: "#cce0ff" },
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                Adicionar
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Paper>

                        {/* Equipments */}
                        <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "#f8f9fa" }}>
                            <Typography variant="body1" fontWeight={600} sx={{ mb: 2, color: "#495057" }}>
                                Equipamentos
                            </Typography>

                            {/* Existing machines */}
                            {formData.machine.length > 0 && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
                                    {formData.machine.map((machine, idx) => {
                                        const isEditing = editingMachineIdx === idx;

                                        if (!readOnly && isEditing) {
                                            return (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        bgcolor: "white",
                                                        p: 1.5,
                                                        borderRadius: 1,
                                                        border: "1px solid #1351B4",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        gap: 1.5,
                                                    }}
                                                >
                                                    <Grid container spacing={1.5}>
                                                        <Grid item xs={12} sm={6}>
                                                            <Autocomplete
                                                                freeSolo
                                                                size="small"
                                                                options={predefinedCamp.equipament.SIMB}
                                                                inputValue={editingMachineData.simb}
                                                                onInputChange={(_, value) => {
                                                                    if (typeof value !== "string") return;

                                                                    const v = value.replace(/^E?/i, "");
                                                                    setEditingMachineData({
                                                                        ...editingMachineData,
                                                                        simb: `E${v}`,
                                                                    });
                                                                }}
                                                                renderInput={(params) => <TextField {...params} placeholder="Simb" />}
                                                            />
                                                        </Grid>

                                                        <Grid item xs={12} sm={6}>
                                                            <Autocomplete
                                                                freeSolo
                                                                size="small"
                                                                options={predefinedCamp.equipament.description}
                                                                value={editingMachineData.descricao}
                                                                onInputChange={(_, value) =>
                                                                    setEditingMachineData({ ...editingMachineData, descricao: value })
                                                                }
                                                                onChange={(_, value) => {
                                                                    if (!value) {
                                                                        setEditingMachineData({ ...editingMachineData, descricao: "" });
                                                                        return;
                                                                    }
                                                                    setEditingMachineData({ ...editingMachineData, descricao: value });
                                                                }}
                                                                renderInput={(params) => <TextField {...params} placeholder="Descrição" />}
                                                            />
                                                        </Grid>

                                                        <Grid item xs={12} sm={4}>
                                                            {/* <TextField
                                                                size="small"
                                                                fullWidth
                                                                label="Status"
                                                                value={editingMachineData.status}
                                                                onChange={(e) =>
                                                                    setEditingMachineData({
                                                                        ...editingMachineData,
                                                                        status: e.target.value,
                                                                    })
                                                                }
                                                            /> */}
                                                            <Autocomplete
                                                                freeSolo
                                                                size="small"
                                                                options={predefinedCamp.equipament.status}
                                                                inputValue={editingMachineData.status}
                                                                onInputChange={(_, value) =>
                                                                    setEditingMachineData({ ...editingMachineData, status: value })
                                                                }
                                                                onChange={(_, e) => {
                                                                    if (!e) return;
                                                                    setEditingMachineData({
                                                                        ...editingMachineData,
                                                                        status: e,
                                                                    });
                                                                }}
                                                                renderInput={(params) => <TextField {...params} placeholder="status" />}
                                                            />
                                                        </Grid>

                                                        <Grid item xs={12} sm={4}>
                                                            <Autocomplete
                                                                freeSolo
                                                                size="small"
                                                                options={predefinedCamp.equipament.marca}
                                                                inputValue={editingMachineData.marca || ""}
                                                                onChange={(_, e) =>
                                                                    setEditingMachineData({
                                                                        ...editingMachineData,
                                                                        marca: e,
                                                                    })
                                                                }
                                                                renderInput={(params) => <TextField {...params} placeholder="Marca" />}
                                                            />
                                                        </Grid>

                                                        <Grid item xs={12} sm={4}>
                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                type="number"
                                                                label="Quantidade"
                                                                value={editingMachineData.quantidade}
                                                                onChange={(e) =>
                                                                    setEditingMachineData({
                                                                        ...editingMachineData,
                                                                        quantidade: Number(e.target.value),
                                                                    })
                                                                }
                                                            />
                                                        </Grid>

                                                        <Grid item xs={12} sm={6}>
                                                            <TextField
                                                                size="small"
                                                                fullWidth
                                                                type="date"
                                                                label="Previsão de Entrega"
                                                                value={
                                                                    editingMachineData.previsao_entrega
                                                                        ? new Date(editingMachineData.previsao_entrega).toISOString().split("T")[0]
                                                                        : ""
                                                                }
                                                                onChange={(e) =>
                                                                    setEditingMachineData({
                                                                        ...editingMachineData,
                                                                        previsao_entrega: new Date(e.target.value),
                                                                    })
                                                                }
                                                                InputLabelProps={{ shrink: true }}
                                                            />
                                                        </Grid>

                                                        <Grid item xs={12} sm={6}>
                                                            <Box sx={{ display: "flex", gap: 1, height: "100%" }}>
                                                                <Button variant="outlined" fullWidth onClick={() => setEditingMachineDataIdx(null)}>
                                                                    Cancelar
                                                                </Button>

                                                                <Button variant="contained" fullWidth onClick={saveEditMachine}>
                                                                    Salvar
                                                                </Button>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            );
                                        }

                                        return (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    bgcolor: "white",
                                                    p: 1.5,
                                                    borderRadius: 1,
                                                    border: "1px solid #dee2e6",
                                                    gap: 2,
                                                }}
                                            >
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                                                        {machine.descricao}
                                                    </Typography>

                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            flexWrap: "wrap",
                                                            gap: 0.5,
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        {Object.entries(machine as InstitutionEquipment).map(([key, value]) => {
                                                            if (value === null || value === undefined || chipColors[key] === undefined) return null;

                                                            return (
                                                                <Chip
                                                                    key={key}
                                                                    label={`${formatKey(fieldLabels[key] ?? key)}${formatValue(value)}`}
                                                                    size="small"
                                                                    sx={{
                                                                        bgcolor: chipColors[key] || "#999",
                                                                        color: "white",
                                                                        fontSize: "0.65rem",
                                                                        fontWeight: 600,
                                                                        textTransform: "uppercase",
                                                                        height: 20,
                                                                        margin: "0.2rem",
                                                                    }}
                                                                />
                                                            );
                                                        })}
                                                    </Box>
                                                </Box>

                                                {!readOnly && (
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            gap: 0.5,
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => startEditMachine(idx)}
                                                            sx={{
                                                                bgcolor: "#e7f1ff",
                                                                border: "1px solid #1351B4",
                                                                color: "primary.main",
                                                                borderRadius: 1,
                                                                "&:hover": {
                                                                    bgcolor: "#cce0ff",
                                                                },
                                                            }}
                                                        >
                                                            <Pencil size={14} />
                                                        </IconButton>

                                                        <IconButton
                                                            size="small"
                                                            onClick={() => removeMachine(idx)}
                                                            sx={{
                                                                bgcolor: "#ffe5e5",
                                                                border: "1px solid #E52207",
                                                                color: "error.main",
                                                                borderRadius: 1,
                                                                "&:hover": {
                                                                    bgcolor: "#ffcccc",
                                                                },
                                                            }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </IconButton>
                                                    </Box>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Box>
                            )}

                            {!readOnly && <Divider sx={{ my: 2 }} />}

                            {/* Add new machine */}
                            {!readOnly && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                    <Grid container spacing={1.5}>
                                        <Grid item xs={12} sm={6}>
                                            <Autocomplete
                                                freeSolo
                                                size="small"
                                                options={predefinedCamp.equipament.SIMB}
                                                inputValue={editingMachineData.simb}
                                                onInputChange={(_, value) => {
                                                    if (typeof value !== "string") return;

                                                    const v = value.replace(/^E?/i, "");
                                                    setEditingMachineData({
                                                        ...editingMachineData,
                                                        simb: `E${v}`,
                                                    });
                                                }}
                                                renderInput={(params) => <TextField {...params} placeholder="Simb" />}
                                            />
                                            {/* <TextField
                                                type="text"
                                                size="small"
                                                fullWidth
                                                label="SIMB"
                                                value={editingMachineData.simb}
                                                onChange={(e) => {
                                                    const value = e.target.value.replace(/^E?/i, "");

                                                    setEditingMachineData({
                                                        ...editingMachineData,
                                                        simb: `E${value}`,
                                                    });
                                                }}
                                            /> */}
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Autocomplete
                                                freeSolo
                                                size="small"
                                                options={predefinedCamp.equipament.description}
                                                value={editingMachineData.descricao}
                                                onInputChange={(_, value) => setEditingMachineData({ ...editingMachineData, descricao: value })}
                                                onChange={(_, value) => {
                                                    if (!value) {
                                                        setEditingMachineData({ ...editingMachineData, descricao: "" });
                                                        return;
                                                    }
                                                    setEditingMachineData({ ...editingMachineData, descricao: value });
                                                }}
                                                renderInput={(params) => <TextField {...params} placeholder="Descrição" />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Autocomplete
                                                freeSolo
                                                size="small"
                                                options={predefinedCamp.equipament.status}
                                                inputValue={editingMachineData.status}
                                                onInputChange={(_, value) => setEditingMachineData({ ...editingMachineData, status: value })}
                                                onChange={(_, e) => {
                                                    if (!e) return;
                                                    setEditingMachineData({
                                                        ...editingMachineData,
                                                        status: e,
                                                    });
                                                }}
                                                renderInput={(params) => <TextField {...params} placeholder="Status" />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Autocomplete
                                                freeSolo
                                                size="small"
                                                options={predefinedCamp.equipament.marca}
                                                inputValue={editingMachineData.marca || ""}
                                                onInputChange={(_, value) => {
                                                    setEditingMachineData({
                                                        ...editingMachineData,
                                                        marca: value,
                                                    });
                                                }}
                                                onChange={(_, value) => {
                                                    setEditingMachineData({
                                                        ...editingMachineData,
                                                        marca: value ?? "",
                                                    });
                                                }}
                                                renderInput={(params) => <TextField {...params} placeholder="Marca" />}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                type="number"
                                                label="Quantidade"
                                                value={editingMachineData.quantidade}
                                                onChange={(e) => setEditingMachineData({ ...editingMachineData, quantidade: Number(e.target.value) })}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={9}>
                                            <Typography variant="caption" sx={{ display: "block", color: "#666", mb: 0.5, fontWeight: 500 }}>
                                                Previsão de Entrega
                                            </Typography>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                type="date"
                                                value={
                                                    editingMachineData.previsao_entrega instanceof Date &&
                                                    !isNaN(editingMachineData.previsao_entrega.getTime())
                                                        ? editingMachineData.previsao_entrega.toISOString().split("T")[0]
                                                        : ""
                                                }
                                                onChange={(e) =>
                                                    setEditingMachineData({
                                                        ...editingMachineData,
                                                        previsao_entrega: e.target.value ? new Date(e.target.value) : undefined,
                                                    })
                                                }
                                                InputLabelProps={{ shrink: true }}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={3} sx={{ display: "flex", alignItems: "flex-end" }}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                startIcon={<Plus size={16} />}
                                                onClick={addMachine}
                                                sx={{
                                                    height: 40,
                                                    bgcolor: "#e7f1ff",
                                                    borderColor: "primary.main",
                                                    color: "primary.main",
                                                    "&:hover": { bgcolor: "#cce0ff" },
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                Adicionar
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Paper>
                        {/* Photo Gallery */}
                        {institution?.id && (
                            <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "#f8f9fa", mt: 2 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        mb: photos.length > 0 || loadingPhotos ? 2 : 0,
                                    }}
                                >
                                    <Typography variant="body1" fontWeight={600} sx={{ color: "#495057" }}>
                                        Galeria de Fotos
                                    </Typography>
                                    <Button
                                        type="button"
                                        variant="outlined"
                                        size="small"
                                        startIcon={loadingUpload ? <CircularProgress size={14} /> : <Upload size={16} />}
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={loadingUpload}
                                        sx={{ borderColor: "primary.main", color: "primary.main", "&:hover": { bgcolor: "#e7f1ff" } }}
                                    >
                                        Adicionar Foto
                                    </Button>
                                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUploadPhoto} />
                                </Box>

                                {loadingPhotos ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : photos.length === 0 ? (
                                    <Typography variant="body2" sx={{ color: "#adb5bd", textAlign: "center", py: 2, fontStyle: "italic" }}>
                                        Nenhuma foto cadastrada
                                    </Typography>
                                ) : (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {photos.map((photo) => (
                                            <Box
                                                key={photo.id}
                                                sx={{
                                                    position: "relative",
                                                    width: 100,
                                                    height: 100,
                                                    borderRadius: 1,
                                                    overflow: "hidden",
                                                    border: "1px solid #dee2e6",
                                                    cursor: "pointer",
                                                    flexShrink: 0,
                                                    "&:hover .del-btn": { opacity: 1 },
                                                }}
                                                onClick={() => setPreviewPhoto(photo)}
                                            >
                                                <img
                                                    src={photoToDataUrl(photo)}
                                                    alt={photo.original_name || "foto"}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        objectFit: "cover",
                                                    }}
                                                />

                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bgcolor: "rgba(0,0,0,0.7)",
                                                        color: "white",
                                                        fontSize: "10px",
                                                        px: 0.5,
                                                        py: 0.25,
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {new Date(photo.created_at).toLocaleDateString("pt-BR")}
                                                </Box>

                                                <IconButton
                                                    className="del-btn"
                                                    size="small"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeletePhoto(photo.id);
                                                    }}
                                                    sx={{
                                                        position: "absolute",
                                                        top: 4,
                                                        right: 4,
                                                        opacity: 0,
                                                        transition: "opacity 0.15s",
                                                        bgcolor: "rgba(229,34,7,0.85)",
                                                        color: "white",
                                                        width: 24,
                                                        height: 24,
                                                        "&:hover": {
                                                            bgcolor: "rgba(229,34,7,1)",
                                                            opacity: "1 !important",
                                                        },
                                                    }}
                                                >
                                                    <Trash2 size={12} />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                )}
                            </Paper>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 2, borderTop: "1px solid #dee2e6", gap: 1.5 }}>
                        {readOnly ? (
                            <>
                                {onEdit && (
                                    <Button variant="contained" color="primary" onClick={onEdit}>
                                        Editar
                                    </Button>
                                )}
                                <Button
                                    variant="contained"
                                    onClick={onCancel}
                                    sx={{ bgcolor: "#6c757d", color: "white", "&:hover": { bgcolor: "#5a6268" } }}
                                >
                                    Fechar
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="contained"
                                    color="inherit"
                                    onClick={onCancel}
                                    sx={{ bgcolor: "#6c757d", color: "white", "&:hover": { bgcolor: "#5a6268" } }}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="contained" color="primary">
                                    Salvar
                                </Button>
                            </>
                        )}
                    </DialogActions>
                </form>
            </Dialog>

            {previewPhoto && (
                <Dialog open onClose={() => setPreviewPhoto(null)} maxWidth="lg">
                    <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 1.5 }}>
                        <Typography variant="body1" fontWeight={600}>
                            {previewPhoto.original_name || "Foto"}
                        </Typography>
                        <IconButton onClick={() => setPreviewPhoto(null)} size="small">
                            <X size={18} />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ p: 1 }}>
                        <img
                            src={photoToDataUrl(previewPhoto)}
                            alt={previewPhoto.original_name || "foto"}
                            style={{ maxWidth: "100%", maxHeight: "75vh", objectFit: "contain", display: "block" }}
                        />
                    </DialogContent>
                </Dialog>
            )}

            <Dialog open={deletingPhotoId !== null} onClose={() => setDeletingPhotoId(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Remover foto</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">Tem certeza que deseja remover esta foto?</Typography>
                </DialogContent>
                <DialogActions sx={{ gap: 1, p: 2 }}>
                    <Button variant="outlined" onClick={() => setDeletingPhotoId(null)}>
                        Cancelar
                    </Button>
                    <Button type="button" variant="contained" color="error" onClick={confirmDeletePhoto}>
                        Remover
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
