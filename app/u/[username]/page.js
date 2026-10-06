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
    .filter(Boolean)
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
      console.error(
        "Profile share failed:",
        err
      );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080B] px-6 text-[#F5F5F7]">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#272731] border-t-[#8B5CF6]"
            aria-hidden="true"
          />

          <p className="text-sm text-[#A1A1AA]">
            Loading artist profile...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080B] px-6 text-[#F5F5F7]">
        <div className="w-full max-w-md rounded-3xl border border-[#272731] bg-[#111116] p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#A78BFA]">
            Zwey
          </p>

          <h1 className="mt-5 text-2xl font-bold">
            Profile unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#A1A1AA]">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (notFound || !artist) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080B] px-6 text-[#F5F5F7]">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#A78BFA]">
            Zwey
          </p>

          <h1 className="mt-5 text-3xl font-bold">
            Artist not found
          </h1>

          <p className="mt-3 text-[#A1A1AA]">
            This artist profile does not exist.
          </p>
        </div>
      </main>
    );
  }

  const imageUrl =
    artist.picUrl || artist.pic_url || "";

  return (
    <main className="min-h-screen bg-[#08080B] px-4 py-6 text-[#F5F5F7] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#A78BFA]">
            Zwey
          </p>

          <button
            type="button"
            onClick={handleShare}
            className="rounded-xl border border-[#272731] bg-[#111116] px-4 py-2.5 text-sm font-semibold transition hover:border-[#8B5CF6]/60 hover:bg-[#18181F]"
          >
            {copied ? "Copied" : "Share"}
          </button>
        </header>

        <section className="mt-6 overflow-hidden rounded-3xl border border-[#272731] bg-[#111116] shadow-2xl shadow-black/30">
          <div className="px-6 py-10 text-center sm:px-10">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={artist.artistName}
                className="mx-auto h-36 w-36 rounded-full border border-[#272731] object-cover ring-4 ring-[#8B5CF6]/10"
              />
            ) : (
              <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border border-[#272731] bg-[#18181F] text-3xl font-bold text-[#A78BFA] ring-4 ring-[#8B5CF6]/10">
                {getInitials(artist.artistName)}
              </div>
            )}

            <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl">
              {artist.artistName}
            </h1>

            <p className="mt-2 text-[#71717A]">
              @{artist.username}
            </p>

            {artist.genre && (
              <span className="mt-5 inline-flex rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-4 py-1.5 text-sm font-semibold text-[#A78BFA]">
                {artist.genre}
              </span>
            )}

            {artist.bio && (
              <p className="mx-auto mt-7 max-w-xl leading-7 text-[#A1A1AA]">
                {artist.bio}
              </p>
            )}
          </div>

          <div className="border-t border-[#272731] px-6 py-6 sm:px-10">
            <div className="space-y-3">
              {artist.spotifyUrl && (
                <a
                  href={artist.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-[#272731] bg-[#18181F] px-5 py-4 text-center font-semibold transition hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/10"
                >
                  Listen on Spotify
                </a>
              )}

              {artist.bandlabUrl && (
                <a
                  href={artist.bandlabUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-[#272731] bg-[#18181F] px-5 py-4 text-center font-semibold transition hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/10"
                >
                  Find me on BandLab
                </a>
              )}

              {artist.rapchatUrl && (
                <a
                  href={artist.rapchatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl border border-[#272731] bg-[#18181F] px-5 py-4 text-center font-semibold transition hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/10"
                >
                  Find me on Rapchat
                </a>
              )}

              {!artist.spotifyUrl &&
                !artist.bandlabUrl &&
                !artist.rapchatUrl && (
                  <div className="rounded-xl border border-dashed border-[#272731] px-5 py-8 text-center">
                    <p className="text-sm text-[#71717A]">
                      Music links coming soon.
                    </p>
                  </div>
                )}
            </div>
          </div>
        </section>

        <p className="py-8 text-center text-xs text-[#52525B]">
          Discover artists. Share music. Find your people.
        </p>
      </div>
    </main>
  );
}
