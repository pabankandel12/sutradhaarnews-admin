"use client";
import { useLanguage } from "./language-provider";
const key: Record<string, string> = { DRAFT: "draft", IN_REVIEW: "inReview", APPROVED: "approved", PUBLISHED: "published", CHANGES_REQUESTED: "changesRequested", SCHEDULED: "scheduled", ARCHIVED: "archived" };
export function Status({value}:{value:string}){const{t}=useLanguage();return <span className={`status status-${value.toLowerCase()}`}>{t(key[value] || value)}</span>}
