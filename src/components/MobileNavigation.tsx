import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Store, MessageCircle, Heart, User, Tag } from "lucide-react";

interface MobileNavigationProps {
  currentSection: string;
  setCurrentSection: (section: 'retailers' | 'marketplace' | 'messages' | 'account' | 'listing' | 'settings' | 'profile' | 'help' | 'seller-listings' | 'deals' | 'contact' | 'privacy' | 'terms') => void;
  user: any;
  onAuthRequired: () => void;
  unreadMessages?: number;
}

export function MobileNavigation({ 
  currentSection, 
  setCurrentSection, 
  user, 
  onAuthRequired,
  unreadMessages = 0
}: MobileNavigationProps) {
  const [pulsingButton, setPulsingButton] = useState<string | null>(null);

  const handleButtonClick = (buttonId: string, action: () => void) => {
    setPulsingButton(buttonId);
    action();
    
    // Remove pulse animation after it completes
    setTimeout(() => {
      setPulsingButton(null);
    }, 300);
  };

  const handleMessagesClick = () => {
    console.log('Mobile Navigation - Messages clicked');
    if (!user) {
      console.log('User not authenticated, showing auth modal');
      onAuthRequired();
      return;
    }
    setCurrentSection('messages');
  };

  const handleDealsClick = () => {
    console.log('Mobile Navigation - Deals clicked');
    setCurrentSection('deals');
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600/90 via-blue-500/85 to-indigo-600/90 backdrop-blur-xl border-t border-white/20 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] pb-[env(safe-area-inset-bottom)]" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none"></div>
      <div className="grid grid-cols-4 h-14 sm:h-16 relative">
        {/* HIDDEN: Retailers button temporarily hidden */}
        {/* Retailers */}
        {false && (
        <Button
          variant="ghost"
          onClick={() => handleButtonClick('retailers', () => {
            console.log('Mobile Navigation - Retailers clicked');
            setCurrentSection('retailers');
          })}
          className={`flex flex-col items-center justify-center h-full rounded-none px-1 transition-all duration-300 ${
            currentSection === 'retailers' ? 'text-white bg-white/25 shadow-md border-t-2 border-white/40' : 'text-white/90 hover:bg-white/15 hover:text-white'
          } ${pulsingButton === 'retailers' ? 'animate-button-pulse' : ''}`}
        >
          <Heart className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
          <span className="text-xs sm:text-sm font-bold leading-tight">Retailers</span>
        </Button>
        )}

        {/* Marketplace */}
        <Button
          variant="ghost"
          onClick={() => handleButtonClick('marketplace', () => {
            console.log('Mobile Navigation - Marketplace clicked');
            setCurrentSection('marketplace');
          })}
          className={`flex flex-col items-center justify-center h-full rounded-none px-1 transition-all duration-300 ${
            currentSection === 'marketplace' ? 'text-white bg-white/25 shadow-md border-t-2 border-white/40' : 'text-white/90 hover:bg-white/15 hover:text-white'
          } ${pulsingButton === 'marketplace' ? 'animate-button-pulse' : ''}`}
        >
          <Store className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
          <span className="text-xs sm:text-sm font-bold leading-tight">Market</span>
        </Button>

        {/* Messages */}
        <Button
          variant="ghost"
          onClick={() => handleButtonClick('messages', handleMessagesClick)}
          className={`flex flex-col items-center justify-center h-full rounded-none relative px-1 transition-all duration-300 ${
            currentSection === 'messages' ? 'text-white bg-white/25 shadow-md border-t-2 border-white/40' : 'text-white/90 hover:bg-white/15 hover:text-white'
          } ${pulsingButton === 'messages' ? 'animate-button-pulse' : ''}`}
        >
          <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
          <span className="text-xs sm:text-sm font-bold leading-tight">Messages</span>
          {unreadMessages > 0 && (
            <Badge className="absolute top-0.5 sm:top-1 right-1 sm:right-2 h-4 w-4 sm:h-5 sm:w-5 p-0 text-xs bg-red-500 text-white shadow-lg ring-2 ring-white/30">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </Badge>
          )}
        </Button>

        {/* Deals */}
        <Button
          variant="ghost"
          onClick={() => handleButtonClick('deals', handleDealsClick)}
          className={`flex flex-col items-center justify-center h-full rounded-none px-1 transition-all duration-300 ${
            currentSection === 'deals' ? 'text-white bg-white/25 shadow-md border-t-2 border-white/40' : 'text-white/90 hover:bg-white/15 hover:text-white'
          } ${pulsingButton === 'deals' ? 'animate-button-pulse' : ''}`}
        >
          <Tag className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
          <span className="text-xs sm:text-sm font-bold leading-tight">Deals</span>
        </Button>

        {/* Account */}
        <Button
          variant="ghost"
          onClick={() => handleButtonClick('account', () => {
            console.log('Mobile Navigation - Account/Login clicked');
            if (!user) {
              console.log('User not authenticated, showing auth modal');
              onAuthRequired();
            } else {
              setCurrentSection('account');
            }
          })}
          className={`flex flex-col items-center justify-center h-full rounded-none px-1 transition-all duration-300 ${ 
            currentSection === 'account' ? 'text-white bg-white/25 shadow-md border-t-2 border-white/40' : 'text-white/90 hover:bg-white/15 hover:text-white'
          } ${pulsingButton === 'account' ? 'animate-button-pulse' : ''}`}
        >
          <User className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
          <span className="text-xs sm:text-sm font-bold leading-tight">{user ? 'Account' : 'Login'}</span>
        </Button>
      </div>
    </div>
  );
}