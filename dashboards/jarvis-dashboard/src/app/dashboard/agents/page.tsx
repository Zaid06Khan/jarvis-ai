"use client";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, fetcher } from "@/components/jarvis/ui-bits";
import { toast } from "sonner";
import { Send, Loader2, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: string; content: string; model?: string };

export default function AgentsPage() {
  const { data: agentsData } = useSWR("/api/agents", fetcher);
  const agents: any[] = agentsData?.agents || [];
  const [agent, setAgent] = useState("hermes-core");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const tier = agents.find((a) => a.name === agent)?.tier;

  useEffect(() => {
    fetch(`/api/agents/chat?agent=${agent}`).then((r) => r.json()).then((d) => setMessages(d.messages || []));
  }, [agent]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, sending]);

  async function send() {
    const msg = input.trim();
    if (!msg || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setSending(true);
    try {
      const res = await fetch("/api/agents/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, message: msg }),
      });
      const d = await res.json();
      if (res.ok) setMessages((m) => [...m, { role: "assistant", content: d.reply, model: d.model }]);
      else toast.error(d.error || "Failed");
    } catch { toast.error("Network error"); }
    setSending(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Agent Chat" subtitle="Talk to any of your 21 specialist agents" action={
        <Select value={agent} onValueChange={setAgent}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(agents.length ? agents : [{ name: "hermes-core" }]).map((a) => (
              <SelectItem key={a.name} value={a.name}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      } />

      <Card className="glass flex flex-col h-[calc(100vh-220px)]">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{agent}</p>
            {tier && <p className="text-[10px] text-muted-foreground">model: {tier}</p>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Start a conversation with {agent}
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
              <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border",
                m.role === "user" ? "bg-accent" : "bg-primary/10 border-primary/20")}>
                {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
              </div>
              <div className={cn("rounded-2xl px-4 py-2.5 max-w-[80%] text-sm whitespace-pre-wrap",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border")}>
                {m.content}
                {m.model && <span className="block mt-1.5 text-[10px] opacity-60">{m.model}</span>}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex gap-3">
              <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-card border"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t p-3 flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Message ${agent}...`} disabled={sending} />
          <Button onClick={send} disabled={sending || !input.trim()} size="icon">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
