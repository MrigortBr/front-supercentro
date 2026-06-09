import { CssBaseline } from "@mui/material";
import LoginPage from "./pages/page";
import { AlertProvider } from "./providers/alert/page";
import { ThemeProvider } from "styled-components";
import { theme } from "./styles/theme";

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <AlertProvider>
                <CssBaseline />
                <LoginPage></LoginPage>
            </AlertProvider>
        </ThemeProvider>
    );
}
