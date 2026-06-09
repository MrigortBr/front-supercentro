import BrazilMap from "../components/BrazilMap";
import { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import { useInstitutions } from "../hooks/useInstitutions";
import { exportInstitutionsPDF, exportGanttPDF, exportMapPDF } from "../utils/pdfExport";
import {
    Box,
    Alert,
    Snackbar,
} from "@mui/material";

import { Save } from "lucide-react";

import Header from "../components/Header";
import InstitutionForm from "../components/InstitutionForm";
import Footer from "../components/Footer";
import InstitutionsListPage from "./InstitutionsListPage";
import GanttPage from "./GanttPage";

export default function MonitoringSystem() {
    const {
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
        handleSave,
        handleView,
        handleEdit,
        handleDelete,
        overallAvgProgress,
        filteredInstitutions,
        statusCount,
    } = useInstitutions();

    const location = useLocation();
    const isGanttRoute = location.pathname === "/gantt";
    const isMapRoute = location.pathname === "/mapa";

    const headerRef = useRef<HTMLDivElement>(null);

    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;

        const ro = new ResizeObserver(([entry]) => {
            setHeaderHeight(entry.contentRect.height);
        });

        ro.observe(el);

        return () => ro.disconnect();
    }, []);

	const exportToPDF = () => {
		if (isMapRoute) exportMapPDF();
		else if (isGanttRoute) exportGanttPDF(filteredInstitutions);
		else exportInstitutionsPDF(filteredInstitutions);
	};


	const mapaData = filteredInstitutions.map((institution) => {
		const { activities } = institution;

		const percentual =
			activities.length > 0
				? Math.round(
					activities.reduce((sum, a) => {
						if (!a.start_date || !a.end_date) return sum;
						const start = new Date(a.start_date).getTime();
						const end = new Date(a.end_date).getTime();
						const now = Date.now();
						if (end <= start) return sum + 100;
						if (now <= start) return sum;
						if (now >= end) return sum + 100;
						return sum + Math.round(((now - start) / (end - start)) * 100);
					}, 0) / activities.length
				)
				: 0;

		return { sigla: institution.state, percentual };
	});

	const todasUFs = [
		"AC", "AL", "AP", "AM", "BA", "CE", "DF",
		"ES", "GO", "MA", "MT", "MS", "MG", "PA",
		"PB", "PR", "PE", "PI", "RJ", "RN", "RS",
		"RO", "RR", "SC", "SP", "SE", "TO"
	];

	const mapaDataCompleto = todasUFs.map((uf) => {
		const encontrado = mapaData.find((m) => m.sigla === uf);
		return {
			sigla: uf,
			percentual: encontrado?.percentual ?? 0,
		};
	});


	return (
		<Box
			sx={{
				minHeight: "100vh",
				bgcolor: "#f8f9fa",
				display: "flex",
				flexDirection: "column",
			}}
		>
			<Header
				ref={headerRef}
				institutionsCount={institutions.length}
				inProgressCount={statusCount["Em andamento"] || 0}
			onExport={exportToPDF}
			/>

			{/* MAIN */}

			<Box
				sx={{
					maxWidth: 1400,
					mx: "auto",
					p: isGanttRoute ? { xs: "6px", sm: 2 } : 3,
					flexGrow: 1,
					width: "100%",
				}}
			>
				<Routes>
					<Route
						path="/instituicoes"
						element={
							<InstitutionsListPage
								filteredInstitutions={filteredInstitutions}
								loading={loading}
								overallAvgProgress={overallAvgProgress}
								searchTerm={searchTerm}
								onSearchChange={setSearchTerm}
								filterStatus={filterStatus}
								onFilterChange={setFilterStatus}
								sortBy={sortBy}
								onSortChange={setSortBy}
								onNewInstitution={() => {
									setEditingInstitution(null);

									setShowForm(true);
								}}
								onView={handleView}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>
						}
					/>

					<Route
						path="/gantt"
						element={<GanttPage institutions={filteredInstitutions} topOffset={headerHeight} />}
					/>

					<Route path="/mapa" element={<BrazilMap data={mapaDataCompleto} />} />
				</Routes>
			</Box>

			{/* FORM */}

			{showForm && (
				<InstitutionForm
					allData={institutions}
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
					allData={institutions}
					institution={viewingInstitution}
					readOnly
					onSave={() => { }}
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
