import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { CredencialesProvider } from './contexts/CredencialesContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { NavegacionProvider } from './contexts/NavegacionContext.jsx';
import { instanciaTema } from './theme.jsx';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from "@mui/material/CssBaseline";

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<ThemeProvider theme={instanciaTema}>
			<CssBaseline />
			<CredencialesProvider>
				<AuthProvider>
					<NavegacionProvider>
						<App />
					</NavegacionProvider>
				</AuthProvider>
			</CredencialesProvider>
		</ThemeProvider>
	</StrictMode>,
);