'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Sandwich, UtensilsCrossed, Cookie, Popcorn } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

interface CategoriesProps {
  onCategoryClick?: (categoryName: string) => void;
}

export default function Categories({ onCategoryClick }: CategoriesProps) {
  const { categories, fetchCategories, recipes } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Map icons to category names
  const iconMap: Record<string, typeof Coffee> = {
    'Breakfast': Coffee,
    'Lunch': Sandwich,
    'Dinner': UtensilsCrossed,
    'Dessert': Cookie,
    'Snacks': Popcorn,
  };

  // Count recipes per category
  const getCategoryCount = (categoryId: number): string => {
    const count = recipes.filter(r => r.category_id === categoryId).length;
    return `${count} ${count === 1 ? 'recipe' : 'recipes'}`;
  };

  const handleCategoryClick = (categoryName: string, categoryId: number) => {
    if (onCategoryClick) {
      onCategoryClick(categoryName);
    } else {
      router.push(`/category/${categoryId}`);
    }
  };

  // Hardcoded fallback categories when API hasn't loaded yet
  const defaultCategories = [
    { id: 1, name: 'Breakfast', description: '' },
    { id: 2, name: 'Lunch', description: '' },
    { id: 3, name: 'Dinner', description: '' },
    { id: 4, name: 'Dessert', description: '' },
    { id: 5, name: 'Snacks', description: '' },
  ];

  // Use API categories if available, otherwise use defaults
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <section id="categories" className="bg-orange-50 py-16 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 tracking-tight">
            Recipe <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Categories</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Explore our collection of recipes organized by meal type.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 max-w-6xl mx-auto">
          {displayCategories.map((category, index) => {
            const Icon = iconMap[category.name] || UtensilsCrossed;
            const recipeCount = recipes.length > 0 ? getCategoryCount(category.id) : '0 recipes';
            
            return (
              <div
                key={category.id}
                className="group bg-black/80 hover:bg-black/70 p-8 md:p-10 rounded-2xl text-center cursor-pointer transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleCategoryClick(category.name, category.id)}
              >
                <div className="w-16 h-16 bg-red-400/15 group-hover:bg-red-400/25 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110">
                  <Icon className="w-8 h-8 text-red-400 stroke-[2]" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-slate-100 tracking-tight">
                  {category.name}
                </h3>
                <p className="text-slate-300 text-base font-medium">
                  {recipeCount}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
