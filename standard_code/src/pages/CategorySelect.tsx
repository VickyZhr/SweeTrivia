
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { Crown, ArrowLeft } from 'lucide-react';

const CategorySelect: React.FC = () => {
  const { filterQuestionsByCategory } = useTrivia();
  const navigate = useNavigate();

  const handleCategorySelect = (category: string | null) => {
    filterQuestionsByCategory(category);
    navigate('/play');
  };

  const handleGoBack = () => {
    navigate(-1); // Navigate to the previous screen in history
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: '#E0178C' }}>
      {/* Top row of shapes */}
      <div className="absolute top-5 w-[95%] mx-auto">
        <img 
          src="/lovable-uploads/92149b53-6c92-4ab5-b43e-94cf49eea917.png" 
          alt="Top shapes" 
          className="w-full"
        />
      </div>
      
      {/* Bottom row of shapes */}
      <div className="absolute bottom-0 w-[95%] mx-auto">
        <img 
          src="/lovable-uploads/f4358604-0ca8-4f42-b36a-1c87c99ef22d.png" 
          alt="Bottom shapes" 
          className="w-full"
        />
      </div>
      
      <div className="w-full max-w-4xl mx-auto z-10">
        <h1 className="pixel-text-lg text-3xl tracking-wide mb-6">
          Select Category! 🦑
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <CategoryButton 
            label="Science" 
            onClick={() => handleCategorySelect("Science")} 
          />
          
          <CategoryButton 
            label="Entertainment" 
            onClick={() => handleCategorySelect("Entertainment")} 
          />
          
          <CategoryButton 
            label="Sports" 
            onClick={() => handleCategorySelect("Sports")} 
          />
          
          <CategoryButton 
            label="(Mix of 3 categories)" 
            onClick={() => handleCategorySelect(null)} 
            showCrown
          />
        </div>
      </div>
      
      {/* Adjusted back button position - slightly up from bottom-40 but lower than original */}
      <Button 
        onClick={handleGoBack}
        variant="yellow"
        className="absolute bottom-44 left-10 text-green-800 font-bold shadow-lg flex items-center z-20"
        size="lg"
      >
        <ArrowLeft className="h-6 w-6 mr-2" /> Go Back
      </Button>
    </div>
  );
};

// Category button component
const CategoryButton: React.FC<{ 
  label: string; 
  onClick: () => void;
  showCrown?: boolean;
}> = ({ label, onClick, showCrown = false }) => {
  return (
    <button 
      onClick={onClick}
      className="bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold rounded-xl px-6 py-6 
      flex items-center justify-center w-full border-4 border-white/50 transition-all
      font-mono text-xl hover:scale-105"
    >
      {showCrown && <Crown className="w-6 h-6 mr-2 text-yellow-600" />}
      {label}
    </button>
  );
};

export default CategorySelect;
