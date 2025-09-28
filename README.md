# Skill Coverage Prototype

A simple Bayesian-style visualization tool for benchmarking student skills against industry job demand.

- Input: weighted skill dataset (from 1k+ JDs)
- Student: tick skills they have
- Output: raw coverage %, weighted coverage %, top missing skills, and a visualization

## Optimized build

Use the optimized static build in `dist/`:

- Minified assets: `style.min.css`, `script.min.js`
- Deferred scripts and pinned Chart.js CDN
- Preload CSS for faster first paint

### Serve locally

From the project root:

```bash
python3 -m http.server 8080 --bind 127.0.0.1
# open http://127.0.0.1:8080/dist/
```

Or:

```bash
npx --yes serve@14 dist
```
