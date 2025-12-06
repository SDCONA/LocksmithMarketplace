interface LocksmithMarketplaceLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LocksmithMarketplaceLogo({ className = "", size = 'md' }: LocksmithMarketplaceLogoProps) {
  const sizeClasses = {
    sm: "h-8 w-auto",
    md: "h-10 w-auto", 
    lg: "h-12 w-auto"
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      {/* Mobile: Text Only */}
      <div className="block md:hidden">
        <div className="flex flex-col leading-tight">
          <span className="text-white text-sm font-bold">Locksmith</span>
          <span className="text-blue-100 text-sm">Marketplace</span>
        </div>
      </div>
      
      {/* Desktop: Full Logo with Key Icon */}
      <div className="hidden md:block">
        <svg 
          viewBox="0 0 260 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-auto"
        >

          
          {/* Key Icon */}
          <circle cx="12" cy="20" r="8" fill="white" stroke="none"/>
          <circle cx="12" cy="20" r="3" fill="#1d4ed8"/>
          <rect x="20" y="18" width="16" height="4" fill="white"/>
          <rect x="32" y="18" width="2" height="6" fill="white"/>
          <rect x="35" y="18" width="2" height="4" fill="white"/>
          
          {/* Text */}
          <text 
            x="45" 
            y="16" 
            fontSize="13" 
            fontWeight="700" 
            fill="white" 
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Locksmith
          </text>
          <text 
            x="45" 
            y="30" 
            fontSize="13" 
            fontWeight="400" 
            fill="#bfdbfe" 
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Marketplace
          </text>
          
          {/* Accent dot */}
          <circle cx="180" cy="25" r="2" fill="#fbbf24"/>
        </svg>
      </div>
    </div>
  );
}