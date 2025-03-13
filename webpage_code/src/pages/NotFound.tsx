
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import TransitionLayout from "@/components/TransitionLayout";
import TriviaCard from "@/components/TriviaCard";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <TransitionLayout>
      <div className="flex flex-col items-center animate-slide-up">
        <TriviaCard className="text-center">
          <h1 className="text-6xl font-bold text-primary mb-6">404</h1>
          <p className="text-xl text-gray-600 mb-8">
            Oops! This page doesn't exist
          </p>
          <Button 
            onClick={() => navigate("/")}
            className="w-full h-12 text-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Return to Home
          </Button>
        </TriviaCard>
      </div>
    </TransitionLayout>
  );
};

export default NotFound;
