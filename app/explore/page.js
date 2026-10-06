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
    .filter(Boolean)
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
            a.artistName.localeCompare(
              b.artistName
            )
          );

        setArtists(profiles);
      } catch (err) {
        console.error(
          "Explore artists load error:",
          err
        );

        if (!cancelled) {
          setError(
            "We could not load artists right now. Please try again."
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
      <main className="flex min-h-screen items-center justify-center bg-[#08080B] px-6 text-[#F5F5F7]">
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#272731] border-t-[#8B5CF6]"
            aria-hidden="true"
          />

          <p className="text-sm text-[#A1A1AA]">
            Discovering artists...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08080B] px-4 py-8 text-[#F5F5F7] sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#A78BFA]">
            Zwey
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Explore artists.
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-[#A1A1AA]">
            Discover upcoming artists, producers and creators
            building their identity on Zwey.
          </p>
        </header>

        {error && (
          <div
            className="rounded-2xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-4 text-sm leading-6 text-[#FCA5A5]"
            role="alert"
          >
            {error}
          </div>
        )}

        {!error && artists.length === 0 && (
          <div className="rounded-3xl border border-[#272731] bg-[#111116] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B5CF6]/10 text-xl font-bold text-[#A78BFA]">
              Z
            </div>

            <h2 className="mt-6 text-xl font-bold">
              No artists yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#A1A1AA]">
              Be one of the first artists to build a profile
              and get discovered on Zwey.
            </p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => {
            const imageUrl =
              artist.picUrl ||
              artist.pic_url ||
              "";

            return (
              <Link
                key={artist.id}
                href={`/u/${artist.username}`}
                className="group"
              >
                <article className="h-full rounded-3xl border border-[#272731] bg-[#111116] p-6 transition duration-200 hover:-translate-y-1 hover:border-[#8B5CF6]/50 hover:bg-[#18181F] hover:shadow-xl hover:shadow-[#8B5CF6]/5">
                  <div className="flex items-start justify-between gap-4">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={artist.artistName}
                        className="h-20 w-20 rounded-full border border-[#272731] object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#272731] bg-[#18181F] text-xl font-bold text-[#A78BFA]">
                        {getInitials(
                          artist.artistName
                        )}
                      </div>
                    )}

                    {artist.genre && (
                      <span className="rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 px-2.5 py-1 text-xs font-semibold text-[#A78BFA]">
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

                  <div className="mt-6 flex items-center justify-between border-t border-[#272731] pt-5">
                    <span className="text-sm font-semibold text-[#A78BFA]">
                      View profile
                    </span>

                    <span className="text-[#71717A] transition group-hover:translate-x-1 group-hover:text-[#A78BFA]">
                      →
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
                  }
