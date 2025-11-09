#!/bin/bash
# GitHub Push Script for uvgames repository

echo "🚀 Pushing games to GitHub..."
echo ""
echo "You'll need to authenticate with GitHub."
echo ""
echo "Option 1: Use your GitHub username and a Personal Access Token"
echo "  - Get a token from: https://github.com/settings/tokens"
echo "  - Click 'Generate new token (classic)'"
echo "  - Select 'repo' scope"
echo "  - Copy the token"
echo ""
echo "Option 2: Run this command manually:"
echo "  git push -u origin main"
echo ""
echo "When prompted:"
echo "  Username: therealuv17"
echo "  Password: [paste your Personal Access Token]"
echo ""

cd "/Users/uvtheracer/uv games"
git push -u origin main

