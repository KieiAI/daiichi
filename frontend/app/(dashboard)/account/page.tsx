'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Shield, 
  Eye, 
  EyeOff, 
  Save,
  Edit,
  Lock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// モックユーザーデータ
const mockUser: UserProfile = {
  id: 1,
  name: '田中 太郎',
  email: 'tanaka@daiichi-shisetsu.co.jp',
  phone: '090-1234-5678',
  department: '安全管理部',
  role: 'admin',
  createdAt: '2024-01-15',
  lastLogin: '2024-03-15 09:30'
};

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    phone: user.phone,
    department: user.department
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();

  // プロフィール編集の開始
  const handleEditStart = () => {
    setIsEditing(true);
    setEditForm({
      name: user.name,
      phone: user.phone,
      department: user.department
    });
    setErrors({});
  };

  // プロフィール編集のキャンセル
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: user.name,
      phone: user.phone,
      department: user.department
    });
    setErrors({});
  };

  // プロフィール更新のバリデーション
  const validateProfile = () => {
    const newErrors: {[key: string]: string} = {};

    if (!editForm.name.trim()) {
      newErrors.name = '氏名を入力してください';
    }

    if (!editForm.department.trim()) {
      newErrors.department = '部署を入力してください';
    }

    if (editForm.phone && !/^[\d-+()]+$/.test(editForm.phone.replace(/\s/g, ''))) {
      newErrors.phone = '有効な電話番号を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // プロフィール更新
  const handleProfileUpdate = async () => {
    if (!validateProfile()) {
      return;
    }

    setIsUpdating(true);
    try {
      // 模擬的な更新処理
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUser(prev => ({
        ...prev,
        ...editForm
      }));
      
      setIsEditing(false);
      toast({
        title: 'アカウント情報更新完了',
        description: 'アカウント情報が更新されました'
      });
    } catch (error) {
      toast({
        title: '更新エラー',
        description: 'アカウント情報の更新に失敗しました',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // パスワード変更のバリデーション
  const validatePassword = () => {
    const newErrors: {[key: string]: string} = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = '現在のパスワードを入力してください';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = '新しいパスワードを入力してください';
    } else if (passwordForm.newPassword.length < 8) {
      newErrors.newPassword = 'パスワードは8文字以上で入力してください';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'パスワード確認を入力してください';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }

    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = '現在のパスワードと同じパスワードは使用できません';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // パスワード変更
  const handlePasswordChange = async () => {
    if (!validatePassword()) {
      return;
    }

    setIsChangingPassword(true);
    try {
      // 模擬的なパスワード変更処理
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // フォームリセット
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast({
        title: 'パスワード変更完了',
        description: 'パスワードが正常に変更されました'
      });
    } catch (error) {
      toast({
        title: 'パスワード変更エラー',
        description: 'パスワードの変更に失敗しました',
        variant: 'destructive'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // フォーム入力ハンドラー
  const handleInputChange = (field: string, value: string, formType: 'profile' | 'password') => {
    if (formType === 'profile') {
      setEditForm(prev => ({ ...prev, [field]: value }));
    } else {
      setPasswordForm(prev => ({ ...prev, [field]: value }));
    }
    
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // パスワード表示切り替え
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // ロールバッジの色を取得
  const getRoleBadgeColor = (role: UserProfile['role']) => {
    return role === 'admin' 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-green-100 text-green-800 border-green-200';
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">アカウント設定</h1>
          <p className="text-slate-600">アカウント情報の確認・編集</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* アカウント情報 */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3 text-xl">
                  <User className="h-6 w-6 text-gray-600" />
                  <span>基本情報</span>
                </CardTitle>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditStart}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    編集
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isEditing ? (
                // 編集モード
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      氏名 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value, 'profile')}
                      className={`mt-1 ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      電話番号
                    </Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value, 'profile')}
                        placeholder="090-1234-5678"
                        className={`pl-10 ${errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                      部署 <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="department"
                        value={editForm.department}
                        onChange={(e) => handleInputChange('department', e.target.value, 'profile')}
                        placeholder="安全管理部"
                        className={`pl-10 ${errors.department ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.department}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button variant="outline" onClick={handleEditCancel}>
                      キャンセル
                    </Button>
                    <Button 
                      onClick={handleProfileUpdate}
                      disabled={isUpdating}
                      className="bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          更新中...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          更新
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                // 表示モード
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">氏名</div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">メールアドレス</div>
                      <div className="font-medium text-gray-900">{user.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">電話番号</div>
                      <div className="font-medium text-gray-900">{user.phone || '未設定'}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">部署</div>
                      <div className="font-medium text-gray-900">{user.department}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">権限</div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                          {user.role === 'admin' ? 'システム管理者' : '一般ユーザー'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">登録日</div>
                      <div className="font-medium text-gray-900">{new Date(user.createdAt).toLocaleDateString('ja-JP')}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">最終ログイン</div>
                      <div className="font-medium text-gray-900">{user.lastLogin}</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* パスワード変更 */}
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-3 text-xl">
                <Lock className="h-6 w-6 text-gray-600" />
                <span>パスワード変更</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                    現在のパスワード <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value, 'password')}
                      placeholder="現在のパスワードを入力"
                      className={`pl-10 pr-12 ${errors.currentPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.currentPassword}</span>
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    新しいパスワード <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value, 'password')}
                      placeholder="新しいパスワードを入力"
                      className={`pl-10 pr-12 ${errors.newPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.newPassword}</span>
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    8文字以上で入力してください
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    パスワード確認 <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value, 'password')}
                      placeholder="新しいパスワードを再入力"
                      className={`pl-10 pr-12 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}`}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.confirmPassword}</span>
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {isChangingPassword ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        変更中...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        パスワードを変更
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}