import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Field } from '@/components/ui/field';
import { 
  Settings, 
  Bell, 
  Palette, 
  Shield, 
  Database,
  User,
  Moon,
  Sun,
  Monitor,
  Globe,
  Zap
} from 'lucide-react';

export function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    digest: true,
    mentions: true
  });

  const [appearance, setAppearance] = useState({
    theme: 'system' as 'light' | 'dark' | 'system',
    compactMode: false,
    showLineNumbers: true,
    fontSize: '14'
  });

  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    showActivity: true,
    shareAnalytics: false,
    indexRepos: true
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handleAppearanceChange = (key: string, value: string | boolean) => {
    setAppearance(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relay-app container max-w-4xl mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and application settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Account Information</h3>
                <div className="grid gap-4 max-w-md">
                  <Field label="Display Name">
                    <Input defaultValue="John Doe" />
                  </Field>
                  <Field label="Email">
                    <Input defaultValue="john@example.com" type="email" />
                  </Field>
                  <Field label="Time Zone">
                    <select className="w-full p-2 border rounded-md">
                      <option>UTC-8 (Pacific Time)</option>
                      <option>UTC-5 (Eastern Time)</option>
                      <option>UTC+0 (GMT)</option>
                      <option>UTC+1 (Central European Time)</option>
                    </select>
                  </Field>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Language & Region</h3>
                <div className="grid gap-4 max-w-md">
                  <Field label="Language">
                    <select 
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-copper"
                      aria-label="Select language"
                    >
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </Field>
                  <Field label="Date Format">
                    <select 
                      className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-copper"
                      aria-label="Select date format"
                    >
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive email updates about your projects and activity
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Weekly digest</div>
                      <div className="text-sm text-muted-foreground">
                        Get a summary of your project activity each week
                      </div>
                    </div>
                    <Switch
                      checked={notifications.digest}
                      onCheckedChange={(checked) => handleNotificationChange('digest', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Mentions and comments</div>
                      <div className="text-sm text-muted-foreground">
                        When someone mentions you or comments on your work
                      </div>
                    </div>
                    <Switch
                      checked={notifications.mentions}
                      onCheckedChange={(checked) => handleNotificationChange('mentions', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Push Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Browser notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Show notifications in your browser
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Theme</h3>
                <div 
                  className="grid grid-cols-3 gap-3 max-w-md"
                  role="radiogroup"
                  aria-label="Theme selection"
                >
                  {[
                    { value: 'light', icon: Sun, label: 'Light' },
                    { value: 'dark', icon: Moon, label: 'Dark' },
                    { value: 'system', icon: Monitor, label: 'System' }
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      onClick={() => handleAppearanceChange('theme', value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleAppearanceChange('theme', value);
                        }
                      }}
                      className={`p-3 border rounded-lg flex flex-col items-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-copper ${
                        appearance.theme === value
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      role="radio"
                      aria-checked={appearance.theme === value}
                      tabIndex={0}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Interface</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Compact mode</div>
                      <div className="text-sm text-muted-foreground">
                        Reduce spacing and padding throughout the interface
                      </div>
                    </div>
                    <Switch
                      checked={appearance.compactMode}
                      onCheckedChange={(checked) => handleAppearanceChange('compactMode', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Show line numbers</div>
                      <div className="text-sm text-muted-foreground">
                        Display line numbers in code previews
                      </div>
                    </div>
                    <Switch
                      checked={appearance.showLineNumbers}
                      onCheckedChange={(checked) => handleAppearanceChange('showLineNumbers', checked)}
                    />
                  </div>

                  <Field label="Font Size">
                    <select 
                      className="w-full max-w-xs p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-copper"
                      value={appearance.fontSize}
                      onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
                      aria-label="Select font size"
                    >
                      <option value="12">12px (Small)</option>
                      <option value="14">14px (Medium)</option>
                      <option value="16">16px (Large)</option>
                      <option value="18">18px (Extra Large)</option>
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Profile Visibility</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Public profile</div>
                      <div className="text-sm text-muted-foreground">
                        Make your profile visible to other users
                      </div>
                    </div>
                    <Switch
                      checked={privacy.profilePublic}
                      onCheckedChange={(checked) => handlePrivacyChange('profilePublic', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Show activity</div>
                      <div className="text-sm text-muted-foreground">
                        Display your recent activity on your profile
                      </div>
                    </div>
                    <Switch
                      checked={privacy.showActivity}
                      onCheckedChange={(checked) => handlePrivacyChange('showActivity', checked)}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Data & Analytics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Share analytics</div>
                      <div className="text-sm text-muted-foreground">
                        Help improve RELAY by sharing anonymous usage data
                      </div>
                    </div>
                    <Switch
                      checked={privacy.shareAnalytics}
                      onCheckedChange={(checked) => handlePrivacyChange('shareAnalytics', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Index repositories</div>
                      <div className="text-sm text-muted-foreground">
                        Allow RELAY to index your repositories for better search
                      </div>
                    </div>
                    <Switch
                      checked={privacy.indexRepos}
                      onCheckedChange={(checked) => handlePrivacyChange('indexRepos', checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Performance</h3>
                <div className="space-y-4">
                  <Field label="Cache Duration">
                    <select 
                      className="w-full max-w-xs p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-copper"
                      aria-label="Select cache duration"
                    >
                      <option value="1h">1 hour</option>
                      <option value="6h">6 hours</option>
                      <option value="24h">24 hours (recommended)</option>
                      <option value="7d">7 days</option>
                    </select>
                  </Field>

                  <Field label="Sync Frequency">
                    <select 
                      className="w-full max-w-xs p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-copper"
                      aria-label="Select sync frequency"
                    >
                      <option value="realtime">Real-time</option>
                      <option value="5m">Every 5 minutes</option>
                      <option value="15m">Every 15 minutes</option>
                      <option value="1h">Every hour</option>
                    </select>
                  </Field>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  API Access
                  <Badge variant="default">Pro Feature</Badge>
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="font-medium">API Key</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Generate an API key to access RELAY programmatically
                    </p>
                    <Button variant="secondary" size="sm" disabled>
                      Generate API Key
                    </Button>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Webhooks</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Configure webhooks for project events
                    </p>
                    <Button variant="secondary" size="sm" disabled>
                      Configure Webhooks
                    </Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4 text-destructive">Danger Zone</h3>
                <div className="space-y-3">
                  <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Clear all cache</div>
                        <div className="text-sm text-muted-foreground">
                          Remove all cached data and force re-sync
                        </div>
                      </div>
                      <Button variant="secondary" size="sm">
                        Clear Cache
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Delete account</div>
                        <div className="text-sm text-muted-foreground">
                          Permanently delete your account and all data
                        </div>
                      </div>
                      <Button variant="destructive" size="sm">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}