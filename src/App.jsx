import Router from "../router"
import { useCredentials } from "./contexts/CredentialsContext";

export default function App() {

	const credentials = useCredentials();

	return (
		<Router />
	)
}