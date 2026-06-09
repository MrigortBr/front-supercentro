import {
    Box,
    Typography,
    Button,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputAdornment,
    Grid,
    CircularProgress,
    LinearProgress,
} from "@mui/material";

import { Plus, Search } from "lucide-react";

import InstitutionCard from "../components/InstitutionCard";

import { Institution, InstitutionStatus } from "../types";

interface InstitutionsListPageProps {
    filteredInstitutions: Institution[];
    loading: boolean;
    overallAvgProgress: number;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterStatus: InstitutionStatus | "all";
    onFilterChange: (value: InstitutionStatus | "all") => void;
    sortBy: string;
    onSortChange: (value: string) => void;
    onNewInstitution: () => void;
    onView: (institution: Institution) => void;
    onEdit: (institution: Institution) => void;
    onDelete: (id: number) => void;
}

export default function InstitutionsListPage({
    filteredInstitutions,
    loading,
    overallAvgProgress,
    searchTerm,
    onSearchChange,
    filterStatus,
    onFilterChange,
    sortBy,
    onSortChange,
    onNewInstitution,
    onView,
    onEdit,
    onDelete,
}: InstitutionsListPageProps) {
    return (
        <>
            {/* OVERALL PROGRESS */}

            <Box
                sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: "white",
                    borderRadius: 2,
                    border: "1px solid #dee2e6",
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#495057" }}>
                        Progresso Geral das Instituições
                    </Typography>
                    <Typography sx={{ fontWeight: 700, color: "#1351B4", fontSize: "1.1rem" }}>
                        {overallAvgProgress}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={overallAvgProgress}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: "#e9ecef",
                        "& .MuiLinearProgress-bar": { bgcolor: "#1351B4", borderRadius: 4 },
                    }}
                />
            </Box>

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
                    onChange={(e) => onSearchChange(e.target.value)}
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
                    <Select value={filterStatus} onChange={(e) => onFilterChange(e.target.value as InstitutionStatus | "all")}>
                        <MenuItem value="all">Todos</MenuItem>

                        <MenuItem value="Não iniciado">Não iniciado</MenuItem>

                        <MenuItem value="Em andamento">Em andamento</MenuItem>

                        <MenuItem value="Concluído">Concluído</MenuItem>

                        <MenuItem value="Atrasado">Atrasado</MenuItem>

                        <MenuItem value="Pendente">Pendente</MenuItem>
                    </Select>
                </FormControl>

                <FormControl
                    size="small"
                    sx={{
                        minWidth: 190,
                        bgcolor: "white",
                    }}
                >
                    <Select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
                        <MenuItem value="progress-desc">Maior progresso</MenuItem>
                        <MenuItem value="progress-asc">Menor progresso</MenuItem>
                        <MenuItem value="name-asc">Nome (A–Z)</MenuItem>
                        <MenuItem value="name-desc">Nome (Z–A)</MenuItem>
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={onNewInstitution}
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
                            <InstitutionCard institution={institution} onView={onView} onEdit={onEdit} onDelete={onDelete} />
                        </Grid>
                    ))}
                </Grid>
            )}
        </>
    );
}
