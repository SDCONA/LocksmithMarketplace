import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface TermsOfServicePageProps {
  onBack: () => void;
}

export function TermsOfServicePage({ onBack }: TermsOfServicePageProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-600">Last updated: September 30, 2025</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Agreement to Terms</h2>
          <p className="text-blue-800">
            By accessing and using Locksmith Marketplace, you agree to be bound by these Terms of Service and all applicable laws and regulations. 
            If you do not agree with any of these terms, you are prohibited from using this platform.
          </p>
        </div>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Platform Overview</h2>
          <p className="text-gray-700 mb-4">
            Locksmith Marketplace is a platform that connects buyers and sellers of automotive keys, locksmith supplies, and related services. 
            We facilitate transactions but do not directly sell products or provide locksmith services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Accounts</h2>
          
          <h3 className="text-lg font-medium text-gray-800 mb-3">Account Registration</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>You must be at least 18 years old to create an account</li>
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain the security of your account credentials</li>
            <li>You are responsible for all activities under your account</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mb-3">Account Termination</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>You may delete your account at any time through account settings</li>
            <li>We may suspend or terminate accounts that violate these terms</li>
            <li>Upon termination, your access to the platform will cease immediately</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Marketplace Rules</h2>
          
          <h3 className="text-lg font-medium text-gray-800 mb-3">Allowed Items</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Automotive keys, key fobs, and remote controls</li>
            <li>Key programming tools and locksmith equipment</li>
            <li>Related automotive security products</li>
            <li>Professional locksmith services</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mb-3">Prohibited Items and Activities</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Stolen or illegally obtained keys or equipment</li>
            <li>Items that circumvent vehicle security without proper authorization</li>
            <li>Fraudulent listings or misrepresented products</li>
            <li>Harassment, threats, or abusive behavior toward other users</li>
            <li>Spam, unauthorized advertising, or promotional content</li>
            <li>Any illegal activities or content</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Seller Responsibilities</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Provide accurate descriptions and photos of listed items</li>
            <li>Honor all sales and communicate promptly with buyers</li>
            <li>Ship items securely and within stated timeframes</li>
            <li>Maintain appropriate business licenses if applicable</li>
            <li>Comply with all local, state, and federal laws</li>
            <li>Handle returns and refunds according to stated policies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Buyer Responsibilities</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Read item descriptions and seller policies carefully</li>
            <li>Make payments only through our secure platform</li>
            <li>Communicate respectfully with sellers</li>
            <li>Report any issues or disputes promptly</li>
            <li>Verify legal ownership before purchasing keys for vehicles</li>
            <li>Use purchased items only for lawful purposes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment and Fees</h2>
          
          <h3 className="text-lg font-medium text-gray-800 mb-3">Transaction Fees</h3>
          <p className="text-gray-700 mb-4">
            We charge sellers a small transaction fee to maintain and improve our platform. Current fee structure:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>5% transaction fee on successful sales</li>
            <li>Payment processing fees as charged by payment providers</li>
            <li>Optional listing enhancement fees</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mb-3">Payment Processing</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>All payments are processed through secure third-party providers</li>
            <li>We do not store payment card information</li>
            <li>Refunds are subject to seller policies and our dispute resolution process</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>You retain ownership of content you post, but grant us license to use it on our platform</li>
            <li>Respect the intellectual property rights of others</li>
            <li>Report copyright infringement using our DMCA process</li>
            <li>Our platform content and design are protected by copyright and trademark laws</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
          
          <h3 className="text-lg font-medium text-gray-800 mb-3">Platform Mediation</h3>
          <p className="text-gray-700 mb-4">
            We provide dispute resolution services for transaction-related issues:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Report disputes within 30 days of transaction completion</li>
            <li>Provide evidence and documentation to support your claim</li>
            <li>Participate in good faith in our mediation process</li>
            <li>Accept our final decision on dispute resolution</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mb-3">Legal Action</h3>
          <p className="text-gray-700">
            Any disputes not resolved through our platform will be subject to binding arbitration in Los Angeles, California, 
            under the rules of the American Arbitration Association.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
          <p className="text-gray-700 mb-4">
            Locksmith Marketplace is a platform facilitating connections between users. We are not liable for:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Quality, safety, legality, or accuracy of listed items</li>
            <li>Actions or conduct of buyers, sellers, or other users</li>
            <li>Damages resulting from transactions between users</li>
            <li>Technical issues, outages, or data loss</li>
            <li>Third-party content or services integrated with our platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Indemnification</h2>
          <p className="text-gray-700">
            You agree to indemnify and hold harmless Locksmith Marketplace, its officers, directors, employees, and agents 
            from any claims, damages, or expenses arising from your use of the platform or violation of these terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
          <p className="text-gray-700">
            We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. 
            Your continued use of the platform constitutes acceptance of any changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
          <p className="text-gray-700">
            These Terms of Service are governed by the laws of the State of California, without regard to conflict of law provisions.
          </p>
        </section>


      </div>
    </div>
  );
}