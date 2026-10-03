"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PublicProfile() {
  const params = useParams();
  const username = params.username;

  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!username) return;

    let cancelled = false;

    async function fetchArtist() {
      setLoading(true);
      setNotFound(false);
      setError("");

      try {
        const normalizedUsername =
          username.toLowerCase();

        const profileRef = doc(
          db,
          "artistProfiles",
          normalizedUsername
        );

        const profileSnapshot =
          await getDoc(profileRef);

        if (cancelled) return;

        if (!profileSnapshot.exists()) {
          setNotFound(true);
          return;
        }

        setArtist(profileSnapshot.data());
      } catch (err) {
        console.error(
          "Public profile load error:",
          err
        );

        if (!cancelled) {
          setError(
            "This artist profile could not be loaded right now."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchArtist();

    return () => {
      cancelled = true;
    };
  }, [username]);

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(
        window.location.href
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Profile share failed:", err);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08080B] flex items-center justify-center px-6 text-[#F5F5F7]">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#272731] border-t-[#8B5CF6]"
            aria-hidden="true"
          />

          <p className="text-sm">
            Loading artist profile...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#08080B] flex items-center justify-center px-6 text-[#F5F5F7]">
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Profile unavailable
          </h1>

          <p className="mt-3 text-[#A1A1AA]">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (notFound || !artist) {
    return (
      <main className="min-h-screen bg-[#08080B] flex items-center justify-center px-6 text-[#F5F5F7]">
        <div className="text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#A78BFA] uppercase">
            Zwey
          </p>

          <h1 className="mt-4 text-3xl font-bold">
            Artist not found
          </h1>

          <p className="mt-3 text-[#A1A1AA]">
            This artist profile does not exist.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08080B] px-4 py-6 text-[#F5F5F7] sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#A78BFA] uppercase">
            Zwey
          </p>

          <button
            type="button"
            onClick={handleShare}
            className="rounded-lg border border-[#272731] bg-[#111116] px-4 py-2 text-sm font-medium transition hover:border-[#8B5CF6] hover:bg-[#18181F]"
          >
            {copied ? "Copied" : "Share"}
          </button>
        </div>

        <section className="mt-6 rounded-2xl border border-[#272731] bg-[#111116] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col items-center text-center">
            {artist.pic_url ? (
              <img
                src={artist.pic_url}
                alt={artist.artistName}
                className="h-32 w-32 rounded-full border border-[#272731] object-cover ring-4 ring-[#8B5CF6]/10"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#18181F] text-3xl font-bold text-[#A78BFA] ring-1 ring-[#8B5CF6]/40">
                {getInitials(artist.artistName)}
              </div>
            )}

            <h1 className="mt-6 text-4xl font-bold tracking-tight">
              {artist.artistName}
            </h1>

            <p className="mt-2 text-[#A1A1AA]">
              @{artist.username}
            </p>

            {artist.genre && (
              <span className="mt-4 rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-4 py-1.5 text-sm font-medium text-[#A78BFA]">
                {artist.genre}
              </span>
            )}

            {artist.bio && (
              <p className="mt-6 max-w-lg leading-7 text-[#A1A1AA]">
                {artist.bio}
              </p>
            )}
          </div>

          <div className="mt-10 space-y-3">
            {artist.spotifyUrl && (
              <a
                href={artist.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-[#272731] bg-[#18181F] px-5 py-4 text-center font-semibold transition hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10"
              >
                Listen on Spotify
              </a>
            )}

            {artist.bandlabUrl && (
              <a
                href={artist.bandlabUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-[#272731] bg-[#18181F] px-5 py-4 text-center font-semibold transition hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10"
              >
                Find me on BandLab
              </a>
            )}

            {artist.rapchatUrl && (
              <a
                href={artist.rapchatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-[#272731] bg-[#18181F] px-5 py-4 text-center font-semibold transition hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/10"
              >
                Find me on Rapchat
              </a>
            )}
          </div>
        </section>
      </div>
    </main>
  );
              }
