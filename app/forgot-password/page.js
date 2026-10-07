"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { getZweyErrorMessage } from "../../lib/errors";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import Card from "../../components/ui/Card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSent(false);

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (authError) {
      setError(getZweyErrorMessage(authError, "password-reset"));
    } finally {
      setLoading(false);
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
              Reset your password
            </h1>

            <p className="mt-2 text-sm leading-6 text-zwey-muted">
              Enter the email address associated with your Zwey account.
            </p>
          </div>

          {error ? (
            <div className="mb-5">
              <Alert variant="error">{error}</Alert>
            </div>
          ) : null}

          {sent ? (
            <div className="mb-5">
              <Alert variant="success">
                If an account exists for that email, we&apos;ll send password
                reset instructions.
              </Alert>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={loading}
            />

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={loading}
            >
              Send reset instructions
            </Button>
          </form>

          <div className="mt-7 text-center text-sm">
            <Link
              href="/login"
              className="font-medium text-zwey-violetBright hover:text-zwey-text"
            >
              Back to sign in
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
                }
