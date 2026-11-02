"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Sidebar } from "./sidebar";
import { LanguageSwitcher, useLanguage } from "./language-provider";
export function Shell({children,title,action}:{children:React.ReactNode;title:string;action?:React.ReactNode}){const router=useRouter();const{t}=useLanguage();const [user,setUser]=useState<{name:string;role:string}|null>(null);useEffect(()=>{if(!localStorage.getItem("sutradhaar_admin_token")){router.replace("/login");return}api<{role:string;email:string}>("/auth/me").then(me=>setUser({name:me.email.split("@")[0],role:me.role})).catch(()=>{localStorage.removeItem("sutradhaar_admin_token");router.replace("/login")})},[router]);if(!user)return <div style={{minHeight:"100vh",display:"grid",placeItems:"center"}}>न्युजरुम प्रमाणीकरण हुँदैछ...</div>;return <div className="admin-shell"><Sidebar/><div className="admin-main"><header className="topbar"><LanguageSwitcher/><button className="user-chip" style={{border:0,background:"transparent",textAlign:"left",cursor:"pointer",marginLeft:0}} onClick={()=>{localStorage.removeItem("sutradhaar_admin_token");router.push("/login")}}><span>{user.name.slice(0,2)}</span><div><strong>{user.name}</strong><small>{user.role} · {t("signOut")}</small></div></button></header><main className="admin-content"><div className="page-title"><div><p>{t("newsroom")}</p><h1>{title}</h1></div>{action}</div>{children}</main></div></div>}
