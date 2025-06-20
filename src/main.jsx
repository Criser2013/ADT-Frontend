import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { CredencialesProvider } from './contexts/CredencialesContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { NavegacionProvider } from './contexts/NavegacionContext.jsx';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<CredencialesProvider>
			<AuthProvider>
				<NavegacionProvider>
					<App />
				</NavegacionProvider>
			</AuthProvider>
		</CredencialesProvider>
	</StrictMode>,
);