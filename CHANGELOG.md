# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/), and the project uses [Semantic Versioning](https://semver.org/).

> **Compatibility note:** this plugin targets DSH **Desktop 0.2.2-rc.1 (macOS)** and depends on DSH's private sidebar/layout contracts. Expect parts of it to need updates when DSH upgrades. See the compatibility section in the README.

## [1.3.0]

### Changed
- Package renamed to `@fenixgo/dsh-three-column-layout` (from `@local/dsh-three-column-layout`) for open source. The loader row stays `layout-shell`.

## [1.2.3]

### Changed
- Prepare the package for open source: remove business-specific references from the documentation, add MIT `LICENSE`, add an English `README.en.md`, add `license` and `keywords` to `package.json`, drop `private`.
- Unify internal log prefixes (`[cockpit]` / `[sidebar-rail]`) to `[three-column-layout]`; no behavior change.

## [1.2.2]

### Added
- Desktop preview image in the plugin documentation (`docs/preview.png`, business content blurred). The plugin page now explicitly selects the README as its detail document.

## [1.2.1]

### Fixed
- Selecting DSH-internal panels (Plugins, Schedules) keeps the DSH rail entry highlighted, matching the collapsed-state grouping.

## [1.2.0]

### Changed
- Renamed the plugin to **Three-column app layout** (三栏应用布局); package id `@fenixgo/dsh-three-column-layout`, loader row `layout-shell`.

## [1.1.15] – [1.1.17]

### Added
- Unified blue hover/selected accent that only changes icon/text color, with no background fill.

### Fixed
- Collapsed rail icons no longer shift horizontally or vertically; the expanded header no longer slides across during expansion.
- Title and view-label rows share the same inline padding so they stay left-aligned.

> 1.1.16 tried to extend the top strip behind the macOS traffic lights; it looked wrong and was reverted in 1.1.17.

## [1.1.12] – [1.1.14]

### Changed
- The second column is now a fixed-width panel that slides with `transform: translateX()`, so text is never squeezed into fragments at the seam.
- All expand/collapse animations shortened to 160ms (native grid, center padding, panel slide).
- Adjusted rail icon spacing and icon-label gap.

## [1.1.4] – [1.1.11]

### Changed
- The 60px collapsed rail is rendered by the still-mounted `sidebar` component (no separate `shell.overlay` layer), so the account entry keeps its native slot and interactions.
- Collapse keeps the native column-width animation; a stable rail is shown during the transition.
- Right-edge divider drawn as an inset shadow so it does not affect layout width.
- Removed the `⌘B` shortcut bubble on the collapse button.

## [1.1.0] – [1.1.3]

### Added
- Rail fixed at 60px in both states; second column defaults to 280px (340px outer track), restored on each expansion.
- Conversations, Plugins, and Schedules grouped under the DSH entry.
- Expand control moved to the top of the rail; duplicate controls removed.
- Account entry preserved in the collapsed state; session title aligned with view labels.

### Removed
- The built-in notes app.

## [1.0.0]

### Added
- Initial version: application rail plus app-specific second column replacing the stock sidebar.
