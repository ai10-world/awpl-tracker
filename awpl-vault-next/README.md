# AWPL Vault v3 — Next.js + LocalStorage

A **100% offline** distributor ID manager built with Next.js 14, Tailwind CSS, and browser localStorage. No Firebase, no backend, no account needed.

---

## ✨ Features

- 🔐 **PIN Lock** — 4-digit keypad vault lock
- 👤 **Profile Setup** — your name, dist. ID, rank stored locally
- 📋 **Distributor Cards** — name, ID, rank, icon, color label
- 📸 **ID Photos** — drag & drop, auto-compressed before storing
- 🗂️ **Team Vaults** — group distributors into separate vaults
- 🔍 **Search & Filter** — instant search by name or distributor ID
- 📅 **Hidden Date** — creation date secretly recorded per entry
- 💾 **Backup/Restore** — export/import JSON backup anytime
- 📱 **Mobile Friendly** — responsive for phone/tablet use

---

## 🚀 Option 1 — Deploy as Standalone Vercel Site

```bash
# 1. Install dependencies
npm install

# 2. Run locally
npm run dev        # → http://localhost:3000

# 3. Deploy to Vercel
npx vercel         # or push to GitHub + connect in Vercel dashboard
```

---

## 🔗 Option 2 — Add to Your Existing Next.js Site

If you already have a Vercel site, you can drop this in as a `/vault` route:

1. Copy these folders into your main project:
   - `components/` → your project's `components/awpl-vault/`
   - `lib/` → your project's `lib/` (merge constants.js, storage.js)
   - `app/page.js` → your project's `app/vault/page.js`
   - `app/layout.js` → merge fonts into your existing layout
   - `app/globals.css` → copy CSS variables into your globals.css

2. Add Tailwind content path if not already included:
   ```js
   // tailwind.config.js
   content: ['./components/awpl-vault/**/*.{js,jsx}', ...]
   ```

3. Install dependencies if not already present:
   ```bash
   npm install lucide-react
   ```

4. Link from your main site:
   ```jsx
   <a href="/vault">Open AWPL Vault</a>
   ```

---

## 📁 Project Structure

```
awpl-vault/
├── app/
│   ├── layout.js       ← Root layout + Google Fonts
│   ├── page.js         ← Screen router (lock / setup / app)
│   └── globals.css     ← CSS variables + Tailwind base
├── components/
│   ├── LockScreen.jsx  ← PIN keypad
│   ├── ProfileSetup.jsx← First-time setup
│   ├── VaultApp.jsx    ← Main application
│   ├── Toast.jsx       ← Notifications
│   ├── Lightbox.jsx    ← Photo viewer
│   └── modals/
│       ├── AddModal.jsx   ← Add/Edit distributor
│       └── VaultModal.jsx ← Create vault + Delete confirm
├── lib/
│   ├── storage.js      ← All localStorage helpers
│   └── constants.js    ← RANKS, COLORS, ICONS
├── package.json
├── tailwind.config.js
└── next.config.mjs
```

---

## 💾 How Data is Stored

All data lives in your **browser's localStorage** under these keys:

| Key | Contents |
|-----|----------|
| `awpl_v3_pin` | Your PIN (base64 obfuscated) |
| `awpl_v3_profile` | Your name, distId, rank |
| `awpl_v3_vaults` | Array of team vaults |
| `awpl_v3_entries` | All distributor entries including hidden `_addedOn` timestamp |

> ⚠️ localStorage limit is ~5MB per browser. Photos are compressed automatically, but if you add many photos, use the **Export Backup** button to download a JSON file, then clear old entries.

---

## 📦 Export / Import

- **Export** → Click the ⬇ icon in the header → downloads a `.json` file
- **Import** → Click the ⬆ icon → select your backup `.json` → data is restored

---

## 🛠️ Customization

- **Change PIN** → Clear localStorage key `awpl_v3_pin` and reload, then set a new PIN in profile setup
- **Add more ranks** → Edit `lib/constants.js` → `RANKS` array
- **Change colors** → Edit `app/globals.css` CSS variables

---

## 📱 Connecting from Your Main Vercel Site

Just add a link/button anywhere on your main site:

```jsx
// In your main site's navbar or dashboard
<a href="https://your-awpl-vault.vercel.app" target="_blank">
  🔐 Open AWPL Vault
</a>

// Or if added as /vault route in same project:
import Link from 'next/link'
<Link href="/vault">🔐 Open AWPL Vault</Link>
```

---

Built with ❤️ using Next.js 14 + Tailwind CSS. No data ever leaves your device.
