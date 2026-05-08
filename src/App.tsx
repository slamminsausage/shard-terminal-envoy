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
import NotFound from "./pages/NotFound";
import { useParams } from "react-router-dom";
import { lazyWithRetry } from "@/lib/lazyWithRetry";

const VTTPresenterView = lazyWithRetry(() => import("./components/vtt/VTTPresenterView"));
const SessionLogPopout = lazyWithRetry(() => import("./pages/SessionLogPopout"));
const Index = lazyWithRetry(() => import("./pages/Index"));
const AdminNotes = lazyWithRetry(() => import("./pages/AdminNotes"));
const CharacterView = lazyWithRetry(() => import("./components/crew/CharacterView"));
const VehicleView = lazyWithRetry(() => import("./components/crew/VehicleView"));
const GlobalSearch = lazyWithRetry(() => import("@/components/GlobalSearch").then((m) => ({ default: m.GlobalSearch })));
const KeyboardShortcutsHelp = lazyWithRetry(() => import("@/components/KeyboardShortcutsHelp").then((m) => ({ default: m.KeyboardShortcutsHelp })));

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
                                <CRTOverlay idleScreensaver={false} />
                                <Toaster />
                                <Sonner />
                                <BrowserRouter>
                                  <Suspense fallback={<div className="bg-black min-h-screen" />}>
                                    <GlobalSearch />
                                    <KeyboardShortcutsHelp />
                                    <Routes>
                                      <Route path="/" element={<Index />} />
                                      <Route path="/character-view/:id" element={<CharacterViewRoute />} />
                                      <Route path="/vehicle-view/:id" element={<VehicleViewRoute />} />
                                      <Route path="/admin/notes" element={<AdminNotes />} />
                                      <Route path="/presenter" element={<VTTPresenterView />} />
                                      <Route path="/session-log-popout" element={<SessionLogPopout />} />
                                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                                      <Route path="*" element={<NotFound />} />
                                    </Routes>
                                  </Suspense>
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
