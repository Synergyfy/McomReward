"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface LegalDocument {
  title: string;
  status: string;
  sections: readonly { heading: string; paragraphs: readonly string[] }[];
}

interface LegalDocumentModalProps {
  document: LegalDocument;
  accepted: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export default function LegalDocumentModal({ document, accepted, onAccept, onClose }: LegalDocumentModalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reachedBottom, setReachedBottom] = useState(false);

  const checkScroll = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    setReachedBottom(node.scrollHeight <= node.clientHeight + 1 || node.scrollTop + node.clientHeight >= node.scrollHeight - 2);
  }, []);

  useEffect(() => {
    setReachedBottom(false);
    const node = scrollRef.current;
    if (!node) return;
    checkScroll();
    const observer = new ResizeObserver(checkScroll);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    window.addEventListener("resize", checkScroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, document]);

  useEffect(() => {
    const previousOverflow = documentBodyOverflow();
    window.document.body.style.overflow = "hidden";
    return () => { window.document.body.style.overflow = previousOverflow; };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="legal-modal-title" className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-h-[min(86dvh,800px)] sm:rounded-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-600">Draft for review</p><h2 id="legal-modal-title" className="mt-1 text-xl font-bold text-slate-950">{document.title}</h2></div>
          <button type="button" aria-label="Close document" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" /></button>
        </header>

        <div ref={scrollRef} onScroll={checkScroll} tabIndex={0} aria-label={`${document.title} text; scroll to read all`} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500 sm:px-7 sm:py-6">
          <div className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><p><strong>{document.status}</strong> This text is a discussion draft, not an approved policy.</p></div>
          <div className="space-y-6">
            {document.sections.map((section) => <section key={section.heading}><h3 className="mb-2 text-sm font-bold text-slate-900">{section.heading}</h3>{section.paragraphs.map((paragraph, index) => <p key={index} className="mb-2 text-sm leading-6 text-slate-600">{paragraph}</p>)}</section>)}
          </div>
          <p className="mt-8 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">This placeholder must be reviewed and replaced or approved by the responsible owner before these policies are used with customers or businesses.</p>
        </div>

        <footer className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p aria-live="polite" className="text-xs text-slate-500">{reachedBottom ? "You’ve reached the end of this document." : "Scroll through the document to enable agreement."}</p>
          <Button type="button" disabled={!reachedBottom || accepted} onClick={onAccept} className="w-full bg-orange-600 text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"><Check className="mr-2 h-4 w-4" />{accepted ? "Accepted" : "I Agree & Understand"}</Button>
        </footer>
      </section>
    </div>
  );
}

function documentBodyOverflow() {
  return window.document.body.style.overflow;
}
