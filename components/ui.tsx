"use client";

import { AlertCircle, CheckCircle2, LoaderCircle, X } from "lucide-react";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description: string; actions?: React.ReactNode }) {
  return <div className="page-header"><div>{eyebrow ? <span>{eyebrow}</span> : null}<h1>{title}</h1><p>{description}</p></div>{actions ? <div className="page-actions">{actions}</div> : null}</div>;
}
export function LoadingState({ label = "Reading BOT Chain…" }: { label?: string }) { return <div className="state-card"><LoaderCircle className="spin" /><p>{label}</p></div>; }
export function EmptyState({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action?: React.ReactNode }) { return <div className="empty-state"><span>{icon}</span><h2>{title}</h2><p>{text}</p>{action}</div>; }
export function InlineError({ message }: { message: string }) { return <div className="inline-error" role="alert"><AlertCircle />{message}</div>; }
export function Success({ message }: { message: string }) { return <div className="inline-success" role="status"><CheckCircle2 />{message}</div>; }
export function Modal({ title, description, children, onClose }: { title: string; description: string; children: React.ReactNode; onClose: () => void }) {
  return <div className="modal-layer" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-head"><div><h2 id="modal-title">{title}</h2><p>{description}</p></div><button onClick={onClose} aria-label="Close"><X /></button></div>{children}</div></div>;
}
export function formatDate(timestamp: number) { return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(timestamp * 1000)); }
export function formatDateTime(timestamp: number) { return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp * 1000)); }
