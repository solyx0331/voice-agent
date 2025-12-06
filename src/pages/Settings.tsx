import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { User, Bell, Shield, CreditCard, Globe, Mic, Save, Eye, EyeOff, Trash2, Plus, Download, Copy, Check, X, Smartphone, Monitor, Tablet } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api/api";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "api", label: "API & Integrations", icon: Globe },
  { id: "voice", label: "Voice Settings", icon: Mic },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [avatar, setAvatar] = useState<string | null>(() => {
    // Load avatar from localStorage if available
    const savedAvatar = localStorage.getItem("userAvatar");
    return savedAvatar || null;
  });
  const [profileData, setProfileData] = useState({
    firstName: "Evolved",
    lastName: "Sound",
    email: "admin@evolvedsound.com",
    company: "Evolved Sound",
    timezone: "UTC-8 (Pacific Time)",
  });
  const [voiceSettings, setVoiceSettings] = useState({
    voiceModel: "ElevenLabs - Aria",
    speechSpeed: 1,
    apiKey: "sk-xxxxxxxxxxxxxxxx",
  });
  const [notifications, setNotifications] = useState({
    callAlerts: true,
    dailySummary: true,
    agentStatus: true,
    missedCalls: false,
    weeklyReports: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  
  // Security state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [activeSessions, setActiveSessions] = useState<Array<{ id: string; device: string; location: string; lastActive: string; current: boolean }>>([]);
  const [revokingSession, setRevokingSession] = useState<string | null>(null);

  // Billing state
  const [billingInfo, setBillingInfo] = useState<{
    plan: string;
    status: string;
    nextBillingDate: string;
    amount: string;
    paymentMethod: { type: string; last4: string; expiry: string };
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [invoices, setInvoices] = useState<Array<{ id: string; date: string; amount: string; status: string; downloadUrl: string }>>([]);

  // API & Integrations state
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; key: string; createdAt: string; lastUsed: string }>>([]);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [webhooks, setWebhooks] = useState<Array<{ id: string; url: string; events: string[]; status: string; createdAt: string }>>([]);
  const [newWebhook, setNewWebhook] = useState({ url: "", events: [] as string[] });
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await apiService.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        company: profileData.company,
        timezone: profileData.timezone,
      });
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveVoiceSettings = async () => {
    setIsSaving(true);
    try {
      await apiService.updateVoiceSettings({
        voiceModel: voiceSettings.voiceModel,
        speechSpeed: voiceSettings.speechSpeed,
        apiKey: voiceSettings.apiKey,
      });
      toast.success("Voice settings updated successfully");
    } catch (error) {
      toast.error("Failed to update voice settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    const newNotifications = { ...notifications, [key]: value };
    setNotifications(newNotifications);
    try {
      await apiService.updateNotificationSettings(newNotifications);
      toast.success("Notification settings updated");
    } catch (error) {
      toast.error("Failed to update notification settings");
    }
  };

  const handleAvatarChange = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          toast.error("File size must be less than 2MB");
          return;
        }
        
        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error("Please select an image file");
          return;
        }

        // Read file and convert to data URL
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          setAvatar(imageUrl);
          // Save to localStorage for persistence
          localStorage.setItem("userAvatar", imageUrl);
          toast.success("Avatar updated successfully");
        };
        reader.onerror = () => {
          toast.error("Failed to read image file");
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Security handlers
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setIsSaving(true);
    try {
      await apiService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success("Password changed successfully");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const result = await apiService.enable2FA();
      setTwoFactorSecret(result.secret);
      toast.success("2FA setup initiated. Please verify with the code.");
    } catch (error) {
      toast.error("Failed to enable 2FA");
    }
  };

  const handleVerify2FA = async () => {
    if (twoFactorCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }
    try {
      await apiService.verify2FA(twoFactorCode);
      setTwoFactorEnabled(true);
      setTwoFactorSecret(null);
      setTwoFactorCode("");
      toast.success("2FA enabled successfully");
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
    }
  };

  const handleDisable2FA = async () => {
    try {
      await apiService.disable2FA();
      setTwoFactorEnabled(false);
      toast.success("2FA disabled successfully");
    } catch (error) {
      toast.error("Failed to disable 2FA");
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setRevokingSession(sessionId);
    try {
      await apiService.revokeSession(sessionId);
      setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
      toast.success("Session revoked successfully");
    } catch (error) {
      toast.error("Failed to revoke session");
    } finally {
      setRevokingSession(null);
    }
  };

  // Billing handlers
  const handleUpdatePaymentMethod = async () => {
    if (!paymentMethod.cardNumber || !paymentMethod.expiry || !paymentMethod.cvv || !paymentMethod.name) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSaving(true);
    try {
      await apiService.updatePaymentMethod(paymentMethod);
      toast.success("Payment method updated successfully");
      setShowCardDetails(false);
      // Refresh billing info
      const info = await apiService.getBillingInfo();
      setBillingInfo(info);
    } catch (error: any) {
      toast.error(error.message || "Failed to update payment method");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    toast.info(`Downloading invoice ${invoiceId}...`);
    // In real app, this would download the invoice
  };

  // API & Integrations handlers
  const handleCreateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }
    try {
      const result = await apiService.createApiKey(newApiKeyName);
      setNewApiKey(result.key);
      setNewApiKeyName("");
      // Refresh API keys
      const keys = await apiService.getApiKeys();
      setApiKeys(keys);
      toast.success("API key created successfully. Please copy it now - you won't be able to see it again!");
    } catch (error) {
      toast.error("Failed to create API key");
    }
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      await apiService.deleteApiKey(keyId);
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
      toast.success("API key deleted successfully");
    } catch (error) {
      toast.error("Failed to delete API key");
    }
  };

  const handleCreateWebhook = async () => {
    if (!newWebhook.url.trim()) {
      toast.error("Please enter a webhook URL");
      return;
    }
    if (newWebhook.events.length === 0) {
      toast.error("Please select at least one event");
      return;
    }
    try {
      await apiService.createWebhook(newWebhook.url, newWebhook.events);
      toast.success("Webhook created successfully");
      setNewWebhook({ url: "", events: [] });
      setIsWebhookDialogOpen(false);
      // Refresh webhooks
      const hooks = await apiService.getWebhooks();
      setWebhooks(hooks);
    } catch (error) {
      toast.error("Failed to create webhook");
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await apiService.deleteWebhook(webhookId);
      setWebhooks(webhooks.filter(w => w.id !== webhookId));
      toast.success("Webhook deleted successfully");
    } catch (error) {
      toast.error("Failed to delete webhook");
    }
  };

  const handleToggleWebhookEvent = (event: string) => {
    if (newWebhook.events.includes(event)) {
      setNewWebhook({ ...newWebhook, events: newWebhook.events.filter(e => e !== event) });
    } else {
      setNewWebhook({ ...newWebhook, events: [...newWebhook.events, event] });
    }
  };

  // Load data when tabs are opened
  useEffect(() => {
    if (activeTab === "security") {
      apiService.getActiveSessions().then(setActiveSessions).catch(() => {});
    }
    if (activeTab === "billing") {
      apiService.getBillingInfo().then(setBillingInfo).catch(() => {});
      apiService.getInvoices().then(setInvoices).catch(() => {});
    }
    if (activeTab === "api") {
      apiService.getApiKeys().then(setApiKeys).catch(() => {});
      apiService.getWebhooks().then(setWebhooks).catch(() => {});
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-16 sm:ml-64">
        <Header />
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage your account and preferences</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 md:gap-6">
            {/* Mobile: Select Dropdown */}
            <div className="lg:hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Desktop: Tabs Sidebar - Fixed on Left */}
            <div className="hidden lg:block w-48 xl:w-64 flex-shrink-0">
              <div className="sticky top-6 space-y-1">
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-8rem)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                      <tab.icon className="h-5 w-5 flex-shrink-0" />
                      <span>{tab.label}</span>
                </button>
              ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 glass-card rounded-xl p-4 sm:p-5 md:p-6">
              {activeTab === "profile" && (
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Profile Settings</h2>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xl sm:text-2xl font-semibold border-2 border-border flex-shrink-0">
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>ES</span>
                      )}
                    </div>
                    <div>
                      <Button variant="outline" size="sm" onClick={handleAvatarChange} className="w-full sm:w-auto">Change Avatar</Button>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Company</label>
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Timezone</label>
                    <select
                      value={profileData.timezone}
                      onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC+0 (London)</option>
                      <option>UTC+1 (Paris)</option>
                    </select>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Notification Preferences</h2>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { title: "Call Alerts", description: "Receive notifications for incoming calls" },
                      { title: "Daily Summary", description: "Get a daily digest of your call activity" },
                      { title: "Agent Status", description: "Notify when agent status changes" },
                      { title: "Missed Calls", description: "Alert for any missed calls" },
                      { title: "Weekly Reports", description: "Receive weekly analytics reports" },
                    ].map((item, index) => {
                      const key = item.title.toLowerCase().replace(/\s+/g, '') as keyof typeof notifications;
                      return (
                        <div key={index} className="flex items-center justify-between py-2.5 sm:py-3 border-b border-border gap-3 sm:gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground text-sm sm:text-base">{item.title}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[key] || false}
                              onChange={(e) => handleNotificationToggle(key, e.target.checked)}
                              className="sr-only peer"
                            />
                          <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "voice" && (
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Voice Settings</h2>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Default Voice Model</label>
                    <select
                      value={voiceSettings.voiceModel}
                      onChange={(e) => setVoiceSettings({ ...voiceSettings, voiceModel: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option>ElevenLabs - Aria</option>
                      <option>ElevenLabs - Roger</option>
                      <option>ElevenLabs - Sarah</option>
                      <option>OpenAI - Alloy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Speech Speed</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={voiceSettings.speechSpeed}
                      onChange={(e) => setVoiceSettings({ ...voiceSettings, speechSpeed: Number(e.target.value) })}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mt-1">
                      <span>Slower</span>
                      <span>Normal ({voiceSettings.speechSpeed}x)</span>
                      <span>Faster</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">API Key</label>
                    <input
                      type="password"
                      value={voiceSettings.apiKey}
                      onChange={(e) => setVoiceSettings({ ...voiceSettings, apiKey: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <Button onClick={handleSaveVoiceSettings} disabled={isSaving} className="w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Voice Settings"}
                  </Button>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Security Settings</h2>
                  
                  {/* Change Password */}
                  <div className="space-y-4">
                    <h3 className="text-sm sm:text-base font-medium text-foreground">Change Password</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                            placeholder="Enter new password (min. 8 characters)"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <Button onClick={handleChangePassword} disabled={isSaving} className="w-full sm:w-auto">
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? "Changing..." : "Change Password"}
                      </Button>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm sm:text-base font-medium text-foreground">Two-Factor Authentication</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Add an extra layer of security to your account</p>
                      </div>
                      {twoFactorEnabled ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400">Enabled</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </div>
                    {!twoFactorEnabled ? (
                      <div className="space-y-3">
                        {twoFactorSecret ? (
                          <>
                            <div className="p-4 bg-secondary rounded-lg">
                              <p className="text-xs sm:text-sm text-muted-foreground mb-2">Enter the 6-digit code from your authenticator app:</p>
                              <input
                                type="text"
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-center tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleVerify2FA} className="flex-1 sm:flex-none">
                                Verify & Enable
                              </Button>
                              <Button variant="outline" onClick={() => { setTwoFactorSecret(null); setTwoFactorCode(""); }}>
                                Cancel
                              </Button>
                            </div>
                          </>
                        ) : (
                          <Button onClick={handleEnable2FA} variant="outline">
                            Enable 2FA
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button onClick={handleDisable2FA} variant="outline" className="text-destructive hover:text-destructive">
                        Disable 2FA
                      </Button>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-sm sm:text-base font-medium text-foreground">Active Sessions</h3>
                    <div className="space-y-3">
                      {activeSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 sm:p-4 bg-secondary rounded-lg">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {session.device.includes("iPhone") || session.device.includes("Android") ? (
                              <Smartphone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            ) : session.device.includes("iPad") || session.device.includes("Tablet") ? (
                              <Tablet className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <Monitor className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm sm:text-base font-medium text-foreground truncate">{session.device}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">{session.location} • {session.lastActive}</p>
                            </div>
                            {session.current && (
                              <Badge variant="secondary" className="text-xs">Current</Badge>
                            )}
                          </div>
                          {!session.current && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRevokeSession(session.id)}
                              disabled={revokingSession === session.id}
                              className="text-destructive hover:text-destructive ml-2"
                            >
                              {revokingSession === session.id ? "Revoking..." : "Revoke"}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Billing & Subscription</h2>
                  
                  {billingInfo && (
                    <>
                      {/* Current Plan */}
                      <div className="p-4 sm:p-5 bg-secondary rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          <div>
                            <h3 className="text-sm sm:text-base font-medium text-foreground">Current Plan</h3>
                            <p className="text-lg sm:text-xl font-semibold text-foreground mt-1">{billingInfo.plan}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              Next billing: {billingInfo.nextBillingDate} • {billingInfo.amount}/month
                            </p>
                          </div>
                          <Badge className={billingInfo.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"}>
                            {billingInfo.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm sm:text-base font-medium text-foreground">Payment Method</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                              {billingInfo.paymentMethod.type === "card" ? "Card" : billingInfo.paymentMethod.type} ending in {billingInfo.paymentMethod.last4} • Expires {billingInfo.paymentMethod.expiry}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setShowCardDetails(!showCardDetails)}>
                            {showCardDetails ? "Cancel" : "Update"}
                          </Button>
                        </div>
                        {showCardDetails && (
                          <div className="p-4 sm:p-5 bg-secondary rounded-lg space-y-3">
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Card Number</label>
                              <input
                                type="text"
                                value={paymentMethod.cardNumber}
                                onChange={(e) => setPaymentMethod({ ...paymentMethod, cardNumber: e.target.value.replace(/\D/g, "").slice(0, 16) })}
                                className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="1234 5678 9012 3456"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Expiry</label>
                                <input
                                  type="text"
                                  value={paymentMethod.expiry}
                                  onChange={(e) => setPaymentMethod({ ...paymentMethod, expiry: e.target.value.replace(/\D/g, "").slice(0, 4).replace(/(\d{2})(\d)/, "$1/$2") })}
                                  className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  placeholder="MM/YY"
                                />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">CVV</label>
                                <input
                                  type="text"
                                  value={paymentMethod.cvv}
                                  onChange={(e) => setPaymentMethod({ ...paymentMethod, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                                  className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                  placeholder="123"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5 sm:mb-2">Cardholder Name</label>
                              <input
                                type="text"
                                value={paymentMethod.name}
                                onChange={(e) => setPaymentMethod({ ...paymentMethod, name: e.target.value })}
                                className="w-full px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="John Doe"
                              />
                            </div>
                            <Button onClick={handleUpdatePaymentMethod} disabled={isSaving} className="w-full sm:w-auto">
                              {isSaving ? "Updating..." : "Update Payment Method"}
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Billing History */}
                      <div className="space-y-4 pt-4 border-t border-border">
                        <h3 className="text-sm sm:text-base font-medium text-foreground">Billing History</h3>
                        <div className="space-y-2">
                          {invoices.map((invoice) => (
                            <div key={invoice.id} className="flex items-center justify-between p-3 sm:p-4 bg-secondary rounded-lg">
                              <div>
                                <p className="text-sm sm:text-base font-medium text-foreground">{invoice.id}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground">{invoice.date} • {invoice.amount}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={invoice.status === "paid" ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"}>
                                  {invoice.status}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadInvoice(invoice.id)}
                                  className="p-2"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "api" && (
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">API & Integrations</h2>
                  
                  {/* API Keys */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm sm:text-base font-medium text-foreground">API Keys</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage your API keys for programmatic access</p>
                      </div>
                    </div>
                    {newApiKey && (
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs sm:text-sm font-medium text-primary">New API Key Created</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              handleCopyApiKey(newApiKey);
                              setNewApiKey(null);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy & Close
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded border border-border">
                          <code className="text-xs sm:text-sm font-mono text-foreground flex-1 break-all">{newApiKey}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyApiKey(newApiKey)}
                            className="h-6 px-2 flex-shrink-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">⚠️ Save this key now. You won't be able to see it again!</p>
                      </div>
                    )}
                    <div className="space-y-3">
                      {apiKeys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-3 sm:p-4 bg-secondary rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-medium text-foreground">{key.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-xs sm:text-sm font-mono text-muted-foreground">{key.key}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyApiKey(key.key)}
                                className="h-6 px-2 text-xs"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Created {key.createdAt} • Last used {key.lastUsed}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteApiKey(key.id)}
                            className="text-destructive hover:text-destructive ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newApiKeyName}
                        onChange={(e) => setNewApiKeyName(e.target.value)}
                        placeholder="Enter API key name"
                        className="flex-1 px-3 sm:px-4 py-2 bg-white border border-border rounded-lg text-sm sm:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateApiKey()}
                      />
                      <Button onClick={handleCreateApiKey} disabled={!newApiKeyName.trim()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Key
                      </Button>
                    </div>
                  </div>

                  {/* Webhooks */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm sm:text-base font-medium text-foreground">Webhooks</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Receive real-time events via HTTP callbacks</p>
                      </div>
                      <Button onClick={() => setIsWebhookDialogOpen(true)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Webhook
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {webhooks.map((webhook) => (
                        <div key={webhook.id} className="p-3 sm:p-4 bg-secondary rounded-lg">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-sm sm:text-base font-medium text-foreground truncate">{webhook.url}</p>
                                <Badge className={webhook.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-muted text-muted-foreground"}>
                                  {webhook.status}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {webhook.events.map((event) => (
                                  <Badge key={event} variant="secondary" className="text-xs">
                                    {event}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">Created {webhook.createdAt}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteWebhook(webhook.id)}
                              className="text-destructive hover:text-destructive flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {webhooks.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No webhooks configured
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Create Webhook Dialog */}
      <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="webhook-url">Webhook URL *</Label>
              <Input
                id="webhook-url"
                type="url"
                value={newWebhook.url}
                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                placeholder="https://example.com/webhook"
              />
            </div>
            <div>
              <Label className="mb-2 block">Events *</Label>
              <div className="space-y-2">
                {[
                  { id: "call.started", label: "Call Started" },
                  { id: "call.completed", label: "Call Completed" },
                  { id: "call.missed", label: "Call Missed" },
                  { id: "agent.status_changed", label: "Agent Status Changed" },
                  { id: "contact.created", label: "Contact Created" },
                ].map((event) => (
                  <div key={event.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={event.id}
                      checked={newWebhook.events.includes(event.id)}
                      onChange={() => handleToggleWebhookEvent(event.id)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor={event.id} className="text-sm font-normal cursor-pointer">
                      {event.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleCreateWebhook} className="w-full" disabled={!newWebhook.url.trim() || newWebhook.events.length === 0}>
              Create Webhook
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
