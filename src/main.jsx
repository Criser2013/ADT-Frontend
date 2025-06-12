import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { CredentialsProvider } from './contexts/CredentialsContext.jsx'

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<CredentialsProvider>
			<App />
		</CredentialsProvider>
	</StrictMode>,
)
