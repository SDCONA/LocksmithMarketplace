import { useEffect } from 'react';

interface OrganizationSchemaProps {
  type?: 'organization';
}

interface WebsiteSchemaProps {
  type: 'website';
}

interface ProductSchemaProps {
  type: 'product';
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string;
  brand?: string;
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
}

interface OfferSchemaProps {
  type: 'offer';
  title: string;
  description: string;
  url: string;
  retailer: string;
}

type StructuredDataProps = OrganizationSchemaProps | WebsiteSchemaProps | ProductSchemaProps | OfferSchemaProps;

export function StructuredData(props: StructuredDataProps) {
  useEffect(() => {
    let schema = {};

    if (props.type === 'organization' || !props.type) {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Locksmith Marketplace',
        description: 'Comprehensive automotive locksmith marketplace and professional resource platform',
        url: 'https://locksmith-marketplace.vercel.app',
        logo: 'https://locksmith-marketplace.vercel.app/logo.png',
        sameAs: [
          // Add social media links here when available
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'Customer Service',
          email: 'support@locksmithmarketplace.com',
        },
        areaServed: {
          '@type': 'Country',
          name: 'United States',
        },
        serviceType: [
          'Locksmith Marketplace',
          'Automotive Key Services',
          'Locksmith Equipment Sales',
          'Professional Locksmith Resources',
        ],
      };
    } else if (props.type === 'website') {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Locksmith Marketplace',
        url: 'https://locksmith-marketplace.vercel.app',
        description: 'Find automotive locksmith keys, transponder chips, Lishi tools, and key programming services',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://locksmith-marketplace.vercel.app/marketplace?search={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      };
    } else if (props.type === 'product') {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: props.name,
        description: props.description,
        image: props.image || 'https://locksmith-marketplace.vercel.app/default-product.jpg',
        brand: {
          '@type': 'Brand',
          name: props.brand || 'Generic',
        },
        offers: {
          '@type': 'Offer',
          price: props.price,
          priceCurrency: props.currency || 'USD',
          itemCondition: `https://schema.org/${props.condition || 'UsedCondition'}`,
          availability: 'https://schema.org/InStock',
        },
      };
    } else if (props.type === 'offer') {
      schema = {
        '@context': 'https://schema.org',
        '@type': 'Offer',
        name: props.title,
        description: props.description,
        url: props.url,
        seller: {
          '@type': 'Organization',
          name: props.retailer,
        },
        availability: 'https://schema.org/InStock',
      };
    }

    // Create or update script tag
    let scriptTag = document.querySelector('script[type="application/ld+json"][data-structured-data]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.setAttribute('data-structured-data', 'true');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schema);

    return () => {
      // Cleanup on unmount
      const tag = document.querySelector('script[type="application/ld+json"][data-structured-data]');
      if (tag) {
        tag.remove();
      }
    };
  }, [props]);

  return null;
}

// Pre-configured structured data for common pages
export const STRUCTURED_DATA = {
  organization: <StructuredData type="organization" />,
  website: <StructuredData type="website" />,
};
