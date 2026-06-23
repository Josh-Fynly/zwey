"use client";

import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signup");
    }
  }, [user, loading, router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold">
        Welcome {user?.email}
      </h1>

      <button
        onClick={logout}
        className="mt-4 bg-red-600 text-white px-4 py-2"
      >
        Logout
      </button>
    </div>
  );
}
