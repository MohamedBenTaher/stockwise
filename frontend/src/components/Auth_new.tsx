"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import {
  BarChart3,
  TrendingUp,
  Shield,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useLogin, useRegister } from "@/hooks";

// Enhanced validation schema
const baseSchema = {
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
};

const loginSchema = z.object(baseSchema);

const registerSchema = z
  .object({
    ...baseSchema,
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(50, "Full name must be less than 50 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// Enhanced branding component with animations
const AuthBranding = () => (
  <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 items-center justify-center p-12 relative overflow-hidden">
    {/* Background pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-white rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
    </div>

    <div className="text-white text-center max-w-md relative z-10">
      <div className="flex items-center justify-center mb-8">
        <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm mr-4">
          <BarChart3 className="h-12 w-12" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
          StockWise
        </h1>
      </div>

      <p className="text-xl mb-8 text-blue-100 font-light">
        Smarter insights for your investments
      </p>

      <div className="space-y-6 text-left">
        {[
          { icon: TrendingUp, text: "AI-powered portfolio insights" },
          { icon: Shield, text: "Comprehensive risk analysis" },
          { icon: BarChart3, text: "Beautiful allocation visualizations" },
        ].map(({ icon: Icon, text }, index) => (
          <div key={index} className="flex items-center">
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm mr-4">
              <Icon className="h-6 w-6 text-blue-200" />
            </div>
            <span className="text-blue-50">{text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Enhanced password input with better styling
const PasswordInput = ({
  field,
  placeholder,
}: {
  field: any;
  placeholder: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        {...field}
        className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-colors"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        ) : (
          <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
        )}
      </Button>
    </div>
  );
};

export default function AuthForm() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const navigate = useNavigate();

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const schema = isLoginMode ? loginSchema : registerSchema;
  const form = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      ...(isLoginMode ? {} : { fullName: "", confirmPassword: "" }),
    },
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending;
  const error = loginMutation.error || registerMutation.error;

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    try {
      if (isLoginMode) {
        const loginData = data as LoginFormData;
        await loginMutation.mutateAsync({
          username: loginData.email, // Use email as username
          password: loginData.password,
        });
        toast("Logged in successfully!");
        // Wait a moment for authentication state to update
        await new Promise((resolve) => setTimeout(resolve, 200));
        navigate("/dashboard");
      } else {
        const registerData = data as RegisterFormData;
        await registerMutation.mutateAsync({
          email: registerData.email,
          password: registerData.password,
          fullName: registerData.fullName,
        });
        toast("Registration successful! Please log in.");
        setIsLoginMode(true);
        form.reset();
      }
    } catch (error: any) {
      toast(`Error: ${error.response?.data?.detail || "An error occurred"}`);
    }
  };
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    form.reset();
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <AuthBranding />

      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-8">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                {isLoginMode ? "Welcome back" : "Create account"}
              </CardTitle>
              <p className="text-gray-600 text-base">
                {isLoginMode
                  ? "Enter your credentials to access your account"
                  : "Fill in your information to get started"}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert
                  variant="destructive"
                  className="animate-in slide-in-from-top-1"
                >
                  <AlertDescription>
                    {(error as any)?.response?.data?.detail ||
                      (isLoginMode ? "Login failed" : "Registration failed")}
                  </AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {!isLoginMode && (
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              {...field}
                              className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            {...field}
                            className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">
                          Password
                        </FormLabel>
                        <FormControl>
                          <PasswordInput
                            field={field}
                            placeholder="Enter your password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isLoginMode && (
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <PasswordInput
                              field={field}
                              placeholder="Confirm your password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait...
                      </>
                    ) : (
                      <>
                        {!isLoginMode && (
                          <CheckCircle className="mr-2 h-4 w-4" />
                        )}
                        {isLoginMode ? "Sign in" : "Create account"}
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center pt-4">
                <p className="text-gray-600">
                  {isLoginMode
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700"
                    onClick={toggleMode}
                    disabled={isLoading}
                  >
                    {isLoginMode ? "Sign up" : "Sign in"}
                  </Button>
                </p>
              </div>

              {isLoginMode && (
                <div className="text-center">
                  <Button
                    variant="link"
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Forgot your password?
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
