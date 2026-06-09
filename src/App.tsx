import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import theme from './theme';
import MonitoringSystem from './pages/MonitoringSystem';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <MonitoringSystem />
      </BrowserRouter>
    </ThemeProvider>
  );
}
