import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone, 
  Search,
  BookOpen,
  Shield,
  CreditCard,
  Users,
  Settings,
  Store,
  Key,
  Truck
} from "lucide-react";

interface HelpSupportPageProps {
  onBack: () => void;
}

export function HelpSupportPage({ onBack }: HelpSupportPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: ""
  });

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    // In real app, submit to support system
    console.log("Contact form submitted:", contactForm);
    // Reset form
    setContactForm({
      name: "",
      email: "",
      subject: "",
      message: "",
      category: ""
    });
  };

  const faqCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      faqs: [
        {
          question: "How do I create an account?",
          answer: "Click the 'Login' button in the top right corner, then select 'Create Account'. Fill in your details and verify your email address to get started."
        },
        {
          question: "How do I search for automotive keys?",
          answer: "Use the vehicle selector on the homepage to choose your car's year, make, and model. You can also use the search bar to look for specific key types or part numbers."
        },
        {
          question: "What's the difference between Retailers and Marketplace?",
          answer: "Retailers shows professional key suppliers and their inventory. Marketplace is our community platform where individuals and businesses can buy and sell automotive keys and tools."
        }
      ]
    },
    {
      id: "buying-selling",
      title: "Buying & Selling",
      icon: Store,
      faqs: [
        {
          question: "How do I create a marketplace listing?",
          answer: "Go to the Marketplace section and click 'Create Listing'. Upload photos, add a description, set your price, and publish your listing."
        },
        {
          question: "How do payments work?",
          answer: "Payments are handled securely through our platform. Buyers pay at checkout, and funds are released to sellers once the item is delivered and confirmed."
        },
        {
          question: "What are the seller fees?",
          answer: "We charge a small fee only when you make a sale. There are no listing fees or monthly charges. Check our pricing page for current rates."
        },
        {
          question: "How do I contact a seller?",
          answer: "Click on any listing to view details, then use the 'Message Seller' button to start a conversation. All messages are handled through our secure messaging system."
        }
      ]
    },
    {
      id: "keys-programming",
      title: "Keys & Programming",
      icon: Key,
      faqs: [
        {
          question: "Do I need to program my new key?",
          answer: "Most modern car keys require programming to work with your vehicle. Check with the seller if programming is included, or find a local locksmith who can program it for you."
        },
        {
          question: "What's the difference between OEM and aftermarket keys?",
          answer: "OEM keys are made by your car's manufacturer and typically cost more but offer guaranteed compatibility. Aftermarket keys are made by third parties and are usually more affordable."
        },
        {
          question: "How do I know if a key is compatible with my car?",
          answer: "Each listing shows compatibility information. Always verify your car's year, make, model, and engine type before purchasing. When in doubt, contact the seller."
        },
        {
          question: "What if my key doesn't work after purchase?",
          answer: "Contact the seller first to resolve the issue. If you can't reach an agreement, our support team can help mediate the situation and ensure you get a working solution."
        }
      ]
    },
    {
      id: "shipping-returns",
      title: "Shipping & Returns",
      icon: Truck,
      faqs: [
        {
          question: "How long does shipping take?",
          answer: "Shipping times vary by seller and location. Most retailers offer 2-5 day shipping, while marketplace sellers set their own shipping policies."
        },
        {
          question: "Can I return a key if it doesn't work?",
          answer: "Return policies vary by seller. Check the listing details for specific return information. Most professional sellers offer returns for non-functional items."
        },
        {
          question: "How can I track my order?",
          answer: "You'll receive tracking information once your order ships. You can also check your order status in your account dashboard."
        }
      ]
    },
    {
      id: "account-security",
      title: "Account & Security",
      icon: Shield,
      faqs: [
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page and enter your email address. You'll receive instructions to reset your password."
        },
        {
          question: "Is my payment information secure?",
          answer: "Yes, we use industry-standard encryption and never store your full credit card details. All payments are processed through secure, PCI-compliant payment processors."
        },
        {
          question: "How do I update my account information?",
          answer: "Go to your Account page and click 'Edit Profile' to update your personal information, shipping addresses, and preferences."
        },
        {
          question: "How do I delete my account?",
          answer: "Contact our support team to request account deletion. Note that this action cannot be undone and will remove all your listings and messages."
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Help & Support</h1>
              <p className="text-sm text-gray-600">Get answers to your questions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="guides">Guides</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search frequently asked questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* FAQ Categories */}
            <div className="space-y-6">
              {filteredFAQs.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <category.icon className="h-5 w-5" />
                      <span>{category.title}</span>
                      <Badge variant="secondary">{category.faqs.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`${category.id}-${index}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-gray-600">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredFAQs.length === 0 && searchQuery && (
              <Card>
                <CardContent className="p-6 text-center">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">
                    We couldn't find any FAQ entries matching "{searchQuery}"
                  </p>
                  <Button onClick={() => setSearchQuery("")} variant="outline">
                    Clear search
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                  <CardDescription>
                    Choose the best way to reach our support team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">Live Chat</div>
                      <div className="text-sm text-gray-600">Usually responds in minutes</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Email Support</div>
                      <div className="text-sm text-gray-600">support@locksmithmarketplace.com</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Phone className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="font-medium">Phone Support</div>
                      <div className="text-sm text-gray-600">Mon-Fri 9AM-6PM PST</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                  <CardDescription>
                    Fill out this form and we'll get back to you soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitContact} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        rows={6}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Key className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="font-semibold mb-2">Key Buying Guide</h3>
                  <p className="text-sm text-gray-600">
                    Learn how to choose the right replacement key for your vehicle
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Settings className="h-8 w-8 text-green-600 mb-4" />
                  <h3 className="font-semibold mb-2">Programming Guide</h3>
                  <p className="text-sm text-gray-600">
                    Step-by-step instructions for programming your new key
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Store className="h-8 w-8 text-purple-600 mb-4" />
                  <h3 className="font-semibold mb-2">Selling Tips</h3>
                  <p className="text-sm text-gray-600">
                    Best practices for creating successful marketplace listings
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Shield className="h-8 w-8 text-orange-600 mb-4" />
                  <h3 className="font-semibold mb-2">Safety Guide</h3>
                  <p className="text-sm text-gray-600">
                    How to buy and sell safely on our platform
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <CreditCard className="h-8 w-8 text-red-600 mb-4" />
                  <h3 className="font-semibold mb-2">Payment Guide</h3>
                  <p className="text-sm text-gray-600">
                    Understanding payments, fees, and protection policies
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Users className="h-8 w-8 text-teal-600 mb-4" />
                  <h3 className="font-semibold mb-2">Community Guidelines</h3>
                  <p className="text-sm text-gray-600">
                    Rules and best practices for our community
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}