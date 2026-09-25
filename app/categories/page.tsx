"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { AdminDialog } from "@/components/admin-dialog";
import { api } from "@/lib/api";

type Category = { id: string; name: string; slug: string; _count?: { articles: number } };

export default function Page() {
  const [items, setItems] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  const load = () => api<Category[]>("/categories").then(setItems);

  useEffect(() => {
    void load().catch(() => {});
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDialogOpen(true);
  };

  const openEdit = (item: Category) => {
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setDialogOpen(true);
  };

  const save = async () => {
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    if (!trimmedName || !trimmedSlug) return;

    if (editingId) {
      await api(`/categories/${editingId}`, { method: "PATCH", body: JSON.stringify({ name: trimmedName, slug: trimmedSlug }) });
    } else {
      await api("/categories", { method: "POST", body: JSON.stringify({ name: trimmedName, slug: trimmedSlug }) });
    }

    setDialogOpen(false);
    setEditingId(null);
    setName("");
    setSlug("");
    await load();
  };

  return (
    <>
      <Shell title="श्रेणी व्यवस्थापन" action={<button className="primary-btn" onClick={openCreate}>+ नयाँ श्रेणी</button>}>
        <section className="panel resource">
          <div className="panel-head">
            <div>
              <h2>समाचार श्रेणी</h2>
              <p>{items.length} सक्रिय श्रेणी</p>
            </div>
          </div>
          <div className="resource-list">
            {items.map((x, i) => (
              <article key={x.id}>
                <div className="resource-icon">{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <h3>{x.name}</h3>
                  <p>/{x.slug} · {x._count?.articles ?? 0} समाचार</p>
                </div>
                <span>सक्रिय</span>
                <button onClick={() => openEdit(x)}>सम्पादन</button>
              </article>
            ))}
          </div>
        </section>
      </Shell>

      <AdminDialog
        open={dialogOpen}
        title={editingId ? "श्रेणी सम्पादन" : "नयाँ श्रेणी थप्नुहोस्"}
        submitLabel="सेभ गर्नुहोस्"
        onClose={() => {
          setDialogOpen(false);
          setEditingId(null);
          setName("");
          setSlug("");
        }}
        onSubmit={() => { void save(); }}
        fields={[
          { type: "text", label: "श्रेणीको नाम", value: name, onChange: setName, placeholder: "राजनीति", required: true },
          { type: "text", label: "URL slug", value: slug, onChange: setSlug, placeholder: "rajniti" },
        ]}
      />
    </>
  );
}

