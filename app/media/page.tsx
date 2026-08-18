"use client";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faPlay, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Shell } from "@/components/shell";
import { MediaUpload } from "@/components/media-upload";
import { api } from "@/lib/api";

type Media = { id:string; type:"IMAGE"|"VIDEO"; title?:string; key:string; mimeType:string; size:number; deliveryUrl:string; createdAt:string };
export default function MediaPage(){
  const [items,setItems]=useState<Media[]>([]); const [loading,setLoading]=useState(true);
  const load=()=>api<Media[]>("/media").then(setItems).finally(()=>setLoading(false));
  useEffect(()=>{load().catch(()=>setLoading(false))},[]);
  const remove=async(id:string)=>{if(!confirm("यो मिडिया स्थायी रूपमा हटाउने?"))return;await api(`/media/${id}`,{method:"DELETE"});setItems(current=>current.filter(item=>item.id!==id))};
  return <Shell title="मिडिया पुस्तकालय"><div className="media-manager"><section className="panel media-upload-panel"><div className="panel-head"><div><h2>Cloudflare R2 अपलोड</h2><p>तस्बिर अधिकतम १५ MB · भिडियो अधिकतम १ GB</p></div></div><MediaUpload onUploaded={()=>load()}/></section><section className="panel"><div className="panel-head"><div><h2>अपलोड गरिएका फाइल</h2><p>{items.length} मिडिया</p></div></div>{loading?<div className="media-empty">लोड हुँदैछ...</div>:items.length===0?<div className="media-empty">अहिलेसम्म कुनै मिडिया अपलोड भएको छैन।</div>:<div className="media-grid">{items.map(item=><article key={item.id}><div className="media-thumb">{item.type==="IMAGE"?<img src={item.deliveryUrl} alt={item.title||""}/>:<><video src={item.deliveryUrl}/><FontAwesomeIcon className="video-play" icon={faPlay}/></>}</div><div><span><FontAwesomeIcon icon={item.type==="IMAGE"?faImage:faPlay}/> {item.type==="IMAGE"?"तस्बिर":"भिडियो"}</span><h3>{item.title||item.key.split("/").pop()}</h3><p>{(item.size/1024/1024).toFixed(1)} MB</p></div><button onClick={()=>remove(item.id)} aria-label="हटाउनुहोस्"><FontAwesomeIcon icon={faTrash}/></button></article>)}</div>}</section></div></Shell>
}
