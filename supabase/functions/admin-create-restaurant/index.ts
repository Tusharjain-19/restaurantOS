import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authHeader = req.headers.get('Authorization') ?? '';

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return json({ error: 'Unauthorized' }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: hq } = await admin
      .from('hq_admins').select('id').eq('email', userData.user.email).maybeSingle();
    if (!hq) return json({ error: 'Forbidden — HQ admins only' }, 403);

    const body = await req.json();
    const { restaurant_name, admin_email, admin_password, expires_at, plan, client_email, client_mobile, account_details } = body;
    if (!restaurant_name || !admin_email || !admin_password) {
      return json({ error: 'Missing fields' }, 400);
    }

    // 1. create auth user
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email: admin_email, password: admin_password, email_confirm: true,
      user_metadata: { name: restaurant_name + ' Admin' },
    });
    if (cErr || !created.user) return json({ error: cErr?.message ?? 'createUser failed' }, 400);
    const userId = created.user.id;

    // 2. create restaurant
    const { data: rest, error: rErr } = await admin
      .from('restaurants')
      .insert({ name: restaurant_name, onboarding_complete: false, is_active: true })
      .select('id').single();
    if (rErr) return json({ error: rErr.message }, 400);
    const restaurantId = rest.id;

    // 3. link profile (handle_new_user trigger creates it)
    await admin.from('profiles')
      .update({ restaurant_id: restaurantId, role: 'admin', name: restaurant_name + ' Admin' })
      .eq('user_id', userId);

    // 4. license record
    const licenseKey = generateKey();
    await admin.from('licenses').insert({
      license_key: licenseKey,
      restaurant_name, admin_username: admin_email, admin_password,
      is_active: true,
      expires_at: expires_at ?? new Date(Date.now() + 365 * 86400000).toISOString(),
      restaurant_id: restaurantId,
      subscription_plan: plan ?? 'Standard',
      client_email: client_email ?? null,
      client_mobile: client_mobile ?? null,
      account_details: account_details ?? null,
    });

    return json({ success: true, restaurant_id: restaurantId, user_id: userId, license_key: licenseKey });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
function generateKey() {
  const c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () =>
    Array.from({ length: 5 }, () => c[Math.floor(Math.random() * c.length)]).join('')
  ).join('-');
}
