
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous screen in history
  };

  const handleGoHome = () => {
    navigate("/"); // Navigate to home
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 relative">
      <div className="text-center p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        <div className="flex space-x-4 justify-center">
          <Button onClick={handleGoHome} className="flex items-center">
            <Home className="mr-2 h-4 w-4" /> Return to Home
          </Button>
        </div>
      </div>
      
      {/* Adjusted back button position to match CategorySelect */}
      <Button 
        onClick={handleGoBack}
        variant="yellow"
        className="absolute bottom-44 left-10 text-green-800 font-bold shadow-lg flex items-center z-10"
        size="lg"
      >
        <ArrowLeft className="h-6 w-6 mr-2" /> Go Back
      </Button>
    </div>
  );
};

export default NotFound;
