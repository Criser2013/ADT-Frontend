import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { CredentialsProvider } from './contexts/CredentialsContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<CredentialsProvider>
			<AuthProvider>
				<App />
			</AuthProvider>
		</CredentialsProvider>
	</StrictMode>,
);