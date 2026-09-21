"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

function getAuthErrorMessage(error) {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Incorrect email or password. Please try again.";

    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";

    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";

    default:
      return "Unable to log in right now. Please try again.";
  }
}

function getPasswordResetErrorMessage(error) {
  switch (error?.code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/user-not-found":
      return "No account was found with that email address.";

    case "auth/too-many-requests":
      return "Too many requests. Please try again later.";

    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";

    default:
      return "Unable to send the password reset email. Please try again.";
  }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess("Password reset email sent. Check your inbox.");
    } catch (err) {
      console.error("Password reset error:", err);
      setError(getPasswordResetErrorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 border rounded-lg">
        <h1 className="text-xl font-bold mb-4">Login</h1>

        {error && (
          <p className="text-red-500 mb-3" role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-600 mb-3" role="status">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
              setSuccess("");
            }}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border p-2 pr-16"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
                setSuccess("");
              }}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-sm"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white p-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex justify-between mt-3 text-sm">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetLoading}
            className="disabled:opacity-60"
          >
            {resetLoading ? "Sending..." : "Forgot password?"}
          </button>

          <a href="/signup">Sign up</a>
        </div>
      </div>
    </div>
  );
              }
