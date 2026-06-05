import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Send, Trash2, MessageSquare } from "lucide-react";
import {
  listWorkspaceMessages, postWorkspaceMessage, deleteWorkspaceMessage,
  type WorkspaceMessage,
} from "@/lib/workspaces.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function WorkspaceChat({ workspaceId }: { workspaceId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const listFn = useServerFn(listWorkspaceMessages);
  const postFn = useServerFn(postWorkspaceMessage);
  const delFn = useServerFn(deleteWorkspaceMessage);

  const key = ["workspace-messages", workspaceId];
  const q = useQuery({
    queryKey: key,
    queryFn: () => listFn({ data: { workspace_id: workspaceId } }),
  });

  const [body, setBody] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [q.data?.length]);

  // Realtime subscription — live collab (private channel; access gated by realtime RLS)
  useEffect(() => {
    let ch: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;
    (async () => {
      // Attach the user's auth token so realtime can authorize private channels.
      await supabase.realtime.setAuth();
      if (cancelled) return;
      ch = supabase
        .channel(`ws-messages-${workspaceId}`, { config: { private: true } })
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "workspace_messages", filter: `workspace_id=eq.${workspaceId}` },
          () => qc.invalidateQueries({ queryKey: key }),
        )
        .subscribe();
    })();
    return () => { cancelled = true; if (ch) supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const postMut = useMutation({
    mutationFn: (text: string) => postFn({ data: { workspace_id: workspaceId, body: text } }),
    onSuccess: () => { setBody(""); qc.invalidateQueries({ queryKey: key }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    onError: (e: Error) => toast.error(e.message),
  });

  const send = () => {
    const t = body.trim();
    if (!t) return;
    postMut.mutate(t);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2 text-sm font-semibold">
        <MessageSquare className="size-4" /> Team chat
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">Live</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto px-4 py-3 space-y-3">
        {q.isLoading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        {q.data?.length === 0 && (
          <div className="text-xs text-muted-foreground text-center py-8">
            No messages yet. Say hi or drop a comment about a file.
          </div>
        )}
        {q.data?.map((m: WorkspaceMessage) => {
          const mine = m.user_id === user?.id;
          return (
            <div key={m.id} className="group">
              <div className="flex items-baseline gap-2 text-[11px] text-muted-foreground">
                <span className="font-medium text-ink">
                  {mine ? "You" : (m.email ?? m.user_id.slice(0, 8))}
                </span>
                <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                {mine && (
                  <button
                    onClick={() => delMut.mutate(m.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="size-3" />
                  </button>
                )}
              </div>
              <div className="text-sm whitespace-pre-wrap break-words">{m.body}</div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="border-t border-border p-3 flex gap-2"
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Message your team…"
          maxLength={4000}
          className="flex-1 px-3 py-2 rounded-md border border-border bg-surface text-sm"
        />
        <button
          type="submit"
          disabled={postMut.isPending || !body.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-ink text-surface text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
        >
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
