import { statusLabel } from "@/lib/data"; export function Status({value}:{value:string}){return <span className={`status status-${value.toLowerCase()}`}>{statusLabel[value]||value}</span>}
