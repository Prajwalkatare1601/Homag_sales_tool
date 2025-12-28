// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import supabase from "../supabase/server"


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // ===================
    // Supabase Login
    // ===================
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message || "Invalid credentials");
      setLoading(false);
      return;
    }

    if (data.session) {
      toast.success("Login successful!");

      // Save login state — your app already uses this
      localStorage.setItem("isAuthenticated", "true");

      navigate("/authenticated");
    } else {
      toast.error("Login failed — no session returned.");
    }

    setLoading(false);

   // ✅ FETCH PROFILE AFTER LOGIN
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .single();

  if (profileError) {
    console.error("Profile fetch failed:", profileError);
    toast.error("Unable to load user profile.");
    setLoading(false);
    return;
  }

  // ✅ OPTIONAL: Store profile for later use
  localStorage.setItem("isAuthenticated", "true");
  localStorage.setItem("userProfile", JSON.stringify(profile));

  toast.success(`Welcome ${profile.name}!`);
  navigate("/authenticated");

  setLoading(false);
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
          {/* Email */}
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

          {/* Password */}
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

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full bg-[#001942] hover:bg-[#002b6b]"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
          <p className="text-sm text-center text-slate-600 mt-4">
  Don’t have an account?{" "}
  <button
    className="text-blue-600 hover:underline"
    onClick={() => navigate("/register")}
  >
    Register
  </button>
</p>

        </form>

        <p className="text-xs text-slate-400 text-center mt-4">
          © {new Date().getFullYear()} Homag India | Confidential
        </p>
      </div>
    </div>
  );
};

export default Login;
