# Deploy IB Genie with Wix membership

This branch adds the Wix connection and production access controls. Installing the Wix files and supplying private deployment values are required before live AI access can work. No Wix site, Vercel project, live subscription, or paid AI call has been changed by this implementation.

## Vercel environment variables

Use the existing Next.js Vercel project with Node.js 22, `npm ci`, and `npm run build`. Enter variables in the project's **Environment Variables** settings for the intended environment, then redeploy. Select **Secret** for credentials. Vercel's current dashboard distinguishes readable Config values from write-only Secret values. Never use `NEXT_PUBLIC_` for a credential, put credentials in page code, or commit `.env.local`. [Vercel environment variable types](https://vercel.com/docs/environment-variables/sensitive-environment-variables)

| Variable | Type | Value to enter |
| --- | --- | --- |
| `APP_ORIGIN` | Config | Exact HTTPS app origin, for example `https://app.ibgenie.com`, without a path or trailing slash. Use your actual deployed domain. |
| `WIX_SITE_ORIGIN` | Config | `https://www.ibgenie.com` |
| `WIX_ALLOWED_ORIGINS` | Config | `https://www.ibgenie.com,https://ibgenie.com` |
| `WIX_UPGRADE_URL` | Config | `https://www.ibgenie.com/plans-pricing` |
| `WIX_PRO_PLAN_IDS` | Config | Actual Wix Pricing Plans IDs for Ultimate Pro/Pro, separated by commas. Include each eligible monthly and annual plan. Names and role IDs do not work. |
| `WIX_BRIDGE_SECRET` | Secret | A random secret of at least 32 characters. It must equal Wix's `IBGENIE_BRIDGE_SECRET`. |
| `SESSION_SECRET` | Secret | A different random secret of at least 32 characters. Used only by the app server. |
| `UPSTASH_REDIS_REST_URL` | Config | HTTPS REST endpoint from your Upstash Redis database. |
| `UPSTASH_REDIS_REST_TOKEN` | Secret | Read/write REST token for that database. |
| `GEMINI_API_KEY` | Secret | Google Gemini API key for text coaching and Pro generation. |
| `GEMINI_MODEL` | Config | Defaults to `gemini-3.8-flash`. Choose a supported model your Google project can access. |
| `OPENAI_API_KEY` | Secret | OpenAI project key, required for voice. |
| `OPENAI_REALTIME_MODEL` | Config | Defaults to `gpt-realtime-2.1`. Your project must have access. |
| `QSTASH_TOKEN` | Secret | Upstash QStash token, required with OpenAI to enable the server voice timer. |

Generate each signing secret separately on your own machine using `openssl rand -hex 32`. Paste the values directly into Vercel and Wix Secrets Manager. Do not send them in chat. Use separate secrets and Redis databases for staging and production.

| Optional setting | Default | Meaning |
| --- | --- | --- |
| `FREE_DAILY_MESSAGE_LIMIT` | `10` | Text coaching requests per signed-in free member per UTC day. |
| `PRO_DAILY_AI_LIMIT` | `200` | Combined text, resource generation and rubric feedback requests per Pro member per UTC day. |
| `PRO_DAILY_VOICE_LIMIT` | `10` | Voice starts per Pro member per UTC day. |
| `VOICE_SESSION_MINUTES` | `10` | Server-scheduled voice duration, between 1 and 30 minutes. |
| `AI_WORKSPACE_DAILY_LIMIT` | `2000` | Combined AI request ceiling across all members. |
| `VOICE_WORKSPACE_DAILY_LIMIT` | `100` | Voice-start ceiling across all members. |

Account services fail closed without the origins, approved plan IDs, two different signing secrets, and Redis credentials. Basic manual tools remain available. Voice stays disabled until both OpenAI and QStash are configured. These settings replace `AI_ACCESS_CODE`; a shared access code is no longer used.

## Install the Wix bridge

1. Enable Velo on the existing Wix site. Keep its current Members Area and Pricing Plans checkout. In Wix's package manager, install `@wix/site` for the current frontend authentication API. [Wix Site API installation](https://dev.wix.com/docs/sdk/host-modules/site/introduction)
2. Add these two entries in Wix **Secrets Manager**:

   | Wix secret | Value |
   | --- | --- |
   | `IBGENIE_BRIDGE_SECRET` | The same value as Vercel's `WIX_BRIDGE_SECRET`. |
   | `IBGENIE_APP_ORIGIN` | The exact same HTTPS origin as Vercel's `APP_ORIGIN`. |

3. Copy [ibgenie-policy.js](../integrations/wix/backend/ibgenie-policy.js) into Wix's **Backend** folder as `ibgenie-policy.js`.
4. Create a Backend **web module** named `ibgenie.web.js`, using [ibgenie.web.js](../integrations/wix/backend/ibgenie.web.js). Preserve `Permissions.SiteMember`. Only secret retrieval is elevated; the member and order lookups retain current-member permissions. Secret values stay in the backend. [Wix secret retrieval](https://dev.wix.com/docs/velo/apis/wix-secrets-backend-v2/secrets/get-secret-value)
5. Add an **Embed a Site** HTML component to the Wix app page. Set its ID to `ibGenieApp` and its website address to the app's exact HTTPS origin. Give it enough height for the workspace and enable its mobile layout. Paste [page-code.js](../integrations/wix/page-code.js) into that page's code. Remove the old `AUTH_STATUS`/`isPro` bridge for this component.
6. Put the actual paid plan IDs in Vercel's `WIX_PRO_PLAN_IDS`. Use the IDs of your existing plans, not their display names, member roles, Wix site ID, order IDs or subscription IDs.
7. Publish the Wix page. Membership APIs need the published site for complete behaviour; Editor Preview alone cannot validate this integration. [Wix member lookup](https://dev.wix.com/docs/velo/apis/wix-members-backend/current-member/get-member), [Wix sign-in prompt](https://dev.wix.com/docs/velo/apis/wix-members-frontend/authentication/prompt-login)

The page uses `@wix/site` for `loggedIn()` and the supported Velo `promptLogin()` for Wix's login dialog. The deprecated Velo `loggedIn()` method is not used. [Current Wix login state API](https://dev.wix.com/docs/sdk/host-modules/site/authentication/logged-in)

If your canonical Wix domain changes, update the backend's `ISSUER`, `WIX_SITE_ORIGIN` and the exact allowed origins together. The app accepts messages only from its parent window and an approved origin. Its frame policy permits only the approved Wix origins and itself. Do not add wildcard origins.

## Who gets access

| User | Included |
| --- | --- |
| Guest | Onboarding, manual resources, starter resources, quizzes, flashcard review, planning, curriculum links and local backup/export. |
| Signed-in free Wix member | Basic tools plus 10 AI text-coaching requests per day by default. |
| Verified paying Pro member | Text coaching, AI resources, formative rubric feedback and realtime voice, within the configured allowances. |

Student/teacher selection personalizes the interface. It cannot grant Pro access or Wix administration rights.

The Wix backend queries the logged-in member's orders with `listCurrentMemberOrders()`, including pagination. It signs only eligible plan IDs and their end dates. Orders must have `lastPaymentStatus: PAID`, a positive plan price, a valid start date, and an active paid period. Free trials, paused, pending, expired, refunded, failed-payment and unpaid orders do not grant Pro. A cancellation at the next payment date retains access until its confirmed future end date; immediate or failed-payment cancellations do not. Vercel then applies its own plan-ID allowlist. [Wix current-member orders and order fields](https://dev.wix.com/docs/velo/apis/wix-pricing-plans-backend/orders/list-current-member-orders)

Assertions are signed, nonce-bound, valid for 90 seconds, and consumed once in Redis. App sessions last at most five minutes and refresh from Wix every minute while embedded. A confirmed paid-period end can shorten that lifetime. Subscription changes therefore take effect after the next successful refresh, with a maximum five-minute window for already issued sessions. Disconnect clears this tab's session; use Wix's account menu to log out of Wix itself.

Usage is stored under a hash of the verified member ID. New tabs, devices, sign-ins and cleared browser storage cannot reset it. Redis atomically checks member and workspace limits before reserving a request. Failed requests refund the daily reservation, while per-minute abuse limits remain. All daily allowances reset at midnight UTC.

## Live voice

The app sends the SDP offer to its own backend. That backend uses the private OpenAI key and obtains a controllable call ID. It schedules a signed QStash timeout before giving the SDP answer to the browser. If scheduling fails, it attempts to hang up the call and returns an error. The timeout and End button call OpenAI's server hangup endpoint, which supports WebRTC. [OpenAI server controls](https://developers.openai.com/api/docs/guides/realtime-server-controls), [OpenAI hangup](https://developers.openai.com/api/reference/resources/realtime/subresources/calls/methods/hangup)

QStash must be able to POST to `APP_ORIGIN/api/realtime/timeout`. The callback authenticates its purpose-bound signed payload; it does not use browser cookies. Deployment protection that blocks QStash also blocks termination. Verify delivery on your chosen deployment. Jobs retry after failures; their payloads are redacted from QStash dashboard logs. [QStash publishing and delayed delivery](https://upstash.com/docs/qstash/api/publish)

A delayed job is not a currency budget or a guarantee of exact wall-clock termination during provider/network outages. Monitor failed deliveries and provider usage. Configure provider budget controls and alerts appropriate to your account. Do not rotate `SESSION_SECRET` during active calls, because it also verifies queued termination tokens; pause new voice starts and let calls finish first.

Voice requires HTTPS, microphone consent, WebRTC support and permission from any embedding Wix frame. If Wix blocks the microphone, **Open in a new tab** creates a single-use 45-second link with its code in the URL fragment, then removes that fragment. It preserves the original five-minute membership expiry. A separate tab needs reconnecting through Wix after five minutes; it cannot independently refresh Wix membership. The scheduled server call cap still applies.

## Preferences, resources and Firebase

Onboarding remembers the name/nickname, student/teacher choice, programme, programme year, DP examination session/year, default level and selected subjects. Profile & settings edits them later. Resources and preferences remain device-local, with separate workspace keys for verified Wix members. Existing guest data stays under the original key. Use JSON export/import to move work deliberately between workspaces or devices.

This is not cloud sync or encrypted storage. Anyone with access to the browser profile can inspect local data, including classic chat history. Back up before clearing site data. Text and selected notes go to Google for AI requests; voice audio goes to OpenAI. The new workspace does not automatically save conversations.

The supplied ZIP contained a browser `isPro` message and a local usage counter, but no Wix backend module, Firebase credentials, `.env` values or private service account. Its upgrade URL has been preserved. The repo's old Firebase initializer remains unused by this integration. No Firebase key is required for Wix membership or quotas, and no credential was copied into client code.

## Live acceptance checks before launch

Use the published Wix page and dedicated test members. Confirm a guest cannot call paid APIs, a free member gets the configured allowance across two devices, and message 11 receives `DAILY_LIMIT`. Check an approved paid member can generate a resource, obtain rubric feedback and start voice. Verify a similarly named but unapproved plan does not unlock Pro. Test refund, failed payment, pause, immediate cancellation, cancellation at renewal and expiry.

Reload to check remembered onboarding, edit the profile, and switch members to verify the correct local workspace loads. Check keyboard navigation, mobile layout, denied microphone permission, interruptions and disconnects. For voice, temporarily set `VOICE_SESSION_MINUTES=1` in staging and verify QStash delivery actually ends the provider call, even with the browser timer disabled. Restore the intended limit afterward.

Unit and integration tests exercise the code contracts, but cannot confirm your actual Wix plan IDs, secrets, published iframe configuration, provider permissions or live billing state. These deployment-specific checks remain required.
