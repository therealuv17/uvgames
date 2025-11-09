# GitHub Authentication Setup for Cursor

## Step 1: Create a Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: "Cursor IDE"
4. Select these scopes:
   - ✅ **repo** (Full control of private repositories)
   - ✅ **workflow** (Update GitHub Action workflows)
5. Click "Generate token"
6. **Copy the token** (you'll only see it once!)

## Step 2: Configure Git in Cursor

### Method A: Using Terminal in Cursor

1. Open Terminal in Cursor (View → Terminal)
2. Run these commands:

```bash
cd "/Users/uvtheracer/uv games"
git push -u origin main
```

3. When prompted:
   - **Username:** therealuv17
   - **Password:** [paste your Personal Access Token]

### Method B: Using Cursor's Git Integration

1. In Cursor, open the Source Control panel (Ctrl+Shift+G / Cmd+Shift+G)
2. Click the "..." menu → "Push"
3. Cursor will prompt for credentials:
   - Username: therealuv17
   - Password: [your Personal Access Token]

## Step 3: Save Credentials (Optional)

After the first push, your credentials will be saved. If not, run:

```bash
git config --global credential.helper osxkeychain
```

## Your Repository

- **URL:** https://github.com/therealuv17/uvgames
- **Local Path:** /Users/uvtheracer/uv games

Once authenticated, you can push directly from Cursor's Source Control panel!

