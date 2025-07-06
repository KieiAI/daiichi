'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Database, 
  Shield, 
  Bell, 
  Mail, 
  Server, 
  Key,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SystemSettings {
  general: {
    systemName: string;
    companyName: string;
    timezone: string;
    language: string;
    autoSave: boolean;
    sessionTimeout: number;
  };
  security: {
    passwordMinLength: number;
    passwordRequireSpecial: boolean;
    twoFactorAuth: boolean;
    loginAttempts: number;
    sessionDuration: number;
  };
  notifications: {
    emailNotifications: boolean;
    systemAlerts: boolean;
    riskAlerts: boolean;
    maintenanceAlerts: boolean;
    emailServer: string;
    emailPort: number;
  };
  database: {
    backupEnabled: boolean;
    backupFrequency: string;
    retentionDays: number;
    compressionEnabled: boolean;
  };
}

const defaultSettings: SystemSettings = {
  general: {
    systemName: 'リスクアセスメントシステム',
    companyName: '第一施設工業',
    timezone: 'Asia/Tokyo',
    language: 'ja',
    autoSave: true,
    sessionTimeout: 30
  },
  security: {
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    twoFactorAuth: false,
    loginAttempts: 5,
    sessionDuration: 480
  },
  notifications: {
    emailNotifications: true,
    systemAlerts: true,
    riskAlerts: true,
    maintenanceAlerts: false,
    emailServer: 'smtp.example.com',
    emailPort: 587
  },
  database: {
    backupEnabled: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    compressionEnabled: true
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  // 設定更新
  const updateSetting = (category: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // 設定保存
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 模擬的な保存処理
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      toast({
        title: '設定保存完了',
        description: 'システム設定が保存されました'
      });
    } catch (error) {
      toast({
        title: '保存エラー',
        description: '設定の保存に失敗しました',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 設定リセット
  const handleReset = () => {
    setSettings(defaultSettings);
    toast({
      title: '設定リセット',
      description: 'デフォルト設定に戻しました'
    });
  };

  // バックアップ実行
  const handleBackup = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'バックアップ完了',
        description: 'データベースのバックアップが完了しました'
      });
    } catch (error) {
      toast({
        title: 'バックアップエラー',
        description: 'バックアップに失敗しました',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">システム設定</h1>
          <p className="text-slate-600">システムの動作設定とセキュリティ設定</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            リセット
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 最終保存時刻 */}
      {lastSaved && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">
            最終保存: {lastSaved.toLocaleString('ja-JP')}
          </span>
        </div>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>一般設定</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>セキュリティ</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>通知設定</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>データベース</span>
          </TabsTrigger>
        </TabsList>

        {/* 一般設定 */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>基本設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="systemName">システム名</Label>
                  <Input
                    id="systemName"
                    value={settings.general.systemName}
                    onChange={(e) => updateSetting('general', 'systemName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="companyName">会社名</Label>
                  <Input
                    id="companyName"
                    value={settings.general.companyName}
                    onChange={(e) => updateSetting('general', 'companyName', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">タイムゾーン</Label>
                  <select
                    id="timezone"
                    value={settings.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="language">言語</Label>
                  <select
                    id="language"
                    value={settings.general.language}
                    onChange={(e) => updateSetting('general', 'language', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoSave">自動保存</Label>
                  <p className="text-sm text-gray-500">データを自動的に保存します</p>
                </div>
                <Switch
                  id="autoSave"
                  checked={settings.general.autoSave}
                  onCheckedChange={(checked) => updateSetting('general', 'autoSave', checked)}
                />
              </div>
              <div>
                <Label htmlFor="sessionTimeout">セッションタイムアウト（分）</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.general.sessionTimeout}
                  onChange={(e) => updateSetting('general', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* セキュリティ設定 */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>パスワードポリシー</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="passwordMinLength">最小文字数</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="passwordRequireSpecial">特殊文字を必須とする</Label>
                  <p className="text-sm text-gray-500">記号を含むパスワードを要求します</p>
                </div>
                <Switch
                  id="passwordRequireSpecial"
                  checked={settings.security.passwordRequireSpecial}
                  onCheckedChange={(checked) => updateSetting('security', 'passwordRequireSpecial', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth">二要素認証</Label>
                  <p className="text-sm text-gray-500">ログイン時に追加認証を要求します</p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                />
              </div>
              <div>
                <Label htmlFor="loginAttempts">ログイン試行回数制限</Label>
                <Input
                  id="loginAttempts"
                  type="number"
                  value={settings.security.loginAttempts}
                  onChange={(e) => updateSetting('security', 'loginAttempts', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知設定 */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>通知設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">メール通知</Label>
                  <p className="text-sm text-gray-500">重要な通知をメールで送信します</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="systemAlerts">システムアラート</Label>
                  <p className="text-sm text-gray-500">システムエラーや警告を通知します</p>
                </div>
                <Switch
                  id="systemAlerts"
                  checked={settings.notifications.systemAlerts}
                  onCheckedChange={(checked) => updateSetting('notifications', 'systemAlerts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="riskAlerts">リスクアラート</Label>
                  <p className="text-sm text-gray-500">高リスク項目を検出時に通知します</p>
                </div>
                <Switch
                  id="riskAlerts"
                  checked={settings.notifications.riskAlerts}
                  onCheckedChange={(checked) => updateSetting('notifications', 'riskAlerts', checked)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emailServer">メールサーバー</Label>
                  <Input
                    id="emailServer"
                    value={settings.notifications.emailServer}
                    onChange={(e) => updateSetting('notifications', 'emailServer', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="emailPort">ポート番号</Label>
                  <Input
                    id="emailPort"
                    type="number"
                    value={settings.notifications.emailPort}
                    onChange={(e) => updateSetting('notifications', 'emailPort', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* データベース設定 */}
        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>バックアップ設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="backupEnabled">自動バックアップ</Label>
                  <p className="text-sm text-gray-500">定期的にデータベースをバックアップします</p>
                </div>
                <Switch
                  id="backupEnabled"
                  checked={settings.database.backupEnabled}
                  onCheckedChange={(checked) => updateSetting('database', 'backupEnabled', checked)}
                />
              </div>
              <div>
                <Label htmlFor="backupFrequency">バックアップ頻度</Label>
                <select
                  id="backupFrequency"
                  value={settings.database.backupFrequency}
                  onChange={(e) => updateSetting('database', 'backupFrequency', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="hourly">毎時</option>
                  <option value="daily">毎日</option>
                  <option value="weekly">毎週</option>
                  <option value="monthly">毎月</option>
                </select>
              </div>
              <div>
                <Label htmlFor="retentionDays">保存期間（日）</Label>
                <Input
                  id="retentionDays"
                  type="number"
                  value={settings.database.retentionDays}
                  onChange={(e) => updateSetting('database', 'retentionDays', parseInt(e.target.value))}
                  className="w-32"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compressionEnabled">圧縮を有効にする</Label>
                  <p className="text-sm text-gray-500">バックアップファイルを圧縮してサイズを削減します</p>
                </div>
                <Switch
                  id="compressionEnabled"
                  checked={settings.database.compressionEnabled}
                  onCheckedChange={(checked) => updateSetting('database', 'compressionEnabled', checked)}
                />
              </div>
              <div className="pt-4 border-t">
                <div className="flex space-x-3">
                  <Button onClick={handleBackup} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    今すぐバックアップ
                  </Button>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    復元
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>危険な操作</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-red-600">データベースリセット</h4>
                  <p className="text-sm text-gray-500 mb-3">
                    全てのデータが削除されます。この操作は取り消せません。
                  </p>
                  <Button variant="destructive" size="sm">
                    データベースリセット
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}