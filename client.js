/**
 * Client half of @fenixgo/dsh-three-column-layout.
 *
 * Replaces the shipped sidebar shell (its row is disabled by this bundle's
 * patch) with a two-column column shaped like an app rail:
 *
 *   [rail: DeepSeek mark + one icon per global panel + settings] [session list]
 *
 * Seats are re-declared as children of our `sidebar` registration, so the
 * shipped occupants keep mounting: ui-workspace fills `sidebar.workspaces`,
 * ui-settings fills `sidebar.settings`, and every panel plugin keeps its
 * `sidebar.panellist` icon. The rail enumerates those registrations itself, so
 * a new panel appears as a new primary icon without touching this file.
 *
 * Removing this bundle restores the shipped sidebar.
 */
window.__ModuleLoader__.load({
  id: '@fenixgo/dsh-three-column-layout',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'local-sidebar-rail';

    /** Shared rail state: whether the second column is open. */
    const railBus = (() => {
      let state = { listOpen: true, dockWidth: 60 };
      const listeners = new Set();
      return {
        get: () => state,
        set: (patch) => {
          state = Object.assign({}, state, patch);
          for (const listener of Array.from(listeners)) {
            try {
              listener();
            } catch (error) {
              console.error('[three-column-layout] rail listener failed', error);
            }
          }
        },
        subscribe: (listener) => {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
      };
    })();

    /** Rail geometry while the second column is folded away: flush left, full height. */
    const dockStyle = {
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: 60,
      zIndex: 40,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      padding: '48px 6px 10px',
      boxSizing: 'border-box',
      background: 'var(--dsw-specific-sidebar-fill)',
      boxShadow: 'inset -1px 0 var(--dsw-alias-border-l1)',
      pointerEvents: 'auto',
    };

    function dockButtonStyle(active) {
      return {
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        border: 'none',
        borderRadius: 9,
        background: 'transparent',
        color: active ? ACCENT_COLOR : 'var(--dsw-alias-label-secondary)',
        cursor: 'pointer',
        transition: 'color 120ms ease',
      };
    }

    /** Native tooltips wait before appearing; mirror that. */
    const HINT_DELAY_MS = 500;

    /** Short shared expand/collapse duration in milliseconds. */
    const ANIMATION_MS = 160;

    /** Unified blue hover/selected color; icons inherit via currentColor. */
    const ACCENT_COLOR =
      'var(--dsw-alias-brand-primary-new-colorprimary-new-color, #4176e6)';

    /** Product brand shown in the window's top-left area (DSH 首页默认品牌). */
    const BRAND_NAME = 'DeepSeek Harness';

    /**
     * Shipped panels that belong inside the DeepSeek app's column (rows above
     * New Session). Every other panel becomes its own primary app icon.
     */
    const INSIDE_PANEL_IDS = ['plugins', 'schedules'];

    const DICTS = {
      zh: {
        home: 'DSH',
        rail: '一级导航',
        collapse: '收起侧栏',
        expand: '展开侧栏',
        newSession: '新会话',
        appHint: '这个页面还没有自己的侧栏内容。',
        more: '更多',
      },
      en: {
        home: 'DSH',
        rail: 'Primary navigation',
        collapse: 'Collapse sidebar',
        expand: 'Open sidebar',
        newSession: 'New Session',
        appHint: 'This page has no sidebar content yet.',
        more: 'More',
      },
    };

    function IconGlyph(props) {
      const size = typeof props.size === 'number' ? props.size : 16;
      const svg = {
        width: size,
        height: size,
        viewBox: '0 0 16 16',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.35,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        style: { display: 'block' },
      };
      switch (props.name) {
        case 'brand':
          return h(
            'svg',
            {
              width: size,
              height: size,
              viewBox: '0 0 24 24',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: 1.7,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              'aria-hidden': true,
              style: { display: 'block' },
            },
            h('rect', { x: 2.2, y: 2.2, width: 19.6, height: 19.6, rx: 6.4 }),
            h('path', { d: 'M7 10.2c1.6-1.7 3.2-1.7 4.8 0s3.2 1.7 4.8 0' }),
            h('path', { d: 'M7 14.6c1.6-1.7 3.2-1.7 4.8 0s3.2 1.7 4.8 0' }),
          );
        case 'conversation':
          return h(
            'svg',
            svg,
            h('path', { d: 'M2.8 4.4h10.4v6.2H7.5l-2.9 2.2v-2.2H2.8z' }),
          );
        case 'notes':
          return h(
            'svg',
            svg,
            h('rect', { x: 2.7, y: 2.2, width: 10.6, height: 11.6, rx: 2.2 }),
            h('path', { d: 'M5.5 6.1h5' }),
            h('path', { d: 'M5.5 9.2h5' }),
            h('path', { d: 'M5.5 12.3h3' }),
          );
        case 'panel':
          return h(
            'svg',
            svg,
            h('rect', { x: 2.4, y: 3.2, width: 11.2, height: 9.6, rx: 2 }),
            h('path', { d: 'M6.2 3.4v9.2' }),
          );
        case 'plus':
          return h('svg', svg, h('path', { d: 'M8 3.2v9.6M3.2 8h9.6' }));
        case 'more':
          return h(
            'svg',
            svg,
            h('circle', { cx: 3.2, cy: 8, r: 1.15, fill: 'currentColor', stroke: 'none' }),
            h('circle', { cx: 8, cy: 8, r: 1.15, fill: 'currentColor', stroke: 'none' }),
            h('circle', { cx: 12.8, cy: 8, r: 1.15, fill: 'currentColor', stroke: 'none' }),
          );
        case 'dot':
          return h('svg', svg, h('circle', { cx: 8, cy: 8, r: 3.4 }));
        default:
          return h('svg', svg, h('circle', { cx: 8, cy: 8, r: 4 }));
      }
    }

    /** Cockpit brand: graphite squircle with a white x. */
    function BrandLogo(props) {
      const size = typeof props.size === 'number' ? props.size : 20;
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          'aria-hidden': true,
          style: { display: 'block', flex: '0 0 auto' },
        },
        h('rect', { x: 0, y: 0, width: 24, height: 24, rx: 7, fill: '#1F2430' }),
        h('path', {
          d: 'M8.1 8.1 15.9 15.9M15.9 8.1 8.1 15.9',
          stroke: '#FFFFFF',
          strokeWidth: 2.6,
          strokeLinecap: 'round',
        }),
      );
    }

    /** True when the macOS window chrome (traffic lights) is hidden. */
    function chromeHidden() {
      try {
        if (document.fullscreenElement) return true;
        if (typeof window.screen !== 'undefined') {
          return window.innerHeight >= window.screen.height - 2;
        }
      } catch (error) {
        return false;
      }
      return false;
    }

    function createStyles(collapsed) {
      const darwin = (() => {
        try {
          return document.documentElement.getAttribute('data-platform') === 'darwin';
        } catch (error) {
          return false;
        }
      })();
      // Column 1 keeps the sidebar tint; column 2 gets the base surface, so the
      // two columns read as separate panes (hard stop = a clean seam).
      const railWidth = 60;
      // The macOS traffic lights end a little past the rail; the top strip tints
      // a few extra pixels so they never straddle the seam, while the icon rail
      // underneath stays narrow.
      const lightZone = railWidth;
      const tint = (width) =>
        'linear-gradient(to right, var(--dsw-specific-sidebar-fill) 0px ' +
        width +
        'px, transparent ' +
        width +
        'px 100%)';
      return {
        root: {
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          boxSizing: 'border-box',
          background: 'var(--dsw-alias-bg-base)',
          color: 'var(--dsw-alias-label-primary)',
          fontFamily: 'inherit',
          fontSize: 14,
        },
        strip: {
          flex: '0 0 auto',
          // Match the frame's own window-chrome step (48px on macOS) so the
          // traffic lights, the brand text and the toggle share one mid-line.
          height: 'var(--dsh-frame-top-clearance, 48px)',
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '0 10px 0 ' + (railWidth + 14) + 'px',
          boxSizing: 'border-box',
          background: tint(lightZone),
        },
        hintBubble: {
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 8px',
          borderRadius: 8,
          background: 'rgba(38, 38, 40, 0.96)',
          color: '#FFFFFF',
          fontSize: 12.5,
          lineHeight: 1.25,
          whiteSpace: 'nowrap',
          width: 'max-content',
          boxSizing: 'border-box',
          boxShadow: '0 8px 22px rgba(0, 0, 0, 0.28)',
          pointerEvents: 'none',
        },
        hintBubbleLeft: {
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 8px',
          borderRadius: 8,
          background: 'rgba(38, 38, 40, 0.96)',
          color: '#FFFFFF',
          fontSize: 12.5,
          lineHeight: 1.25,
          whiteSpace: 'nowrap',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
          boxShadow: '0 8px 22px rgba(0, 0, 0, 0.28)',
          pointerEvents: 'none',
        },
        newSessionWorkspace: {
          marginLeft: 'auto',
          flex: '0 1 auto',
          minWidth: 0,
          maxWidth: 88,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 12,
          color: 'var(--dsw-alias-label-secondary)',
        },
        hintWorkspace: {
          flex: '0 1 auto',
          minWidth: 0,
          maxWidth: 110,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: 'rgba(255, 255, 255, 0.68)',
          fontSize: 12,
        },
        keycapInline: {
          flex: '0 0 auto',
          minWidth: 20,
          boxSizing: 'border-box',
          textAlign: 'center',
          fontSize: 12,
          lineHeight: 1.1,
          padding: '4px 6px',
          borderRadius: 6,
          background: 'rgba(255, 255, 255, 0.16)',
          color: '#FFFFFF',
        },
        keycap: {
          marginLeft: 'auto',
          flex: '0 0 auto',
          fontSize: 11,
          lineHeight: 1,
          padding: '4px 6px',
          borderRadius: 5,
          border: '1px solid var(--dsw-alias-border-l1)',
          background: 'var(--dsw-alias-bg-layer-1)',
          color: 'var(--dsw-alias-label-secondary)',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        },
        brandText: {
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: '0.2px',
          lineHeight: '18px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
          color: 'var(--dsw-alias-label-primary)',
        },
        brandRow: {
          flex: '0 0 auto',
          height: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 12px',
          boxSizing: 'border-box',
          minWidth: 0,
        },
        iconButton: {
          width: 28,
          height: 28,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          border: 'none',
          borderRadius: 8,
          background: 'transparent',
          color: 'var(--dsw-alias-label-secondary)',
          cursor: 'pointer',
        },
        body: {
          display: 'flex',
          flex: '1 1 auto',
          minHeight: 0,
          background: tint(railWidth),
        },
        rail: {
          flex: '0 0 ' + railWidth + 'px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          padding: collapsed ? '0 4px 8px' : '0 6px 10px',
          boxSizing: 'border-box',
        },
        divider: {
          width: 28,
          height: 1,
          margin: '6px 0',
          background: 'var(--dsw-alias-border-l1)',
        },
        railFoot: {
          flex: '0 0 auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          paddingTop: 6,
        },
        spacer: { flex: '1 1 auto', minHeight: 8 },
        content: {
          flex: '1 1 auto',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: '0 16px 12px 16px',
          boxSizing: 'border-box',
        },
        newSession: {
          flex: '0 0 auto',
          width: '100%',
          boxSizing: 'border-box',
          height: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '0 10px',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          border: '1px solid var(--dsw-alias-border-l1)',
          borderRadius: 8,
          background: 'transparent',
          color: 'var(--dsw-alias-label-primary)',
          fontFamily: 'inherit',
          fontSize: 13,
          cursor: 'pointer',
        },
        region: { flex: '1 1 auto', minHeight: 0, overflow: 'hidden' },
        appCard: {
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '12px 10px',
          marginTop: 2,
          border: '1px solid var(--dsw-alias-border-l1)',
          borderRadius: 10,
          background: 'var(--dsw-alias-bg-layer-1)',
        },
        appHint: {
          fontSize: 12,
          lineHeight: 1.5,
          color: 'var(--dsw-alias-label-secondary)',
        },
        menu: {
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 40,
          minWidth: 180,
          marginTop: 4,
          padding: 4,
          boxSizing: 'border-box',
          border: '1px solid var(--dsw-alias-border-l1)',
          borderRadius: 10,
          background: 'var(--dsw-alias-bg-overlay)',
          boxShadow: '0 10px 26px rgba(0, 0, 0, 0.18)',
        },
      };
    }

    function railButtonStyle(active, hovered) {
      return {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        padding: '8px 2px 7px',
        border: 'none',
        borderRadius: 10,
        background: 'transparent',
        color: active || hovered
          ? ACCENT_COLOR
          : 'var(--dsw-alias-label-secondary)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'color 120ms ease',
      };
    }

    function railLabelStyle(active) {
      return {
        fontSize: 11,
        lineHeight: 1.25,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%',
        color: 'inherit',
      };
    }

    function panelRowStyle(active, hovered) {
      return {
        height: 30,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '0 10px',
        boxSizing: 'border-box',
        border: 'none',
        borderRadius: 8,
        background: 'transparent',
        color: active || hovered
          ? ACCENT_COLOR
          : 'var(--dsw-alias-label-primary)',
        fontFamily: 'inherit',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'color 120ms ease',
      };
    }

    /** Snapshot store over the live `sidebar.panellist` registrations. */
    function createPanelStore(ctx) {
      let snapshot = [];
      const listeners = new Set();

      const read = () => {
        let entries = [];
        try {
          if (typeof ctx.slots.entriesOfSlot === 'function') {
            entries = ctx.slots.entriesOfSlot('sidebar.panellist') || [];
          }
        } catch (error) {
          entries = [];
        }
        const next = [];
        for (const entry of entries) {
          const options = (entry && entry.options) || {};
          if (typeof options.id !== 'string' || options.id.length === 0) continue;
          const raw = options.label;
          let label = options.id;
          try {
            label = typeof raw === 'function' ? raw() : raw || options.id;
          } catch (error) {
            label = options.id;
          }
          next.push({
            id: options.id,
            order: typeof options.order === 'number' ? options.order : 0,
            label: String(label),
            component: entry.component,
          });
        }
        next.sort((a, b) => a.order - b.order);
        return next;
      };

      const same = (a, b) =>
        a.length === b.length &&
        a.every(
          (entry, index) =>
            entry.id === b[index].id &&
            entry.order === b[index].order &&
            entry.label === b[index].label,
        );

      const emit = () => {
        const next = read();
        if (same(next, snapshot)) return;
        snapshot = next;
        for (const listener of Array.from(listeners)) {
          try {
            listener();
          } catch (error) {
            console.error('[three-column-layout] panel listener failed', error);
          }
        }
      };

      const store = {
        getSnapshot: () => snapshot,
        subscribe: (listener) => {
          listeners.add(listener);
          return () => {
            listeners.delete(listener);
          };
        },
      };

      return { store, emit };
    }

    /** Boolean store over one slot: does it have any registration right now. */
    function createFlagStore(ctx, slotKey) {
      let value = false;
      const listeners = new Set();
      const read = () => {
        try {
          if (typeof ctx.slots.entriesOfSlot !== 'function') return false;
          return (ctx.slots.entriesOfSlot(slotKey) || []).length > 0;
        } catch (error) {
          return false;
        }
      };
      const emit = () => {
        const next = read();
        if (next === value) return;
        value = next;
        for (const listener of Array.from(listeners)) {
          try {
            listener();
          } catch (error) {
            console.error('[three-column-layout] flag listener failed', error);
          }
        }
      };
      return {
        store: {
          getSnapshot: () => value,
          subscribe: (listener) => {
            listeners.add(listener);
            return () => {
              listeners.delete(listener);
            };
          },
        },
        emit,
      };
    }

    function createComponents(t, ctx, panelStore, actionsStore) {
      /** Contains a broken third-party icon so the rail keeps rendering. */
      class IconBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { failed: false };
        }
        static getDerivedStateFromError() {
          return { failed: true };
        }
        render() {
          return this.state.failed ? this.props.fallback : this.props.children;
        }
      }

      const tr = t;
      const useSyncExternalStore =
        typeof React.useSyncExternalStore === 'function'
          ? React.useSyncExternalStore
          : (subscribe, getSnapshot) => {
              const [value, setValue] = React.useState(getSnapshot);
              React.useEffect(() => subscribe(() => setValue(getSnapshot())), []);
              return value;
            };

      const usePanels = () =>
        useSyncExternalStore(
          panelStore.store.subscribe,
          panelStore.store.getSnapshot,
          panelStore.store.getSnapshot,
        );

      const useHasActions = () =>
        useSyncExternalStore(
          actionsStore.store.subscribe,
          actionsStore.store.getSnapshot,
          actionsStore.store.getSnapshot,
        );

      // Shortcut hints (keycaps): read the command catalog, never hard-code keys.
      const shortcutsService = ctx.get('shortcuts');
      const catalog =
        shortcutsService &&
        shortcutsService.catalog &&
        typeof shortcutsService.catalog.getSnapshot === 'function'
          ? shortcutsService.catalog
          : null;

      const readShortcut = (id) => {
        if (catalog === null) return null;
        try {
          const rows = catalog.getSnapshot();
          if (!Array.isArray(rows)) return null;
          const row = rows.filter((entry) => entry && entry.id === id)[0];
          if (row === undefined) return null;
          const aria = typeof row.aria === 'string' && row.aria.length > 0 ? row.aria : null;
          const keys = Array.isArray(row.keys)
            ? row.keys.filter((key) => typeof key === 'string')
            : [];
          // `keys` are display keycaps (rendered one chip each); `aria` is the
          // ARIA form (Meta+B).
          const text = keys.length > 0 ? keys.join('') : aria;
          if (text === null || text === '') return null;
          return { keys, text, aria: aria !== null ? aria : text };
        } catch (error) {
          return null;
        }
      };

      let shortcutCache = '';
      let shortcutValue = { toggle: null, newSession: null };

      const shortcutSource = {
        getSnapshot: () => {
          const toggle = readShortcut('sidebar.left.toggle');
          const newSession = readShortcut('session.new');
          const key = JSON.stringify([
            toggle && toggle.text,
            toggle && toggle.aria,
            newSession && newSession.text,
            newSession && newSession.aria,
          ]);
          if (key !== shortcutCache) {
            shortcutCache = key;
            shortcutValue = { toggle, newSession };
          }
          return shortcutValue;
        },
        subscribe: (listener) => {
          if (catalog && typeof catalog.subscribe === 'function') {
            return catalog.subscribe(listener);
          }
          return () => {};
        },
      };

      const useShortcuts = () =>
        useSyncExternalStore(
          shortcutSource.subscribe,
          shortcutSource.getSnapshot,
          shortcutSource.getSnapshot,
        );

      function SidebarShell(props) {
        const panels = usePanels();
        const collapsed = props.collapsed === true;
        const s = createStyles(collapsed);
        const dockRef = React.useRef(null);
        const railState = useSyncExternalStore(railBus.subscribe, railBus.get, railBus.get);
        const listOpen = railState.listOpen;
        const wide = !collapsed && listOpen;
        const reducedMotion =
          typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Use one short, explicit animation window. DSH may keep its own
        // data-animating marker for up to 600ms; waiting for it makes the UI
        // feel sluggish after our 160ms transition has already finished.
        const [pendingAnimation, setPendingAnimation] = React.useState(false);
        const previousListOpen = React.useRef(listOpen);
        React.useLayoutEffect(() => {
          if (previousListOpen.current === listOpen) return undefined;
          previousListOpen.current = listOpen;
          setPendingAnimation(true);
          const timer = window.setTimeout(
            () => setPendingAnimation(false),
            reducedMotion ? 0 : ANIMATION_MS + 60,
          );
          return () => window.clearTimeout(timer);
        }, [listOpen, reducedMotion]);
        const showDock = !listOpen || pendingAnimation;
        const showExpandedChrome = listOpen && !pendingAnimation;
        // Native collapse forgets the expanded width and restores 280px.
        // Restore the shell's 60px rail + 280px application column on each expansion.
        React.useLayoutEffect(() => {
          if (collapsed) return;
          const layout = ctx.get('layout');
          if (typeof layout?.panels?.setSidebar === 'function') {
            layout.panels.setSidebar(340);
          }
        }, [collapsed]);
        // Measure the fixed rail while it is visible (including both animations).
        React.useLayoutEffect(() => {
          const node = dockRef.current;
          if (!showDock || !node) return undefined;
          const measure = () => {
            const width = node.getBoundingClientRect().width;
            if (width > 0 && width !== railBus.get().dockWidth) {
              railBus.set({ dockWidth: width });
            }
          };
          measure();
          const observer = new ResizeObserver(measure);
          observer.observe(node);
          return () => observer.disconnect();
        }, [showDock]);
        const [hovered, setHovered] = React.useState(null);
        const hasActions = useHasActions();
        const shortcutHints = useShortcuts();
        const dockInset = !listOpen
          ? Math.max(0, railState.dockWidth - (props.drawer ? 0 : Number(props.width) || 0))
          : 0;
        const setListOpen = (next) => {
          railBus.set({ listOpen: typeof next === 'function' ? next(listOpen) : next });
        };
        // Folding the second column closes the frame's whole column (macOS: width 0),
        // so the main panel takes the freed space; the floating dock keeps the rail.
        React.useEffect(() => {
          if (!listOpen && !collapsed) {
            try {
              props.toggleSidebar();
            } catch (error) {
              console.error('[three-column-layout] collapse failed', error);
            }
          } else if (listOpen && collapsed) {
            try {
              props.toggleSidebar();
            } catch (error) {
              console.error('[three-column-layout] expand failed', error);
            }
          }
        }, [listOpen, collapsed]);
        const [hoverKey, setHoverKey] = React.useState(null);
        const [hintKey, setHintKey] = React.useState(null);
        const [menuOpen, setMenuOpen] = React.useState(false);
        const menuRef = React.useRef(null);

        React.useEffect(() => {
          if (!menuOpen) return undefined;
          const onPointerDown = (event) => {
            const node = menuRef.current;
            if (node && typeof node.contains === 'function' && node.contains(event.target)) {
              return;
            }
            setMenuOpen(false);
          };
          const onKeyDown = (event) => {
            if (event.key === 'Escape') setMenuOpen(false);
          };
          document.addEventListener('mousedown', onPointerDown);
          document.addEventListener('keydown', onKeyDown);
          return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
          };
        }, [menuOpen]);

        const usePanelInfo =
          typeof props.usePanelInfo === 'function'
            ? props.usePanelInfo
            : (selector) => selector({ activePanelId: null });
        const activePanelId = usePanelInfo((info) => (info ? info.activePanelId : null));

        const render = (key, ownerProps, options) => {
          try {
            if (typeof props.renderSlot !== 'function') return null;
            return props.renderSlot(key, ownerProps, options);
          } catch (error) {
            return null;
          }
        };

        const select = (panelId) => {
          try {
            props.selectPanel(panelId);
          } catch (error) {
            console.error('[three-column-layout] selectPanel failed', error);
          }
        };

        const insidePanels = panels.filter(
          (panel) => INSIDE_PANEL_IDS.indexOf(panel.id) >= 0,
        );
        const appPanels = panels.filter(
          (panel) => INSIDE_PANEL_IDS.indexOf(panel.id) < 0,
        );
        const isHome =
          activePanelId == null || INSIDE_PANEL_IDS.indexOf(activePanelId) >= 0;

        const entries = [
          {
            key: 'home',
            panelId: null,
            label: tr('home'),
            icon: null,
          },
          ...appPanels.map((panel) => ({
            key: 'panel:' + panel.id,
            panelId: panel.id,
            label: panel.label,
            icon: render('sidebar.panellist', { size: 18, active: activePanelId === panel.id }, {
              only: panel.id,
            }),
          })),
        ];

        const railItems = entries.flatMap((entry, index) => {
          const active =
            entry.panelId === null ? isHome : activePanelId === entry.panelId;
          const icon =
            entry.icon == null
              ? h(IconGlyph, { name: entry.panelId === null ? 'brand' : 'dot', size: 18 })
              : entry.icon;
          const button = h(
            'button',
            {
              key: entry.key,
              type: 'button',
              'aria-label': entry.label,
              'aria-current': active ? 'page' : undefined,
              title: entry.label,
              onClick: () => select(entry.panelId),
              onMouseEnter: () => setHovered(entry.key),
              onMouseLeave: () => setHovered(null),
              style: railButtonStyle(active, hovered === entry.key),
            },
            h('span', { 'aria-hidden': true, style: { display: 'block' } }, icon),
            h(
              'span',
              { style: railLabelStyle(active) },
              entry.labelNode == null ? entry.label : entry.labelNode,
            ),
          );
          return [button];
        });

        const footerActions = render('sidebar.footer.action', { wide: false });
        const settings = render('sidebar.settings', { wide: false });

        const railStyle = Object.assign(
          {},
          s.rail,
          !showExpandedChrome ? { visibility: 'hidden' } : null,
        );
        const rail = h(
          'nav',
          { className: 'layout-shell-expanded-chrome', style: railStyle, 'aria-label': tr('rail') },
          !showExpandedChrome ? null : railItems,
          !showExpandedChrome ? null : h('div', { style: s.spacer }),
          !showExpandedChrome || footerActions == null ? null : h('div', { style: s.railFoot }, footerActions),
          !showExpandedChrome || settings == null ? null : h('div', { style: s.railFoot }, settings),
        );

        const hintTimer = React.useRef(undefined);
        React.useEffect(
          () => () => {
            window.clearTimeout(hintTimer.current);
          },
          [],
        );
        const scheduleHint = (key) => {
          window.clearTimeout(hintTimer.current);
          hintTimer.current = window.setTimeout(() => setHintKey(key), HINT_DELAY_MS);
        };
        const cancelHint = () => {
          window.clearTimeout(hintTimer.current);
          hintTimer.current = undefined;
          setHintKey(null);
        };

        const workspacesHook =
          typeof props.useWorkspaces === 'function' ? props.useWorkspaces : null;
        const workspaceSnapshot = workspacesHook ? workspacesHook((value) => value) : null;

        const readWorkspaceName = (snapshot) => {
          try {
            if (snapshot === null || typeof snapshot !== 'object') return null;
            const id =
              snapshot.activeWorkspaceId ||
              snapshot.currentWorkspaceId ||
              snapshot.selectedWorkspaceId ||
              null;
            const collections = [
              snapshot.workspaces,
              snapshot.items,
              snapshot.list,
              snapshot.byId,
            ];
            for (const collection of collections) {
              if (collection === null || collection === undefined) continue;
              const items = Array.isArray(collection)
                ? collection
                : Object.keys(collection).map((key) => collection[key]);
              if (!Array.isArray(items)) continue;
              const item =
                id !== null
                  ? items.filter(
                      (entry) =>
                        entry && (entry.workspaceId === id || entry.id === id),
                    )[0]
                  : items[0];
              if (item === undefined) continue;
              const name = item.title || item.name || item.path;
              if (typeof name === 'string' && name.length > 0) return name;
            }
            return null;
          } catch (error) {
            return null;
          }
        };

        const boundWorkspace = readWorkspaceName(workspaceSnapshot);

        const keycapNodes = (hint) => {
          if (hint === null) return null;
          const keys = Array.isArray(hint.keys) ? hint.keys : [];
          if (keys.length === 0) {
            return h('span', { style: s.keycapInline }, hint.text);
          }
          return keys.map((key, index) =>
            h('span', { key: 'keycap-' + index, style: s.keycapInline }, key),
          );
        };

        const listVisible = wide && listOpen;
        const toggleLabel = tr(listVisible ? 'collapse' : 'expand');
        const toggleHint = shortcutHints.toggle;
        const toggle = h(
          'div',
          { style: { position: 'relative', display: 'flex', alignItems: 'center' } },
          h(
            'button',
            {
              className: 'layout-shell-hover-accent',
              type: 'button',
              'aria-label': toggleLabel,
              'aria-keyshortcuts': toggleHint === null ? undefined : toggleHint.aria,
              onClick: () => {
                // Never flash the shortcut hint as a side effect of clicking.
                cancelHint();
                // Column 1 (the app rail) stays; only the second column folds.
                setListOpen((open) => !open);
              },
              style: Object.assign({ WebkitAppRegion: 'no-drag' }, s.iconButton),
            },
            h(IconGlyph, { name: 'panel', size: 16 }),
            wide ? null : render('sidebar.toggle.badge', {}),
          ),
        );

        const panelRows = insidePanels.map((panel) => {
          const rowKey = 'row:' + panel.id;
          const active = activePanelId === panel.id;
          const icon = render('sidebar.panellist', { size: 16, active }, { only: panel.id });
          return h(
            'button',
            {
              key: rowKey,
              type: 'button',
              title: panel.label,
              'aria-current': active ? 'page' : undefined,
              onClick: () => select(panel.id),
              onMouseEnter: () => setHovered(rowKey),
              onMouseLeave: () => setHovered(null),
              style: panelRowStyle(active, hovered === rowKey),
            },
            h(
              'span',
              {
                'aria-hidden': true,
                style: {
                  display: 'inline-flex',
                  width: 16,
                  height: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '0 0 auto',
                },
              },
              icon == null ? h(IconGlyph, { name: 'dot', size: 16 }) : icon,
            ),
            h(
              'span',
              {
                style: {
                  fontSize: 13,
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              },
              panel.label,
            ),
          );
        });

        const menuEntries = panels
          .filter((panel) => panel.id !== 'plugins')
          .map((panel) => ({
            id: panel.id,
            label: panel.label,
            pinned: true,
            active: activePanelId === panel.id,
          }));

        const moreRow = hasActions
          ? h(
              'div',
              {
                key: 'more',
                ref: menuRef,
                style: { position: 'relative', flex: '0 0 auto', width: '100%' },
              },
              h(
                'button',
                {
                  type: 'button',
                  title: tr('more'),
                  'aria-haspopup': 'menu',
                  'aria-expanded': menuOpen,
                  onClick: () => setMenuOpen((open) => !open),
                  onMouseEnter: () => setHovered('more'),
                  onMouseLeave: () => setHovered(null),
                  style: panelRowStyle(false, hovered === 'more'),
                },
                h(
                  'span',
                  {
                    'aria-hidden': true,
                    style: {
                      display: 'inline-flex',
                      width: 16,
                      height: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: '0 0 auto',
                    },
                  },
                  h(IconGlyph, { name: 'more', size: 16 }),
                ),
                h('span', { style: { fontSize: 13, lineHeight: 1.3 } }, tr('more')),
              ),
              menuOpen
                ? h(
                    'div',
                    { style: s.menu },
                    render('sidebar.panellist.actions', {
                      entries: menuEntries,
                      onOpen: (id) => {
                        select(id);
                        setMenuOpen(false);
                      },
                      onPinnedChange: () => {},
                      onDismiss: () => setMenuOpen(false),
                    }),
                  )
                : null,
            )
          : null;

        const newSessionHint = shortcutHints.newSession;
        const newSessionButton = h(
          'div',
          {
            style: { position: 'relative', flex: '0 0 auto', width: '100%' },
            onMouseEnter: () => {
              setHoverKey('newSession');
              scheduleHint('newSession');
            },
            onMouseLeave: () => {
              setHoverKey(null);
              cancelHint();
            },
          },
          h(
            'button',
            {
              className: 'layout-shell-hover-accent',
              type: 'button',
              style: s.newSession,
              'aria-keyshortcuts': newSessionHint === null ? undefined : newSessionHint.aria,
              onClick: () => {
                try {
                  props.startSession();
                } catch (error) {
                  console.error('[three-column-layout] startSession failed', error);
                }
              },
            },
            h(IconGlyph, { name: 'plus', size: 14 }),
            h(
              'span',
              { style: { flex: '0 0 auto', whiteSpace: 'nowrap' } },
              tr('newSession'),
            ),
            hoverKey === 'newSession' && boundWorkspace !== null
              ? h('span', { style: s.newSessionWorkspace }, boundWorkspace)
              : null,
          ),
          hintKey === 'newSession'
            ? h(
                'div',
                { style: s.hintBubbleLeft },
                keycapNodes(newSessionHint),
              )
            : null,
        );

        let appColumn = null;
        if (!isHome) {
          appColumn = render(
            'sidebar.app.column',
            { panelId: activePanelId },
            { only: activePanelId },
          );
          if (appColumn == null) {
            const current = panels.filter((panel) => panel.id === activePanelId)[0] || null;
            const icon = render(
              'sidebar.panellist',
              { size: 22, active: true },
              { only: activePanelId },
            );
            appColumn = h(
              'div',
              { style: s.appCard },
              h(
                'div',
                { style: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 } },
                h(
                  'span',
                  { 'aria-hidden': true, style: { display: 'inline-flex', flex: '0 0 auto' } },
                  icon == null ? h(IconGlyph, { name: 'dot', size: 22 }) : icon,
                ),
                h(
                  'span',
                  {
                    style: {
                      fontSize: 14,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  },
                  current == null ? String(activePanelId) : current.label,
                ),
              ),
              h('div', { style: s.appHint }, tr('appHint')),
            );
          }
        }

        // Like the reference app: the second column is a fixed-width panel that
        // slides as a whole. Native width animation only moves the main column;
        // this panel is never squeezed/clipped into text fragments at the seam.
        const secondColumnWidth = 340 - railState.dockWidth;
        const contentStyle = Object.assign({}, s.content, {
          position: 'fixed',
          left: railState.dockWidth,
          top: 48,
          bottom: 0,
          width: secondColumnWidth,
          minWidth: secondColumnWidth,
          maxWidth: secondColumnWidth,
          flex: 'none',
          zIndex: 30,
          boxSizing: 'border-box',
          overflow: 'hidden',
          background: 'var(--dsw-alias-bg-base)',
          boxShadow: 'inset -1px 0 var(--dsw-alias-border-l1)',
          transform: listOpen
            ? 'translateX(0)'
            : 'translateX(-' + secondColumnWidth + 'px)',
          transition: reducedMotion
            ? 'none'
            : 'transform ' + ANIMATION_MS + 'ms var(--ds-ease-in-out)',
          willChange: 'transform',
          pointerEvents: listOpen ? 'auto' : 'none',
          visibility: 'visible',
          opacity: 1,
        });
        const content = h(
          'div',
          {
            className: 'layout-shell-content',
            style: contentStyle,
            'aria-hidden': showExpandedChrome ? undefined : true,
          },
          h(
            React.Fragment,
            null,
            h(
              'div',
              {
                style: {
                  display: isHome ? 'flex' : 'none',
                  flexDirection: 'column',
                  gap: 8,
                  flex: '1 1 auto',
                  minHeight: 0,
                },
              },
              panelRows.length === 0
                ? null
                : h(
                    'div',
                    {
                      style: {
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        flex: '0 0 auto',
                      },
                    },
                    panelRows,
                  ),
              moreRow,
              newSessionButton,
              h(
                'div',
                { style: s.region },
                render('sidebar.workspaces', { wide: true, expandSidebar: () => {} }),
              ),
            ),
            isHome
              ? null
              : h(
                  'div',
                  { style: { flex: '1 1 auto', minHeight: 0, overflowY: 'auto' } },
                  appColumn,
                ),
          ),
        );

        const activePanelEntry =
          isHome ? null : panels.filter((panel) => panel.id === activePanelId)[0] || null;
        const stripTitle = activePanelEntry ? activePanelEntry.label : BRAND_NAME;

        const collapsedExpand = h(
          'button',
          {
            className: 'layout-shell-hover-accent',
            type: 'button',
            'aria-label': tr('expand'),
            onClick: () => setListOpen(true),
            style: Object.assign({}, dockButtonStyle(false), {
              position: 'absolute',
              top: 8,
              left: '50%',
              transform: 'translateX(-50%)',
            }),
          },
          h(IconGlyph, { name: 'panel', size: 18 }),
        );
        const collapsedRail = showDock
          ? h(
              'div',
              { ref: dockRef, className: 'layout-shell-dock', style: dockStyle, 'aria-label': tr('rail') },
              collapsedExpand,
              railItems,
              h('div', { style: s.spacer }),
              footerActions == null ? null : h('div', { style: s.railFoot }, footerActions),
              settings == null ? null : h('div', { style: s.railFoot }, settings),
            )
          : null;

        const stripStyle = Object.assign(
          {},
          s.strip,
          !showExpandedChrome ? { visibility: 'hidden' } : null,
        );
        const strip = h(
          'div',
          { className: 'layout-shell-expanded-chrome', style: stripStyle, 'data-window-drag': true },
          !showExpandedChrome ? null : wide ? h('span', { style: s.brandText }, stripTitle) : null,
          !showExpandedChrome ? null : toggle,
        );

        const shellStyle = s.root;
        const centerTransition =
          '[data-animating] { transition-duration: ' + ANIMATION_MS + 'ms !important; } ' +
          '[data-animating] .PIRFFq_centerCol, ' +
          '[data-animating] [data-shell-bottom] { ' +
          'transition: padding-left ' + ANIMATION_MS + 'ms var(--ds-ease-in-out) !important; }';
        const centerPadding = showDock && dockInset > 0
          ? ' [data-sidebar-collapsed] .PIRFFq_centerCol { padding-left: ' +
            dockInset + 'px !important; }' +
            ' [data-sidebar-collapsed] [data-shell-bottom] { padding-left: ' +
            railState.dockWidth + 'px !important; }'
          : '';

        return h(
          'div',
          { style: shellStyle },
          h(
            'style',
            null,
            '[data-sidebar-collapsed] { --dsh-frame-leading-clearance: 0px !important; } ' +
              '.kiGsTW_header { --dsh-frame-leading-clearance: 0px !important; padding-left: 20px !important; } ' +
              '.kiGsTW_titleRow { padding-inline-start: 0 !important; } ' +
              '.kiGsTW_titleCluster { margin-left: -4px !important; padding-left: 4px !important; } ' +
              '.kiGsTW_crumb { padding-left: 8px !important; } ' +
              '.kiGsTW_tabs { padding-left: 8px !important; } ' +
              '[data-sidebar-collapsed] .layout-shell-expanded-chrome { visibility: hidden !important; } ' +
              '.layout-shell-hover-accent:hover, ' +
              '.layout-shell-hover-accent:focus-visible { color: ' + ACCENT_COLOR + ' !important; } ' +
              centerTransition +
              centerPadding,
          ),
          strip,
          h('div', { style: s.body }, rail, content),
          collapsedRail,
        );
      }

      /** Keep the leading seat owned but empty: collapsed controls live in the rail. */
      function HeaderLeadingControls() {
        return null;
      }

      return { SidebarShell, HeaderLeadingControls };
    }



    return {
      inject: ['slots', 'layout'],
      apply(ctx) {
        const locale = ctx.get('locale');
        const uiWorkspace = ctx.get('uiWorkspace');

        // Default outer sidebar track = 60px rail + 280px app column.
        try {
          const layoutService = ctx.get('layout');
          if (layoutService && layoutService.panels && typeof layoutService.panels.setSidebar === 'function') {
            layoutService.panels.setSidebar(340);
          }
        } catch (error) {
          console.error('[layout-shell] setSidebar failed', error);
        }

        if (locale && typeof locale.register === 'function') {
          ctx.effect(() => {
            const disposers = [];
            for (const id of Object.keys(DICTS)) {
              try {
                disposers.push(locale.register(NS, id, DICTS[id]));
              } catch (error) {
                console.error('[three-column-layout] locale registration failed for ' + id, error);
              }
            }
            return () => {
              for (const dispose of disposers) {
                if (typeof dispose === 'function') dispose();
              }
            };
          }, 'sidebar-rail/locale');
        }

        let translate = null;
        if (locale && typeof locale.bind === 'function') {
          try {
            translate = locale.bind(NS);
          } catch (error) {
            translate = null;
          }
        }

        const fallbackDict =
          DICTS[
            String(
              typeof navigator === 'undefined' ? '' : navigator.language || '',
            ).toLowerCase().indexOf('zh') === 0
              ? 'zh'
              : 'en'
          ] || DICTS.en;

        const t = (key) => {
          const localized = translate ? translate(key) : undefined;
          if (typeof localized === 'string' && localized !== key) return localized;
          return fallbackDict[key] || DICTS.en[key] || key;
        };

        const panelStore = createPanelStore(ctx);
        const actionsStore = createFlagStore(ctx, 'sidebar.panellist.actions');
        ctx.effect(() => {
          const disposers = [];
          for (const [key, emitter] of [
            ['sidebar.panellist', panelStore.emit],
            ['sidebar.panellist.actions', actionsStore.emit],
          ]) {
            if (typeof ctx.slots.subscribe !== 'function') continue;
            try {
              disposers.push(ctx.slots.subscribe(key, emitter));
            } catch (error) {
              /* ignore */
            }
          }
          if (locale && typeof locale.subscribe === 'function') {
            try {
              disposers.push(locale.subscribe(panelStore.emit));
            } catch (error) {
              /* ignore */
            }
          }
          panelStore.emit();
          actionsStore.emit();
          return () => {
            for (const dispose of disposers) {
              if (typeof dispose === 'function') dispose();
            }
          };
        }, 'sidebar-rail/panels');

        const { SidebarShell, HeaderLeadingControls } = createComponents(
          t,
          ctx,
          panelStore,
          actionsStore,
        );

        const injectProps = () => ({
          selectPanel: (panelId) => {
            ctx.layout.selectPanel(panelId);
          },
          toggleSidebar: () => {
            ctx.layout.toggleSidebar();
          },
          startSession: (workspaceId) => {
            if (uiWorkspace && typeof uiWorkspace.startSession === 'function') {
              uiWorkspace.startSession(workspaceId);
            }
          },
        });

        ctx.slots.inject('sidebar', () =>
          ctx.slots.register(
            {
              name: 'sidebar',
              locale: NS,
              children: {
                'sidebar.brand.mark': { kind: 'single', scope: 'root' },
                'sidebar.brand.name': { kind: 'single', scope: 'root' },
                'sidebar.toggle.badge': { kind: 'single', scope: 'root' },
                'sidebar.panellist': { kind: 'list', scope: 'root' },
                'sidebar.panellist.actions': { kind: 'list', scope: 'root' },
                'sidebar.workspaces': { kind: 'single', scope: 'root' },
                'sidebar.settings': { kind: 'single', scope: 'root' },
                'sidebar.footer.action': { kind: 'list', scope: 'root' },
                'sidebar.app.column': { kind: 'list', scope: 'root' },
              },
              inject: injectProps,
            },
            SidebarShell,
          ),
        );

        ctx.slots.inject('shell.leading', () =>
          ctx.slots.register(
            {
              name: 'shell.leading',
              locale: NS,
              inject: injectProps,
            },
            HeaderLeadingControls,
          ),
        );

      },
    };
  },
});
