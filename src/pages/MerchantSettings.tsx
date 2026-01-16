import { useState } from "react";
import { MerchantSidebar } from "@/components/navigation/MerchantSidebar";
import { MobileTopNav } from "@/components/navigation/MobileTopNav";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  ChevronRight,
  Save,
  Camera,
} from "lucide-react";
import { motion } from "framer-motion";
import defaultPfp from "@/assets/pfp.png";

export default function MerchantSettings() {
  const { user } = useAppStore();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  const profilePic = (user as any)?.partner_profile_pic || (user as any)?.profile_pic || user?.avatar || defaultPfp;
  const businessName = (user as any)?.business_name || (user as any)?.businessName || "My Business";

  const settingsSections = [
    { icon: User, label: "Profile", description: "Manage your business profile" },
    { icon: Bell, label: "Notifications", description: "Configure alerts and updates" },
    { icon: Shield, label: "Privacy & Security", description: "Password and 2FA settings" },
    { icon: CreditCard, label: "Billing", description: "Payment methods and invoices" },
    { icon: Palette, label: "Appearance", description: "Theme and display options" },
    { icon: Globe, label: "Integrations", description: "Connect third-party services" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1929] text-white">
      <MerchantSidebar />
      <MobileTopNav variant="merchant" />

      <main className="md:ml-64 p-4 pt-20 md:pt-8 pb-24 md:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-6">Settings</h1>

          {/* Profile Card */}
          <GlassCard className="p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                <img
                  src={profilePic}
                  alt={businessName}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-[#1DB09B]/30"
                />
                <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#1DB09B] flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white" />
                </button>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-xl font-semibold">{businessName}</h2>
                <p className="text-muted-foreground text-sm">Partner Account</p>
              </div>
              <Button variant="outline" className="border-[#1DB09B]/50 text-[#1DB09B]">
                Edit Profile
              </Button>
            </div>
          </GlassCard>

          {/* Quick Settings */}
          <GlassCard className="p-6 mb-6">
            <h3 className="font-semibold mb-4">Quick Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive alerts on your device</p>
                </div>
                <Switch
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Alerts</Label>
                  <p className="text-xs text-muted-foreground">Weekly reports and updates</p>
                </div>
                <Switch
                  checked={emailAlerts}
                  onCheckedChange={setEmailAlerts}
                />
              </div>
            </div>
          </GlassCard>

          {/* Settings Sections */}
          <GlassCard className="divide-y divide-border/50">
            {settingsSections.map((section) => (
              <button
                key={section.label}
                className="w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-xl bg-[#1DB09B]/20 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-[#1DB09B]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{section.label}</p>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))}
          </GlassCard>

          {/* Save Button */}
          <div className="mt-6">
            <Button 
              onClick={handleSave}
              className="w-full sm:w-auto bg-[#1DB09B] hover:bg-[#1DB09B]/90"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </motion.div>
      </main>

      <MobileBottomNav variant="merchant" />
    </div>
  );
}
