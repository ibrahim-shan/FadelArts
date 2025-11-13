"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Make sure you've added this shadcn component
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Instagram, Facebook } from "lucide-react";
import { SiTiktok, SiWhatsapp } from "react-icons/si";

// This type defines the structure of our settings
type MediaSettings = {
  instagram: {
    url: string;
    isVisible: boolean;
  };
  facebook: {
    url: string;
    isVisible: boolean;
  };
  tiktok: {
    url: string;
    isVisible: boolean;
  };
  whatsapp: {
    url: string;
    isVisible: boolean;
  };
};

// Define initial empty state
const initialState: MediaSettings = {
  instagram: { url: "", isVisible: false },
  facebook: { url: "", isVisible: false },
  tiktok: { url: "", isVisible: false },
  whatsapp: { url: "", isVisible: false },
};

export default function MediaPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const [settings, setSettings] = useState<MediaSettings>(initialState);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // --- TODO: This function will fetch settings from your new backend endpoint ---

  // --- TODO: This function will save settings to your new backend endpoint ---
  async function saveSettings() {
    setLoading(true);
    setStatus("loading");
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/settings/media`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || "Failed to save");

      console.warn("TODO: Implement saveSettings API call. Simulating success.");
      // Simulate success:
      await new Promise((res) => setTimeout(res, 600));
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

  // Fetch settings on mount
  useEffect(() => {
    const ctl = new AbortController();
    (async () => {
      setLoading(true);
      setStatus("loading");
      setError(null);
      try {
        const res = await fetch(`${apiBase}/api/settings/media`, {
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

  // Helper to update state
  const handleUrlChange = (platform: keyof MediaSettings, url: string) => {
    setSettings((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], url },
    }));
  };

  const handleVisibilityChange = (platform: keyof MediaSettings, isVisible: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], isVisible },
    }));
  };

  return (
    <div className="space-y-6">
      <h1
        className="text-xl md:text-2xl font-semibold"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        Media Links
      </h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
          <CardDescription>
            Enter the links for your social media accounts and toggle their visibility on the site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Instagram */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <Label htmlFor="instagram" className="flex items-center gap-2 w-32 pb-2 sm:pb-0">
              <Instagram className="h-4 w-4" />
              Instagram
            </Label>
            <Input
              id="instagram"
              value={settings.instagram.url}
              onChange={(e) => handleUrlChange("instagram", e.target.value)}
              placeholder="https://instagram.com/..."
              className="flex-1"
            />
            <div className="flex items-center space-x-2 pt-3 sm:pt-0">
              <Switch
                id="instagram-visible"
                checked={settings.instagram.isVisible}
                onCheckedChange={(val) => handleVisibilityChange("instagram", val)}
              />
              <Label htmlFor="instagram-visible" className="text-sm text-muted-foreground">
                Show
              </Label>
            </div>
          </div>

          {/* Facebook */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <Label htmlFor="facebook" className="flex items-center gap-2 w-32 pb-2 sm:pb-0">
              <Facebook className="h-4 w-4" />
              Facebook
            </Label>
            <Input
              id="facebook"
              value={settings.facebook.url}
              onChange={(e) => handleUrlChange("facebook", e.target.value)}
              placeholder="https://facebook.com/..."
              className="flex-1"
            />
            <div className="flex items-center space-x-2 pt-3 sm:pt-0">
              <Switch
                id="facebook-visible"
                checked={settings.facebook.isVisible}
                onCheckedChange={(val) => handleVisibilityChange("facebook", val)}
              />
              <Label htmlFor="facebook-visible" className="text-sm text-muted-foreground">
                Show
              </Label>
            </div>
          </div>

          {/* Tiktok */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <Label htmlFor="tiktok" className="flex items-center gap-2 w-32 pb-2 sm:pb-0">
              <SiTiktok className="h-4 w-4" />
              Tiktok
            </Label>
            <Input
              id="tiktok"
              value={settings.tiktok.url}
              onChange={(e) => handleUrlChange("tiktok", e.target.value)}
              placeholder="https://tiktok.com/..."
              className="flex-1"
            />
            <div className="flex items-center space-x-2 pt-3 sm:pt-0">
              <Switch
                id="tiktok-visible"
                checked={settings.tiktok.isVisible}
                onCheckedChange={(val) => handleVisibilityChange("tiktok", val)}
              />
              <Label htmlFor="tiktok-visible" className="text-sm text-muted-foreground">
                Show
              </Label>
            </div>
          </div>

          {/* Whatsapp */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <Label htmlFor="whatsapp" className="flex items-center gap-2 w-32 pb-2 sm:pb-0">
              <SiWhatsapp className="h-4 w-4" />
              Whatsapp
            </Label>
            <Input
              id="whatsapp"
              value={settings.whatsapp.url}
              onChange={(e) => handleUrlChange("whatsapp", e.target.value)}
              placeholder="https://wa.me/..."
              className="flex-1"
            />
            <div className="flex items-center space-x-2 pt-3 sm:pt-0">
              <Switch
                id="whatsapp-visible"
                checked={settings.whatsapp.isVisible}
                onCheckedChange={(val) => handleVisibilityChange("whatsapp", val)}
              />
              <Label htmlFor="whatsapp-visible" className="text-sm text-muted-foreground">
                Show
              </Label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm">
            {status === "success" && <p className="text-green-600">Settings saved successfully!</p>}
            {status === "error" && (
              <p className="text-destructive">{error || "An unknown error occurred."}</p>
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
