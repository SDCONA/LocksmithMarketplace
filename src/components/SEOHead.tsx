import { useEffect } from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  noindex?: boolean;
}

const DEFAULT_SEO = {
  title: 'Locksmith Marketplace - Automotive Keys, Parts & Services',
  description: 'Find automotive locksmith keys, transponder chips, Lishi tools, and key programming services. Connect with verified locksmiths and retailers nationwide.',
  keywords: 'locksmith, automotive keys, transponder chips, key programming, Lishi tools, car keys, key blanks, immobilizer, key cutting',
  ogImage: '/og-image.jpg',
  ogType: 'website',
  twitterCard: 'summary_large_image' as const,
};

export function SEOHead({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  canonicalUrl,
  noindex = false,
}: SEOProps) {
  useEffect(() => {
    const finalTitle = title || DEFAULT_SEO.title;
    const finalDescription = description || DEFAULT_SEO.description;
    const finalKeywords = keywords || DEFAULT_SEO.keywords;
    const finalOgTitle = ogTitle || title || DEFAULT_SEO.title;
    const finalOgDescription = ogDescription || description || DEFAULT_SEO.description;
    const finalOgImage = ogImage || DEFAULT_SEO.ogImage;

    // Update document title
    document.title = finalTitle;

    // Helper function to update or create meta tag
    const updateMetaTag = (selector: string, content: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        const [attr, value] = selector.replace(/[\[\]]/g, '').split('=');
        element.setAttribute(attr, value.replace(/['"]/g, ''));
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update basic meta tags
    updateMetaTag('meta[name="description"]', finalDescription);
    updateMetaTag('meta[name="keywords"]', finalKeywords);

    // Robots meta tag
    if (noindex) {
      updateMetaTag('meta[name="robots"]', 'noindex, nofollow');
    } else {
      const robotsTag = document.querySelector('meta[name="robots"]');
      if (robotsTag) {
        robotsTag.setAttribute('content', 'index, follow');
      }
    }

    // Open Graph tags
    updateMetaTag('meta[property="og:title"]', finalOgTitle);
    updateMetaTag('meta[property="og:description"]', finalOgDescription);
    updateMetaTag('meta[property="og:type"]', ogType);
    updateMetaTag('meta[property="og:image"]', finalOgImage);
    
    if (canonicalUrl) {
      updateMetaTag('meta[property="og:url"]', canonicalUrl);
    }

    // Twitter Card tags
    updateMetaTag('meta[name="twitter:card"]', twitterCard);
    updateMetaTag('meta[name="twitter:title"]', finalOgTitle);
    updateMetaTag('meta[name="twitter:description"]', finalOgDescription);
    updateMetaTag('meta[name="twitter:image"]', finalOgImage);

    // Canonical URL
    if (canonicalUrl) {
      let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.rel = 'canonical';
        document.head.appendChild(linkElement);
      }
      linkElement.href = canonicalUrl;
    }
  }, [title, description, keywords, ogTitle, ogDescription, ogImage, ogType, twitterCard, canonicalUrl, noindex]);

  return null;
}

// Pre-configured SEO for common pages
export const SEO_PAGES = {
  home: {
    title: 'Locksmith Marketplace - Automotive Keys, Parts & Services',
    description: 'Find automotive locksmith keys, transponder chips, Lishi tools, and key programming services. Connect with verified locksmiths and retailers nationwide.',
    keywords: 'locksmith marketplace, automotive keys, transponder chips, key programming, car keys, locksmith tools',
  },
  marketplace: {
    title: 'Locksmith Marketplace - Buy & Sell Keys, Tools & Equipment',
    description: 'Browse listings for automotive locksmith equipment, key blanks, transponder chips, programming tools, and more. Buy from verified sellers.',
    keywords: 'locksmith marketplace, buy locksmith tools, sell locksmith equipment, key blanks for sale, transponder chips',
  },
  deals: {
    title: 'Latest Locksmith Deals & Offers - Save on Tools & Equipment',
    description: 'Exclusive deals on key cutting machines, transponder chips, programming tools, and locksmith equipment from top retailers. Updated daily.',
    keywords: 'locksmith deals, key machine deals, transponder chip discounts, automotive locksmith offers',
  },
  hub: {
    title: 'Locksmith Hub - Professional Tools & Resources',
    description: 'Access transponder fitment guides, VAG part numbers, Lishi catalogs, immobilizer locations, and professional locksmith resources.',
    keywords: 'locksmith hub, transponder fitment, VAG part numbers, Lishi tools, immobilizer location, locksmith resources',
  },
  retailers: {
    title: 'Locksmith Retailers & Suppliers Directory',
    description: 'Find verified locksmith equipment retailers and suppliers. Browse profiles, deals, and contact information for automotive locksmith parts.',
    keywords: 'locksmith retailers, locksmith suppliers, automotive key suppliers, locksmith equipment dealers',
  },
  transponderFitment: {
    title: 'Transponder to Car Fitment Guide - Complete Database',
    description: 'Comprehensive transponder chip fitment guide for all car makes and models. Find the correct chip type for any vehicle (1947-2024).',
    keywords: 'transponder fitment, transponder chip guide, car transponder database, automotive chip compatibility',
  },
  vagPartNumbers: {
    title: 'VAG Part Numbers - Audi, VW, Seat, Skoda Key Parts',
    description: 'Complete VAG (Volkswagen Auto Group) part numbers database for Audi, Volkswagen, Seat, and Skoda keys and immobilizer components.',
    keywords: 'VAG part numbers, Audi key parts, VW key parts, Skoda parts, Seat key numbers, volkswagen parts',
  },
  lishiFitment: {
    title: 'Lishi Tool Fitment Catalog - Complete Cross-Reference',
    description: 'Find the correct Lishi 2-in-1 pick and decoder tool for any vehicle. Complete fitment catalog with part numbers and compatibility.',
    keywords: 'Lishi tools, Lishi fitment, 2-in-1 picks, lock picking tools, Lishi decoder, automotive lock tools',
  },
  immobiliserLocation: {
    title: 'Immobilizer Location Guide - ECU & Module Locations',
    description: 'Visual guide to immobilizer ECU and module locations for all vehicle makes and models. Professional diagnostic resource.',
    keywords: 'immobilizer location, ECU location, immobilizer module, car computer location, automotive electronics',
  },
  contact: {
    title: 'Contact Us - Locksmith Marketplace Support',
    description: 'Get in touch with Locksmith Marketplace. Contact our support team for help with listings, accounts, or general inquiries.',
    keywords: 'contact locksmith marketplace, customer support, locksmith help, marketplace support',
  },
  privacy: {
    title: 'Privacy Policy - Locksmith Marketplace',
    description: 'Read our privacy policy to understand how Locksmith Marketplace collects, uses, and protects your personal information.',
    keywords: 'privacy policy, data protection, user privacy, locksmith marketplace privacy',
  },
  terms: {
    title: 'Terms of Service - Locksmith Marketplace',
    description: 'Review the terms and conditions for using Locksmith Marketplace platform, including user responsibilities and guidelines.',
    keywords: 'terms of service, user agreement, marketplace terms, locksmith marketplace rules',
  },
  about: {
    title: 'About Us - Locksmith Marketplace',
    description: 'Learn about Locksmith Marketplace, our mission to connect automotive locksmiths, and how we support the locksmith community.',
    keywords: 'about locksmith marketplace, our mission, locksmith community, automotive locksmith platform',
  },
  faq: {
    title: 'FAQ - Frequently Asked Questions | Locksmith Marketplace',
    description: 'Find answers to common questions about buying, selling, listings, payments, and using Locksmith Marketplace platform.',
    keywords: 'locksmith faq, marketplace questions, locksmith help, how to use marketplace',
  },
  help: {
    title: 'Help & Support - Locksmith Marketplace',
    description: 'Get help with your Locksmith Marketplace account, listings, purchases, and technical support. Step-by-step guides and tutorials.',
    keywords: 'locksmith help, marketplace support, user guide, locksmith tutorials, marketplace help center',
  },
};
