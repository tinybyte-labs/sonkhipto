import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import TRPcProvider from "./providers/trpc-provider";
import AuthProvider, { useAuth } from "./providers/auth-provider";
import { Toaster } from "./components/ui/toaster";

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!,
  },
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

// Render the app
const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <GoogleOAuthProvider clientId="262858286271-iu231jd82bqvue9f1m5akb8rlkmpsbk3.apps.googleusercontent.com">
        <TRPcProvider>
          <AuthProvider>
            <InnerApp />
            <Toaster />
          </AuthProvider>
        </TRPcProvider>
      </GoogleOAuthProvider>
    </StrictMode>,
  );
}
