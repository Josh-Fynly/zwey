"use client";

import { useAuth } from "@/context/AuthContext";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">

        <h1 className="text-3xl font-bold mb-4">
          Welcome, {user?.email}
        </h1>

        <p className="text-gray-600 mb-8">
          Your dashboard is coming soon.
        </p>

        <button
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>
    </div>
  );
}
