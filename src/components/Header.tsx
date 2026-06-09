import { forwardRef } from "react";
import { AppBar, Toolbar, Box, Typography, Tabs, Tab, Button, Chip } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Download, Settings, Calendar, Clock3, CalendarClock, CheckCircle2 } from "lucide-react";

interface HeaderProps {
    institutionsCount: number;
    inProgressCount: number;
    onExport: () => void;
}

const Header = forwardRef<HTMLDivElement, HeaderProps>(function Header({
    institutionsCount,
    inProgressCount,
    onExport,
}, ref) {
    const location = useLocation();
    const navigate = useNavigate();

    const currentPath = location.pathname === "/" ? "/" : location.pathname;
    const isMapRoute = currentPath === "/mapa";
    const isGanttRoute = currentPath === "/gantt";

    return (
        <Box ref={ref} sx={{ position: "sticky", top: 0, zIndex: (theme) => theme.zIndex.appBar }}>
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
                                {institutionsCount}
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
                                {inProgressCount}
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
                    px: { xs: 1, sm: 3 },
                }}
            >
                <Tabs
                    value={currentPath}
                    onChange={(_, value) => navigate(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    sx={{ minHeight: { xs: 40, sm: 48 }, flexShrink: 1, minWidth: 0 }}
                >
                    <Tab
                        value="/"
                        icon={<Settings size={18} />}
                        iconPosition="start"
                        label={<Box component="span" sx={{ fontSize: { xs: "0.65rem", sm: "0.875rem" } }}>Instituições</Box>}
                        sx={{ minWidth: { xs: 48, sm: 90 }, minHeight: { xs: 40, sm: 48 }, px: { xs: 1, sm: 2 } }}
                    />

                    <Tab
                        value="/gantt"
                        icon={<Calendar size={18} />}
                        iconPosition="start"
                        label={<Box component="span" sx={{ fontSize: { xs: "0.65rem", sm: "0.875rem" } }}>Gantt</Box>}
                        sx={{ minWidth: { xs: 48, sm: 90 }, minHeight: { xs: 40, sm: 48 }, px: { xs: 1, sm: 2 } }}
                    />

                    {/* <Tab
                        value="/mapa"
                        icon={<MapPin size={18} />}
                        iconPosition="start"
                        label={<Box component="span" sx={{ fontSize: { xs: "0.65rem", sm: "0.875rem" } }}>Mapa</Box>}
                        sx={{ minWidth: { xs: 48, sm: 90 }, minHeight: { xs: 40, sm: 48 }, px: { xs: 1, sm: 2 } }}
                    /> */}
                </Tabs>

                {!isMapRoute && (
                    <Button
                        variant="contained"
                        startIcon={<Download size={16} />}
                        onClick={onExport}
                        sx={{
                            bgcolor: "#168821",
                            minWidth: { xs: 40, sm: "auto" },
                            px: { xs: 1, sm: 2 },
                            "& .MuiButton-startIcon": { mr: { xs: 0.5, sm: 1 } },
                        }}
                    >
                        <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                            {isGanttRoute ? "Exportar Gantt" : "Exportar Instituições"}
                        </Box>
                        <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>PDF</Box>
                    </Button>
                )}
            </Box>

            {/* GANTT LEGEND */}

            {isGanttRoute && (
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "center",
                        flexWrap: "wrap",
                        p: 1.5,
                        bgcolor: "white",
                        borderBottom: "1px solid #ddd",
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
            )}
        </Box>
    );
});

export default Header;
