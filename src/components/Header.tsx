import { forwardRef, useEffect, useState } from "react";
import { AppBar, Toolbar, Box, Typography, Tabs, Tab, Button, Chip, Tooltip } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Download, Settings, Calendar, Clock3, CalendarClock, CheckCircle2, MapPin, LogOut, User } from "lucide-react";
import { useSession } from "../providers/session/page";
import { api } from "../service";

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
    const { session, clearSession } = useSession();

    const currentPath = location.pathname;
    const isMapRoute = currentPath === "/mapa";
    const isGanttRoute = currentPath === "/gantt";

    const [remaining, setRemaining] = useState<number>(() =>
        session ? Math.max(0, session.expiresAt - Date.now()) : 0
    );

    useEffect(() => {
        if (!session) return;
        const interval = setInterval(() => {
            const ms = Math.max(0, session.expiresAt - Date.now());
            setRemaining(ms);
            if (ms === 0) {
                api.setAuthToken(null);
                clearSession();
                navigate("/");
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [session, clearSession, navigate]);

    function formatCountdown(ms: number) {
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const pad = (n: number) => String(n).padStart(2, "0");
        return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
    }

    function handleLogout() {
        api.setAuthToken(null);
        clearSession();
        navigate("/");
    }

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
                            alignItems: "center",
                        }}
                    >
                        <Box sx={{ textAlign: "center" }}>
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

                        <Box sx={{ textAlign: "center" }}>
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

                        {session && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    borderLeft: "1px solid rgba(255,255,255,0.3)",
                                    pl: { xs: 1, sm: 2 },
                                    ml: { xs: 0, sm: 1 },
                                }}
                            >
                                <Tooltip title="Sessão expira em">
                                    <Box sx={{ textAlign: "center", display: { xs: "none", sm: "block" } }}>
                                        <Typography
                                            sx={{
                                                color: remaining < 5 * 60 * 1000 ? "#FF6B6B" : "#FFCD07",
                                                fontWeight: 700,
                                                fontSize: "0.875rem",
                                                lineHeight: 1.2,
                                                fontVariantNumeric: "tabular-nums",
                                            }}
                                        >
                                            {formatCountdown(remaining)}
                                        </Typography>
                                        <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.65rem" }}>
                                            Sessão
                                        </Typography>
                                    </Box>
                                </Tooltip>

                                <User size={18} color="rgba(255,255,255,0.8)" />

                                <Box sx={{ display: { xs: "none", sm: "block" } }}>
                                    <Typography sx={{ color: "white", fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.2 }}>
                                        {session.user.name}
                                    </Typography>
                                    <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.7rem" }}>
                                        {session.user.email}
                                    </Typography>
                                </Box>

                                <Tooltip title="Sair">
                                    <Button
                                        onClick={handleLogout}
                                        sx={{
                                            minWidth: 0,
                                            p: 0.75,
                                            color: "rgba(255,255,255,0.8)",
                                            "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
                                        }}
                                    >
                                        <LogOut size={18} />
                                    </Button>
                                </Tooltip>
                            </Box>
                        )}
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
                        value="/instituicoes"
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

                    <Tab
                        value="/mapa"
                        icon={<MapPin size={18} />}
                        iconPosition="start"
                        label={<Box component="span" sx={{ fontSize: { xs: "0.65rem", sm: "0.875rem" } }}>Mapa</Box>}
                        sx={{ minWidth: { xs: 48, sm: 90 }, minHeight: { xs: 40, sm: 48 }, px: { xs: 1, sm: 2 } }}
                    />
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
