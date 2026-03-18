# Agent Guidelines

## Path Aliases

- **Use** the `@/` alias for all imports from `src/`.
- **Do not use** relative paths like `../../context/AppContext` when importing from `src/`.
- Example: `import { useApp } from '@/context/AppContext'`, `import { Icon } from '@/components/ui/Icon'`
- Files at project root (e.g. `App.tsx`) are imported with `./` (e.g. `import App from './App'`).

---

## Timer Logic

- **Use** `react-timer-hook` for countdown and stopwatch logic. Do not implement custom `setInterval`/`setTimeout` timers.
- Prefer `useTimer` for countdowns and `useStopwatch` for elapsed-time displays.
- Use `interval: 100` (or similar) for accurate second-by-second updates.

---

## Screen Folder Structure

- **Screens** must be folders, not single files.
- Each screen folder contains:
  - `index.tsx` – the screen component (default export)
  - `styles.ts` – `StyleSheet.create(...)` styles
- Example: `src/screens/TimerScreen/index.tsx` and `src/screens/TimerScreen/styles.ts`
- Import screens as: `import TimerScreen from '@/screens/TimerScreen'` (folder resolves to index.tsx)

---

## Component Folder Structure

- **Components** follow the same folder pattern as screens.
- Each component folder contains:
  - `index.tsx` – the component (default export)
  - `styles.ts` – `StyleSheet.create(...)` styles
  - `_consts.ts` – (optional) constants used by the component
- Example: `src/components/Alert/index.tsx`, `Alert/styles.ts`, `Alert/_consts.ts`
- Import as: `import { AlertProvider, useAlert } from '@/components/Alert'`

---

## Alerts

- **Do not use** the native `Alert` from React Native.
- **Use** the custom `Alert` component from `src/components/Alert`.
- Use the `useAlert` hook: `const { alert } = useAlert(); alert({ title, message, buttons });`
- Ensure `AlertProvider` wraps the app (in `App.tsx`).

---

## Time and Duration

- **Always handle seconds**, not only minutes. Store and display durations in seconds everywhere except the time settings screen.
- **Settings screen**: Use full minutes only (focus, short break, long break).
- **Everywhere else**: Work with seconds — history, timer display, cycle logic, persistence. Format for display as "X min Y sec" when seconds are non-zero.

---

## Icons

- **Do not use** `expo-vector-icons` or similar icon libraries.
- **Use** custom SVG files from `src/assets/icons/`.
- **Use** the universal `Icon` component from `src/components/ui/Icon.tsx` for all icons.

### Icon Component

- **Location**: `src/components/ui/Icon.tsx`
- **Props**:
  - `name` – Icon name with TypeScript autocomplete (from `IconName` type)
  - `style` – Passed to the SVG for layout/styling
  - `width`, `height` – Size (default 24)
  - `color`, `stroke`, `fill` – SVG styling
  - Any other `SvgProps` from `react-native-svg`

### Adding New Icons

1. Add the `.svg` file to `src/assets/icons/`.
2. Update `src/assets/icons/index.ts`:
   - Import the new SVG
   - Add it to the `icons` object with a key (e.g. `'my-icon'`)
   - `IconName` will update automatically for autocomplete

### Example

```tsx
import { Icon } from '@/components/ui/Icon';

<Icon name="clock" width={24} height={24} color="#e94560" />
<Icon name="settings" style={{ marginRight: 8 }} stroke="#fff" />
```
