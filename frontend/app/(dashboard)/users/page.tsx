'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Mail,
  Phone,
  Calendar,
  User,
  Building,
  UserPlus,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department: string;
  phone?: string;
  lastLogin?: string;
  createdAt: string;
}

type SortField = 'name' | 'lastLogin' | 'createdAt' | 'department';
type SortOrder = 'asc' | 'desc';
type FilterRole = 'all' | 'admin' | 'user';

// モックユーザーデータ
const mockUsers: User[] = [
  {
    id: 1,
    name: '田中 太郎',
    email: 'tanaka@daiichi-shisetsu.co.jp',
    role: 'admin',
    department: '安全管理部',
    phone: '090-1234-5678',
    lastLogin: '2024-03-15 09:30',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: '佐藤 花子',
    email: 'sato@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '工事部',
    phone: '090-2345-6789',
    lastLogin: '2024-03-14 16:45',
    createdAt: '2024-01-20'
  },
  {
    id: 3,
    name: '鈴木 一郎',
    email: 'suzuki@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '品質管理部',
    phone: '090-3456-7890',
    lastLogin: '2024-03-13 14:20',
    createdAt: '2024-02-01'
  },
  {
    id: 4,
    name: '高橋 美咲',
    email: 'takahashi@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '総務部',
    phone: '090-4567-8901',
    lastLogin: '2024-02-28 11:15',
    createdAt: '2024-02-10'
  },
  {
    id: 5,
    name: '山田 健太',
    email: 'yamada@daiichi-shisetsu.co.jp',
    role: 'admin',
    department: '安全管理部',
    phone: '090-5678-9012',
    lastLogin: '2024-03-15 08:00',
    createdAt: '2024-02-15'
  },
  {
    id: 6,
    name: '伊藤 雅子',
    email: 'ito@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '設計部',
    phone: '090-6789-0123',
    lastLogin: '2024-03-12 13:45',
    createdAt: '2024-01-25'
  },
  {
    id: 7,
    name: '渡辺 慎一',
    email: 'watanabe@daiichi-shisetsu.co.jp',
    role: 'admin',
    department: '技術部',
    phone: '090-7890-1234',
    lastLogin: '2024-03-15 10:20',
    createdAt: '2024-01-30'
  },
  {
    id: 8,
    name: '中村 由美',
    email: 'nakamura@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '営業部',
    phone: '090-8901-2345',
    lastLogin: '2024-03-11 15:30',
    createdAt: '2024-02-05'
  },
  {
    id: 9,
    name: '小林 拓也',
    email: 'kobayashi@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '工事部',
    phone: '090-9012-3456',
    lastLogin: '2024-03-10 09:15',
    createdAt: '2024-02-12'
  },
  {
    id: 10,
    name: '加藤 恵子',
    email: 'kato@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '経理部',
    phone: '090-0123-4567',
    lastLogin: '2024-03-09 14:00',
    createdAt: '2024-02-18'
  },
  {
    id: 11,
    name: '松本 隆志',
    email: 'matsumoto@daiichi-shisetsu.co.jp',
    role: 'admin',
    department: '品質管理部',
    phone: '090-1357-2468',
    lastLogin: '2024-03-14 11:45',
    createdAt: '2024-01-08'
  },
  {
    id: 12,
    name: '井上 真理',
    email: 'inoue@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '人事部',
    phone: '090-2468-1357',
    lastLogin: '2024-03-08 16:20',
    createdAt: '2024-02-22'
  },
  {
    id: 13,
    name: '木村 正男',
    email: 'kimura@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '設計部',
    phone: '090-3579-2468',
    lastLogin: '2024-03-07 10:30',
    createdAt: '2024-01-12'
  },
  {
    id: 14,
    name: '林 美穂',
    email: 'hayashi@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '総務部',
    phone: '090-4680-1357',
    lastLogin: '2024-03-06 12:15',
    createdAt: '2024-02-28'
  },
  {
    id: 15,
    name: '斎藤 和也',
    email: 'saito@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '技術部',
    phone: '090-5791-3468',
    lastLogin: '2024-03-05 08:45',
    createdAt: '2024-01-18'
  },
  {
    id: 16,
    name: '清水 智子',
    email: 'shimizu@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '営業部',
    phone: '090-6802-4579',
    lastLogin: '2024-03-04 17:00',
    createdAt: '2024-03-01'
  },
  {
    id: 17,
    name: '森田 浩二',
    email: 'morita@daiichi-shisetsu.co.jp',
    role: 'admin',
    department: '安全管理部',
    phone: '090-7913-5680',
    lastLogin: '2024-03-15 07:30',
    createdAt: '2024-01-05'
  },
  {
    id: 18,
    name: '池田 千春',
    email: 'ikeda@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '工事部',
    phone: '090-8024-6791',
    lastLogin: '2024-03-03 13:20',
    createdAt: '2024-02-08'
  },
  {
    id: 19,
    name: '橋本 勇',
    email: 'hashimoto@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '品質管理部',
    phone: '090-9135-7802',
    lastLogin: '2024-03-02 11:10',
    createdAt: '2024-02-14'
  },
  {
    id: 20,
    name: '石川 麻衣',
    email: 'ishikawa@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '経理部',
    phone: '090-0246-8913',
    lastLogin: '2024-03-01 15:45',
    createdAt: '2024-02-20'
  },
  {
    id: 21,
    name: '前田 光一',
    email: 'maeda@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '設計部',
    phone: '090-1357-9024',
    lastLogin: '2024-02-29 09:30',
    createdAt: '2024-01-22'
  },
  {
    id: 22,
    name: '藤田 さくら',
    email: 'fujita@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '人事部',
    phone: '090-2468-0135',
    lastLogin: '2024-02-28 14:25',
    createdAt: '2024-03-05'
  },
  {
    id: 23,
    name: '岡田 誠',
    email: 'okada@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '技術部',
    phone: '090-3579-1246',
    lastLogin: '2024-02-27 16:40',
    createdAt: '2024-01-28'
  },
  {
    id: 24,
    name: '長谷川 愛',
    email: 'hasegawa@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '営業部',
    phone: '090-4680-2357',
    lastLogin: '2024-02-26 10:55',
    createdAt: '2024-02-25'
  },
  {
    id: 25,
    name: '村上 大輔',
    email: 'murakami@daiichi-shisetsu.co.jp',
    role: 'user',
    department: '総務部',
    phone: '090-5791-3468',
    lastLogin: '2024-02-25 12:30',
    createdAt: '2024-01-15'
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user' as User['role'],
    department: '',
    phone: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  // ソート処理
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // ソートアイコンの取得
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-blue-600" />
      : <ArrowDown className="h-4 w-4 text-blue-600" />;
  };

  // 検索・フィルタリング・ソート処理
  const filteredAndSortedUsers = users
    .filter(user => {
      // 検索フィルター
      const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      // ロールフィルター
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;
      
      switch (sortField) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'lastLogin':
          aValue = a.lastLogin ? new Date(a.lastLogin) : new Date(0);
          bValue = b.lastLogin ? new Date(b.lastLogin) : new Date(0);
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'department':
          aValue = a.department;
          bValue = b.department;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  // ロールバッジの色を取得（管理者を赤っぽく）
  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // バリデーション
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!newUser.name.trim()) {
      newErrors.name = '氏名を入力してください';
    }

    if (!newUser.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    } else if (users.some(u => u.email === newUser.email && u.id !== editingUser?.id)) {
      newErrors.email = 'このメールアドレスは既に使用されています';
    }

    if (!newUser.department.trim()) {
      newErrors.department = '部署を入力してください';
    }

    if (newUser.phone && !/^[\d-+()]+$/.test(newUser.phone.replace(/\s/g, ''))) {
      newErrors.phone = '有効な電話番号を入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 新規ユーザー追加
  const handleAddUser = () => {
    if (!validateForm()) {
      return;
    }

    const user: User = {
      id: Math.max(...users.map(u => u.id)) + 1,
      ...newUser,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers([...users, user]);
    handleCloseDialog();

    toast({
      title: 'ユーザー追加完了',
      description: `${user.name}を追加しました`
    });
  };

  // ユーザー編集
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      phone: user.phone || ''
    });
    setErrors({});
  };

  // ユーザー更新
  const handleUpdateUser = () => {
    if (!validateForm()) {
      return;
    }

    setUsers(users.map(user => 
      user.id === editingUser!.id 
        ? { ...user, ...newUser }
        : user
    ));

    const userName = newUser.name;
    handleCloseDialog();

    toast({
      title: 'ユーザー更新完了',
      description: `${userName}の情報を更新しました`
    });
  };

  // ユーザー削除
  const deleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    setUsers(users.filter(u => u.id !== userId));
    
    toast({
      title: 'ユーザー削除',
      description: `${user?.name}を削除しました`
    });
  };

  // ダイアログを閉じる
  const handleCloseDialog = () => {
    setIsNewUserDialogOpen(false);
    setEditingUser(null);
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      department: '',
      phone: ''
    });
    setErrors({});
  };

  // フォーム入力ハンドラー
  const handleInputChange = (field: string, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">ユーザー管理</h1>
          <p className="text-slate-600">ユーザーの管理・追加・編集</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog open={isNewUserDialogOpen || !!editingUser} onOpenChange={(open) => !open && handleCloseDialog()}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setIsNewUserDialogOpen(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                新規ユーザー追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2 text-xl">
                  {editingUser ? (
                    <>
                      <Edit className="h-5 w-5 text-gray-900" />
                      <span>ユーザー編集</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 text-gray-900" />
                      <span>新規ユーザー追加</span>
                    </>
                  )}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* 基本情報セクション */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">基本情報</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        氏名 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={newUser.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="田中 太郎"
                        className={`mt-1 ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>{errors.name}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        メールアドレス <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="tanaka@daiichi-shisetsu.co.jp"
                          className={`pl-10 ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>{errors.email}</span>
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
                          value={newUser.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="090-1234-5678"
                          className={`pl-10 ${errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>{errors.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 組織情報セクション */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                    <Building className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">組織情報</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="department" className="text-sm font-medium text-gray-700">
                        部署 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="department"
                        value={newUser.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        placeholder="安全管理部"
                        className={`mt-1 ${errors.department ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'}`}
                      />
                      {errors.department && (
                        <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>{errors.department}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                        権限 <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="role"
                        value={newUser.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                      >
                        <option value="user">一般ユーザー</option>
                        <option value="admin">システム管理者</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        {newUser.role === 'admin' 
                          ? '全ての機能にアクセスできます' 
                          : '基本機能のみアクセスできます'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Button variant="outline" onClick={handleCloseDialog}>
                    キャンセル
                  </Button>
                  <Button 
                    onClick={editingUser ? handleUpdateUser : handleAddUser}
                    className="bg-gray-900 hover:bg-gray-800 text-white"
                  >
                    {editingUser ? '更新' : '追加'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 検索バーとフィルター */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ユーザー検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80 border-0 focus:ring-0 focus:border-0 bg-gray-50"
            />
          </div>
          
          {/* ソート表示 */}
          <div className="text-sm text-gray-500">
            {sortField === 'name' && '名前順'} 
            {sortField === 'lastLogin' && '最終ログイン順'} 
            {sortField === 'createdAt' && '登録日順'} 
            {sortField === 'department' && '部署順'} 
            ({sortOrder === 'asc' ? '昇順' : '降順'})
          </div>
        </div>
      </div>

      {/* ユーザーテーブル */}
      <Tabs value={filterRole} onValueChange={(value) => setFilterRole(value as FilterRole)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-white shadow-sm border border-gray-200">
          <TabsTrigger 
            value="all" 
            className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-gray-700 data-[state=active]:border-b-2 data-[state=active]:border-gray-400"
          >
            全て ({users.length})
          </TabsTrigger>
          <TabsTrigger 
            value="admin" 
            className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-red-700 data-[state=active]:border-b-2 data-[state=active]:border-red-500"
          >
            システム管理者 ({users.filter(u => u.role === 'admin').length})
          </TabsTrigger>
          <TabsTrigger 
            value="user" 
            className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:border-b-2 data-[state=active]:border-green-500"
          >
            一般ユーザー ({users.filter(u => u.role === 'user').length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-1">
                          <span>ユーザー</span>
                          {getSortIcon('name')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('department')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-1">
                          <span>部署</span>
                          {getSortIcon('department')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead>権限</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('lastLogin')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-1">
                          <span>最終ログイン</span>
                          {getSortIcon('lastLogin')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('createdAt')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-1">
                          <span>登録日</span>
                          {getSortIcon('createdAt')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-900">{user.department}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                          {user.role === 'admin' ? 'システム管理者' : '一般ユーザー'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <div className="text-sm">
                            <div className="text-gray-900">{user.lastLogin.split(' ')[0]}</div>
                            <div className="text-gray-500">{user.lastLogin.split(' ')[1]}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">未ログイン</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-gray-900">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{user.createdAt}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admin">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-1">
                          <span>ユーザー</span>
                          {getSortIcon('name')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('department')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-1">
                          <span>部署</span>
                          {getSortIcon('department')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead>権限</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('lastLogin')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-1">
                          <span>最終ログイン</span>
                          {getSortIcon('lastLogin')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('createdAt')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-1">
                          <span>登録日</span>
                          {getSortIcon('createdAt')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.filter(user => user.role === 'admin').map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-900">{user.department}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                          {user.role === 'admin' ? 'システム管理者' : '一般ユーザー'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <div className="text-sm">
                            <div className="text-gray-900">{user.lastLogin.split(' ')[0]}</div>
                            <div className="text-gray-500">{user.lastLogin.split(' ')[1]}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">未ログイン</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-gray-900">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{user.createdAt}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="user">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-1">
                          <span>ユーザー</span>
                          {getSortIcon('name')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('department')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-1">
                          <span>部署</span>
                          {getSortIcon('department')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead>権限</TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('lastLogin')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-1">
                          <span>最終ログイン</span>
                          {getSortIcon('lastLogin')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleSort('createdAt')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        <div className="flex items-center space-x-1">
                          <span>登録日</span>
                          {getSortIcon('createdAt')}
                        </div>
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedUsers.filter(user => user.role === 'user').map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-gray-900">{user.department}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                          {user.role === 'admin' ? 'システム管理者' : '一般ユーザー'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <div className="text-sm">
                            <div className="text-gray-900">{user.lastLogin.split(' ')[0]}</div>
                            <div className="text-gray-500">{user.lastLogin.split(' ')[1]}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">未ログイン</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm text-gray-900">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span>{user.createdAt}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              編集
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
            
    </div>
  );
}