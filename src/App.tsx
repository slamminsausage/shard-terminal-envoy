import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CampaignProvider } from "@/contexts/CampaignContext";
import { BridgeProvider } from "@/contexts/BridgeContext";
import { JumpPlannerProvider } from "@/contexts/JumpPlannerContext";
import { NotesProvider } from "@/contexts/NotesContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import CRTOverlay from "@/components/ui/CRTOverlay";
import { GlobalSearch } from "@/components/GlobalSearch";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CharacterView from "./components/crew/CharacterView";
import VehicleView from "./components/crew/VehicleView";
import { useParams } from "react-router-dom";
import AdminBridge from "./pages/AdminBridge";
import AdminNotes from "./pages/AdminNotes";

const CharacterViewRoute = () => {
  const { id } = useParams<{ id: string }>();
  return <CharacterView characterId={id || ""} />;
};

const VehicleViewRoute = () => {
  const { id } = useParams<{ id: string }>();
  return <VehicleView vehicleId={id || ""} />;
};

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary fallbackMessage="Terminal system failure">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CampaignProvider>
          <JumpPlannerProvider>
          <NotesProvider>
          <BridgeProvider>
            <CRTOverlay />
            <Toaster />
            <Sonner />
            <GlobalSearch />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/character-view/:id" element={<CharacterViewRoute />} />
                <Route path="/vehicle-view/:id" element={<VehicleViewRoute />} />
                <Route path="/admin/bridge" element={<AdminBridge />} />
                <Route path="/admin/notes" element={<AdminNotes />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </BridgeProvider>
          </NotesProvider>
          </JumpPlannerProvider>
        </CampaignProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
