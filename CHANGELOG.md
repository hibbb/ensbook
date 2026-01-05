# Changelog

All notable changes to this project will be documented in this file.

## [3.0.0] - 2026-01-05

### ✨ Added
- **Smart View State**: Introduced `isViewStateDirty` and `resetViewState` logic to track and clear table filters/sorting.
- **ViewStateReset UI**: Added a floating "Reset View" button that intelligently avoids overlap with the batch action bar.
- **Metadata Injection**: Project name, version, and author links are now synced directly from `package.json` to the UI and browser title.
- **Dynamic Titles**: Browser tab titles now update dynamically based on the current page or collection name (e.g., "ENSBook - BIP39 Club").

### ⚡ Improved
- **UX Guardrails**: The Home page now automatically resets all filters when the list becomes empty (via manual delete or bulk clear) to prevent "hidden filter" confusion.
- **Data Architecture**: Separated view states between Home and Collection detail pages for better context isolation.

### 🐛 Fixed
- **TypeScript Strictness**: Resolved TS2322 error in `CollectionDetail.tsx` regarding optional data length checks.
- **Wagmi Config**: Centralized `appName` source of truth using the injected `__APP_NAME__` constant.

### 📝 Documentation
- **README Update**: Fully revamped the README with the new "Local-First" positioning and feature highlights.
