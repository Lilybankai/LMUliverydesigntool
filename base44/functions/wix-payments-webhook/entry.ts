const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jwtVerify, importSPKI } from 'npm:jose@5.9.6';

Deno.serve(async (req) => {
  try {
    const publicKeyPem = Deno.env.get('WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY');
    if (!publicKeyPem) {
      console.error('Missing WIX_PAYMENTS_WEBHOOK_PUBLIC_KEY — rejecting webhook (fail closed).');
      return new Response('Missing key', { status: 500 });
    }

    const rawBody = await req.text();

    // Step 1: Verify JWT signature (RS256), fail closed
    const key = await importSPKI(publicKeyPem, 'RS256');
    const { payload: rawPayload } = await jwtVerify(rawBody, key, { algorithms: ['RS256'] });

    // Step 2: Double-nested JSON parse
    const event = JSON.parse(rawPayload.data as string);
    const eventData = JSON.parse(event.data);

    const base44 = createClientFromRequest(req);

    if (event.eventType === 'wix.ecom.v1.order_approved') {
      const order = eventData.actionEvent.body.order;
      const checkoutId = order.checkoutId;
      const buyerEmail = order?.buyerInfo?.email || null;

      // Find subscription line item — this app only sells one subscription product.
      let subscriptionId: string | null = null;
      for (const lineItem of order.lineItems || []) {
        if (lineItem?.subscriptionInfo?.id) {
          subscriptionId = lineItem.subscriptionInfo.id;
          break;
        }
      }

      if (!checkoutId) {
        console.warn('order_approved without checkoutId — ignoring');
        return new Response('ok', { status: 200 });
      }

      // Find the pending record we created at checkout.
      const rows = await db.asServiceRole.entities.Subscription.filter({ checkout_id: checkoutId });
      const record = rows?.[0];
      if (!record) {
        console.warn('No pending Subscription for checkoutId', checkoutId);
        return new Response('ok', { status: 200 });
      }

      // Flip to active, attach subscription_id, DO NOT overwrite user_email.
      await db.asServiceRole.entities.Subscription.update(record.id, {
        status: 'active',
        subscription_id: subscriptionId || record.subscription_id,
        buyer_email: buyerEmail || undefined,
        activated_at: new Date().toISOString(),
      });

      console.log('Activated subscription for', record.user_email, 'subId', subscriptionId);
      return new Response('ok', { status: 200 });
    }

    if (
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_canceled' ||
      event.eventType === 'wix.ecom.subscription_contracts.v1.subscription_contract_expired'
    ) {
      const contract = eventData.actionEvent.body.subscriptionContract;
      const subscriptionId = contract?.id;
      if (!subscriptionId) {
        console.warn('Cancel/expire webhook without subscriptionContract.id');
        return new Response('ok', { status: 200 });
      }

      const rows = await db.asServiceRole.entities.Subscription.filter({ subscription_id: subscriptionId });
      const record = rows?.[0];
      if (!record) {
        console.warn('No Subscription record for subscription_id', subscriptionId);
        return new Response('ok', { status: 200 });
      }

      const newStatus = event.eventType.endsWith('canceled') ? 'canceled' : 'expired';
      await db.asServiceRole.entities.Subscription.update(record.id, {
        status: newStatus,
        ended_at: new Date().toISOString(),
      });
      console.log(newStatus, 'subscription for', record.user_email);
      return new Response('ok', { status: 200 });
    }

    console.log('Ignoring event type:', event.eventType);
    return new Response('ok', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error?.message, error?.stack);
    return new Response('error', { status: 400 });
  }
});