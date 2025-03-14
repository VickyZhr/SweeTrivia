
import React from 'react';

interface CategoryBadgeProps {
  category: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  return (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-300 text-green-800 border-2 border-white/30 shadow-md animate-fade-in">
      {category}
    </span>
  );
};

export default CategoryBadge;
