---
name: project-finodiv-status
description: FINODIV Web3 learning & hiring ecosystem — project status and what was fixed
metadata:
  type: project
---

React + TypeScript + Vite prototype. LocalStorage-based mock backend (no real server/DB).

**Why:** Making the prototype fully functional as a demo/MVP.

**Fixes applied (all verified in browser):**

1. Created `index.css` (was missing, causing 404 warning)
2. **Session persistence** — login survives page refresh via localStorage keys: `finodiv_session_role`, `finodiv_session_email`, `finodiv_session_userId`, `finodiv_session_wallet`
3. **Email input on login** — Google login now asks for email instead of hardcoding `alex.m@gmail.com`
4. **Admin portal button** — fixed to use `devolufinodiv@gmail.com` (the seeded admin) instead of `admin@finodiv.com`
5. **setLoading(null) bug** in ManageUsers.tsx — changed to `setLoading(false)`
6. **userId threading** — `userId` state added to App.tsx and passed to `Checkout`, `Certificates`, `Settings` instead of hardcoded `'u123'`
7. **Missing routes** — `/jobs` and `/messages` now show ComingSoon stub instead of redirecting to `/`
8. `loginWithGmail` made async to call `api.loginWithGoogle` and get real userId
9. `loginWithWallet` made async + creates a wallet-derived user record

**How to apply:** Run `node node_modules/vite/bin/vite.js` from project root (npm run build/dev breaks due to `&` in folder name).
