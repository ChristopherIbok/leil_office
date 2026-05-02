"use client";

import { useState, useRef } from "react";
import { FileUp, Download, Trash2, Eye, Copy, Check } from "lucide-react";
import { useAuthStore } from "../store/auth-store";
import { apiFetch } from "../lib/api";

interface File {
  id: string;
  name: string;
  url: string;
  version: number;
  mimeType: string;
}

interface FilesPanelProps {
  projectId: string;
  files: File[];
}

export function FilesPanel({ projectId, files: initialFiles }: FilesPanelProps) {
  const session = useAuthStore((state) => state.session);
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function copyLink(url: string, id: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !session) return;

    setUploading(true);
    try {
      // Get presigned URL
      const { uploadUrl, key, fileUrl } = await apiFetch<{ uploadUrl: string; key: string; fileUrl: string }>("/files/presign", {
        method: "POST",
        body: JSON.stringify({
          name: selectedFile.name,
          mimeType: selectedFile.type,
          projectId
        })
      }, session.accessToken);

      // Upload to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: selectedFile,
        headers: { "Content-Type": selectedFile.type }
      });

      // Create file record
      const newFile = await apiFetch<File>("/files", {
        method: "POST",
        body: JSON.stringify({
          name: selectedFile.name,
          url: fileUrl,
          key,
          mimeType: selectedFile.type,
          size: selectedFile.size,
          projectId
        })
      }, session.accessToken);

      setFiles((prev) => [...prev, newFile]);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(fileId: string) {
    if (!session) return;
    
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await apiFetch(`/files/${fileId}`, { method: "DELETE" }, session.accessToken);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  }

  return (
    <section className="rounded-md border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold">Documents</h3>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`flex h-10 cursor-pointer items-center gap-2 rounded-md bg-brand px-3 text-sm font-semibold text-white ${uploading ? "opacity-50" : ""}`}
          >
            <FileUp className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </label>
        </div>
      </div>

      <div className="mt-4 divide-y divide-line text-sm">
        {files.length === 0 ? (
          <p className="py-4 text-sm text-muted">No files uploaded yet.</p>
        ) : (
          files.map((file) => (
            <div key={file.id} className="flex items-center justify-between py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{file.name}</p>
                <p className="text-xs text-muted">v{file.version} &middot; {file.mimeType}</p>
              </div>
              <div className="ml-3 flex items-center gap-1">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Preview"
                  className="rounded-md p-2 text-muted hover:bg-surface"
                >
                  <Eye className="h-4 w-4" />
                </a>
                <a
                  href={file.url}
                  download={file.name}
                  title="Download"
                  className="rounded-md p-2 text-muted hover:bg-surface"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => copyLink(file.url, file.id)}
                  title="Copy link"
                  className="rounded-md p-2 text-muted hover:bg-surface"
                >
                  {copiedId === file.id ? <Check className="h-4 w-4 text-brand" /> : <Copy className="h-4 w-4" />}
                </button>
                {session?.user?.role !== "CLIENT" && (
                  <button
                    onClick={() => handleDelete(file.id)}
                    title="Delete"
                    className="rounded-md p-2 text-muted hover:bg-surface hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}