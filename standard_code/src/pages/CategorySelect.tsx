
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
        <h1 className="pixel-text-lg text-3xl md:text-4xl tracking-wide mb-10 text-center flex items-center justify-center">
          <span>Select Category!</span><span className="ml-2">🦑</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
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
            smallerText
          />
        </div>
      </div>
      
      {/* Standardized Go Back button */}
      <Button 
        onClick={handleGoBack}
        className="absolute bottom-8 left-8 bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold text-xl py-3 px-6 rounded-full border-2 border-white/80 flex items-center gap-2 shadow-md"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Go Back</span>
      </Button>
    </div>
  );
};

// Category button component with fixed height and responsive text size
const CategoryButton: React.FC<{ 
  label: string; 
  onClick: () => void;
  showCrown?: boolean;
  smallerText?: boolean;
}> = ({ label, onClick, showCrown = false, smallerText = false }) => {
  return (
    <button 
      onClick={onClick}
      className={`bg-yellow-300 hover:bg-yellow-400 text-green-800 font-bold rounded-xl px-6
      flex items-center justify-center w-full border-4 border-white/50 transition-all
      font-mono hover:scale-105 h-24 ${smallerText ? 'text-2xl md:text-3xl' : 'text-3xl md:text-4xl'}`}
    >
      {showCrown && <Crown className="w-8 h-8 mr-3 text-yellow-600 flex-shrink-0" />}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
};

export default CategorySelect;
