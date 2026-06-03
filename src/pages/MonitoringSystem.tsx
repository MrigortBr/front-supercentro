import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
	Chip,
	LinearProgress,
} from "@mui/material";

import { BarChart3, Plus, Download, Search, Save, Settings, Calendar, Clock3, CalendarClock, CheckCircle2 } from "lucide-react";

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

	const exportInstitutionsPDF = () => {
		const doc = new jsPDF("p", "mm", "a4");
		const pageWidth = doc.internal.pageSize.getWidth();
		const pageHeight = doc.internal.pageSize.getHeight();
		const margin = 15;

		const statusColors: Record<string, [number, number, number]> = {
			Concluído: [22, 136, 33],
			"Em andamento": [19, 81, 180],
			"Não iniciado": [117, 117, 117],
			Atrasado: [229, 34, 7],
			Pendente: [255, 140, 0],
		};

		const actStatusColors: Record<string, [number, number, number]> = {
			Concluído: [22, 136, 33],
			"Em andamento": [19, 81, 180],
			Projetado: [255, 140, 0],
			Planejado: [255, 140, 0],
		};

		const formatDate = (d: string) => {
			if (!d) return "—";
			try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return d; }
		};

		doc.setFillColor(19, 81, 180);
		doc.rect(0, 0, pageWidth, 28, "F");
		doc.setTextColor(255, 205, 7);
		doc.setFontSize(15);
		doc.setFont("helvetica", "bold");
		doc.text("Sistema de Monitoramento", margin, 12);
		doc.setTextColor(255, 255, 255);
		doc.setFontSize(9);
		doc.setFont("helvetica", "normal");
		doc.text("Super Centro Brasil", margin, 20);
		doc.setFontSize(8);
		doc.text(`Emitido em: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth - margin, 20, { align: "right" });

		let y = 36;

		doc.setTextColor(50, 50, 50);
		doc.setFontSize(9);
		doc.setFont("helvetica", "normal");
		doc.text(`Total de instituições: ${filteredInstitutions.length}`, margin, y);
		const emAndamento = filteredInstitutions.filter((i) => i.status === "Em andamento").length;
		const concluido = filteredInstitutions.filter((i) => i.status === "Concluído").length;
		doc.text(`Em andamento: ${emAndamento}   Concluídas: ${concluido}`, margin + 70, y);
		y += 8;
		doc.setDrawColor(220, 220, 220);
		doc.line(margin, y, pageWidth - margin, y);
		y += 6;

		filteredInstitutions.forEach((inst) => {
			const activitiesRows = (inst.activities || []).map((a) => [
				a.name, a.responsible || "—", formatDate(a.start_date), formatDate(a.end_date), a.status,
			]);
			const equipRows = (inst.machine || []).map((m) => [
				m.simb, m.descricao, String(m.quantidade), m.status,
				m.previsao_entrega ? formatDate(String(m.previsao_entrega)) : "—",
			]);

			if (y + 30 > pageHeight - 15) { doc.addPage(); y = margin; }

			const [r, g, b] = statusColors[inst.status] || [100, 100, 100];
			doc.setFillColor(r, g, b);
			doc.roundedRect(margin, y, pageWidth - 2 * margin, 9, 1.5, 1.5, "F");
			doc.setTextColor(255, 255, 255);
			doc.setFontSize(10);
			doc.setFont("helvetica", "bold");
			doc.text(`${inst.name}  (${inst.state})`, margin + 3, y + 6.2);
			doc.setFontSize(8);
			doc.text(inst.status, pageWidth - margin - 3, y + 6.2, { align: "right" });
			y += 12;

			doc.setTextColor(60, 60, 60);
			doc.setFontSize(8.5);
			doc.setFont("helvetica", "normal");
			doc.text(`Responsável: ${inst.responsible || "—"}`, margin + 2, y);
			y += 5;
			if (inst.observations) {
				const lines = doc.splitTextToSize(`Observações: ${inst.observations}`, pageWidth - 2 * margin - 4) as string[];
				doc.text(lines, margin + 2, y);
				y += lines.length * 5;
			}

			if (activitiesRows.length > 0) {
				y += 2;
				doc.setFontSize(8);
				doc.setFont("helvetica", "bold");
				doc.setTextColor(19, 81, 180);
				doc.text("Atividades", margin + 2, y);
				y += 2;
				autoTable(doc, {
					startY: y,
					head: [["Atividade", "Responsável", "Início", "Fim", "Status"]],
					body: activitiesRows,
					margin: { left: margin, right: margin },
					styles: { fontSize: 7.5, cellPadding: 2.5 },
					headStyles: { fillColor: [19, 81, 180], textColor: 255, fontStyle: "bold", fontSize: 7.5 },
					columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 35 }, 2: { cellWidth: 20 }, 3: { cellWidth: 20 }, 4: { cellWidth: 30 } },
					bodyStyles: { textColor: [50, 50, 50] },
					didParseCell: (data) => {
						if (data.section === "body" && data.column.index === 4) {
							const color = actStatusColors[data.cell.raw as string] || [80, 80, 80];
							data.cell.styles.textColor = color;
							data.cell.styles.fontStyle = "bold";
						}
					},
				});
				y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
			}

			if (equipRows.length > 0) {
				if (y + equipRows.length * 8 + 20 > pageHeight - 15) { doc.addPage(); y = margin; }
				doc.setFontSize(8);
				doc.setFont("helvetica", "bold");
				doc.setTextColor(19, 81, 180);
				doc.text("Equipamentos", margin + 2, y);
				y += 2;
				autoTable(doc, {
					startY: y,
					head: [["Símbolo", "Descrição", "Qtd", "Status", "Previsão de Entrega"]],
					body: equipRows,
					margin: { left: margin, right: margin },
					styles: { fontSize: 7.5, cellPadding: 2.5 },
					headStyles: { fillColor: [80, 80, 80], textColor: 255, fontStyle: "bold", fontSize: 7.5 },
					columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 75 }, 2: { cellWidth: 12 }, 3: { cellWidth: 30 }, 4: { cellWidth: 25 } },
				});
				y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
			}

			y += 5;
			doc.setDrawColor(220, 220, 220);
			doc.line(margin, y - 2, pageWidth - margin, y - 2);
			y += 3;
		});

		const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
		for (let i = 1; i <= pageCount; i++) {
			doc.setPage(i);
			doc.setFillColor(248, 249, 250);
			doc.rect(0, pageHeight - 10, pageWidth, 10, "F");
			doc.setTextColor(120, 120, 120);
			doc.setFontSize(7);
			doc.setFont("helvetica", "normal");
			doc.text("Ministério da Saúde — DECAN © 2026 | Sistema de Monitoramento", pageWidth / 2, pageHeight - 3.5, { align: "center" });
			doc.text(`${i} / ${pageCount}`, pageWidth - margin, pageHeight - 3.5, { align: "right" });
		}

		doc.save(`instituicoes-supercentro-${new Date().toISOString().slice(0, 10)}.pdf`);
	};

	const exportGanttPDF = () => {
		const doc = new jsPDF("l", "mm", "a4");
		const PW = doc.internal.pageSize.getWidth();   // 297mm
		const PH = doc.internal.pageSize.getHeight();  // 210mm
		const MARGIN = 10;
		const LABEL_W = 62;
		const FOOTER_H = 10;
		const PAGE_HDR_H = 22;

		const CHART_X = MARGIN + LABEL_W;
		const CHART_W = PW - MARGIN - CHART_X;
		const N_COLS = 11;
		const COL_W = CHART_W / N_COLS;

		const TL_YEAR_H = 7;
		const TL_MON_H = 7;
		const TL_WEEK_H = 6;
		const TL_H = TL_YEAR_H + TL_MON_H + TL_WEEK_H; // 20mm

		const INST_ROW_H = 8;
		const ACT_ROW_H = 6.5;
		const MAX_Y = PH - FOOTER_H - 2;
		const MONTHS_REST = ["Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

		const statusColors: Record<string, [number, number, number]> = {
			Concluído: [22, 136, 33],
			"Em andamento": [19, 81, 180],
			"Não iniciado": [117, 117, 117],
			Atrasado: [229, 34, 7],
			Pendente: [255, 140, 0],
		};
		const actColors: Record<string, [number, number, number]> = {
			Concluído: [22, 136, 33],
			"Em andamento": [19, 81, 180],
			Projetado: [255, 140, 0],
			Planejado: [255, 140, 0],
		};

		const dateToX = (dateStr: string): number | null => {
			if (!dateStr) return null;
			try {
				const p = dateStr.substring(0, 10).split("-");
				const yr = parseInt(p[0]), mo = parseInt(p[1]), d = parseInt(p[2]);
				if (isNaN(yr) || isNaN(mo) || isNaN(d)) return null;
				const frac = (d - 1) / new Date(yr, mo, 0).getDate();
				if (yr === 2025) return CHART_X + ((mo - 1 + frac) / 12) * COL_W;
				if (yr === 2026 && mo <= 3) return CHART_X + COL_W + ((mo - 1 + frac) / 3) * COL_W;
				if (yr === 2026 && mo >= 4) return CHART_X + 2 * COL_W + (mo - 4 + frac) * COL_W;
				return null;
			} catch { return null; }
		};

		const drawPageHeader = () => {
			doc.setFillColor(19, 81, 180);
			doc.rect(0, 0, PW, PAGE_HDR_H, "F");
			doc.setTextColor(255, 205, 7);
			doc.setFontSize(13);
			doc.setFont("helvetica", "bold");
			doc.text("Sistema de Monitoramento — Gráfico de Gantt", MARGIN, 10);
			doc.setTextColor(255, 255, 255);
			doc.setFontSize(8);
			doc.setFont("helvetica", "normal");
			doc.text("Super Centro Brasil", MARGIN, 17);
			doc.text(`Emitido em: ${new Date().toLocaleDateString("pt-BR")}`, PW - MARGIN, 17, { align: "right" });
		};

		const drawTimeline = (ty: number) => {
			const restX = CHART_X + 2 * COL_W;
			const q1X = CHART_X + COL_W * 1.5;

			// ── Fundo azul ──
			doc.setFillColor(19, 81, 180);
			doc.rect(MARGIN, ty, LABEL_W + CHART_W, TL_H, "F");

			// ── "Atividade" – coluna fixa, centrada na altura total ──
			doc.setTextColor(255, 255, 255);
			doc.setFontSize(7.5);
			doc.setFont("helvetica", "bold");
			doc.text("Atividade", MARGIN + LABEL_W / 2, ty + TL_H / 2 + 2.5, { align: "center" });

			// ── Divisores verticais principais (opacidade total) ──
			doc.setDrawColor(255, 255, 255);
			doc.setLineWidth(0.55);
			doc.line(CHART_X, ty, CHART_X, ty + TL_H); // label | 2025
			doc.line(CHART_X + COL_W, ty, CHART_X + COL_W, ty + TL_H); // 2025 | Q1
			doc.line(CHART_X + 2 * COL_W, ty, CHART_X + 2 * COL_W, ty + TL_H); // Q1 | Abr

			// ── Coluna 2025 – texto centrado na linha do ano ──
			doc.setTextColor(255, 205, 7);
			doc.setFontSize(8);
			doc.setFont("helvetica", "bold");
			doc.text("2025", CHART_X + COL_W / 2, ty + TL_YEAR_H / 2 + 2.5, { align: "center" });

			// ── Coluna Q1 2026 – duas linhas centradas na linha do ano ──
			doc.setFontSize(7);
			doc.text("2026", q1X, ty + TL_YEAR_H / 2, { align: "center" });
			doc.setFontSize(6.5);
			doc.text("(1º tri)", q1X, ty + TL_YEAR_H / 2 + 3.8, { align: "center" });

			// ── "2026" sobre os meses (linha do ano) ──
			doc.setFontSize(8);
			doc.setFont("helvetica", "bold");
			doc.text("2026", restX + (9 * COL_W) / 2, ty + TL_YEAR_H / 2 + 2.5, { align: "center" });

			// ── Separador horizontal ano/mês – apenas na área Abr-Dez ──
			doc.setDrawColor(255, 255, 255);
			doc.setLineWidth(0.3);
			doc.line(restX, ty + TL_YEAR_H, restX + 9 * COL_W, ty + TL_YEAR_H);

			// ── Meses Abr–Dez ──
			MONTHS_REST.forEach((m, i) => {
				const mx = restX + i * COL_W;
				const monCY = ty + TL_YEAR_H + TL_MON_H / 2;
				const weekBase = ty + TL_YEAR_H + TL_MON_H + TL_WEEK_H / 2 + 1.5;

				// nome do mês
				doc.setFontSize(7);
				doc.setTextColor(255, 205, 7);
				doc.setFont("helvetica", "bold");
				doc.text(m, mx + COL_W / 2, monCY + 2.5, { align: "center" });

				// divisor vertical entre meses
				if (i > 0) {
					doc.setDrawColor(255, 255, 255);
					doc.setLineWidth(0.2);
					doc.line(mx, ty + TL_YEAR_H, mx, ty + TL_H);
				}

				// números das semanas
				[1, 2, 3, 4].forEach((w) => {
					const wx = mx + (w - 0.5) * (COL_W / 4);
					doc.setFontSize(5.5);
					doc.setTextColor(190, 215, 255);
					doc.setFont("helvetica", "normal");
					doc.text(String(w), wx, weekBase, { align: "center" });

					// divisores de semana dentro de cada mês
					if (w < 4) {
						doc.setDrawColor(255, 255, 255);
						doc.setLineWidth(0.1);
						doc.line(mx + w * (COL_W / 4), ty + TL_YEAR_H + TL_MON_H, mx + w * (COL_W / 4), ty + TL_H);
					}
				});
			});

			// ── Separador horizontal mês/semana – apenas na área Abr-Dez ──
			doc.setDrawColor(255, 255, 255);
			doc.setLineWidth(0.2);
			doc.line(restX, ty + TL_YEAR_H + TL_MON_H, restX + 9 * COL_W, ty + TL_YEAR_H + TL_MON_H);
		};

		const drawVerticalGrid = (rowY: number, rowH: number) => {
			doc.setDrawColor(235, 240, 248);
			doc.setLineWidth(0.15);
			for (let c = 1; c < N_COLS; c++) {
				const gx = CHART_X + c * COL_W;
				doc.line(gx, rowY, gx, rowY + rowH);
			}
			// Divisores maiores (2025|Q1 e Q1|Abr)
			doc.setDrawColor(210, 220, 235);
			doc.setLineWidth(0.3);
			doc.line(CHART_X + COL_W, rowY, CHART_X + COL_W, rowY + rowH);
			doc.line(CHART_X + 2 * COL_W, rowY, CHART_X + 2 * COL_W, rowY + rowH);
		};

		// ── Início ──
		drawPageHeader();
		let y = PAGE_HDR_H + 4;
		drawTimeline(y);
		y += TL_H;

		filteredInstitutions.forEach((inst) => {
			if (y + INST_ROW_H > MAX_Y) {
				doc.addPage();
				drawPageHeader();
				y = PAGE_HDR_H + 4;
				drawTimeline(y);
				y += TL_H;
			}

			// Linha da instituição
			doc.setFillColor(235, 241, 252);
			doc.rect(MARGIN, y, LABEL_W, INST_ROW_H, "F");
			doc.setFillColor(243, 246, 253);
			doc.rect(CHART_X, y, CHART_W, INST_ROW_H, "F");

			drawVerticalGrid(y, INST_ROW_H);

			doc.setDrawColor(200, 215, 235);
			doc.setLineWidth(0.5);
			doc.line(MARGIN, y + INST_ROW_H, MARGIN + LABEL_W + CHART_W, y + INST_ROW_H);
			doc.setLineWidth(0.3);
			doc.line(CHART_X, y, CHART_X, y + INST_ROW_H);

			doc.setTextColor(19, 81, 180);
			doc.setFontSize(7.5);
			doc.setFont("helvetica", "bold");
			doc.text((doc.splitTextToSize(`${inst.name} (${inst.state})`, LABEL_W - 4) as string[])[0], MARGIN + 2, y + INST_ROW_H / 2 + 2.5);

			// Barra de span da instituição
			const validActs = (inst.activities || []).filter((a) => a.start_date && a.end_date);
			if (validActs.length > 0) {
				const xs = validActs.map((a) => dateToX(a.start_date)).filter(Boolean) as number[];
				const xe = validActs.map((a) => dateToX(a.end_date)).filter(Boolean) as number[];
				if (xs.length > 0) {
					const sx = Math.max(Math.min(...xs), CHART_X);
					const ex = Math.min(Math.max(...xe), CHART_X + CHART_W);
					const [sr, sg, sb] = statusColors[inst.status] || [100, 100, 100];
					const bH = 5, bY = y + (INST_ROW_H - bH) / 2;
					doc.setFillColor(sr, sg, sb);
					doc.roundedRect(sx, bY, Math.max(2, ex - sx), bH, 0.8, 0.8, "F");
					doc.setTextColor(255, 255, 255);
					doc.setFontSize(5.5);
					doc.setFont("helvetica", "bold");
					doc.text(inst.status, sx + 1.5, bY + bH - 1.5);
				}
			}

			y += INST_ROW_H;

			// Linhas de atividades
			(inst.activities || []).forEach((activity) => {
				if (y + ACT_ROW_H > MAX_Y) {
					doc.addPage();
					drawPageHeader();
					y = PAGE_HDR_H + 4;
					drawTimeline(y);
					y += TL_H;
				}

				doc.setFillColor(255, 255, 255);
				doc.rect(MARGIN, y, LABEL_W, ACT_ROW_H, "F");
				doc.rect(CHART_X, y, CHART_W, ACT_ROW_H, "F");

				drawVerticalGrid(y, ACT_ROW_H);

				doc.setDrawColor(230, 235, 242);
				doc.setLineWidth(0.2);
				doc.line(MARGIN, y + ACT_ROW_H, MARGIN + LABEL_W + CHART_W, y + ACT_ROW_H);
				doc.setLineWidth(0.2);
				doc.line(CHART_X, y, CHART_X, y + ACT_ROW_H);

				doc.setTextColor(90, 90, 90);
				doc.setFontSize(6.5);
				doc.setFont("helvetica", "normal");
				doc.text((doc.splitTextToSize(activity.name, LABEL_W - 8) as string[])[0], MARGIN + 5, y + ACT_ROW_H / 2 + 2);

				const sx = dateToX(activity.start_date);
				const ex = dateToX(activity.end_date);
				if (sx !== null && ex !== null) {
					const [ar, ag, ab] = actColors[activity.status] || [19, 81, 180];
					const bH = 3.5, bY = y + (ACT_ROW_H - bH) / 2;
					doc.setFillColor(ar, ag, ab);
					doc.roundedRect(Math.max(sx, CHART_X), bY, Math.max(1, Math.min(ex, CHART_X + CHART_W) - Math.max(sx, CHART_X)), bH, 0.5, 0.5, "F");
				}

				y += ACT_ROW_H;
			});

			// Separador entre instituições
			doc.setDrawColor(180, 200, 225);
			doc.setLineWidth(0.6);
			doc.line(MARGIN, y, MARGIN + LABEL_W + CHART_W, y);
		});

		// Rodapé em todas as páginas
		const pageCount = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
		for (let i = 1; i <= pageCount; i++) {
			doc.setPage(i);
			doc.setFillColor(248, 249, 250);
			doc.rect(0, PH - FOOTER_H, PW, FOOTER_H, "F");
			doc.setTextColor(120, 120, 120);
			doc.setFontSize(7);
			doc.setFont("helvetica", "normal");
			doc.text("Ministério da Saúde — DECAN © 2026 | Sistema de Monitoramento", PW / 2, PH - 3.5, { align: "center" });
			doc.text(`${i} / ${pageCount}`, PW - MARGIN, PH - 3.5, { align: "right" });
		}

		doc.save(`gantt-supercentro-${new Date().toISOString().slice(0, 10)}.pdf`);
	};

	const exportToPDF = () => {
		if (currentView === "gantt") exportGanttPDF();
		else exportInstitutionsPDF();
	};

	// =========================
	// OVERALL PROGRESS
	// =========================

	const calcActivityProgress = (start_date: string, end_date: string): number => {
		const start = new Date(start_date).getTime();
		const end = new Date(end_date).getTime();
		const now = Date.now();
		if (end <= start) return 100;
		if (now <= start) return 0;
		if (now >= end) return 100;
		return Math.round(((now - start) / (end - start)) * 100);
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

	const getInstProgress = (inst: Institution): number => {
		const acts = inst.activities.filter((a) => a.start_date && a.end_date);
		if (acts.length === 0) return 0;
		return Math.round(acts.reduce((s, a) => s + calcActivityProgress(a.start_date, a.end_date), 0) / acts.length);
	};

	// =========================
	// FILTERS
	// =========================

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
								Super Centro Brasil
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
						{currentView === "gantt" ? "Exportar Gantt" : "Exportar Instituições"}
					</Box>
					<Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>PDF</Box>
				</Button>
			</Box>

			{/* MAIN */}

			<Box
				sx={{
					maxWidth: 1400,
					mx: "auto",
					p: currentView === "gantt" ? { xs: "6px", sm: 2 } : 3,
					flexGrow: 1,
					width: "100%",
				}}
			>
				{currentView === "list" && (
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

							<FormControl
								size="small"
								sx={{
									minWidth: 190,
									bgcolor: "white",
								}}
							>
								<Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
									<MenuItem value="progress-desc">Maior progresso</MenuItem>
									<MenuItem value="progress-asc">Menor progresso</MenuItem>
									<MenuItem value="name-asc">Nome (A–Z)</MenuItem>
									<MenuItem value="name-desc">Nome (Z–A)</MenuItem>
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
					<Paper sx={{ overflow: "hidden", width: "100%" }}>
						<Box
							sx={{
								display: "flex",
								gap: 1,
								justifyContent: "center",
								flexWrap: "wrap",
								p: 2,
								borderBottom: "1px solid #e0e0e0",
								bgcolor: "#fafafa",
							}}
						>
							<Chip
								icon={<Clock3 size={16} color="white" />}
								label="Em andamento"
								sx={{ bgcolor: "#1351B4", color: "white", fontWeight: 600 }}
							/>
							<Chip
								icon={<CalendarClock size={16} color="white" />}
								label="Planejado"
								sx={{ bgcolor: "#FF8C00", color: "white", fontWeight: 600 }}
							/>
							<Chip
								icon={<CheckCircle2 size={16} color="white" />}
								label="Concluído"
								sx={{ bgcolor: "#168821", color: "white", fontWeight: 600 }}
							/>
						</Box>
						<GanttChart institutions={filteredInstitutions} />
					</Paper>
				)}
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
