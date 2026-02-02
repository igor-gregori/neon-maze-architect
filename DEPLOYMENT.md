# Deployment: GitHub Pages (via GitHub Actions)

This project includes a GitHub Actions workflow to build the Vite app and publish the `dist/` directory to a `gh-pages` branch, which GitHub Pages can serve.

## What I changed

- Set `base: '/neon-maze-architect/'` in `vite.config.ts` so assets load correctly when served from `https://<username>.github.io/neon-maze-architect/`.
- Added `.github/workflows/deploy-gh-pages.yml` to build and deploy `dist/` to the `gh-pages` branch.

## How it works

1. On `push` to `main`, the workflow installs deps, runs `npm run build`, copies `dist/index.html` → `dist/404.html` (SPA fallback), then publishes `dist/` to `gh-pages` using `peaceiris/actions-gh-pages`.

## Steps you need to do in the GitHub UI

1. Push these changes to `main` and make sure the workflow runs (View Actions tab).
2. Go to **Settings → Pages** (or **Settings → Pages** in older UI) for the repo.
3. Set **Source** to **gh-pages** branch and **/ (root)** folder. Save.
4. Optionally set a custom domain or HTTPS enforcement.

Your site should be available at `https://<username>.github.io/neon-maze-architect/` shortly after deploy.

## Test locally

- Build locally:

```
npm run build
```

- Preview the production build locally:

```
npm run preview
```

or serve `dist/` with a static server:

```
npx http-server dist
```

## Notes

- If you rename the repo or host under a different path, update the `base` value in `vite.config.ts` accordingly.
- Keep secrets out of source code — the workflow uses the built-in `GITHUB_TOKEN` so no extra secret is required.
