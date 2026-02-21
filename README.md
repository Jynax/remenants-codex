# remenants-codex

Browser prototype for **REMNANTS**.

## Fastest way to play (click-through)

Run:

```bash
python3 launch_remnants.py
```

This will:
1. Start a local server.
2. Open your default browser directly to the playable build.

Then click:
- `Deploy` (title screen)
- `Start Expedition` (base screen)

### Controls
- `WASD`: move
- `Shift`: sprint
- Avoid red hazard zones
- Reach extraction zone (green square)

## Alternate manual run

```bash
python3 -m http.server 4173
```

Then open <http://localhost:4173/index.html>.

## v0.3a prototype scope

This build adds a testable loop for:

- Home Base state
- Operative death creating a corpse record
- Real-time corpse decay timer that starts in base
- Recovery deployment objective: reach corpse, secure payload, extract back to base
- Knowledge payout based on corpse payload integrity

## Troubleshooting

- If `localhost:4173` is already in use, run: `python3 launch_remnants.py --port 4180`.
- If your browser does not auto-open, copy the printed URL and paste it manually.
