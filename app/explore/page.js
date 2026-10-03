"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../lib/firebase";

function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ExplorePage() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchArtists() {
      try {
        const snapshot = await getDocs(
          collection(db, "artistProfiles")
        );

        if (cancelled) return;

        const profiles = snapshot.docs
          .map((profileDoc) => ({
            id: profileDoc.id,
            ...profileDoc.data(),
          }))
          .filter(
            (artist) =>
              artist.username &&
              artist.artistName
          )
          .sort((a, b) =>
            a.artistName.localeCompare(b.artistName)
          );

        setArtists(profiles);
      } catch (err) {
        console.error(
          "Explore artists load error:",
          err
        );

        if (!cancelled) {
          setError(
            "We couldn't load artists right now. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchArtists();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08080B] flex items-center justify-center px-6 text-[#F5F5F7]">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#272731] border-t-[#8B5CF6]"
            aria-hidden="true"
          />

          <p className="text-sm">
            Discovering artists...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08080B] px-4 py-8 text-[#F5F5F7] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm font-semibold tracking-[0.2em] text-[#A78BFA] uppercase">
            Zwey
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Explore artists.
          </h1>

          <p className="mt-3 max-w-2xl text-[#A1A1AA]">
            Discover upcoming creators building their identity
            on Zwey.
          </p>
        </header>

        {error && (
          <div
            className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#FCA5A5]"
            role="alert"
          >
            {error}
          </div>
        )}

        {!error && artists.length === 0 && (
          <div className="rounded-2xl border border-[#272731] bg-[#111116] p-10 text-center">
            <h2 className="text-xl font-semibold">
              No artists yet
            </h2>

            <p className="mt-2 text-[#A1A1AA]">
              Be one of the first artists to build a profile
              on Zwey.
            </p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/u/${artist.username}`}
              className="group"
            >
              <article className="h-full rounded-2xl border border-[#272731] bg-[#111116] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#8B5CF6]/60 hover:bg-[#18181F]">
                <div className="flex items-start justify-between gap-4">
                  {artist.pic_url ? (
                    <img
                      src={artist.pic_url}
                      alt={artist.artistName}
                      className="h-20 w-20 rounded-full border border-[#272731] object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#18181F] text-xl font-bold text-[#A78BFA] ring-1 ring-[#8B5CF6]/30">
                      {getInitials(
                        artist.artistName
                      )}
                    </div>
                  )}

                  {artist.genre && (
                    <span className="rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-2.5 py-1 text-xs font-medium text-[#A78BFA]">
                      {artist.genre}
                    </span>
                  )}
                </div>

                <h2 className="mt-6 text-xl font-bold transition group-hover:text-[#A78BFA]">
                  {artist.artistName}
                </h2>

                <p className="mt-1 text-sm text-[#71717A]">
                  @{artist.username}
                </p>

                {artist.bio && (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#A1A1AA]">
                    {artist.bio}
                  </p>
                )}

                <p className="mt-6 text-sm font-medium text-[#8B5CF6]">
                  View profile →
                </p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
    }
