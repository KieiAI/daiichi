'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  User, 
  ChevronDown,
  Factory,
  Users,
  LogOut,
  FileText,
  Monitor,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Title and breadcrumb */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Factory className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">第一施設工業 / リスクアセスメントAI</h1>
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-4">
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2">
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">管理者</span>
                  <span className="text-xs text-gray-500">システム管理者</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <Link href="/account">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>アカウント設定</span>
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuSeparator />
              
              {/* ユーザー管理 */}
              <Link href="/users">
                <DropdownMenuItem className="cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>ユーザー管理</span>
                </DropdownMenuItem>
              </Link>
              
              <Link href="/knowledge">
                <DropdownMenuItem className="cursor-pointer">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>ナレッジ管理</span>
                </DropdownMenuItem>
              </Link>
              
              {/* システム設定 */}
              <Link href="/settings">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>システム設定</span>
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuSeparator />
              
              {/* ログアウト */}
              <DropdownMenuItem className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="mr-2 h-4 w-4" />
                <span>ログアウト</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}