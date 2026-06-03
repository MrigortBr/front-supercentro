import { useRef, useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { Institution, ActivityStatus } from "../types";

interface GanttChartProps {
	institutions: Institution[];
}

const MONTHS_2026_REST = ["Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const N_REST = 9;      // Abr–Dez
const N_COLS = 11;     // 2025(1) + Q1(1) + 9 meses = 11 colunas iguais

const INST_ROW_H   = 48;
const ACT_ROW_H    = 44;
const HEADER_YEAR_H = 22;
const HEADER_MON_H  = 22;
const HEADER_WEEK_H = 18;
const HEADER_TOTAL_H = HEADER_YEAR_H + HEADER_MON_H + HEADER_WEEK_H; // 62px

const activityBarColors: Record<ActivityStatus, string> = {
	Concluído: "#168821",
	"Em andamento": "#1351B4",
	Projetado: "#FF8C00",
	Planejado: "#FF8C00",
};

/** Calcula as larguras a partir da largura real do container */
function calcDims(containerW: number) {
	const isMobile    = containerW < 480;
	const isTablet    = containerW < 768;
	const LABEL_WIDTH = isMobile ? 130 : isTablet ? 160 : 220;
	const MIN_COL_W   = isMobile ? 70 : isTablet ? 90 : 0;
	const available   = isMobile || isTablet
		? Math.max(containerW - LABEL_WIDTH, N_COLS * MIN_COL_W)
		: containerW - LABEL_WIDTH;
	const W_MONTH = available / N_COLS;
	return {
		LABEL_WIDTH,
		W_MONTH,
		W_2025:    W_MONTH,
		W_Q1_2026: W_MONTH,
		W_REST:    N_REST * W_MONTH,
		TOTAL_CHART_W: available,
	};
}

/**
 * Posição em pixels a partir da borda esquerda do painel do gráfico.
 *   2025         → [0,       W_2025)
 *   2026 Jan-Mar → [W_2025,  W_2025+W_Q1)
 *   2026 Abr-Dez → [W_2025+W_Q1, total)
 */
function getGanttPx(
	dateStr: string,
	W_2025: number,
	W_Q1_2026: number,
	W_MONTH: number,
): number | null {
	if (!dateStr) return null;
	try {
		const parts = dateStr.substring(0, 10).split("-");
		const y  = parseInt(parts[0], 10);
		const mo = parseInt(parts[1], 10);
		const d  = parseInt(parts[2], 10);
		if (isNaN(y) || isNaN(mo) || isNaN(d)) return null;

		const daysInMonth = new Date(y, mo, 0).getDate();
		const dayFrac = (d - 1) / daysInMonth;

		if (y === 2025) {
			return ((mo - 1 + dayFrac) / 12) * W_2025;
		} else if (y === 2026 && mo <= 3) {
			return W_2025 + ((mo - 1 + dayFrac) / 3) * W_Q1_2026;
		} else if (y === 2026 && mo >= 4) {
			return W_2025 + W_Q1_2026 + (mo - 4 + dayFrac) * W_MONTH;
		}
		return null;
	} catch {
		return null;
	}
}

export default function GanttChart({ institutions }: GanttChartProps) {
	const rootRef = useRef<HTMLDivElement>(null);

	const [dims, setDims] = useState(() => calcDims(window.innerWidth * 0.7));

	useEffect(() => {
		const el = rootRef.current;
		if (!el) return;
		const ro = new ResizeObserver(([entry]) => {
			setDims(calcDims(entry.contentRect.width));
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	const { LABEL_WIDTH, W_MONTH, W_2025, W_Q1_2026, W_REST, TOTAL_CHART_W } = dims;

	const px = (dateStr: string) => getGanttPx(dateStr, W_2025, W_Q1_2026, W_MONTH);

	return (
		<Box
			ref={rootRef}
			sx={{
				overflowX: "auto",
				WebkitOverflowScrolling: "touch",
			}}
		>
			<Box sx={{ minWidth: LABEL_WIDTH + TOTAL_CHART_W }}>

				{/* ── Header ── */}
				<Box sx={{ display: "flex", position: "sticky", top: 0, zIndex: 10 }}>
					{/* Label header – sticky esquerda */}
					<Box
						sx={{
							width: LABEL_WIDTH,
							flexShrink: 0,
							position: "sticky",
							left: 0,
							zIndex: 11,
							bgcolor: "#1351B4",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							height: HEADER_TOTAL_H,
							borderRight: "1px solid rgba(255,255,255,0.35)",
						}}
					>
						<Typography variant="body2" fontWeight={600} color="white" sx={{ fontSize: "0.875rem" }}>
							Atividade
						</Typography>
					</Box>

					{/* Cabeçalho dos meses */}
					<Box sx={{ width: TOTAL_CHART_W, display: "flex", bgcolor: "#1351B4", flexShrink: 0 }}>
						{/* 2025 – coluna única */}
						<Box
							sx={{
								width: W_2025,
								flexShrink: 0,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								borderRight: "2px solid rgba(255,255,255,0.35)",
							}}
						>
							<Typography sx={{ color: "#FFCD07", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.06em" }}>
								2025
							</Typography>
						</Box>

						{/* 2026 (1º tri) */}
						<Box
							sx={{
								width: W_Q1_2026,
								flexShrink: 0,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								borderRight: "2px solid rgba(255,255,255,0.35)",
								px: 0.5,
							}}
						>
							<Typography
								sx={{
									color: "#FFCD07",
									fontWeight: 700,
									fontSize: "0.65rem",
									letterSpacing: "0.03em",
									textAlign: "center",
									lineHeight: 1.3,
								}}
							>
								{"2026\n(1º tri)"}
							</Typography>
						</Box>

						{/* 2026 Abr–Dez – meses + semanas */}
						<Box sx={{ display: "flex", flexDirection: "column", width: W_REST, flexShrink: 0 }}>
							<Box
								sx={{
									height: HEADER_YEAR_H,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									borderBottom: "1px solid rgba(255,255,255,0.25)",
								}}
							>
								<Typography sx={{ color: "#FFCD07", fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.06em" }}>
									2026
								</Typography>
							</Box>
							<Box sx={{ display: "flex" }}>
								{MONTHS_2026_REST.map((m) => (
									<Box
										key={m}
										sx={{
											width: W_MONTH,
											flexShrink: 0,
											display: "flex",
											flexDirection: "column",
											borderRight: "1px solid rgba(255,255,255,0.2)",
											"&:last-of-type": { borderRight: "none" },
										}}
									>
										<Box
											sx={{
												height: HEADER_MON_H,
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												borderBottom: "1px solid rgba(255,255,255,0.2)",
											}}
										>
											<Typography sx={{ color: "#FFCD07", fontWeight: 600, fontSize: "0.75rem" }}>{m}</Typography>
										</Box>
										<Box sx={{ display: "flex", height: HEADER_WEEK_H }}>
											{[1, 2, 3, 4].map((w) => (
												<Box
													key={w}
													sx={{
														flex: 1,
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														color: "white",
														fontSize: "0.6rem",
														opacity: 0.75,
														borderRight: w < 4 ? "1px solid rgba(255,255,255,0.1)" : "none",
													}}
												>
													{w}
												</Box>
											))}
										</Box>
									</Box>
								))}
							</Box>
						</Box>
					</Box>
				</Box>

				{/* ── Linhas de dados ── */}
				{institutions.map((inst, idx) => {
					const validActivities = (inst.activities || []).filter((a) => a.start_date && a.end_date);
					const positions = validActivities
						.map((a) => ({ start: px(a.start_date), end: px(a.end_date) }))
						.filter((p): p is { start: number; end: number } => p.start !== null && p.end !== null);

					const minStart = positions.length > 0 ? Math.min(...positions.map((p) => p.start)) : null;
					const maxEnd   = positions.length > 0 ? Math.max(...positions.map((p) => p.end))   : null;

					return (
						<Box key={idx} sx={{ borderBottom: "2px solid #dee2e6" }}>

							{/* Linha da instituição */}
							<Box sx={{ display: "flex", borderBottom: "1px solid #e9ecef" }}>
								{/* Label */}
								<Box
									sx={{
										width: LABEL_WIDTH,
										flexShrink: 0,
										position: "sticky",
										left: 0,
										zIndex: 2,
										display: "flex",
										alignItems: "center",
										px: { xs: 1, sm: 2 },
										py: 0.5,
										minHeight: INST_ROW_H,
										bgcolor: "#f0f4fb",
										borderRight: "1px solid #dee2e6",
									}}
								>
									<Typography variant="body2" fontWeight={700} color="primary" sx={{ fontSize: { xs: "0.72rem", sm: "0.875rem" }, wordBreak: "break-word", overflowWrap: "break-word" }}>
										{inst.name}
									</Typography>
								</Box>

								{/* Barra da instituição */}
								<Box
									sx={{
										width: TOTAL_CHART_W,
										flexShrink: 0,
										position: "relative",
										minHeight: INST_ROW_H,
										bgcolor: "#f0f4fb",
										"&:hover": { bgcolor: "#e8eef8" },
									}}
								>
									{minStart !== null && maxEnd !== null && (
										<Box
											sx={{
												position: "absolute",
												height: 24,
												top: "50%",
												transform: "translateY(-50%)",
												borderRadius: 1,
												display: "flex",
												alignItems: "center",
												overflow: "hidden",
												px: 1,
												minWidth: 4,
												bgcolor: "#1351B4",
												boxShadow: "0 2px 4px rgba(19,81,180,0.3)",
												left: minStart,
												width: Math.max(4, maxEnd - minStart),
											}}
										>
											<Typography sx={{ color: "white", fontSize: "0.65rem", fontWeight: 600, whiteSpace: "nowrap" }}>
												{inst.status}
											</Typography>
										</Box>
									)}
								</Box>
							</Box>

							{/* Linhas das atividades */}
							{(inst.activities || []).map((activity, aidx) => {
								const start    = px(activity.start_date);
								const end      = px(activity.end_date);
								const barColor = activityBarColors[activity.status] || "#1351B4";

								return (
									<Box key={aidx} sx={{ display: "flex", borderBottom: "1px solid #e9ecef" }}>
										{/* Label */}
										<Box
											sx={{
												width: LABEL_WIDTH,
												flexShrink: 0,
												position: "sticky",
												left: 0,
												zIndex: 2,
												display: "flex",
												alignItems: "center",
												pl: 3,
												pr: 1,
												py: 0.5,
												minHeight: ACT_ROW_H,
												bgcolor: "white",
												borderRight: "1px solid #dee2e6",
											}}
										>
											<Typography variant="body2" sx={{ color: "#666", fontSize: { xs: "0.68rem", sm: "0.8rem" }, wordBreak: "break-word", overflowWrap: "break-word" }}>
												{activity.name}
											</Typography>
										</Box>

										{/* Barra da atividade */}
										<Box
											sx={{
												width: TOTAL_CHART_W,
												flexShrink: 0,
												position: "relative",
												minHeight: ACT_ROW_H,
												"&:hover": { bgcolor: "#f8f9fa" },
											}}
										>
											{start !== null && end !== null && (
												<Box
													title={`${activity.name} – ${activity.status}`}
													sx={{
														position: "absolute",
														height: 18,
														top: "50%",
														transform: "translateY(-50%)",
														borderRadius: 1,
														minWidth: 4,
														bgcolor: barColor,
														border: `1px solid ${barColor}cc`,
														left: start,
														width: Math.max(4, end - start),
													}}
												/>
											)}
										</Box>
									</Box>
								);
							})}
						</Box>
					);
				})}
			</Box>
		</Box>
	);
}
