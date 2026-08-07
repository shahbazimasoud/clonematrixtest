# AGENTS.md — AI Agent Guidelines & Project Rules

## 🚨 MANDATORY PANEL VERSIONING RULE FOR ALL AI AGENTS

Whenever you perform ANY task on this codebase (bug fix, refactor, feature addition, UI tweak, or endpoint change):

1. **Increment Panel Version**: Edit `/src/version.ts` and bump `PANEL_VERSION` (e.g. `1.2.1` -> `1.2.2` for patch/minor fixes, `1.3.0` for new features).
2. **Update Build Date & Changelog**: Update `PANEL_BUILD_DATE` and append the new version details to `VERSION_HISTORY` in `/src/version.ts`.
3. **Update VERSION.md**: Maintain the `/VERSION.md` file with the latest version number and release notes.
4. **Ensure UI Consistency**: Verify that the panel version displayed in the Profile Modal and Panel Updates section reflects `PANEL_VERSION`.
5. **Commit & Push**: After finishing your task, commit and push changes to git (`git commit` and `git push`).

Do not skip version bumping under any circumstances!
