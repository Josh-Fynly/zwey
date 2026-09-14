"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../../lib/firebase";

export default function Dashboard() {
  const {
    user,
    loading: authLoading,
    logout,
  } = useAuth();

  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] =
    useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/signup");
      return;
    }

    async function loadProfile() {
      try {
        const profileRef = doc(
          db,
          "users",
          user.uid
        );

        const profileSnapshot =
          await getDoc(profileRef);

        if (!profileSnapshot.exists()) {
          router.push("/onboarding");
          return;
        }

        const profileData =
          profileSnapshot.data();

        if (!profileData.profileCompleted) {
          router.push("/onboarding");
          return;
        }

        setProfile(profileData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [user, authLoading, router]);

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const publicProfileUrl =
    `/u/${profile.username}`;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-xl shadow-sm border p-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <p className="text-sm text-gray-500">
                Zwey Dashboard
              </p>

              <h1 className="text-3xl font-bold mt-1">
                Welcome, {profile.artistName}
              </h1>

              <p className="text-gray-500 mt-1">
                @{profile.username}
              </p>
            </div>

            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Logout
            </button>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">

            <div className="border rounded-lg p-5">
              <p className="text-sm text-gray-500">
                Genre
              </p>

              <p className="font-semibold mt-1">
                {profile.genre}
              </p>
            </div>

            <div className="border rounded-lg p-5">
              <p className="text-sm text-gray-500">
                Account email
              </p>

              <p className="font-semibold mt-1 break-all">
                {user.email}
              </p>
            </div>

          </div>

          {profile.bio && (
            <div className="mt-6 border rounded-lg p-5">
              <p className="text-sm text-gray-500">
                Bio
              </p>

              <p className="mt-2 text-gray-700">
                {profile.bio}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">

            <button
              onClick={() =>
                router.push(publicProfileUrl)
              }
              className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-semibold"
            >
              View Public Profile
            </button>

            <button
              onClick={() =>
                router.push("/onboarding")
              }
              className="flex-1 border border-gray-300 hover:bg-gray-50 py-3 rounded-lg font-semibold"
            >
              Edit Profile
            </button>

          </div>

        </div>

      </div>
    </div>
  );
    }
