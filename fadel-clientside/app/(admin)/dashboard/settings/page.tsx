"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

// This type defines the structure of our settings
type ContactSettings = {
  email: string;
  phone: string;
  location: string;
  hours: string;
  mapEmbedUrl: string;
};

// Define initial empty state
const initialState: ContactSettings = {
  email: "",
  phone: "",
  location: "",
  hours: "",
  mapEmbedUrl: "",
};

export default function SettingsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const [settings, setSettings] = useState<ContactSettings>(initialState);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Fetch settings on mount
  useEffect(() => {
    const ctl = new AbortController();
    (async () => {
      setLoading(true);
      setStatus("loading");
      setError(null);
      try {
        const res = await fetch(`${apiBase}/api/settings/contact`, {
          credentials: "include",
          signal: ctl.signal,
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to load settings");
        setSettings(data.settings ?? initialState);
        setStatus("idle");
      } catch (e: unknown) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Error fetching settings");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctl.abort();
  }, [apiBase]);

  // Save settings
  async function saveSettings() {
    setLoading(true);
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/settings/contact`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to save");
      setStatus("success");
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      else setError("Failed to save settings");
      setStatus("error");
    } finally {
      setLoading(false);
      // Reset success/error message after a delay
      setTimeout(() => setStatus("idle"), 2000);
    }
  }

  // Helper to update state
  const handleChange = (key: keyof ContactSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <h1
        className="text-xl md:text-2xl font-semibold"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        General Settings
      </h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            This information will be displayed on your public &quot;Contact Us&quot; page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <Label htmlFor="email" className="flex items-center gap-2 w-32 pb-2 sm:pb-0">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              value={settings.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="hello@example.com"
              className="flex-1"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <Label htmlFor="phone" className="flex items-center gap-2 w-32 pb-2 sm:pb-0">
              <Phone className="h-4 w-4" />
              Phone
            </Label>
            <Input
              id="phone"
              value={settings.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+961 70 000 000"
              className="flex-1"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <Label htmlFor="location" className="flex items-center gap-2 w-32 pb-2 sm:pb-0">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              value={settings.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Beirut, Lebanon"
              className="flex-1"
            />
          </div>

          {/* Hours */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <Label htmlFor="hours" className="flex items-center gap-2 w-32 pb-2 sm:pb-0">
              <Clock className="h-4 w-4" />
              Hours
            </Label>
            <Input
              id="hours"
              value={settings.hours}
              onChange={(e) => handleChange("hours", e.target.value)}
              placeholder="Mon–Fri, 9am–6pm"
              className="flex-1"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 items-start">
            <Label htmlFor="mapEmbedUrl" className="flex items-center gap-2 w-32 pb-2 sm:pb-0">
              <MapPin className="h-4 w-4" />
              Map URL
            </Label>
            <div className="flex-1">
              <Input
                id="mapEmbedUrl"
                value={settings.mapEmbedUrl}
                onChange={(e) => handleChange("mapEmbedUrl", e.target.value)}
                placeholder="https://www.google.com/maps/embed?..."
                className="flex-1"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Go to Google Maps, find your location, click &quot;Share&quot;, choose &quot;Embed a
                map&quot;, and copy the full URL from the `src` attribute.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm">
            {status === "success" && <p className="text-green-600">Settings saved successfully!</p>}
            {status === "error" && (
              <p className="text-destructive">{error || "An unknown error occurred."}</p>
            )}
            {status === "loading" && !loading && (
              <p className="text-muted-foreground">Loading settings...</p>
            )}
          </div>
          <Button onClick={saveSettings} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
