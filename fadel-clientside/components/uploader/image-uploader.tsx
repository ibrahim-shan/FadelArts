"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type UploadItem = {
  file?: File;
  name: string;
  path?: string; // storage key
  url: string; // public URL
  progress: number; // 0-100
  status: "queued" | "uploading" | "done" | "error";
  error?: string;
};

type Props = {
  value?: string[];
  onChange?: (urls: string[]) => void;
  onUploaded?: (urls: string[]) => void;
  bucket?: string;
  pathPrefix?: string;
  multiple?: boolean;
  accept?: string;
  className?: string;
};

export default function ImageUploader({
  value,
  onChange,
  onUploaded,
  bucket = (process.env.NEXT_PUBLIC_SUPABASE_BUCKET as string) ?? "products",
  pathPrefix = `uploads/${Date.now()}`,
  multiple = true,
  accept = "image/*",
  className,
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const controlled = Array.isArray(value) && typeof onChange === "function";
  const [items, setItems] = React.useState<UploadItem[]>(() =>
    (value ?? []).map((url) => ({
      name: url.split("/").pop() || "image",
      url,
      progress: 100,
      status: "done",
    }))
  );
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (controlled) {
      setItems(
        (value ?? []).map((url) => ({
          name: url.split("/").pop() || "image",
          url,
          progress: 100,
          status: "done",
        }))
      );
    }
  }, [controlled, value]);

  const commit = (next: UploadItem[]) => {
    setItems(next);
    const urls = next
      .filter((i) => i.status === "done" && i.url)
      .map((i) => i.url);
    onChange?.(urls);
  };

  const pickFiles = () => inputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    const next = files.map((file) => ({
      file,
      name: file.name,
      url: "",
      progress: 0,
      status: "queued" as const,
    }));
    commit([...items, ...next]);
    void uploadAll(next);
  };

  async function uploadAll(queue: UploadItem[]) {
    if (!queue.length) return;
    setBusy(true);
    const newlyUploaded: string[] = [];
    await Promise.all(
      queue.map(async (it, idx) => {
        if (!it.file) return;
        try {
          const safeName = it.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
          // Sanitize pathPrefix: remove leading slashes and any duplicated bucket segment
          let prefix = (pathPrefix || "").replace(/^\/+/, "");
          if (prefix.startsWith(`${bucket}/`)) {
            prefix = prefix.slice(bucket.length + 1);
          }
          const key = `${
            prefix ? prefix + "/" : ""
          }${Date.now()}_${idx}_${safeName}`;
          try {
          } catch {}
          updateItem(it, { status: "uploading", progress: 10 });
          const { error } = await supabase.storage
            .from(bucket)
            .upload(key, it.file, {
              cacheControl: "3600",
              upsert: true,
              contentType: it.file.type,
            });
          if (error) throw error;
          const { data } = supabase.storage.from(bucket).getPublicUrl(key);
          const url = data.publicUrl;
          newlyUploaded.push(url);
          updateItem(it, { status: "done", progress: 100, url, path: key });
          try {
          } catch {}
        } catch (e: any) {
          try {
          } catch {}
          updateItem(it, { status: "error", error: String(e?.message || e) });
        }
      })
    );
    setBusy(false);
    if (newlyUploaded.length) onUploaded?.(newlyUploaded);
  }

  function updateItem(target: UploadItem, patch: Partial<UploadItem>) {
    const next = items.map((i) => (i === target ? { ...i, ...patch } : i));
    commit(next);
  }

  async function removeAt(index: number) {
    const it = items[index];
    if (it.path) {
      await supabase.storage
        .from(bucket)
        .remove([it.path])
        .catch(() => {});
    }
    const next = items.slice();
    next.splice(index, 1);
    commit(next);
  }

  function move(index: number, dir: -1 | 1) {
    const next = items.slice();
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= next.length) return;
    const [spliced] = next.splice(index, 1);
    next.splice(newIndex, 0, spliced);
    commit(next);
  }

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={onFileChange}
      />

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={pickFiles}
          disabled={busy}
        >
          Choose {multiple ? "Images" : "Image"}
        </Button>
      </div>

      {!!items.length && (
        <ul className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
          {items.map((it, i) => (
            <li
              key={`${it.name}-${i}`}
              className="rounded-md border border-border p-2"
            >
              <div className="relative aspect-4/3 w-full overflow-hidden rounded bg-accent/20">
                {it.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={it.url}
                    alt={it.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                    {it.status}
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                  >
                    ←
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => move(i, 1)}
                    disabled={i === items.length - 1}
                  >
                    →
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {it.progress > 0 && it.progress < 100 && (
                    <span className="text-xs text-muted-foreground">
                      {it.progress}%
                    </span>
                  )}
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => removeAt(i)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
