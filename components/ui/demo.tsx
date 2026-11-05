"use client"

import * as React from "react"
import GlassFolder, { type ArtPreset, type FolderArt, type FolderFile } from "@/components/ui/glass-folder-cards"

type FolderConfig = {
  id: string
  label: string
  meta?: string
  tone: "light" | "dark"
  art: FolderArt
  seed: number
  action: "add" | "more" | "none"
  labelPlacement: "bottom-left" | "top-left" | "top-right"
  files: FolderFile[]
}

const DEFAULT_FOLDERS: FolderConfig[] = [
  {
    id: "folder-1",
    label: "My Files",
    tone: "light",
    art: "aurora",
    seed: 3,
    action: "add",
    labelPlacement: "bottom-left",
    files: [
      { name: "Cover — final", meta: "PNG · 4.8 MB", art: "ember" },
      { name: "Moodboard", meta: "24 images", art: "dusk" },
      { name: "Brief.pdf", meta: "PDF · 1.2 MB" },
    ],
  },
  {
    id: "folder-2",
    label: "Archives",
    tone: "light",
    art: "none",
    seed: 7,
    action: "more",
    labelPlacement: "top-left",
    files: [
      { name: "Lookbook 2024", meta: "38 images", art: "dusk" },
      { name: "Invoices", meta: "12 PDFs" },
      { name: "Shoot — Lisbon", meta: "RAW · 2.1 GB", art: "ember" },
      { name: "Contract.pdf", meta: "PDF · 320 KB" },
    ],
  },
  {
    id: "folder-3",
    label: "Studio Raw",
    meta: "Wed 19 Aug",
    tone: "dark",
    art: "ember",
    seed: 11,
    action: "add",
    labelPlacement: "top-right",
    files: [
      { name: "Stills", meta: "64 images", art: "verdant" },
      { name: "Edit notes", meta: "TXT · 4 KB" },
      { name: "Grade v3", meta: "DRX · 18 MB", art: "aurora" },
    ],
  },
]

const STORAGE_KEY = "glass-folder-cards-state-v1"
const PRESET_LIST: ArtPreset[] = ["aurora", "ember", "dusk", "glacier", "verdant"]

export default function GlassFolderCardsDemo() {
  const [folders, setFolders] = React.useState<FolderConfig[]>(DEFAULT_FOLDERS)
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFolders(parsed)
        }
      }
    } catch {
      // ignore storage errors
    }
    setHydrated(true)
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(folders))
    } catch {
      // ignore storage errors
    }
  }, [folders, hydrated])

  const updateFolderLabel = (id: string, nextLabel: string) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, label: nextLabel } : f)))
  }

  const updateFolderFiles = (id: string, nextFiles: FolderFile[]) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, files: nextFiles } : f)))
  }

  const deleteFolder = (id: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== id))
  }

  const addNewFolder = () => {
    const idx = folders.length + 1
    const artPreset = PRESET_LIST[folders.length % PRESET_LIST.length]
    const nextFolder: FolderConfig = {
      id: "folder-" + Date.now(),
      label: "Folder " + idx,
      tone: idx % 3 === 0 ? "dark" : "light",
      art: artPreset,
      seed: idx * 5 + 1,
      action: "add",
      labelPlacement: "bottom-left",
      files: [{ name: "Welcome.txt", meta: "Just now", art: artPreset }],
    }
    setFolders((prev) => [...prev, nextFolder])
  }

  const resetDefault = () => {
    setFolders(DEFAULT_FOLDERS)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  return (
    <div
      className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-background px-6 py-16"
      style={{ minHeight: "100svh" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 text-foreground opacity-[0.13]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1.1px, transparent 1.4px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Top Quick Toolbar */}
      <div className="relative z-20 mb-10 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={addNewFolder}
          className="cursor-pointer rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background shadow-sm transition hover:opacity-90 active:scale-95"
        >
          + Thêm Folder mới
        </button>
        <button
          type="button"
          onClick={resetDefault}
          className="cursor-pointer rounded-full border border-foreground/15 bg-background/80 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur transition hover:text-foreground active:scale-95"
        >
          Khôi phục mặc định
        </button>
      </div>

      <div className="relative grid max-w-[1180px] grid-cols-1 items-end justify-items-center gap-x-14 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
        {folders.map((folder, index) => (
          <GlassFolder
            key={folder.id}
            label={folder.label}
            meta={folder.meta}
            tone={folder.tone}
            art={folder.art}
            seed={folder.seed}
            action={folder.action}
            labelPlacement={folder.labelPlacement}
            appearDelay={index * 120}
            files={folder.files}
            onLabelChange={(nextLabel) => updateFolderLabel(folder.id, nextLabel)}
            onFilesChange={(nextFiles) => updateFolderFiles(folder.id, nextFiles)}
            menu={[
              { label: "Rename" },
              {
                label: folder.tone === "light" ? "Switch to Dark glass" : "Switch to Light glass",
                onSelect: () =>
                  setFolders((prev) =>
                    prev.map((f) =>
                      f.id === folder.id ? { ...f, tone: f.tone === "light" ? "dark" : "light" } : f,
                    ),
                  ),
              },
              {
                label: "Move to Trash",
                danger: true,
                onSelect: () => deleteFolder(folder.id),
              },
            ]}
          />
        ))}
      </div>

      <p className="relative mt-14 text-center font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        Kéo thả ảnh hoặc bấm + để tải ảnh từ máy · Click/Double-click vào file để mở xem lớn · Bấm ✎ để đổi tên/sửa
      </p>
    </div>
  )
}
