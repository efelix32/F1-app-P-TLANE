# Contributing to Pitlane F1 Dashboard

Thank you for your interest in contributing! 🏎️

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- A Firebase project (see `.env.example`)

### Setup

```bash
# 1. Fork and clone the repository
git clone https://github.com/efelix32/F1-app-P-TLANE.git
cd F1-app-P-TLANE

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Fill in your Firebase credentials in .env

# 4. Start the dev server
npm run dev
```

---

## 🌿 Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `feature/xxx` | New features |
| `fix/xxx` | Bug fixes |
| `chore/xxx` | Tooling, deps, refactors |

Always branch off from `main`:
```bash
git checkout -b feature/my-new-feature
```

---

## ✅ Before Submitting a Pull Request

Please make sure the following pass:

```bash
# Run tests
npm test

# Check linting
npm run lint

# Verify build succeeds
npm run build
```

---

## 📝 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add race simulation feature
fix: correct lap time formatting
docs: update README with setup instructions
chore: upgrade vite to v5
refactor: extract DriverCard into separate component
test: add unit tests for formatters utility
```

---

## 📁 Project Structure

```
src/
├── __tests__/     # Unit tests (Vitest)
├── components/    # Reusable UI components
├── contexts/      # React Context providers
├── data/          # Static data (circuits, etc.)
├── hooks/         # Custom React hooks (API calls)
├── pages/         # Page-level components
├── styles/        # Global CSS
└── utils/         # Pure utility functions
```

---

## 🐛 Reporting Bugs

Please open an issue with:
- A clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS info

---

## 💡 Feature Requests

Open an issue with the `enhancement` label and describe:
- The problem your feature solves
- Your proposed solution
- Any alternatives you considered

---

*Built with ❤️ by efelix32*
