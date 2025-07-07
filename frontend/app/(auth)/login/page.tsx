"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeClosed } from "lucide-react";
import axios from "axios";

import { Signin } from "@/api/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await Signin({ email, password });
      console.log("Login successful:", response.accessToken);
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      toast.success("Login successful!");
      router.push("/comments");
    } catch (error) {
      console.error("Login failed:", error);

      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || "An error occurred";
        toast.error(message);
      } else {
        toast.error("Failed to Sign In");
        console.log("Helllo addding in nvim");
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter">Welcome !!</h1>
            <p className="text-muted-foreground">
              {" "}
              Enter Your Credentials to Access Your Account
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="siro"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div> */}
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="text"
              placeholder="siro@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeClosed className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm">
                  Remember me
                </Label>
              </div>
              <a href="#" className="text-sm text-primary-600 hover:underline">
                Forgot password?
              </a>
            </div> */}
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          {/* <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or Continue With</span>
            </div>
          </div> */}

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Sign Up
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
