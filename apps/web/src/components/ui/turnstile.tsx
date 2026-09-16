"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

export default function Turnstile({
  onVerify,
}: {
  onVerify?: (token: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;

  const [verified, setVerified] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return;
      const id = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY!,
        callback: (token) => {
          setVerified(true);
          onVerifyRef.current?.(token);
        },
        "expired-callback": () => {
          setVerified(false);
          onVerifyRef.current?.("");
        },
        "error-callback": () => {
          setVerified(false);
          onVerifyRef.current?.("");
        },
      });
      widgetIdRef.current = id;
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const script = document.createElement("script");
      script.src = TURNSTILE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = renderWidget;
      script.onerror = () => setScriptFailed(true);
      document.head.appendChild(script);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore removal errors on teardown
        }
        widgetIdRef.current = null;
      }
    };
  }, []);

  if (!SITE_KEY) {
    return (
      <div className="border border-gray-300 bg-gray-50 rounded-lg p-4 flex items-center gap-2 mt-3">
        <ShieldCheck className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-500">
          Bot verification is not configured.
        </span>
      </div>
    );
  }

  return (
    <div className="mt-3">
      {scriptFailed ? (
        <p className="text-sm text-red-500">
          Failed to load bot verification. Please try again.
        </p>
      ) : (
        <>
          <div ref={containerRef} />
          {verified && (
            <p className="text-sm text-green-600 mt-2 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              You&apos;re verified as human
            </p>
          )}
        </>
      )}
    </div>
  );
}