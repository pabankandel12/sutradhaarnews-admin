"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { AdminDialog } from "@/components/admin-dialog";
import { api } from "@/lib/api";

type Ad = { id: string; name: string; placement: string; status: string; imageUrl?: string };

export default function Page() {
  const [items, setItems] = useState<Ad[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [placement, setPlacement] = useState("HEADER");
  const [imageUrl, setImageUrl] = useState("");

  const load = () => api<Ad[]>("/ads").then(setItems);

  useEffect(() => {
    void load().catch(() => {});
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    await api("/ads", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), placement, imageUrl: imageUrl.trim() || undefined, status: "DRAFT" }),
    });
    setDialogOpen(false);
    setName("");
    setPlacement("HEADER");
    setImageUrl("");
    await load();
  };

  return (
    <>
      <Shell title="विज्ञापन व्यवस्थापन" action={<button className="primary-btn" onClick={() => setDialogOpen(true)}>+ नयाँ विज्ञापन</button>}>
        <section className="panel resource">
          <div className="panel-head">
            <div>
              <h2>विज्ञापन</h2>
              <p>{items.length} अभियान</p>
            </div>
          </div>
          <div className="resource-list">
            {items.map((x) => (
              <article key={x.id}>
                <div className="resource-icon">AD</div>
                <div>
                  <h3>{x.name}</h3>
                  <p>{x.placement}</p>
                </div>
                <span>{x.status}</span>
                <button onClick={async () => {
                  await api(`/ads/${x.id}`, { method: "PATCH", body: JSON.stringify({ name: x.name, placement: x.placement, imageUrl: x.imageUrl, status: x.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }) });
                  await load();
                }}>{x.status === "ACTIVE" ? "रोक्नुहोस्" : "सक्रिय"}</button>
              </article>
            ))}
          </div>
        </section>
      </Shell>

      <AdminDialog
        open={dialogOpen}
        title="नयाँ विज्ञापन थप्नुहोस्"
        submitLabel="सेभ गर्नुहोस्"
        onClose={() => setDialogOpen(false)}
        onSubmit={() => { void create(); }}
        fields={[
          { type: "text", label: "विज्ञापन नाम", value: name, onChange: setName, placeholder: "मुख्य विज्ञापन", required: true },
          { type: "select", label: "स्थान", value: placement, onChange: setPlacement, options: [{ value: "HEADER", label: "HEADER" }, { value: "SIDEBAR", label: "SIDEBAR" }, { value: "INLINE", label: "INLINE" }] },
          { type: "text", label: "ब्यानर URL", value: imageUrl, onChange: setImageUrl, placeholder: "https://..." },
        ]}
      />
    </>
  );
}

