# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] — 2026-08-08

### Added
- Unit tests with Vitest for core utility functions (`formatters`, `teamColors`, `driverImages`)
- GitHub Actions CI/CD pipeline — auto-runs tests and build on every push
- ESLint + Prettier configuration for consistent code quality
- `CONTRIBUTING.md` with branch strategy and commit conventions
- `.env.example` template for easier project setup
- MIT `LICENSE` file

### Security
- Removed `.env` file from git tracking (was accidentally committed in v1.0.0)
- Removed `dist/` folder from version control
- Cleaned up scratch/debug files (`fetch.js`, `fetch2.js`, `fetch3.js`, `hadjar_test.txt`)

---

## [1.0.0] — 2026-08-08

### Added
- 🏎️ Live F1 Dashboard powered by OpenF1 API
- 📊 Driver & Constructor Championship Standings (2026 season)
- 🧑‍✈️ Full driver profiles with team colors and portraits for all 2026 grid drivers
- 🗺️ Race Calendar with circuit information and countdown timers
- ⚔️ Driver head-to-head comparison tool
- 🏆 Fantasy F1 Team builder with race simulator
- 👤 User authentication via Firebase Auth (email/password)
- ⭐ Favorite drivers & teams saved to Firebase Firestore
- 🌐 Progressive Web App (PWA) — installable on mobile devices
- 🌓 Dark / Light mode with system-aware theme switching
- 🎨 Premium dark UI with glassmorphism elements and smooth animations
- Deployed to Vercel at [pitlanef1.vercel.app](https://pitlanef1.vercel.app)

### APIs Used
- [OpenF1 API](https://openf1.org/) — Live session telemetry and timing data
- [Jolpica/Ergast API](https://api.jolpi.ca/) — Historical F1 race and standings data
- [Firebase](https://firebase.google.com/) — Authentication and database
- [FlagCDN](https://flagcdn.com/) — Country flag images
- [Formula1 Media CDN](https://media.formula1.com/) — Official driver portraits
