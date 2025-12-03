set shell := ["bash", "-cu"]

# --- Node / Next.js ---

install-node:
	pnpm install

dev-node:
	pnpm run dev

build:
	pnpm run build

start:
	pnpm run start

lint:
	pnpm run lint

# --- Python caption service (uv) ---

py-install:
	cd py-caption-service && uv sync

py-dev:
	cd py-caption-service && uv run uvicorn main:app --reload --port 8001

# --- Convenience targets ---

# Install everything
install: install-node py-install

# Run both dev servers (Python + Next.js)
dev:
	# Start Python caption service in the background
	(cd py-caption-service && uv run uvicorn main:app --reload --port 8001) &
	# Run Next.js dev server in the foreground
	npm run dev