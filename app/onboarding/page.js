"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "../../context/AuthContext";

import {
  doc,
  updateDoc,
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

import {
  db,
  storage,
} from "../../lib/firebase";

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

  const [profileImage, setProfileImage] = useState(null);

  const [previewUrl, setPreviewUrl] = useState("");

  const [saving, setSaving] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signup");
    }
  }, [user, loading, router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png"
    ) {
      setError("Only JPG and PNG files are allowed.");
      return;
    }

    setProfileImage(file);

    const imagePreview =
      URL.createObjectURL(file);

    setPreviewUrl(imagePreview);
  };

  async function uploadProfileImage(file) {
    if (!user || !file) return "";

    try {
      setUploading(true);

      const storageRef = ref(
        storage,
        `users/${user.uid}/profile.jpg`
      );

      await uploadBytes(storageRef, file);

      const downloadURL =
        await getDownloadURL(storageRef);

      setSuccess("Profile image uploaded.");

      return downloadURL;
    } catch (err) {
      console.error(err);

      setError(
        "Failed to upload profile image."
      );

      return "";
    } finally {
      setUploading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) return;

    setSaving(true);

    setError("");

    try {
      let pic_url = "";

      if (profileImage) {
        pic_url =
          await uploadProfileImage(
            profileImage
          );
      }

      await updateDoc(
        doc(db, "users", user.uid),
        {
          artistName,
          username:
            username.toLowerCase(),
          bio,
          genre,
          spotifyUrl,
          bandlabUrl,
          rapchatUrl,
          pic_url,
        }
      );

      router.push("/dashboard");
    } catch (err) {
      console.error(err);

      setError(
        "Failed to complete profile setup."
      );
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

        {success && (
          <p className="text-green-600 mb-4">
            {success}
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
              setArtistName(
                e.target.value
              )
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
              )
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
              setSpotifyUrl(
                e.target.value
              )
            }
            className="w-full border rounded-lg px-4 py-3"
          />

          <input
            type="url"
            placeholder="BandLab URL"
            value={bandlabUrl}
            onChange={(e) =>
              setBandlabUrl(
                e.target.value
              )
            }
            className="w-full border rounded-lg px-4 py-3"
          />

          <input
            type="url"
            placeholder="Rapchat URL"
            value={rapchatUrl}
            onChange={(e) =>
              setRapchatUrl(
                e.target.value
              )
            }
            className="w-full border rounded-lg px-4 py-3"
          />

          <div>
            <label className="block mb-2 font-medium">
              Profile Image
            </label>

            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={
                handleImageChange
              }
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>

          {previewUrl && (
            <div>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover border"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={
              saving || uploading
            }
            className="w-full bg-black text-white py-3 rounded-lg font-semibold disabled:bg-gray-400"
          >
            {uploading
              ? "Uploading..."
              : saving
              ? "Saving profile..."
              : "Complete Setup"}
          </button>
        </form>
      </div>
    </div>
  );
}
