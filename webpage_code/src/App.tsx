
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Index from "./pages/Index";
import QuestionForm from "./pages/QuestionForm";
import FinishPage from "./pages/FinishPage";
import NotFound from "./pages/NotFound";

// Page transition component
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Add entrance animations
    const pageElements = document.querySelectorAll('.page-transition');
    pageElements.forEach((element) => {
      element.classList.add('page-transition-enter');
    });
    
    return () => {
      pageElements.forEach((element) => {
        element.classList.remove('page-transition-enter');
      });
    };
  }, [location.pathname]);
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <PageTransition>
              <Index />
            </PageTransition>
          } />
          <Route path="/questions/:questionNumber" element={
            <PageTransition>
              <QuestionForm />
            </PageTransition>
          } />
          <Route path="/finish" element={
            <PageTransition>
              <FinishPage />
            </PageTransition>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
