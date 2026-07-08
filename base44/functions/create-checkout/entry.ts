const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Monthly subscription price — kept in sync with the frontend paywall UI.
const PRICE = "2.99";
const CURRENCY_NOTE = "GBP"; // set in Wix Payments dashboard; here just for logging.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await db.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'You must be signed in to subscribe.' }, { status: 401 });
    }

    const apiKey = Deno.env.get('WIX_PAYMENTS_API_KEY');
    const siteId = Deno.env.get('WIX_PAYMENTS_SITE_ID');
    if (!apiKey || !siteId) {
      console.error('Missing Wix Payments env vars');
      return Response.json({ error: 'Payments not configured.' }, { status: 500 });
    }

    // Wix rejects charges under 0.50 in the charged currency — 2.99 is well above.
    const origin = req.headers.get('Origin') || req.headers.get('origin');
    if (!origin) {
      return Response.json({ error: 'Missing origin.' }, { status: 400 });
    }

    const body = {
      cart: {
        items: [
          {
            name: 'LMU Livery Studio Pro',
            quantity: 1,
            price: PRICE,
            subscriptionInfo: {
              subscriptionSettings: {
                frequency: 'MONTH',
              },
              title: 'LMU Livery Studio Pro — Monthly',
              description: 'Unlimited livery exports, billed monthly. Cancel anytime.',
            },
          },
        ],
        customerInfo: {
          email: user.email,
          firstName: (user.full_name || '').split(' ')[0] || undefined,
          lastName: (user.full_name || '').split(' ').slice(1).join(' ') || undefined,
        },
      },
      callbackUrls: {
        postFlowUrl: origin,
        thankYouPageUrl: `${origin}/ThankYou`,
      },
    };

    const resp = await fetch(
      'https://www.wixapis.com/payments/platform/v1/checkout-sessions/construct',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey,
          'wix-site-id': siteId,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await resp.json();
    if (!resp.ok) {
      console.error('Wix create-checkout failed:', resp.status, JSON.stringify(data));
      return Response.json({ error: data?.message || 'Failed to create checkout.' }, { status: 500 });
    }

    const session = data.checkoutSession;
    if (!session?.id || !session?.redirectUrl) {
      console.error('Wix returned unexpected shape:', JSON.stringify(data));
      return Response.json({ error: 'Unexpected checkout response.' }, { status: 500 });
    }

    // Persist a pending subscription record linked to the logged-in user's email.
    // Service role — the entity RLS is admin-write.
    await db.asServiceRole.entities.Subscription.create({
      user_email: user.email,
      checkout_id: session.id,
      status: 'pending',
    });

    console.log('Created checkout', session.id, 'for', user.email, CURRENCY_NOTE);
    return Response.json({ redirectUrl: session.redirectUrl, checkoutId: session.id });
  } catch (error) {
    console.error('create-checkout error:', error?.message, error?.stack);
    return Response.json({ error: error?.message || 'Unknown error' }, { status: 500 });
  }
});