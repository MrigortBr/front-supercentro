import { useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import { useInstitutions } from "../hooks/useInstitutions";
import { exportInstitutionsPDF, exportGanttPDF } from "../utils/pdfExport";
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
import MapPage from "./MapPage";

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
		if (isGanttRoute) exportGanttPDF(filteredInstitutions);
		else exportInstitutionsPDF(filteredInstitutions);
	};

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
						path="/"
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

					<Route path="/mapa" element={<MapPage />} />
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
