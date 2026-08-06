# GitHub Sync Plan for Border Energy Index (BEI)

## Goal
Connect this Lovable project to GitHub via two-way sync so the codebase is backed up and editable in both Lovable and GitHub.

## What will happen
- Lovable creates a new GitHub repository in the chosen GitHub account/organization.
- The current project code is pushed to the repository.
- All future changes made in Lovable are automatically pushed to GitHub.
- Changes pushed to GitHub from local editors are automatically synced back into Lovable.
- Environment variables and secrets are **not** synced to GitHub for security.

## Prerequisites
- The user must be on a Lovable workspace plan that supports GitHub sync.
- The user must have a GitHub account and authorization to create repositories in the chosen account or organization.

## Steps (performed in the Lovable UI)
1. Open the Plus (+) menu in the chat input (bottom-left of the Lovable editor).
2. Select **GitHub** → **Connect project**.
3. Authorize the Lovable GitHub App if it has not been authorized before.
4. Select the GitHub account or organization where the repository should be created.
5. Click **Create Repository** in Lovable.
6. Wait for the initial sync to complete.

## Post-sync checklist
- Copy environment variables/secrets from the Lovable project settings into the GitHub repository's deployment settings (e.g., Vercel, Netlify, or Cloudflare) if self-hosting is planned. The synced repo does not include `.env`.
- Update the `<repository-url>` placeholder in `README.md` with the actual GitHub URL after sync is complete.
- If adding a custom `README.md` note, ensure the build instructions are still valid.

## Notes
- Lovable does not support importing an existing GitHub repository into this project; only the create-new-repo flow is available.
- Only one GitHub account can be connected to a Lovable account at a time.
- If you want to develop locally later, the synced repo is a standard TanStack Start project using `npm`/`bun` and `vite`.
