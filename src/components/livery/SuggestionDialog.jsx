import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lightbulb, Send, CheckCircle2 } from 'lucide-react';
import { base44 as db } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const CATEGORIES = [
  { value: 'feature', label: 'Feature request' },
  { value: 'idea', label: 'Idea' },
  { value: 'bug', label: 'Bug report' },
  { value: 'other', label: 'Other' },
];

export default function SuggestionDialog({ open, onOpenChange }) {
  const { toast } = useToast();
  const [category, setCategory] = useState('feature');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setCategory('feature');
    setTitle('');
    setBody('');
    setDone(false);
  };

  const handleOpenChange = (next) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleSubmit = async () => {
    if (!title.trim() || busy) return;
    setBusy(true);
    try {
      await db.entities.Suggestion.create({
        category,
        title: title.trim(),
        body: body.trim() || null,
      });
      setDone(true);
    } catch (e) {
      toast({
        title: 'Could not send',
        description: e?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-rajdhani text-xl uppercase tracking-wide flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Share an idea
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Got a feature you'd love, or spotted a bug? Tell us — we read every one.
          </DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <CheckCircle2 className="w-12 h-12 text-primary" />
            <p className="text-sm text-foreground font-semibold">Thanks — we've got it!</p>
            <p className="text-xs text-muted-foreground">Your suggestion has been sent to the team.</p>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-rajdhani">Type</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-sm bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-sm">{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-rajdhani">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Short summary of your idea"
                maxLength={120}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-rajdhani">Details (optional)</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Anything that helps us understand what you'd like…"
                maxLength={2000}
                rows={4}
              />
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)} disabled={busy}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!title.trim() || busy}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-rajdhani font-semibold tracking-wide gap-2"
              >
                <Send className="w-4 h-4" />
                {busy ? 'Sending…' : 'Send'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
