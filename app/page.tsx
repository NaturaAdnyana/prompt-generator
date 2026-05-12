"use client";

import { ChangeEvent, ReactNode, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type IconProps = { className?: string };

function IconBase({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const Bot = (props: IconProps) => <IconBase {...props}><path d="M12 8V4" /><rect width="16" height="12" x="4" y="8" rx="3" /><path d="M8 16h.01" /><path d="M16 16h.01" /><path d="M9 20h6" /></IconBase>;
const Check = (props: IconProps) => <IconBase {...props}><path d="m20 6-11 11-5-5" /></IconBase>;
const Clipboard = (props: IconProps) => <IconBase {...props}><rect width="14" height="16" x="5" y="4" rx="2" /><path d="M9 4h6" /></IconBase>;
const Download = (props: IconProps) => <IconBase {...props}><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></IconBase>;
const FileJson = (props: IconProps) => <IconBase {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M10 12H9a1 1 0 0 0-1 1v2a1 1 0 0 1-1 1 1 1 0 0 1 1 1v2a1 1 0 0 0 1 1h1" /><path d="M14 12h1a1 1 0 0 1 1 1v2a1 1 0 0 0 1 1 1 1 0 0 0-1 1v2a1 1 0 0 1-1 1h-1" /></IconBase>;
const Menu = (props: IconProps) => <IconBase {...props}><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></IconBase>;
const MessageSquare = (props: IconProps) => <IconBase {...props}><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" /></IconBase>;
const Plus = (props: IconProps) => <IconBase {...props}><path d="M12 5v14" /><path d="M5 12h14" /></IconBase>;
const Trash2 = (props: IconProps) => <IconBase {...props}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /></IconBase>;
const Upload = (props: IconProps) => <IconBase {...props}><path d="M12 21V9" /><path d="m7 14 5-5 5 5" /><path d="M5 3h14" /></IconBase>;
const WandSparkles = (props: IconProps) => <IconBase {...props}><path d="m5 19 14-14" /><path d="m14 5 5 5" /><path d="M6 5v2" /><path d="M5 6h2" /><path d="M19 17v2" /><path d="M18 18h2" /></IconBase>;
const X = (props: IconProps) => <IconBase {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></IconBase>;


type PromptVariable = {
  id: string;
  key: string;
  label: string;
  value: string;
};

type Interaction = {
  id: string;
  title: string;
  description: string;
  variables: PromptVariable[];
  template: string;
  updatedAt: string;
};

type SerializableInteraction = Omit<Interaction, "id" | "updatedAt"> & {
  id?: string;
  updatedAt?: string;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultInteractions: Interaction[] = [
  {
    id: "interaction-instagram",
    title: "Konten Instagram",
    description: "Generate caption edukatif dengan tone brand.",
    updatedAt: "2026-05-12T00:00:00.000Z",
    variables: [
      { id: "var-topik", key: "topik", label: "Topik", value: "AI untuk produktivitas" },
      { id: "var-tone", key: "tone", label: "Tone", value: "ramah, lugas, profesional" },
      { id: "var-audiens", key: "audiens", label: "Audiens", value: "founder startup dan marketer" },
    ],
    template:
      "Buat caption Instagram tentang **{{topik}}** untuk {{audiens}}.\n\nGunakan tone {{tone}}. Sertakan:\n- Hook kuat pada kalimat pertama\n- 3 poin praktis\n- CTA singkat\n- 5 hashtag relevan",
  },
  {
    id: "interaction-product",
    title: "Analisis Produk",
    description: "Prompt riset fitur dan positioning produk.",
    updatedAt: "2026-05-12T00:00:00.000Z",
    variables: [
      { id: "var-produk", key: "produk", label: "Produk", value: "aplikasi invoice UMKM" },
      { id: "var-market", key: "market", label: "Target Market", value: "pemilik bisnis kecil di Indonesia" },
    ],
    template:
      "Bertindak sebagai product strategist. Analisis **{{produk}}** untuk {{market}}.\n\nBerikan output dalam markdown:\n1. Masalah utama pengguna\n2. Value proposition\n3. 5 fitur prioritas\n4. Risiko validasi\n5. Eksperimen GTM 14 hari",
  },
];

const normalizeKey = (key: string) =>
  key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\s-]/g, "")
    .replace(/\s+/g, "_") || "value";

const interpolateTemplate = (template: string, variables: PromptVariable[]) => {
  return variables.reduce((result, variable) => {
    const pattern = new RegExp(`{{\\s*${variable.key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*}}`, "g");
    return result.replace(pattern, variable.value || `{{${variable.key}}}`);
  }, template);
};

const formatTime = (date: string) =>
  new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

export default function Home() {
  const [interactions, setInteractions] = useState<Interaction[]>(defaultInteractions);
  const [activeId, setActiveId] = useState(defaultInteractions[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const templateRef = useRef<HTMLTextAreaElement>(null);
  const importRef = useRef<HTMLInputElement>(null);

  const activeInteraction = interactions.find((interaction) => interaction.id === activeId) ?? interactions[0];

  const generatedPrompt = useMemo(
    () => interpolateTemplate(activeInteraction.template, activeInteraction.variables),
    [activeInteraction],
  );

  const updateActiveInteraction = (patch: Partial<Interaction>) => {
    setInteractions((current) =>
      current.map((interaction) =>
        interaction.id === activeInteraction.id
          ? { ...interaction, ...patch, updatedAt: new Date().toISOString() }
          : interaction,
      ),
    );
  };

  const updateVariable = (id: string, patch: Partial<PromptVariable>) => {
    const variables = activeInteraction.variables.map((variable) =>
      variable.id === id
        ? {
            ...variable,
            ...patch,
            key: patch.key !== undefined ? normalizeKey(patch.key) : variable.key,
          }
        : variable,
    );
    updateActiveInteraction({ variables });
  };

  const addVariable = () => {
    const nextIndex = activeInteraction.variables.length + 1;
    updateActiveInteraction({
      variables: [
        ...activeInteraction.variables,
        {
          id: createId(),
          key: `value_${nextIndex}`,
          label: `Value ${nextIndex}`,
          value: "",
        },
      ],
    });
  };

  const removeVariable = (id: string) => {
    if (activeInteraction.variables.length <= 1) {
      return;
    }

    updateActiveInteraction({
      variables: activeInteraction.variables.filter((variable) => variable.id !== id),
    });
  };

  const addInteraction = () => {
    const newInteraction: Interaction = {
      id: createId(),
      title: "Interaksi Baru",
      description: "Template prompt custom.",
      updatedAt: new Date().toISOString(),
      variables: [{ id: createId(), key: "value_1", label: "Value 1", value: "" }],
      template: "Tulis prompt Anda di sini dan sisipkan value seperti {{value_1}}.",
    };

    setInteractions((current) => [newInteraction, ...current]);
    setActiveId(newInteraction.id);
    setIsSidebarOpen(false);
  };

  const deleteInteraction = (id: string) => {
    if (interactions.length <= 1) {
      return;
    }

    const nextInteractions = interactions.filter((interaction) => interaction.id !== id);
    setInteractions(nextInteractions);
    if (activeId === id) {
      setActiveId(nextInteractions[0].id);
    }
  };

  const insertVariableToken = (key: string) => {
    const token = `{{${key}}}`;
    const textarea = templateRef.current;
    const currentTemplate = activeInteraction.template;

    if (!textarea) {
      updateActiveInteraction({ template: `${currentTemplate}${token}` });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextTemplate = `${currentTemplate.slice(0, start)}${token}${currentTemplate.slice(end)}`;
    updateActiveInteraction({ template: nextTemplate });

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const copyPrompt = async () => {
    await navigator.clipboard.writeText(generatedPrompt);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1600);
  };

  const exportActiveInteraction = () => {
    const payload: SerializableInteraction = {
      title: activeInteraction.title,
      description: activeInteraction.description,
      variables: activeInteraction.variables,
      template: activeInteraction.template,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeInteraction.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "prompt"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importInteraction = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as SerializableInteraction;
        const variables = Array.isArray(parsed.variables) && parsed.variables.length > 0
          ? parsed.variables.map((variable, index) => ({
              id: createId(),
              key: normalizeKey(variable.key || `value_${index + 1}`),
              label: variable.label || `Value ${index + 1}`,
              value: variable.value || "",
            }))
          : [{ id: createId(), key: "value_1", label: "Value 1", value: "" }];

        const imported: Interaction = {
          id: createId(),
          title: parsed.title ? `${parsed.title} (Import)` : "Interaksi Import",
          description: parsed.description || "Diimpor dari file JSON.",
          variables,
          template: parsed.template || "Tambahkan template markdown Anda di sini.",
          updatedAt: new Date().toISOString(),
        };

        setInteractions((current) => [imported, ...current]);
        setActiveId(imported.id);
        setIsSidebarOpen(false);
      } catch {
        alert("File JSON tidak valid. Pastikan format berisi title, variables, dan template.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="flex min-h-screen bg-[#f7f7f8] text-slate-950">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-80 -translate-x-full flex-col border-r border-slate-800 bg-[#171717] text-white transition-transform duration-300 lg:static lg:translate-x-0",
          isSidebarOpen && "translate-x-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white">
              <WandSparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-semibold">Prompt Generator</h1>
              <p className="text-xs text-white/55">Template untuk chat AI asli</p>
            </div>
          </div>
          <Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-3 p-3">
          <Button className="w-full justify-start gap-2 bg-white text-slate-950 hover:bg-white/90" onClick={addInteraction}>
            <Plus className="h-4 w-4" />
            Interaksi baru
          </Button>
          <input ref={importRef} className="hidden" type="file" accept="application/json" onChange={importInteraction} />
          <Button className="w-full justify-start gap-2 border-white/15 text-white hover:bg-white/10" variant="outline" onClick={() => importRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Import JSON ke interaksi
          </Button>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3">
          {interactions.map((interaction) => (
            <div
              key={interaction.id}
              className={cn(
                "group flex w-full items-start gap-2 rounded-xl p-2 transition hover:bg-white/10",
                activeInteraction.id === interaction.id && "bg-white/10",
              )}
            >
              <button
                className="flex min-w-0 flex-1 items-start gap-3 text-left"
                onClick={() => {
                  setActiveId(interaction.id);
                  setIsSidebarOpen(false);
                }}
              >
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-white/60" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{interaction.title}</p>
                  <p className="line-clamp-2 text-xs text-white/55">{interaction.description}</p>
                  <p className="mt-2 text-[11px] text-white/35">{formatTime(interaction.updatedAt)}</p>
                </div>
              </button>
              {interactions.length > 1 && (
                <button
                  type="button"
                  className="rounded-md p-1 text-white/40 opacity-0 hover:bg-white/10 hover:text-white group-hover:opacity-100"
                  onClick={() => deleteInteraction(interaction.id)}
                  aria-label={`Hapus interaksi ${interaction.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <p className="text-sm font-semibold">Workspace Prompt</p>
              <p className="hidden text-xs text-muted-foreground sm:block">Ubah value tanpa mengedit template utama.</p>
            </div>
          </div>
          <Button className="gap-2" onClick={exportActiveInteraction} variant="outline">
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 md:p-8">
          <section className="rounded-3xl border bg-white p-5 shadow-sm md:p-8">
            <div className="mb-6 flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-900 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Assistant</p>
                  <h2 className="text-2xl font-semibold tracking-tight">Bangun prompt reusable dari variable</h2>
                </div>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                  Tambahkan daftar value minimal satu item, sisipkan token <code className="rounded bg-muted px-1 py-0.5">{"{{nama_value}}"}</code> ke template markdown, lalu salin hasil akhir untuk ditempel ke ChatGPT, Claude, Gemini, atau AI lain.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Nama interaksi</Label>
                    <Input id="title" value={activeInteraction.title} onChange={(event) => updateActiveInteraction({ title: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi singkat</Label>
                    <Input id="description" value={activeInteraction.description} onChange={(event) => updateActiveInteraction({ description: event.target.value })} />
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle>List value</CardTitle>
                        <CardDescription>Isi value yang akan mengganti token di prompt.</CardDescription>
                      </div>
                      <Button size="sm" className="gap-2" onClick={addVariable}>
                        <Plus className="h-4 w-4" />
                        Tambah
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeInteraction.variables.map((variable, index) => (
                      <div key={variable.id} className="rounded-2xl border bg-slate-50 p-3">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Value {index + 1}</p>
                          <div className="flex items-center gap-2">
                            <Button type="button" size="sm" variant="secondary" onClick={() => insertVariableToken(variable.key)}>
                              Sisipkan {`{{${variable.key}}}`}
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              disabled={activeInteraction.variables.length <= 1}
                              onClick={() => removeVariable(variable.id)}
                              aria-label={`Hapus ${variable.label}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
                          <div className="space-y-2">
                            <Label>Label</Label>
                            <Input value={variable.label} onChange={(event) => updateVariable(variable.id, { label: event.target.value })} placeholder="Contoh: Target Audiens" />
                          </div>
                          <div className="space-y-2">
                            <Label>Key token</Label>
                            <Input value={variable.key} onChange={(event) => updateVariable(variable.id, { key: event.target.value })} placeholder="target_audiens" />
                          </div>
                        </div>
                        <div className="mt-3 space-y-2">
                          <Label>{variable.label || "Value"}</Label>
                          <Textarea value={variable.value} onChange={(event) => updateVariable(variable.id, { value: event.target.value })} placeholder="Masukkan value yang akan dipakai di prompt" />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Template markdown prompt</CardTitle>
                    <CardDescription>
                      Edit markdown dan posisikan token value di bagian mana pun. Contoh: <code>{"{{topik}}"}</code>.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      ref={templateRef}
                      className="min-h-[320px] font-mono text-sm leading-6"
                      value={activeInteraction.template}
                      onChange={(event) => updateActiveInteraction({ template: event.target.value })}
                      placeholder="Tulis prompt markdown dan sisipkan token value..."
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {activeInteraction.variables.map((variable) => (
                        <Button key={variable.id} type="button" size="sm" variant="outline" onClick={() => insertVariableToken(variable.key)}>
                          {`{{${variable.key}}}`}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-emerald-200 bg-emerald-50/70">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle>Hasil prompt final</CardTitle>
                        <CardDescription>Markdown siap copy-paste ke chat AI asli.</CardDescription>
                      </div>
                      <Button className="gap-2" onClick={copyPrompt}>
                        {copyState === "copied" ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                        {copyState === "copied" ? "Tersalin" : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="min-h-[220px] whitespace-pre-wrap rounded-2xl border bg-white p-4 text-sm leading-7 shadow-inner">
                      {generatedPrompt}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-start gap-3 rounded-2xl border border-dashed bg-white p-4 text-sm text-muted-foreground">
                  <FileJson className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p>
                    Gunakan <strong>Export JSON</strong> untuk membagikan konfigurasi. Penerima dapat memakai <strong>Import JSON ke interaksi</strong> agar otomatis muncul sebagai item baru di sidebar.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
