import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquareReply } from 'lucide-react';
import { format } from 'date-fns';
import { base44 as db } from '@/api/base44Client';

const CATEGORY_LABELS = { feature: 'Feature request', idea: 'Idea', bug: 'Bug report', other: 'Feedback' };

// Shown once per sign-in when the team has replied to one of the user's
// suggestions. Dismissing marks every shown reply as read so it won't reappear.
export default function ReplyNotificationDialog({ isAuthenticated }) {
  const [replies, setReplies] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    db.entities.Suggestion.unreadReplies()
      .then((list) => {
        if (cancelled || !list.length) return;
        setReplies(list);
        setOpen(true);
      })
      .catch(() => { /* non-fatal — table may not be migrated yet */ });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const dismiss = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await Promise.all(replies.map((r) => db.entities.Suggestion.markReplyRead(r.id)));
    } catch { /* non-fatal */ }
    setBusy(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) dismiss(); }}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-xl uppercase tracking-wide flex items-center gap-2">
            <MessageSquareReply className="w-5 h-5 text-primary" />
            {replies.length > 1 ? 'You have replies' : 'You have a reply'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            The team responded to your {replies.length > 1 ? 'suggestions' : 'suggestion'}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto">
          {replies.map((r) => (
            <div key={r.id} className="rounded-md border border-border bg-secondary/40 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] uppercase tracking-wider bg-secondary text-muted-foreground rounded px-1.5 py-0.5">
                  {CATEGORY_LABELS[r.category] || r.category}
                </span>
                <span className="text-xs font-semibold text-foreground truncate">{r.title}</span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{r.admin_reply}</p>
              {r.admin_reply_at && (
                <p className="text-[10px] text-muted-foreground/70 mt-2">
                  {format(new Date(r.admin_reply_at), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            onClick={dismiss}
            disabled={busy}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-rajdhani font-semibold tracking-wide"
          >
            {busy ? 'Closing…' : 'Got it'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
