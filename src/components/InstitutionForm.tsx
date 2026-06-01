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
} from "@mui/material";
import { Plus, Pencil, Trash2, Calendar, X, Upload } from "lucide-react";
import { Institution, Activity, InstitutionStatus, ActivityStatus, InstitutionEquipment, InstitutionPhoto } from "../types";
import { chipColors } from "../data/const";
import { api } from "../service";

interface InstitutionFormProps {
    institution: Institution | null;
    onSave: (data: Omit<Institution, "id">) => void;
    onCancel: () => void;
    onEdit?: () => void;
    readOnly?: boolean;
}

const STATUS_OPTIONS: InstitutionStatus[] = ["Não iniciado", "Em andamento", "Concluído", "Atrasado", "Pendente"];
const ACTIVITY_STATUS_OPTIONS: ActivityStatus[] = ["Projetado", "Em andamento", "Concluído"];
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

const emptyActivity: Activity = { name: "", responsible: "", start_date: "", end_date: "", status: "Projetado", observations: "" };

const emptyEquipament: InstitutionEquipment = {
    descricao: "",
    id: 0,
    id_instituicion: 0,
    quantidade: 0,
    simb: "",
    status: "",
    marca: "",
    previsao_entrega: new Date(),
    created_at: new Date(),
};

const PREDEFINED_ACTIVITIES: { name: string; responsible: string }[] = [
    { name: "Entrega Scanner", responsible: "ACC" },
    { name: "Visita Técnica", responsible: "ACC" },
    { name: "Visita do Ministério", responsible: "MS" },
    { name: "Apresentação da arquitetura do sistema para implantação", responsible: "ACC" },
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
];

const activityStatusColors: Record<ActivityStatus, { bg: string; color: string }> = {
    Concluído: { bg: "#168821", color: "#fff" },
    "Em andamento": { bg: "#1351B4", color: "#fff" },
    Projetado: { bg: "#FF8C00", color: "#fff" },
    Planejado: { bg: "#FF8C00", color: "#fff" },
};

export default function InstitutionForm({ institution, onSave, onCancel, onEdit, readOnly = false }: InstitutionFormProps) {
    const [formData, setFormData] = useState<Omit<Institution, "id">>(
        institution
            ? { ...institution }
            : { name: "", state: "", responsible: "", status: "Não iniciado", observations: "", activities: [], machine: [] }
    );
    const [newActivity, setNewActivity] = useState<Activity>({ ...emptyActivity });
    const [editingActivityIdx, setEditingActivityIdx] = useState<number | null>(null);
    const [editingActivityData, setEditingActivityData] = useState<Activity>({ ...emptyActivity });
    const [editingMachineData, setEditingMachineData] = useState<InstitutionEquipment>({ ...emptyEquipament });
    const [editingMachineIdx, setEditingMachineDataIdx] = useState<number | null>(null);

    const [photos, setPhotos] = useState<InstitutionPhoto[]>([]);
    const [loadingPhotos, setLoadingPhotos] = useState(false);
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [previewPhoto, setPreviewPhoto] = useState<InstitutionPhoto | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const addActivity = () => {
        if (newActivity.name.trim()) {
            setFormData((prev) => ({ ...prev, activities: [...(prev.activities || []), { ...newActivity }] }));
            setNewActivity({ ...emptyActivity });
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

            setEditingMachineData({ ...emptyEquipament });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, state, responsible, status, observations } = formData;
        onSave({
            name,
            state,
            responsible,
            status,
            observations,
            activities: formData.activities.map(({ name, responsible, start_date, end_date, status, observations }) => ({
                name, responsible, start_date, end_date, status, observations,
            })),
            machine: formData.machine.map(({ simb, descricao, status, marca, quantidade, previsao_entrega }) => ({
                simb, descricao, status, marca, quantidade, previsao_entrega,
            })),
        });
    };

    return (
        <>
        <Dialog open fullWidth maxWidth="md" PaperProps={{ sx: { maxHeight: "90vh" } }}>
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

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: 3 }}>
                    {/* Institution name */}
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
                                <Select label="Estado" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })}>
                                    <MenuItem value="">
                                        <em>Selecione</em>
                                    </MenuItem>
                                    {BRAZIL_STATES.map((s) => (
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
                                    {STATUS_OPTIONS.map((s) => (
                                        <MenuItem key={s} value={s}>
                                            {s}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    {/* Responsible */}
                    <Box sx={{ mb: 2.5 }}>
                        <TextField
                            label="Responsável"
                            fullWidth
                            value={formData.responsible}
                            onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                            placeholder="Ex: ACC"
                            required
                            disabled={readOnly}
                        />
                    </Box>

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
                    <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "#f8f9fa" }}>
                        <Typography variant="body1" fontWeight={600} sx={{ mb: 2, color: "#495057" }}>
                            Atividades e Cronograma
                        </Typography>

                        {/* Existing activities */}
                        {formData.activities.length > 0 && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
                                {formData.activities.map((activity, idx) => {
                                    const colors = activityStatusColors[activity.status] || { bg: "#1351B4", color: "#fff" };
                                    const isEditing = editingActivityIdx === idx;

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
                                                            options={PREDEFINED_ACTIVITIES.map((a) => a.name)}
                                                            value={editingActivityData.name}
                                                            onInputChange={(_, value) =>
                                                                setEditingActivityData({ ...editingActivityData, name: value })
                                                            }
                                                            onChange={(_, value) => {
                                                                if (!value) return;
                                                                const preset = PREDEFINED_ACTIVITIES.find((a) => a.name === value);
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
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            placeholder="Observações"
                                                            value={editingActivityData.observations || ""}
                                                            onChange={(e) =>
                                                                setEditingActivityData({ ...editingActivityData, observations: e.target.value })
                                                            }
                                                        />
                                                    </Grid>
                                                </Grid>
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
                                                            value={editingActivityData.start_date}
                                                            onChange={(e) =>
                                                                setEditingActivityData({ ...editingActivityData, start_date: e.target.value })
                                                            }
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
                                                            type="date"
                                                            value={editingActivityData.end_date}
                                                            onChange={(e) =>
                                                                setEditingActivityData({ ...editingActivityData, end_date: e.target.value })
                                                            }
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
                                                                {ACTIVITY_STATUS_OPTIONS.map((s) => (
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
                                                    {activity.name}
                                                </Typography>
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
                                                                {new Date(activity.start_date).toLocaleDateString("pt-BR")} –{" "}
                                                                {new Date(activity.end_date).toLocaleDateString("pt-BR")}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                                {activity.observations && (
                                                    <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "#555", fontStyle: "italic" }}>
                                                        {activity.observations}
                                                    </Typography>
                                                )}
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
                                            options={PREDEFINED_ACTIVITIES.map((a) => a.name)}
                                            value={newActivity.name}
                                            onInputChange={(_, value) => setNewActivity({ ...newActivity, name: value })}
                                            onChange={(_, value) => {
                                                if (!value) return;
                                                const preset = PREDEFINED_ACTIVITIES.find((a) => a.name === value);
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
                                    <Grid item xs={12}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            placeholder="Observações"
                                            value={newActivity.observations || ""}
                                            onChange={(e) => setNewActivity({ ...newActivity, observations: e.target.value })}
                                        />
                                    </Grid>
                                </Grid>

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
                                                {ACTIVITY_STATUS_OPTIONS.map((s) => (
                                                    <MenuItem key={s} value={s}>
                                                        {s}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
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
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            label="SIMB"
                                                            value={editingMachineData.simb}
                                                            onChange={(e) =>
                                                                setEditingMachineData({
                                                                    ...editingMachineData,
                                                                    simb: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            label="Descrição"
                                                            value={editingMachineData.descricao}
                                                            onChange={(e) =>
                                                                setEditingMachineData({
                                                                    ...editingMachineData,
                                                                    descricao: e.target.value,
                                                                })
                                                            }
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} sm={4}>
                                                        <TextField
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
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} sm={4}>
                                                        <TextField
                                                            size="small"
                                                            fullWidth
                                                            label="Marca"
                                                            value={editingMachineData.marca || ""}
                                                            onChange={(e) =>
                                                                setEditingMachineData({
                                                                    ...editingMachineData,
                                                                    marca: e.target.value,
                                                                })
                                                            }
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
                                                            label="Previsão Entrega"
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
                                                                label={`${key}: ${value instanceof Date ? value.toLocaleDateString("pt-BR") : value}`}
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
                                        <TextField
                                            size="small"
                                            fullWidth
                                            label="SIMB"
                                            value={editingMachineData.simb}
                                            onChange={(e) => setEditingMachineData({ ...editingMachineData, simb: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            label="Descrição"
                                            value={editingMachineData.descricao}
                                            onChange={(e) => setEditingMachineData({ ...editingMachineData, descricao: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            label="Status"
                                            value={editingMachineData.status}
                                            onChange={(e) => setEditingMachineData({ ...editingMachineData, status: e.target.value })}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            label="Marca"
                                            value={editingMachineData.marca || ""}
                                            onChange={(e) => setEditingMachineData({ ...editingMachineData, marca: e.target.value })}
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
                                            Previsão Entrega
                                        </Typography>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            type="date"
                                            value={
                                                editingMachineData.previsao_entrega
                                                    ? new Date(editingMachineData.previsao_entrega).toISOString().split("T")[0]
                                                    : ""
                                            }
                                            onChange={(e) => setEditingMachineData({ ...editingMachineData, previsao_entrega: new Date(e.target.value) })}
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
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: photos.length > 0 || loadingPhotos ? 2 : 0 }}>
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
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleUploadPhoto}
                                />
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
                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            />
                                            <IconButton
                                                type="button"
                                                className="del-btn"
                                                size="small"
                                                onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
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
                                                    "&:hover": { bgcolor: "rgba(229,34,7,1)", opacity: "1 !important" },
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
                <Button variant="outlined" onClick={() => setDeletingPhotoId(null)}>Cancelar</Button>
                <Button type="button" variant="contained" color="error" onClick={confirmDeletePhoto}>Remover</Button>
            </DialogActions>
        </Dialog>
        </>
    );
}
