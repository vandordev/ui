# Vandor UI

An open-source collection of customizable React components by Vandor, distributed through the [shadcn registry](https://ui.shadcn.com/docs/registry).

- **Website:** https://vandor-ui.vercel.app
- **Documentation:** https://vandor-ui.vercel.app/docs
- **Repository:** https://github.com/vandordev/ui

Vandor UI's **Button** offers six variants, eight sizes, a subtle raised finish, smooth hover transitions, and configurable press feedback powered by `motion/react`. It builds on shadcn/ui's new-york style and Radix primitives.

## Stack

- Next.js 16, React 19, TypeScript, and Tailwind CSS 4
- Fumadocs and MDX for documentation
- shadcn/ui and Radix UI primitives
- Shiki and rehype-pretty-code for syntax highlighting
- Motion, optional audio feedback, and haptics
- Markdown documentation, `llms.txt`, and agent discovery endpoints

## Local Development

```bash
git clone https://github.com/vandordev/ui.git
cd ui
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Installing Components

Components are installed as source files, not as an npm component package. Initialize shadcn in your React project first, then install a registry item by its URL.

Install the Button:

```bash
pnpm dlx shadcn@latest add https://vandor-ui.vercel.app/r/button.json
```

## Adding a Registry Component

1. Add the source file under `registry/new-york/`.
2. Register the component, dependencies, and installation targets in `registry.json`.
3. Add its MDX documentation under `content/docs/components/` and update the relevant `meta.json` navigation.
4. Build the registry with `pnpm registry:build`.
5. Verify with `pnpm check`, `pnpm build`, and `pnpm typecheck`.

`components/ui/` contains the website's UI primitives. `registry/new-york/` contains components intended for distribution.

## Project Structure

```text
app/                  Next.js pages and route handlers
components/           Website and documentation components
constants/            Site identity, routes, and external links
content/docs/         MDX documentation
lib/                  Documentation, registry, and shared utilities
registry/new-york/    Distributable component source
registry.json         Registry manifest
public/r/             Generated registry JSON
seo/                  Metadata and structured data
styles/               Global styles and theme tokens
```

## Scripts

| Command               | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `pnpm dev`            | Start the development server              |
| `pnpm registry:build` | Generate registry files in `public/r/`    |
| `pnpm build`          | Build the registry and production website |
| `pnpm start`          | Serve the production build                |
| `pnpm typecheck`      | Check TypeScript types                    |
| `pnpm check`          | Check lint and formatting                 |
| `pnpm fix`            | Apply lint and formatting fixes           |

## Deployment

The default production URL is `https://vandor-ui.vercel.app`. On Vercel, `VERCEL_PROJECT_PRODUCTION_URL` takes precedence. Elsewhere, set `SITE_URL` to your production origin. Local development uses `http://localhost:3000`.

When changing domains, also update the homepage in `registry.json` and installation URLs in the documentation.

## Contributing

Report bugs and suggest components through [GitHub issues](https://github.com/vandordev/ui/issues). Pull requests are welcome.

## License

[MIT](./LICENSE). Required copyright notices are retained in the license.
