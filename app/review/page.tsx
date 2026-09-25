"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/shell";
import { Status } from "@/components/status";
import { api } from "@/lib/api";
import "../review-fixes.css";

type Article = {
  id: string;
  title: string;
  status: string;
  author: { name: string };
  category: { name: string };
  updatedAt: string;
};

export default function Review() {
  const [items, setItems] = useState<Article[]>([]);
  const [selected, setSelected] = useState<Article | null>(null);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = () => api<Article[]>("/articles?status=IN_REVIEW").then(setItems);

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : "समाचार लोड भएन"));
  }, []);

  const [decisionNote, setDecisionNote] = useState("");
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<{ article: Article; status: "APPROVED" | "CHANGES_REQUESTED" } | null>(null);

  const openDecision = (article: Article, status: "APPROVED" | "CHANGES_REQUESTED") => {
    setPendingDecision({ article, status });
    setDecisionNote("");
    setDecisionOpen(true);
  };

  const confirmDecision = async () => {
    if (!pendingDecision) return;
    const { article, status } = pendingDecision;
    const note = status === "CHANGES_REQUESTED" ? decisionNote.trim() : undefined;
    if (status === "CHANGES_REQUESTED" && !note) return;
    setBusyId(article.id);
    try {
      await api(`/articles/${article.id}/transition`, {
        method: "POST",
        body: JSON.stringify({ status, note }),
      });
      setMessage(status === "APPROVED" ? "समाचार स्वीकृत भयो।" : "समाचार सुधारका लागि फिर्ता पठाइयो।");
      setSelected(null);
      setDecisionOpen(false);
      setPendingDecision(null);
      setDecisionNote("");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "स्थिति परिवर्तन भएन");
    } finally {
      setBusyId("");
    }
  };

  const changeStatus = async (article: Article, status: "APPROVED" | "CHANGES_REQUESTED") => {
    openDecision(article, status);
  };

  const approveAndPublish = async (article: Article) => {
    setBusyId(article.id);
    try {
      await api(`/articles/${article.id}/transition`, { method: "POST", body: JSON.stringify({ status: "APPROVED" }) });
      await api(`/articles/${article.id}/transition`, { method: "POST", body: JSON.stringify({ status: "PUBLISHED" }) });
      setMessage("समाचार स्वीकृत र प्रकाशित भयो। वेबसाइटमा केही सेकेन्डमा देखिनेछ।");
      setSelected(null);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "समाचार प्रकाशित भएन");
    } finally {
      setBusyId("");
    }
  };

  return <>
    <Shell title="सम्पादकीय समीक्षा">
      <div className="review-grid">
        <section className="panel review-list">
          <div className="panel-head"><div><h2>समीक्षाको पर्खाइमा</h2><p>{items.length} समाचार</p></div></div>
          {message && <div className="save-message">{message}</div>}
          {items.map((article) => <article key={article.id} onClick={() => setSelected(article)}>
            <Status value={article.status} />
            <h3>{article.title}</h3>
            <p>{article.author.name} · {article.category.name} · {new Date(article.updatedAt).toLocaleDateString("ne-NP")}</p>
            <div className="review-inline-actions">
              <button disabled={busyId === article.id} onClick={(event) => { event.stopPropagation(); changeStatus(article, "CHANGES_REQUESTED"); }}>अस्वीकृत / सुधार</button>
              <button className="approve" disabled={busyId === article.id} onClick={(event) => { event.stopPropagation(); changeStatus(article, "APPROVED"); }}>स्वीकृत</button>
              <button className="publish" disabled={busyId === article.id} onClick={(event) => { event.stopPropagation(); approveAndPublish(article); }}>स्वीकृत र प्रकाशित</button>
            </div>
          </article>)}
          {!items.length && <div className="media-empty">समीक्षाको पर्खाइमा कुनै समाचार छैन।</div>}
        </section>
        <section className="panel empty-review">
          {selected ? <><h2>{selected.title}</h2><p>{selected.author.name} · {selected.category.name}</p><Status value={selected.status} /></> : <><div>✓</div><h2>समाचार छान्नुहोस्</h2><p>स्वीकृत र अस्वीकृत विकल्प प्रत्येक समाचारमै उपलब्ध छन्।</p></>}
        </section>
      </div>
    </Shell>

    {decisionOpen && pendingDecision && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.52)", display: "grid", placeItems: "center", zIndex: 50, padding: 20 }} onClick={() => setDecisionOpen(false)}>
        <div style={{ width: "min(500px, 100%)", background: "#111827", borderRadius: 16, padding: 20, color: "#e5e7eb" }} onClick={(event) => event.stopPropagation()}>
          <h3 style={{ marginTop: 0 }}>{pendingDecision.status === "APPROVED" ? "समाचार स्वीकृत गर्नुहोस्" : "कारण लेख्नुहोस्"}</h3>
          {pendingDecision.status === "CHANGES_REQUESTED" ? (
            <textarea
              value={decisionNote}
              onChange={(event) => setDecisionNote(event.target.value)}
              rows={4}
              placeholder="समाचारमा सुधार गर्नुपर्ने कारण..."
              style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #374151", background: "#0f172a", color: "#fff", resize: "vertical" }}
            />
          ) : (
            <p>यो समाचारलाई स्वीकृत गर्न तपाईं सहमत हुनुहुन्छ?</p>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button type="button" onClick={() => setDecisionOpen(false)} style={{ background: "#374151", color: "#fff", border: 0, borderRadius: 999, padding: "10px 18px", cursor: "pointer" }}>Cancel</button>
            <button type="button" onClick={() => { void confirmDecision(); }} style={{ background: "#60a5fa", color: "#0f172a", border: 0, borderRadius: 999, padding: "10px 18px", cursor: "pointer", fontWeight: 700 }}>
              {pendingDecision.status === "APPROVED" ? "स्वीकृत" : "पठाउनुहोस्"}
            </button>
          </div>
        </div>
      </div>
    )}
  </>;
}
