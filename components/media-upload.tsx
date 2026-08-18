"use client";
import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faImage, faVideo } from "@fortawesome/free-solid-svg-icons";
import { uploadMedia, UploadedMedia } from "@/lib/upload";

export function MediaUpload({ accept = "image/*,video/*", compact = false, onUploaded }: { accept?: string; compact?: boolean; onUploaded?: (media: UploadedMedia) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [uploaded, setUploaded] = useState<UploadedMedia | null>(null);
  const choose = async (file?: File) => {
    if (!file) return;
    setError(""); setProgress(0);
    try { const media = await uploadMedia(file, setProgress); setUploaded(media); onUploaded?.(media); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "अपलोड हुन सकेन"); }
    finally { setProgress(null); }
  };
  return <div className={compact ? "media-upload compact" : "media-upload"}>
    <input ref={input} type="file" accept={accept} hidden onChange={event => choose(event.target.files?.[0])} />
    <button type="button" className="upload-box" onClick={() => input.current?.click()} disabled={progress !== null}>
      <FontAwesomeIcon icon={uploaded?.type === "VIDEO" ? faVideo : uploaded ? faImage : faCloudArrowUp} />
      <b>{progress !== null ? `अपलोड हुँदैछ ${progress}%` : uploaded ? "अपलोड सफल" : "तस्बिर वा भिडियो छान्नुहोस्"}</b>
      <span>{uploaded?.key || "JPG, PNG, WebP, GIF, MP4, WebM वा MOV"}</span>
      {progress !== null && <i style={{ width: `${progress}%` }} />}
    </button>
    {error && <p className="upload-error">{error}</p>}
  </div>;
}
