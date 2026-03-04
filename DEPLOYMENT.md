# Deployment Guide

The site is served at `precog.iiit.ac.in/aisehack`, proxied from the deployment server running on port `3000`. The nginx config on `precog.iiit.ac.in` proxies `/aisehack` → `<server>:3000` and should not need to change unless the port changes.

---

## First-Time Setup

```bash
git clone https://github.com/IIIT-ECell/aisehack-2026.git
cd aisehack-2026
```
---

## Making Changes & Deploying

### 1. Make your changes locally

Test locally with:
```bash
pnpm dev
```

In dev mode the site runs at `localhost:3000/` (no basePath prefix). This is expected — `.env.development` sets `NEXT_PUBLIC_BASE_PATH=` (empty) so paths resolve correctly without the `/aisehack` prefix.

---

### 2. Rsync to the server

```bash
rsync -avz --exclude='.git' --exclude='node_modules' --exclude='.next' \
  ./ <user>@<server>:~/aisehack-2026/
```

`.env.production` **must** be included in the rsync.

---

### 3. SSH into the server and deploy

```bash
ssh <user>@<server>
cd ~/aisehack-2026
sudo docker compose up -d --build
```

Should automatically replace the running container. If not just force stop the container and rebuild

---

### 4. Verify

```bash
sudo docker compose ps
curl http://localhost:3000/aisehack   # should return the homepage HTML
```

The site should now be live at `precog.iiit.ac.in/aisehack`.