import { api } from "./api";

export type UploadedMedia = { id: string; key: string; url: string; deliveryUrl?: string; type: "IMAGE" | "VIDEO" };

export async function uploadMedia(file: File, onProgress?: (percent: number) => void) {
  const signed = await api<{ key: string; uploadUrl: string; type: "IMAGE" | "VIDEO"; uploadParams: Record<string, string | number> }>("/media/upload-url", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, mimeType: file.type, size: file.size }),
  });

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", signed.uploadUrl);
    request.upload.onprogress = (event) => event.lengthComputable && onProgress?.(Math.round((event.loaded / event.total) * 100));
    request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error(`Cloudinary upload failed (${request.status})`));
    request.onerror = () => reject(new Error("Cloudinary upload network error"));
    const form = new FormData();
    Object.entries(signed.uploadParams).forEach(([key, value]) => form.append(key, String(value)));
    form.append("file", file);
    request.send(form);
  });

  return api<UploadedMedia>("/media/complete", {
    method: "POST",
    body: JSON.stringify({ key: signed.key, mimeType: file.type, size: file.size, type: signed.type, title: file.name }),
  });
}
