import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { User, Bell, Shield, CreditCard, Globe, Mic, Save } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api/api";
import { toast } from "sonner";

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

              {(activeTab === "security" || activeTab === "billing" || activeTab === "api") && (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>Coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
