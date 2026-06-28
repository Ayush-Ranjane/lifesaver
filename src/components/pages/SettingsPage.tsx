'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useUpdateUser } from '@/hooks/useUser';
import { useGitHubImportStore } from '@/hooks/useGitHubIntegration';
import { Settings, User, Bell, Cpu, Shield, ExternalLink, Loader2, Save } from 'lucide-react';
import { cn, apiFetchBlob, apiFetch } from '@/lib/utils';
import type { UserProfile } from '@/types';
import { useTheme } from 'next-themes';
import { DEFAULT_AI_PREFERENCES, DEFAULT_USER_SETTINGS } from '@/types';
import type { EnergyPattern, InsightFrequency, ProcrastinationSensitivity } from '@/types';
import { toast } from 'sonner';

type Tab = 'profile' | 'notifications' | 'ai' | 'integrations' | 'privacy';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'ai',           label: 'AI Preferences', icon: Cpu },
  { id: 'integrations',  label: 'Integrations',   icon: ExternalLink },
  { id: 'privacy',       label: 'Privacy',        icon: Shield },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'w-11 h-6 rounded-full transition-colors relative',
        checked ? 'bg-primary' : 'bg-secondary border border-border'
      )}
    >
      <span className={cn(
        'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all',
        checked ? 'left-[22px]' : 'left-0.5'
      )} />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { userProfile, firebaseUser, setUserProfile } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const updateUser = useUpdateUser();
  const openGitHubPanel = useGitHubImportStore((s) => s.openPanel);
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const [displayName, setDisplayName] = useState(userProfile?.displayName ?? '');
  const [settings, setSettings] = useState(userProfile?.settings ?? DEFAULT_USER_SETTINGS);
  const [aiPrefs, setAiPrefs] = useState(userProfile?.aiPreferences ?? DEFAULT_AI_PREFERENCES);

  useEffect(() => {
    if (userProfile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayName(userProfile.displayName);
      setSettings(userProfile.settings ?? DEFAULT_USER_SETTINGS);
      setAiPrefs(userProfile.aiPreferences ?? DEFAULT_AI_PREFERENCES);
    }
  }, [userProfile]);

  useEffect(() => {
    const connected = searchParams.get('google_connected') === 'true' || searchParams.get('github_connected') === 'true';
    if (connected) {
      apiFetch<UserProfile>('/api/user').then(setUserProfile);
      if (searchParams.get('google_connected') === 'true') toast.success('Google Calendar connected');
      if (searchParams.get('github_connected') === 'true') toast.success('GitHub connected');
    }
  }, [searchParams, setUserProfile]);

  const connectGoogle = () => {
    if (!firebaseUser) return;
    window.location.href = `/api/auth/google/connect?uid=${firebaseUser.uid}`;
  };

  const connectGitHub = () => {
    if (!firebaseUser) return;
    window.location.href = `/api/auth/github/connect?uid=${firebaseUser.uid}`;
  };

  const saveProfile = () => updateUser.mutate({ displayName });
  const saveNotifications = () => updateUser.mutate({ settings });
  const saveAiPrefs = () => updateUser.mutate({ aiPreferences: aiPrefs });

  const exportData = async () => {
    try {
      const blob = await apiFetchBlob('/api/analytics/export?format=csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifesaver-data-export.csv`;
      a.click();
    } catch {
      toast.error('Export failed');
    }
  };

  const githubConnected = userProfile?.githubConnected ?? false;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <h1 className="page-title flex items-center gap-2">
        <Settings className="w-6 h-6 text-primary" /> Settings
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-48 space-y-1 flex-shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn('nav-item w-full', activeTab === tab.id && 'active')}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 glass rounded-2xl p-6">
          {activeTab === 'profile' && (
            <div className="space-y-1">
              <h2 className="font-semibold mb-4">Profile</h2>
              <SettingRow label="Display Name">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-base w-48 py-1.5 text-sm"
                />
              </SettingRow>
              <SettingRow label="Email">
                <span className="text-sm text-muted-foreground">{userProfile?.email}</span>
              </SettingRow>
              <SettingRow label="Timezone">
                <span className="text-sm text-muted-foreground">{userProfile?.timezone}</span>
              </SettingRow>
              <SettingRow label="Theme">
                <div className="flex gap-2">
                  {(['system','light','dark'] as const).map(t => (
                    <button key={t} onClick={() => setTheme(t)} className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize', theme === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground')}>
                      {t}
                    </button>
                  ))}
                </div>
              </SettingRow>
              <button onClick={saveProfile} disabled={updateUser.isPending} className="btn-primary mt-4 text-sm">
                {updateUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Profile
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-1">
              <h2 className="font-semibold mb-4">Notifications</h2>
              <SettingRow label="Push Notifications" description="Browser push alerts for reminders">
                <Toggle checked={settings.pushNotificationsEnabled} onChange={v => setSettings(s => ({ ...s, pushNotificationsEnabled: v }))} />
              </SettingRow>
              <SettingRow label="Email Notifications" description="Digests and escalation emails">
                <Toggle checked={settings.emailNotificationsEnabled} onChange={v => setSettings(s => ({ ...s, emailNotificationsEnabled: v }))} />
              </SettingRow>
              <SettingRow label="Morning Digest" description="Daily 8am task summary">
                <Toggle checked={settings.morningDigestEnabled} onChange={v => setSettings(s => ({ ...s, morningDigestEnabled: v }))} />
              </SettingRow>
              <SettingRow label="Weekly Report" description="Sunday evening productivity report">
                <Toggle checked={settings.weeklyReportEnabled} onChange={v => setSettings(s => ({ ...s, weeklyReportEnabled: v }))} />
              </SettingRow>
              <SettingRow label="Quiet Hours" description={`${settings.quietHoursStart} – ${settings.quietHoursEnd}`}>
                <Toggle checked={settings.quietHoursEnabled} onChange={v => setSettings(s => ({ ...s, quietHoursEnabled: v }))} />
              </SettingRow>
              <SettingRow label="Default Snooze Duration">
                <select
                  value={settings.defaultSnooze}
                  className="input-base py-1.5 text-sm w-32"
                  onChange={e => setSettings(s => ({ ...s, defaultSnooze: parseInt(e.target.value) as 15 | 30 | 60 | 120 }))}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </SettingRow>
              <button onClick={saveNotifications} disabled={updateUser.isPending} className="btn-primary mt-4 text-sm">
                {updateUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Notifications
              </button>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-1">
              <h2 className="font-semibold mb-4">AI Preferences</h2>
              <SettingRow label="Auto Task Breakdown" description="AI breaks every new task into subtasks automatically">
                <Toggle checked={aiPrefs.autoBreakdownEnabled} onChange={v => setAiPrefs(s => ({ ...s, autoBreakdownEnabled: v }))} />
              </SettingRow>
              <SettingRow label="Auto Schedule" description="Suggest calendar slots after task creation">
                <Toggle checked={aiPrefs.autoScheduleEnabled} onChange={v => setAiPrefs(s => ({ ...s, autoScheduleEnabled: v }))} />
              </SettingRow>
              <SettingRow label="Energy Pattern" description="When you're most productive">
                <select
                  className="input-base py-1.5 text-sm w-36"
                  value={aiPrefs.energyPattern}
                  onChange={e => setAiPrefs(s => ({ ...s, energyPattern: e.target.value as EnergyPattern }))}
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night Owl</option>
                </select>
              </SettingRow>
              <SettingRow label="Procrastination Sensitivity" description="How aggressively to send escalation alerts">
                <select
                  className="input-base py-1.5 text-sm w-28"
                  value={aiPrefs.procrastinationSensitivity}
                  onChange={e => setAiPrefs(s => ({ ...s, procrastinationSensitivity: e.target.value as ProcrastinationSensitivity }))}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </SettingRow>
              <SettingRow label="AI Insight Frequency">
                <select
                  className="input-base py-1.5 text-sm w-28"
                  value={aiPrefs.insightFrequency}
                  onChange={e => setAiPrefs(s => ({ ...s, insightFrequency: e.target.value as InsightFrequency }))}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="off">Off</option>
                </select>
              </SettingRow>
              <button onClick={saveAiPrefs} disabled={updateUser.isPending} className="btn-primary mt-4 text-sm">
                {updateUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save AI Preferences
              </button>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="space-y-1">
              <h2 className="font-semibold mb-4">Integrations</h2>
              <SettingRow label="Google Calendar & Gmail" description={userProfile?.googleCalendarConnected ? 'Connected — calendar sync and inbox scan enabled' : 'Connect for calendar blocking and Gmail task extraction'}>
                <button onClick={connectGoogle} className={cn('btn-secondary text-sm', userProfile?.googleCalendarConnected && 'text-emerald-400 border-emerald-400/30')}>
                  {userProfile?.googleCalendarConnected ? '✓ Connected' : 'Connect'}
                </button>
              </SettingRow>
              <SettingRow label="GitHub Issues" description={githubConnected ? 'Connected — import assigned issues as tasks' : 'Sync open GitHub issues assigned to you'}>
                <div className="flex gap-2">
                  <button onClick={connectGitHub} className={cn('btn-secondary text-sm', githubConnected && 'text-emerald-400 border-emerald-400/30')}>
                    {githubConnected ? '✓ Connected' : 'Connect'}
                  </button>
                  {githubConnected && (
                    <button onClick={openGitHubPanel} className="btn-primary text-sm">Import</button>
                  )}
                </div>
              </SettingRow>
              <SettingRow label="Notion" description="Coming in a future update">
                <button className="btn-secondary text-sm opacity-50 cursor-not-allowed" disabled>Soon</button>
              </SettingRow>
              <SettingRow label="Jira" description="Coming in a future update">
                <button className="btn-secondary text-sm opacity-50 cursor-not-allowed" disabled>Soon</button>
              </SettingRow>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-1">
              <h2 className="font-semibold mb-4">Privacy & Security</h2>
              <SettingRow label="Export My Data" description="Download all your tasks as CSV">
                <button onClick={exportData} className="btn-secondary text-sm">Export</button>
              </SettingRow>
              <SettingRow label="Data Retention" description="Tasks kept for 30 days after deletion">
                <span className="text-sm text-muted-foreground">30 days</span>
              </SettingRow>
              <SettingRow label="Delete Account" description="Contact support to permanently remove your data">
                <button className="btn-destructive text-sm opacity-50 cursor-not-allowed" disabled>Contact</button>
              </SettingRow>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
