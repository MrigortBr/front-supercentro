import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import MonitoringSystem from './pages/MonitoringSystem';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MonitoringSystem />
    </ThemeProvider>
  );
}
