const LOCAL_BUSINESS_PREVIEW_KEY = "mcom_rewards_local_business_preview";

export function isLocalBusinessPreviewEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    typeof window !== "undefined" &&
    window.localStorage.getItem(LOCAL_BUSINESS_PREVIEW_KEY) === "true"
  );
}

export function enableLocalBusinessPreview(): boolean {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") {
    return false;
  }
  window.localStorage.setItem(LOCAL_BUSINESS_PREVIEW_KEY, "true");
  return true;
}

export function clearLocalBusinessPreview(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(LOCAL_BUSINESS_PREVIEW_KEY);
  }
}
