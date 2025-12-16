# Stripe Payment Integration Setup

## Step 1: Add Your Stripe Keys to GitHub Secrets

Go to GitHub repo → Settings → Secrets and variables → Actions

Add these 3 secrets:
1. `STRIPE_SECRET_KEY` - Your Stripe secret key (sk_test_... or sk_live_...)
2. `STRIPE_WEBHOOK_SECRET` - Your webhook signing secret (whsec_...)
3. `VITE_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (pk_test_... or pk_live_...)

## Step 2: Set Up Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://flavours-from-home.co.uk/api/payment/webhook`
4. Events from: Your account
5. API version: Latest
6. Select event: `checkout.session.completed`
7. Add endpoint
8. Reveal the signing secret and add to GitHub Secrets

## Step 3: Deploy

Push your code to main branch - it will auto-deploy with the secrets from GitHub.

## Step 4: Test Payment

1. Go to https://flavours-from-home.co.uk
2. Add items to cart
3. Checkout
4. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
5. Complete payment
6. Order will be created in database
7. WhatsApp notifications will be sent

## Going Live

When ready for production:
1. Switch to Live mode in Stripe Dashboard
2. Get live keys (pk_live_... and sk_live_...)
3. Update GitHub Secrets with live keys
4. Create new webhook in Live mode
5. Update STRIPE_WEBHOOK_SECRET in GitHub Secrets
6. Push to deploy
