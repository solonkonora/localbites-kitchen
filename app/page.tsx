'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import Footer from '@/components/footer';
import FeaturedRecipes from '@/components/featuredRecipes';
import Categories from '@/components/categories';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { fetchRecipes } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    // Fetch recipes for all users
    fetchRecipes();
  }, [fetchRecipes]);

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex items-stretch relative overflow-hidden">
        {/* Background Image for Mobile/Tablet, hidden on Desktop */}
        <div className="absolute inset-0 lg:hidden">
          <Image
            src="https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/achu.jpg"
            alt="Traditional Recipe"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/80"></div>
        </div>

        <div className="w-full flex flex-col lg:flex-row relative z-10">
          {/* Only visible on Desktop */}
          <div className="hidden lg:block lg:w-1/2 lg:min-h-screen">
            <div className="relative w-full h-full">
              <Image
                src="https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/achu.jpg"
                alt="Traditional Recipe"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
          </div>
          
          {/* Text right side */}
          <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-8 md:px-12 lg:px-16 py-12 min-h-screen lg:bg-gradient-to-br lg:from-orange-50 lg:via-white lg:to-yellow-50">
            <div className="max-w-xl space-y-8 text-center lg:text-left">
              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-white lg:text-gray-900 tracking-tight">
                  Traditional Recipes,
                  <br />
                  <span className="bg-orange-600 bg-clip-text text-transparent lg:from-orange-600 lg:to-red-700">
                    Modern Kitchen
                  </span>
                </h1>

                <div className="w-20 h-1 bg-orange-600 mx-auto lg:mx-0 rounded-full"></div>
              </div>

              {/* Description */}
              <p className="text-lg sm:text-xl leading-relaxed max-w-lg mx-auto lg:mx-0 text-gray-100 lg:text-gray-600 font-light">
                Discover authentic family recipes passed down through generations. 
                <span className="block mt-2 font-medium text-white lg:text-gray-800">
                  From comfort classics to cultural treasures.
                </span>
              </p>

              {/* CTA Section */}
              <div className="flex flex-col items-center lg:items-start gap-6 pt-6">
                <button
                  onClick={handleGetStarted}
                  className="group relative flex items-center gap-3 rounded-full bg-orange-600 px-10 py-4 text-lg font-bold text-white transition-all hover:shadow-2xl hover:scale-105 hover:from-orange-600 hover:to-red-700"
                >
                  <span>Get Started</span>
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>

                <p className="text-base text-gray-200 lg:text-gray-500">
                  Join thousands exploring delicious recipes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedRecipes />

      <Categories />

      <Footer />
    </div>
  );
}
