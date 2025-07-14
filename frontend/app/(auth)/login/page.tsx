"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/fetch/auth";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (
    field: keyof LoginForm,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // エラーをクリア
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.email) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    if (!form.password) {
      newErrors.password = "パスワードを入力してください";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ログイン処理（模擬）
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const res = await login(form.email, form.password);
      console.log(res);

      toast({
        title: "ログイン成功",
        description: "システムにログインしました",
      });

      router.push("/");
    } catch (error: unknown) {
      throw error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          {/* 会社名 */}
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            第一施設工業
          </h1>
          <div className="w-16 h-0.5 bg-gray-600 mx-auto mb-4 rounded-full opacity-60"></div>
          <p className="text-gray-300 text-lg font-medium">
            リスクアセスメントシステム
          </p>
        </div>

        {/* ログインフォーム */}
        <div className="mt-6"></div>
        <Card className="bg-gray-800/80 backdrop-blur-sm shadow-2xl border border-gray-700">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">ログイン</h2>
              <p className="text-gray-300 text-sm">
                アカウントにサインインしてください
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* エラー表示 */}
              {errors.general && (
                <div className="flex items-center space-x-2 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-300">{errors.general}</p>
                </div>
              )}

              {/* メールアドレス */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300 font-medium">
                  メールアドレス
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="your@email.com"
                    className={`pl-12 h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.email ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* パスワード */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-medium">
                  パスワード
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="パスワードを入力"
                    className={`pl-12 pr-12 h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.password ? "border-red-500 focus:ring-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* 余白 */}
              <div className="pt-4"></div>

              {/* ログインボタン */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>ログイン中...</span>
                  </div>
                ) : (
                  <span>ログイン</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
