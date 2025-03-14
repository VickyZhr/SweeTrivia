
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrivia } from '@/context/TriviaContext';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

const CategorySelect: React.FC = () => {
  const { filterQuestionsByCategory } = useTrivia();
  const navigate = useNavigate();

  const handleCategorySelect = (category: string | null) => {
    filterQuestionsByCategory(category);
    navigate('/play');
  };

  // Decorative shape component
  const Shape = ({ type }: { type: 'circle' | 'triangle' | 'square' }) => {
    const shapeClasses = {
      circle: "w-12 h-12 rounded-full border-4 border-white",
      triangle: "w-12 h-12 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-white",
      square: "w-12 h-12 border-4 border-white"
    };

    return <div className={shapeClasses[type]}></div>;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-pink-500 relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-wrap justify-between p-8 pointer-events-none">
        <Shape type="circle" />
        <Shape type="triangle" />
        <Shape type="square" />
        <Shape type="circle" />
        <Shape type="triangle" />
        <Shape type="square" />
        <Shape type="circle" />
        <Shape type="triangle" />
        <Shape type="square" />
        <Shape type="circle" />
        <Shape type="triangle" />
        <Shape type="square" />
      </div>
      
      <div className="w-full max-w-4xl mx-auto z-10">
        <h1 className="text-5xl font-bold text-green-800 font-mono text-center mb-10">
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
      font-mono text-2xl hover:scale-105"
    >
      {showCrown && <Crown className="w-6 h-6 mr-2 text-yellow-600" />}
      {label}
    </button>
  );
};

export default CategorySelect;
