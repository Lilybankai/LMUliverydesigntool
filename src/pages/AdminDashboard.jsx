import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  format, startOfDay, startOfHour, subDays, subHours,
  eachDayOfInterval, eachHourOfInterval,
} from 'date-fns';
import {
  Users, Layers, Download, Eye, Lightbulb, RefreshCw, ArrowLeft, MessageSquare,
  ChevronRight, Car, Reply, Send, Check, CheckCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 as db } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const RANGES = [
  { key: '24h', label: 'Last 24 hours', hours: 24 },
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: 'all', label: 'All time' },
];

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
  { value: 'declined', label: 'Declined' },
];

const CATEGORY_LABELS = { feature: 'Feature', idea: 'Idea', bug: 'Bug', other: 'Other' };

const sinceISOFor = (rangeKey) => {
  const now = Date.now();
  const range = RANGES.find((r) => r.key === rangeKey);
  if (!range || rangeKey === 'all') return null;
  const ms = range.hours ? range.hours * 3600e3 : range.days * 86400e3;
  return new Date(now - ms).toISOString();
};

// Bucket timestamps into a time series appropriate for the selected window.
const buildSeries = (activity, rangeKey) => {
  const now = new Date();
  const hourly = rangeKey === '24h';

  let buckets;
  if (hourly) {
    buckets = eachHourOfInterval({ start: subHours(startOfHour(now), 23), end: startOfHour(now) });
  } else {
    const days = rangeKey === '7d' ? 6 : rangeKey === '30d' ? 29 : null;
    let start;
    if (days != null) {
      start = subDays(startOfDay(now), days);
    } else {
      const all = [
        ...activity.signups, ...activity.saves, ...activity.events,
      ].map((r) => new Date(r.created_at).getTime()).filter((n) => !Number.isNaN(n));
      const min = all.length ? Math.min(...all) : subDays(now, 6).getTime();
      start = startOfDay(new Date(min));
    }
    buckets = eachDayOfInterval({ start, end: startOfDay(now) });
  }

  const keyOf = (d) => (hourly ? startOfHour(d).getTime() : startOfDay(d).getTime());
  const index = new Map(buckets.map((b) => [b.getTime(), {
    label: format(b, hourly ? 'HH:00' : 'MMM d'),
    Visits: 0, Downloads: 0, Signups: 0, Saves: 0,
  }]));

  const bump = (rows, field, filter) => {
    for (const row of rows) {
      if (filter && !filter(row)) continue;
      const t = new Date(row.created_at);
      if (Number.isNaN(t.getTime())) continue;
      const slot = index.get(keyOf(t));
      if (slot) slot[field] += 1;
    }
  };

  bump(activity.signups, 'Signups');
  bump(activity.saves, 'Saves');
  bump(activity.events, 'Visits', (r) => r.event_name === 'page_view');
  bump(activity.events, 'Downloads', (r) => r.event_name === 'livery_downloaded');

  return buckets.map((b) => index.get(b.getTime()));
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-card border border-border rounded-lg p-4 flex flex-col gap-2">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className={`w-4 h-4 ${accent}`} />
      <span className="text-xs uppercase tracking-wider font-rajdhani">{label}</span>
    </div>
    <span className="text-3xl font-geom text-foreground tabular-nums">{value.toLocaleString()}</span>
  </div>
);

export default function AdminDashboard() {
  const { toast } = useToast();
  const [rangeKey, setRangeKey] = useState('7d');
  const [activity, setActivity] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [act, sugg] = await Promise.all([
        db.admin.fetchActivity(sinceISOFor(rangeKey)),
        db.entities.Suggestion.list('-created_date'),
      ]);
      setActivity(act);
      setSuggestions(sugg);
    } catch (e) {
      setError(e?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [rangeKey]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    if (!activity) return { signups: 0, saves: 0, downloads: 0, visits: 0 };
    return {
      signups: activity.signups.length,
      saves: activity.saves.length,
      downloads: activity.events.filter((e) => e.event_name === 'livery_downloaded').length,
      visits: activity.events.filter((e) => e.event_name === 'page_view').length,
    };
  }, [activity]);

  const series = useMemo(
    () => (activity ? buildSeries(activity, rangeKey) : []),
    [activity, rangeKey]
  );

  // Aggregate download events per user, with a per-vehicle breakdown, sorted
  // from most downloads to least. Downloads made while signed out (user_id null)
  // are grouped together as "Anonymous".
  const userDownloads = useMemo(() => {
    if (!activity) return [];
    const emailById = new Map((activity.signups || []).map((p) => [p.id, p.email]));
    const byUser = new Map();
    for (const e of activity.events) {
      if (e.event_name !== 'livery_downloaded') continue;
      const uid = e.user_id || 'anon';
      let entry = byUser.get(uid);
      if (!entry) {
        entry = {
          userId: uid,
          email: uid === 'anon' ? null : (emailById.get(uid) || null),
          total: 0,
          cars: new Map(),
        };
        byUser.set(uid, entry);
      }
      entry.total += 1;
      const car = e.properties?.vehicle_name || e.properties?.vehicle_id || 'Unknown';
      entry.cars.set(car, (entry.cars.get(car) || 0) + 1);
    }
    return [...byUser.values()]
      .map((u) => ({
        ...u,
        cars: [...u.cars.entries()]
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => b.total - a.total);
  }, [activity]);

  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyBusy, setReplyBusy] = useState(null);

  const updateSuggestion = async (id, patch) => {
    const prev = suggestions;
    setSuggestions((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    try {
      await db.entities.Suggestion.update(id, patch);
    } catch (e) {
      setSuggestions(prev);
      toast({ title: 'Update failed', description: e?.message, variant: 'destructive' });
    }
  };

  const sendReply = async (id) => {
    const text = (replyDrafts[id] || '').trim();
    if (!text || replyBusy) return;
    setReplyBusy(id);
    try {
      const updated = await db.entities.Suggestion.update(id, { admin_reply: text });
      setSuggestions((list) => list.map((s) => (s.id === id ? updated : s)));
      setReplyDrafts((d) => ({ ...d, [id]: '' }));
      toast({ title: 'Reply sent', description: 'The user will see it next time they sign in.' });
    } catch (e) {
      toast({ title: 'Could not send reply', description: e?.message, variant: 'destructive' });
    } finally {
      setReplyBusy(null);
    }
  };

  const newCount = suggestions.filter((s) => s.status === 'new').length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center gap-3 px-6 h-14 border-b border-border bg-card">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to tool
        </Link>
        <div className="w-px h-6 bg-border mx-1" />
        <h1 className="font-geom text-lg uppercase tracking-wide brand-gradient-text">Admin Dashboard</h1>
        <div className="flex-1" />
        <Select value={rangeKey} onValueChange={setRangeKey}>
          <SelectTrigger className="h-8 text-xs w-40 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (
              <SelectItem key={r.key} value={r.key} className="text-xs">{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-8 gap-2" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {error && (
          <div className="mb-4 p-3 rounded bg-destructive/10 border border-destructive/40 text-sm text-destructive">
            {error}
          </div>
        )}

        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2"><Eye className="w-4 h-4" /> Overview</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="w-4 h-4" /> Users</TabsTrigger>
            <TabsTrigger value="suggestions" className="gap-2">
              <Lightbulb className="w-4 h-4" /> Suggestions
              {newCount > 0 && (
                <span className="ml-1 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
                  {newCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatCard icon={Users} label="Signups" value={stats.signups} accent="text-primary" />
              <StatCard icon={Layers} label="Liveries saved" value={stats.saves} accent="text-primary" />
              <StatCard icon={Download} label="Downloads" value={stats.downloads} accent="text-primary" />
              <StatCard icon={Eye} label="Site visits" value={stats.visits} accent="text-primary" />
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-sm font-rajdhani uppercase tracking-wider text-muted-foreground mb-4">
                Activity over time
              </h2>
              {loading ? (
                <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
              ) : (
                <ResponsiveContainer width="100%" height={288}>
                  <LineChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="Visits" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Downloads" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Signups" stroke="#22c55e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Saves" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </TabsContent>

          <TabsContent value="users">
            {loading ? (
              <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground text-sm">
                Loading…
              </div>
            ) : userDownloads.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground">
                <Download className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No downloads in this period.</p>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-4 py-2.5 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-rajdhani">
                  <span className="text-center">#</span>
                  <span>User</span>
                  <span className="text-right">Downloads</span>
                </div>
                {userDownloads.map((u, i) => {
                  const expanded = expandedUser === u.userId;
                  return (
                    <div key={u.userId} className="border-b border-border last:border-b-0">
                      <button
                        type="button"
                        onClick={() => setExpandedUser(expanded ? null : u.userId)}
                        className="w-full grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-secondary/40 transition-colors"
                      >
                        <span className="text-center text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                        <span className="flex items-center gap-2 min-w-0">
                          <ChevronRight
                            className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`}
                          />
                          <span className="truncate text-sm text-foreground">
                            {u.email || (u.userId === 'anon' ? 'Anonymous (signed out)' : 'Unknown user')}
                          </span>
                          <span className="text-[11px] text-muted-foreground/70 flex-shrink-0">
                            {u.cars.length} {u.cars.length === 1 ? 'car' : 'cars'}
                          </span>
                        </span>
                        <span className="text-right text-sm font-geom tabular-nums text-foreground">
                          {u.total.toLocaleString()}
                        </span>
                      </button>
                      {expanded && (
                        <div className="px-4 pb-3 pl-12 flex flex-col gap-1.5">
                          {u.cars.map((c) => (
                            <div key={c.name} className="flex items-center justify-between gap-3 text-xs">
                              <span className="flex items-center gap-2 text-muted-foreground min-w-0">
                                <Car className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                                <span className="truncate text-foreground">{c.name}</span>
                              </span>
                              <span className="tabular-nums text-muted-foreground flex-shrink-0">
                                {c.count.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions">
            {suggestions.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No suggestions yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {suggestions.map((s) => (
                  <div key={s.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] uppercase tracking-wider bg-secondary text-muted-foreground rounded px-1.5 py-0.5">
                            {CATEGORY_LABELS[s.category] || s.category}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {format(new Date(s.created_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                        {s.body && <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{s.body}</p>}
                        {s.email && <p className="text-[11px] text-muted-foreground/70 mt-2">— {s.email}</p>}
                      </div>
                      <Select value={s.status} onValueChange={(v) => updateSuggestion(s.id, { status: v })}>
                        <SelectTrigger className="h-8 text-xs w-36 bg-secondary border-border flex-shrink-0">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((o) => (
                            <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Existing reply */}
                    {s.admin_reply && (
                      <div className="mt-3 rounded-md bg-secondary/60 border border-border p-3">
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] uppercase tracking-wider text-primary">
                          <Reply className="w-3 h-3" /> Your reply
                          <span className="ml-auto flex items-center gap-1 text-muted-foreground normal-case tracking-normal">
                            {s.reply_read_at
                              ? <><CheckCheck className="w-3 h-3 text-primary" /> Seen</>
                              : <><Check className="w-3 h-3" /> Sent · not seen yet</>}
                          </span>
                        </div>
                        <p className="text-xs text-foreground whitespace-pre-wrap">{s.admin_reply}</p>
                      </div>
                    )}

                    {/* Reply editor */}
                    <div className="mt-3 flex items-start gap-2">
                      <Textarea
                        value={replyDrafts[s.id] ?? ''}
                        onChange={(e) => setReplyDrafts((d) => ({ ...d, [s.id]: e.target.value }))}
                        placeholder={s.admin_reply ? 'Send an updated reply…' : 'Reply to this user…'}
                        rows={2}
                        maxLength={2000}
                        className="text-xs min-h-0"
                      />
                      <Button
                        size="sm"
                        onClick={() => sendReply(s.id)}
                        disabled={!(replyDrafts[s.id] || '').trim() || replyBusy === s.id}
                        className="h-8 gap-1.5 flex-shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {replyBusy === s.id ? 'Sending…' : s.admin_reply ? 'Update' : 'Reply'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
