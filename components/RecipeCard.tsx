'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface RecipeCardProps {
  id: number;
  title: string;
  image: string;
  // time: string;
  category: string;
}

export default function RecipeCard({ id, title, image, category }: RecipeCardProps) {

  return (
    <Link href={`/recipe/${id}`} className="block">
      <article 
        className="recipe-card cursor-pointer group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-400 border border-gray-100 hover:border-orange-500 hover:-translate-y-2"
      >
      <div className="recipe-image-wrapper relative h-80 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <Image
          src={image}
          alt={title || 'Recipe Image'}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-115 group-hover:rotate-2"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        <div className="absolute top-4 right-4 z-10">
          <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-bold rounded-full uppercase tracking-wide shadow-lg backdrop-blur-sm">
            {category}
          </span>
        </div>
      </div>

      <div className="relative p-7 bg-white">
        <h3 className="text-2xl font-bold mb-4 text-gray-900 transition-colors duration-300 group-hover:text-orange-500 leading-tight tracking-tight">
          {title}
        </h3>

        {/* <div className="flex gap-6 text-base items-center text-gray-600 font-medium">
          <div className="flex items-center gap-2 transition-colors duration-300 group-hover:text-orange-500">
            <Clock className="h-5 w-5 stroke-[2.5]" />
            <span>{time}</span>
          </div>
        </div> */}

        <div className="absolute bottom-7 right-7 text-orange-500 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
          <ArrowRight size={18} />
        </div>
      </div>
    </article>
    </Link>
  );
}
