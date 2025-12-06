import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black/90 text-white py-16 md:py-20 px-4 border-t-4 border-orange-600 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] mt-20">
      <div className="container max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              LocalBite Kitchen
            </h3>
            <p className="text-white/80 leading-relaxed text-base md:text-lg">
              Preserving culinary traditions, one recipe at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-5 text-white relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-orange-600 after:to-orange-400 after:rounded-full">
              Explore Flavors
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="group flex items-center gap-2 text-white/75 hover:text-white hover:translate-x-1 transition-all duration-300"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-orange-600">→</span>
                  <span>Home</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto" />
                </Link>
              </li>
              <li>
                <a 
                  href="#categories" 
                  className="group flex items-center gap-2 text-white/75 hover:text-white hover:translate-x-1 transition-all duration-300"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-orange-600">→</span>
                  <span>Meal Categories</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto" />
                </a>
              </li>
              <li>
                <a 
                  href="#featuredRecipes" 
                  className="group flex items-center gap-2 text-white/75 hover:text-white hover:translate-x-1 transition-all duration-300"
                >
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-orange-600">→</span>
                  <span>Featured Recipes</span>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-5 text-white relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-orange-600 after:to-orange-400 after:rounded-full">
              Connect
            </h4>
            <p className="text-white/80 leading-relaxed text-base md:text-lg">
              Join our community of food lovers sharing traditional recipes.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/15 pt-8 text-center">
          <p className="text-white/70 text-sm md:text-base tracking-wide">
            &copy; 2025{' '}
            <Link 
              href="/" 
              className="text-white/75 hover:text-orange-400 transition-colors duration-300 font-medium"
            >
              LocalBites Kitchen
            </Link>{' '}
            Kitchen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

