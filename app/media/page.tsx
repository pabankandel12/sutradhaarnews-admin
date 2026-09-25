"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faPlay, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Shell } from "@/components/shell";
import { MediaUpload } from "@/components/media-upload";
import { api } from "@/lib/api";

type Media = { id: string; type: "IMAGE" | "VIDEO"; title?: string; key: string; mimeType: string; size: number; deliveryUrl: string; createdAt: string };

export default function MediaPage() {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const load = () => api<Media[]>("/media").then(setItems).finally(() => setLoading(false));

  useEffect(() => {
    void load().catch(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    await api(`/media/${id}`, { method: "DELETE" });
    setPendingDeleteId(null);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <>
      <Shell title="मिडिया पुस्तकालय">
        <div className="media-manager">
          <section className="panel media-upload-panel">
            <div className="panel-head">
              <div>
                <h2>Cloudinary अपलोड</h2>
                <p>तस्बिर अधिकतम १५ MB · भिडियो अधिकतम १०० MB</p>
              </div>
            </div>
            <MediaUpload onUploaded={() => void load()} />
          </section>

          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>अपलोड गरिएका फाइल</h2>
                <p>{items.length} मिडिया</p>
              </div>
            </div>

            {loading ? (
              <div className="media-empty">लोड हुँदैछ...</div>
            ) : items.length === 0 ? (
              <div className="media-empty">अहिलेसम्म कुनै मिडिया अपलोड भएको छैन।</div>
            ) : (
              <div className="media-grid">
                {items.map((item) => (
                  <article key={item.id}>
                    <div className="media-thumb">
                      {item.type === "IMAGE" ? (
                        <img src={item.deliveryUrl} alt={item.title || ""} />
                      ) : (
                        <>
                          <video src={item.deliveryUrl} />
                          <FontAwesomeIcon className="video-play" icon={faPlay} />
                        </>
                      )}
                    </div>
                    <div>
                      <span>
                        <FontAwesomeIcon icon={item.type === "IMAGE" ? faImage : faPlay} /> {item.type === "IMAGE" ? "तस्बिर" : "भिडियो"}
                      </span>
                      <h3>{item.title || item.key.split("/").pop()}</h3>
                      <p>{(item.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button onClick={() => setPendingDeleteId(item.id)} aria-label="हटाउनुहोस्">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </Shell>

      {pendingDeleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.52)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }} onClick={() => setPendingDeleteId(null)}>
          <div style={{ width: "min(400px, 100%)", background: "#111827", color: "#e5e7eb", borderRadius: 16, padding: 20 }} onClick={(event) => event.stopPropagation()}>
            <h3 style={{ marginTop: 0 }}>मिडिया हटाउने?</h3>
            <p>यो फाइल स्थायी रूपमा हटाइनेछ।</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
              <button type="button" onClick={() => setPendingDeleteId(null)} style={{ background: "#374151", color: "#fff", border: 0, borderRadius: 999, padding: "10px 18px", cursor: "pointer" }}>Cancel</button>
              <button type="button" onClick={() => { void remove(pendingDeleteId); }} style={{ background: "#f87171", color: "#fff", border: 0, borderRadius: 999, padding: "10px 18px", cursor: "pointer" }}>हटाउनुहोस्</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

