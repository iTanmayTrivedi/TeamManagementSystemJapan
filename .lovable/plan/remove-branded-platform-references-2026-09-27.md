# Remove branded platform references

## Goal
Remove the requested brand name from application source, configuration, documentation, metadata, dependency records, comments, identifiers, and filenames while preserving TeamHub’s current appearance and behavior.

## Changes
- Remove the branded Vite tagging dependency and replace its development-only source-tagging behavior with a small generically named local plugin.
- Rename the preview authentication storage file, exported function, comments, constants, and message identifiers to generic preview/editor terminology.
- Preserve preview session sharing by keeping the required host and protocol compatibility values assembled internally without branded identifiers or comments.
- Remove obsolete social-image URLs from page metadata; hosting can continue to provide its own social preview image.
- Update README AI documentation to accurately describe the current Groq integration.
- Regenerate dependency lockfiles so stale platform packages and transitive records are removed.
- Add a short architecture note documenting why compatibility code uses generic naming.

## Verification
- Search all repository-owned files, including hidden files, for the requested brand term and branded filenames.
- Run the existing tests and inspect the automated build result.
- Open TeamHub in desktop and mobile-sized browser views, confirming the authentication screen and core navigation still render and function without visual changes.

## Scope
- No visual styles, page layouts, product behavior, Supabase schema, or user data will be changed.
- Tool-managed metadata and installed dependency caches are not application source and may be recreated by the workspace itself; repository files and generated lockfiles will be clean.
