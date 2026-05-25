import { Box, Typography } from "@mui/material";
import { Institution, ActivityStatus } from "../types";

interface GanttChartProps {
    institutions: Institution[];
}

const MONTHS = ["Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const TOTAL_WEEKS = 36;

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

const LABEL_COL_WIDTH = { xs: 140, sm: 200, md: 280, lg: 350 };
const MONTH_MIN_WIDTH = { xs: 72, sm: 88, md: 104, lg: 120 };

const stickyLabelBase = {
    position: "sticky" as const,
    left: 0,
    zIndex: 2,
};

export default function GanttChart({ institutions }: GanttChartProps) {
    return (
        <Box sx={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
            {/* Header */}
            <Box sx={{ display: "flex", bgcolor: "#1351B4", color: "white", position: "sticky", top: 0, zIndex: 10, minWidth: "max-content" }}>
                <Box
                    sx={{
                        ...stickyLabelBase,
                        width: LABEL_COL_WIDTH,
                        minWidth: LABEL_COL_WIDTH,
                        p: { xs: 1, md: 2 },
                        fontWeight: 600,
                        borderRight: "1px solid rgba(255,255,255,0.2)",
                        bgcolor: "#1351B4",
                    }}
                >
                    <Typography variant="body2" fontWeight={600} color="inherit" sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                        Atividade
                    </Typography>
                </Box>

                <Box sx={{ flex: 1, display: "flex" }}>
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
            </Box>

            {/* Body */}
            <Box sx={{ bgcolor: "white", minWidth: "max-content" }}>
                {institutions.map((inst, idx) => {
                    const validActivities = (inst.activities || []).filter((a) => a.startDate && a.endDate);
                    const positions = validActivities
                        .map((a) => ({ start: getGanttPosition(a.startDate), end: getGanttPosition(a.endDate) }))
                        .filter((p): p is { start: number; end: number } => p.start !== null && p.end !== null);

                    const minStart = positions.length > 0 ? Math.min(...positions.map((p) => p.start)) : null;
                    const maxEnd = positions.length > 0 ? Math.max(...positions.map((p) => p.end)) : null;

                    return (
                        <Box key={idx} sx={{ borderBottom: "2px solid #dee2e6" }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    borderBottom: "1px solid #e9ecef",
                                    minHeight: { xs: 40, md: 48 },
                                    alignItems: "center",
                                    "&:hover": { bgcolor: "#f8f9fa" },
                                }}
                            >
                                <Box
                                    sx={{
                                        ...stickyLabelBase,
                                        width: LABEL_COL_WIDTH,
                                        minWidth: LABEL_COL_WIDTH,
                                        p: { xs: 1, md: 2 },
                                        fontWeight: 700,
                                        color: "#1351B4",
                                        bgcolor: "#f0f4fb",
                                        borderRight: "1px solid #dee2e6",
                                        alignSelf: "stretch",
                                        display: "flex",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={700} color="primary" sx={{ fontSize: { xs: "0.75rem", md: "0.875rem" } }}>
                                        {inst.name}
                                    </Typography>
                                </Box>

                                <Box sx={{ flex: 1, position: "relative", height: { xs: 40, md: 48 } }}>
                                    {minStart !== null && maxEnd !== null && (
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                height: { xs: 18, md: 24 },
                                                borderRadius: 1,
                                                top: "50%",
                                                transform: "translateY(-50%)",
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
                            </Box>

                            {/* Activity rows */}
                            {(inst.activities || []).map((activity, aidx) => {
                                const start = getGanttPosition(activity.startDate);
                                const end = getGanttPosition(activity.endDate);
                                const barColor = activityBarColors[activity.status] || "#1351B4";

                                return (
                                    <Box
                                        key={aidx}
                                        sx={{
                                            display: "flex",
                                            borderBottom: "1px solid #e9ecef",
                                            minHeight: { xs: 38, md: 44 },
                                            alignItems: "center",
                                            "&:hover": { bgcolor: "#f8f9fa" },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                ...stickyLabelBase,
                                                width: LABEL_COL_WIDTH,
                                                minWidth: LABEL_COL_WIDTH,
                                                pl: { xs: 2, md: 5 },
                                                pr: { xs: 1, md: 2 },
                                                py: 1,
                                                borderRight: "1px solid #dee2e6",
                                                alignSelf: "stretch",
                                                bgcolor: "white",
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "#666", fontWeight: 400, lineHeight: 1.4, fontSize: { xs: "0.7rem", md: "0.875rem" } }}
                                            >
                                                {activity.name}
                                            </Typography>
                                            {activity.startDate && activity.endDate && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "#1351B4",
                                                        fontWeight: 500,
                                                        fontSize: { xs: "0.6rem", md: "0.75rem" },
                                                        display: { xs: "none", sm: "block" },
                                                    }}
                                                >
                                                    {new Date(activity.startDate).toLocaleDateString("pt-BR")} –{" "}
                                                    {new Date(activity.endDate).toLocaleDateString("pt-BR")}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Box sx={{ flex: 1, position: "relative", height: { xs: 38, md: 44 } }}>
                                            {start !== null && end !== null && (
                                                <Box
                                                    title={`${activity.name} – ${activity.status}`}
                                                    sx={{
                                                        position: "absolute",
                                                        height: { xs: 12, md: 18 },
                                                        borderRadius: 1,
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        minWidth: 4,
                                                        bgcolor: barColor,
                                                        border: `1px solid ${barColor}cc`,
                                                        left: `${(start / TOTAL_WEEKS) * 100}%`,
                                                        width: `${Math.max(0.5, ((end - start) / TOTAL_WEEKS) * 100)}%`,
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
