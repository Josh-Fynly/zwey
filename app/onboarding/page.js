"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "../../context/AuthContext";

import { doc, updateDoc } from "firebase/firestore";

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
  const [imageUrl, setImageUrl] = useState("");

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

    setSaving(true);
    setError("");

    try {
      await updateDoc(doc(db, "users", user.uid), {
        artistName,
        username: username.toLowerCase(),
        bio,
        genre,
        spotifyUrl,
        bandlabUrl,
        rapchatUrl,
        imageUrl,
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="p-8">
        Loading...
      </p>
    );
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
              setUsername(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3"
            required
          />

          <textarea
            placeholder="Short Bio"
            value={bio}
            onChange={(e) =>
              setBio(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3 min-h-[120px]"
          />

          <input
            type="text"
            placeholder="Genre"
            value={genre}
            onChange={(e) =>
              setGenre(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3"
          />

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
            value={imageUrl}
            onChange={(e) =>
              setImageUrl(e.target.value)
            }
            className="w-full border rounded-lg px-4 py-3"
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold disabled:bg-gray-400"
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
