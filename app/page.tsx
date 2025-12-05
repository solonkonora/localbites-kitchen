'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import Footer from '@/components/footer';

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
    <div className="min-h-screen">
      {/* hero Section */}
      <section className="min-h-screen flex items-stretch relative">
        {/* Background Image for Mobile/Tablet, hidden on Desktop */}
        <div className="absolute inset-0 lg:hidden">
          <Image
            src="https://res.cloudinary.com/drs0ewxd1/image/upload/v1/cameroon-recipes/lunch/achu.jpg"
            alt="Traditional Recipe"
            fill
            className="object-cover object-center"
            priority
          />
          {/* overlay for better text readability */}
          <div className="absolute inset-0 bg-black/80"></div>
        </div>

        <div className="w-full flex flex-col lg:flex-row relative z-10">
          {/* only visible on Desktop */}
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
          
          {/* text right side */}
          <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 min-h-screen lg:bg-gradient-to-br lg:from-orange-50 lg:via-white lg:to-yellow-50">
            <div className="max-w-2xl space-y-6 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white lg:text-gray-900">
                Traditional Recipes,
                <br />
                <span className="text-orange-400 lg:text-orange-600">Modern Kitchen</span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto lg:mx-0 text-white lg:text-gray-700">
                Discover authentic family recipes passed down through
                generations. From comfort classics to cultural treasures.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <p className="text-lg font-medium text-white lg:text-gray-700">
                  Want to explore!
                </p>

                <button
                  onClick={handleGetStarted}
                  className="group flex items-center gap-2 rounded-full bg-orange-500 px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-orange-600 hover:shadow-lg hover:scale-105"
                >
                  Get Started
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </button>
              </div>

              {/* Stats or Features */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-bold text-orange-400 lg:text-orange-600">
                    100+
                  </p>
                  <p className="text-sm text-white lg:text-gray-600">Recipes</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-bold text-orange-400 lg:text-orange-600">
                    5+
                  </p>
                  <p className="text-sm text-white lg:text-gray-600">Categories</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-bold text-orange-400 lg:text-orange-600">
                    10k+
                  </p>
                  <p className="text-sm text-white lg:text-gray-600">Food Lovers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Featured Recipes
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Featured recipes component will be added here
          </p>
        </div>
      </section>


      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Browse by Category
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Categories component will be added here
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
