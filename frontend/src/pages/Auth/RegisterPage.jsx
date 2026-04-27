import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import { BrainCircuit, Mail, Lock, ArrowRight, User } from "lucide-react";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authService.register(username, email, password);
      toast.success("Registration successful! Please login");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to register, please try again");
      toast.error(err.message || "Failed to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50">

      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30" />

      <div className="relative w-full max-w-md px-6">

        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-10">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 mb-6">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>

            <h1 className="text-2xl font-medium text-slate-900 mb-2">
              Create an account
            </h1>
            <p className="text-slate-500 text-sm">
              Start your AI-powered learning experience
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase">
                Username
              </label>

              <div className="relative mt-2">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center ${
                  focusField === "username" ? "text-emerald-500" : "text-slate-400"
                }`}>
                  <User className="h-5 w-5" />
                </div>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusField("username")}
                  onBlur={() => setFocusField(null)}
                  placeholder="yourusername"
                  required
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase">
                Email
              </label>

              <div className="relative mt-2">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center ${
                  focusField === "email" ? "text-emerald-500" : "text-slate-400"
                }`}>
                  <Mail className="h-5 w-5" />
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusField("email")}
                  onBlur={() => setFocusField(null)}
                  placeholder="you@example.com"
                  required
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase">
                Password
              </label>

              <div className="relative mt-2">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center ${
                  focusField === "password" ? "text-emerald-500" : "text-slate-400"
                }`}>
                  <Lock className="h-5 w-5" />
                </div>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusField("password")}
                  onBlur={() => setFocusField(null)}
                  placeholder="********"
                  required
                  className="w-full h-12 pl-12 pr-4 border-2 border-slate-200 rounded-xl focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-xs text-red-600 text-center">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-linear-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-600 font-semibold">
              Sign in
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to our terms & privacy policy
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;