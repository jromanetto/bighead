# JWT Rotation TODO — service_role key

## Context

Three committed migrations historically inlined the project's `service_role` JWT
in cron job bodies and `SECURITY DEFINER` functions:

- `supabase/migrations/20260525120100_weekly_challenges_cron.sql`
- `supabase/migrations/20260525120200_weekly_notifications.sql`
- `supabase/migrations/20260525140000_contextual_notifications.sql`

The token has been redacted from the files, and migration
`20260526120000_secure_cron_jwt.sql` now reads the JWT at runtime from
**Supabase Vault** via the helper `public.get_service_role_jwt()`.

> Until the Vault secret is populated, every cron job that calls an edge
> function (5 of them) will short-circuit with a `WARNING`. **You must do
> step 1 + step 2 below.**

## Project info

- Project ID: `dqhhpoxqrtlmhosrsdxp`
- Dashboard: <https://supabase.com/dashboard/project/dqhhpoxqrtlmhosrsdxp>
- Affected cron jobs: `close-weekly-challenge`, `generate-weekly-challenge`,
  `weekly-start-notif`, `weekly-midweek-notif`, `weekly-lastday-notif`
- Functions reading the secret: `notify_weekly_challenge`,
  `notify_user_if_enabled`

---

## Step 1 — Rotate the service_role key in Supabase

1. Open <https://supabase.com/dashboard/project/dqhhpoxqrtlmhosrsdxp/settings/api>
2. Locate **Project API keys → service_role**.
3. Click **Reveal**, then **Rotate** (or "Generate new key").
4. Copy the new JWT — you'll need it once and never again.
5. Also update any place that consumes the old token *outside* the DB:
   - EAS / Expo secrets (`SUPABASE_SERVICE_ROLE_KEY`)
   - VPS `~/.bashrc` or `/etc/environment` (instagram-pipeline)
   - GitHub Actions secrets, if any
   - Local `.env` files (developers)

Old token (now invalid after rotation): the full value is preserved in the
git history of the three migration files above (commit `c9516a4` and prior).
See **Step 4** to scrub it from history.

---

## Step 2 — Populate the Vault secret

Open the **Supabase SQL editor** for the project and run:

```sql
select vault.create_secret(
  '<PASTE_NEW_SERVICE_ROLE_JWT_HERE>',
  'service_role_key',
  'service_role JWT used by pg_cron + pg_net to call edge functions'
);
```

If the secret already exists (e.g. you've rotated before), grab its UUID and
update it instead:

```sql
-- Find existing id
select id from vault.secrets where name = 'service_role_key';

-- Update it
select vault.update_secret(
  '<EXISTING_SECRET_UUID>'::uuid,
  '<PASTE_NEW_SERVICE_ROLE_JWT_HERE>'
);
```

Verify the helper returns a non-null value:

```sql
select length(public.get_service_role_jwt()) as jwt_length;
-- expected: ~220 characters
```

---

## Step 3 — Verify cron jobs work with the new key

Wait until at least one cron job fires naturally (see schedules above), then:

```sql
select jobname, status, return_message, start_time, end_time
from cron.job_run_details d
join cron.job j on j.jobid = d.jobid
where j.jobname in (
  'close-weekly-challenge',
  'generate-weekly-challenge',
  'weekly-start-notif',
  'weekly-midweek-notif',
  'weekly-lastday-notif'
)
order by start_time desc
limit 20;
```

`return_message` should be empty or contain a positive `request_id`. If you see
`401 Unauthorized` payloads in the edge function logs, the Vault secret is
wrong or stale.

You can also fire the broadcast function manually:

```sql
select public.notify_weekly_challenge('weekly_start');
```

If the secret is missing it will `RAISE WARNING` and return without calling
the edge function — safe to test.

---

## Step 4 (recommended) — Scrub the leaked JWT from git history

Even though the token will be invalid after Step 1, removing it from the
public history is good hygiene. **Force-pushes rewrite history — coordinate
with anyone else who has clones.**

Install `git-filter-repo` (one-time): `brew install git-filter-repo`

From the repo root:

```bash
# 1. Make a fresh mirror clone (filter-repo refuses to run in a normal clone
#    with a remote unless --force is passed; the mirror approach is safer).
cd /tmp
git clone --mirror git@github.com:<owner>/bighead.git bighead-scrub.git
cd bighead-scrub.git

# 2. Write the literal token to a replacements file.
#    Format per git-filter-repo docs: `OLD==>NEW` on a single line.
#    Paste the FULL old JWT (lift it from `git show c9516a4 --
#    supabase/migrations/20260525120100_weekly_challenges_cron.sql`).
cat > /tmp/jwt-replace.txt <<'EOF'
<PASTE_FULL_OLD_JWT_HERE>==><REDACTED_JWT>
EOF

# 3. Rewrite history.
git filter-repo --replace-text /tmp/jwt-replace.txt

# 4. Force-push the rewritten refs.
git push --force --all
git push --force --tags
```

Then ask every collaborator to re-clone (or `git fetch && git reset --hard
origin/<branch>` on every branch they care about). Local clones still hold
the old object until they prune.

---

## Why this matters

The leaked JWT had `role: service_role` — it **bypasses RLS** and can read /
write **any** row in the DB (`auth.users`, `xp_transactions`, payment data,
push tokens, etc.). Until Step 1 is complete, anyone who saw the migration
file before the redaction can run arbitrary SQL on the production project.

## State after this PR

- [x] Hardcoded JWT removed from 3 migration files (redacted to placeholder).
- [x] `public.get_service_role_jwt()` helper installed (reads from Vault).
- [x] Cron jobs + `notify_*` functions rewritten to call the helper.
- [ ] **TODO (manual): Step 1 — rotate the key in the Dashboard.**
- [ ] **TODO (manual): Step 2 — populate `service_role_key` in Vault.**
- [ ] **TODO (manual): Step 3 — verify a cron run with the new key.**
- [ ] **TODO (optional): Step 4 — scrub leaked JWT from git history.**
