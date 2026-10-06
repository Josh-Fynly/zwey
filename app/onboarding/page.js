"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  deleteField,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../../lib/firebase";

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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getFirestoreErrorMessage(error) {
  switch (error?.code) {
    case "permission-denied":
      return "Zwey could not save your profile because the database denied the request. Confirm that the latest Firestore Rules are published.";

    case "unavailable":
      return "Zwey could not reach the database. Check your connection and try again.";

    case "failed-precondition":
      return "Zwey could not complete the database operation. Please try again.";

    case "network-request-failed":
      return "Network error. Check your connection and try again.";

    default:
      return "We could not complete your profile setup. Please try again.";
  }
}

export default function Onboarding() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");

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
  const [picStoragePath, setPicStoragePath] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

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
          userData.username ||
          userData.artistProfileId ||
          "";

        if (!profileId) {
          return;
        }

        const profileRef = doc(
          db,
          "artistProfiles",
          profileId
        );

        const profileSnapshot = await getDoc(profileRef);

        if (!profileSnapshot.exists()) {
          if (!cancelled) {
            setArtistName(userData.artistName || "");
            setUsername(userData.username || "");
          }
          return;
        }

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
          setPicUrl(
            profileData.picUrl ||
              profileData.pic_url ||
              ""
          );
          setPicStoragePath(
            profileData.picStoragePath || ""
          );
        }
      } catch (err) {
        console.error(
          "Onboarding profile load error:",
          err
        );

        if (!cancelled) {
          setError(
            "We could not load your profile data. Please try again."
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

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Profile images must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);

    previewUrlRef.current = previewUrl;

    setSelectedImage(file);
    setPicUrl(previewUrl);
  }

  function removeImage() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setSelectedImage(null);
    setPicUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function uploadProfileImage(file) {
    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "") || "jpg";

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const storagePath =
      `profile-images/${user.uid}/${fileName}`;

    const storageRef = ref(storage, storagePath);

    await uploadBytes(storageRef, file, {
      contentType: file.type,
      cacheControl: "public,max-age=31536000",
    });

    const downloadUrl =
      await getDownloadURL(storageRef);

    return {
      downloadUrl,
      storagePath,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    setError("");

    const normalizedUsername = username
      .trim()
      .toLowerCase();

    const normalizedArtistName =
      artistName.trim();

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

    let uploadedStoragePath = "";
    let uploadedDownloadUrl = "";

    try {
      if (selectedImage) {
        const uploaded =
          await uploadProfileImage(selectedImage);

        uploadedStoragePath =
          uploaded.storagePath;

        uploadedDownloadUrl =
          uploaded.downloadUrl;
      }

      const userRef = doc(db, "users", user.uid);

      const newProfileRef = doc(
        db,
        "artistProfiles",
        normalizedUsername
      );

      const result =
        await runTransaction(db, async (transaction) => {
          const userSnapshot =
            await transaction.get(userRef);

          if (!userSnapshot.exists()) {
            throw new Error("ACCOUNT_NOT_FOUND");
          }

          const userData = userSnapshot.data();

          const newProfileSnapshot =
            await transaction.get(newProfileRef);

          let oldProfileSnapshot = null;

          if (
            currentProfileId &&
            currentProfileId !== normalizedUsername
          ) {
            const oldProfileRef = doc(
              db,
              "artistProfiles",
              currentProfileId
            );

            oldProfileSnapshot =
              await transaction.get(oldProfileRef);
          }

          if (
            newProfileSnapshot.exists() &&
            newProfileSnapshot.data().uid !== user.uid
          ) {
            throw new Error("USERNAME_TAKEN");
          }

          const existingProfile =
            newProfileSnapshot.exists()
              ? newProfileSnapshot.data()
              : {};

          const finalPicUrl =
            uploadedDownloadUrl ||
            (selectedImage === null && !picUrl
              ? ""
              : picUrl);

          const finalPicStoragePath =
            uploadedStoragePath ||
            (selectedImage === null && !picUrl
              ? ""
              : picStoragePath);

          const profileData = {
            uid: user.uid,
            username: normalizedUsername,
            artistName: normalizedArtistName,
            genre,
            bio: bio.trim(),
            spotifyUrl: spotifyUrl.trim(),
            bandlabUrl: bandlabUrl.trim(),
            rapchatUrl: rapchatUrl.trim(),
            picUrl: finalPicUrl,
            picStoragePath: finalPicStoragePath,
            createdAt:
              existingProfile.createdAt ||
              serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          transaction.set(
            newProfileRef,
            profileData,
            { merge: true }
          );

          if (
            oldProfileSnapshot?.exists() &&
            oldProfileSnapshot.data().uid === user.uid
          ) {
            transaction.delete(
              oldProfileSnapshot.ref
            );
          }

          transaction.update(userRef, {
            username: normalizedUsername,
            artistName: normalizedArtistName,
            profileCompleted: true,
            updatedAt: serverTimestamp(),
            artistProfileId: deleteField(),
            bio: deleteField(),
            genre: deleteField(),
            spotifyUrl: deleteField(),
            bandlabUrl: deleteField(),
            rapchatUrl: deleteField(),
            pic_url: deleteField(),
            picUrl: deleteField(),
          });

          return {
            previousPicStoragePath:
              existingProfile.picStoragePath ||
              picStoragePath ||
              "",
            finalPicStoragePath,
          };
        });

      if (
        result.previousPicStoragePath &&
        result.previousPicStoragePath !==
          result.finalPicStoragePath
      ) {
        try {
          await deleteObject(
            ref(
              storage,
              result.previousPicStoragePath
            )
          );
        } catch (cleanupError) {
          console.error(
            "Previous profile image cleanup failed:",
            cleanupError
          );
        }
      }

      router.replace("/dashboard");
    } catch (err) {
      console.error(
        "Onboarding profile save error:",
        err
      );

      if (
        uploadedStoragePath &&
        uploadedStoragePath !== picStoragePath
      ) {
        try {
          await deleteObject(
            ref(storage, uploadedStoragePath)
          );
        } catch (cleanupError) {
          console.error(
            "Uploaded profile image cleanup failed:",
            cleanupError
          );
        }
      }

      if (err?.message === "USERNAME_TAKEN") {
        setError(
          "That username is already in use. Choose another username."
        );
      } else if (
        err?.message === "ACCOUNT_NOT_FOUND"
      ) {
        setError(
          "Your account record could not be found. Please log out and sign in again."
        );
      } else {
        setError(
          getFirestoreErrorMessage(err)
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || initializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080B] px-6 text-[#F5F5F7]">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#272731] border-t-[#8B5CF6]"
            aria-hidden="true"
          />

          <p className="text-sm text-[#A1A1AA]">
            Preparing your artist profile...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const displayImage =
    picUrl && picUrl.startsWith("blob:")
      ? picUrl
      : picUrl;

  const initials =
    artistName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ZW";

  return (
    <main className="min-h-screen bg-[#08080B] px-4 py-6 text-[#F5F5F7] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#A78BFA]">
              Zwey
            </p>

            <p className="mt-1 text-sm text-[#71717A]">
              Artist identity
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="rounded-xl border border-[#272731] bg-[#111116] px-4 py-2.5 text-sm font-medium text-[#A1A1AA] transition hover:border-[#8B5CF6]/60 hover:text-[#F5F5F7]"
          >
            Log out
          </button>
        </header>

        <section className="overflow-hidden rounded-3xl border border-[#272731] bg-[#111116] shadow-2xl shadow-black/30">
          <div className="border-b border-[#272731] px-6 py-8 sm:px-10">
            <div className="inline-flex rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-3 py-1 text-xs font-semibold text-[#A78BFA]">
              {currentProfileId
                ? "Edit artist profile"
                : "Create artist profile"}
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Build your artist identity.
            </h1>

            <p className="mt-3 max-w-2xl leading-7 text-[#A1A1AA]">
              Create the identity other artists, producers,
              collaborators and fans will discover on Zwey.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-8 px-6 py-8 sm:px-10"
          >
            {error && (
              <div
                className="rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3.5 text-sm leading-6 text-[#FCA5A5]"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="grid gap-8 sm:grid-cols-[160px_1fr] sm:items-start">
              <div className="flex flex-col items-center">
                <div className="relative">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt="Profile preview"
                      className="h-36 w-36 rounded-full border border-[#272731] object-cover ring-4 ring-[#8B5CF6]/10"
                    />
                  ) : (
                    <div className="flex h-36 w-36 items-center justify-center rounded-full border border-[#272731] bg-[#18181F] text-3xl font-bold text-[#A78BFA] ring-4 ring-[#8B5CF6]/10">
                      {initials}
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="mt-4 rounded-xl border border-[#272731] bg-[#18181F] px-4 py-2.5 text-sm font-semibold transition hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/10"
                >
                  {displayImage
                    ? "Change image"
                    : "Upload image"}
                </button>

                {displayImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-2 text-xs font-medium text-[#71717A] transition hover:text-[#FCA5A5]"
                  >
                    Remove image
                  </button>
                )}

                <p className="mt-3 text-center text-xs leading-5 text-[#71717A]">
                  JPG, PNG, WEBP or other image formats
                  up to 5 MB.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="artistName"
                    className="mb-2 block text-sm font-semibold"
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
                    className="w-full rounded-xl border border-[#272731] bg-[#18181F] px-4 py-3.5 text-[#F5F5F7] outline-none transition placeholder:text-[#52525B] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10"
                    required
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Username
                  </label>

                  <div className="flex overflow-hidden rounded-xl border border-[#272731] bg-[#18181F] transition focus-within:border-[#8B5CF6] focus-within:ring-4 focus-within:ring-[#8B5CF6]/10">
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
                            .replace(/[^a-z0-9_]/g, "")
                        )
                      }
                      placeholder="yourname"
                      className="min-w-0 flex-1 bg-transparent px-2 py-3.5 text-[#F5F5F7] outline-none placeholder:text-[#52525B]"
                      required
                      minLength={3}
                      maxLength={30}
                      autoComplete="username"
                    />
                  </div>

                  <p className="mt-2 text-xs text-[#71717A]">
                    3–30 characters. Letters, numbers and
                    underscores only.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="genre"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Genre
                  </label>

                  <select
                    id="genre"
                    value={genre}
                    onChange={(event) =>
                      setGenre(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-[#272731] bg-[#18181F] px-4 py-3.5 text-[#F5F5F7] outline-none transition focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10"
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
<div className="mb-2 flex items-center justify-between">
<label htmlFor="bio" className="block text-sm font-semibold">
Short bio
</label>
<span className="text-xs text-[#71717A]">
{bio.length}/300
</span>
</div>

<textarea
id="bio"
value={bio}
onChange={(event) => setBio(event.target.value)}
placeholder="Tell people a little about your sound."
className="min-h-[140px] w-full resize-y rounded-xl border border-[#272731] bg-[#18181F] px-4 py-3.5 text-[#F5F5F7] outline-none transition placeholder:text-[#52525B] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10"
maxLength={300}
/>
</div>
</div>
</div>

<div className="border-t border-[#272731] pt-8">
<div className="mb-5">
<h2 className="text-lg font-bold">
Music links
</h2>
<p className="mt-1 text-sm leading-6 text-[#A1A1AA]">
Connect people to where your music already lives.
</p>
</div>

<div className="grid gap-4">
<input
type="url"
value={spotifyUrl}
onChange={(event) => setSpotifyUrl(event.target.value)}
placeholder="Spotify URL"
className="w-full rounded-xl border border-[#272731] bg-[#18181F] px-4 py-3.5 text-[#F5F5F7] outline-none transition placeholder:text-[#52525B] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10"
/>

<input
type="url"
value={bandlabUrl}
onChange={(event) => setBandlabUrl(event.target.value)}
placeholder="BandLab URL"
className="w-full rounded-xl border border-[#272731] bg-[#18181F] px-4 py-3.5 text-[#F5F5F7] outline-none transition placeholder:text-[#52525B] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10"
/>

<input
type="url"
value={rapchatUrl}
onChange={(event) => setRapchatUrl(event.target.value)}
placeholder="Rapchat URL"
className="w-full rounded-xl border border-[#272731] bg-[#18181F] px-4 py-3.5 text-[#F5F5F7] outline-none transition placeholder:text-[#52525B] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10"
/>
</div>
</div>

<div className="border-t border-[#272731] pt-8">
<button
type="submit"
disabled={saving}
className="w-full rounded-xl bg-[#8B5CF6] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-[#8B5CF6]/10 transition hover:bg-[#7C3AED] focus:outline-none focus:ring-4 focus:ring-[#8B5CF6]/20 disabled:cursor-not-allowed disabled:opacity-50"
>
{saving ? "Saving profile..." : currentProfileId ? "Save Changes" : "Create Artist Profile"}
</button>
</div>
</form>
</section>
</div>
</main>
);
}
