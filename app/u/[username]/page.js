"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../../lib/firebase";

export default function PublicProfile() {
  const params = useParams();
  const username = params.username;

  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  // -----------------------------
  // Fetch artist
  // -----------------------------
  useEffect(() => {
    async function fetchArtist() {
      try {
        const q = query(
          collection(db, "users"),
          where("username", "==", username.toLowerCase())
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const userDoc = querySnapshot.docs[0];
        setArtist(userDoc.data());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (username) fetchArtist();
  }, [username]);

  // -----------------------------
  // Helpers
  // -----------------------------
  function getInitials(name = "") {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function hashColor(str = "") {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-cyan-500",
    ];

    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  }

  // -----------------------------
  // Share handler
  // -----------------------------
  async function handleShare() {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }

  // -----------------------------
  // Loading / Not Found
  // -----------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (notFound || !artist) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            Artist not found
          </h1>
          <p className="text-gray-600">
            This profile does not exist.
          </p>
        </div>
      </div>
    );
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">

        {/* SHARE BUTTON */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm hover:bg-gray-800"
          >
            {copied ? "Copied!" : "Share Profile"}
          </button>
        </div>

        {/* PROFILE HEADER */}
        <div className="flex flex-col items-center text-center">

          {/* IMAGE OR INITIALS */}
          {artist.pic_url ? (
            <img
              src={artist.pic_url}
              alt={artist.artistName}
              className="w-32 h-32 rounded-full object-cover border mb-6"
            />
          ) : (
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-6 ${hashColor(
                artist.username
              )}`}
            >
              {getInitials(artist.artistName)}
            </div>
          )}

          {/* NAME */}
          <h1 className="text-4xl font-bold">
            {artist.artistName}
          </h1>

          {/* USERNAME */}
          <p className="text-gray-500 mt-2">
            @{artist.username}
          </p>

          {/* GENRE BADGE */}
          {artist.genre && (
            <div className="mt-4 inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-md">
              {artist.genre}
            </div>
          )}

          {/* BIO */}
          {artist.bio && (
            <p className="mt-6 text-gray-700 max-w-lg">
              {artist.bio}
            </p>
          )}
        </div>

        {/* LINKS */}
        <div className="mt-10 space-y-4">

          {artist.spotifyUrl && (
            <a
              href={artist.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 rounded-lg font-semibold"
            >
              Spotify
            </a>
          )}

          {artist.bandlabUrl && (
            <a
              href={artist.bandlabUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold"
            >
              BandLab
            </a>
          )}

          {artist.rapchatUrl && (
            <a
              href={artist.rapchatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 rounded-lg font-semibold"
            >
              Rapchat
            </a>
          )}

        </div>
      </div>
    </div>
  );
}
