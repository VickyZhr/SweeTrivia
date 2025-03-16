
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TriviaProvider } from "@/context/TriviaContext";
import Index from "./pages/Index";
import CategorySelect from "./pages/CategorySelect";
import TriviaGame from "./pages/TriviaGame";
import NotFound from "./pages/NotFound";
import ExitScreen from "./components/ExitScreen";
import FlappyChallenge from "./pages/FlappyChallenge";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TriviaProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/categories" element={<CategorySelect />} />
            <Route path="/play" element={<TriviaGame />} />
            <Route path="/flappy" element={<FlappyChallenge />} />
            <Route path="/exit" element={<ExitScreen />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TriviaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
