"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

const GENRES = [
  "Hip-Hop",
  "Afrobeats",
  "Trap",
  "R&B",
  "Drill",
  "Soul",
  "Electronic",
  "Reggae",
  "Pop",
  "Other",
];

function getFirestoreErrorMessage(error) {
  switch (error?.code) {
    case "permission-denied":
      return "Zwey couldn't save your profile because the database denied the request. Make sure the latest Firestore Rules have been published.";

    case "unavailable":
      return "Zwey couldn't reach the database. Check your connection and try again.";

    case "failed-precondition":
      return "Zwey couldn't complete the database operation. Please try again.";

    case "network-request-failed":
      return "Network error. Check your connection and try again.";

    default:
      return "We couldn't complete your profile setup. Please try again.";
  }
}

export default function Onboarding() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [initializing, setInitializing] = useState(true);
  const [saving, setSaving] = useState(false);

  const [artistName, setArtistName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [genre, setGenre] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [bandlabUrl, setBandlabUrl] = useState("");
  const [rapchatUrl, setRapchatUrl] = useState("");
  const [picUrl, setPicUrl] = useState("");

  const [currentProfileId, setCurrentProfileId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function loadExistingProfile() {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
          if (!cancelled) {
            setError(
              "Your account record could not be found. Please log out and sign in again."
            );
          }
          return;
        }

        const userData = userSnapshot.data();

        const profileId =
          userData.artistProfileId ||
          userData.username ||
          "";

        if (profileId) {
          const profileRef = doc(
            db,
            "artistProfiles",
            profileId
          );

          const profileSnapshot = await getDoc(profileRef);

          if (profileSnapshot.exists()) {
            const profileData = profileSnapshot.data();

            if (!cancelled) {
              setCurrentProfileId(profileId);
              setArtistName(profileData.artistName || "");
              setUsername(profileData.username || profileId);
              setBio(profileData.bio || "");
              setGenre(profileData.genre || "");
              setSpotifyUrl(profileData.spotifyUrl || "");
              setBandlabUrl(profileData.bandlabUrl || "");
              setRapchatUrl(profileData.rapchatUrl || "");
              setPicUrl(profileData.pic_url || "");
            }

            return;
          }

          /*
           * Legacy compatibility:
           * Older Zwey versions stored public profile fields directly
           * inside users/{uid}. Use those values to prefill the new model.
           */
          if (!cancelled) {
            setArtistName(userData.artistName || "");
            setUsername(userData.username || profileId);
            setBio(userData.bio || "");
            setGenre(userData.genre || "");
            setSpotifyUrl(userData.spotifyUrl || "");
            setBandlabUrl(userData.bandlabUrl || "");
            setRapchatUrl(userData.rapchatUrl || "");
            setPicUrl(userData.pic_url || "");
          }

          return;
        }

        if (!cancelled) {
          setArtistName(userData.artistName || "");
          setUsername(userData.username || "");
          setBio(userData.bio || "");
          setGenre(userData.genre || "");
          setSpotifyUrl(userData.spotifyUrl || "");
          setBandlabUrl(userData.bandlabUrl || "");
          setRapchatUrl(userData.rapchatUrl || "");
          setPicUrl(userData.pic_url || "");
        }
      } catch (err) {
        console.error("Onboarding profile load error:", err);

        if (!cancelled) {
          setError(
            "We couldn't load your profile data. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    loadExistingProfile();

    return () => {
      cancelled = true;
    };
  }, [loading, user, router]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setError("");

    const normalizedUsername = username
      .trim()
      .toLowerCase();

    const normalizedArtistName = artistName.trim();

    if (!normalizedArtistName) {
      setError("Artist name is required.");
      return;
    }

    if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
      setError(
        "Username must be 3–30 characters and contain only letters, numbers, or underscores."
      );
      return;
    }

    if (!genre) {
      setError("Please select a genre.");
      return;
    }

    setSaving(true);

    try {
      const userRef = doc(db, "users", user.uid);
      const newProfileRef = doc(
        db,
        "artistProfiles",
        normalizedUsername
      );

      const batch = writeBatch(db);

      const profileData = {
        uid: user.uid,
        username: normalizedUsername,
        artistName: normalizedArtistName,
        genre,
        bio: bio.trim(),
        spotifyUrl: spotifyUrl.trim(),
        bandlabUrl: bandlabUrl.trim(),
        rapchatUrl: rapchatUrl.trim(),
        pic_url: picUrl.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      batch.set(newProfileRef, profileData, {
        merge: true,
      });

      if (
        currentProfileId &&
        currentProfileId !== normalizedUsername
      ) {
        const oldProfileRef = doc(
          db,
          "artistProfiles",
          currentProfileId
        );

        const oldProfileSnapshot =
          await getDoc(oldProfileRef);

        if (oldProfileSnapshot.exists()) {
          batch.delete(oldProfileRef);
        }
      }

      batch.update(userRef, {
        profileCompleted: true,
        artistProfileId: normalizedUsername,
        updatedAt: serverTimestamp(),
      });

      await batch.commit();

      router.replace("/dashboard");
    } catch (err) {
      console.error(
        "Onboarding profile save error:",
        err
      );

      setError(getFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading || initializing) {
    return (
      <div className="min-h-screen bg-[#08080B] px-6 flex items-center justify-center text-[#F5F5F7]">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#272731] border-t-[#8B5CF6]"
            aria-hidden="true"
          />

          <p className="text-sm font-medium">
            Preparing your artist profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#08080B] px-4 py-8 text-[#F5F5F7] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-[#A78BFA] uppercase">
              Zwey
            </p>

            <p className="mt-1 text-sm text-[#A1A1AA]">
              Artist identity
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="rounded-lg border border-[#272731] px-4 py-2 text-sm font-medium text-[#A1A1AA] transition hover:border-[#8B5CF6] hover:text-[#F5F5F7]"
          >
            Log out
          </button>
        </div>

        <section className="rounded-2xl border border-[#272731] bg-[#111116] p-6 shadow-2xl sm:p-8">
          <div className="mb-8">
            <div className="mb-4 inline-flex rounded-full border border-[#7C3AED]/40 bg-[#7C3AED]/10 px-3 py-1 text-xs font-medium text-[#A78BFA]">
              {currentProfileId
                ? "Edit artist profile"
                : "Create artist profile"}
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Build your artist identity.
            </h1>

            <p className="mt-3 max-w-xl leading-6 text-[#A1A1AA]">
              Your artist profile is the public identity people will
              discover on Zwey.
            </p>
          </div>

          {error && (
            <div
              className="mb-6 rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm leading-6 text-[#FCA5A5]"
              role="alert"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="artistName"
                className="mb-2 block text-sm font-medium"
              >
                Artist name
              </label>

              <input
                id="artistName"
                type="text"
                value={artistName}
                onChange={(event) =>
                  setArtistName(event.target.value)
                }
                placeholder="Your artist name"
                className="w-full rounded-xl border border-[#272731] bg-[#18181F] px-4 py-3 text-[#F5F5F7] outline-none transition placeholder:text-[#71717A] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
                required
                autoComplete="name"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium"
              >
                Username
              </label>

              <div className="flex overflow-hidden rounded-xl border border-[#272731] bg-[#18181F] focus-within:border-[#8B5CF6] focus-within:ring-2 focus-within:ring-[#8B5CF6]/20">
                <span className="flex items-center pl-4 text-[#71717A]">
                  @
                </span>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target.value
                        .toLowerCase()
                        .replace(/\s/g, "")
                    )
                  }
                  placeholder="yourname"
                  className="min-w-0 flex-1 bg-transparent px-2 py-3 text-[#F5F5F7] outline-none placeholder:text-[#71717A]"
                  required
                  minLength={3}
                  maxLength={30}
                  autoComplete="username"
                />
              </div>

              <p className="mt-2 text-xs text-[#71717A]">
                3–30 characters. Letters, numbers, and underscores only.
              </p>
            </div>

            <div>
              <label
                htmlFor="genre"
                className="mb-2 block text-sm font-medium"
              >
                Genre
              </label>

              <select
                id="genre"
                value={genre}
                onChange={(event) =>
                  setGenre(event.target.value)
                }
                className="w-full rounded-xl border border-[#272731] bg-[#18181F] px-4 py-3 text-[#F5F5F7] outline-none transition focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
                required
              >
                <option value="" disabled>
                  Select your genre
                </option>

                {GENRES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="bio"
                className="mb-2 block text-sm font-medium"
              >
                Short bio
              </label>

              <textarea
                id="bio"
                value={bio}
                onChange={(event) =>
                  setBio(event.target.value)
                }
                placeholder="Tell people a little about your sound."
                className="min-h-[130px] w-full resize-y rounded-xl border border-[#272731] bg-[#18181F] px-4 py-3 text-[#F5F5F7] outline-none transition placeholder:text-[#71717A] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
                maxLength={300}
              />

              <p className="mt-2 text-right text-xs text-[#71717A]">
                {bio.length}/300
              </p>
            </div>

            <div className="border-t border-[#272731] pt-6">
              <div className="mb-4">
                <h2 className="font-semibold">
                  Music links
                </h2>

                <p className="mt-1 text-sm text-[#A1A1AA]">
                  Connect people to where your music already lives.
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="url"
                  value={spotifyUrl}
                  onChange={(event) =>
                    setSpotifyUrl(event.target.value)
                  }
                  placeholder="Spotify URL"
                  className="w-full rounded-xl border border-[#272731] bg-[#18181F] px-4 py-3 text-[#F5F5F7] outline-none transition placeholder:text-[#71717A] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
                />

                <input
                  type="url"
                  value={bandlabUrl}
                  onChange={(event) =>
                    setBandlabUrl(event.target.value)
                  }
                  placeholder="BandLab URL"
                  className="w-full rounded-xl border border-[#272731] bg-[#18181F] px-4 py-3 text-[#F5F5F7] outline-none transition placeholder:text-[#71717A] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
                />

                <input
                  type="url"
                  value={rapchatUrl}
                  onChange={(event) =>
                    setRapchatUrl(event.target.value)
                  }
                  placeholder="Rapchat URL"
                  className="w-full rounded-xl border border-[#272731] bg-[#18181F] px-4 py-3 text-[#F5F5F7] outline-none transition placeholder:text-[#71717A] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
                />

                <input
                  type="url"
                  value={picUrl}
                  onChange={(event) =>
                    setPicUrl(event.target.value)
                  }
                  placeholder="Profile image URL"
                  className="w-full rounded-xl border border-[#272731] bg-[#18181F] px-4 py-3 text-[#F5F5F7] outline-none transition placeholder:text-[#71717A] focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-[#8B5CF6] px-5 py-3.5 font-semibold text-white transition hover:bg-[#7C3AED] focus:outline-none focus:ring-2 focus:ring-[#A78BFA] focus:ring-offset-2 focus:ring-offset-[#111116] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving profile..."
                : currentProfileId
                  ? "Save Changes"
                  : "Create Artist Profile"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
        }
