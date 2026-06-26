<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:stripe-agent-rules -->
# Stripe Best Practices
1. **Always use Restricted API Keys (RAK)** (prefixed with `rk_`) over standard secret keys (`sk_`).
2. **Checkout Sessions**: Use Stripe Checkout Sessions for payments and subscriptions.
3. **Idempotency Keys**: Ensure every API call includes an idempotency key to prevent duplicate charges or state conflicts in the event of retries.
4. **Testing**: Use Stripe emulator or test mode to verify payment flows.
<!-- END:stripe-agent-rules -->
