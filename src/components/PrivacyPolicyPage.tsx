import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-600">Last updated: September 30, 2025</p>
      </div>

      <div className="prose prose-gray max-w-none space-y-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">Our Commitment to Your Privacy</h2>
          <p className="text-blue-800">
            At Locksmith Marketplace, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, and safeguard your data when you use our platform.
          </p>
        </div>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
          
          <h3 className="text-lg font-medium text-gray-800 mb-3">Personal Information</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Name, email address, and phone number when you create an account</li>
            <li>Address information for shipping and location-based services</li>
            <li>Payment information when making purchases (processed securely through third-party providers)</li>
            <li>Profile information and photos you choose to share</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-800 mb-3">Usage Information</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Search queries and browsing behavior on our platform</li>
            <li>Communication history with other users and customer support</li>
            <li>Device information and IP address for security and analytics</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Provide and improve our marketplace services</li>
            <li>Connect buyers and sellers securely</li>
            <li>Process transactions and communicate order status</li>
            <li>Send important account and service notifications</li>
            <li>Prevent fraud and ensure platform security</li>
            <li>Analyze usage patterns to enhance user experience</li>
            <li>Comply with legal obligations and resolve disputes</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell, rent, or trade your personal information to third parties. We may share your information only in these situations:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>With other users when necessary to facilitate transactions (e.g., shipping address to sellers)</li>
            <li>With service providers who help us operate our platform (under strict confidentiality agreements)</li>
            <li>When required by law or to protect our rights and safety</li>
            <li>In connection with a business transfer or acquisition (with prior notice)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement industry-standard security measures to protect your personal information:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>SSL encryption for all data transmission</li>
            <li>Secure servers and regular security audits</li>
            <li>Limited access to personal information on a need-to-know basis</li>
            <li>Regular security training for our team members</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights and Choices</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Access:</strong> Request a copy of your personal information</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
            <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar technologies to enhance your browsing experience. You can control cookie settings through your browser, 
            though some features may not function properly if cookies are disabled.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
          <p className="text-gray-700 mb-4">
            Our platform integrates with third-party services for payments, analytics, and other features. 
            These services have their own privacy policies, and we encourage you to review them.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
          <p className="text-gray-700">
            Our services are not intended for users under 18 years of age. We do not knowingly collect personal information from children under 18. 
            If we become aware of such collection, we will delete the information immediately.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of significant changes via email. 
            Your continued use of our services after such changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">reCAPTCHA Protection</h2>
          <p className="text-gray-700">
            This site is protected by reCAPTCHA and the Google{' '}
            <a 
              href="https://policies.google.com/privacy" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Privacy Policy
            </a>{' '}
            and{' '}
            <a 
              href="https://policies.google.com/terms" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Terms of Service
            </a>{' '}
            apply.
          </p>
        </section>

      </div>
    </div>
  );
}