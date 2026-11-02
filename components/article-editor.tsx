"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBold, faImage, faItalic, faLink, faListOl, faListUl, faQuoteLeft, faRotateLeft, faUnderline } from "@fortawesome/free-solid-svg-icons";
import { api } from "@/lib/api";
import { MediaUpload } from "@/components/media-upload";
import type { UploadedMedia } from "@/lib/upload";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };
type Content = { text?: string; html?: string };
type Article = { id:string; title:string; slug:string; excerpt?:string; content:Content; type:string; categoryId:string; featuredImageId?:string; status:string; videoUrl?:string; seoTitle?:string; seoDescription?:string; canonicalUrl?:string; breaking:boolean; featured:boolean; allowComments:boolean; tags:Tag[] };

const makeSlug = (value: string) => value.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
const wordCount = (html: string) => html.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;

export function ArticleEditor({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const editor = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]), [tags, setTags] = useState<Tag[]>([]);
  const [title, setTitle] = useState(""), [slug, setSlug] = useState(""), [excerpt, setExcerpt] = useState(""), [html, setHtml] = useState("<p></p>");
  const [categoryId, setCategoryId] = useState(""), [featuredImageId, setFeaturedImageId] = useState(""), [tagIds, setTagIds] = useState<string[]>([]);
  const [contentType, setContentType] = useState("ARTICLE"), [videoUrl, setVideoUrl] = useState(""), [seoTitle, setSeoTitle] = useState(""), [seoDescription, setSeoDescription] = useState(""), [canonicalUrl, setCanonicalUrl] = useState("");
  const [featured, setFeatured] = useState(false), [breaking, setBreaking] = useState(false), [allowComments, setAllowComments] = useState(true), [status, setStatus] = useState("DRAFT"), [message, setMessage] = useState(""), [preview, setPreview] = useState(false), [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api<Category[]>("/categories"), api<Tag[]>("/tags")]).then(([categoryData, tagData]) => { setCategories(categoryData); setTags(tagData); if (categoryData[0] && !categoryId) setCategoryId(categoryData[0].id); }).catch((error) => setMessage(error.message));
    if (!articleId) return;
    api<Article>(`/articles/${articleId}`).then((article) => {
      setTitle(article.title); setSlug(article.slug); setExcerpt(article.excerpt || ""); setHtml(article.content?.html || article.content?.text?.split("\n").filter(Boolean).map((item) => `<p>${item}</p>`).join("") || "<p></p>");
      setCategoryId(article.categoryId); setFeaturedImageId(article.featuredImageId || ""); setStatus(article.status); setTagIds(article.tags.map((tag) => tag.id)); setContentType(article.type); setVideoUrl(article.videoUrl || ""); setSeoTitle(article.seoTitle || ""); setSeoDescription(article.seoDescription || ""); setCanonicalUrl(article.canonicalUrl || ""); setFeatured(article.featured); setBreaking(article.breaking); setAllowComments(article.allowComments);
    }).catch((error) => setMessage(error.message));
  }, [articleId]);

  useEffect(() => { if (editor.current && editor.current.innerHTML !== html) editor.current.innerHTML = html; }, [html]);
  const sync = () => setHtml(editor.current?.innerHTML || "");
  const command = (name: string, value?: string) => { editor.current?.focus(); document.execCommand(name, false, value); sync(); };
  const addLink = () => { const url = window.prompt("लिङ्क URL राख्नुहोस्"); if (url) command("createLink", url); };
  const insertMedia = (media: UploadedMedia) => {
    const url = media.deliveryUrl || media.url;
    editor.current?.focus();
    if (media.type === "IMAGE") command("insertHTML", `<figure><img src="${url}" alt=""/><figcaption>तस्बिर: सूत्रधार न्यूज</figcaption></figure><p></p>`);
    else command("insertHTML", `<p><a href="${url}" target="_blank" rel="noopener noreferrer">भिडियो हेर्नुहोस्</a></p><p></p>`);
  };
  const payload = () => ({ title, slug: slug || makeSlug(title), excerpt, content: { type: "rich-text", version: 1, html, text: editor.current?.innerText || "" }, type: contentType, categoryId, tagIds, featuredImageId: featuredImageId || undefined, videoUrl: videoUrl || undefined, seoTitle: seoTitle || undefined, seoDescription: seoDescription || undefined, canonicalUrl: canonicalUrl || undefined, featured, breaking, allowComments });
  const save = async (event: FormEvent | undefined, sendForReview = false) => {
    event?.preventDefault();
    if (!title.trim() || !categoryId || !wordCount(html)) return setMessage("शीर्षक, श्रेणी र समाचार सामग्री आवश्यक छ।" );
    setSaving(true); setMessage("");
    try {
      const article = await api<{ id: string }>(articleId ? `/articles/${articleId}` : "/articles", { method: articleId ? "PATCH" : "POST", body: JSON.stringify(payload()) });
      if (sendForReview && status !== "IN_REVIEW") await api(`/articles/${article.id}/transition`, { method: "POST", body: JSON.stringify({ status: "IN_REVIEW" }) });
      setMessage(sendForReview ? "समाचार समीक्षाका लागि पठाइयो।" : "मस्यौदा सुरक्षित भयो।");
      window.setTimeout(() => router.push("/articles"), 700);
    } catch (error) { setMessage(error instanceof Error ? error.message : "समाचार सुरक्षित भएन"); } finally { setSaving(false); }
  };
  const words = wordCount(html);

  return <form className="editor-layout newsroom-editor" onSubmit={(event) => { void save(event); }}>
    <section>
      <div className="editor-card editor-heading-card"><label>समाचार शीर्षक<input value={title} onChange={(event) => { setTitle(event.target.value); if (!articleId) setSlug(makeSlug(event.target.value)); }} placeholder="स्पष्ट र पाठकमैत्री शीर्षक लेख्नुहोस्" required /></label><label>संक्षिप्त विवरण<textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} placeholder="समाचारको छोटो सारांश..." /></label></div>
      <div className="editor-card rich-editor-card"><div className="editor-topline"><div><h3>समाचार सामग्री</h3><small>{words} शब्द · स्वतः मस्यौदा सुरक्षित गर्न ‘सुरक्षित’ थिच्नुहोस्</small></div><button type="button" className="preview-toggle" onClick={() => setPreview(!preview)}>{preview ? "सम्पादनमा फर्कनुहोस्" : "पूर्वावलोकन"}</button></div>
        {preview ? <article className="editor-preview"><span>{categories.find((item) => item.id === categoryId)?.name}</span><h1>{title || "शीर्षक"}</h1>{excerpt && <p>{excerpt}</p>}<div dangerouslySetInnerHTML={{ __html: html }} /></article> : <><div className="editor-toolbar" role="toolbar" aria-label="समाचार सम्पादन उपकरण"><select aria-label="पाठ प्रकार" defaultValue="p" onChange={(event) => command("formatBlock", event.target.value)}><option value="p">सामान्य पाठ</option><option value="h2">मुख्य उपशीर्षक</option><option value="h3">उपशीर्षक</option></select><button type="button" title="बाक्लो" onClick={() => command("bold")}><FontAwesomeIcon icon={faBold} /></button><button type="button" title="ढल्केको" onClick={() => command("italic")}><FontAwesomeIcon icon={faItalic} /></button><button type="button" title="रेखांकित" onClick={() => command("underline")}><FontAwesomeIcon icon={faUnderline} /></button><button type="button" title="लिङ्क" onClick={addLink}><FontAwesomeIcon icon={faLink} /></button><button type="button" title="उद्धरण" onClick={() => command("formatBlock", "blockquote")}><FontAwesomeIcon icon={faQuoteLeft} /></button><button type="button" title="सूची" onClick={() => command("insertUnorderedList")}><FontAwesomeIcon icon={faListUl} /></button><button type="button" title="क्रमबद्ध सूची" onClick={() => command("insertOrderedList")}><FontAwesomeIcon icon={faListOl} /></button><button type="button" title="फेरि गर्नुहोस्" onClick={() => command("undo")}><FontAwesomeIcon icon={faRotateLeft} /></button></div><div ref={editor} className="rich-editor" contentEditable suppressContentEditableWarning onInput={sync} data-placeholder="समाचारको विस्तृत सामग्री यहाँ लेख्नुहोस्…" /></>}
      </div>
      <div className="editor-card seo-card"><h3>SEO र प्रकाशन तयारी</h3><label>SEO शीर्षक <small>{seoTitle.length}/60</small><input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} /></label><label>SEO विवरण <small>{seoDescription.length}/160</small><textarea value={seoDescription} onChange={(event) => setSeoDescription(event.target.value)} /></label><label>Canonical URL<input type="url" value={canonicalUrl} onChange={(event) => setCanonicalUrl(event.target.value)} /></label></div>
    </section>
    <aside>
      <div className="editor-card publish-box"><h3>सम्पादकीय स्थिति</h3><div><span>हालको स्थिति</span><b>{status}</b></div><div><span>तयारी</span><b>{title && categoryId && words ? "पूरा" : "अपूर्ण"}</b></div>{message && <p className="editor-message">{message}</p>}<button className="primary-btn full" disabled={saving} type="button" onClick={() => { void save(undefined, true); }}>{saving ? "सुरक्षित हुँदैछ…" : "समीक्षाका लागि पठाउनुहोस्"}</button><button className="secondary-btn full" disabled={saving} type="submit">मस्यौदा सुरक्षित गर्नुहोस्</button></div>
      <div className="editor-card"><h3>प्रकार, श्रेणी र ट्याग</h3><label>सामग्री प्रकार<select value={contentType} onChange={(event) => setContentType(event.target.value)}><option value="ARTICLE">समाचार</option><option value="VIDEO">भिडियो</option><option value="PHOTO_STORY">फोटो कथा</option><option value="LIVE_BLOG">लाइभ ब्लग</option><option value="LIVE_STORY">लाइभ स्टोरी</option><option value="OPINION">विचार</option></select></label><label>श्रेणी<select required value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><label>ट्याग<select multiple value={tagIds} onChange={(event) => setTagIds([...event.target.selectedOptions].map((option) => option.value))}>{tags.map((tag) => <option value={tag.id} key={tag.id}>{tag.name}</option>)}</select></label></div>
      <div className="editor-card"><h3>तस्बिर र भिडियो</h3><MediaUpload accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" compact onUploaded={(media) => { insertMedia(media); if (media.type === "IMAGE" && !featuredImageId) setFeaturedImageId(media.id); }}/><p className="media-help"><FontAwesomeIcon icon={faImage} /> अपलोड भएको तस्बिर सम्पादकमा थपिन्छ र पहिलो तस्बिर मुख्य तस्बिर बन्छ।</p><label>मुख्य तस्बिर ID<input value={featuredImageId} onChange={(event) => setFeaturedImageId(event.target.value)} placeholder="मिडिया पुस्तकालयबाट चयन गर्नुहोस्" /></label><label>भिडियो URL<input type="url" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} /></label></div>
      <div className="editor-card options-card"><h3>विकल्प</h3><label><input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} /> मुख्य समाचार</label><label><input type="checkbox" checked={breaking} onChange={(event) => setBreaking(event.target.checked)} /> ब्रेकिङ समाचार</label><label><input type="checkbox" checked={allowComments} onChange={(event) => setAllowComments(event.target.checked)} /> प्रतिक्रिया अनुमति</label><label>URL slug<input value={slug} onChange={(event) => setSlug(event.target.value)} required /></label></div>
    </aside>
  </form>;
}
