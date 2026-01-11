import { Button } from "./ui/button";
import { ArrowLeft, Target, Users, Shield, Zap, Globe, Award } from "lucide-react";

interface AboutUsPageProps {
  onBack: () => void;
}

export function AboutUsPage({ onBack }: AboutUsPageProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Locksmith Marketplace</h1>
        <p className="text-xl text-gray-600">
          Empowering the automotive locksmith community with tools, resources, and connections
        </p>
      </div>

      <div className="space-y-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg leading-relaxed">
            Locksmith Marketplace was built by locksmiths, for locksmiths. We understand the challenges of finding 
            the right parts, tools, and information for automotive locksmith work. Our platform brings together a 
            comprehensive marketplace, professional resources, and a thriving community to help you succeed in your business.
          </p>
        </div>

        {/* What We Offer */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Offer</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Marketplace</h3>
              <p className="text-gray-600">
                Buy and sell automotive locksmith equipment, key blanks, transponder chips, programming tools, 
                and more. Connect directly with verified sellers nationwide.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Exclusive Deals</h3>
              <p className="text-gray-600">
                Access exclusive deals and offers from top locksmith equipment retailers. Save on key cutting 
                machines, programmers, and supplies with daily updated promotions.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Hub</h3>
              <p className="text-gray-600">
                Comprehensive technical resources including transponder fitment guides, VAG part numbers, 
                Lishi catalogs, and immobilizer location guides - all in one place.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="bg-gray-50 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Core Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-600 rounded-full p-2 mt-1">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Quality First</h3>
                <p className="text-gray-600">
                  We verify sellers and monitor listings to ensure you get authentic, quality products every time.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-green-600 rounded-full p-2 mt-1">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Driven</h3>
                <p className="text-gray-600">
                  Built by locksmiths who understand your needs. We listen to feedback and continuously improve.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-purple-600 rounded-full p-2 mt-1">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Trust & Safety</h3>
                <p className="text-gray-600">
                  Secure transactions, verified users, and comprehensive buyer/seller protection policies.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-orange-600 rounded-full p-2 mt-1">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600">
                  Constantly adding new features and tools to help you work smarter and grow your business.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Locksmith Marketplace was born from a simple frustration: finding the right parts and information 
              for automotive locksmith work was too difficult and time-consuming.
            </p>
            <p>
              As working locksmiths, we spent hours searching through multiple websites, calling suppliers, and 
              digging through outdated reference materials. We knew there had to be a better way.
            </p>
            <p>
              That's why we built Locksmith Marketplace - a single platform that combines everything you need:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>A trusted marketplace to buy and sell equipment</li>
              <li>Exclusive deals from top retailers</li>
              <li>Comprehensive technical resources and fitment guides</li>
              <li>A vehicle database spanning 77 years (1947-2024)</li>
              <li>Professional tools for transponder identification, part lookups, and more</li>
            </ul>
            <p>
              Today, we're proud to serve thousands of automotive locksmiths across the country, helping them 
              save time, money, and headaches every single day.
            </p>
          </div>
        </section>

        {/* By the Numbers */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">Locksmith Marketplace by the Numbers</h2>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2">77 Years</div>
              <div className="text-gray-300">Vehicle Database Coverage</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">57+</div>
              <div className="text-gray-300">Hub Features & Tools</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">40+</div>
              <div className="text-gray-300">Car Brands Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-400 mb-2">100%</div>
              <div className="text-gray-300">Verified Retailers</div>
            </div>
          </div>
        </section>

        {/* Join Us */}
        <section className="text-center bg-blue-50 rounded-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Community</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Whether you're looking to buy equipment, sell your tools, access professional resources, or find 
            great deals, Locksmith Marketplace is here to support your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Create Free Account
            </Button>
            <Button size="lg" variant="outline">
              Explore the Hub
            </Button>
          </div>
        </section>

        {/* Contact Section */}
        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-gray-600 mb-4">
            Have questions or feedback? We'd love to hear from you.
          </p>
          <Button variant="outline" onClick={onBack}>
            Contact Us
          </Button>
        </section>
      </div>
    </div>
  );
}
