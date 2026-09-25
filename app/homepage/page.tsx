"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faPlus, faSave } from "@fortawesome/free-solid-svg-icons";
import { Shell } from "@/components/shell";
import { AdminDialog } from "@/components/admin-dialog";
import { api } from "@/lib/api";

type Section = {
  id: string;
  name: string;
  slug: string;
  type: string;
  title?: string;
  order: number;
  active: boolean;
  items: Array<{ article: { id: string; title: string } }>;
};

type Article = { id: string; title: string; status: string };

export default function Homepage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("CUSTOM");
  const [selectedIds, setSelectedIds] = useState("");
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  const load = () => Promise.all([
    api<Section[]>("/homepage/admin"),
    api<Article[]>("/articles?status=PUBLISHED"),
  ]).then(([s, a]) => {
    setSections(s);
    setArticles(a);
  });

  useEffect(() => {
    void load().catch(() => {});
  }, []);

  const add = async () => {
    if (!name.trim()) return;
    await api("/homepage/sections", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), slug: `${Date.now()}`, type, order: sections.length }),
    });
    setDialogOpen(false);
    setName("");
    setType("CUSTOM");
    await load();
  };

  const toggle = async (s: Section) => {
    await api(`/homepage/sections/${s.id}`, { method: "PATCH", body: JSON.stringify({ active: !s.active }) });
    await load();
  };

  const choose = (s: Section) => {
    setEditingSection(s);
    setSelectedIds(s.items.map((item) => item.article.id).join(","));
    setError("");
    setDialogOpen(true);
  };

  const saveSelection = async () => {
    if (!editingSection) return;
    const articleIds = selectedIds.split(",").map((id) => id.trim()).filter(Boolean);
    try {
      await api(`/homepage/sections/${editingSection.id}/items`, { method: "PUT", body: JSON.stringify({ articleIds }) });
      setMsg("गृहपृष्ठ सुरक्षित भयो");
      setDialogOpen(false);
      setSelectedIds("");
      setEditingSection(null);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "गृहपृष्ठ सुरक्षित गर्न सकिएन");
    }
  };

  return (
    <>
      <Shell title="गृहपृष्ठ व्यवस्थापन" action={<button className="primary-btn" onClick={() => setDialogOpen(true)}><FontAwesomeIcon icon={faPlus}/> नयाँ खण्ड</button>}>
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>गृहपृष्ठका खण्डहरू</h2>
              <p>क्रम र सामग्री API मा सुरक्षित हुन्छ</p>
            </div>
          </div>
          {msg && <div className="save-message"><FontAwesomeIcon icon={faSave}/> {msg}</div>}
          <div className="section-sort">
            {sections.map((s, i) => (
              <article key={s.id}>
                <FontAwesomeIcon icon={faBars}/>
                <b>{i + 1}</b>
                <div>
                  <h3>{s.title || s.name}</h3>
                  <p>{s.items.length} समाचार · {s.type}</p>
                </div>
                <label>
                  <input type="checkbox" checked={s.active} onChange={() => void toggle(s)}/>
                  <span/>
                </label>
                <button onClick={() => choose(s)}>समाचार छान्नुहोस्</button>
              </article>
            ))}
          </div>
        </section>
      </Shell>

      <AdminDialog
        open={dialogOpen}
        title={editingSection ? "समाचार छान्नुहोस्" : "नयाँ खण्ड थप्नुहोस्"}
        submitLabel={editingSection ? "सुरक्षित गर्नुहोस्" : "थप्नुहोस्"}
        onClose={() => {
          setDialogOpen(false);
          setSelectedIds("");
          setEditingSection(null);
          setError("");
        }}
        onSubmit={() => {
          if (editingSection) void saveSelection(); else void add();
        }}
        fields={
          editingSection
            ? []
            : [
                { type: "text", label: "खण्ड नाम", value: name, onChange: setName, placeholder: "मुख्य समाचार", required: true },
                { type: "select", label: "प्रकार", value: type, onChange: setType, options: [
                  { value: "HERO", label: "HERO" },
                  { value: "LATEST", label: "LATEST" },
                  { value: "TRENDING", label: "TRENDING" },
                  { value: "CATEGORY", label: "CATEGORY" },
                  { value: "VIDEO", label: "VIDEO" },
                  { value: "OPINION", label: "OPINION" },
                  { value: "CUSTOM", label: "CUSTOM" },
                ] },
              ]
        }
      >
        {editingSection && (
          <div style={{ marginTop: 16, display: "grid", gap: 8, maxHeight: 280, overflowY: "auto" }}>
            {articles.length === 0 ? <p>कुनै प्रकाशित समाचार भेटिएन।</p> : articles.map((article) => {
              const checked = selectedIds.split(",").includes(article.id);
              return <label key={article.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: 8, borderRadius: 8, background: "#0f172a", color: "#cbd5e1" }}>
                <input type="checkbox" checked={checked} onChange={(event) => {
                  const ids = new Set(selectedIds.split(",").map((id) => id.trim()).filter(Boolean));
                  if (event.target.checked) ids.add(article.id); else ids.delete(article.id);
                  setSelectedIds([...ids].join(","));
                }} />
                <span>{article.title}</span>
              </label>;
            })}
            {error && <p style={{ color: "#fca5a5", margin: "4px 0 0" }}>{error}</p>}
          </div>
        )}
        {!editingSection && error && (
          <p style={{ color: "#fca5a5", margin: "12px 0 0" }}>{error}</p>
        )}
      </AdminDialog>
    </>
  );
}

