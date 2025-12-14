# Development Setup

## Starting the Dev Server

If you encounter lock file errors when running `npm run dev`, use the cleanup script:

```powershell
.\dev-clean.ps1
```

This script will:
- Stop all running Next.js processes
- Clean lock files
- Restart the dev server

**Why?** Closing a terminal doesn't always kill Node.js processes, leaving lock files that block new instances.
