"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../../context/AuthContext";

import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../../lib/firebase";

export default function Onboarding() {
  const router = useRouter();

  const { user, loading } = useAuth();

  const [artistName, setArtistName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [genre, setGenre] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [bandlabUrl, setBandlabUrl] = useState("");
  const [rapchatUrl, setRapchatUrl] = useState("");
  const [picUrl, setPicUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signup");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;

    setError("");

    const normalizedUsername = username
      .trim()
      .toLowerCase();

    if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
      setError(
        "Username must be 3–30 characters and contain only letters, numbers, or underscores."
      );
      return;
    }

    if (!artistName.trim()) {
      setError("Artist name is required.");
      return;
    }

    if (!genre) {
      setError("Please select a genre.");
      return;
    }

    setSaving(true);

    try {
      const usernameQuery = query(
        collection(db, "users"),
        where("username", "==", normalizedUsername)
      );

      const usernameSnapshot =
        await getDocs(usernameQuery);

      const usernameTaken =
        usernameSnapshot.docs.some(
          (userDoc) => userDoc.id !== user.uid
        );

      if (usernameTaken) {
        setError(
          "That username is already taken. Please choose another one."
        );
        setSaving(false);
        return;
      }

      await updateDoc(
        doc(db, "users", user.uid),
        {
          artistName: artistName.trim(),

          username: normalizedUsername,

          bio: bio.trim(),

          genre,

          spotifyUrl: spotifyUrl.trim(),

          bandlabUrl: bandlabUrl.trim(),

          rapchatUrl: rapchatUrl.trim(),

          pic_url: picUrl.trim(),

          profileCompleted: true,
        }
      );

      router.push("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        "Failed to complete profile setup. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">

        <h1 className="text-3xl font-bold mb-2">
          Complete your artist profile
        </h1>

        <p className="text-gray-600 mb-8">
          Set up your public identity on Zwey.
        </p>

        {error && (
          <p className="text-red-500 mb-4">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <input
            type="text"
            placeholder="Artist Name"
            value={artistName}
            onChange={(e) =>
              setArtistName(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
                  .toLowerCase()
                  .replace(/\s/g, "")
              )
            }
            className="w-full border rounded-lg px-4 py-3"
            required
            minLength={3}
            maxLength={30}
          />

          <p className="text-xs text-gray-500 -mt-3">
            3–30 characters. Letters, numbers, and underscores only.
          </p>

          <textarea
            placeholder="Short Bio"
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3 min-h-[120px]"
            maxLength={300}
          />

          <select
            value={genre}
            onChange={(e) =>
              setGenre(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3"
            required
          >
            <option value="">
              Select Genre
            </option>

            <option value="Hip-Hop">
              Hip-Hop
            </option>

            <option value="Afrobeats">
              Afrobeats
            </option>

            <option value="Trap">
              Trap
            </option>

            <option value="R&B">
              R&B
            </option>

            <option value="Drill">
              Drill
            </option>

            <option value="Soul">
              Soul
            </option>

            <option value="Electronic">
              Electronic
            </option>

            <option value="Reggae">
              Reggae
            </option>

            <option value="Pop">
              Pop
            </option>

            <option value="Other">
              Other
            </option>
          </select>

          <input
            type="url"
            placeholder="Spotify URL"
            value={spotifyUrl}
            onChange={(e) =>
              setSpotifyUrl(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3"
          />

          <input
            type="url"
            placeholder="BandLab URL"
            value={bandlabUrl}
            onChange={(e) =>
              setBandlabUrl(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3"
          />

          <input
            type="url"
            placeholder="Rapchat URL"
            value={rapchatUrl}
            onChange={(e) =>
              setRapchatUrl(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3"
          />

          <input
            type="url"
            placeholder="Profile Image URL"
            value={picUrl}
            onChange={(e) =>
              setPicUrl(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-semibold disabled:bg-gray-400"
          >
            {saving
              ? "Saving profile..."
              : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
              }
