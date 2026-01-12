import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Lock, User, Building2, ArrowRight, Camera, ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import partnerImage from "@/assets/auth-partner.jpg";
import influencerImage from "@/assets/auth-influencer.jpg";

type AuthMode = "login" | "signup";
type RoleType = "merchant" | "curator";

// Compress and convert image to base64 string
const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setDarkMode } = useAppStore();

  const [mode, setMode] = useState<AuthMode>(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [role, setRole] = useState<RoleType>(
    (searchParams.get("role") as RoleType) || "curator"
  );
  // For signup: option to register as BOTH roles
  const [alsoRegisterAsPartner, setAlsoRegisterAsPartner] = useState(false);
  const [alsoRegisterAsInfluencer, setAlsoRegisterAsInfluencer] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [username, setUsername] = useState("");
  const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);
  const [coverImageBase64, setCoverImageBase64] = useState<string | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Role mismatch dialog state (for login)
  const [showRoleMismatchDialog, setShowRoleMismatchDialog] = useState(false);
  const [mismatchedUserData, setMismatchedUserData] = useState<any>(null);
  const [attemptedRole, setAttemptedRole] = useState<RoleType>("curator");
  
  // Existing account detected during signup
  const [showExistingAccountDialog, setShowExistingAccountDialog] = useState(false);
  const [existingAccountData, setExistingAccountData] = useState<any>(null);
  
  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const preview = URL.createObjectURL(file);
        setProfileImagePreview(preview);
        const base64 = await compressImage(file, 400, 400, 0.8);
        setProfileImageBase64(base64);
      } catch (error) {
        console.error('Failed to process profile image:', error);
        toast.error('Failed to process image. Please try a different file.');
      }
    }
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const preview = URL.createObjectURL(file);
        setCoverImagePreview(preview);
        const base64 = await compressImage(file, 1200, 600, 0.7);
        setCoverImageBase64(base64);
      } catch (error) {
        console.error('Failed to process cover image:', error);
        toast.error('Failed to process image. Please try a different file.');
      }
    }
  };

  // Handle continuing to existing dashboard from mismatch dialog
  const handleContinueToExistingDashboard = () => {
    if (mismatchedUserData) {
      setUser(mismatchedUserData as any);
      setDarkMode(mismatchedUserData.role === "curator");
      setShowRoleMismatchDialog(false);
      toast.success("Welcome back!");
      navigate(mismatchedUserData.role === "merchant" ? "/merchant" : "/scout");
    }
  };

  // Handle adding new role from mismatch dialog (login flow)
  const handleAddNewRole = async () => {
    if (!mismatchedUserData) return;
    
    setIsLoading(true);
    try {
      const newApiRole = attemptedRole === "merchant" ? "merchant" : "influencer";
      
      const response = await api.addRole({
        user_id: mismatchedUserData.id,
        email: mismatchedUserData.email,
        role: newApiRole,
        business_name: attemptedRole === "merchant" ? businessName || undefined : undefined,
      });

      if (response.success) {
        // Update user with both roles
        const updatedRoles = [...(mismatchedUserData.roles || [mismatchedUserData.role]), attemptedRole];
        const updatedUserData = {
          ...mismatchedUserData,
          roles: updatedRoles,
          activeRole: attemptedRole,
          role: attemptedRole,
          ...(attemptedRole === "merchant" && businessName ? { businessName, business_name: businessName } : {}),
        };
        
        setUser(updatedUserData as any);
        setDarkMode(attemptedRole === "curator");
        setShowRoleMismatchDialog(false);
        toast.success(`${attemptedRole === "merchant" ? "Partner" : "Influencer"} account added!`);
        navigate(attemptedRole === "merchant" ? "/merchant" : "/scout");
      } else {
        toast.error(response.error || "Failed to add role. Please try again.");
      }
    } catch (error) {
      console.error("Error adding role:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding role from existing account dialog (signup flow)
  const handleAddRoleFromExistingAccount = async () => {
    if (!existingAccountData) return;
    
    setIsLoading(true);
    try {
      const newApiRole = attemptedRole === "merchant" ? "merchant" : "influencer";
      
      const response = await api.addRole({
        user_id: existingAccountData.id,
        email: existingAccountData.email,
        role: newApiRole,
        business_name: attemptedRole === "merchant" ? businessName || undefined : undefined,
      });

      if (response.success) {
        const updatedRoles = [...(existingAccountData.roles || [existingAccountData.role]), attemptedRole];
        const updatedUserData = {
          ...existingAccountData,
          roles: updatedRoles,
          activeRole: attemptedRole,
          role: attemptedRole,
          ...(attemptedRole === "merchant" && businessName ? { businessName, business_name: businessName } : {}),
        };
        
        setUser(updatedUserData as any);
        setDarkMode(attemptedRole === "curator");
        setShowExistingAccountDialog(false);
        toast.success(`${attemptedRole === "merchant" ? "Partner" : "Influencer"} role added to your account!`);
        navigate(attemptedRole === "merchant" ? "/merchant" : "/scout");
      } else {
        toast.error(response.error || "Failed to add role. Please try again.");
      }
    } catch (error) {
      console.error("Error adding role:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle continuing to existing dashboard from existing account dialog
  const handleContinueToExistingFromSignup = () => {
    if (existingAccountData) {
      setUser(existingAccountData as any);
      setDarkMode(existingAccountData.role === "curator");
      setShowExistingAccountDialog(false);
      toast.success("Welcome back!");
      navigate(existingAccountData.role === "merchant" ? "/merchant" : "/scout");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "signup") {
        // Determine roles for registration
        const primaryApiRole = role === "merchant" ? "merchant" : "influencer";
        const primaryAppRole = role === "merchant" ? "merchant" : "curator";
        
        // Build roles array (user can have both)
        const userRoles: ("merchant" | "curator")[] = [primaryAppRole];
        if (role === "curator" && alsoRegisterAsPartner) {
          userRoles.push("merchant");
        } else if (role === "merchant" && alsoRegisterAsInfluencer) {
          userRoles.push("curator");
        }
        
        const finalBusinessName = role === "merchant" ? businessName : (alsoRegisterAsPartner ? businessName : undefined);
        
        const response = await api.register({
          email,
          password,
          name: role === "merchant" ? businessName : username,
          role: primaryApiRole,
          username: username || businessName,
          business_name: finalBusinessName,
          profile_pic: profileImageBase64 || undefined,
          cover_url: coverImageBase64 || undefined,
        });

        if (response.success && response.data) {
          const userData = {
            id: (response.data as any).user_id || response.data.id,
            email,
            name: role === "merchant" ? businessName : username,
            username: username || businessName,
            role: primaryAppRole,
            roles: userRoles,
            activeRole: primaryAppRole,
            profile_pic: profileImageBase64 || undefined,
            cover_url: coverImageBase64 || undefined,
            businessName: finalBusinessName,
            business_name: finalBusinessName,
          };
          setUser(userData as any);
          setDarkMode(primaryAppRole === "curator");
          toast.success("Account created successfully!");
          navigate(primaryAppRole === "merchant" ? "/merchant" : "/scout");
        } else {
          const errorMsg = response.error || "Registration failed";
          
          // Check if the error indicates user already exists
          const isUserExistsError = errorMsg.toLowerCase().includes("already") || 
                                    errorMsg.toLowerCase().includes("exists") ||
                                    errorMsg.toLowerCase().includes("duplicate");
          
          if (isUserExistsError) {
            // Try to log them in with their credentials to verify password
            const loginResponse = await api.login({ email, password });
            
            if (loginResponse.success && loginResponse.data) {
              // Password is correct! Show friendly dialog to add role
              const apiUser = ((loginResponse.data as any).user ?? loginResponse.data) as any;
              const apiRole = (apiUser.role as string | undefined) ?? undefined;
              const normalizedRole: "merchant" | "curator" | undefined =
                apiRole === "influencer" ? "curator" : (apiRole as any);
              
              const apiRoles = apiUser.roles as string[] | undefined;
              const existingRoles: ("merchant" | "curator")[] = apiRoles 
                ? apiRoles.map((r: string) => r === "influencer" ? "curator" : r as "merchant" | "curator")
                : normalizedRole ? [normalizedRole] : [];
              
              const userData = {
                ...apiUser,
                role: normalizedRole,
                roles: existingRoles,
                activeRole: normalizedRole,
              };

              // Check if they already have the role they're trying to sign up for
              if (existingRoles.includes(role)) {
                // They already have this role - log them in to that studio
                const desiredRole = role;
                setUser({ ...userData, role: desiredRole, activeRole: desiredRole } as any);
                setDarkMode(desiredRole === "curator");
                toast.success("Welcome back!");
                navigate(desiredRole === "merchant" ? "/merchant" : "/scout");
              } else {
                // They don't have this role - offer to add it
                setExistingAccountData(userData);
                setAttemptedRole(role);
                setShowExistingAccountDialog(true);
              }
            } else {
              // Password is incorrect - show a helpful message
              toast.error("An account with this email exists. Please use the correct password or login instead.");
            }
          } else {
            console.error("Server Error:", errorMsg);
            toast.error(`Server Error: ${errorMsg}`);
          }
        }
      } else {
        // Login
        const response = await api.login({ email, password });

        if (response.success && response.data) {
          const apiUser = ((response.data as any).user ?? response.data) as any;

          // Normalize backend roles to app roles
          const apiRole = (apiUser.role as string | undefined) ?? undefined;
          const normalizedRole: "merchant" | "curator" | undefined =
            apiRole === "influencer" ? "curator" : (apiRole as any);

          if (!normalizedRole) {
            toast.error("Login succeeded, but your account role is missing. Please contact support.");
            return;
          }

          // Check if user has multiple roles from API
          const apiRoles = apiUser.roles as string[] | undefined;
          const userRoles: ("merchant" | "curator")[] = apiRoles
            ? apiRoles.map((r: string) => (r === "influencer" ? "curator" : (r as "merchant" | "curator")))
            : [normalizedRole];

          const baseUserData = {
            ...apiUser,
            role: normalizedRole,
            roles: userRoles,
            activeRole: normalizedRole,
          };

          // Check if user tried to login with a role they don't have
          if (role !== normalizedRole && !userRoles.includes(role)) {
            // Store data and show dialog
            setMismatchedUserData(baseUserData);
            setAttemptedRole(role);
            setShowRoleMismatchDialog(true);
          } else {
            // If they DO have the selected tab role, land them in that studio (fixes "always influencer" issue)
            const desiredRole = userRoles.includes(role) ? role : normalizedRole;
            const finalUserData = { ...baseUserData, role: desiredRole, activeRole: desiredRole };

            setUser(finalUserData as any);
            setDarkMode(desiredRole === "curator");
            toast.success("Welcome back!");
            navigate(desiredRole === "merchant" ? "/merchant" : "/scout");
          }
        } else {
          const errorMsg = response.error || "Login failed";
          console.error("Server Error:", errorMsg);
          toast.error(`Server Error: ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error("Network/Request Error:", error);
      toast.error("Network Error: Please check the Shield Icon in your address bar or your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const isInfluencer = role === "curator";
  const currentImage = isInfluencer ? influencerImage : partnerImage;

  return (
    <div className="min-h-screen flex bg-slate-950">
      {/* Left Panel - Pure Art (Image Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Images with Fade Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={currentImage}
              alt={isInfluencer ? "Influencer" : "Partner"}
              className="w-full h-full object-cover object-center"
            />
            {/* Subtle vignette for softer edges - no harsh black fade */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-950/80 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20 pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Panel - Form with Midnight Glass Theme */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-950 relative overflow-y-auto">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800/20 via-transparent to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Glass Card Container */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
            {/* Logo and Welcome */}
            <div className="mb-6 text-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-500",
                  isInfluencer ? "gradient-influencer" : "bg-[#1DAFA1]"
                )}
              >
                <Sparkles className="h-7 w-7 text-white" />
              </motion.div>
              <h1 className="font-heading text-2xl font-bold mb-1 text-white">Welcome to VibeCheck</h1>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={role}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-400 text-sm"
                >
                  {role === "merchant"
                    ? "Drive foot traffic and create unforgettable experiences"
                    : "Discover exclusive deals and earn rewards as an Influencer"}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mb-4">
              <h2 className="font-heading text-xl font-semibold text-white">
                {mode === "login" ? "Sign in to your account" : "Create your account"}
              </h2>
            </div>

            {/* Role Toggle with smooth transition */}
            <div className="mb-6 flex rounded-xl bg-slate-800/50 p-1 relative border border-slate-700/50">
              <motion.div 
                className={cn(
                  "absolute inset-1 w-[calc(50%-4px)] rounded-lg shadow-sm",
                  isInfluencer ? "gradient-influencer" : "bg-[#1DAFA1]"
                )}
                animate={{ x: isInfluencer ? 0 : "100%" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
              <button
                onClick={() => setRole("curator")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all relative z-10",
                  role === "curator"
                    ? "text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <User className="h-4 w-4" />
                Influencer
              </button>
              <button
                onClick={() => setRole("merchant")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium transition-all relative z-10",
                  role === "merchant"
                    ? "text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                <Building2 className="h-4 w-4" />
                Partner
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Cover Image Upload */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Cover Image</label>
                    <input
                      type="file"
                      ref={coverInputRef}
                      accept=".jpg,.jpeg,.png"
                      onChange={handleCoverImageChange}
                      className="hidden"
                    />
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      onClick={() => coverInputRef.current?.click()}
                      className={cn(
                        "relative h-24 rounded-xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden",
                        coverImagePreview ? "border-[#1DAFA1]" : "border-slate-700 hover:border-slate-600"
                      )}
                    >
                      {coverImagePreview ? (
                        <img src={coverImagePreview} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-slate-500 mb-1" />
                          <span className="text-xs text-slate-500">Click to upload cover (.jpg, .png)</span>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Profile Picture Upload */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Profile Picture</label>
                    <input
                      type="file"
                      ref={profileInputRef}
                      accept=".jpg,.jpeg,.png"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        onClick={() => profileInputRef.current?.click()}
                        className={cn(
                          "relative h-20 w-20 rounded-xl border-2 border-dashed cursor-pointer transition-colors overflow-hidden flex-shrink-0",
                          profileImagePreview ? "border-[#1DAFA1]" : "border-slate-700 hover:border-slate-600"
                        )}
                      >
                        {profileImagePreview ? (
                          <img src={profileImagePreview} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Camera className="h-5 w-5 text-slate-500" />
                          </div>
                        )}
                      </motion.div>
                      <p className="text-xs text-slate-500">
                        Upload a profile photo (.jpg, .png)
                      </p>
                    </div>
                  </div>

                  {/* Business Name - Only for Merchants or when "Also Partner" is checked */}
                  {(role === "merchant" || alsoRegisterAsPartner) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="mb-2 block text-sm font-medium text-slate-300">Business Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="Tasty Bites Café"
                          className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1DAFA1]/50 focus:border-[#1DAFA1]"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Username Field */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      {role === "merchant" ? "Username" : "Username / Display Name"}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={role === "merchant" ? "@tastybites" : "@alexrivera"}
                        className={cn(
                          "w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2",
                          isInfluencer 
                            ? "focus:ring-[#A759D8]/50 focus:border-[#A759D8]" 
                            : "focus:ring-[#1DAFA1]/50 focus:border-[#1DAFA1]"
                        )}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={cn(
                      "w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2",
                      isInfluencer 
                        ? "focus:ring-[#A759D8]/50 focus:border-[#A759D8]" 
                        : "focus:ring-[#1DAFA1]/50 focus:border-[#1DAFA1]"
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={cn(
                      "w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2",
                      isInfluencer 
                        ? "focus:ring-[#A759D8]/50 focus:border-[#A759D8]" 
                        : "focus:ring-[#1DAFA1]/50 focus:border-[#1DAFA1]"
                    )}
                  />
                </div>
              </div>

              {/* "Also register as Partner" toggle - only in signup mode for Influencers */}
              {mode === "signup" && role === "curator" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between rounded-xl bg-slate-800/30 border border-slate-700/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-[#1DB09B]" />
                    <div>
                      <p className="text-sm font-medium text-white">Also register as Partner</p>
                      <p className="text-xs text-slate-400">Create drops & monetize your business too</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlsoRegisterAsPartner(!alsoRegisterAsPartner)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      alsoRegisterAsPartner ? "bg-[#1DB09B]" : "bg-slate-700"
                    )}
                  >
                    <motion.div
                      className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                      animate={{ left: alsoRegisterAsPartner ? "calc(100% - 20px)" : "4px" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </motion.div>
              )}

              {/* "Also register as Influencer" toggle - only in signup mode for Partners */}
              {mode === "signup" && role === "merchant" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between rounded-xl bg-slate-800/30 border border-slate-700/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-[#A759D8]" />
                    <div>
                      <p className="text-sm font-medium text-white">Also register as Influencer</p>
                      <p className="text-xs text-slate-400">Curate Quest Lines & earn from Gigs</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlsoRegisterAsInfluencer(!alsoRegisterAsInfluencer)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      alsoRegisterAsInfluencer ? "bg-[#A759D8]" : "bg-slate-700"
                    )}
                  >
                    <motion.div
                      className="absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm"
                      animate={{ left: alsoRegisterAsInfluencer ? "calc(100% - 20px)" : "4px" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </motion.div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full text-white font-semibold py-3",
                    isInfluencer 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" 
                      : "bg-[#1DAFA1] hover:bg-[#1DAFA1]/90"
                  )}
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {mode === "login" ? "Sign In" : "Create Account"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className={cn(
                      "font-medium hover:underline",
                      isInfluencer ? "text-purple-400" : "text-[#1DAFA1]"
                    )}
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className={cn(
                      "font-medium hover:underline",
                      isInfluencer ? "text-purple-400" : "text-[#1DAFA1]"
                    )}
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Role Mismatch Dialog */}
      <Dialog open={showRoleMismatchDialog} onOpenChange={setShowRoleMismatchDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
              <AlertCircle className="h-6 w-6 text-amber-400" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              Account Role Mismatch
            </DialogTitle>
            <DialogDescription className="text-center text-slate-400 mt-2">
              You tried to sign in as{" "}
              <span className={cn(
                "font-semibold",
                attemptedRole === "merchant" ? "text-[#1DAFA1]" : "text-purple-400"
              )}>
                {attemptedRole === "merchant" ? "Partner" : "Influencer"}
              </span>
              , but your account is registered as{" "}
              <span className={cn(
                "font-semibold",
                mismatchedUserData?.role === "merchant" ? "text-[#1DAFA1]" : "text-purple-400"
              )}>
                {mismatchedUserData?.role === "merchant" ? "Partner" : "Influencer"}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {/* Business Name input - only when adding Partner role */}
            {attemptedRole === "merchant" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Business Name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1DAFA1]/50 focus:border-[#1DAFA1]"
                  />
                </div>
              </div>
            )}
            
            <Button
              onClick={handleAddNewRole}
              disabled={isLoading || (attemptedRole === "merchant" && !businessName.trim())}
              className={cn(
                "w-full font-semibold",
                attemptedRole === "merchant" 
                  ? "bg-[#1DAFA1] hover:bg-[#1DAFA1]/90" 
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Create {attemptedRole === "merchant" ? "Partner" : "Influencer"} Account
                </>
              )}
            </Button>
            
            <Button
              onClick={handleContinueToExistingDashboard}
              disabled={isLoading}
              variant="outline"
              className="w-full border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700"
            >
              Continue to {mismatchedUserData?.role === "merchant" ? "Partner" : "Influencer"} Studio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-center text-xs text-slate-500 mt-4">
            Clicked the wrong tab? No worries — choose where to go.
          </p>
        </DialogContent>
      </Dialog>

      {/* Existing Account Dialog - Shown during signup when email already exists */}
      <Dialog open={showExistingAccountDialog} onOpenChange={setShowExistingAccountDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <User className="h-6 w-6 text-emerald-400" />
            </div>
            <DialogTitle className="text-center text-xl">Welcome Back!</DialogTitle>
            <DialogDescription className="text-center text-slate-400">
              Looks like you already have a{" "}
              <span className={cn(
                "font-semibold",
                existingAccountData?.role === "merchant" ? "text-[#1DAFA1]" : "text-purple-400"
              )}>
                {existingAccountData?.role === "merchant" ? " Partner" : "n Influencer"}
              </span>
              {" "}account with this email. Want to also register as{" "}
              <span className={cn(
                "font-semibold",
                attemptedRole === "merchant" ? "text-[#1DAFA1]" : "text-purple-400"
              )}>
                {attemptedRole === "merchant" ? "Partner" : "Influencer"}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 mt-4">
            {/* Business Name input - only when adding Partner role */}
            {attemptedRole === "merchant" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Business Name"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#1DAFA1]/50 focus:border-[#1DAFA1]"
                  />
                </div>
              </div>
            )}
            
            <Button
              onClick={handleAddRoleFromExistingAccount}
              disabled={isLoading || (attemptedRole === "merchant" && !businessName.trim())}
              className={cn(
                "w-full font-semibold",
                attemptedRole === "merchant" 
                  ? "bg-[#1DAFA1] hover:bg-[#1DAFA1]/90" 
                  : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Yes, Add {attemptedRole === "merchant" ? "Partner" : "Influencer"} Role
                </>
              )}
            </Button>
            
            <Button
              onClick={handleContinueToExistingFromSignup}
              disabled={isLoading}
              variant="outline"
              className="w-full border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700"
            >
              Go to my {existingAccountData?.role === "merchant" ? "Partner" : "Influencer"} Studio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-center text-xs text-slate-500 mt-4">
            Your existing {existingAccountData?.role === "merchant" ? "Partner" : "Influencer"} account is safe and sound.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
