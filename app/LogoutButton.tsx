"use client";

import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", {
      method: "POST",
    }).catch(() => null);
    window.location.href = "/login";
  }

  return (
    <button className="textButton" disabled={loading} onClick={logout} type="button">
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
}
