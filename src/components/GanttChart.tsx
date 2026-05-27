import { Box, Typography } from "@mui/material";
import { Institution, ActivityStatus } from "../types";

interface GanttChartProps {
	institutions: Institution[];
}

const MONTHS = ["Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const TOTAL_WEEKS = 36;
const LABEL_WIDTH = 180;
const MONTH_MIN_WIDTH = 64;
const INST_ROW_HEIGHT = { xs: 40, md: 48 };
const ACT_ROW_HEIGHT = { xs: 38, md: 44 };

function getGanttPosition(dateStr: string): number | null {
	if (!dateStr) return null;
	try {
		const date = new Date(dateStr);
		const april2026 = new Date("2026-04-01");
		const diffTime = date.getTime() - april2026.getTime();
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
		const diffWeeks = Math.floor(diffDays / 7);
		return Math.max(0, Math.min(TOTAL_WEEKS - 1, diffWeeks));
	} catch {
		return null;
	}
}

const activityBarColors: Record<ActivityStatus, string> = {
	Concluído: "#168821",
	"Em andamento": "#1351B4",
	Projetado: "#FF8C00",
	Planejado: "#FF8C00",
};

export default function GanttChart({ institutions }: GanttChartProps) {
	return (
		<Box sx={{ display: "flex" }}>
			{/* Coluna de labels (fixa) */}
			<Box sx={{ width: LABEL_WIDTH, flexShrink: 0, borderRight: "1px solid #dee2e6" }}>
				{/* Header da coluna label */}
				<Box
					sx={{
						bgcolor: "#1351B4",
						p: { xs: 1, md: 2 },
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "7vh",
					}}
				>
					<Typography variant="body2" fontWeight={600} color="white" sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
						Atividade
					</Typography>
				</Box>

				{/* Linhas */}
				{institutions.map((inst, idx) => (
					<Box key={idx} sx={{ borderBottom: "2px solid #dee2e6" }}>
						<Box
							sx={{
								height: INST_ROW_HEIGHT,
								display: "flex",
								alignItems: "center",
								px: { xs: 1, md: 2 },
								bgcolor: "#f0f4fb",
								borderBottom: "1px solid #e9ecef",
								overflow: "hidden",
							}}
						>
							<Typography noWrap variant="body2" fontWeight={700} color="primary" sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
								{inst.name}
							</Typography>
						</Box>

						{(inst.activities || []).map((activity, aidx) => (
							<Box
								key={aidx}
								sx={{
									height: ACT_ROW_HEIGHT,
									display: "flex",
									alignItems: "center",
									pl: { xs: 2, md: 3 },
									pr: 1,
									bgcolor: "white",
									borderBottom: "1px solid #e9ecef",
									overflow: "hidden",
								}}
							>
								<Typography noWrap variant="body2" sx={{ color: "#666", fontWeight: 400, fontSize: { xs: "0.7rem", md: "0.875rem" } }}>
									{activity.name}
								</Typography>
							</Box>
						))}
					</Box>
				))}
			</Box>

			{/* Painel do gráfico (scrollável) */}
			<Box sx={{ flex: 1, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
				{/* Header dos meses */}
				<Box sx={{ display: "flex", bgcolor: "#1351B4", color: "white", position: "sticky", top: 0, zIndex: 5, minWidth: "max-content", height: "7vh" }}>
					{MONTHS.map((month) => (
						<Box
							key={month}
							sx={{
								flex: 1,
								minWidth: MONTH_MIN_WIDTH,
								borderRight: "1px solid rgba(255,255,255,0.2)",
								"&:first-of-type": { borderLeft: "1px solid rgba(255,255,255,0.2)" },
							}}
						>
							<Box
								sx={{
									p: { xs: "0.25rem", md: "0.5rem" },
									textAlign: "center",
									fontWeight: 600,
									color: "#FFCD07",
									borderBottom: "1px solid rgba(255,255,255,0.2)",
									fontSize: { xs: "0.7rem", md: "0.875rem" },
								}}
							>
								{month}
							</Box>
							<Box sx={{ display: "flex" }}>
								{[1, 2, 3, 4].map((w) => (
									<Box
										key={w}
										sx={{
											flex: 1,
											p: { xs: "0.2rem", md: "0.375rem" },
											textAlign: "center",
											fontSize: { xs: "0.6rem", md: "0.7rem" },
											opacity: 0.8,
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

				{/* Linhas do gráfico */}
				<Box sx={{ bgcolor: "white" }}>
					{institutions.map((inst, idx) => {
						const validActivities = (inst.activities || []).filter((a) => a.start_date && a.end_date);
						const positions = validActivities
							.map((a) => ({ start: getGanttPosition(a.start_date), end: getGanttPosition(a.end_date) }))
							.filter((p): p is { start: number; end: number } => p.start !== null && p.end !== null);

						const minStart = positions.length > 0 ? Math.min(...positions.map((p) => p.start)) : null;
						const maxEnd = positions.length > 0 ? Math.max(...positions.map((p) => p.end)) : null;

						return (
							<Box key={idx} sx={{ borderBottom: "2px solid #dee2e6" }}>
								<Box
									sx={{
										height: INST_ROW_HEIGHT,
										minWidth: MONTHS.length * MONTH_MIN_WIDTH,
										position: "relative",
										borderBottom: "1px solid #e9ecef",
										"&:hover": { bgcolor: "#f8f9fa" },
									}}
								>
									{minStart !== null && maxEnd !== null && (
										<Box
											sx={{
												position: "absolute",
												height: { xs: 18, md: 24 },
												top: "50%",
												transform: "translateY(-50%)",
												borderRadius: 1,
												display: "flex",
												alignItems: "center",
												overflow: "hidden",
												px: 1,
												minWidth: 4,
												bgcolor: "#1351B4",
												boxShadow: "0 2px 4px rgba(19, 81, 180, 0.3)",
												left: `${(minStart / TOTAL_WEEKS) * 100}%`,
												width: `${Math.max(1, ((maxEnd - minStart) / TOTAL_WEEKS) * 100)}%`,
											}}
										>
											<Typography
												sx={{
													color: "white",
													fontSize: "0.65rem",
													fontWeight: 600,
													whiteSpace: "nowrap",
													display: { xs: "none", sm: "block" },
												}}
											>
												{inst.status}
											</Typography>
										</Box>
									)}
								</Box>

								{(inst.activities || []).map((activity, aidx) => {
									const start = getGanttPosition(activity.start_date);
									const end = getGanttPosition(activity.end_date);
									const barColor = activityBarColors[activity.status] || "#1351B4";

									return (
										<Box
											key={aidx}
											sx={{
												height: ACT_ROW_HEIGHT,
												minWidth: MONTHS.length * MONTH_MIN_WIDTH,
												position: "relative",
												borderBottom: "1px solid #e9ecef",
												"&:hover": { bgcolor: "#f8f9fa" },
											}}
										>
											{start !== null && end !== null && (
												<Box
													title={`${activity.name} – ${activity.status}`}
													sx={{
														position: "absolute",
														height: { xs: 12, md: 18 },
														top: "50%",
														transform: "translateY(-50%)",
														borderRadius: 1,
														minWidth: 4,
														bgcolor: barColor,
														border: `1px solid ${barColor}cc`,
														left: `${(start / TOTAL_WEEKS) * 100}%`,
														width: `${Math.max(0.5, ((end - start) / TOTAL_WEEKS) * 100)}%`,
													}}
												/>
											)}
										</Box>
									);
								})}
							</Box>
						);
					})}
				</Box>
			</Box>
		</Box>
	);
}
