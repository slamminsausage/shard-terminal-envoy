import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { CampaignProvider } from "@/contexts/CampaignContext";
import { BridgeProvider } from "@/contexts/BridgeContext";
import { JumpPlannerProvider } from "@/contexts/JumpPlannerContext";
import { NotesProvider } from "@/contexts/NotesContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { QuestProvider } from "@/contexts/QuestContext";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { TradeProvider } from "@/contexts/TradeContext";
import { PiracyProvider } from "@/contexts/PiracyContext";
import { VTTProvider } from "@/contexts/VTTContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import CRTOverlay from "@/components/ui/CRTOverlay";
import { GlobalSearch } from "@/components/GlobalSearch";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CharacterView from "./components/crew/CharacterView";
import VehicleView from "./components/crew/VehicleView";
import { useParams } from "react-router-dom";
import AdminNotes from "./pages/AdminNotes";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const VTTPresenterView = lazyWithRetry(() => import("./components/vtt/VTTPresenterView"));

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
          <SessionProvider>
            <QuestProvider>
              <CalendarProvider>
                <InventoryProvider>
                  <FinanceProvider>
                    <TradeProvider>
                      <JumpPlannerProvider>
                        <NotesProvider>
                          <PiracyProvider>
                          <VTTProvider>
                          <BridgeProvider>
            <CRTOverlay />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <GlobalSearch />
              <KeyboardShortcutsHelp />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/character-view/:id" element={<CharacterViewRoute />} />
                <Route path="/vehicle-view/:id" element={<VehicleViewRoute />} />
                <Route path="/admin/notes" element={<AdminNotes />} />
                <Route path="/presenter" element={<Suspense fallback={<div className="bg-black min-h-screen" />}><VTTPresenterView /></Suspense>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
                          </BridgeProvider>
                          </VTTProvider>
                          </PiracyProvider>
                        </NotesProvider>
                      </JumpPlannerProvider>
                    </TradeProvider>
                  </FinanceProvider>
                </InventoryProvider>
              </CalendarProvider>
            </QuestProvider>
          </SessionProvider>
        </CampaignProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
