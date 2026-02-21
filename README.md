# remenants-codex

Browser prototype for **REMNANTS**.

## Where the prototype is now

After you merge a PR, the files are in your GitHub repo on `main`:

- `index.html`
- `app.js`
- `style.css`
- `launch_remnants.py`

If you do not see them in GitHub:
1. Open the repository page.
2. Confirm branch dropdown is set to `main`.
3. Click **Go to file** and type `index.html`.

## How to run without a local install

### Option A — GitHub Pages (easiest for click-through)

1. Open **Settings → Pages** in your repository.
2. Under **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: `main`
   - Folder: `/ (root)`
3. Save.
4. Wait ~1–3 minutes.
5. Open the URL GitHub shows there (usually `https://<your-username>.github.io/remenants-codex/`).

This will load `index.html` directly from GitHub hosting, so you can play without local setup.

### Option B — GitHub Codespaces (no local install, still interactive)

1. Click **Code → Codespaces → Create codespace on main**.
2. In the terminal run:

```bash
python3 launch_remnants.py --no-open
```

3. Open the forwarded port `4173` in the browser preview.

## How to run locally (if/when you want)

```bash
python3 launch_remnants.py
```

This will start a local server and try to open your default browser to `index.html`.

## In-game click path

- Click `Deploy` (title screen)
- Click `Start Expedition` (base screen)

### Controls

- `WASD`: move
- `Shift`: sprint
- Avoid red hazard zones
- Reach extraction zone (green square)

## Troubleshooting

- If `localhost:4173` is already in use, run:
  - `python3 launch_remnants.py --port 4180`
- If browser does not auto-open, copy the printed URL and paste it manually.
