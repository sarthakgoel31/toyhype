"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PinEntry() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed");
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-heading text-[var(--text-primary)]">
            ToyHype Admin
          </h1>
          <p className="text-[var(--text-muted)] mt-2">Enter your PIN to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pin">Admin PIN</Label>
            <Input
              id="pin"
              type="password"
              maxLength={20}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter admin password"
              className="text-center text-lg mt-2"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-[var(--accent-red)] text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={pin.length < 4 || loading}
          >
            {loading ? "Verifying..." : "Enter Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}
