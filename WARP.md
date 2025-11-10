# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository overview
- This repo is a multi-project workspace:
  - quantum-goose-app: React (Vite) frontend.
  - quantum-goose-charm: Python Juju charm that provisions and manages a Django-based backend and builds/deploys a React bundle via systemd/nginx on Linux targets.
  - Additional requirements files exist (requirements.txt, requirements_django_only.txt, requirements_llm.txt, flask_services/requirements_flask.txt) but no runnable Django/FastAPI/Flask app sources are present in this repo.

Common commands

Frontend (quantum-goose-app)
- Install deps
  - cd quantum-goose-app
  - npm install
- Dev server
  - npm run dev
- Build
  - npm run build
- Preview production build
  - npm run preview
- Lint
  - npm run lint

Charm (quantum-goose-charm)
- Create venv and install deps (Windows PowerShell)
  - python -m venv .venv
  - .\.venv\Scripts\Activate.ps1
  - pip install -r quantum-goose-charm/requirements.txt
- Run tests with pytest (when tests are added)
  - pytest -q
  - Run a single test by node name
    - pytest path/to/test_file.py::test_case_name -q
  - Filter by expression
    - pytest -k "substring" -q

What’s actually here vs referenced
- The root README describes a Django project layout (manage.py, templates/, static/, quantum_goose_project/), but those files are not present in this repo. The Juju charm generates/configures a Django app on the target host at /opt/quantum-goose and expects Linux system services (systemd, nginx, redis, gunicorn).
- The React app’s LLM service targets a backend at http://localhost:9000/quantum-goose-app/api and /api/llm (see quantum-goose-app/src/services/llmService.js). That backend is not included here; adjust endpoints or run a compatible service for end-to-end testing.

High-level architecture
- Frontend (quantum-goose-app)
  - Tooling: Vite, React 19, react-router-dom 7, ESLint flat config (eslint.config.js).
  - Code: src/components/* for feature UIs; src/services/llmService.js and memoryService.js for API access; vite.config.js uses @vitejs/plugin-react with defaults.
- Deployment charm (quantum-goose-charm)
  - Purpose: Operator Framework (ops) charm that installs system dependencies (nginx, redis), sets up a Python venv, installs Django/ASGI/LLM packages, configures gunicorn, and builds a React bundle.
  - Layers (src/layers):
    - base.py: bootstraps directories under /opt/quantum-goose, sets up venv, installs system packages, manages services.
    - django.py: writes Django settings, runs migrate/collectstatic, and configures a systemd unit quantum-goose.service for gunicorn.
    - react.py: installs Node, copies frontend sources, runs npm ci/build, and publishes a build directory for nginx.
  - Charm entry (src/charm.py): wires Juju hooks to handlers (install/start/config/relations/actions) and reports application status. Note: it references src/handlers/* modules that are not in this repo, so the charm is incomplete without them.

Development tips specific to this repo
- Frontend-only development is ready out of the box via Vite (npm run dev). The API endpoints in src/services/llmService.js are hard-coded; use a mock server or adjust URLs for local work.
- The charm code assumes a Linux target with systemd/nginx. You can still run unit tests locally once tests exist (pytest), but charm execution and subprocess calls (apt-get/systemctl) won’t work on Windows.

Readme alignment
- Keep the root README’s architectural intent in mind (Django backend + React frontend). In this repo, only the React app and the charm scaffolding exist; backend code should be sourced or implemented elsewhere for full-stack runs.
