import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

interface FooterProps {
  onNavigate: (page: 'terms' | 'privacy' | 'contact' | 'retailers' | 'marketplace' | 'messages' | 'account' | 'listing' | 'settings' | 'profile' | 'help' | 'seller-listings' | 'promote') => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4">


        {/* Bottom Bar - show on all devices, but adjust spacing for mobile */}
        <div className="border-t border-gray-800 flex items-center justify-center min-h-[6rem] py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 min-h-[3rem] mx-[5px] my-[0px]">
            <p className="text-gray-400 text-sm mr-2">
              © {currentYear} Locksmith Marketplace. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <button 
                onClick={() => {
                  console.log('Footer - Terms clicked');
                  onNavigate('terms');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </button>
              <button 
                onClick={() => {
                  console.log('Footer - Privacy clicked');
                  onNavigate('privacy');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </button>
              <button 
                onClick={() => {
                  console.log('Footer - Contact clicked');
                  onNavigate('contact');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}