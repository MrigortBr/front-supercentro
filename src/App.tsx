import { ThemeProvider, CssBaseline } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider as StyledThemeProvider } from "styled-components";
import { AlertProvider } from "./providers/alert/page";
import theme from "./theme";
import { theme as styledTheme } from "./styles/theme";
import MonitoringSystem from "./pages/MonitoringSystem";
import LoginPage from "./pages/page";

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <StyledThemeProvider theme={styledTheme}>
                <AlertProvider>
                    <CssBaseline />
                    <BrowserRouter>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/*" element={<MonitoringSystem />} />
                        </Routes>
                    </BrowserRouter>
                </AlertProvider>
            </StyledThemeProvider>
        </ThemeProvider>
    );
}
