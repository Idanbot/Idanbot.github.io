# idanbot.me (GitHub Pages)

Personal portfolio: **Vite**, **React 19**, **Tailwind CSS v4**, **Framer Motion**, and **shadcn-style** UI primitives (`src/components/ui/`).

Live site: **[https://idanbot.me/](https://idanbot.me/)** (custom domain on GitHub Pages).

## Development

```bash
npm ci
npm run dev
```

```bash
npm run lint
npm run test
npm run build
npm run preview
```

Continuous integration runs on every push and pull request via [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (**lint**, **test**, **build**).

## Deploy (GitHub Pages + custom domain)

The workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) runs on pushes to `main`: **lint**, **test**, **build**, verifies [`public/CNAME`](public/CNAME) in `dist`, then publishes with **GitHub Pages**.

### Repository settings

1. **Settings → Pages**
   - **Source**: GitHub Actions (not “Deploy from a branch” unless you intentionally use that flow).
   - **Custom domain**: `idanbot.me`
   - After DNS validates, enable **Enforce HTTPS**.

### DNS at your registrar

Point the apex domain **`idanbot.me`** to GitHub Pages using GitHub’s current records (see [Configuring an apex domain](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)):

- **A records** for `@` to the IPs listed in GitHub’s documentation (they can change; always confirm in GitHub Pages settings or the doc above).
- Optionally **AAAA** for IPv6 if you use them.

Alternatively, use a **www** subdomain with a **CNAME** to your GitHub Pages hostname (for example `idanbot.github.io`) as shown in GitHub’s **Custom domain** panel for this repository.

### `CNAME` file

[`public/CNAME`](public/CNAME) must contain a single hostname:

```text
idanbot.me
```

Vite copies `public/` into `dist/`, so the live site serves the file and GitHub Pages keeps the custom domain mapping.

## License

Private / all rights reserved unless stated otherwise.
