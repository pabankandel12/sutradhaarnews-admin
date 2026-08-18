import { api } from "./api";

export type UploadedMedia = { id: string; key: string; url: string; deliveryUrl?: string; type: "IMAGE" | "VIDEO" };

export async function uploadMedia(file: File, onProgress?: (percent: number) => void) {
  const signed = await api<{ key: string; uploadUrl: string; type: "IMAGE" | "VIDEO" }>("/media/upload-url", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size }),
  });

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", signed.uploadUrl);
    request.setRequestHeader("Content-Type", file.type);
    request.upload.onprogress = (event) => event.lengthComputable && onProgress?.(Math.round((event.loaded / event.total) * 100));
    request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error(`R2 upload failed (${request.status})`));
    request.onerror = () => reject(new Error("R2 upload network error"));
    request.send(file);
  });

  return api<UploadedMedia>("/media/complete", {
    method: "POST",
    body: JSON.stringify({ key: signed.key, mimeType: file.type, size: file.size, type: signed.type, title: file.name }),
  });
}
