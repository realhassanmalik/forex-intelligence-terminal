# Put your terminal online (free public link)

This turns the app into a real URL anyone can open — no need to keep your
computer running. It uses **Render** (one free account hosts both halves) and
**GitHub** (where the code lives). Total time: ~15 minutes, one-time.

Everything is already wired up (`render.yaml`). You just click through it.

---

## Step 1 — Put the code on GitHub

1. Create a free account at https://github.com (skip if you have one).
2. Click **+** (top-right) → **New repository**.
   - Name: `forex-intelligence-terminal`
   - Keep it **Public** (Render's free tier needs to read it), then **Create**.
3. On the new repo page, click **uploading an existing file**, then drag in the
   contents of your `forex-intelligence-terminal` folder **except** these
   (they're big and rebuild themselves): `frontend/node_modules`,
   `frontend/.next`, `backend/.venv`. Click **Commit changes**.

   > Prefer the command line? From the project folder run:
   > `git init && git add . && git commit -m "initial" && git branch -M main`
   > then follow GitHub's "push an existing repository" lines.
   > (A `.gitignore` is already included, so the big folders are skipped.)

---

## Step 2 — Deploy on Render

1. Create a free account at https://render.com and choose **Sign in with GitHub**
   (this lets Render see your repo).
2. Click **New +** → **Blueprint**.
3. Select your `forex-intelligence-terminal` repo. Render reads `render.yaml`
   and shows **two services**: `forex-backend` and `forex-frontend`.
4. It will ask you to fill one value — **`NEXT_PUBLIC_API_BASE_URL`**.
   Leave it blank for now (or put any placeholder) and click **Apply**.
5. Wait for **forex-backend** to finish (a few minutes). Open it and copy its
   URL — it looks like `https://forex-backend.onrender.com`.
6. Go to **forex-frontend** → **Environment** → set
   `NEXT_PUBLIC_API_BASE_URL` to that backend URL → **Save changes**.
   The frontend redeploys automatically.

---

## Done

Open the **forex-frontend** URL (e.g. `https://forex-frontend.onrender.com`) —
that's your public link. Share it with anyone.

### Good to know
- **Free tier sleeps.** After ~15 min idle the services pause; the next visit
  takes ~30–50 seconds to wake up, then it's fast. Fine for a demo/portfolio.
- **Data resets on redeploy.** It uses a temporary SQLite file and re-seeds the
  demo data on each start, so trades you add won't persist across restarts. Add
  a paid Postgres database later if you want permanent storage.
- **Real AI:** on the `forex-backend` service, add env vars `AI_PROVIDER=claude`
  and `ANTHROPIC_API_KEY=...` to switch off mock mode.
- **Updating the site:** push a change to GitHub and Render redeploys on its own.
