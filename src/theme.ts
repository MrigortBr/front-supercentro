import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1351B4",
            dark: "#0c3c87",
            light: "#e7f1ff",
            contrastText: "#ffffff",
        },
        success: {
            main: "#168821",
            dark: "#0f6618",
            light: "#f0fdf4",
        },
        error: {
            main: "#E52207",
            light: "#ffe5e5",
        },
        warning: {
            main: "#FFCD07",
            contrastText: "#333333",
        },
        background: {
            default: "#f8f9fa",
            paper: "#ffffff",
        },
        text: {
            primary: "#333333",
            secondary: "#666666",
        },
    },
    typography: {
        fontFamily: '"Rawline", "Segoe UI", Arial, sans-serif',
        h1: { fontSize: "1.5rem", fontWeight: 600 },
        h2: { fontSize: "1.5rem", fontWeight: 600 },
        h3: { fontSize: "1.125rem", fontWeight: 600 },
        h4: { fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
        body1: { fontSize: "0.925rem" },
        body2: { fontSize: "0.875rem" },
        caption: { fontSize: "0.75rem" },
    },
    shape: {
        borderRadius: 4,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 500,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    border: "1px solid #dee2e6",
                    boxShadow: "none",
                    transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
                    "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        borderColor: "#1351B4",
                    },
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: "outlined",
                size: "small",
            },
        },
        MuiSelect: {
            defaultProps: {
                size: "small",
            },
        },
    },
});

export default theme;
