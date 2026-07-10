import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null;

const requireSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.');
  }
  return supabase;
};

const getCurrentUser = async () => {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  if (!data.user) {
    const authError = new Error('Authentication required');
    authError.status = 401;
    throw authError;
  }
  return data.user;
};

const toAppUser = async (authUser) => {
  const client = requireSupabase();
  const { data: profile } = await client
    .from('profiles')
    .select('marketing_opt_in, marketing_opt_in_date, free_export_used')
    .eq('id', authUser.id)
    .maybeSingle();

  return {
    id: authUser.id,
    email: authUser.email,
    role: authUser.app_metadata?.role || 'user',
    created_date: authUser.created_at,
    marketing_opt_in: profile?.marketing_opt_in || false,
    marketing_opt_in_date: profile?.marketing_opt_in_date || null,
    free_export_used: profile?.free_export_used || false,
  };
};

const mapSavedDesign = (row) => ({
  id: row.id,
  name: row.name,
  vehicleId: row.vehicle_id,
  baseColour: row.base_colour,
  customColour: row.custom_colour,
  baseOpacity: row.base_opacity,
  layers: row.layers || [],
  created_date: row.created_at,
  updated_date: row.updated_at,
});

const mapSubscription = (row) => ({
  id: row.id,
  user_email: row.user_email,
  checkout_id: row.checkout_id,
  subscription_id: row.subscription_id,
  status: row.status,
  buyer_email: row.buyer_email,
  activated_at: row.activated_at,
  ended_at: row.ended_at,
  created_date: row.created_at,
  updated_date: row.updated_at,
});

const sortToColumn = (sort, fallback = 'updated_at') => {
  if (!sort) return { column: fallback, ascending: false };
  const raw = String(sort);
  const descending = raw.startsWith('-');
  const key = descending ? raw.slice(1) : raw;
  const columnMap = {
    created_date: 'created_at',
    updated_date: 'updated_at',
    user_email: 'user_email',
    status: 'status',
  };
  return { column: columnMap[key] || key, ascending: !descending };
};

const savedDesignEntity = {
  async list(sort = '-updated_date', limit) {
    const client = requireSupabase();
    const { column, ascending } = sortToColumn(sort);
    let query = client.from('saved_designs').select('*').order(column, { ascending });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapSavedDesign);
  },

  async create(payload) {
    const client = requireSupabase();
    const user = await getCurrentUser();
    const { data, error } = await client
      .from('saved_designs')
      .insert({
        user_id: user.id,
        name: payload.name,
        vehicle_id: payload.vehicleId,
        base_colour: payload.baseColour || null,
        custom_colour: payload.customColour || null,
        base_opacity: typeof payload.baseOpacity === 'number' ? payload.baseOpacity : 1,
        layers: payload.layers || [],
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapSavedDesign(data);
  },

  async delete(id) {
    const client = requireSupabase();
    const { error } = await client.from('saved_designs').delete().eq('id', id);
    if (error) throw error;
    return {};
  },
};

const subscriptionEntity = {
  async filter(filters = {}, sort = '-created_date', limit) {
    const client = requireSupabase();
    const { column, ascending } = sortToColumn(sort, 'created_at');
    let query = client.from('subscriptions').select('*').order(column, { ascending });
    for (const [key, value] of Object.entries(filters)) {
      query = query.eq(key, value);
    }
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapSubscription);
  },
};

const mapSuggestion = (row) => ({
  id: row.id,
  email: row.email,
  category: row.category,
  title: row.title,
  body: row.body,
  status: row.status,
  admin_notes: row.admin_notes,
  created_date: row.created_at,
  updated_date: row.updated_at,
});

const suggestionEntity = {
  async create(payload) {
    const client = requireSupabase();
    const user = await getCurrentUser();
    const { data, error } = await client
      .from('suggestions')
      .insert({
        user_id: user.id,
        email: user.email,
        category: payload.category || 'feature',
        title: payload.title,
        body: payload.body || null,
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapSuggestion(data);
  },

  async list(sort = '-created_date', limit) {
    const client = requireSupabase();
    const { column, ascending } = sortToColumn(sort, 'created_at');
    let query = client.from('suggestions').select('*').order(column, { ascending });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapSuggestion);
  },

  async update(id, updates) {
    const client = requireSupabase();
    const patch = {};
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.admin_notes !== undefined) patch.admin_notes = updates.admin_notes;
    const { data, error } = await client
      .from('suggestions')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return mapSuggestion(data);
  },
};

// Admin-only aggregate reads for the dashboard. Every query is protected by
// row-level security (public.is_admin()) — a non-admin caller just gets nothing.
const adminApi = {
  // Fetch the raw timestamps needed to compute every dashboard metric for a
  // given window. Pass sinceISO = null for "all time".
  async fetchActivity(sinceISO) {
    const client = requireSupabase();
    const build = (table, cols) => {
      let q = client.from(table).select(cols);
      if (sinceISO) q = q.gte('created_at', sinceISO);
      return q;
    };
    const [profiles, designs, events] = await Promise.all([
      build('profiles', 'created_at'),
      build('saved_designs', 'created_at'),
      build('analytics_events', 'created_at, event_name'),
    ]);
    if (profiles.error) throw profiles.error;
    if (designs.error) throw designs.error;
    if (events.error) throw events.error;
    return {
      signups: profiles.data || [],
      saves: designs.data || [],
      events: events.data || [],
    };
  },
};

export const db = {
  auth: {
    async isAuthenticated() {
      if (!supabase) return false;
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    },

    async me() {
      return toAppUser(await getCurrentUser());
    },

    async updateMe(updates) {
      const client = requireSupabase();
      const user = await getCurrentUser();
      const { data, error } = await client
        .from('profiles')
        .upsert({
          id: user.id,
          marketing_opt_in: updates.marketing_opt_in,
          marketing_opt_in_date: updates.marketing_opt_in_date,
          free_export_used: updates.free_export_used,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },

    async logout(redirectTo) {
      if (supabase) await supabase.auth.signOut();
      if (redirectTo) window.location.href = redirectTo;
    },

    async redirectToLogin(redirectTo) {
      const client = requireSupabase();
      // Always return to a clean, allowlisted URL — never echo back any
      // ?error/#access_token junk left in the address bar from a prior attempt.
      const target = redirectTo || `${window.location.origin}${window.location.pathname}`;
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: target },
      });
      if (error) throw error;
    },

    async signInWithPassword(email, password) {
      const client = requireSupabase();
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },

    async signUp(email, password) {
      const client = requireSupabase();
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) throw error;
      // data.session is null when email confirmation is required.
      return data;
    },

    // Subscribe to Supabase auth changes. Returns an unsubscribe function.
    onAuthStateChange(callback) {
      if (!supabase) return () => {};
      const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
      return () => data?.subscription?.unsubscribe();
    },
  },

  entities: {
    SavedDesign: savedDesignEntity,
    Subscription: subscriptionEntity,
    Suggestion: suggestionEntity,
  },

  admin: adminApi,

  functions: {
    async invoke() {
      return {
        data: {
          error: 'Checkout is not configured yet. Connect a payment provider or Supabase Edge Function first.',
        },
      };
    },
  },

  integrations: {
    Core: {
      async UploadFile() {
        return { file_url: '' };
      },
    },
  },

  analytics: {
    // Fire-and-forget event logging into public.analytics_events.
    // Never throws — analytics must never break the app.
    track({ eventName, properties } = {}) {
      if (!supabase || !eventName) return;
      (async () => {
        try {
          const { data } = await supabase.auth.getUser();
          await supabase.from('analytics_events').insert({
            user_id: data?.user?.id ?? null,
            event_name: eventName,
            properties: properties || {},
          });
        } catch {
          /* non-fatal */
        }
      })();
    },
  },
};

export const base44 = db;
globalThis.__B44_DB__ = db;
export default db;
