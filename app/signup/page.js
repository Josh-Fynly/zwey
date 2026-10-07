"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { getZweyErrorMessage } from "../../lib/errors";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";

function getGoogleErrorMessage(error) {
  if (error?.code === "auth/popup-blocked") {
    return "Your browser blocked the Google sign-up window. Allow popups for Zwey and try again.";
  }

  if (error?.code === "auth/popup-closed-by-user") {
    return "Google sign-up was cancelled.";
  }

  if (error?.code === "auth/cancelled-popup-request") {
    return "Another Google sign-up request is already in progress.";
  }

  if (error?.code === "auth/unauthorized-domain") {
    return "This Zwey website domain is not authorized for Google sign-up yet.";
  }

  if (error?.code === "auth/operation-not-allowed") {
    return "Google sign-up is not enabled for Zwey yet.";
  }

  if (error?.code === "auth/account-exists-with-different-credential") {
    return "An account already exists with this email using a different sign-in method. Sign in with that method instead.";
  }

  return getZweyErrorMessage(error, "google-sign-up");
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  autoComplete,
  placeholder,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-zwey-text"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="h-12 w-full min-w-0 rounded-xl border border-zwey-border bg-zwey-surface px-4 pr-14 text-sm text-zwey-text outline-none transition placeholder:text-zwey-muted focus:border-zwey-violet focus:ring-4 focus:ring-zwey-violet/10 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          disabled={disabled}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          title={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-lg transition hover:bg-zwey-elevated disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleEmailSignup = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password || !confirmPassword) {
      setError("Complete all fields to create your account.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Your password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/onboarding");
    } catch (authError) {
      setError(getZweyErrorMessage(authError, "sign-up"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      await signInWithPopup(auth, provider);

      router.replace("/onboarding");
    } catch (authError) {
      setError(getGoogleErrorMessage(authError));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zwey-bg px-4 py-8 text-zwey-text sm:px-6">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md items-center">
        <Card className="w-full p-5 sm:p-7">
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-zwey-violetBright"
            >
              Zwey
            </Link>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight">
              Create your account
            </h1>

            <p className="mt-2 text-sm leading-6 text-zwey-muted">
              Join Zwey and create your public artist identity.
            </p>
          </div>

          {error ? (
            <div className="mb-5">
              <Alert variant="error">{error}</Alert>
            </div>
          ) : null}

          <Button
            type="button"
            variant="secondary"
            size="lg"
            fullWidth
            loading={googleLoading}
            disabled={loading}
            onClick={handleGoogleSignup}
          >
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zwey-border" />
            <span className="text-xs uppercase tracking-[0.16em] text-zwey-muted">
              or email
            </span>
            <div className="h-px flex-1 bg-zwey-border" />
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={loading || googleLoading}
            />

            <PasswordField
              id="signup-password"
              label="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              disabled={loading || googleLoading}
            />

            <PasswordField
              id="signup-confirm-password"
              label="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              placeholder="Enter your password again"
              disabled={loading || googleLoading}
            />

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={loading}
              disabled={googleLoading}
            >
              Create account
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-zwey-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-zwey-violetBright hover:text-zwey-text"
            >
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
            }
