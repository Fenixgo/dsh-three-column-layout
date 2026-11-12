# Contributing

Thanks for your interest. Before you open an issue or a pull request, please read the scope below.

## Scope and support

- This is a **reference/experiment** layout plugin for DeepSeek Harness, not a supported product.
- It is verified only against **DSH Desktop 0.2.2-rc.1 (macOS)**.
- It depends on DSH **private** sidebar/layout contracts (the `setSidebar` internal action, hashed CSS class names, slot names). These can change in any DSH release, so the plugin may break after a DSH upgrade.
- There is **no guarantee** of updates for new DSH versions. The plugin is provided "as is" under the MIT license.

## Reporting a bug

Please include:

1. DSH version and platform (e.g. `0.2.2-rc.1`, macOS 15).
2. The plugin version (`package.json`).
3. What you did, what you expected, and what happened.
4. Console errors if any (`[three-column-layout] ...`).
5. Whether disabling the bundle restores the stock sidebar (this separates plugin issues from DSH issues).

## Pull requests

- Keep changes focused; this plugin is intentionally small.
- Do not add business features or any data access — the plugin must stay a pure layout shell.
- Do not add a build step: it is plain browser JavaScript loaded through the DSH client module loader.
- Update `CHANGELOG.md` for user-visible changes.
- If you change a dependency on a DSH private contract, update the compatibility section in the README.

## Local development

Install the directory as a `link:` bundle in a DSH profile, edit `client.js`, then refresh the page (HMR reloads it). Manifest changes (`package.json` / `cordis.patch.yml`) need a restart or the reload step the plugin manager reports.
