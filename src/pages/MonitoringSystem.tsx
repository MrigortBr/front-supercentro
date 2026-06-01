import { useState, useEffect } from "react";
import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputAdornment,
    Grid,
    Alert,
    Snackbar,
    Paper,
    CircularProgress,
} from "@mui/material";

import { BarChart3, Plus, Download, Search, Save, Settings, Calendar } from "lucide-react";

import InstitutionCard from "../components/InstitutionCard";
import InstitutionForm from "../components/InstitutionForm";
import GanttChart from "../components/GanttChart";
import Footer from "../components/Footer";

import { Institution, ViewType, InstitutionStatus } from "../types";

import { api } from "../service";

export default function MonitoringSystem() {
    const [institutions, setInstitutions] = useState<Institution[]>([]);

    const [loading, setLoading] = useState(false);

    const [currentView, setCurrentView] = useState<ViewType>("list");

    const [showForm, setShowForm] = useState(false);

    const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

    const [viewingInstitution, setViewingInstitution] = useState<Institution | null>(null);

    const [searchTerm, setSearchTerm] = useState("");

    const [filterStatus, setFilterStatus] = useState<InstitutionStatus | "all">("all");

    const [saveSnackbar, setSaveSnackbar] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);

            const response = await api.getInstituicions();

            setInstitutions(response.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // =========================
    // CREATE / UPDATE
    // =========================

    const handleSave = async (institutionData: Omit<Institution, "id">) => {
        try {
            if (editingInstitution) {
                await api.updateInstituicion(editingInstitution.id, institutionData);
            } else {
                await api.createInstituicion(institutionData);
            }

            await loadData();

            setShowForm(false);

            setEditingInstitution(null);

            setSaveSnackbar(true);
        } catch (error) {
            console.error(error);
        }
    };

    // =========================
    // VIEW
    // =========================

    const handleView = (institution: Institution) => {
        setViewingInstitution(institution);
    };

    // =========================
    // EDIT
    // =========================

    const handleEdit = (institution: Institution) => {
        setEditingInstitution(institution);

        setShowForm(true);
    };

    // =========================
    // DELETE
    // =========================

    const handleDelete = async (id: number) => {
        try {
            const confirmDelete = confirm("Tem certeza que deseja excluir esta instituição?");

            if (!confirmDelete) return;

            await api.deleteInstituicion(id);

            await loadData();
        } catch (error) {
            console.error(error);
        }
    };

    // =========================
    // EXPORT PDF
    // =========================

    const exportToPDF = () => {
        window.print();
    };

    // =========================
    // FILTERS
    // =========================

    const filteredInstitutions = institutions.filter((inst) => {
        const matchesSearch =
            inst.name.toLowerCase().includes(searchTerm.toLowerCase()) || inst.state.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterStatus === "all" || inst.status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    // =========================
    // STATUS COUNT
    // =========================

    const statusCount = institutions.reduce<Record<string, number>>((acc, inst) => {
        acc[inst.status] = (acc[inst.status] || 0) + 1;

        return acc;
    }, {});

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#f8f9fa",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* HEADER */}

            <AppBar
                position="static"
                sx={{
                    bgcolor: "#1351B4",
                }}
            >
                <Toolbar>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flex: 1,
                        }}
                    >
                        <BarChart3 color="#FFCD07" size={32} />

                        <Box>
                            <Typography
                                sx={{
                                    color: "white",
                                    fontSize: { xs: "0.95rem", sm: "1.25rem", md: "1.5rem" },
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                }}
                            >
                                Sistema de Monitoramento
                            </Typography>

                            <Typography
                                sx={{
                                    color: "rgba(255,255,255,0.8)",
                                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                                    display: { xs: "none", sm: "block" },
                                }}
                            >
                                Super Centro Brasil para Diagnóstico do Câncer
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            gap: { xs: 2, sm: 4 },
                        }}
                    >
                        <Box
                            sx={{
                                textAlign: "center",
                            }}
                        >
                            <Typography
                                sx={{
                                    color: "#FFCD07",
                                    fontWeight: 700,
                                    fontSize: { xs: "1.1rem", sm: "1.5rem" },
                                }}
                            >
                                {institutions.length}
                            </Typography>

                            <Typography
                                sx={{
                                    color: "white",
                                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                }}
                            >
                                Instituições
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                textAlign: "center",
                            }}
                        >
                            <Typography
                                sx={{
                                    color: "#FFCD07",
                                    fontWeight: 700,
                                    fontSize: { xs: "1.1rem", sm: "1.5rem" },
                                }}
                            >
                                {statusCount["Em andamento"] || 0}
                            </Typography>

                            <Typography
                                sx={{
                                    color: "white",
                                    fontSize: { xs: "0.65rem", sm: "0.75rem" },
                                }}
                            >
                                Em andamento
                            </Typography>
                        </Box>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* NAVBAR */}

            <Box
                sx={{
                    bgcolor: "white",
                    borderBottom: "1px solid #ddd",

                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "center",

                    px: 3,
                }}
            >
                <Tabs value={currentView} onChange={(_, value) => setCurrentView(value)}>
                    <Tab value="list" icon={<Settings size={18} />} iconPosition="start" label="Instituições" />

                    <Tab value="gantt" icon={<Calendar size={18} />} iconPosition="start" label="Gantt" />
                </Tabs>

                <Button
                    variant="contained"
                    startIcon={<Download size={16} />}
                    onClick={exportToPDF}
                    sx={{
                        bgcolor: "#168821",
                        minWidth: { xs: 40, sm: "auto" },
                        px: { xs: 1, sm: 2 },
                        "& .MuiButton-startIcon": { mr: { xs: 0.5, sm: 1 } },
                    }}
                >
                    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                        Exportar PDF
                    </Box>
                    <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                        PDF
                    </Box>
                </Button>
            </Box>

            {/* MAIN */}

            <Box
                sx={{
                    maxWidth: 1400,
                    mx: "auto",
                    p: currentView === "gantt" ? 1 : 3,
                    flexGrow: 1,
                    width: "100%",
                }}
            >
                {currentView === "list" && (
                    <>
                        {/* TOOLBAR */}

                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                mb: 3,
                                flexWrap: "wrap",
                            }}
                        >
                            <TextField
                                placeholder="Buscar..."
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{
                                    flex: 1,
                                    minWidth: 250,
                                    bgcolor: "white",
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search size={18} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <FormControl
                                size="small"
                                sx={{
                                    minWidth: 220,
                                    bgcolor: "white",
                                }}
                            >
                                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as InstitutionStatus)}>
                                    <MenuItem value="all">Todos</MenuItem>

                                    <MenuItem value="Não iniciado">Não iniciado</MenuItem>

                                    <MenuItem value="Em andamento">Em andamento</MenuItem>

                                    <MenuItem value="Concluído">Concluído</MenuItem>

                                    <MenuItem value="Atrasado">Atrasado</MenuItem>

                                    <MenuItem value="Pendente">Pendente</MenuItem>
                                </Select>
                            </FormControl>

                            <Button
                                variant="contained"
                                startIcon={<Plus size={18} />}
                                onClick={() => {
                                    setEditingInstitution(null);

                                    setShowForm(true);
                                }}
                            >
                                Nova Instituição
                            </Button>
                        </Box>

                        {/* LOADING */}

                        {loading ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    py: 10,
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {filteredInstitutions.map((institution) => (
                                    <Grid item xs={12} md={6} xl={4} key={institution.id}>
                                        <InstitutionCard institution={institution} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </>
                )}

                {currentView === "gantt" && (
                    <Paper sx={{ overflow: "auto", width: "70vw", mx: "auto" }}>
                        <GanttChart institutions={filteredInstitutions} />
                    </Paper>
                )}
            </Box>

            {/* FORM */}

            {showForm && (
                <InstitutionForm
                    institution={editingInstitution}
                    onSave={handleSave}
                    onCancel={() => {
                        setShowForm(false);

                        setEditingInstitution(null);
                    }}
                />
            )}

            {/* VIEW */}

            {viewingInstitution && (
                <InstitutionForm
                    institution={viewingInstitution}
                    readOnly
                    onSave={() => {}}
                    onCancel={() => setViewingInstitution(null)}
                    onEdit={() => {
                        const inst = viewingInstitution;
                        setViewingInstitution(null);
                        handleEdit(inst);
                    }}
                />
            )}

            {/* SNACKBAR */}

            <Snackbar open={saveSnackbar} autoHideDuration={2000} onClose={() => setSaveSnackbar(false)}>
                <Alert severity="success" icon={<Save size={16} />} variant="filled">
                    Salvo com sucesso
                </Alert>
            </Snackbar>

            <Footer />
        </Box>
    );
}
