// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple static check (replace with your API call or Firebase/Auth0 etc.)
    if (email === "admin@homag.in" && password === "homag123") {
      localStorage.setItem("isAuthenticated", "true");
      toast.success("Login successful!");
      navigate("/authenticated");
    } else {
      toast.error("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-200">
        <div className="flex flex-col items-center mb-6">
          <img src="/homag_logo.jpg" alt="Homag" className="h-16 mb-2" />
          <h1 className="text-xl font-semibold text-slate-800">Factory Planner</h1>
          <p className="text-sm text-slate-500">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input
              type="email"
              placeholder="you@homag.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-[#001942] hover:bg-[#002b6b]">
            Login
          </Button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-4">
          © {new Date().getFullYear()} Homag India | Confidential
        </p>
      </div>
    </div>
  );
};

export default Login;
