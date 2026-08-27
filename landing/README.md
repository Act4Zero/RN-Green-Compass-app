# Green Compass landing site

The public marketing site for `greencompass.app`. It is a standalone Next.js
project; the product application remains in the repository root and is linked
at `https://app.greencompass.app`.

## Local development

```bash
pnpm install
pnpm dev
```

## Validation

```bash
pnpm lint
pnpm build
```

## Optional integrations

The site still renders when these variables are missing, but newsletter and
contact submissions return a temporary-unavailable response.

```text
KIT_FORM_ID=
KIT_API_KEY=
SHEETS_ENDPOINT=
SHEETS_TAB_ID=
```

For a standalone Vercel project, set the Root Directory to `landing`.
