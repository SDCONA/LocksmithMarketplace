import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { User, Mail, Lock, Phone, MapPin, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthService } from "../utils/auth";
import { toast } from "sonner";
import { executeRecaptcha } from "../utils/recaptcha";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any) => void;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  password?: string;
  confirmPassword?: string;
}

export function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState("login");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendVerificationEmail, setResendVerificationEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    city: "",
    password: "",
    confirmPassword: "",
    agreeToPolicy: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Password strength validation
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // Validate password strength
  const validatePassword = (password: string) => {
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/;'`~]/.test(password)
    };
  };

  // Check if password is strong enough
  const isPasswordStrong = (strength: typeof passwordStrength) => {
    return strength.minLength && 
           strength.hasUppercase && 
           strength.hasLowercase && 
           strength.hasNumber && 
           strength.hasSpecialChar;
  };

  // Validate password and return error message
  const validatePasswordError = (password: string): string | undefined => {
    if (!password) return "Password is required";
    const strength = validatePassword(password);
    if (!isPasswordStrong(strength)) {
      return "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character";
    }
    return undefined;
  };

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone) return "Phone number is required";
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) return "Phone number must be 10 digits";
    return undefined;
  };

  const validateName = (name: string, fieldName: string): string | undefined => {
    if (!name) return `${fieldName} is required`;
    if (name.length < 2) return `${fieldName} must be at least 2 characters`;
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return `${fieldName} should only contain letters`;
    return undefined;
  };

  const validateCity = (city: string): string | undefined => {
    if (!city) return "City is required";
    if (city.length < 2) return "City name must be at least 2 characters";
    return undefined;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | undefined => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return undefined;
  };

  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length <= 3) return digitsOnly;
    if (digitsOnly.length <= 6) return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
  };

  // Handle field blur to mark as touched
  const handleBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    const errors: ValidationErrors = {
      firstName: validateName(registerForm.firstName, "First name"),
      lastName: validateName(registerForm.lastName, "Last name"),
      email: validateEmail(registerForm.email),
      phone: validatePhone(registerForm.phone),
      city: validateCity(registerForm.city),
      password: validatePasswordError(registerForm.password),
      confirmPassword: validateConfirmPassword(registerForm.password, registerForm.confirmPassword),
    };

    setValidationErrors(errors);
    
    // Mark all fields as touched
    setTouchedFields(new Set(['firstName', 'lastName', 'email', 'phone', 'city', 'password', 'confirmPassword']));

    const hasErrors = Object.values(errors).some(error => error !== undefined);

    return !hasErrors;
  };

  // Real-time validation as user types
  const handleFieldChange = (field: string, value: string) => {
    setRegisterForm({ ...registerForm, [field]: value });

    // Always update password strength indicator immediately
    if (field === 'password') {
      const strength = validatePassword(value);
      setPasswordStrength(strength);
    }

    // Only validate if field has been touched
    if (touchedFields.has(field)) {
      const errors = { ...validationErrors };
      
      switch (field) {
        case 'firstName':
          errors.firstName = validateName(value, "First name");
          break;
        case 'lastName':
          errors.lastName = validateName(value, "Last name");
          break;
        case 'email':
          errors.email = validateEmail(value);
          break;
        case 'phone':
          errors.phone = validatePhone(value);
          break;
        case 'city':
          errors.city = validateCity(value);
          break;
        case 'password':
          const passwordStrength = validatePassword(value);
          setPasswordStrength(passwordStrength);
          errors.password = isPasswordStrong(passwordStrength) ? undefined : "Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character";
          if (registerForm.confirmPassword) {
            errors.confirmPassword = validateConfirmPassword(value, registerForm.confirmPassword);
          }
          break;
        case 'confirmPassword':
          errors.confirmPassword = validateConfirmPassword(registerForm.password, value);
          break;
      }
      
      setValidationErrors(errors);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await executeRecaptcha('login');

      const response = await AuthService.signin(loginForm.email, loginForm.password, recaptchaToken);

      if (response.success && response.user) {
        onLogin(response.user);
        onClose();
        setLoginForm({ email: "", password: "" });
      } else {
        toast.error("Sign in failed", {
          description: response.error || "Invalid email or password",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Sign in failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      return;
    }

    if (!registerForm.agreeToPolicy) {
      toast.error("Terms required", {
        description: "Please agree to the Terms of Service and Privacy Policy",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await executeRecaptcha('signup');

      const response = await AuthService.signup({
        email: registerForm.email,
        password: registerForm.password,
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        phone: registerForm.phone,
        location: registerForm.location,
        city: registerForm.city,
        recaptchaToken: recaptchaToken
      });

      if (response.success) {
        // Check if email verification is required
        if (response.requiresEmailVerification) {
          toast.success("Account created successfully!", {
            description: "Please check your email and click the verification link to activate your account.",
            duration: 6000,
          });
          onClose();
        } else if (response.requiresManualSignIn) {
          toast.success("Account created successfully!", {
            description: "Please sign in with your credentials.",
            duration: 4000,
          });
          setActiveTab("login");
          setLoginForm(prev => ({ ...prev, email: registerForm.email }));
        } else if (response.user) {
          // Auto-signin was successful
          onLogin(response.user);
          onClose();
        }
        
        // Clear registration form
        setRegisterForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          location: "",
          city: "",
          password: "",
          confirmPassword: "",
          agreeToPolicy: false
        });
      } else {
        toast.error("Registration failed", {
          description: response.error || "Could not create account",
        });
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      toast.error("Registration failed", {
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Check your email!", {
          description: "If an account exists, you'll receive a password reset link. You can also enter the reset code below.",
          duration: 6000
        });
        setShowPasswordReset(true);
      } else {
        toast.error("Request failed", {
          description: data.error || "Could not process request"
        });
      }
    } catch (error) {
      console.error("Password reset request error:", error);
      toast.error("Request failed", {
        description: "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords don't match", {
        description: "Please make sure both passwords are the same"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ 
          code: resetCode,
          newPassword 
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Password reset successful!", {
          description: "You can now sign in with your new password."
        });
        setShowPasswordReset(false);
        setResetCode("");
        setNewPassword("");
        setConfirmNewPassword("");
        setResetEmail("");
        setActiveTab("login");
      } else {
        toast.error("Reset failed", {
          description: data.error || "Could not reset password"
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Reset failed", {
        description: "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ email: resendVerificationEmail })
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Verification email sent!", {
          description: "Please check your email and click the verification link to activate your account.",
          duration: 6000
        });
        setShowResendVerification(false);
        setResendVerificationEmail("");
      } else {
        toast.error("Request failed", {
          description: data.error || "Could not process request"
        });
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      toast.error("Request failed", {
        description: "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If showing password reset form
  if (showPasswordReset) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {
        setShowPasswordReset(false);
        onClose();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
            <DialogDescription>
              Enter the 6-digit code sent to your email and choose a new password.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="password"
                placeholder="New password"
                className="pl-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="password"
                placeholder="Confirm new password"
                className="pl-10"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
            
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a7e285ba/request-password-reset`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${publicAnonKey}`
                      },
                      body: JSON.stringify({ email: resetEmail })
                    });
                    const data = await response.json();
                    if (data.success) {
                      toast.success("New code sent!", {
                        description: "Check your email for a new reset code."
                      });
                    }
                  } catch (error) {
                    toast.error("Failed to resend code");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Didn't receive the code? Resend
              </button>
              <br />
              <button
                type="button"
                onClick={() => {
                  setShowPasswordReset(false);
                  setActiveTab("login");
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Back to login
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Join Locksmith Marketplace</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to access all marketplace features.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  required
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(loginForm.email);
                    setActiveTab("forgot-password");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Forgot Password?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResendVerificationEmail(loginForm.email);
                    setActiveTab("resend-verification");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Resend Verification
                </button>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Protected by reCAPTCHA. Google{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
                  Terms of Service
                </a>{' '}
                apply.
              </p>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4 mt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    placeholder="First name"
                    className="pl-10"
                    value={registerForm.firstName}
                    onChange={(e) => handleFieldChange("firstName", e.target.value)}
                    onBlur={() => handleBlur("firstName")}
                    required
                  />
                  {validationErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      <AlertCircle className="inline-block mr-1 h-4 w-4" />
                      {validationErrors.firstName}
                    </p>
                  )}
                </div>
                
                <Input
                  id="lastName"
                  placeholder="Last name"
                  value={registerForm.lastName}
                  onChange={(e) => handleFieldChange("lastName", e.target.value)}
                  onBlur={() => handleBlur("lastName")}
                  required
                />
                {validationErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    <AlertCircle className="inline-block mr-1 h-4 w-4" />
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
              
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="register-email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={registerForm.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    <AlertCircle className="inline-block mr-1 h-4 w-4" />
                    {validationErrors.email}
                  </p>
                )}
              </div>
              
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone number (555) 123-4567"
                  className="pl-10"
                  value={registerForm.phone}
                  onChange={(e) => handleFieldChange("phone", formatPhoneNumber(e.target.value))}
                  onBlur={() => handleBlur("phone")}
                  required
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    <AlertCircle className="inline-block mr-1 h-4 w-4" />
                    {validationErrors.phone}
                  </p>
                )}
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="city"
                  placeholder="City"
                  className="pl-10"
                  value={registerForm.city}
                  onChange={(e) => handleFieldChange("city", e.target.value)}
                  onBlur={() => handleBlur("city")}
                  required
                />
                {validationErrors.city && (
                  <p className="text-red-500 text-sm mt-1">
                    <AlertCircle className="inline-block mr-1 h-4 w-4" />
                    {validationErrors.city}
                  </p>
                )}
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="register-password"
                  type="password"
                  placeholder="Create password"
                  className="pl-10"
                  value={registerForm.password}
                  onChange={(e) => handleFieldChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  required
                />
                
                {/* Validation Error for Password */}
                {validationErrors.password && touchedFields.has("password") && (
                  <p className="text-red-500 text-sm mt-1">
                    <AlertCircle className="inline-block mr-1 h-4 w-4" />
                    {validationErrors.password}
                  </p>
                )}
                
                {/* Password Strength Indicator */}
                {registerForm.password && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {passwordStrength.minLength ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className={`text-xs ${passwordStrength.minLength ? 'text-green-700' : 'text-gray-600'}`}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasUppercase ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className={`text-xs ${passwordStrength.hasUppercase ? 'text-green-700' : 'text-gray-600'}`}>
                          One uppercase letter (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasLowercase ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className={`text-xs ${passwordStrength.hasLowercase ? 'text-green-700' : 'text-gray-600'}`}>
                          One lowercase letter (a-z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasNumber ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className={`text-xs ${passwordStrength.hasNumber ? 'text-green-700' : 'text-gray-600'}`}>
                          One number (0-9)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.hasSpecialChar ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                        )}
                        <span className={`text-xs ${passwordStrength.hasSpecialChar ? 'text-green-700' : 'text-gray-600'}`}>
                          One special character (!@#$%^&*...)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm password"
                  className="pl-10"
                  value={registerForm.confirmPassword}
                  onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  required
                />
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    <AlertCircle className="inline-block mr-1 h-4 w-4" />
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agree-policy"
                  checked={registerForm.agreeToPolicy}
                  onCheckedChange={(checked) => setRegisterForm({...registerForm, agreeToPolicy: !!checked})}
                  className="mt-1"
                />
                <label htmlFor="agree-policy" className="text-sm text-gray-600 leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-800 underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={!registerForm.agreeToPolicy || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center">
                Protected by reCAPTCHA. Google{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
                  Terms of Service
                </a>{' '}
                apply.
              </p>
            </form>
          </TabsContent>
          
          <TabsContent value="forgot-password" className="space-y-4 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                💡 Enter your email address and we'll send you a password reset link. You can request a new link as many times as needed.
              </p>
            </div>
            
            <form onSubmit={handleRequestPasswordReset} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Back to login
                </button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="resend-verification" className="space-y-4 mt-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-800">
                📧 Didn't receive the verification email? Enter your email address and we'll send you a new verification link.
              </p>
            </div>
            
            <form onSubmit={handleResendVerification} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={resendVerificationEmail}
                  onChange={(e) => setResendVerificationEmail(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Back to login
                </button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}