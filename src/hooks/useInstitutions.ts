import { useState, useEffect } from "react";

import { Institution, InstitutionStatus } from "../types";

import { api } from "../service";

export function useInstitutions() {
    const [institutions, setInstitutions] = useState<Institution[]>([]);

    const [loading, setLoading] = useState(false);

    const [showForm, setShowForm] = useState(false);

    const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);

    const [viewingInstitution, setViewingInstitution] = useState<Institution | null>(null);

    const [searchTerm, setSearchTerm] = useState("");

    const [filterStatus, setFilterStatus] = useState<InstitutionStatus | "all">("all");

    const [sortBy, setSortBy] = useState("progress-desc");

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

    const handleView = (institution: Institution) => {
        setViewingInstitution(institution);
    };

    const handleEdit = (institution: Institution) => {
        setEditingInstitution(institution);

        setShowForm(true);
    };

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

    const calcActivityProgress = (start_date: string, end_date: string): number => {
        const start = new Date(start_date).getTime();
        const end = new Date(end_date).getTime();
        const now = Date.now();
        if (end <= start) return 100;
        if (now <= start) return 0;
        if (now >= end) return 100;
        return Math.round(((now - start) / (end - start)) * 100);
    };

    const getInstProgress = (inst: Institution): number => {
        const acts = inst.activities.filter((a) => a.start_date && a.end_date);
        if (acts.length === 0) return 0;
        return Math.round(acts.reduce((s, a) => s + calcActivityProgress(a.start_date, a.end_date), 0) / acts.length);
    };

    const overallAvgProgress = (() => {
        const withActivities = institutions.filter(
            (inst) => inst.activities.filter((a) => a.start_date && a.end_date).length > 0
        );
        if (withActivities.length === 0) return 0;
        const sum = withActivities.reduce((acc, inst) => {
            const acts = inst.activities.filter((a) => a.start_date && a.end_date);
            const instPct = Math.round(acts.reduce((s, a) => s + calcActivityProgress(a.start_date, a.end_date), 0) / acts.length);
            return acc + instPct;
        }, 0);
        return Math.round(sum / withActivities.length);
    })();

    const filteredInstitutions = institutions
        .filter((inst) => {
            const matchesSearch =
                inst.name.toLowerCase().includes(searchTerm.toLowerCase()) || inst.state.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterStatus === "all" || inst.status === filterStatus;
            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortBy === "progress-desc") return getInstProgress(b) - getInstProgress(a);
            if (sortBy === "progress-asc") return getInstProgress(a) - getInstProgress(b);
            if (sortBy === "name-asc") return a.name.localeCompare(b.name, "pt-BR");
            if (sortBy === "name-desc") return b.name.localeCompare(a.name, "pt-BR");
            return 0;
        });

    const statusCount = institutions.reduce<Record<string, number>>((acc, inst) => {
        acc[inst.status] = (acc[inst.status] || 0) + 1;

        return acc;
    }, {});

    return {
        institutions,
        loading,
        showForm,
        setShowForm,
        editingInstitution,
        setEditingInstitution,
        viewingInstitution,
        setViewingInstitution,
        searchTerm,
        setSearchTerm,
        filterStatus,
        setFilterStatus,
        sortBy,
        setSortBy,
        saveSnackbar,
        setSaveSnackbar,
        loadData,
        handleSave,
        handleView,
        handleEdit,
        handleDelete,
        getInstProgress,
        overallAvgProgress,
        filteredInstitutions,
        statusCount,
    };
}
