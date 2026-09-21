"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

function getProfileErrorMessage(error) {
  switch (error?.code) {
    case "permission-denied":
      return "Zwey could not access your profile. Please check your account permissions.";

    case "unavailable":
      return "Zwey is temporarily unable to reach the database. Check your connection and try again.";

    case "failed-precondition":
      return "Zwey could not complete the database request. Please try again.";

    case "unauthenticated":
      return "Your session is no longer valid. Please log in again.";

    default:
      return "We couldn't load your dashboard right now. Please try again.";
  }
}

export default function Dashboard() {
  const {
    user,
    loading: authLoading,
    logout,
  } = useAuth();

  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/signup");
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      setLoadingProfile(true);
      setProfileError("");

      try {
        const profileRef = doc(db, "users", user.uid);
        const profileSnapshot = await getDoc(profileRef);

        if (cancelled) return;

        if (!profileSnapshot.exists()) {
          router.replace("/onboarding");
          return;
        }

        const profileData = profileSnapshot.data();

        if (!profileData.profileCompleted) {
          router.replace("/onboarding");
          return;
        }

        setProfile(profileData);
      } catch (err) {
        console.error("Dashboard profile load error:", err);

        if (!cancelled) {
          setProfileError(getProfileErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black"
            aria-hidden="true"
          />

          <p className="text-sm font-medium text-gray-700">
            Loading dashboard...
          </p>

          <p className="mt-1 text-sm text-gray-500">
            Please wait a moment.
          </p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-xl border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            !
          </div>

          <h1 className="mt-4 text-xl font-bold text-gray-900">
            Dashboard unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            {profileError}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 rounded-lg bg-black px-4 py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900">
            Dashboard unavailable
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            We couldn't find the profile needed for this dashboard.
          </p>

          <button
            type="button"
            onClick={() => router.replace("/onboarding")}
            className="mt-5 rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  const publicProfileUrl = `/u/${profile.username}`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Zwey Dashboard
              </p>

              <h1 className="mt-1 text-3xl font-bold">
                Welcome, {profile.artistName}
              </h1>

              <p className="mt-1 text-gray-500">
                @{profile.username}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-5">
              <p className="text-sm text-gray-500">
                Genre
              </p>

              <p className="mt-1 font-semibold">
                {profile.genre}
              </p>
            </div>

            <div className="rounded-lg border p-5">
              <p className="text-sm text-gray-500">
                Account email
              </p>

              <p className="mt-1 break-all font-semibold">
                {user.email}
              </p>
            </div>
          </div>

          {profile.bio && (
            <div className="mt-6 rounded-lg border p-5">
              <p className="text-sm text-gray-500">
                Bio
              </p>

              <p className="mt-2 text-gray-700">
                {profile.bio}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => router.push(publicProfileUrl)}
              className="flex-1 rounded-lg bg-black py-3 font-semibold text-white transition hover:bg-gray-800"
            >
              View Public Profile
            </button>

            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="flex-1 rounded-lg border border-gray-300 py-3 font-semibold transition hover:bg-gray-50"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
            }
