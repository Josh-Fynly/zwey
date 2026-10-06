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
import {
  getZweyErrorMessage,
  logZweyError,
} from "../../lib/errors";

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
  const [picStoragePath, setPicStoragePath] =
    useState("");
  const [selectedImage, setSelectedImage] =
    useState(null);

  const [currentProfileId, setCurrentProfileId] =
    useState("");
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
        const userSnapshot =
          await getDoc(userRef);

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

        if (!profileId) return;

        const profileRef = doc(
          db,
          "artistProfiles",
          profileId
        );

        const profileSnapshot =
          await getDoc(profileRef);

        if (!profileSnapshot.exists()) {
          if (!cancelled) {
            setArtistName(
              userData.artistName || ""
            );
            setUsername(
              userData.username || ""
            );
          }
          return;
        }

        const profileData =
          profileSnapshot.data();

        if (!cancelled) {
          setCurrentProfileId(profileId);
          setArtistName(
            profileData.artistName || ""
          );
          setUsername(
            profileData.username || profileId
          );
          setBio(profileData.bio || "");
          setGenre(profileData.genre || "");
          setSpotifyUrl(
            profileData.spotifyUrl || ""
          );
          setBandlabUrl(
            profileData.bandlabUrl || ""
          );
          setRapchatUrl(
            profileData.rapchatUrl || ""
          );
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
        logZweyError(
          "onboarding.profile_load",
          err
        );

        if (!cancelled) {
          setError(
            getZweyErrorMessage(
              err,
              "profile-load"
            )
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
        URL.revokeObjectURL(
          previewUrlRef.current
        );
      }
    };
  }, []);

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError(
        "Please choose an image file."
      );
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(
        "Profile images must be 5 MB or smaller."
      );
      event.target.value = "";
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );
    }

    const previewUrl =
      URL.createObjectURL(file);

    previewUrlRef.current = previewUrl;

    setSelectedImage(file);
    setPicUrl(previewUrl);
  }

  function removeImage() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(
        previewUrlRef.current
      );
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
        .replace(/[^a-z0-9]/g, "") ||
      "jpg";

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const storagePath =
      `profile-images/${user.uid}/${fileName}`;

    const storageRef =
      ref(storage, storagePath);

    await uploadBytes(
      storageRef,
      file,
      {
        contentType: file.type,
        cacheControl:
          "public,max-age=31536000",
      }
    );

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
      setError(
        "Your session has expired. Please log in again."
      );
      return;
    }

    setError("");

    const normalizedUsername =
      username.trim().toLowerCase();

    const normalizedArtistName =
      artistName.trim();

    if (!normalizedArtistName) {
      setError(
        "Artist name is required."
      );
      return;
    }

    if (
      !/^[a-z0-9_]{3,30}$/.test(
        normalizedUsername
      )
    ) {
      setError(
        "Username must be 3–30 characters and contain only letters, numbers, or underscores."
      );
      return;
    }

    if (!genre) {
      setError(
        "Please select a genre."
      );
      return;
    }

    setSaving(true);

    let uploadedStoragePath = "";
    let uploadedDownloadUrl = "";

    try {
      if (selectedImage) {
        const uploaded =
          await uploadProfileImage(
            selectedImage
          );

        uploadedStoragePath =
          uploaded.storagePath;

        uploadedDownloadUrl =
          uploaded.downloadUrl;
      }

      const userRef = doc(
        db,
        "users",
        user.uid
      );

      const newProfileRef = doc(
        db,
        "artistProfiles",
        normalizedUsername
      );

      const result =
        await runTransaction(
          db,
          async (transaction) => {
            const userSnapshot =
              await transaction.get(
                userRef
              );

            if (!userSnapshot.exists()) {
              throw new Error(
                "ACCOUNT_NOT_FOUND"
              );
            }

            const newProfileSnapshot =
              await transaction.get(
                newProfileRef
              );

            let oldProfileSnapshot = null;

            if (
              currentProfileId &&
              currentProfileId !==
                normalizedUsername
            ) {
              const oldProfileRef =
                doc(
                  db,
                  "artistProfiles",
                  currentProfileId
                );

              oldProfileSnapshot =
                await transaction.get(
                  oldProfileRef
                );
            }

            if (
              newProfileSnapshot.exists() &&
              newProfileSnapshot.data()
                .uid !== user.uid
            ) {
              throw new Error(
                "USERNAME_TAKEN"
              );
            }

            const existingProfile =
              newProfileSnapshot.exists()
                ? newProfileSnapshot.data()
                : {};

            const finalPicUrl =
              uploadedDownloadUrl ||
              (selectedImage === null &&
              !picUrl
                ? ""
                : picUrl);

            const finalPicStoragePath =
              uploadedStoragePath ||
              (selectedImage === null &&
              !picUrl
                ? ""
                : picStoragePath);

            const profileData = {
              uid: user.uid,
              username:
                normalizedUsername,
              artistName:
                normalizedArtistName,
              genre,
              bio: bio.trim(),
              spotifyUrl:
                spotifyUrl.trim(),
              bandlabUrl:
                bandlabUrl.trim(),
              rapchatUrl:
                rapchatUrl.trim(),
              picUrl: finalPicUrl,
              picStoragePath:
                finalPicStoragePath,
              createdAt:
                existingProfile.createdAt ||
                serverTimestamp(),
              updatedAt:
                serverTimestamp(),
            };

            transaction.set(
              newProfileRef,
              profileData,
              { merge: true }
            );

            if (
              oldProfileSnapshot?.exists() &&
              oldProfileSnapshot.data()
                .uid === user.uid
            ) {
              transaction.delete(
                oldProfileSnapshot.ref
              );
            }

            transaction.update(
              userRef,
              {
                username:
                  normalizedUsername,
                artistName:
                  normalizedArtistName,
                profileCompleted: true,
                updatedAt:
                  serverTimestamp(),
                artistProfileId:
                  deleteField(),
                bio: deleteField(),
                genre: deleteField(),
                spotifyUrl:
                  deleteField(),
                bandlabUrl:
                  deleteField(),
                rapchatUrl:
                  deleteField(),
                pic_url:
                  deleteField(),
                picUrl:
                  deleteField(),
              }
            );

            return {
              previousPicStoragePath:
                existingProfile.picStoragePath ||
                picStoragePath ||
                "",
              finalPicStoragePath,
            };
          }
        );

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
          logZweyError(
            "onboarding.previous_image_cleanup",
            cleanupError
          );
        }
      }

      router.replace("/dashboard");
    } catch (err) {
      logZweyError(
        "onboarding.profile_save",
        err
      );

      if (
        uploadedStoragePath &&
        uploadedStoragePath !==
          picStoragePath
      ) {
        try {
          await deleteObject(
            ref(
              storage,
              uploadedStoragePath
            )
          );
        } catch (cleanupError) {
          logZweyError(
            "onboarding.upload_cleanup",
            cleanupError
          );
        }
      }

      if (
        err?.message === "USERNAME_TAKEN"
      ) {
        setError(
          "That username is already in use. Choose another username."
        );
      } else if (
        err?.message ===
        "ACCOUNT_NOT_FOUND"
      ) {
        setError(
          "Your account record could not be found. Please log out and sign in again."
        );
      } else {
        setError(
          getZweyErrorMessage(
            err,
            "profile-save"
          )
        );
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || initializing) {
    return (
      <main className="flex min-h-screen min-h-[100dvh] items-center justify-center bg-zwey-bg px-4 text-zwey-text sm:px-6">
        <div className="w-full max-w-sm">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-zwey-border border-t-zwey-violet" />

          <p className="text-center text-sm text-zwey-muted">
            Preparing your artist profile...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const displayImage = picUrl || "";

  const initials =
    artistName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "ZW";

  return (
    <main className="min-h-screen min-h-[100dvh] overflow-x-hidden bg-zwey-bg px-4 py-5 text-zwey-text sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6 flex min-w-0 items-center justify-between gap-4 sm:mb-8">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zwey-violetBright sm:tracking-[0.22em]">
              Zwey
            </p>

            <p className="mt-1 text-sm text-zwey-muted">
              Artist identity
            </p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="shrink-0 rounded-xl border border-zwey-border bg-zwey-surface px-3.5 py-2.5 text-sm font-medium text-zwey-muted transition hover:border-zwey-violet/60 hover:bg-zwey-elevated hover:text-zwey-text focus:outline-none focus:ring-4 focus:ring-zwey-violet/10 sm:px-4"
          >
            Log out
          </button>
        </header>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-zwey-border bg-zwey-surface shadow-zwey-card sm:rounded-3xl">
          <div className="border-b border-zwey-border px-5 py-7 sm:px-10 sm:py-8">
            <div className="inline-flex max-w-full rounded-full border border-zwey-violetDeep/40 bg-zwey-violetDeep/10 px-3 py-1 text-xs font-semibold text-zwey-violetBright">
              <span className="zwey-break">
                {currentProfileId
                  ? "Edit artist profile"
                  : "Create artist profile"}
              </span>
            </div>

            <h1 className="mt-5 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
              Build your artist identity.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zwey-muted sm:text-base sm:leading-7">
              Create the identity other artists,
              producers, collaborators and fans
              will discover on Zwey.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-8 px-5 py-7 sm:px-10 sm:py-8"
          >
            {error && (
              <div
                className="zwey-break rounded-2xl border border-zwey-error/30 bg-zwey-error/10 px-4 py-3.5 text-sm leading-6 text-red-300"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="grid min-w-0 gap-8 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-start">
              <div className="flex min-w-0 flex-col items-center">
                <div className="relative">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt="Profile preview"
                      className="h-32 w-32 rounded-full border border-zwey-border object-cover ring-4 ring-zwey-violetDeep/10 sm:h-36 sm:w-36"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border border-zwey-border bg-zwey-elevated text-3xl font-bold text-zwey-violetBright ring-4 ring-zwey-violetDeep/10 sm:h-36 sm:w-36">
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
                  className="mt-4 w-full max-w-[180px] rounded-xl border border-zwey-border bg-zwey-elevated px-4 py-2.5 text-sm font-semibold transition hover:border-zwey-violet/60 hover:bg-zwey-violetDeep/10 focus:outline-none focus:ring-4 focus:ring-zwey-violet/10"
                >
                  {displayImage
                    ? "Change image"
                    : "Upload image"}
                </button>

                {displayImage && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="mt-2 px-2 py-1 text-xs font-medium text-zwey-muted transition hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-zwey-violet/30"
                  >
                    Remove image
                  </button>
                )}

                <p className="mt-3 max-w-[190px] text-center text-xs leading-5 text-zwey-muted">
                  JPG, PNG, WEBP or other image
                  formats up to 5 MB.
                </p>
              </div>

              <div className="min-w-0 space-y-6">
                <div className="min-w-0">
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
                      setArtistName(
                        event.target.value
                      )
                    }
                    placeholder="Your artist name"
                    className="w-full min-w-0 rounded-xl border border-zwey-border bg-zwey-elevated px-4 py-3.5 text-zwey-text outline-none transition placeholder:text-zinc-600 focus:border-zwey-violet focus:ring-4 focus:ring-zwey-violet/10"
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="min-w-0">
                  <label
                    htmlFor="username"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Username
                  </label>

                  <div className="flex min-w-0 overflow-hidden rounded-xl border border-zwey-border bg-zwey-elevated transition focus-within:border-zwey-violet focus-within:ring-4 focus-within:ring-zwey-violet/10">
                    <span className="flex shrink-0 items-center pl-4 text-zwey-muted">
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
.replace(
/[^a-z0-9_]/g,
""
)
)
}
placeholder="yourname"
className="min-w-0 flex-1 bg-transparent px-2 py-3.5 text-zwey-text outline-none placeholder:text-zinc-600"
required
minLength={3}
maxLength={30}

autoComplete="username"
/>
</div>

<p className="mt-2 text-xs leading-5 text-zwey-muted">
3-30 characters. Letters, numbers and underscores only.
</p>
</div>

<div className="min-w-0">
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
setGenre(
event.target.value
)
}
className="W-full min-w-0 appearance-none rounded-xl border border-zwey-border bg-zwey-elevated px-4 py-3.5 text-zwey-text outline-none transition focus:border-zwey-violet focus:ring-4 focus:ring-zwey-violet/10"
required
>
<option
value=""
disabled
>
Select your genre
</option>

{GENRES.map((item) => (
<option
key={item}
value={item}
>
{item}
</option>
))}
</select>
</div>

<div className="min-w-0">
<div className="mb-2 flex min-w-0 items-center justify-between gap-4">
<label
htmlFor="bio"
className="block text-sm font-semibold"
>
Short bio
</label>

<span
className="shrink-0 text-xs text-zwey-muted">
{bio.length}/300
</span>
</div>

<textarea
id="bio"
value={bio}
onChange={(event) =>
setBio(
event.target.value
)
}
placeholder="Tell people a little about your sound."
className="min-h-[140px] w-full min-w-0 resize-y rounded-xl border border-zwey-border bg-zwey-elevated px-4 py-3.5 text-zwey-text outline-none transition placeholder:text-zinc-600 focus:border-zwey-violet focus:ring-4 focus:ring-zwey-violet/10"
maxLength={300}
/>
</div>
</div>
</div>

<div className="border-t border-zwey-border pt-8">
<div className="mb-5">
<h2 className="text-lg font-bold">
Music links
</h2>

<p className="mt-1 text-sm leading-6 text-zwey-muted">
Connect people to where your music already lives.
</p>
</div>

<div className="grid min-w-0 gap-4">
<input
type="url"
value={spotifyUrl}
onChange={(event) =>
setSpotifyUrl(
event.target.value
)
}
placeholder="Spotify URL"
className="w-full min-w-0 rounded-xl border border-zwey-border bg-zwey-elevated px-4 py-3.5 text-zwey-text outline-none transition placeholder:text-zinc-600 focus:border-zwey-violet focus:ring-4 focus:ring-zwey-violet/10"
/>

<input
type="url"
value={bandlabUrl}
onChange={(event) =>
setBandlabUrl(
event.target.value
)
}
placeholder="BandLab URL"
className="w-full min-w-0 rounded-xl border border-zwey-border bg-zwey-elevated px-4 py-3.5 text-zwey-text outline-none transition placeholder:text-zinc-600 focus:border-zwey-violet focus:ring-4 focus:ring-zwey-violet/10"
/>

<input
type="url"
value={rapchatUrl}
onChange={(event) =>
setRapchatUrl(
event.target.value
)
}
placeholder="Rapchat URL"
className="w-full min-w-0 rounded-xl border border-zwey-border bg-zwey-elevated px-4 py-3.5 text-zwey-text outline-none transition placeholder:text-zinc-600 focus:border-zwey-violet focus:ring-4 focus:ring-zwey-violet/10"
/>
</div>
</div>

<div className="border-t border-zwey-border pt-8">
<button
type="submit"
disabled={saving}
className="w-full rounded-xl bg-zwey-violet px-5 py-3.5 text-sm font-bold text-white shadow-zwey-accent transition hover:bg-zwey-violetDeep focus:outline-none focus:ring-4 focus:ring-zwey-violet/20 disabled:cursor-not-allowed disabled:opacity-50 sm:py-4"
>
{saving
? "Saving profile..."
: currentProfileId
? "Save Changes"
: "Create Artist Profile"}
</button>
</div>
</form>
</section>
</div>
</main>
);
  }
