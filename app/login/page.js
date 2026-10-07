"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { getZweyErrorMessage } from "../../lib/errors";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const continueAfterAuthentication = async (user) => {
    const userSnapshot = await getDoc(doc(db, "users", user.uid));

    if (!userSnapshot.exists()) {
      router.replace("/onboarding");
      return;
    }

    const userData = userSnapshot.data();

    if (userData.profileCompleted === true) {
      router.replace("/dashboard");
      return;
    }

    router.replace("/onboarding");
  };

  const handleEmailSignIn = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email address and password.");
      return;
    }

    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await continueAfterAuthentication(credential.user);
    } catch (authError) {
      setError(getZweyErrorMessage(authError, "sign-in"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const credential = await signInWithPopup(auth, provider);

      await continueAfterAuthentication(credential.user);
    } catch (authError) {
      setError(getZweyErrorMessage(authError, "google-sign-in"));
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
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-6 text-zwey-muted">
              Sign in to continue building your artist presence.
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
            onClick={handleGoogleSignIn}
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

          <form onSubmit={handleEmailSignIn} className="space-y-5">
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

            <div>
              <Input
                label="Password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                disabled={loading || googleLoading}
              />

              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-zwey-violetBright hover:text-zwey-text"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={loading}
              disabled={googleLoading}
            >
              Sign in
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-zwey-muted">
            New to Zwey?{" "}
            <Link
              href="/signup"
              className="font-medium text-zwey-violetBright hover:text-zwey-text"
            >
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
              }
