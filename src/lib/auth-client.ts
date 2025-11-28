"use client";

import { useState, useEffect } from "react";

// Hook pour vérifier l'auth admin côté client
export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier via une route API simple
    fetch("/api/admin/status", {
      method: "GET",
      credentials: "include", // Important pour les cookies
    })
      .then((res) => {
        setIsAdmin(res.ok && res.status === 200);
      })
      .catch(() => {
        setIsAdmin(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { isAdmin, loading };
}

// Hook pour les infos de session votant
export function useVoterAuth() {
  const [isVoter, setIsVoter] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/voter/status", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        const isAuthenticated = res.ok && res.status === 200;
        setIsVoter(isAuthenticated);
      })
      .catch((error) => {
        console.error("Voter auth error:", error);
        setIsVoter(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { isVoter, loading };
}
