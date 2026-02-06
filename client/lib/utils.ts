import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copyToClipboard(text: string): Promise<void> {
  if (!text) return;

  try {
    // Try modern API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    // Fallback for non-secure contexts or when clipboard API is unavailable
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Ensure the textarea is not visible but still part of the DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.style.opacity = "0";
    textArea.style.pointerEvents = "none";

    document.body.appendChild(textArea);

    // Focus and select the text
    const isIOS = !!navigator.userAgent.match(/ipad|iphone|ipod/i);

    if (isIOS) {
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      textArea.setSelectionRange(0, 999999);
    } else {
      textArea.select();
    }

    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (!successful) {
      throw new Error("Copy command failed");
    }
  } catch (err) {
    console.error("Copy failed:", err);
    throw new Error("Failed to copy to clipboard");
  }
}
