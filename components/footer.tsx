import '../assets/styles/footer.css';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="footer-title">LocalBite Kitchen</h3>
            <p className="footer-text">
              Preserving culinary traditions, one recipe at a time.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Explore Flavors</h4>
            <ul className="space-y-2 footer-text">
              <li>
                <Link href="/" className="footer-link">
                  Home{' '}
                  <ArrowRight size={14} className="footer-arrow" />
                </Link>
              </li>
              <li>
                <a href="#categories" className="footer-link">
                  Meal Categories{' '}
                  <ArrowRight size={14} className="footer-arrow" />
                </a>
              </li>
              <li>
                <a href="#featuredRecipes" className="footer-link">
                  Featured Recipes{' '}
                  <ArrowRight size={14} className="footer-arrow" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Connect</h4>
            <p className="footer-text">
              Join our community of food lovers sharing traditional recipes.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; 2025{' '}
            <Link href="/" className="footer-link">
              LocalBites
            </Link>{' '}
            Kitchen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

