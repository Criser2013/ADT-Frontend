import "./i18n";
import App from './App.jsx';
import CssBaseline from "@mui/material/CssBaseline";
import InstanciaTema from './theme';
import { AuthProvider, CredencialesProvider } from './contexts';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { ThemeProvider } from '@mui/material/styles';


createRoot(document.getElementById('root')).render(
	<StrictMode>
		<ThemeProvider theme={InstanciaTema}>
			<CssBaseline />
			<CredencialesProvider>
				<AuthProvider>
						<App />
				</AuthProvider>
			</CredencialesProvider>
		</ThemeProvider>
	</StrictMode>,
);