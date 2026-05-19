# is it loud in here?

A tiny Shazam-style web app: tap the button, point your phone, get a verdict — *not too loud*, *TOO LOUD*, or *WAAAAY TOO LOUD*.

## How it works

- `getUserMedia` opens the mic
- Web Audio `AnalyserNode` computes the RMS of the signal
- RMS → dBFS → offset by +94 to fake a dB SPL reading
- Three thresholds: `<75` / `75–89` / `≥90`

The dB number is **not** lab-calibrated — it's approximate by design.

## Running locally

```bash
# any static server works
python3 -m http.server 8000
# then open http://localhost:8000 on the same network from your phone
```

Mic access requires HTTPS or localhost. To test from your phone, use your computer's local IP and a tool like `mkcert` for local HTTPS, or push to GitHub Pages.

## Files

- `index.html` — markup
- `styles.css` — light gray ground, chunky outlined verdicts, vertical level meter
- `app.js` — mic capture + dB math + UI updates
