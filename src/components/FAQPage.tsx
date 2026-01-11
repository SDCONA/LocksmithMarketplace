import { Button } from "./ui/button";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

interface FAQPageProps {
  onBack: () => void;
}

export function FAQPage({ onBack }: FAQPageProps) {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-gray-600">Find answers to common questions about Locksmith Marketplace</p>
      </div>

      <div className="space-y-8">
        {/* General Questions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">General Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What is Locksmith Marketplace?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  Locksmith Marketplace is a comprehensive platform designed specifically for automotive locksmiths. 
                  We offer three main services: (1) A marketplace to buy and sell locksmith equipment and parts, 
                  (2) Exclusive deals from verified retailers, and (3) A professional Hub with technical resources 
                  including transponder fitment guides, VAG part numbers, Lishi catalogs, and immobilizer locations.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Is Locksmith Marketplace free to use?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  Yes! Creating an account and browsing the marketplace, deals, and Hub resources is completely free. 
                  We only charge a small commission on completed marketplace sales to help maintain and improve the platform. 
                  All Hub tools and resources are free to access.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Who can use Locksmith Marketplace?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  Locksmith Marketplace is designed for professional automotive locksmiths, locksmith businesses, 
                  equipment retailers, and suppliers. While anyone can browse public listings and resources, 
                  certain features like creating listings or accessing retailer deals require a verified account.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>How do I create an account?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  Click the "Sign In" button in the top navigation, then select "Sign Up" to create a new account. 
                  You'll need to provide your email address, create a password, and complete your profile information. 
                  We use Google reCAPTCHA v3 to ensure secure registration.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Marketplace Questions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Marketplace Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-5">
              <AccordionTrigger>How do I create a listing?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed mb-3">
                  To create a listing:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>Sign in to your account</li>
                  <li>Navigate to the Marketplace page</li>
                  <li>Click the "Create Listing" button</li>
                  <li>Fill in the item details, price, condition, and upload photos</li>
                  <li>Submit your listing for review</li>
                </ol>
                <p className="text-gray-700 mt-3">
                  Listings are typically reviewed and approved within 24 hours.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>How do payments work?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  Buyers and sellers communicate directly through our messaging system to arrange payment and shipping. 
                  We recommend using secure payment methods like PayPal or credit cards for buyer protection. 
                  Locksmith Marketplace does not handle payments directly but provides a secure platform for transactions.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger>What items can I sell?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You can sell automotive locksmith-related items including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Key cutting machines and equipment</li>
                  <li>Key programming tools and software</li>
                  <li>Transponder chips and key blanks</li>
                  <li>Lishi tools and lock picks</li>
                  <li>Diagnostic equipment and scanners</li>
                  <li>Books, manuals, and reference materials</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  Items must comply with local laws and regulations. We do not allow the sale of illegal lock picking 
                  tools or items intended for criminal use.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger>How do I contact a seller?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  Click the "Contact Seller" button on any listing to open our built-in messaging system. You can 
                  ask questions, negotiate prices, and arrange payment/shipping directly with the seller. All messages 
                  are stored in your Messages page for easy reference.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9">
              <AccordionTrigger>What if I have a dispute with a buyer/seller?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  If you experience issues with a transaction, first try to resolve it directly with the other party 
                  through our messaging system. If that doesn't work, contact our support team through the Contact page. 
                  We'll review the situation and help mediate a fair resolution. You can also use our Report feature 
                  to flag problematic listings or users.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Deals Questions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Deals Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-10">
              <AccordionTrigger>How do I access exclusive deals?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  Navigate to the Deals page to browse all current offers from verified retailers. Deals are updated 
                  daily and include discounts on key machines, transponder chips, programming tools, and more. 
                  Click "View Deal" to be redirected to the retailer's website where you can complete your purchase.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-11">
              <AccordionTrigger>Can I save deals for later?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  Yes! Click the heart icon on any deal to save it to your Saved Deals page. This makes it easy to 
                  keep track of offers you're interested in and review them later.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-12">
              <AccordionTrigger>How do I become a featured retailer?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  If you're a locksmith equipment retailer interested in featuring your deals on our platform, 
                  please contact us through the Contact page. We'll review your business and discuss partnership 
                  opportunities. Featured retailers get access to our Retailer Dashboard to manage deals, track 
                  analytics, and reach thousands of professional locksmiths.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Hub Questions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Hub & Resources Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-13">
              <AccordionTrigger>What is the Locksmith Hub?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed mb-3">
                  The Locksmith Hub is a collection of professional tools and resources including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li><strong>Transponder to Car Fitment:</strong> Find the correct transponder chip for any vehicle (1947-2024)</li>
                  <li><strong>VAG Part Numbers:</strong> Complete database of Audi, VW, Seat, and Skoda key part numbers</li>
                  <li><strong>Car Brand to Lishi Catalog:</strong> Cross-reference vehicle makes with compatible Lishi tools</li>
                  <li><strong>Lishi Fitment Catalog:</strong> Complete Lishi 2-in-1 tool compatibility guide</li>
                  <li><strong>Immobilizer Location:</strong> Visual guides showing ECU and module locations by vehicle</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-14">
              <AccordionTrigger>Is the Hub data accurate and up to date?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  Yes! Our Hub data is sourced from official manufacturer documentation, verified locksmith resources, 
                  and community contributions. We continuously update our database to include new vehicles and 
                  corrections. If you spot an error, please use the Report feature or contact us so we can fix it.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-15">
              <AccordionTrigger>Can I use Hub tools offline?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  Currently, Hub tools require an internet connection to access the database. However, you can 
                  bookmark specific pages or take screenshots for offline reference. We're working on a mobile app 
                  with offline capabilities - stay tuned!
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Account & Security */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Account & Security</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-16">
              <AccordionTrigger>How do I reset my password?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  Click "Sign In" in the top navigation, then select "Forgot Password" below the sign-in form. 
                  Enter your email address and we'll send you a password reset link. Follow the instructions in 
                  the email to create a new password.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-17">
              <AccordionTrigger>Is my data secure?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  Absolutely. We use enterprise-grade security including Google reCAPTCHA v3 to prevent spam and 
                  unauthorized access, encrypted connections (HTTPS), and secure database storage through Supabase. 
                  We never share your personal information with third parties without your consent. Read our 
                  Privacy Policy for more details.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-18">
              <AccordionTrigger>Can I delete my account?</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700 leading-relaxed">
                  Yes. Go to Settings → Account Settings and scroll to the bottom where you'll find the "Delete Account" 
                  option. This will permanently remove your account, listings, and personal data. Active listings will 
                  be archived and messages will be anonymized. This action cannot be undone.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Still Have Questions? */}
        <section className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Still Have Questions?</h2>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onBack} variant="outline">
              Contact Support
            </Button>
            <Button onClick={onBack}>
              Visit Help Center
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
