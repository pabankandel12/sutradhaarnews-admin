"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { AdminDialog } from "@/components/admin-dialog";
import { api } from "@/lib/api";

type Headline = {
  id: string;
  title: string;
  summary?: string | null;
  url?: string | null;
  isBreaking: boolean;
  active: boolean;
  order: number;
  createdAt: string;
};

export default function HeadlinesPage() {
  const [items, setItems] = useState<Headline[]>([]);
  const [message, setMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);

  const load = () => api<Headline[]>("/headline/admin").then(setItems).catch(() => setItems([]));

  useEffect(() => {
    void load();
  }, []);

  const createHeadline = async () => {
    if (!title.trim()) return;
    await api("/headline", {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        summary: summary.trim() || undefined,
        url: url.trim() || undefined,
        isBreaking,
        active: true,
        order: items.length,
      }),
    });
    setMessage("शीर्षक सुरक्षित भयो");
    setDialogOpen(false);
    setTitle("");
    setSummary("");
    setUrl("");
    setIsBreaking(false);
    await load();
  };

  const toggleActive = async (headline: Headline) => {
    await api(`/headline/${headline.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !headline.active }),
    });
    await load();
  };

  const updateOrder = async (headline: Headline, delta: number) => {
    const next = Math.max(0, headline.order + delta);
    await api(`/headline/${headline.id}`, {
      method: "PATCH",
      body: JSON.stringify({ order: next }),
    });
    await load();
  };

  return (
    <>
      <Shell title="शीर्षक व्यवस्थापन" action={<button className="primary-btn" onClick={() => setDialogOpen(true)}>+ नयाँ शीर्षक</button>}>
        <section className="panel resource">
          <div className="panel-head">
            <div>
              <h2>हेडलाइन सूची</h2>
              <p>{items.length} शीर्षकहरू</p>
            </div>
          </div>
          {message && <div className="save-message">{message}</div>}
          <div className="resource-list">
            {items.map((headline, index) => (
              <article key={headline.id}>
                <div className="resource-icon">{String(index + 1).padStart(2, "0")}</div>
                <div>
                  <h3>{headline.title}</h3>
                  <p>
                    {headline.summary || "कोई सारांश छैन"} · {headline.isBreaking ? "ब्रेकिङ" : "सामान्य"}
                  </p>
                </div>
                <span>{headline.active ? "सक्रिय" : "असक्रिय"}</span>
                <button onClick={() => void toggleActive(headline)}>{headline.active ? "असक्रिय बनाउनुहोस्" : "सक्रिय बनाउनुहोस्"}</button>
                <button onClick={() => void updateOrder(headline, -1)}>↑</button>
                <button onClick={() => void updateOrder(headline, 1)}>↓</button>
              </article>
            ))}
          </div>
        </section>
      </Shell>

      <AdminDialog
        open={dialogOpen}
        title="नयाँ शीर्षक थप्नुहोस्"
        submitLabel="सेभ गर्नुहोस्"
        onClose={() => setDialogOpen(false)}
        onSubmit={() => { void createHeadline(); }}
        fields={[
          { type: "text", label: "शीर्षक", value: title, onChange: setTitle, placeholder: "मुख्य शीर्षक", required: true },
          { type: "textarea", label: "संक्षिप्त विवरण", value: summary, onChange: setSummary, placeholder: "थोडै विवरण" },
          { type: "text", label: "लिंक URL", value: url, onChange: setUrl, placeholder: "https://example.com" },
          { type: "select", label: "प्रकार", value: isBreaking ? "breaking" : "normal", onChange: (value) => setIsBreaking(value === "breaking"), options: [{ value: "normal", label: "सामान्य" }, { value: "breaking", label: "ब्रेकिङ" }] },
        ]}
      />
    </>
  );
}
