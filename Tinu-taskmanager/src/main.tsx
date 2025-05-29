import { createRoot } from "react-dom/client";
import "./index.css";
import AppRoutes from "@/components/Routes.tsx";
import React from "react";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle.tsx";
import { Amplify } from "aws-amplify";
import awsConfig from "@/aws-export.ts";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/Context/AuthContext.tsx"; // 👈 use your custom context
// import { TagsProvider } from "@/Context/TagContext.tsx"; // 👈 import it
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HoneycombWebSDK } from "@honeycombio/opentelemetry-web";
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";

const API_KEY = import.meta.env.VITE_API_KEY;

const configDefaults = {
	ignoreNetworkEvents: true,
	propagateTraceHeaderCorsUrls: [
		/https:\/\/d06lty2o39\.execute-api\.us-east-1\.amazonaws\.com\/dev\/.*/,
	],
};

const sdk = new HoneycombWebSDK({
	// endpoint: "https://api.eu1.honeycomb.io/v1/traces", // Send to EU instance of Honeycomb. Defaults to sending to US instance.
	debug: true, // Set to false for production environment.
	apiKey: API_KEY, // Replace with your Honeycomb Ingest API Key.
	serviceName: "Tinumind", // Replace with your application name. Honeycomb uses this string to find your dataset when we receive your data. When no matching dataset exists, we create a new one with this name if your API Key has the appropriate permissions.
	instrumentations: [
		getWebAutoInstrumentations({
			// Loads custom configuration for xml-http-request instrumentation.
			"@opentelemetry/instrumentation-xml-http-request": configDefaults,
			"@opentelemetry/instrumentation-fetch": configDefaults,
			"@opentelemetry/instrumentation-document-load": configDefaults,
		}),
	],
});
sdk.start();

// Create a client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: true,
			staleTime: 5 * 60 * 1000, // 5 minutes
			retry: 2, // Retry failed queries twice
			gcTime: 10 * 60 * 1000, // 10 minutes cache time
		},
		mutations: {
			retry: 1, // Retry failed mutations once
		},
	},
});

// Configure Amplify
Amplify.configure(awsConfig);

createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
					<>
						<Toaster richColors />
						<div className="bg-muted min-h-screen">
							<ModeToggle />
							<AppRoutes />
						</div>
					</>
				</ThemeProvider>
			</AuthProvider>
		</QueryClientProvider>
	</React.StrictMode>
);
