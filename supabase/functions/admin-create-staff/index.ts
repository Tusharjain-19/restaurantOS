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

    // Caller must be admin/manager of a restaurant
    const { data: callerProfile } = await admin
      .from('profiles').select('restaurant_id, role').eq('user_id', userData.user.id).single();
    if (!callerProfile?.restaurant_id || !['admin', 'manager'].includes(callerProfile.role)) {
      return json({ error: 'Forbidden — restaurant admin only' }, 403);
    }
    const restaurantId = callerProfile.restaurant_id;

    const body = await req.json();
    const { name, email, phone, staff_id, pin, role, salary, shift } = body;
    if (!name || !email || !pin || !role || !staff_id) {
      return json({ error: 'Missing fields' }, 400);
    }
    if (!['captain', 'kitchen', 'cashier', 'manager', 'delivery'].includes(role)) {
      return json({ error: 'Invalid role' }, 400);
    }

    // 1. create auth user (password = PIN)
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email, password: pin, email_confirm: true,
      user_metadata: { name },
    });
    if (cErr || !created.user) return json({ error: cErr?.message ?? 'createUser failed' }, 400);
    const userId = created.user.id;

    // 2. update profile (trigger created it)
    await admin.from('profiles')
      .update({ restaurant_id: restaurantId, role, name })
      .eq('user_id', userId);

    // 3. insert staff row
    const { data: staffRow, error: sErr } = await admin.from('staff').insert({
      restaurant_id: restaurantId, user_id: userId,
      name, email, phone, staff_id, pin, role,
      salary: salary ?? null, shift: shift ?? 'full', is_active: true,
    }).select('id').single();
    if (sErr) return json({ error: sErr.message }, 400);

    return json({ success: true, staff_id: staffRow.id, user_id: userId });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
