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

// Branding component
const AuthBranding = () => (
  <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12">
    <div className="text-white text-center max-w-md">
      <div className="flex items-center justify-center mb-8">
        <BarChart3 className="h-12 w-12 mr-3" />
        <h1 className="text-4xl font-bold">StockWise</h1>
      </div>
      <p className="text-xl mb-8 text-blue-100">
        Smarter insights for your investments
      </p>
      <div className="space-y-4 text-left">
        {[
          { icon: TrendingUp, text: "AI-powered portfolio insights" },
          { icon: Shield, text: "Comprehensive risk analysis" },
          { icon: BarChart3, text: "Beautiful allocation visualizations" },
        ].map(({ icon: Icon, text }, index) => (
          <div key={index} className="flex items-center">
            <Icon className="h-6 w-6 mr-3 text-blue-200" />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Password input with visibility toggle
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
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 text-gray-400" />
        ) : (
          <Eye className="h-4 w-4 text-gray-400" />
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

  const onSubmit = async (values: LoginFormData | RegisterFormData) => {
    try {
      if (isLoginMode) {
        const loginData = values as LoginFormData;
        await loginMutation.mutateAsync({
          username: loginData.email,
          password: loginData.password,
        });
        toast("Welcome back! You have successfully logged in.");
        navigate("/dashboard");
      } else {
        const registerData = values as RegisterFormData;
        await registerMutation.mutateAsync({
          email: registerData.email,
          password: registerData.password,
          fullName: registerData.fullName,
        });
        toast("Account created!");
        // Switch to login mode after successful registration
        setIsLoginMode(true);
        form.reset();
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.detail ||
        err?.message ||
        "An unexpected error occurred";
      toast("Error: " + errorMessage);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    form.reset();
  };

  return (
    <div className="min-h-screen flex">
      <AuthBranding />

      <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isLoginMode ? "Welcome back" : "Create account"}
            </CardTitle>
            <p className="text-sm text-gray-600 text-center">
              {isLoginMode
                ? "Enter your credentials to access your account"
                : "Fill in your information to get started"}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {!isLoginMode && (
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
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
                      <FormLabel>Password</FormLabel>
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
                        <FormLabel>Confirm Password</FormLabel>
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

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading
                    ? "Please wait..."
                    : isLoginMode
                    ? "Sign in"
                    : "Create account"}
                </Button>
              </form>
            </Form>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isLoginMode
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto font-semibold"
                  onClick={toggleMode}
                  disabled={isLoading}
                >
                  {isLoginMode ? "Sign up" : "Sign in"}
                </Button>
              </p>
            </div>

            {isLoginMode && (
              <div className="text-center">
                <Button variant="link" className="text-sm text-gray-600">
                  Forgot your password?
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
