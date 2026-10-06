"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

function getProfileErrorMessage(error) {
  switch (error?.code) {
    case "permission-denied":
      return "Zwey could not access your account data. Please check the Firestore Rules.";

    case "unavailable":
      return "Zwey is temporarily unable to reach the database. Check your connection and try again.";

    case "unauthenticated":
      return "Your session is no longer valid. Please log in again.";

    default:
      return "We couldn't load your dashboard right now. Please try again.";
  }
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Dashboard() {
  const {
    user,
    loading: authLoading,
    logout,
  } = useAuth();

  const router = useRouter();

  const [account, setAccount] = useState(null);
  const [artist, setArtist] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function loadDashboard() {
      setLoadingProfile(true);
      setProfileError("");

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (cancelled) return;

        if (!userSnapshot.exists()) {
          setProfileError(
            "Your Zwey account record could not be found."
          );
          return;
        }

        const accountData = userSnapshot.data();

        if (!accountData.profileCompleted) {
          router.replace("/onboarding");
          return;
        }

        const username =
          accountData.username ||
          accountData.artistProfileId;

        if (!username) {
          router.replace("/onboarding");
          return;
        }

        const artistRef = doc(
          db,
          "artistProfiles",
          username
        );

        const artistSnapshot = await getDoc(artistRef);

        if (cancelled) return;

        if (!artistSnapshot.exists()) {
          setProfileError(
            "Your artist profile could not be found. Please complete your profile again."
          );
          return;
        }

        const artistData = artistSnapshot.data();

        if (artistData.uid !== user.uid) {
          setProfileError(
            "Your artist profile ownership could not be verified."
          );
          return;
        }

        setAccount(accountData);
        setArtist(artistData);
      } catch (err) {
        console.error("Dashboard load error:", err);

        if (!cancelled) {
          setProfileError(
            getProfileErrorMessage(err)
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  if (authLoading || loadingProfile) {
    return (
      <main className="min-h-screen bg-[#08080B] flex items-center justify-center px-6 text-[#F5F5F7]">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#272731] border-t-[#8B5CF6]"
            aria-hidden="true"
          />
          <p className="text-sm font-medium">
            Loading your studio...
          </p>
        </div>
      </main>
    );
  }

  if (profileError) {
    return (
      <main className="min-h-screen bg-[#08080B] flex items-center justify-center px-6 text-[#F5F5F7]">
        <div className="w-full max-w-md rounded-2xl border border-[#272731] bg-[#111116] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EF4444]/10 text-xl font-bold text-[#EF4444]">
            !
          </div>

          <h1 className="mt-5 text-2xl font-bold">
            Dashboard unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#A1A1AA]">
            {profileError}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 rounded-xl bg-[#8B5CF6] px-4 py-3 font-semibold transition hover:bg-[#7C3AED]"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="flex-1 rounded-xl border border-[#272731] px-4 py-3 font-semibold text-[#A1A1AA] transition hover:border-[#8B5CF6] hover:text-[#F5F5F7]"
            >
              Log Out
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!user || !account || !artist) {
    return null;
  }

  const profileImage =
    artist.picUrl || artist.pic_url || "";

  return (
    <main className="min-h-screen bg-[#08080B] text-[#F5F5F7]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-[#272731] pb-5">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-[#A78BFA] uppercase">
              Zwey
            </p>

            <p className="mt-1 text-sm text-[#71717A]">
              Artist studio
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-[#272731] px-4 py-2 text-sm font-medium text-[#A1A1AA] transition hover:border-[#EF4444]/50 hover:text-[#F5F5F7]"
          >
            Log out
          </button>
        </header>

        <section className="mt-8 rounded-2xl border border-[#272731] bg-[#111116] p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={artist.artistName}
                  className="h-20 w-20 rounded-full border border-[#272731] object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#18181F] text-xl font-bold text-[#A78BFA] ring-1 ring-[#7C3AED]/40">
                  {getInitials(artist.artistName)}
                </div>
              )}

              <div>
                <p className="text-sm text-[#A1A1AA]">
                  Welcome back
                </p>

                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  {artist.artistName}
                </h1>

                <p className="mt-1 text-[#71717A]">
                  @{artist.username}
                </p>
              </div>
            </div>

            {artist.genre && (
              <span className="w-fit rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1 text-sm font-medium text-[#A78BFA]">
                {artist.genre}
              </span>
            )}
          </div>

          {artist.bio && (
            <div className="mt-8 rounded-xl border border-[#272731] bg-[#18181F] p-5">
              <p className="text-sm font-medium text-[#A1A1AA]">
                Bio
              </p>

              <p className="mt-2 leading-7 text-[#F5F5F7]">
                {artist.bio}
              </p>
            </div>
          )}

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-[#272731] bg-[#18181F] p-5">
              <p className="text-sm text-[#71717A]">
                Account email
              </p>

              <p className="mt-2 break-all font-medium">
                {user.email}
              </p>
            </div>

            <div className="rounded-xl border border-[#272731] bg-[#18181F] p-5">
              <p className="text-sm text-[#71717A]">
                Profile status
              </p>

              <p className="mt-2 flex items-center gap-2 font-medium text-[#22C55E]">
                <span className="h-2 w-2 rounded-full bg-[#22C55E]" />
                Published
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                router.push(`/u/${artist.username}`)
              }
              className="flex-1 rounded-xl bg-[#8B5CF6] py-3.5 font-semibold transition hover:bg-[#7C3AED]"
            >
              View Public Profile
            </button>

            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="flex-1 rounded-xl border border-[#272731] py-3.5 font-semibold text-[#A1A1AA] transition hover:border-[#8B5CF6] hover:text-[#F5F5F7]"
            >
              Edit Profile
            </button>
          </div>
        </section>
      </div>
    </main>
  );
      }
