import { Box, Typography } from "@mui/material";

export default function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: "common.white",
                borderTop: "4px solid #071d42",
                px: { xs: 2, sm: 4 },
                py: { xs: "10px", sm: "18px" },
                flexShrink: 0,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "8px",
                }}
            >
                <Typography
                    component="span"
                    sx={{
                        fontSize: { xs: 14, sm: 17 },
                        fontWeight: 700,
                        color: "common.black",
                        "@media (max-width:480px)": { width: "100%", textAlign: "center" },
                    }}
                >
                    Super Centro Brasil
                </Typography>

                <Box
                    component="nav"
                    sx={{
                        display: "flex",
                        gap: { xs: "10px", sm: "18px" },
                        flexWrap: "wrap",
                        alignItems: "center",
                        "& img": { width: "auto", height: "auto", maxHeight: { xs: "36px", sm: "64px" }, objectFit: "contain" },
                        "@media (max-width:480px)": { width: "100%", justifyContent: "center" },
                    }}
                >
                    {/* <img src="/especialista.png" width={172} height={91} alt="Agora tem Especialistas" />
                    <img src="/sus.png" width={80} height={43} alt="SUS 35 Anos" />
                    <img src="/ministerio-semfundo.png" width={289} height={99} alt="Ministério da Saúde" loading="eager" /> */}
                </Box>
            </Box>

            <Typography
                sx={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: { xs: 10, sm: 11 },
                    color: "rgba(0,0,0,0.4)",
                    mt: { xs: "8px", sm: "12px" },
                    pt: { xs: "6px", sm: "10px" },
                    borderTop: "1px solid #071d42",
                }}
            >
                Ministério da Saúde — DECAN © {new Date().getFullYear()} | Sistema de Monitoramento
            </Typography>
        </Box>
    );
}
