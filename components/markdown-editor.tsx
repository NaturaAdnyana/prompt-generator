"use client";

import type { RefObject } from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  textareaRef?: RefObject<HTMLTextAreaElement>;
  placeholder?: string;
  labels: {
    bold: string;
    italic: string;
    bullet: string;
    quote: string;
    code: string;
    preview: string;
  };
  className?: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const inlineMarkdown = (value: string) =>
  escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

export function renderMarkdown(value: string) {
  const lines = value.split("\n");
  const html: string[] = [];
  let isListOpen = false;

  const closeList = () => {
    if (isListOpen) {
      html.push("</ul>");
      isListOpen = false;
    }
  };

  lines.forEach((line) => {
    if (line.startsWith("### ")) {
      closeList();
      html.push(`<h3>${inlineMarkdown(line.slice(4))}</h3>`);
      return;
    }

    if (line.startsWith("## ")) {
      closeList();
      html.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
      return;
    }

    if (line.startsWith("# ")) {
      closeList();
      html.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
      return;
    }

    if (line.startsWith("> ")) {
      closeList();
      html.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`);
      return;
    }

    if (line.startsWith("- ")) {
      if (!isListOpen) {
        html.push("<ul>");
        isListOpen = true;
      }
      html.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      return;
    }

    closeList();
    html.push(line.trim() ? `<p>${inlineMarkdown(line)}</p>` : "<br />");
  });

  closeList();
  return html.join("");
}

export function MarkdownPreview({ value, className }: { value: string; className?: string }) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none rounded-2xl border bg-white p-4 leading-7 shadow-inner [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-300 [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
    />
  );
}

export function MarkdownEditor({
  value,
  onChange,
  textareaRef,
  placeholder,
  labels,
  className,
}: MarkdownEditorProps) {
  const applyFormat = (prefix: string, suffix = prefix) => {
    const textarea = textareaRef?.current;
    if (!textarea) {
      onChange(`${value}${prefix}${suffix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const nextValue = `${value.slice(0, start)}${prefix}${selected}${suffix}${value.slice(end)}`;
    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  };

  const prefixLines = (prefix: string) => {
    const textarea = textareaRef?.current;
    if (!textarea) {
      onChange(`${value}\n${prefix}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || "";
    const formatted = selected
      .split("\n")
      .map((line) => `${prefix}${line}`)
      .join("\n");
    const nextValue = `${value.slice(0, start)}${formatted}${value.slice(end)}`;
    onChange(nextValue);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formatted.length);
    });
  };

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-white", className)} data-color-mode="light">
      <div className="flex flex-wrap gap-2 border-b bg-slate-50 p-2">
        <button type="button" className="rounded-md px-3 py-1 text-sm font-semibold hover:bg-slate-200" onClick={() => applyFormat("**")}>{labels.bold}</button>
        <button type="button" className="rounded-md px-3 py-1 text-sm italic hover:bg-slate-200" onClick={() => applyFormat("*")}>{labels.italic}</button>
        <button type="button" className="rounded-md px-3 py-1 text-sm hover:bg-slate-200" onClick={() => prefixLines("- ")}>{labels.bullet}</button>
        <button type="button" className="rounded-md px-3 py-1 text-sm hover:bg-slate-200" onClick={() => prefixLines("> ")}>{labels.quote}</button>
        <button type="button" className="rounded-md px-3 py-1 text-sm font-mono hover:bg-slate-200" onClick={() => applyFormat("`")}>{labels.code}</button>
      </div>
      <Textarea
        ref={textareaRef}
        className="min-h-[260px] rounded-none border-0 font-mono text-sm leading-6 focus-visible:ring-0 focus-visible:ring-offset-0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
      <div className="border-t bg-slate-50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{labels.preview}</p>
        <MarkdownPreview value={value || placeholder || ""} className="min-h-[120px] shadow-none" />
      </div>
    </div>
  );
}
