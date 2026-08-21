# Raven Matrix Admin Panel - Versioning & Changelog

## ⚠️ MANDATORY RULE FOR AI AGENTS & DEVELOPERS

> **CRITICAL RULE:** Whenever you make ANY code modification, feature addition, bug fix, or UI change to this panel, you **MUST** update and increment the version number!

### How to Increment Version:
1. Open `src/version.ts`.
2. Update `PANEL_VERSION` according to semver:
   - **Patch / Minor Fix** (e.g., `v1.2.0` -> `v1.2.1`): Bug fixes, CSS/layout tweaks, small refactors.
   - **Minor Feature** (e.g., `v1.2.1` -> `v1.3.0`): New tabs, new settings, API additions.
   - **Major Release** (e.g., `v1.3.0` -> `v2.0.0`): Major breaking changes, complete UI redesigns.
3. Update `PANEL_BUILD_DATE` to current date (`YYYY-MM-DD`).
4. Add a new entry to `VERSION_HISTORY` array in `src/version.ts`.
5. Update `VERSION.md` with the new version and release notes.

---

## Current Panel Version: **v2.35.0** (Released: 2026-08-21)

### Changelog History

#### **v2.35.0** - 2026-08-21
- **Granular Single-Script Generation & Targeted 'Run Now' Execution**:
  - **Single Script Generation**: Creating or updating any automated cron schedule now strictly writes and configures ONLY the script associated with that active schedule type (`matrix_auto_db_backup.sh`, `matrix_auto_config_backup.sh`, or `matrix_auto_cleanup.sh`), avoiding the generation of unconfigured or inactive scripts.
  - **Fixed "Run Now" Script Isolation**: Triggering a manual execution via the "Run Now" / "اجرای فوری" button checks, creates, and executes ONLY its corresponding script using the exact parameters (retention days, backup target path, and credentials) of that schedule card, without triggering full script synchronizations or creating unrelated scripts.
  - **Modular Script Generators**: Refactored the scheduler backend into independent script generators (`ensureSingleSchedulerScript`, `getDbBackupScriptContent`, `getConfigBackupScriptContent`, and `getRetentionCleanupScriptContent`) ensuring total execution safety and script isolation.

#### **v2.34.0** - 2026-08-21
- **Script Directory Protection & Instant Backup List Rescan**:
  - **Preserved `/opt/matrix-element-Backup/scripts/` & `.sh` files**: Updated single deletion, batch deletion, and purge commands to strictly safeguard helper scripts and the `/scripts/` directory against removal.
  - **Excluded Scripts from Catalog & Storage Calculations**: Filtered out scripts and the `scripts/` directory from `scanServerBackups`, `scanSchedulerBackups`, and storage size calculations.
  - **Hardened Automated Cleanup Script (`matrix_auto_cleanup.sh`)**: Added explicit exclusion patterns to ensure automated retention cleanup routines never prune shell scripts or helper tools.
  - **Instant Live Re-scan**: All deletion operations immediately execute a live filesystem scan to reflect the latest contents of the backup directory and return updated storage metrics in real time.

#### **v2.33.0** - 2026-08-21
- **Streamlined Selection Deletion & Cleanup Button Refinement**:
  - **Dynamic Selection Delete**: The Delete Selected button (`حذف موارد انتخاب‌شده`) dynamically appears whenever one or more items (or all items via "Select All") are checked.
  - **Removed Redundant 'Purge All Files' Buttons**: Cleaned up the bulk actions header by removing the top "Purge All Files" / "حذف همه فایل‌های دایرکتوری" button across all tables to avoid accidental directory purges.
  - **Integrated Batch Deletion Confirmation Modals**: Added interactive confirmation dialogs for both Repository and Scheduler bulk deletions, with full server file cleanup and live directory storage metric refreshes.

#### **v2.32.0** - 2026-08-21
- **Bulk Archive Management, Directory Storage Metrics & Enhanced Cleanup Execution**:
  - **Batch Selection & Operations for Scheduler Archives**: Implemented individual checkbox selection, "Select All", bulk JSON batch download, batch delete modal, and a "Purge All" action for the Automated Scheduler Backup Archives.
  - **Batch Delete for Repository Catalog**: Added batch delete support to the main Archived Backups Catalog alongside its bulk download features.
  - **Real-Time Directory Storage Size Badges**: Added live storage size and file count monitoring indicators across both the Backup Repository (`/opt/matrix-element-Backup`) and Scheduler Storage (`/opt/matrix-element-Backup/scheduler/`) sections.
  - **Enhanced Cleanup Execution & Auto-Refresh**: Streamlined the manual 'Cleanup Now' script trigger to automatically synchronize directory storage metrics and catalog views upon completion.

#### **v2.31.0** - 2026-08-21
- **Retention Isolation, Instant Cleanup Script Execution & Archive Filter Resolution**:
  - **Retention Display Isolation**: Removed redundant retention period info from Automated Database and Config Backup schedule cards so that retention limits are exclusively displayed and managed on the Retention Cleanup schedule card.
  - **Hardened Cleanup Script (`matrix_auto_cleanup.sh`)**: Refactored the cleanup script on target servers to be fully POSIX compliant without syntax edge cases, supporting zero retention days (pruning all backups), custom directory paths, and auto-pruning orphaned partial/temporary files.
  - **Instant Manual Execution & Local Fallback**: Enhanced manual triggers for 'Cleanup Now' and 'Run Now' to execute directly with real-time feedback, directory scanning, and instant UI refresh.
  - **Resolved Scheduler Archive Filters**: Fixed the classification and filtering logic in Automated Scheduler Backup Archives so switching between "All", "Database", and "Config" accurately isolates and lists matching archive files.

#### **v2.30.0** - 2026-08-21
- **Multi-Cron Architecture, Retention Policy Relocation & Real-Time Manual Trigger Execution**:
  - **Removed Redundant Retention Fields in Disk Storage Card**: Cleaned up the "Disk Storage & Retention Policy" section into "Scheduler Backup Storage Path", removing duplicate retention days and schedule inputs since retention is now configured per-schedule.
  - **Dynamic Multi-Cron Registration**: Overhauled `syncRemoteBackupCronJobs` to dynamically register, update, and manage multiple simultaneous cron jobs in server crontab and `/etc/cron.d/matrix-backup-scheduler` without the previous 2-job restriction.
  - **Fixed Cleanup Script (`matrix_auto_cleanup.sh`)**: Updated the bash cleanup script to dynamically accept retention days and directory path arguments, ensuring obsolete archives and logs are accurately pruned.
  - **Instant Manual Execution**: Enhanced "Run Now" and "Cleanup Now" buttons across all schedule cards to execute the corresponding script immediately on the target server with real-time feedback.
  - **Integrated Retention Limit in Cron Modals**: Added intuitive retention limit (days) input fields in both "Add New Cron Schedule" and "Edit Schedule" modals when configuring retention tasks.

#### **v2.29.0** - 2026-08-21
- **UI Streamlining, Live Human-Readable Cron Preview & Archive Filter Engine**:
  - **Removed Redundant Daemon Config Block**: Cleaned up the Backup Settings UI by removing the duplicate `Automated Backup Daemon Configuration` card, focusing management directly into `Active Server Schedules & Daemon Status` with immediate `New Cron` creation capabilities.
  - **Live Natural Language Cron Translation**: Implemented a real-time cron expression explainer in `Add New Cron Schedule` and `Edit Schedule` modals that dynamically translates expressions into Persian and English (e.g. *Every 2 days*, *Every Wednesday at 3 AM*, etc.).
  - **Filter Engine Fix for Archives Catalog**: Corrected the filter handling in `Automated Scheduler Backup Archives` so switching between `All`, `Database`, and `Config` or typing in search dynamically filters the files correctly.
  - **Light & Dark Theme Harmonization**: Enhanced contrast and styling across all scheduler modals for seamless Light Mode compatibility.

#### **v2.28.0** - 2026-08-21
- **Light Mode Modal Harmonization & Dedicated Cron Schedule Creator**:
  - **Relocated Save & Sync Button**: Moved the `Save & Sync Scheduler to Server` button to the bottom of the Automated Backup Daemon Configuration card for a clean and logical configuration flow.
  - **New Cron Schedule Creator**: Added a `New` button and interactive creation modal allowing users to define new cron jobs (Database or Configuration) with custom names, expressions, descriptions, and presets, immediately registering them to the server's crontab and active list.
  - **Pure Live Data in Active Server Schedules**: Purged all mock card placeholders from Active Server Schedules & Daemon Status; empty states are displayed dynamically when no matching cron jobs are configured on the server.
  - **Harmonized Light/Dark Modal Palette**: Refactored styling across all scheduler modals (New Cron, Edit Cron, Delete Cron, Restore Confirmation, File Deletion, and Cron Syntax Guide) to seamlessly adapt background, text, borders, and inputs for both Light and Dark themes.

#### **v2.27.0** - 2026-08-21
- **Automated Backup Daemon & Remote Server Crontab Synchronizer**:
  - **Zero Mock Data in Backups Catalog**: Completely eradicated hardcoded/mock backup entries from database initialization, schemas, and fallbacks. The catalog exclusively reflects actual physical scans of `/opt/matrix-element-Backup` on the connected server.
  - **Default Scheduler Path & Remote Provisioning**: Set default storage path to `/opt/matrix-element-Backup/scheduler/`. If custom or default paths do not exist on the remote server, they are automatically provisioned with proper permissions when saving scheduler settings.
  - **Remote Crontab Daemon Sync**: Saving scheduler settings compiles dedicated backup bash scripts (`matrix_auto_db_backup.sh` and `matrix_auto_config_backup.sh`) in `/opt/matrix-element-Backup/scripts/` and seamlessly installs or updates crontab entries in `/etc/cron.d/matrix-backup-scheduler` and user crontabs with retention auto-pruning.
  - **Active Server Schedules Dashboard**: Added a real-time status card section under Scheduler Config displaying registered database and configuration backup cron jobs and their crontab installation status.
  - **Interactive Cron Syntax & Preset Guide**: Added an accessible modal with visual breakdown of the 5 cron fields and 1-click apply presets for daily, hourly, weekly, and custom intervals.

#### **v2.26.1** - 2026-08-21
- **Remote Backup Online Validation Fix & Live Filesystem Directory Scanning**:
  - **Connection Validation Fix**: Resolved the backup blocking error where active connections with stale or un-polled status strings caused backups to fail (`Active connection is not online`). Backups now execute live validation directly on the remote server via SSH / Agent.
  - **Unified Remote Directory Scanning**: Confirmed and unified live scanning of `/opt/matrix-element-Backup/` across Configuration Snapshots, Database Restore, and Archived Backups Catalog.
  - **Live Scan Server Action**: Added explicit "Scan Server" refresh triggers for the Archived Backups Catalog toolbar to allow on-demand directory sync without page reloads.

#### **v2.26.0** - 2026-08-21
- **Dedicated Database Backup & Restore Suite with PostgreSQL Remote Dump Integration**:
  - **Single Execution Fix**: Resolved the duplicate backup creation bug by cleanly decoupling backup trigger logic from view state refresh cycles.
  - **Remote PostgreSQL Dump Automation**: Leveraged connection string / credentials to execute `pg_dump` with gzip compression directly on the target host, writing to `database_backup_<timestamp>.sql.gz` inside `/opt/matrix-element-Backup/`.
  - **Database Restore Sub-Tab**: Added an interactive sub-tab inside Configuration Snapshots & Rollback specifically for database archives, offering remote listing, restore, download, and delete.
  - **Row-by-Row Backups Catalog**: Refactored the Archived Backups Catalog from cards to a streamlined row-by-row list, removed extraneous restore buttons from general backup cards, and introduced confirmation dialogs before deletions.
  - **Remote Database Restore API**: Added `/api/matrix/database/restore` and `/api/matrix/database/backups` powered by active server connection execution with multi-step fallback (pg_restore, psql, gunzip).

#### **v2.25.3** - 2026-08-21
- **Strict Remote Execution Engine for Matrix & Element Backup Operations**:
  - **No Local/Sandbox Fallback**: Removed all local filesystem operations and fallbacks for Matrix and Element backup triggers. The operations strictly require and execute on the active remote destination server (via SSH or Agent).
  - **Multi-Stage Destination Verification**: Enforced remote verification after creating the `.tar.gz` archive, ensuring `test -f`, `test -s`, valid `tar -tzf`, and checking that the archive contains both `var/www/element/` and `etc/matrix-synapse/` trees.
  - **Accurate File Sizes**: Retrieved exact byte counts from `stat -c %s` on the destination server instead of hardcoded or simulated values.
  - **Remote Backup Catalog & Rollback Engine**: Ensured all snapshots, rollbacks, downloads, and deletions read and write directly to `/opt/matrix-element-Backup/` on the active destination server.

#### **v2.25.2** - 2026-08-20
- **Remote-First Architecture & Strict Multi-Path Archive Verification for /opt/matrix-element-Backup**:
  - **Remote-First Execution Enforcement**: All backup creation, listing, and restore procedures execute exclusively on the remote server via the active SSH/Agent connection profile.
  - **Strict Archive Verification**: Eliminated silent error handling (`|| true`, `2>/dev/null`); backups are verified via remote filesystem checks (`test -f`, `test -s`, `tar -tzf`) and exact byte size verification before returning success.
  - **Path Traversal Protection**: Enforced strict boundary checks during restoration to ensure archives contain only authorized Matrix Synapse and Element configuration targets.
  - **Companion Manifest & Detailed Toast Reporting**: Guaranteed companion JSON manifest generation on remote target paths and surfaced explicit remote failure messages to the UI.

#### **v2.25.1** - 2026-08-20
- **Fix Backup Delivery & Direct Multi-Path Storage in /opt/matrix-element-Backup**:
  - **Target Directory Archival Fix**: Resolved empty `/opt/matrix-element-Backup` issue by generating genuine compressed `.tar.gz` archives, companion JSON manifests, and direct snapshot subdirectories in target locations.
  - **Dual Environment Mirroring**: Synchronized backup writes across primary filesystem (`/opt/matrix-element-Backup/`) and sandbox environments simultaneously.
  - **Resilient Remote Bash Script**: Upgraded SSH & Agent execution with multi-path detection for `/var/www/element/**` and `/etc/matrix-synapse/**`, automatic directory provisioning, and permissions enforcement.
  - **Instant UI Snapshot Refresh**: Automated live catalog re-fetching upon backup creation to display new archives immediately in Homeserver and Reporting panels.

#### **v2.25.0** - 2026-08-19
- **Dedicated /opt/matrix-element-Backup Storage & Multi-Path Element/Synapse Configuration Backup Suite**:
  - **Dedicated /opt/matrix-element-Backup Directory**: Standardized remote server backup archive storage to `/opt/matrix-element-Backup` with dynamic directory creation, write verification, and catalog scanning.
  - **Multi-Path Configuration Backup Engine**: Comprehensive backup of `/var/www/element/` (including all subdirectories) and `/etc/matrix-synapse/` (including all subdirectories) in both remote SSH/Agent and local environments.
  - **Dual Format Archival & Restoration**: Integrated full `.tar.gz` archive creation and extraction alongside JSON structured dumps with recursive directory traversal.
  - **Granular Scope-Based Rollback**: Supported rollback targets (`all` for both Element and Synapse, `synapse` for `/etc/matrix-synapse`, and `element` for `/var/www/element`) with automatic Synapse service restart and error recovery.
  - **Enhanced UI Visualizations**: Updated Configuration Snapshots and Archived Backups Catalog to highlight covered paths, directory tags, and quick-rollback action triggers.

#### **v2.24.3** - 2026-08-19
- **Eliminate Double Scrollbars & Unified Natural Page Scroll in Wallpaper & Config Views**:
  - **Scroll Architecture Overhaul**: Resolved double scrolling and jumpy viewport behavior across Element Login Config & Wallpaper and Homeserver Settings tabs by removing conflicting nested overflow wrappers.
  - **Sticky Subtab Navigation**: Implemented sticky positioning (`lg:sticky lg:top-24`) on the sidebar navigation for smooth desktop tab switching while allowing full natural page scrolling.

#### **v2.24.2** - 2026-08-19
- **Active Client Devices Dropdown Menu Z-Index & Table Overflow Fix**:
  - **Z-Index & Stacking Context Fix**: Fixed the 3-dot dropdown menu in Matrix Admin -> Active Client Devices & Matrix Sessions to prevent clipping under table rows and containers.
  - **Table Container Overflow**: Updated devices table wrapper to `overflow-visible` and assigned high priority z-index layering to the active row and dropdown overlay.

#### **v2.24.1** - 2026-08-19
- **Auth Policy UI Harmonization & Local DB Option Refinement**:
  - **Palette Harmonization**: Harmonized User Login Source & Authentication Policy card colors, borders, and glass effects with other Element Login cards.
  - **Dual Option Simplification**: Refined policy selector to 2 distinct options: 'Both (Local + LDAP/AD)' and 'Active Directory Only (Block Local Users)' by removing the redundant local-only option.
  - **UI Cleanliness**: Standardized typography, badges, and YAML preview code block styling.

#### **v2.24.0** - 2026-08-19
- **User Authentication Policy & Local Login Control (/etc/matrix-synapse/conf.d/password.yaml)**:
  - **Purge CAPTCHA & Anti-Brute Force**: Completely removed CAPTCHA, brute-force challenges, and related backend endpoints from the codebase.
  - **Local vs. Active Directory Login Control**: Added User Authentication Policy management inside `Element Login Config & Wallpaper` tab with three policy modes: Both (Local + LDAP/AD), Active Directory / LDAP Only, or Local DB Only.
  - **Synapse password.yaml Management**: Automated creation and updates of `/etc/matrix-synapse/conf.d/password.yaml` containing `password_config` (`enabled` and `localdb_enabled`).
  - **Dynamic Local User Disabling**: Selecting Active Directory / LDAP Only sets `localdb_enabled: false`, blocking local database user logins across Matrix Synapse.
  - **Dedicated REST API Endpoints**: Added `/api/matrix/auth-policy` GET/POST and integrated policy state in branding save & fetch pipelines.

#### **v2.23.0** - 2026-08-19
- **Element Login Security & CAPTCHA Protection Hub**:
  - **Login Security & CAPTCHA Configuration Card**: Added comprehensive CAPTCHA security management interface inside `Element Login Config & Wallpaper` tab.
  - **Dual CAPTCHA Activation Modes**: Supported smart triggering upon repeated failed login attempts (`on_failed`) or mandatory challenge on every login (`always`).
  - **Dynamic Failed Attempts Threshold**: Configurable trigger threshold slider with quick presets (1, 2, 3, 5 attempts) to prevent brute-force attacks.
  - **Live Interactive CAPTCHA Preview & Tester**: Integrated real-time SVG CAPTCHA generator and sandbox input testing directly in the configuration panel.
  - **End-to-End Persistence**: Full backend synchronization across `/api/matrix/branding/save`, `/api/matrix/branding/config`, `/api/security/settings`, and audit logging.

#### **v2.22.0** - 2026-08-19
- **Favicon System-Wide Sync, Light Theme UI Polish & Default Country Code Purge**:
  - **Favicon Comprehensive Deployment**: Added automatic multi-path deployment and DOM synchronization for custom Element Web favicons across `/var/www/element/img/`, `/var/www/element/favicon.ico`, and HTML DOM link headers.
  - **Light Theme UI Palette Refinement**: Unified background, border, and text inputs across Default Widget Container Height, Element Call Settings, and Login Options for harmonious light & dark mode appearance.
  - **Default Country Code Removal**: Completely purged Default Country Code from both frontend UI components and backend branding config save/load pipelines.

#### **v2.21.0** - 2026-08-19
- **Element Config Expansion: Default Theme, 3PID Disable, Widget Height, Country Code & Element Call**:
  - **Default Theme Configuration**: Added UI and backend synchronization for `default_theme` ('light' or 'dark') in `/var/www/element/config.json`.
  - **3PID Login Control & Dropdown Suppression**: Added `disable_3pid_login` support grouped with login identifier options to suppress 3PID logins and hide the dropdown in Element login page.
  - **Default Widget Container Height**: Added configurable `default_widget_container_height` setting with 280px default and quick-preset adjustments.
  - **Default Country Code**: Added `default_country_code` selector supporting `GB` (+44), `IR` (+98), `ES` (+34), `SA` (+966), `DE` (+49), and `RU` (+7).
  - **Element Call Settings**: Added `element_call` object configuration including custom brand title, disable toggle, and exclusive mode.

#### **v2.20.0** - 2026-08-19
- **Element Login & Branding Asset Unified Storage Migration to `/var/www/element/img/`**:
  - **Branding Directory Standardization**: Migrated wallpaper uploads, header logo uploads, and favicon assets to `/var/www/element/img/` with automatic directory creation.
  - **Unified Discovery & Gallery Scanning**: Updated wallpaper gallery scanning and image listings to scan `/var/www/element/img/` and its subdirectories dynamically.
  - **Config Sync & Asset Serving**: Seamlessly serve and link Element login branding assets (wallpaper, headerLogo, and favicon) directly from `/var/www/element/img/` in Element `config.json`.

#### **v2.19.0** - 2026-08-19
- **Complete Removal of Room Ban Functionality and BAN Subsystems (Frontend & Backend)**:
  - **Room Members Moderation Streamlining**: Completely removed the Ban action button from Room Members list, keeping pure Kick moderation.
  - **Removed Users BAN & History BAN Sections**: Removed all Active Banned and History Banned UI sections, tabs, counters, and management modals from the Room Members modal and global Room Management toolbar.
  - **Backend API Cleanup**: Purged all legacy room ban/unban routes and endpoints (`/api/matrix/rooms/members/ban`, `/api/matrix/rooms/members/unban`, `/api/matrix/banned-users`, and `/api/matrix/banned-users/:id`).
  - **Type Definition & Member Model Refactor**: Cleaned up `MatrixRoom` interfaces and server room member responses to eliminate banned members arrays and obsolete state trackers.

#### **v2.18.0** - 2026-08-18
- **Banned Members Management Split: Users BAN & History BAN with Frequency Tracking**:
  - **Banned Members Two-Section Division**: Segmented Banned Members into 'Users BAN' (active bans currently enforced on room/server) and 'History BAN' (full historical archive of ban events with multi-ban frequency tracking).
  - **Dedicated Global Banned Members Modal**: Added a top toolbar action in Room Management opening a comprehensive management modal supporting quick searching, filtering, and real-time unbanning.
  - **Room-Specific Banned Tabs**: Updated the View Members modal to feature two dedicated sub-tabs: 'Users BAN (Active)' and 'History BAN', displaying past reasons, dates, moderator details, and ban counts.
  - **Synapse-Authoritative Unban & Immediate State Sync**: Integrated real-time unban handling that removes users from Synapse room ban state, updates local ban lists, and syncs history logs instantly.

#### **v2.17.12** - 2026-08-18
- **Deterministic Non-Speculative Matrix Room Ban & Unban Architecture**:
  - **Deterministic Matrix Moderation APIs**: Replaced speculative candidate endpoint retry loops in `handleRoomKickOrBan` with canonical Matrix Client-Server API endpoints (`POST /_matrix/client/v3/rooms/{roomId}/ban` and `POST /_matrix/client/v3/rooms/{roomId}/unban`).
  - **Authoritative Synapse State Verification**: Integrated `getRoomMemberState` helper querying live homeserver state events to strictly verify that ban operations result in `membership='ban'` and unban operations transition out of `'ban'` before returning success.
  - **Reliable Admin Moderation Elevation**: Enhanced `ensureAdminHasRoomPower` to support unban actions and pass explicit admin MXID targeting when elevating permissions with `make_room_admin`.
  - **Synchronized View Members State**: Ensured the modal and room state immediately synchronize with live Synapse member and ban lists post-action.

#### **v2.17.11** - 2026-08-18
- **Synapse-Authoritative Room Unban Architecture & Verification**:
  - **Synapse-Authoritative Room Unban**: Unified room unban into `handleRoomKickOrBan` with Power Level 100 admin elevation, executing standard Matrix Client-Server unban endpoints (`POST /_matrix/client/v3/rooms/{roomId}/unban` and `PUT /_matrix/client/v3/rooms/{roomId}/state/m.room.member/{mxid}` with `membership="leave"`).
  - **Strict Unban Verification**: Verified with Synapse homeserver state that membership is no longer `"ban"` before declaring success.
  - **Synchronized UI & Local Storage**: Immediately clears unbanned users from room banned lists in both modal and room list state, with background authoritative re-synchronization.

#### **v2.17.10** - 2026-08-18
- **Direct Room Member Ban Button in View Members Modal**:
  - **View Members Modal Room Ban**: Added direct 'Ban' moderation action button alongside 'Kick' for active members inside Room Management → View Members modal.
  - **Synapse-Authoritative Execution**: Triggers the authoritative homeserver ban workflow with confirmation dialog and optional reason prompt, updating member state and banned members list upon Synapse confirmation.

#### **v2.17.9** - 2026-08-18
- **Synapse-Authoritative Room Ban Architecture & State Verification**:
  - **Synapse-Authoritative Room Ban**: Implemented strict Matrix Client-Server API integration for banning room members (`PUT /_matrix/client/v3/rooms/{roomId}/state/m.room.member/{mxid}` and `POST /_matrix/client/v3/rooms/{roomId}/ban` with `membership="ban"`) without modifying PostgreSQL tables directly.
  - **Strict Membership State Verification**: Operation success is only declared when Synapse homeserver state explicitly confirms `membership="ban"` for the target user in the room.
  - **Profile & Identity Preservation**: User profile properties (display names, active states, avatar URLs) remain strictly preserved without mutation during ban execution.
  - **Synchronized Moderation Logs & UI**: Added structured `bannedUsersLogs` history recording and post-confirmation frontend state updates with background room member synchronization.

#### **v2.17.8** - 2026-08-18
- **Synapse-Authoritative Room Kick and Member Moderation Architecture**:
  - **Synapse-Authoritative Room Kick**: Removed all direct PostgreSQL membership/event table `DELETE` operations and replaced speculative endpoints with standard Matrix Client moderation APIs (`POST /_matrix/client/v3/rooms/{roomId}/kick`).
  - **Mandatory Synapse Verification**: The backend explicitly queries Synapse room member state following the moderation action and verifies the target user is no longer joined before reporting success.
  - **Strict Post-Confirmation UI and Database Updates**: The frontend no longer optimistically removes members or masks errors; local storage and room member cards are updated only upon verified Synapse confirmation, with authoritative state re-synchronization.
  - **Robust Admin Room Moderation Elevation**: Enhanced `ensureAdminJoinedAndPL100` to reliably identify active admin credentials, ensure room membership, and elevate Power Level 100 before executing moderation requests.

#### **v2.17.7** - 2026-08-17
- **Pure Room Membership Architecture & Profile Preservation for Add Member Flow**:
  - **Strict User Profile Preservation**: Completely eliminated unauthorized user profile mutations (`PUT /_synapse/admin/v2/users/...`) in `forceUserJoinRoomInSynapse`. Adding a user to a room strictly preserves display names, admin status, active state, avatars, passwords, and 3pids.
  - **Eliminated Display Name Fabrication**: Removed all MXID-based display name fabrication heuristics across backend member endpoints and frontend handlers. User profiles and display names are queried directly from Synapse as the authoritative source.
  - **Strict Membership Verification**: Room membership operations (join vs invite) are explicitly verified against Synapse room state and client APIs before updating local representations.
  - **Guaranteed State Integrity**: Local database state (`room.joinedMembers` and `room.membersCount`) is updated only after confirmed Synapse membership success, preventing false-positive additions.

#### **v2.17.6** - 2026-08-17
- **Dynamic Synapse Auto-Join Runtime Configuration Discovery & Canonical File Architecture**:
  - **Dynamic Runtime Config Discovery**: Synapse configuration path is now dynamically discovered from the running systemd service (`ExecStart`) and process command-line arguments (`--config-path`) rather than hardcoded path guesses.
  - **Eliminated config.d Guessing & Multi-Directory Writes**: Completely removed all legacy code that wrote `auto_join_rooms` to arbitrary `/etc/matrix-synapse/config.d` directories.
  - **Single Canonical Source of Truth**: Auto-Join configuration is managed in ONE canonical file (such as `conf.d/auto_join_rooms.yaml` or `homeserver.yaml` if standalone) without generating duplicate files or modifying `homeserver.yaml` unnecessarily.
  - **Python Runtime Validation & Safe Service Restart**: Every auto-join update is strictly validated using Synapse Python runtime checks and YAML schema validation before initiating a verified Synapse service restart.
  - **Robust Domain Resolution & Matrix Room Identification**: Replaced hardcoded dummy domains with runtime `server_name` discovery and preserved standard Matrix Room IDs without fake alias fabrication.

#### **v2.17.5** - 2026-08-17
- **Dynamic Runtime Discovery for Synapse Python Environment & Module Deployment**:
  - Replaced hardcoded Python versions (3.6-3.13), filesystem recursive scans, and directory guessing with dynamic runtime discovery via active systemd matrix-synapse service and running process inspection.
  - Queried discovered Synapse Python interpreter dynamically for exact sys.path and verified site-packages directories using Python standard runtime APIs.
  - Ensured idempotent single-target module deployment into verified Synapse site-packages and primary config locations with validation via interpreter import checks.
  - Eliminated silently swallowed errors in module deployment and service restarts, providing transparent step-by-step progress logging in API responses.

#### **v2.17.4** - 2026-08-16
- **Complete Light Mode Compatibility for Live Installer Log Terminal & Console UI**:
  - Fixed Live Installer Log terminal container (`# Reading live installer log: /var/log/matrix_stack_install.log`) background, borders, and text contrast in light mode.
  - Added light mode color support to formatLogLine helper for success, warning, error, and step highlights with high-contrast readable tones.
  - Adapted Web Console terminal outer frame, header, tab switchers, and terminal input bar (`root@matrix-node:~#`) seamlessly across dark and light themes.

#### **v2.17.3** - 2026-08-16
- **Rename Update Suite to 'Update Element Web'**:
  - Updated page header title to 'Update Element Web' (مدیریت بروزرسانی المنت وب).
  - Updated tab navigation button in Web Console terminal header to `update-element-web`.
  - Updated Quick Tasks entry title to 'Update Element Web' (آپدیت المنت وب) with matching emerald theme accent.
  - Refined terminal initial welcome log stream to reflect 'Update Element Web' suite.

#### **v2.17.2** - 2026-08-16
- **Streamline Element Updates Suite, Fix Light Mode Terminal & Button Loading Colors**:
  - Streamlined Element & Synapse update section to focus directly on Element Web deployment (Auto GitHub release download vs Manual offline package upload & installation), removing 'Both Components' and 'Synapse Server Only' options.
  - Added complete light mode styling across the entire Element update section, comparison cards, and deployment forms.
  - Fixed live terminal console (`element-updater@matrix:~`) background and log syntax colors to match light and dark modes with high contrast.
  - Fixed "Check updates" and "Install update" button loading states in `panel-updates` tab to use appropriate theme colors instead of turning dark.

#### **v2.17.1** - 2026-08-16
- **Add Element Login Page Branding Controls: Forgot Password & Create Account Toggles**:
  - Added interactive toggles in Element Login Page Branding & Footer Controls to show/hide "Forgot password?" and "New here? Create an account" links.
  - Integrated backend persistence for `showForgotPassword` and `showCreateAccount` in `/var/www/element/config.json` alongside `UIFeature.passwordReset` and `UIFeature.registration` setting defaults.
  - Implemented comprehensive CSS rules and runtime DOM observer injection in `syncElementBrandingDom` to cleanly hide respective elements and link prompts across Element Web login flows.
  - Added multi-language localizations (Persian, English, etc.) for both toggles in the admin panel.

#### **v2.17.0** - 2026-08-16
- **Overhaul Security Controls & Dynamic Synapse E2EE Policy Engine**:
  - Removed deprecated E2EE policies ('Disabled By Default' and 'Disabled By Default Permissive') from both frontend and backend, retaining solely 'Allowed / Standard' and 'Strict Lockdown'.
  - Built dynamic, version-agnostic Synapse `room.py` policy engine with automated pristine baseline backup (`room.py.orig.bak`), atomic replacement, and Python syntax compilation verification.
  - Implemented comprehensive 5-point `room.py` lockdown logic enforcing `encrypted: False`, `power_level_content_override` with `EventTypes.RoomEncryption` at 999, removal of `creation_content` encryption keys, and state filtering.
  - Integrated dynamic discovery prioritizing venv locations without hardcoded line numbers, Python versions, or Synapse versions.
  - Preserved full multi-language i18n support and synchronized service restarts across Synapse and Nginx.

#### **v2.16.7** - 2026-08-14
- **Enhance Visibility of Live Execution Terminal in Policy Modals**:
  - Updated Active Terminal execution modals in Policy and Configuration sections (Session & Authentication Policies, Push Notifications, Media Repository, Administrator Contact, and E2EE).
  - Revamped terminal stdout text coloring to high-contrast crisp white and bright light blue/cyan for maximum readability against dark backgrounds.

#### **v2.16.6** - 2026-08-14
- **Update Official Panel Title to 'Raven — Matrix Stack Manager'**:
  - Updated official panel name and browser title from 'Raven — Intelligent Matrix Stack Manager' to 'Raven — Matrix Stack Manager'.
  - Synchronized title across index.html, metadata.json, UI header, translations (Persian, English, etc.), README.md, and setup installers.

#### **v2.16.5** - 2026-08-14
- **Rename Control Hub Tab to Login Config & Wallpaper**:
  - Renamed the Wallpaper & Branding tab in Control Hub to 'Login Config & Wallpaper' (`تنظیمات لاگین و والپیپر`).
  - Updated tab headers, descriptions, and multi-language localizations across the panel to reflect full login configuration and wallpaper management features.

#### **v2.16.4** - 2026-08-14
- **Add Element Login Identifier Dropdown Configuration (Username, Email, Phone)**:
  - Added dedicated login identifier configuration in Wallpaper & Login Branding settings to allow admins to choose which login options (Username `login_field_mxid`, Email `login_field_email`, Phone `login_field_password`) appear in the Element login dropdown (`<select id="mx_Field_1">`).
  - Implemented live interactive preview of the Element login dropdown in the admin panel reflecting active options in real-time.
  - Added backend CSS and DOM injection support in `syncElementBrandingDom` to filter select options, auto-fallback to active identifiers, and lock single-option states.
  - Added validation to require at least one active login identifier before saving branding configuration.

#### **v2.16.3** - 2026-08-14
- **Fix Element Web Config Collision by Removing Conflicting Legacy default_hs_url**:
  - Fixed 'Invalid configuration: a default_hs_url can't be specified along with default_server_name or default_server_config' error in Element Web v1.11+ / v1.12+.
  - Cleaned `ensureElementConfigIntegrity` in backend to strictly use modern `default_server_config` and explicitly delete conflicting legacy `default_hs_url` and `default_server_name` keys from `/var/www/element/config.json`.
  - Ensured Element Web v1.12.24 bootstraps cleanly with modern homeserver config.

#### **v2.16.2** - 2026-08-14
- **Enforce Element Web Config Integrity Guard and Fix Wallpaper Save Misconfiguration**:
  - Fixed 'Your Element is misconfigured' error caused by branding/wallpaper save operations overwriting `/var/www/element/config.json` without preserving `default_server_config`.
  - Implemented `ensureElementConfigIntegrity` self-healing engine in backend that guarantees `default_server_config`, homeserver `base_url`, `server_name`, and schema structure are perpetually preserved and validated.
  - Added automatic interception in `writeConfigContent` to prevent accidental stripping of critical Element Web configuration fields during any branding, wallpaper, logo, or video settings mutation.
  - Enforced proper file permissions (`644`) and directory permissions (`755`) when copying custom wallpapers and logos to `/var/www/element`.

#### **v2.16.1** - 2026-08-14
- **Restore Remote Filesystem as Single Source of Truth for Wallpaper Gallery Discovery**:
  - Fixed remote wallpaper gallery discovery by actively scanning `/opt/matrix-synapse/wallpaper` directly on the remote filesystem via multi-strategy scanner (Python stat + shell find).
  - Eliminated dependency on panel reinstall state, database cache, or local sandbox for existing wallpapers; pre-existing files on remote server are discovered immediately.
  - Added binary stream transfer with Base64 encoding/decoding and start/end delimiters for high-speed, zero-corruption wallpaper asset streaming over remote connection.
  - Added support for all valid image types (`.jpg`, `.jpeg`, `.png`, `.webp`, `.svg`, `.gif`, `.ico`, `.avif`) with dynamic MIME type mapping.

#### **v2.16.0** - 2026-08-14
- **Fix WallpaperTab Runtime ReferenceError and Restore Tab Render**:
  - Fixed runtime crash (`ReferenceError: ImageIcon is not defined`) in `WallpaperTab` that caused a black screen upon opening the tab by correctly importing `Image as ImageIcon` from `lucide-react`.
  - Verified all icon components and visual fallbacks across the Wallpaper & Branding tab for seamless rendering.

#### **v2.15.9** - 2026-08-14
- **Fix Broken Wallpaper Gallery Image Loading & Implement Zero-Broken-Image Architecture**:
  - Fixed broken image display in the Wallpaper gallery during initial startup and panel updates by introducing clean base64 stream extraction with start/end markers over SSH.
  - Added auto-seeding of 5 built-in SVG wallpaper presets (*Deep Space Mesh*, *Emerald Aurora*, *Midnight Cyber Peaks*, *Quantum Nebula*, *Minimal Dark Grid*) ensuring the gallery is never empty upon initial boot.
  - Implemented resilient dynamic SVG fallback renderer in the wallpaper file endpoint preventing 404 broken image states for any wallpaper asset.
  - Added `WallpaperThumbnail` component in the frontend featuring animated loading skeletons, smooth fade-in transitions, and graceful fallback card rendering.

#### **v2.15.8** - 2026-08-14
- **Decouple Wallpaper & Branding Selection from Immediate Server Application**:
  - Decoupled wallpaper and header logo selection from immediate server writes: choosing a wallpaper, logo, or changing branding settings now updates local draft state and requires clicking 'Save & Apply Branding to Server'.
  - Added draft state indicators and a sticky 'Unsaved Changes in Draft' notification banner with quick Discard and Save & Apply action buttons.
  - Updated backend `/api/matrix/branding/save` endpoint to accept and atomically apply `activeWallpaper` and `activeLogo` alongside other branding fields in a single remote SSH update.
  - Fixed asset preview for Element Favicon and Header Logo with dynamic path resolution and error recovery.

#### **v2.15.7** - 2026-08-14
- **Element Favicon & Header Logo Loading Fix & Resilient Multi-Path Asset Delivery**:
  - Fixed broken icon display for Element Favicon and Header Logo Above Login Form in the Branding & Wallpaper tab.
  - Added multi-path asset resolver and direct proxy endpoint (`/api/matrix/branding/asset`) checking `/opt/matrix-synapse/wallpaper`, `/var/www/element/img/logos`, `/var/www/element/wallpaper`, and `/var/www/element`.
  - Implemented graceful fallback SVG rendering for standard Element matrix favicon and branding logo when custom files are not yet uploaded or temporarily unreachable.
  - Enhanced UI error handling in `WallpaperTab` with dedicated fallback icon states, ensuring zero blank previews.

#### **v2.15.6** - 2026-08-14
- **Native Element Web Logo Click Target URL Integration & Clean Architecture**:
  - Identified root cause of empty logo href: Element Web / Matrix React SDK natively reads `branding.logo_link_url` (and `branding.logoLinkUrl`) from `config.json` to render the anchor `href`.
  - Configured `branding.logo_link_url` as the Single Source of Truth in `/var/www/element/config.json`, ensuring Element Web's login page naturally renders `<a href="..." target="_blank" rel="noopener" class="mx_DefaultWelcome_logo">` without runtime hacks.
  - Removed unneeded inline JS/MutationObserver script injections from `index.html` to maintain clean, production-grade Element Web templates.
  - Synchronized `logoClickUrl` handling seamlessly across backend wallpaper and branding endpoints.

#### **v2.15.5** - 2026-08-14
- **Reliable Element Login Logo Click Target URL Redirection & Multi-Path HTML DOM Injection**:
  - Replaced fragile `sed`-based script injection with safe base64-encoded HTML document patching across all candidate Element Web paths (`/var/www/element`, `/usr/share/nginx/html`, `/var/www/html`, `/var/www/element-web`).
  - Added capture-phase click and pointer event interception to guarantee clicks on `a.mx_DefaultWelcome_logo`, `a.mx_AuthHeader_logo`, and inner `img` elements navigate to the custom Logo Click Target URL.
  - Added continuous `MutationObserver` and interval href re-application to ensure React DOM reconciliation in Element Web cannot reset or strip the custom logo link URL.

#### **v2.15.4** - 2026-08-14
- **Element Logo Click Target URL Redirection & DOM Sync**:
  - Implemented multi-key config synchronization for the Logo Click Target URL (`welcome_logo_target_url`, `auth_header_logo_target_url`, `logo_target_url`, `auth_header_logo_link`, `auth_header_logo_click_url`) in `/var/www/element/config.json`.
  - Added automatic DOM-level runtime binding for Element Web (`a.mx_DefaultWelcome_logo`, `a.mx_AuthHeader_logo`) to guarantee that clicking the logo navigates to the custom designated target URL rather than default Element links.

#### **v2.15.3** - 2026-08-14
- **Fix WallpaperTab Syntax and Upload Handler Resolution**:
  - Resolved Vite transform JSX syntax error in `WallpaperTab.tsx` upload dropzone section and showcase gallery.
  - Fixed unresolved `handleUploadSubmit` handler binding on the upload submission button.
  - Cleaned up redundant JSX fragments in showcase gallery view.

#### **v2.15.2** - 2026-08-14
- **Wallpaper Gallery Pagination, Reset to Defaults & Localized Light-Theme Delete Modal**:
  - Added interactive pagination navigation (first, previous, page numbers, next, last, and customizable items-per-page selector) across Grid, List, and Showcase views for smooth browsing of large wallpaper libraries.
  - Added "Reset to Defaults" (بازگشت به پیش‌فرض) button in the branding controls section to quickly revert all custom branding fields to default Element configuration.
  - Redesigned the "Confirm Wallpaper Deletion" modal with responsive light/dark theme styling and comprehensive 6-language localization (`loc(fa, en, es, ar, de, ru)`).
  - Verified backend configuration saving for `logoClickUrl` and complete login footer suppression in `/var/www/element/config.json`.

#### **v2.15.1** - 2026-08-14
- **Light Theme Polish, Direct Upload Button & Simulator Removal in Wallpaper Hub**:
  - Refactored dark/black element styling across the Wallpaper & Branding tab: Favicon container, Header Logo container, Logo Click Link input, Brand Name input, and configuration cards now automatically adapt to light mode and dark mode.
  - Fixed Upload Wallpaper button to directly trigger the native file browser allowing immediate single or multiple image selection and upload.
  - Removed Live Element Login Simulator section for a cleaner and more responsive branding customization panel.

#### **v2.15.0** - 2026-08-14
- **Element Wallpaper Management & Login Page Customization Hub**:
  - Added dedicated Wallpaper & Branding section to Control Hub for managing `/opt/matrix-synapse/wallpaper`.
  - Implemented multi-format image upload engine directly saving to destination `/opt/matrix-synapse/wallpaper` with automatic permissions and Element Web symlink/cache sync.
  - Implemented multi-mode view switcher for uploaded wallpapers (Grid View, List View, Showcase View) with search filtering and direct download/delete actions.
  - Added one-click wallpaper activation writing `branding.welcome_background_url` and `branding.auth_background_url` to Element Web's `config.json`.
  - Added Element Login Page Customization: Login Footer visibility switch (show/hide auth footer links and copyright), custom Favicon upload (.ico, .png, .svg), custom Header Logo upload (.svg, .png, .webp) above login form, and custom Logo Click Target Link URL configuration.
  - Added interactive live Element Login Simulator with real-time preview of active wallpaper, custom logo, clickable URL tooltip, and dynamic login footer.

#### **v2.14.7** - 2026-08-14
- **Remove Typing, Read Receipts, Presence, and Room Creation Policies**:
  - Removed Typing Notifications, Read Receipts, Presence Tracking, and Room Creation policy cards and controls from frontend Homeserver config view.
  - Cleaned up associated backend API routes, parser logic, and module blocker handlers from server configuration engine.

#### **v2.14.6** - 2026-08-14
- **Lock and Gray-Out Media Store Path Field in Panel**:
  - Made Media Store Path input field strictly read-only and disabled in Media Repository config view.
  - Added grayed-out visual styling, Lock icon badge, and fixed server system configuration indicator.

#### **v2.14.5** - 2026-08-12
- **Add Unconditional [E2EE_TRACE] Logging to check_event_allowed**:
  - Added unconditional `logger.warning` for `check_event_allowed` entry to trace live event processing during E2EE toggle attempts in Element Web.
  - Verified environment status and executed server diagnostic commands for Synapse module registration and policy inspection.

#### **v2.14.4** - 2026-08-12
- **Fix Synapse Module API Third-Party Rules & Spam-Checker Callback Separation**:
  - Fixed critical registration bug in `UserFlagsModule.__init__` by separating `register_third_party_rules_callbacks` and `register_spam_checker_callbacks` into independent try/except blocks.
  - Removed `check_event_allowed` argument from `register_spam_checker_callbacks` call to prevent `TypeError` during Synapse module initialization.
  - Registered `check_event_allowed` specifically under `register_third_party_rules_callbacks` where it is officially supported in Synapse Module API.
  - Enhanced `_get_e2ee_policy` error logging and ensured fail-closed behavior (`STRICTLY_DISABLED`, `False`) on any policy read or JSON parse errors.

#### **v2.14.3** - 2026-08-12
- **Enforce Organization E2EE Lockdown at Synapse Event Authorization Engine**:
  - Enhanced `matrix_user_flags_module.py` to extract event metadata safely from `FrozenEvent` objects across all Synapse Module API callbacks.
  - Added explicit `[E2EE_TRACE]` diagnostic logging capturing `event_type`, `room_id`, `sender`, and `policy` state on all `m.room.encryption` state event checks.
  - Configured `check_event_allowed` and `user_may_create_room` callbacks to raise HTTP 403 `SynapseError` with `M_FORBIDDEN` code on `STRICTLY_DISABLED` policy or read failures.
  - Guaranteed fail-closed protection so `m.room.encryption` state events cannot be persisted regardless of user power level, client, or room admin status.
  - Updated module deployment pipeline to ensure `matrix_user_flags_module.py` is copied to all Python virtual environment `site-packages` directories on target servers.

#### **v2.14.2** - 2026-08-12
- **Fail-Closed Authoritative Synapse E2EE Enforcement & Policy Engine Refactor**:
  - Refactored Synapse `UserFlagsModule` (`matrix_user_flags_module.py`) to implement fail-closed authoritative E2EE enforcement directly inside Synapse's event processing pipeline.
  - Removed fail-open exception handling for E2EE checks, ensuring any read failure or error while evaluating `/etc/matrix-synapse/e2ee_policy.json` strictly blocks `m.room.encryption` events.
  - Replaced fake `default_power_level_content_override` mechanism with authoritative `check_event_allowed` and `user_may_create_room` ModuleApi callbacks.
  - Updated `user_may_create_room` callback to inspect `initial_state`, `creation_content`, and boolean encryption flags, blocking encrypted room creation for all users regardless of power level.
  - Updated UI descriptions in Security Controls & E2EE Policy to clearly state that `STRICTLY_DISABLED` enforces server-side rejection of `m.room.encryption` events across all clients.

#### **v2.14.1** - 2026-08-12
- **Authoritative Synapse Event Authorization Engine Module for E2EE Enforcement**:
  - Implemented authoritative Synapse Event Engine Module (`matrix_user_flags_module.py`) registering `check_event_allowed` and `user_may_create_room` callbacks via Synapse `ModuleApi`.
  - Enforced `STRICTLY_DISABLED` policy directly inside Synapse's event processing pipeline, rejecting `m.room.encryption` state events and encrypted room creation with HTTP 403 `M_FORBIDDEN` before events are added to room DAG.
  - Ensured Room Admins cannot bypass E2EE lockdown policy via direct Matrix Client-Server API calls, custom clients, or Element Web.
  - Automated policy synchronization writing `/etc/matrix-synapse/e2ee_policy.json` and registering module in `homeserver.yaml` under `modules:` array.
  - Preserved existing encrypted rooms and historical encrypted events without converting them to plaintext or destroying data.

#### **v2.14.0** - 2026-08-12
- **Organization-Wide Strict E2EE Enforcement Policy & Backend Interceptor Architecture**:
  - Refactored **Homeserver → Security Controls & E2EE Policy** into a real, enterprise-wide E2EE policy manager with 3 policy modes: `STRICTLY_DISABLED` (Strict Lockdown), `DISABLED_BY_DEFAULT` (Permissive), and `ALLOW` (Standard Matrix).
  - Implemented server-side backend C2S API interceptor in `server.ts` that enforces policy independently of the client.
  - Automatically intercepts and rejects `m.room.encryption` state events and `createRoom` requests requesting encryption with HTTP 403 `E2EE_ORG_POLICY_BLOCKED` when `STRICTLY_DISABLED` is active.
  - Ensures Room Admins cannot bypass the E2EE policy via Element Web Room Settings, direct API calls, or room creation toggles.
  - Multi-layer remote Synapse and Element Web configuration updates:
    - Element Web `config.json`: `settingDefaults.features.feature_e2ee = false` and `forbidden_settings` lockdown.
    - Nginx `.well-known`: `io.element.e2ee.force_disable = true` metadata injection.
    - Synapse `homeserver.yaml`: `m.room.encryption` power level requirement set to 999 and `encryption_enabled_by_default_for_room_type = off`.
  - Updated UI with target server identity logging (`Target Matrix Server Node`), policy selection cards, and real-time execution steps.

#### **v2.13.39** - 2026-08-12
- **Comprehensive Homeserver Configuration i18n & Localization Refactoring**:
  - Audited all sections in the **Homeserver** tab (Network, Server Notices, Backups, Certificates, LDAP, Single Sign-On, SMTP, Limits/Rates/Retention Policies, Push, Admin Contact, Session Lifetime).
  - Standardized multi-language string handling across `ConfigForms.tsx` using a unified `loc()` helper supporting Persian (`fa`), English (`en`), Spanish (`es`), Arabic (`ar`), German (`de`), and Russian (`ru`).
  - Replaced legacy inline ternary conditions and un-localized static texts with localized representations.
  - Verified dynamic UI language switching across all configuration cards, status pills, labels, descriptions, and action buttons.

#### **v2.13.38** - 2026-08-11
- **User Session & Authentication Policies (session_lifetime.yaml) End-to-End Implementation**:
  - Added new **User Session & Authentication Policies** section to **Homeserver → Limits, Rates & Retention Policies**.
  - Implemented remote Synapse configuration management for `/etc/matrix-synapse/conf.d/session_lifetime.yaml`.
  - Added `discoverSessionLifetimeConfig` and `updateSessionLifetimeConfig` backend handlers in `server.ts` with `conf.d` inclusion verification, duration format validation, timestamped backups, and Synapse `--check-config` validation.
  - Added REST API endpoints `GET/POST/PUT /api/matrix/config/session-lifetime-config`.
  - Integrated Session Lifetime essential distinction notice explaining session expiration vs E2EE keys & retention policies.
  - Added controls for Refreshable Access Token Lifetime, Refresh Token Lifetime, UI Auth Session Timeout, and Login via Existing Session settings.
  - Added real-time Live Terminal Execution Modal displaying step-by-step remote execution and health check logs.

#### **v2.13.37** - 2026-08-11
- **Synapse admin_contact Configuration Management End-to-End Implementation**:
  - Added new **Administrator Contact** configuration section to **Homeserver → Limits, Rates & Retention Policies**.
  - Implemented backend helpers `discoverAdminContactConfig` and `updateAdminContactConfig` in `server.ts` with `conf.d` inclusion check, safe YAML syntax parsing, timestamped configuration backups, and Synapse `--check-config` validation.
  - Added REST API endpoints `GET/POST/PUT /api/matrix/config/admin-contact-config`.
  - Added real-time Terminal Execution Modal streaming SSH/Agent target server execution and health verification logs.
  - Integrated informational notice explaining `admin_contact` usage in Synapse resource-limit error responses.

#### **v2.13.36** - 2026-08-11
- **Reorganize Policy Form Layout: Media Storage & Retention inside Media Repository, Rate Limits at Bottom**:
  - Moved `Max Media Upload Size (MB)`, `Message Retention Period (Days)`, `Local Media Retention (Days)`, and `Remote Cached Media Retention (Days)` fields directly into the **Media Repository & URL Previews** container.
  - Moved the **Message Sending Rate Limits** container to the bottom of the page, placed directly after **Allow Custom Homeserver URL in Element Web (disable_custom_urls)**.

#### **v2.13.35** - 2026-08-11
- **Media YAML Single-Quote IP Blacklist, Double-Quote Accept-Language & Multi-Language Defaults**:
  - Formatted `url_preview_ip_range_blacklist` entries to use single quotes (`'127.0.0.0/8'`) in `media.yaml`.
  - Formatted `url_preview_accept_language` entries to use double quotes (`"fa-IR"`) in `media.yaml`.
  - Expanded default URL preview accept languages to include Persian, Arabic, Spanish, German, Russian, and English (`fa-IR, fa;q=0.9, ar-SA;q=0.8, es-ES;q=0.8, de-DE;q=0.8, ru-RU;q=0.8, en-US;q=0.8, en;q=0.7`).

#### **v2.13.34** - 2026-08-11
- **Media Repository Route Endpoint Registration & Safe JSON Error Handling**:
  - Registered `/api/matrix/config/media-config` endpoints in `server.ts` and verified server endpoint availability.
  - Added safe response content parsing to prevent `Unexpected token '<', '<!DOCTYPE '` syntax errors when server returns non-JSON responses.

#### **v2.13.33** - 2026-08-10
- **Push Jitter Delay Automatic Duration Suffix Formatting**:
  - Added automatic `'s'` suffix formatting for Push Jitter Delay inputs when raw numeric values are entered without unit identifiers.
  - Preserved existing duration units (e.g., `'1s'`, `'500ms'`) without duplicating suffixes upon configuration save.

#### **v2.13.32** - 2026-08-10
- **Light Mode Alignment & Jitter Delay UI Polish**:
  - Matched Jitter Delay input styling, background color, and border radius to the Rate Limit "Messages Per Second" text box.
  - Refactored Push Notification card container and Active Terminal modal with theme-aware styling for seamless Light Mode compatibility.

#### **v2.13.31** - 2026-08-10
- **Production Synapse Push Notification Configuration Management**:
  - Added Synapse Push Notification management section to "Limits, Rates & Retention Policies" interface.
  - Supported boolean toggles for `push.enabled` and `push.include_content`, with customizable `push.jitter_delay` string input.
  - Implemented modular `conf.d/push.yaml` discovery, creation, backup, and rollback mechanisms on remote Matrix servers.
  - Integrated Live Terminal modal displaying step-by-step connection, discovery, verification, and Synapse reload logs.
  - Maintained full backward compatibility with existing Synapse configurations without modifying unrelated YAML sections.

#### **v2.13.30** - 2026-08-10
- **Version-Agnostic Production E2EE Organization Policy Refactor & Capability Detection**:
  - Implemented version-agnostic E2EE policy architecture with dynamic server Capability Detection layer for Synapse & Element Web.
  - Integrated step-by-step real-time backend execution logging streamed directly into the confirmation modal.
  - Added multi-layer server-side enforcement including `default_power_level_content_override` (level 999), Element `feature_e2ee` toggle, and Nginx `force_disable` well-known metadata.
  - Implemented automatic timestamped configuration backups (`homeserver.yaml.bak_e2ee_*`), syntax validation, and instant rollback on failure.
  - Ensured non-E2EE rooms permit password-only login and history access on new devices without requiring device keys, SSSS, or key recovery.

#### **v2.13.29** - 2026-08-10
- **Light Theme Contrast & E2EE Policy Card Styling Refactor**:
  - Fixed yellow warning box contrast in Security Controls & E2EE Policy for Light Theme, making important technical boundary notices fully readable.
  - Redesigned the 3 policy status cards and target node badge with light/dark adaptive background and border styling.
  - Refactored E2EE confirmation modal to support light theme backdrop, high-contrast modal background, dark typography, and status elements.

#### **v2.13.28** - 2026-08-10
- **E2EE Organization Lockdown Architecture & Light Theme UI Design Refactor**:
  - Completely refactored Homeserver -> Security Controls & E2EE Organization Lockdown to execute real configuration operations on Synapse 1.118.0.
  - Eliminated `e2ee_disable` shell command alias requirement and integrated multi-tier default encryption enforcement via Synapse `homeserver.yaml` (`encryption_enabled_by_default_for_room_type` & `default_power_level_content_override`).
  - Integrated automated configuration safety backup, Python homeserver config validation, and instant rollback on failure.
  - Overhauled Light Theme CSS rules in `index.css` and `ConfigForms.tsx`, restoring high-contrast status badges, clear typography, and elegant card styling.

#### **v2.13.27** - 2026-08-10
- **Remote E2EE Security Policy Control Center & Architecture Refactor**:
  - Refactored Homeserver -> Security Controls & E2EE to operate directly on the target Remote Matrix Server over SSH / Agent connection.
  - Replaced fake `e2ee_disable` shell command terminal redirect with real `GET/POST /api/matrix/e2ee` backend API endpoints.
  - Added multi-layer policy enforcement: Element Web `config.json` (`feature_e2ee`), Nginx `/.well-known` (`force_disable`), and Synapse `homeserver.yaml` (`m.room.encryption` power level override).
  - Integrated automatic configuration safety backup, schema structure validation, and immediate rollback upon write failure.
  - Replaced misleading plaintext database storage claims with technically accurate scope notices and confirmation modal.

#### **v2.13.26** - 2026-08-10
- **Preferred Jitsi Domain & Video Conferencing Control Hub Integration**:
  - Wired up the Preferred Jitsi Domain setting and Video Conferencing controls in Homeserver Control Hub (Media & Video Conferencing tab).
  - Refactored backend endpoints GET/POST `/api/matrix/video` to support remote SSH/Agent configuration persistence and dual property keys (`preferredDomain` and `preferred_domain`).
  - Added real-time status loading, Persian and English localization, and toast notifications on updates.

#### **v2.13.25** - 2026-08-10
- **Domain Standardization: Replace kheilisabz placeholders with company**:
  - Replaced all occurrences of `kheilisabz` domain placeholders and fallback references with `company` across server routines, installation scripts, and version documentation.

#### **v2.13.24** - 2026-08-10
- **Secure Standalone Remote Python SMTP Test Runner & Parameter Engine**:
  - Eliminated Python inline syntax errors (`EOL while scanning string literal`) by introducing a standalone file-based Python SMTP runner.
  - Secured SMTP test parameters and credentials via JSON payload file with `chmod 600` permissions, ensuring zero secrets in process args (`ps aux`) or command lines.
  - Added strict remote cleanup in `finally` block ensuring temporary payloads and runner scripts are immediately purged after execution.
  - Added support for Port 465 SSL/TLS, Port 587/25 STARTTLS, explicit EHLO/AUTH and anonymous relay testing.
  - Added password sanitization preventing credential leaks in exception stack traces and live logs.

#### **v2.13.23** - 2026-08-10
- **Remote Synapse SMTP/Email Audit, Dynamic Configuration & Real Testing Engine Refactor**:
  - Refactored Synapse email/SMTP backend and frontend to operate dynamically on the active selected Remote Matrix Server.
  - Implemented dynamic discovery (`discoverRemoteSynapseConfigAndEnv`) locating `homeserver.yaml` and python binary on target host.
  - Added `HomeServerConfig` schema validation via Python in `/api/matrix/smtp/save` with backup and atomic overwrite before service restart.
  - Added real TCP/DNS/TLS/AUTH connectivity test (`/api/matrix/smtp/test-connection`) and test email dispatch (`/api/matrix/smtp/test`).
  - Connected frontend `ConfigForms` SMTP form to backend save and test endpoints with Password Masking and TCP/TLS test button.

#### **v2.13.22** - 2026-08-10
- **Rollback & Restore Center UI and Backend Removal**:
  - Removed Rollback & Restore Center component and "Snapshots available" counter from Element/Synapse update tab.
  - Removed pre-update backup snapshot creation and `esAutoBackup` toggle from frontend `TerminalPanel`.
  - Removed backend endpoints `GET /api/matrix/element-synapse/backups`, `POST /api/matrix/element-synapse/backup`, and `POST /api/matrix/element-synapse/rollback`.
  - Cleaned up unused icon imports (`RotateCcw`, `Undo2`) and state variables across `TerminalPanel` component.

#### **v2.13.21** - 2026-08-10
- **Dynamic Upstream Release Resolution & End-to-End Online Auto Update Pipeline**:
  - Eliminated hardcoded target versions (`1.158.0`/`1.108.0`) across backend and frontend UI components.
  - Implemented dynamic resolution querying PyPI (`https://pypi.org/pypi/matrix-synapse/json`) and GitHub API for current latest releases.
  - Added semver comparison logic: reports "already up to date" without package installation if Current >= Latest.
  - Enforced pinned installation (`matrix-synapse==<resolvedTargetVer>`) using detected virtualenv Python executable.
  - Captured pip exit codes and error output directly, failing immediately without unpinned fallbacks or false PASS.
  - Structured terminal logs: `[TASK]`, `[IDENTITY]`, `[ENV]`, `[VERSION]` Current/Latest/Required/Target, `[HEALTH]`, `[VERSION]` Post-update.

#### **v2.13.20** - 2026-08-10
- **End-to-End Remote Synapse Update Flow Overhaul & Virtualenv Version Verification**:
  - Overhauled Synapse update pipeline to detect actual systemd virtualenv executable (`/opt/venvs/matrix-synapse/bin/python`) on remote server.
  - Added strict pre-check comparing current installed Synapse version against target version, aborting redundant execution if already up to date.
  - Implemented post-update version comparison validating actual version increase on remote host to prevent false PASS reporting.
  - Enhanced Live Console logging with explicit host identity, Python path, installation method, before/after versions, and API health check results.
  - Cleaned up template literal backslash escaping and error handling across server update routes.

#### **v2.13.19** - 2026-08-10
- **Template Literal Backslash Escape Audit for Remote Synapse Update Commands**:
  - Audited and fixed template literal backslash escaping in `server.ts` for `dpkg-query` command strings.
  - Eliminated JavaScript evaluation of `${Version}` in template literals that caused `ReferenceError: Version is not defined`.
  - Enforced proper Bash script generation where literal `${Version}` is output to the shell command stream.
  - Re-verified complete Synapse Online Auto update workflow on remote target server.

#### **v2.13.18** - 2026-08-10
- **Fix ReferenceError in Synapse Online Auto Update & Enforce Remote Version Resolution**:
  - Resolved root cause of `[ERR] Version is not defined` caused by unescaped `${Version}` in JavaScript template literals inside `server.ts` `dpkg-query` command string.
  - Added explicit Synapse version resolution step for Online Auto mode, querying installed version from remote server and resolving target release version before starting update.
  - Ensured all backup, package upgrade, systemd service restart, and health check commands execute exclusively on target Remote Matrix Server using existing connection profile.
  - Validated input version strings to prevent shell command injection while supporting both automatic online release detection and explicit version targets.

#### **v2.13.17** - 2026-08-10
- **Remote Target Execution Enforcement for Element Web & Synapse Online Updates**:
  - Fixed Synapse Server Only update target to strictly execute online update commands on the active Remote Matrix Server instead of local Panel Server (Raven).
  - Added pre-update target verification logging non-destructive remote system identity (`hostname`, `hostname -I`, `id -un`, `$HOME`) and testing filesystem marker creation (`/tmp/matrix-panel-target-test`).
  - Added connection ID passing (`connectionId`) from frontend `TerminalPanel.tsx` to `/api/matrix/element-synapse/update` to avoid reliance on global connection state.
  - Enhanced Synapse version detection before and after update (`python3 -m pip show matrix-synapse` & `dpkg-query`), updating database state only upon verified success.
  - Enforced clean remote execution with `runServerCommand` and `getRemotePackageDir` passing `targetConn` across all update steps.

#### **v2.13.16** - 2026-08-09
- **Remote Package Discovery & Scanner Quote Escaping Fix**:
  - Fixed remote package scanner execution failure caused by broken bash quote wrapping (`bash -c 'PKG_DIR="'"..."'"'`) that evaluated `PKG_DIR` to empty string.
  - Fixed find parentheses syntax error in JS template string where unescaped backslashes `\(` and `\)` stripped character escaping.
  - Fixed `getRemotePackageDir` script escaping and added case-insensitive extension matching (`-iname *.tar.gz`, `*.tgz`, `*.zip`) for remote package discovery.
  - Cleaned up quote wrapping across upload verification, package check, and manual Element deployment scripts.
  - Added detailed error logging and proper HTTP status reporting for package scanning failures.

#### **v2.13.15** - 2026-08-09
- **SFTP & Retry SSH Architecture for Remote Package Transfers**:
  - Fixed 'Unable to exec' SSH channel exhaustion during chunked package uploads by buffering chunks locally on Raven and streaming the completed archive via dedicated SFTP `fastPut`.
  - Added SSH connection auto-recovery and channel retry logic in `executeSSHCommand` and `uploadSSHFile`.
  - Enforced dynamic Remote Matrix Server path (`$HOME/matrix/matrix_package`) across UI, scanner, rescan, and deployment workflows with `getent passwd` user home resolution.
  - Added post-upload archive integrity verification (`tar`/`unzip`) and automatic rollback of corrupted partial uploads.

#### **v2.13.14** - 2026-08-09
- **Remote Matrix Server Package Repository Refactor ($HOME/matrix/matrix_package)**:
  - Refactored Element Web manual package management to store release archives exclusively on the active Remote Matrix Server at `$HOME/matrix/matrix_package`.
  - Dynamically resolved target connection SSH user home directory using `getent passwd` for both root and non-root connection accounts.
  - Ensured package chunk streaming writes directly to the Remote Matrix Server with immediate cleanup of temporary Raven transfer buffers.
  - Updated package scanner (`/api/matrix/element-synapse/manual-packages`) and manual update execution to operate strictly on the Remote Matrix Server repository.
  - Eliminated Raven server permanent package storage in `/var/backups/matrix/packages` for remote connections.

#### **v2.13.13** - 2026-08-09
- **Robust Manual Element Web Update Pipeline & End-to-End Verification**:
  - Streamlined chunked package upload with real-time remote server chunk streaming over active SSH/Agent connection.
  - Added pre-update package integrity testing (zip/tar integrity validation) before attempting extraction.
  - Ensured preserved config.json is restored and initial config.sample.json fallback initialized when missing.
  - Replaced insecure chmod 777 with secure www-data/nginx file permissions (755 directories, 644 files).
  - Enhanced server-side update execution error detection and live terminal console log propagation.

#### **v2.13.12** - 2026-08-09
- **Fix Element Web Manual Update Script Execution & Multi-Server Package Sync**:
  - Replaced Bash-specific `[[ ... ]]` syntax in manual deployment script with POSIX-compatible `case` statement to prevent `/bin/sh` (Dash) syntax errors.
  - Wrapped script execution in `bash -c '...'` subshell for clean execution across Linux distributions.
  - Fixed `runServerCommand` output handler to include `stderr` error text when standard output is present, eliminating silent error swallowing.
  - Added remote target package synchronization to `/api/matrix/element-synapse/upload-element` for SSH / Agent connected servers.
  - Added frontend fallback auto-selection for manual release packages in `TerminalPanel.tsx`.

#### **v2.13.11** - 2026-08-09
- **Element Web Manual Deployment Mode & Server Package Repository**:
  - Added **Manual Mode (حالت manual)** for Element Web updates in Web Console -> Element & Synapse Update Suite.
  - Added package scanner endpoint `/api/matrix/element-synapse/manual-packages` to detect existing uploaded Element release packages (`.tar.gz`, `.zip`) stored in `/var/backups/matrix/packages` or `/var/backups/matrix-updates` on the server.
  - Implemented chunked package uploader `/api/matrix/element-synapse/upload-element` with live progress indicator to upload Element Web release packages directly to server storage.
  - Updated backend deployment handler in `server.ts` to extract, deploy to `/var/www/element`, preserve `config.json`, apply `www-data` permissions, and reload Nginx.

#### **v2.13.10** - 2026-08-09
- **Synchronize Nginx client_max_body_size with Max Media Upload Size**:
  - Updated `syncNginxSiteConfigsOnServerParamsChange` in `server.ts` to sync Nginx `client_max_body_size` directives across all Nginx site configs (`matrix.conf`, `element.conf`, `matrix-stack`, etc.) whenever `LIMIT_MB` or `max_upload_size` is updated in the panel.
  - Automatically provisions `/etc/nginx/conf.d/matrix_upload_size.conf` to set global upload limits in Nginx's `http` block.
  - Automatically runs `nginx -t` and reloads Nginx (`systemctl reload nginx || service nginx reload`) to apply changes immediately.

#### **v2.13.9** - 2026-08-09
- **Fix Modular Synapse Config Validation (conf.d & server_name)**: Updated the Synapse configuration validator in `server.ts` to include all supplementary config files from `/etc/matrix-synapse/conf.d/*.yaml` when validating via `HomeServerConfig`, and gracefully handled missing `server_name` checks for modular/partial configuration snippets.

#### **v2.13.8** - 2026-08-09
- **Fix Synapse Config Validation (HomeServerConfig)**: Replaced invalid/unrecognized `--check-config` CLI option in `homeserver.py` with Python's native `synapse.config.homeserver.HomeServerConfig` module loader to safely validate `homeserver.yaml` configuration files before applying changes.

#### **v2.13.7** - 2026-08-09
- **Privacy Toggles & Matrix Settings Sync Fix**:
  - **PostgreSQL JSON Boolean Fix**: Replaced string serialization (`'true'`, `'false'`) with native PostgreSQL JSON booleans (`'true'::boolean`, `'false'::boolean`) in `im.vector.web.settings` account data. Fixes JS truthiness issue where `"false"` evaluated as truthy in Element Web.
  - **Dual Key Element Config Sync**: Updated Element `config.json` synchronization to set both camelCase and snake_case properties (`sendTypingNotifications`, `send_typing_notifications`, `sendReadReceipts`, `send_read_receipts`).
  - **Synapse Presence Configuration**: Configured both `presence.enabled` and `use_presence` across `homeserver.yaml`, `conf.d/presence.yaml`, and `config.d/presence.yaml` candidate paths to guarantee presence state enforcement across Synapse versions.
  - **Server-Level Rate Limiting**: Added `rc_typing` rate limiting overrides (`per_second: 0.0`, `burst: 0`) when typing notifications are disabled.

#### **v2.13.6** - 2026-08-09
- **Complete Removal of Disk & LVM Management Module**:
  - Removed `DiskManagement.tsx` component and the "Disk & LVM Management" tab from navigation in `ConfigForms.tsx`.
  - Removed backend routes `/api/disk/overview`, `/api/disk/lvm/overview`, `/api/disk/lvm/snapshot/create`, `/api/disk/lvm/snapshot/revert`, and `/api/disk/lvm/snapshot/delete` from `server.ts`.
  - Cleaned up permissions and type definitions in `src/types.ts`.

#### **v2.13.5** - 2026-08-09
- **Toast Notification Argument Ordering Fix & Robust LVM Snapshot Parsing**:
  - Corrected Toast notification call parameter order in Disk Management from `(msg, type)` to `(type, msg)` so success toasts render with green success styling instead of red error alert containers.
  - Introduced `notify` normalization helper inside `DiskManagement.tsx` to ensure safe, consistent toast delivery.
  - Updated backend LVM JSON report parser to locate `{ ... }` boundaries and cleanly strip non-JSON warning lines or stderr noise (such as file descriptor leakage notices).
  - Extended snapshot detection criteria to check origin volume names, thin snapshot percentages (`data_percent`), and LVM attribute flags (`s`, `S`, `v`, `V`).
  - Added comprehensive Light Mode styling across Mount Points, Volume Groups, and Snapshots cards.

#### **v2.13.4** - 2026-08-09
- **Light Theme Modal Compatibility & LVM Exit Code 5 Graceful Handling**:
  - Captured stdout/stderr output when SSH commands finish with non-zero exit code (e.g. `exit code 5` when Volume Group has 0 free extents).
  - Provided explicit Persian & English instructions when Volume Group space is 100% allocated to existing Logical Volumes.
  - Implemented full Light Mode (`isLightMode`) support for all Disk Management modals (Create Snapshot, Revert Rollback, Delete Snapshot, and Reboot Notice).

#### **v2.13.3** - 2026-08-09
- **Enhanced LVM Snapshot Exception Handling & Detailed In-Modal Error Messages**:
  - Prevented unhandled 500 network exceptions when SSH or Agent command execution fails during `lvcreate`, `lvconvert`, or `lvremove`.
  - Added intelligent Persian/English error messages when Volume Group has 0 or insufficient free extents for snapshot creation.
  - Added a scrollable error alert box inside the "Create Snapshot" modal window to display exact diagnostic output directly to administrators.

#### **v2.13.2** - 2026-08-09
- **Fix LVM Snapshot Creation & Command Privileges**:
  - Fixed command execution issue where missing `sudo` or root privileges caused LVM snapshot creation to fail with permission errors.
  - Fixed syntax error when passing size parameters containing percentages (e.g., `10%FREE` or `10%`).
  - Added stderr redirection (`2>&1`) and improved error handling to ignore benign LVM warnings when snapshot creation succeeds.
  - Updated snapshot revert and deletion handlers to execute with proper privilege escalation and clean output checking.

#### **v2.13.1** - 2026-08-09
- **Fix Disk & LVM Management Layout Placement in ConfigForms**:
  - Fixed layout issue where `{activeTab === 'disk'}` was rendered outside the `lg:col-span-3` right column container in Control Hub.
  - Corrected grid positioning so the Disk & LVM Management dashboard renders cleanly inside the right content panel.

#### **v2.13.0** - 2026-08-09
- **Disk & LVM Management in Homeserver Settings**:
  - Added new **Disk & LVM Management** section to Homeserver Settings (`ConfigForms`).
  - Implemented live partition monitoring, filesystem detection, and mount space usage overview.
  - Added LVM Physical Volumes, Volume Groups, and Logical Volume snapshot management.
  - Implemented LVM snapshot creation, rollback (`lvconvert --merge`), and deletion (`lvremove`) operations via SSH / Agent remote connection queue.
  - Added automated snapshot capacity fill alerts (warning at >= 80% and critical at >= 95%) with mandatory confirmation modals.

#### **v2.12.0** - 2026-08-09
- **Real Synapse & Element Configuration Switches Integration**:
  - Implemented true **Presence System Tracking** toggle writing `presence.enabled` in `homeserver.yaml` using AST/js-yaml parser, created timestamped backups outside `conf.d/`, validated with `check-config`, and executed full Synapse service restart.
  - Implemented real **Send Typing Notifications** and **Transmit Read Receipts** toggles writing `settingDefaults` and `setting_defaults` in Element Web `config.json` on the target server.
  - Added **Account Data Override** option syncing typing and read receipt settings directly to existing users in Matrix Postgres database (`account_data` table).
  - Synchronized UI switch states on load with actual live server configuration values.

#### **v2.11.11** - 2026-08-08
- **Light Translucent Gray Frosted Blur for DB Disconnected Overlay**:
  - Updated DB Disconnected card overlay to a light frosted translucent backdrop (`slate-100/80` light mode & `slate-900/80` dark mode) with smooth blur filter.
  - Refined typography and warning badge contrast to harmonize seamlessly with clean light theme aesthetics.

#### **v2.11.10** - 2026-08-08
- **Database Connection Lost / Unconfigured Overlay for Dashboard Metrics**:
  - Added automatic database connectivity verification (`checkDatabaseConnection`) for both REST stats API (`/api/matrix/stats`) and real-time WebSocket metrics streams (`sendMetrics`).
  - Implemented a blur / dim overlay over **Public Rooms**, **Private Rooms**, **Active Users**, **Stored Media Size**, and **Reported Messages** cards when database connection is disconnected or not configured.
  - Displayed clear English message `"Database Disconnected"` over database-dependent dashboard cards whenever database connectivity is down.

#### **v2.11.9** - 2026-08-08
- **Direct Remote Server Integration for Dashboard Public & Private Room Metrics & Versions**:
  - Fixed Public and Private room counters on the dashboard to fetch real-time data directly from the active connected Matrix server using Synapse Admin API `/_synapse/admin/v1/rooms`.
  - Ensured room stats immediately reflect the active target server connected via SSH, Agent, or API, avoiding stale local fallback cache.
  - Enhanced Element Web and Synapse version detection to query live server HTTP endpoints, SSH file paths (`/var/www/element/version`), and Python packages for maximum accuracy.
  - Synchronized both REST stats API (`/api/matrix/stats`) and real-time WebSocket metrics streams (`sendMetrics`) with active connection profiles.

#### **v2.11.8** - 2026-08-08
- **Custom Step-by-Step Element Web & Synapse Server Update Workflows with Rollback Storage**:
  - Implemented step-by-step bash update pipeline for **Element Web Only** option (GitHub API lookup, tarball download/extract, config preservation, rollbacks to `/opt/matrix_rollback`, nginx reload).
  - Implemented step-by-step bash update pipeline for **Synapse Server Only** option (`homeserver.yaml` timestamped backup to `/opt/matrix_rollback`, `apt update`, service stop, `apt install --only-upgrade -y matrix-synapse-py3`, service & worker restart, and health check curl loop).
  - Ensured `/opt/matrix_rollback` directory is automatically created and populated for all rollback snapshots.
  - Piped clean execution log output directly to the UI terminal panel.

#### **v2.11.6** - 2026-08-08
- **Remote Script Updates via install-matrix-stack.sh Menu Pipeline**:
  - Updated Element Web & Synapse update workflow to execute `install-matrix-stack.sh` menu choices on the active connected server.
  - Mapped **Element Web Only** target to Maintenance & Updates (Item 6) -> Updates (Item 1) -> Update Element Web (Item 3) -> Use latest (Item 2).
  - Mapped **Synapse Server Only** target to Maintenance & Updates (Item 6) -> Updates (Item 1) -> Update Matrix Synapse (Item 2) -> Confirm (y).
  - Mapped **Both Components** target to execute both Element Web and Synapse update menu sequences sequentially.
  - Cleaned ANSI formatting and piped live terminal output directly to the UI execution stream.

#### **v2.11.5** - 2026-08-08
- **Connected Server Telemetry Sync & Dynamic Profile Stats Refetch**:
  - Updated backend `/api/matrix/stats` endpoint to query active connection profile metrics and services instead of local system metrics when connected to a remote server.
  - Ensured active connection profile switches trigger full stats reset and telemetry refetch for the target connected server.
  - Preserved all dashboard card structures, titles, and layout containers during shimmer state so real server metrics load smoothly.

#### **v2.11.4** - 2026-08-08
- **Dashboard Shimmer Persistence on Server Fetch & Service/Connection Cards Shimmer & Version Badges**:
  - Persisted shimmer loading state across all dashboard cards during stats refresh and boot until live connected server telemetry is set, preventing momentary display of stale/cached values.
  - Added shimmer loading placeholder states for Matrix Connection Details and Linux Service Statuses cards.
  - Added prominent New Update Available badges directly in Element Web and Synapse Server card title headers whenever installed version is behind latest release.

#### **v2.11.3** - 2026-08-08
- **Dashboard Cards Shimmer Loading State on Data Fetch & Manual Refresh**:
  - Added continuous shimmer loading effect across all Dashboard metric cards (CPU, RAM, Disk, Active Users, Rooms, Media Size, Reports) during initial data load and manual stats refresh.
  - Added matching shimmer loading placeholder cards for Element Web and Synapse Server version cards during data refresh.

#### **v2.11.2** - 2026-08-08
- **Fix Terminal Console Uncaught ReferenceError TDZ Initialization Crash**:
  - Resolved JavaScript runtime crash `Uncaught ReferenceError: Cannot access 'je' before initialization` occurring when loading or opening the web console.
  - Moved `isRtl`, `hasWriteAccess`, and `safeConfirm` function declarations to the top of the `TerminalPanel` component body to prevent Temporal Dead Zone (TDZ) scoping errors in bundled JS.

#### **v2.11.1** - 2026-08-08
- **Terminal Log Stream Localization & High-Contrast Light Mode Styling**:
  - Synced terminal execution logs in the "Update Element & Synapse" tab with active panel language selection (English vs Persian/Arabic).
  - Enhanced terminal console container with a solid dark slate CLI style (`bg-slate-950`) and vivid bright green and white log text (`text-emerald-400`, `text-emerald-300`, `text-white`), ensuring high contrast and legibility in Light Mode.

#### **v2.11.0** - 2026-08-08
- **Element Web & Synapse Server Update & Rollback Suite**:
  - Added "Update Element & Synapse" item to Quick Tasks in `TerminalPanel.tsx` with selection between updating Element Web, Synapse Server, or both.
  - Implemented mandatory pre-update backup snapshot creation with 1-click rollback functionality in case of issues.
  - Added real-time Dashboard version metric cards in `App.tsx` displaying installed Element and Synapse versions with active pinging update indicators when newer releases are available.
  - Created REST API backend endpoints under `/api/matrix/element-synapse/*` for checking version releases, managing backup snapshots, and triggering update and rollback operations.

#### **v2.10.7** - 2026-08-08
- **Complete Removal of VPN Management Feature**: Completely removed the VPN Management UI tab, controls, sub-tabs, and state management from `src/components/ReportingPanel.tsx`, as well as all backend REST API endpoints under `/api/vpn-clients/*` and `/api/vpn-proxy/*` from `server.ts`.

#### **v2.10.6** - 2026-08-08
- **Installer Script Display Version Update**: Modified `setup-panel.sh`, `matrix-installer.sh`, and `install-matrix-stack.sh` to output `latest` instead of numeric version labels in installation banners and logs.

#### **v2.10.5** - 2026-08-08
- **SSTP Master Systemd Unit Provisioning**: Resolved `Unit sstp-client.service could not be found` by automatically provisioning both template (`/etc/systemd/system/sstp-client@.service`) and master daemon (`/etc/systemd/system/sstp-client.service`) units on target remote Linux servers.
- **Automatic Protocol Port Mapping**: Updated profile creation forms to automatically set default protocol ports (SSTP: 443, WireGuard: 51820, OpenVPN: 1194, L2TP: 1701, PPTP: 1723, V2Ray: 443, etc.) while allowing user customization.
- **Remote Target VPN Profile Execution**: Guaranteed all VPN connection profiles, SSTP connections, start/stop actions, status checks, and journalctl log retrievals execute exclusively on the selected target remote server via WebSocket tunnel.

#### **v2.10.4** - 2026-08-07
- **Target Server Execution Plane Enforcement**: Guaranteed all VPN and SSTP connection profiles run commands exclusively on the selected target remote server via WebSocket tunnel.
- **Removed Local Hardcoded Mocks**: Eliminated mock assigned IP address generators and fake disconnected/connected state overrides.
- **VPN Connection Editing Support**: Added full profile editing functionality (ویرایش) for SSTP and client connection profiles, pre-filling server parameters and certificate configurations.
- **Remote Server Diagnostic Header**: Added a real-time target server diagnostic box displaying remote hostname, OS distribution, user permissions, sstpc binary paths, and systemd units.

#### **v2.10.3** - 2026-08-07
- **Remote WebSocket Execution**: All SSTP operations (installation, configuration, start/stop/restart, status checks, and journalctl log retrieval) execute on target remote servers using the existing WebSocket agent connection without SSH.
- **Per-Connection Systemd Template Engine**: Implemented per-profile SSTP connection architecture utilizing `/etc/sstp-client/<profile>.conf` configurations and dynamically generated `/etc/systemd/system/sstp-client@.service` template units.
- **Robust Connection State Verification**: Status checks verify actual PPP interface creation (`ip addr show | grep ppp`), IP address assignments, peer endpoints, and `/proc/net/dev` network traffic stats.
- **Full API & UI Integration**: Provided dedicated REST endpoints for SSTP metadata detection, profile management, service control, and connection actions, alongside SSTP SSL/TLS and PPP parameter forms in the UI modal.

#### **v2.10.2** - 2026-08-07
- **HttpOnly Cookie Persistence**: Integrated 90-day long-lived persistent JWT session tokens stored in HttpOnly cookies with `SameSite=Strict` and `Secure` flags when 'Remember Me' is enabled.
- **LocalStorage Token Elimination**: Security hardened so JavaScript cannot access persistent tokens via `document.cookie` or `localStorage`.
- **Automatic Cookie Authentication**: Express backend middleware (`cookie-parser`) and React frontend (`credentials: 'include'`) seamlessly verify active sessions via HttpOnly cookies.

#### **v2.10.1** - 2026-08-07
- **Remote Server Command Execution**: All VPN package status queries, installations, uninstalls, systemd service controls, and journalctl log retrievals now execute on the selected target remote server via active SSH/Tunnel connection.
- **Remote VPN Client Profiles**: Client profile connections, disconnects, and configuration deployments now execute directly on the target remote server filesystem (`/etc/wireguard`, `/etc/openvpn`, `/etc/xray`).
- **Dynamic Target Resolution**: Backend automatically resolves `targetId` from Connection Manager profiles, falling back to local host execution if target is local host.

#### **v2.10.0** - 2026-08-07
- **Login 'Remember Me' Toggle**: Added a persistent 'Remember Me' control on the login screen with dynamic multi-language wording (Persian, English, Spanish, Arabic, German, Russian).
- **Backend Long-Lived Token & Session**: Integrated 30-day extended JWT session tokens and backend session persistence when 'Remember Me' is enabled.
- **In-House Offline Vector CAPTCHA**: Confirmed zero internet dependency for login security using an in-house Node.js SVG vector CAPTCHA generator that functions completely offline without external APIs.

#### **v2.9.9** - 2026-08-07
- **Installer & Packages Accordion Refactor**: Converted the card grid into a collapsible accordion list view with search and category filtering, expanding to reveal executable paths, config directories, systemd units, and quick terminal commands.
- **Light Theme Compatibility**: Audited and updated all VPN sub-tabs, cards, badges, connection tables, and modals to support both Light and Dark modes dynamically.
- **Real System Control & Override State**: Verified backend systemctl and process status integration with persistent package overrides.

#### **v2.9.8** - 2026-08-07
- **VPN Management Section in Reports & Admin**: Re-added a dedicated 'VPN' section with sub-tabs for Installer & Packages, Daemon Control, and Connection Profiles.
- **Remote Installation Stream Modal**: Added support for installing client protocols (WireGuard, V2Ray/Xray, L2TP, SSTP, PPTP, OpenVPN, Tailscale) on remote target servers with a live log modal that can be minimized and re-opened.
- **Daemon & Connection Controls**: Enabled starting, stopping, restarting, and viewing system journal logs for VPN daemons, as well as importing and connecting to VPN profiles.
- **Localization & Language Sync**: All messages, UI elements, and modal labels respect active language settings without Persian hardcoding.

#### **v2.9.7** - 2026-08-07
- **Tabbed Navigation Interface**: Re-architected the VPN & Proxy suite into 6 clean, dedicated sub-tabs (`VPN Clients`, `Proxy Services`, `Server Daemons`, `Users`, `Connection Profiles`, `Routing & Anti-Lockout`), eliminating visual clutter.
- **SSTP Package Installation Resolution**: Implemented automatic PPA repository addition (`ppa:sstp-project/sstp`) for Ubuntu/Debian target nodes when installing `sstp-client`.
- **Complete English Localization**: Translated all UI labels, action buttons, status messages, modal forms, and notification alerts from Persian to English.
- **Mock Data Purge**: Removed hardcoded mock client connections and proxy user accounts, ensuring real system state is fetched from target nodes.
- **Relocated Direct Panel Route Tester**: Moved the 'Test Direct Panel Route' button and latency diagnostic panel to the bottom of the Routing & Anti-Lockout tab.

#### **v2.9.5** - 2026-08-07
- **Dropdown VPN Client Interface**: Replaced the 10-card grid with a clean dropdown menu and quick selection pills, eliminating visual clutter.
- **Remote Target Connection Execution**: Integrated target connection selector (`Local Panel Server`, `WebSocket Agent`, `SSH`) so VPN client installation and management commands run on the chosen remote server connection.
- **Enhanced Detailed Status Card**: Displays package installation state, service status, system boot status, logs, and action buttons in a focused detail card.

#### **v2.9.4** - 2026-08-07
- **Fix CheckCircle Icon Import**: Added missing `CheckCircle` import from `lucide-react` in `ReportingPanel.tsx`, fixing the black screen `Uncaught ReferenceError: CheckCircle is not defined` crash.
- **Fix PostgreSQL devRes Type**: Corrected device query row extraction in `server.ts`.

#### **v2.9.3** - 2026-08-07
- **Target Linux OS & Package Manager Auto-Detection**: Automatically reads `/etc/os-release` on target server to detect distribution (Ubuntu, Debian, CentOS, Rocky, AlmaLinux, Fedora, Arch, openSUSE) and package manager (`apt`, `dnf`, `yum`, `pacman`, `zypper`).
- **VPN Clients UI Section**: Added a dedicated "VPN Clients" section listing 10 Linux VPN client packages (WireGuard, OpenVPN, Tailscale, ZeroTier, OpenConnect, StrongSwan, SoftEther, SSTP, L2TP, PPTP).
- **Package & Service Lifecycle Control**: Added interactive controls for Installation, Uninstallation, Service Start/Stop/Restart, and Boot Auto-start toggle over existing agent WebSocket connection.
- **Import/Export & Logs Viewer**: Added configuration file import modal for `.conf` / `.ovpn` files and systemctl/journalctl log viewer modal for each package.
- **VPN/Proxy Refactored UI**: Fixed card overflows for `Disconnected` and `SSTP` tags, polished light & dark theme styling, and harmonized button contrast.

#### **v2.9.2** - 2026-08-07
- **Real Target Server Driver**: Implemented real system calls (`sstpc`, `xl2tpd`, `pptp-linux`, `connect-proxy`) to configure and control VPN client connections directly on the destination server.
- **Automated Package Installer**: Added backend detection and automated package manager execution (`apt-get` / `yum` / `apk`) to install missing protocol dependencies on the server.
- **Real Latency & Interface Monitoring**: Integrated system ping latency measurement and network interface tunnel IP inspection.
- **UI Overflow Resolution**: Fixed badge and text wrapping in connection cards preventing `SSTP` and `Disconnected` tags from clipping outside container bounds.

#### **v2.9.1** - 2026-08-07
- **Windows-Like VPN Connections**: Added full support for creating and managing VPN client profiles with custom usernames, passwords, server hosts, ports, and optional PSK keys.
- **SSTP Certificate Bypass Option**: Introduced 'No SSL Certificate Required' toggle for SSTP connections matching Windows native VPN behavior.
- **One-Click Connect/Disconnect**: Added interactive stateful Connect and Disconnect handlers with live latency and tunnel IP feedback.
- **Complete Theme Compatibility**: Refactored entire VPN & Proxy management UI components, forms, modals, tables, and buttons to adapt dynamically between Light and Dark themes.

#### **v2.9.0** - 2026-08-07
- **VPN Protocols Management**: Added support for PPTP, L2TP/IPsec, and SSTP (SSL VPN) protocols with start/stop/restart service controls and active connection monitoring.
- **Proxy Services Management**: Integrated SOCKS5 and HTTP/HTTPS proxy management with authentication controls and service toggles.
- **Target Server Automated Package Setup**: Added automated target server deployment workflow for `ppp`, `pptpd`, `xl2tpd`, `sstp-server`, and `dante-server` with real-time deployment logs modal.
- **Anti-Lockout Route Protection**: Implemented direct static bypass route protection and panel route testing tool to guarantee panel access remains uninterrupted.
- **User Credentials Management**: Added user account management for VPN/Proxy access with protocol permissions and static IP assignments.

#### **v2.8.4** - 2026-08-06
- **Persistent Login Security Errors & State**: Persisted login username, security error messages, localized error state, CAPTCHA requirement, and account lockout countdown timers in `localStorage` so errors and security state do not reset on page refresh.
- **Raven Logo 106px Size**: Resized the login card Raven logo to 106px x 106px.
- **Password Focus Eye Animation**: Refined raven eye animation logic so eyes close exclusively when the password field is focused, and stay open when focused on the username field or elsewhere.

#### **v2.8.3** - 2026-08-06
- **Multilingual Login Error Messages**: Added backend support in `server.ts` for localized login error responses across Persian (fa), English (en), Spanish (es), Arabic (ar), German (de), and Russian (ru).
- **Dynamic Language Sync for Login Errors**: Configured `App.tsx` to automatically re-translate currently displayed login error messages in real-time when the user switches the UI language.
- **Localized CAPTCHA & Lockout Messages**: Formatted invalid CAPTCHA alerts, missing field prompts, max failed login attempts warnings, and account lockout timer banners according to active locale.

#### **v2.8.2** - 2026-08-06
- **Panel Security Rules & Lockout Configuration**: Added a dedicated "Panel Security & Lockout" sub-tab under Reports & Admin panel to configure automated account lockout rules, max failed login attempts, lockout duration, and CAPTCHA trigger policies.
- **Backend Brute-Force & Captcha Enforcement**: Implemented brute-force account lockout protection, SVG CAPTCHA challenge generation, and account unlocking tools in `server.ts`.
- **Raven Eyes Password Typing Animation**: Configured `RavenLogo` component eyes to close dynamically whenever the user types or focuses on the password field on the login card.
- **Enlarged Login Logo**: Scaled up the login card raven logo size from 56px to 86px with ambient glow effects.

#### **v2.8.1** - 2026-08-06
- **Room Card Action Loading Overlay**: Integrated a visual backdrop-blur loading overlay with spinning indicator and action status text directly over room cards during asynchronous room operations.
- **Action State Tracking**: Wrapped Auto-Join toggling (`handleToggleAutoJoinRoom`), Grant Room Administrator (`handleGrantRoomAdmin`), Room Shutdown/Deletion (`handleShutdownRoom`), and Power Level modifications (`handleSetPrivilegedUser`) with `roomActionLoading` state tracking.

#### **v2.8.0** - 2026-08-06
- **Mock Data Purge**: Cleaned out fake demo users (`@masoud:matrix.company.local`, `@alice:matrix.company.local`, `@bob:matrix.company.local`, `@welcome:matrix.company.local`) and demo rooms (`!room1:matrix.company.local`, `!room2`, `!room3`) from the panel database (`panel_data.json`).
- **Filtered User & Room Views**: Updated `/api/matrix/users` and `/api/matrix/rooms` endpoints in `server.ts` to strictly filter out mock/demo entries so that User and Room Management sections present only real users and rooms from the Synapse server and database.

#### **v2.7.9** - 2026-08-06
- **Assign Privileged Power Level Support**: Added full support for all power levels (100 Admin, 75 Senior Moderator, 50 Moderator, 25 Helper, 0 Default Member) as well as Custom numeric power levels (-100 to 100) in the "Assign Privileged Power Level" modal.
- **Backend Synapse API State Fix**: Populated default `m.room.power_levels` state content fields on `/api/matrix/rooms/power_levels` and added auto-join for target users so Synapse accepts power level modifications across all levels.

#### **v2.7.8** - 2026-08-06
- **Theme-Adapted Loading Overlay in Matrix Admin & Room Members Modal**: Fixed the full-page loading overlay displayed during Kick/Ban operations to adapt dynamically to the panel theme. In Light Mode, it uses a soft `slate-50` backdrop with `indigo-100` ring container and dark slate typography; in Dark Mode, it maintains a rich `slate-950` glass backdrop.
- **Visual Harmony**: Eliminated stark dark backdrop clashes in light mode, ensuring consistent typography contrast and smooth visual transitions.

#### **v2.7.7** - 2026-08-06
- **Full-Screen Matrix Admin Loading Overlay**: Added a full-page modal backdrop loading screen across the entire **Advanced Matrix User Configuration & Monitoring (Matrix Admin)** window during Kick or Ban execution in the Rooms List.
- **Window Close Protection**: Locked window dismissal (close button disabled) until the server responds to prevent interrupted requests or inconsistent states.

#### **v2.7.6** - 2026-08-05
- **Fixed Room Member Listing & Addition**: Removed the blanket `kickedUsersLogs` purge from `/api/matrix/rooms/:roomId/members` in `server.ts` that was preventing members from being added back to rooms or being accurately listed.
- **Fixed Kicked User First-Attempt Reappearance Bug**: Updated `handleRoomMemberAction` and `handleForceJoinMember` in `KetesaAdmin.tsx` so newly added members are preserved while kicked/banned users remain filtered out, avoiding Matrix state cache race conditions.
- **Direct Moderation Endpoints**: Added Synapse Admin API endpoints to `handleRoomKickOrBan` in `server.ts` for direct moderation execution.

#### **v2.7.5** - 2026-08-05
- **Interactive Pre-Uninstall Confirmation Prompt**: Moved the deletion confirmation check to the very top of `uninstall-panel.sh` before stopping systemd services or removing any files.
- **Fixed Pipe Input Reading (`/dev/tty`)**: Configured prompt reading directly from `/dev/tty` so executing via `curl -sSL ... | sudo bash` waits for explicit user typing (`DELETE`) before taking any action.

#### **v2.7.4** - 2026-08-05
- **Prevented Kicked Member Re-appearance**: Updated background member sync in `KetesaAdmin.tsx` to preserve optimistic removals and prevent stale Synapse `/members` responses from restoring kicked/banned users back into the UI.
- **Kicked Users Server Filtering**: Updated `/api/matrix/rooms/:roomId/members` in `server.ts` to purge recently kicked users stored in `kickedUsersLogs`, preventing stale Matrix room state cache from re-listing kicked members.

#### **v2.7.3** - 2026-08-05
- **Accelerated Kick & Moderation Execution**: Updated `handleRoomKickOrBan` in `server.ts` to guarantee admin join state and PL 100 before executing moderation actions, appending targeted `user_id` query parameters across Matrix CS API endpoints.
- **Optimistic UI Member Removal**: Enhanced `handleRoomMemberAction` in `KetesaAdmin.tsx` to optimistically remove kicked/banned members from the Room Members list modal state instantly without blocking user UI.
- **PostgreSQL State Synchronization**: Ensured `room_memberships` and `current_state_events` tables in Postgres reflect kicks and bans immediately alongside local state updates.

#### **v2.7.2** - 2026-08-05
- **Restored Room Members List Display**: Updated `/api/matrix/rooms/:roomId/members` endpoint in `server.ts` to utilize primary Synapse Admin State API (`/_synapse/admin/v1/rooms/<roomId>/state`), reliably retrieving active room members, display names, avatars, power levels, and roles regardless of bot membership.
- **Accelerated Initial Sync Speed**: Reordered event resolution in `/api/matrix/reports` to query PostgreSQL `event_json` table first (1ms resolution), bypassing blocking Synapse Admin API event retrieval loops.
- **Eliminated Race Conditions**: Updated `fetchRoomMembers` in `KetesaAdmin.tsx` with functional React state updaters for room member modals.

#### **v2.7.1** - 2026-08-05
- **Optimized Room Members API Endpoint**: Replaced heavy full room state retrieval (`/_synapse/admin/v1/rooms/<roomId>/state`) with lightweight targeted queries (`/state/m.room.power_levels` and Matrix `/joined_members`).
- **Restored Sync Performance**: Eliminates megabyte state payload downloads, drastically boosting response speed from 5+ seconds down to milliseconds.
- **Fixed Room Member Listing**: Restored proper member list parsing across Matrix Client `/joined_members`, Synapse `/members`, Matrix `/members`, Postgres `room_memberships`, and local DB fallbacks.

#### **v2.7.0** - 2026-08-05
- **Removed Ban Option from Room Members Modal**: Removed the Ban button from the active room member list in Modal View Members per user request.
- **Kicked Users Audit Logging**: Integrated automatic kick event logging in `handleRoomKickOrBan` (`server.ts`), capturing user MXID, display name, room ID/name, issuer, date/time, reason, last seen IP address, and User Agent from Postgres/Matrix database.
- **Kicked Users Management UI**: Added dedicated Kicked Users History modal in Room Management with search filter (by user, room, kicker, reason, IP), item removal, and full history purge capabilities.
- **Rooms Empty State UI Upgrade**: Redesigned the empty rooms list UI with a styled Hash icon card, bold Persian/English empty state headers, and descriptive guidance matching Reported Messages section.

#### **v2.6.9** - 2026-08-05
- **Synapse Room State Active Member Filter**: Updated `GET /api/matrix/rooms/:roomId/members` endpoint to prioritize Synapse Admin room state API (`/_synapse/admin/v1/rooms/<roomId>/state`) to extract exact active room membership states (`join` vs `leave` / `ban` / `invite`).
- **Purged Stale Room Members**: Fixed step 2 member mapping that was previously including historical or non-joined users, ensuring only active joined room members appear in View Members modal.
- **Enhanced Member Display & Search**: Updated Room Members modal to display user Display Name alongside MXID and enable searching by both Display Name and @mxid.

#### **v2.6.8** - 2026-08-05
- **Accurate Room Member Filtering**: Updated `/api/matrix/rooms/:roomId/members` endpoint to query active room memberships (`membership = 'join'`) via standard Matrix C2S `/joined_members` API, Synapse Admin API, and Postgres DB queries.
- **Excluded Non-Room Users & Ex-Members**: Filtered out left, kicked, invited, or banned users from appearing in active room member lists.
- **Modal On-Demand Live Refetching**: Updated room member modals in `KetesaAdmin.tsx` to always fetch live member data when opened and refresh after member management actions.

#### **v2.6.7** - 2026-08-05
- **Room Moderation Power Elevation**: Implemented `ensureAdminHasRoomPower` helper function to verify power levels (`m.room.power_levels`) and invoke `/make_room_admin` automatically if admin power level is below kick/ban threshold.
- **In-Memory Power Cache**: Added 5-minute TTL per-room caching to prevent redundant `make_room_admin` API calls.
- **Target Power Level Protection**: Prevented moderation actions on users holding equal or higher power level with clear UI error messaging (`Cannot moderate this user: they hold an equal or higher power level in this room.`).
- **Ban Confirmation & Reason Input**: Enforced clear ban confirmation dialog displaying target display name and MXID alongside optional reason parameter.
- **Instant Modal Refresh**: Re-fetches member list immediately after successful kick or ban action to update modal UI state seamlessly.

#### **v2.6.6** - 2026-08-05
- **Active Directory Tab Removal**: Completely removed the Active Directory Groups tab header and option from the Add Member room modal.
- **Simplified Direct Add Workflow**: Streamlined the Add Member modal layout to focus exclusively on direct user search and room joining.

#### **v2.6.5** - 2026-08-05
- **Active Directory Group Member Search Repair**: Upgraded `searchAdGroupMembersViaServerCmd` to resolve group DNs first before searching user `memberOf` or `member` attributes, fixing wildcard DN search errors in Active Directory.
- **Room AD Group Auto-Join Execution**: Reinforced `syncRoomWithAdGroups` with `forceUserJoinRoomInSynapse` helper to automatically provision accounts and join AD group members to Matrix Synapse rooms.
- **Direct User Modal Join Fix**: Fixed permissions and state synchronization in `/api/matrix/rooms/members/join` and `KetesaAdmin` `handleForceJoinMember`, ensuring clicking Add in Direct User List instantly joins the user to the room.
- **Installer Version Realignment**: Updated `setup-panel.sh` to re-extract and display the latest version v2.6.5 dynamically after repository checkout.

#### **v2.6.4** - 2026-08-05
- **Remote Server LDAP Command Query**: Implemented server-side `ldapsearch` command execution over SSH/Agent connection when managing remote Matrix servers, fixing `ECONNRESET` socket failures on AD group refresh.
- **Sync Interval Control Container Fit**: Re-architected Sync Interval (Mins) input control layout with flexible `min-w-0` constraints and responsive `xl:grid-cols-2` layout to prevent box overflow on responsive grid displays.
- **Installer Terminal Version Alignment**: Updated `setup-panel.sh` and `package.json` to dynamically reflect latest version `v2.6.4` during VPS installation.

#### **v2.6.3** - 2026-08-05
- **Expanded Add Member Modal Width**: Increased Add Member modal container (`Modal 5B`) width to `max-w-5xl` with vertical responsiveness (`max-h-[90vh]`) for improved readability and user experience.
- **Responsive 12-Column AD Grid Layout**: Re-organized Active Directory tab inside the modal into a responsive 12-column grid layout (`lg:col-span-7` group mapping list and `lg:col-span-5` auto-sync settings).
- **Enhanced Tab Visual Hierarchy**: Optimized scrollable list areas, border accents, and quick actions for AD group search and automatic background sync controls across both Light and Dark themes.

#### **v2.6.2** - 2026-08-05
- **Cache-Bypassing AD Group Fetching**: Added timestamp query parameter (`_t`) and `Cache-Control: no-cache, no-store` headers to `GET /api/matrix/ldap/groups` to prevent stale browser and proxy caching when clicking "Refresh AD Groups".
- **Interactive Refresh Toast Notifications**: Added user feedback via toast notifications on clicking "Refresh AD Groups" button to inform the user whether groups were fetched live from Active Directory or loaded from database.
- **Custom AD Group Creation Engine**: Added `POST /api/matrix/ldap/groups` backend endpoint and a quick-add button in the group selector search when typing a group name that isn't listed, allowing manual custom AD group registration.

#### **v2.6.1** - 2026-08-04
- **Normalized AD Auto-Sync Settings Parameters**: Aligned `enabled` and `intervalMinutes` state keys between React frontend and Express backend so toggle state and interval input save properly.
- **Fixed AD Sync Log Card Counter Rendering**: Mapped `roomsChecked` and `usersJoined` properties correctly in UI log display cards.
- **Graceful Unconfigured LDAP Notice**: Missing LDAP server URI configuration is handled as an informational notice rather than an error condition during group member sync.

#### **v2.6.0** - 2026-08-04
- **Critical Security Vulnerability Resolution**: Eliminated shell/command injection vulnerability in Active Directory user search by replacing string-interpolated python script execution (`python3 -c "..."`) with the native `ldapts` Node.js client and `escapeLdapFilterValue` sanitization.
- **Automatic AD Group Sync Background Scheduler**: Built a `node-cron` automated background scheduler (`setupAdSyncCronJob`) and sync engine (`runAllRoomsAdSync`) to periodically query Active Directory group memberships and synchronize room memberships.
- **AD Sync Management Endpoints**: Created `GET /api/matrix/ad-sync/settings`, `POST /api/matrix/ad-sync/settings`, `GET /api/matrix/ad-sync/logs`, and `POST /api/matrix/ad-sync/run-now` endpoints for managing sync settings and auditing logs.
- **AD Auto-Sync Controls & History UI**: Added an interactive AD Auto-Sync control card in `KetesaAdmin` with auto-sync toggle, interval input, instant manual execution button, and persistent sync log viewer.

#### **v2.5.9** - 2026-08-04
- **AD Group Auto-Join Rule Logic**: Configured mapped AD groups on rooms as persistent auto-join rules so any current or future user belonging to selected Active Directory groups automatically joins the room.
- **Member Sync & Auto-Join Execution**: Queries Active Directory and local database users belonging to selected AD groups, automatically joining them to both local room DB and Matrix Synapse server via Synapse Admin API.
- **Room Members API Integration**: Updated `GET /api/matrix/rooms/:roomId/members` to merge local DB joined members so AD auto-joined members immediately show in room details.

#### **v2.5.8** - 2026-08-04
- **Save & Join AD Group Members 404 & Sync Fix**: Fixed 404 error when saving AD groups to rooms by URL-encoding room IDs (`encodeURIComponent(roomId)`) in fetch requests.
- **Dynamic Room Database Record Creation**: Enhanced `POST /api/matrix/rooms/:roomId/ad-groups` in `server.ts` to automatically create/initialize room entries in `db.matrixRooms` for Synapse rooms, preventing "404 Room not found" errors.
- **Improved Modal Initialization**: Bound room dropdown "Add Member" button to `handleOpenAddMemberModal(r)` so that AD group list and current members are properly loaded when opening the modal.

#### **v2.5.7** - 2026-08-04
- **Automatic Live Active Directory Group Member Sync & Auto-Join**: Upgraded `POST /api/matrix/rooms/:roomId/ad-groups` to execute live LDAP member searches against Active Directory for selected groups.
- **Auto-Provision AD Group Users**: Automatically creates user accounts and joins all active members of selected Active Directory groups directly into the specified Matrix room.

#### **v2.5.6** - 2026-08-04
- **Active Directory Live Group & User Query Synchronization**: Built a multi-method AD query engine (supporting `python-ldap`, `ldap3`, and system `ldapsearch`) to query live groups, DNs, descriptions, and user counts directly from the connected Active Directory server.
- **Auto-Populate Active Directory Groups List**: The Add Member room modal now automatically loads real groups and member counts directly from the connected Active Directory instance configured in Control Hub.
- **Pre-fetch AD Groups on Modal Launch**: Automatically pre-fetches AD groups when opening the Add Member modal and binds selected AD groups to the room.

#### **v2.5.5** - 2026-08-04
- **Dynamic Control Hub LDAP/AD Configuration Integration for Group & User Loading**: Updated `GET /api/matrix/ldap/groups` and `parseLdapFromYaml` to prioritize live LDAP Server URI, Search Base DN, Bind Mode, Bind Account DN, and Bind Password directly from `homeserver.yaml`, `/etc/matrix-stack-ldap.conf`, and Control Hub Active Directory settings.
- **Purged Legacy Mock LDAP URIs**: Completely removed default `ldap.company.local` mock fallback URIs from client initial state, server endpoints, and Control Hub resolution logic.
- **Enhanced YAML Module Parser**: Upgraded `parseLdapFromYaml` with `js-yaml` object parsing for exact extraction of LDAP module configurations on target Synapse servers.

#### **v2.5.4** - 2026-08-04
- **Control Hub Active Directory Configuration Binding**: Updated `GET /api/matrix/ldap/groups` to fetch LDAP credentials and URI directly from Control Hub -> Active Directory settings, `homeserver.yaml`, and active connection parameters.
- **Removed Fake Fallback URIs**: Removed hardcoded placeholder URIs (`ldap://dc1.company.local:389`) and updated the modal banner to reflect actual Control Hub Active Directory server configuration.

#### **v2.5.3** - 2026-08-04
- **Active Directory Group Direct Fetch**: Added `GET /api/matrix/ldap/groups` API endpoint to fetch live security groups directly from the LDAP / Active Directory server.
- **Multi-Select AD Groups UI**: Replaced manual comma-separated text input in the Add Member modal with an interactive multi-select checkbox list featuring search filtering and user count badges.
- **Automatic Group Member Room Sync**: Updated `POST /api/matrix/rooms/:roomId/ad-groups` to automatically map selected AD groups and force-join all member users directly into the Matrix room.
- **Removed Simulation UI**: Completely removed test simulation forms and mock data logic, replacing them with direct Active Directory connection status indicators.
=======
## Current Panel Version: **v2.5.3** (Released: 2026-08-05)

### Changelog History

#### **v2.5.3** - 2026-08-05
- **Accurate Room Member Filtering**: Updated `/api/matrix/rooms/:roomId/members` endpoint to query active room memberships (`membership = 'join'`) via standard Matrix C2S `/joined_members` API, Synapse Admin API, and Postgres DB queries.
- **Excluded Non-Room Users & Ex-Members**: Filtered out left, kicked, invited, or banned users from appearing in active room member lists.
- **Modal On-Demand Live Refetching**: Updated room member modals in `KetesaAdmin.tsx` to always fetch live member data when opened and refresh after member management actions.
>>>>>>> 6caa423 (Fix room members list filtering to only show joined room members (v2.5.3))

#### **v2.5.2** - 2026-08-04
- **Clean Profile Card View**: Removed redundant top alert banner to keep the header and dashboard clean.
- **Connection Verification Loading State**: Updated status indicators to remain in an amber "Connecting" / loading state until server health is fully verified, preventing premature green "Connected" status.
- **Maintained Original Disconnection Card**: Retained the original remote connection profile status card with retry and profile switcher controls.

#### **v2.5.1** - 2026-08-04
- **Continuous Active Server Health Monitor**: Added automated periodic (10s) connection health polling for active server profiles (Local Sandbox, Remote SSH, or Agent).
- **Global Header Connection Status Badge**: Added active server connection status pill (Connected / Disconnected) to the sticky top header bar across all admin views.
- **Global Disconnection Alert Banner**: Implemented global warning banner across all pages when connection to the active server is interrupted with quick retry and connection manager navigation.

#### **v2.5.0** - 2026-08-04
- **Default SSL Installation (Port 8443)**: Configured `setup-panel.sh` to default installation to port `8443` with automatic self-signed SSL/TLS certificate generation and Nginx proxying.
- **Private IP Access Address Output**: Updated installation summary address output to display `https://<PRIVATE_IP>:<PORT>` using the target server's local private IP address.
- **WebSocket/WSS Tunnel Handshake Support**: Integrated Nginx WebSocket headers (`Upgrade`, `Connection "upgrade"`, timeout extensions) to ensure secure WebSocket tunnel handshakes over SSL.

#### **v2.4.9** - 2026-08-04
- **Installer Banner Formatting**: Updated `setup-panel.sh` banner to include explicit version tag and line breaks below developer info.
- **Neutral Domain Placeholders**: Replaced domain examples in `setup-panel.sh` prompt notice with generic `matrix.domain.local` and `matrixapp.domain.local` placeholders.

#### **v2.4.8** - 2026-08-03
- **Full Project State Restore**: Restored the complete codebase to commit `4440c7b` (v2.4.7) state per user request.
- **Pushed to Master**: Committed and pushed the restored state as a new commit directly to `master` and `main` branches.

#### **v2.4.7** - 2026-08-03
- **Service Discovery Logic Repair**: Fixed `/api/certificates/status` and `getDiscoveredDomains` to scan `/etc/nginx/` and `/etc/matrix/` recursively for active `server_name` directives, Synapse TLS paths, and certificate stores without crashing on non-zero exit codes.
- **High-Contrast Light Mode Button Styling**: Updated the Refresh Discovery button CSS in Light mode to a solid indigo background (`bg-indigo-600`) with crisp white text and icon for optimal legibility.
- **Fail-Safe Route Resilience**: Wrapped discovery subprocesses with `.catch()` fallbacks so `/api/certificates/status` always returns a valid JSON response instead of a 500 error.

#### **v2.4.6** - 2026-08-03
- **Removed Admin Panel SSL Proxy Section**: Removed the "Apply SSL to Admin Panel (Port 443 HTTPS Proxy)" section per user request.
- **Removed Self-Signed Certificate Generation Section**: Removed the "Generate Self-Signed Certificate" form per user request.
- **Complete Certificates Page UI Redesign**: Overhauled the Certificates page UI with a clean, modern layout, high-contrast theme support, interactive PEM inspector, discovered services cards, and target domain checklist.

#### **v2.4.5** - 2026-08-03
- **Custom Panel Upstream URL Field**: Added configurable `Panel Upstream / Backend Target URL` input in the SSL Management section (`http://127.0.0.1:3000` default, or custom `http://IP:PORT`).
- **Support for Separate Server Hosting**: Enabled securing the Admin Panel via SSL on the Matrix server even when the Raven Admin Panel is hosted on another server or port.
- **Smart Panel Upstream Validation**: Updated health check pipeline so that Nginx SSL reverse proxy for Raven Panel is created and sustained without rollback even when Raven Panel is hosted remotely or starting up.

#### **v2.4.4** - 2026-08-03
- **Fixed `conf_name is not defined` Runtime Error**: Properly escaped bash template string variable `\${conf_name}` in `ensureNginxSslSiteConfig` script generation to prevent Node.js execution crashes during SSL certificate deployment.
- **Comprehensive Nginx & Domain Auto-Discovery**: Expanded server block auto-discovery to scan all Nginx site configs matching `server_name`, ensuring all active domain names are discovered and listed in the Certificates dashboard even before SSL certificates are generated.
- **Fixed Shell Script Awk Command Parsing**: Fixed single-quote escaping in awk commands inside SSH discovery scripts (`awk '{print $2}'`) for accurate certificate path parsing.

#### **v2.4.3** - 2026-08-03
- **SSL Certificate Shell Execution & Exit Code Fix**: Resolved `Command failed with exit code 1` errors triggered during SSH command execution when Nginx site configs or SSL directories pre-existed or `grep`/`test` bash conditions evaluated to false.
- **Base64 SSH Configuration Writer**: Updated `writeConfigContent` SSH channel to transmit certificate and key files via base64 decoding, preventing quoting, multiline heredoc, and formatting syntax failures over SSH.
- **Smart HTTPS Health Check Resilience**: Enhanced health check pipeline with loopback `--resolve` fallbacks, `Host:` header requests, and verified status code handling when `nginx -t` syntax validation and `systemctl reload` succeed.

#### **v2.4.2** - 2026-08-03
- **Nginx Sites Configuration Synchronization**: Automatically updates domain `server_name`, `ssl_certificate`, and `ssl_certificate_key` paths across `matrix.conf`, `element.conf`, and `wellknown.conf` when Server Parameters or SSL Certificates are modified.
- **English SSL Error Localization**: Converted all SSL certificate inspection, verification, and deployment error messages and response feedback to standard English.

#### **v2.4.1** - 2026-08-03
- **SSL/TLS Certificate Auto-Discovery & Management**: Automatic discovery and scanning of Nginx sites and Synapse homeserver TLS configurations, extracting domain names, SANs, and certificate issuer details.
- **Dual Upload Mode Support**: Added combined PEM (Certificate + Key in one file) and separate (.crt & .key) file upload modes with interactive PEM inspection (`Inspect PEM`).
- **Warning Acknowledgement & Auto-Rollback**: Display of certificate validation warnings with an explicit user confirmation checkbox before re-applying, backed by an automated backup, test, and rollback pipeline.

#### **v2.4.0** - 2026-08-03
- **Web Console Update Matrix Panel Tab Auto-Selection**: Clicking the "Update Matrix Panel" button now automatically selects and displays the `panel-updates` tab above the terminal, highlighting the active tab and querying repository status.

#### **v2.3.9** - 2026-08-03
- **Panel Analytics Chart Tooltip High-Contrast Styling**: Created `CustomChartTooltip` component and enforced global CSS overrides for Recharts tooltips to ensure all text labels and values render in bright, bold, high-contrast colors on hover across Light and Dark themes in Panel Settings & Analysis.

#### **v2.3.8** - 2026-08-03
- **User Details Preferences UI Cleanup**: Removed Client Language selector, Messaging & Interaction Settings container, Element Web SettingsStore Precedence hierarchy box, interaction toggles (Send Read Receipts, Send Typing Notifications, Show Hidden Events, Show Stickers Button, WebRTC ICE Fallback), and Ignored Users section from the User Details Preferences modal.

#### **v2.3.7** - 2026-08-01
- **Installer Panel Version Display**: Added dynamic `PANEL_VERSION` extraction and display (`v2.3.7`) to `setup-panel.sh` ASCII banner and final installation report summary.
- **Terminal Environment Diagnostics**: Included OS name/release, hardware specs (CPU cores, RAM), target installation path, and active systemd daemon status in terminal installer output.
- **Enhanced Terminal Management Commands**: Added quick management command references for `journalctl` logs, `systemctl` service control, re-running setup, and uninstaller script execution.

#### **v2.3.6** - 2026-08-01
- **Unconditional Local Media Persistence Merging**: Fixed `GET /api/matrix/media` endpoint in `server.ts` to unconditionally merge items from `db.matrixMedia` into the returned media list, ensuring uploaded media files remain visible after server refetches.
- **Optimistic Media List State Integration**: Updated `handleUploadMediaFile` in `KetesaAdmin.tsx` to immediately prepend newly uploaded files to component state and refresh the list from server.
- **FileReader Asynchronous Handler & Input Value Reset**: Wrapped `reader.onload` async logic in a try-catch block and ensured input element value resets upon completion to allow uploading files seamlessly.

#### **v2.3.5** - 2026-08-01
- **Light Theme Adaptability for Media Cleanup**: Updated `Purge Media Older Than` and `Purge Media of Specific Domain` textboxes and containers to adapt dynamically to light mode with clean white/slate styling instead of hardcoded pitch-black background.
- **Stored Media List Refresh Button**: Fixed refresh button above Stored Media Files table by adding `isRefreshingMedia` state, spinning icon animation during fetch, active click scaling, disabled state while fetching, and toast notifications.
- **Full Light Mode Media Tab Styling**: Extended light theme support across media analytics widgets, format filter tabs, uploader/origin dropdowns, and search input.

#### **v2.3.4** - 2026-08-01
- **Eliminated Email & Phone List Flickering**: Removed redundant `fetchUserDetails` background network request after adding/removing email and phone addresses, preventing consecutive state updates and list flickering.
- **Seamless Array Merging**: Updated frontend handlers in `KetesaAdmin.tsx` to merge returned email and phone lists into existing component state using `Set` deduplication.
- **Server Default Email Preservation**: Enforced retention of default domain email along with newly added emails in server user details endpoint resolution.

#### **v2.3.3** - 2026-08-01
- **Contact Info Email & Phone Consolidation Fix**: Resolved issue where adding new emails caused previous emails to vanish and replaced them with default fallbacks by consolidating emails across Synapse Admin API, Postgres `user_threepids` table, and `db.matrixUsers` local storage.
- **Email & Phone Persistence**: Guaranteed local user object creation/update in `db.matrixUsers` and Synapse Admin API / `user_threepids` table updates when adding or removing emails and phones.
- **Optimistic State Integration**: Updated frontend email and phone handlers in `KetesaAdmin.tsx` to merge server response arrays into local UI state seamlessly.

#### **v2.3.2** - 2026-08-01
- **Atomic User Lock & Device Revocation**: When `locked: true` is set, the panel executes Step 1 (`PUT /_synapse/admin/v2/users/<url_encoded_user_id>` with `{"locked": true}`) and Step 2 (`GET /_synapse/admin/v2/users/<url_encoded_user_id>/devices` -> `POST /_synapse/admin/v2/users/<url_encoded_user_id>/delete_devices` with `{"devices": [...]}`) to immediately invalidate all active access tokens/sessions.
- **Reversible Unlock**: Setting `locked: false` performs Step 1 (`{"locked": false}`) without touching devices.
- **Dedicated Account Status Helpers**: Created `setSynapseUserLockStatus`, `setSynapseUserSuspendStatus`, and `setSynapseUserShadowBanStatus` functions using URL-encoded MXID parameters.

#### **v2.3.1** - 2026-08-01
- **Locked User Specification (`locked: true`)**: Reversibly blocks new logins (`M_USER_LOCKED` / 403) and invalidates existing access token sessions via `PUT /_synapse/admin/v2/users/<mxid>` while preserving user chat history and account data without deletion.
- **Suspended User Specification (`suspended: true`)**: Places the account in read-only mode, permitting login and message reading while blocking message posting, room joins, room creation, profile edits, and invitations via `PUT /_synapse/admin/v2/users/<mxid>`.
- **Shadow-Banned User Specification (`shadow_banned: true`)**: Silently suppresses message propagation to other room members while appearing normal to the user without raising error codes via `PUT /_synapse/admin/v2/users/<mxid>`.

#### **v2.3.0** - 2026-08-01
- **Flexible Multi-Key User Status Resolution**: Added `findUserRuleAndLocal` helper to resolve user status rules across all MXID variations (`@username:domain`, `username`, `@username`, normalized MXID) in `/etc/matrix-synapse/user_status_rules.json` and `db.matrixUsers`.
- **Locked User Filter Visibility**: Guaranteed that locked users appear in the "Locked" filter tab as well as in the "All Users" list view with full status badges.
- **Universal Un-Shadow-Ban & Unlock Fix**: Updated `/api/matrix/users/details/update` to update all key representations (`@username:domain`, `username`, `@username`, normalized MXID) simultaneously in `user_status_rules.json` and `db.matrixUsers`, ensuring un-shadow-banning clean updates allow users to send messages again.
- **Optimistic State Synchronization**: Updated `handleUpdateUserParams` in `KetesaAdmin.tsx` to match user status updates across all MXID representations in local state.

#### **v2.2.9** - 2026-08-01
- **User Management Filter Synchronization**: Updated `/api/matrix/users` endpoint to load user status rules from `/etc/matrix-synapse/user_status_rules.json` and Postgres `users` table columns (`locked`, `suspended`, `shadow_banned`).
- **User List Status Accuracy**: Guaranteed that users filtered by "Locked", "Suspended", "Shadow Banned", "Active", "Deactivated", and "Admins" appear accurately in their respective filter tabs.
- **Optimistic State Synchronization**: Updated UI `handleUpdateUserParams` to update both modal details and the main user list state immediately upon saving user status changes.

#### **v2.2.8** - 2026-08-01
- **Un-Shadow-Ban State Synchronization**: Updated `/api/matrix/users/details/update` to synchronize shadow ban status updates across Synapse Admin API (v2 and v1), PostgreSQL database `users` table (`shadow_banned`), Synapse Python rule configuration (`user_status_rules.json`), and panel local DB (`db.matrixUsers`).
- **User Details Shadow-Ban Visibility**: Added prominent live status badges (`👻 Shadow Banned`, `⏸️ Suspended`, `🔒 Locked`, `🛡️ Admin`) in the User Management details header and status cards for clear visual verification.
- **User Management Details UI Cleanup**: Removed deprecated "Disable Client-Side Password Change" flag from the user details modal and `handleUpdateUserParams` API handler.

#### **v2.2.7** - 2026-08-01
- **User Management Details UI Cleanup**: Removed deprecated flags ("Disable Client-Side Account Deactivation", "Erased", "Disable Client-Side Avatar Change") from the user details modal and cleaned up the `handleUpdateUserParams` API handler.
- **Active Directory Password Reset Guard**: Added `checkIsAdUser` helper and conditional UI logic to "Force Reset User Password". Active Directory users display a clear Persian notice stating that passwords must be changed in Active Directory with grayed-out disabled controls, while local users retain full password reset functionality for admins.

#### **v2.2.6** - 2026-08-01
- **In-Memory Native Node.js Crypto Verification**: Fixed SSL key matching error ("Private key does not match PEM certificate") by performing native in-memory validation using Node's `crypto` module (`crypto.createPrivateKey` & `crypto.X509Certificate`).
- **Zero Shell / SSH Escaping Issues**: Eliminates remote bash escaping failures, missing `csplit` container tools, and OpenSSL MD5 formatting discrepancies across RSA, ECDSA, EC, PKCS#1, PKCS#8, and fullchain certificate bundles.

#### **v2.2.5** - 2026-08-01
- **Universal Cross-Algorithm PEM Key Verification**: Created `verifyCertAndKeyMatch` helper in `server.ts` to extract and compare MD5 hashes of Public Keys from certificate and private key files using `openssl pkey / rsa / ec` commands. This supports ECDSA, EC (secp256r1/P-256), RSA 2048/4096, PKCS#1, PKCS#8, and multi-cert fullchain PEM bundles without false "Modulus mismatch" errors.
- **Informative Persian Error Diagnostics**: Replaced vague error messages with descriptive Persian messages explaining exact issues such as passphrase-encrypted private keys, key format errors, or public key mismatches.

#### **v2.2.4** - 2026-08-01
- **Remote Server PEM Deployment Pipeline**: Uploaded `.pem` certificate files and `.key` private key files are deployed directly to the target remote server where Matrix and Element are installed, populating both `/etc/nginx/ssl` and `/etc/letsencrypt/live/` directories with correct `chmod 600` permissions.
- **Dynamic Nginx Config & Standalone Handling**: Automatically scans `/etc/nginx/` on the remote server to update `ssl_certificate` and `ssl_certificate_key` in existing config files. If no existing Nginx config is found, auto-generates resilient server blocks tailored for standalone Matrix homeservers (proxying port 8008), Element web clients, or the Raven Admin Panel.

#### **v2.2.3** - 2026-08-01
- **Deep Target Server Domain Discovery**: Enhanced `getDiscoveredDomains` to run deep bash-level scanning directly on the connected remote server via `runServerCommand`. Discovers domains from active connection records, Let's Encrypt live folders (`/etc/letsencrypt/live/`), renewal configs, `certbot certificates` output, Nginx site configurations (recursively scanning all `/etc/nginx/` files), Subject Alternative Names (SANs) & Common Names (CNs) from x509 certs in `/etc/ssl/certs`, `/etc/nginx/ssl`, `/etc/matrix/ssl`, Synapse `homeserver.yaml`, `conf.d/*.yaml`, `matrix-stack.conf`, Element `config.json`, and system FQDN (`hostname -f`).
- **Multi-Location Certificate Status Check**: Updated `/api/certificates/status` to inspect certificate files across all standard server SSL paths (`/etc/nginx/ssl/`, `/etc/letsencrypt/live/`, `/etc/ssl/certs/`, `/etc/matrix/ssl/`) and Nginx `ssl_certificate` directives so existing valid or self-signed certs are properly detected instead of reported missing.
- **Universal Certificate Downloader**: Upgraded `/api/certificates/:domain/download` to search and serve SSL public certificates from any server path.

#### **v2.2.2** - 2026-08-01
- **SSL UI Light Textbox Backgrounds**: Transformed all text input boxes, PEM text areas, dropdowns, and target subdomain selection boxes in the SSL Certificate tab to bright, light, high-contrast background themes (white / slate-800) so they are easy to read and no longer dark/black.
- **Custom Domain Addition**: Added a custom domain input box (`+ افزودن`) allowing users to add any domain or subdomain to the target list manually.
- **Self-Signed CRT Generation & Download Fix**: Upgraded `handleDownloadCrt` to fetch `.crt` binary blobs via authenticated API calls and trigger native browser file download, as well as enabling direct text input for self-signed certificates.

#### **v2.2.1** - 2026-08-01
- **SSL Certificate Tab Black Screen Fix**: Added missing `Eye` icon import in `src/components/ConfigForms.tsx` to fix `Uncaught ReferenceError: Eye is not defined` when opening the SSL Certificates management view.

#### **v2.2.0** - 2026-08-01
- **Automated PEM & Key Inspection**: Created `/api/certificates/inspect-pem` to extract SANs, expiration date, wildcard status (`*.domain.com`), and verify modulus matching between certificate and private key.
- **Multi-Domain & Wildcard SSL Batch Deployment**: Added `/api/certificates/apply-multi-domain` endpoint to automatically deploy a single PEM / Wildcard certificate to all discovered subdomains (Matrix, Element, Sliding Sync, etc.) and configure Nginx SSL site blocks in a single operation.
- **Admin Panel SSL Proxying (Port 443 -> Port 3000)**: Added dedicated Nginx SSL proxy configuration (`/etc/nginx/sites-available/raven-panel.conf`) to secure the Admin Panel itself over HTTPS port 443 with WebSocket/HMR reverse proxying.
- **Subdomain Selection & Checklist UI**: Enhanced Certificate Management with interactive checkboxes, Select All/Deselect All options, live inspection feedback, and automatic domain matching.

#### **v2.1.0** - 2026-08-01
- **Certificate Management Engine & UI**: Integrated complete SSL/TLS Certificate Management into Control Hub with automatic domain discovery from `homeserver.yaml`, `server_name.yaml`, and Nginx site configs. Supports PEM/Key upload, modulus validation via OpenSSL, self-signed cert generation, backup/rollback, and Nginx reload.
- **Active Logged-In User Sessions 3-Dots Dropdown**: Replaced inline action buttons on Active Logged-In User Sessions cards and client device cards with a sleek, compact 3-dots (`MoreVertical`) popup dropdown menu supporting elevated z-index (`z-30`) and light/dark theme adaptive styling.
- **Real-Time Dock & Action Session Verification**: Configured global fetch `401` response interceptor, pre-navigation dock verification in `App.tsx` (`handleViewChange`), and 10-second background verification pulse. Clicking any dock item or panel control instantly verifies session validity and kicks revoked users to the login screen.
- **Solid ASCII Raven Installer & Credits**: Updated `setup-panel.sh` and `uninstall-panel.sh` with a solid block ASCII Raven banner, developer credit (`Masoud Shahbazi` - `https://www.linkedin.com/in/masoudshahbazi/`), and default owner credentials (`admin`/`admin`).

#### **v2.0.8** - 2026-07-31
- **Active Logged-In User Sessions 3-Dots Dropdown**: Replaced inline action buttons on Active Logged-In User Sessions cards with a sleek, compact 3-dots (`MoreVertical`) popup menu supporting elevated z-index (`z-30`) and light/dark theme adaptive styling.
- **Instant Dock & Interactivity Session Verification**: Implemented a global fetch response interceptor (`401` handler) and pre-navigation verification in `App.tsx` (`handleViewChange`). Clicking any dock item or triggering any panel interaction immediately validates session validity and kicks revoked users to the login screen.

#### **v2.0.7** - 2026-07-31
- **Z-Index Stacking Elevation**: Dynamically updated active RBAC operator card container styling with `relative z-30 overflow-visible` when the 3-dots actions menu is toggled open, preventing menu truncation or clipping under cards below.
- **Adaptive Light Theme Dropdown Styling**: Replaced dark fixed slate background with responsive light/dark background themes (`bg-white/95` with slate border in light mode, `bg-slate-900/95` in dark mode) for flawless readability across light and dark modes.

#### **v2.0.6** - 2026-07-31
- **Instant Kicked User Logout**: Configured active token and user invalidation middleware along with a periodic background auth check in `App.tsx`. When a user session is terminated/kicked, the target client is immediately thrown out of the panel and redirected to the login screen.
- **Active System Operators Overflow Fix**: Added responsive flex wrapping, text truncation, and container bounds to the RBAC Active System Operators cards to prevent items from leaking outside the card container.
- **3-Dots Operator Actions Menu**: Replaced static inline action buttons (Edit Permissions, Change Password, Delete User) with a sleek, compact 3-dots popup menu button (`MoreVertical`) with backdrop overlay support.

#### **v2.0.5** - 2026-07-31
- **Active Sessions Card Overflow Fix**: Completely overhauled the Active Panel User Sessions card layout with responsive flex wrapping, text truncation, and tight badge spacing to prevent key action buttons and role tags from leaking outside the card container.
- **Online-Only Active Session Filtering**: Updated the Active User Sessions list to display exclusively logged-in users with active panel sessions instead of all registered database users.
- **Force Logout / Kick Session Support**: Added a Force Logout ('Kick') action button for administrators to terminate and invalidate active user sessions directly from the Session Panel (`POST /api/sessions/kick`).
- **Save Buttons Styling Refinement**: Applied explicit bold white text (`text-white font-bold`) to both Session Settings and Role Timeout Matrix save buttons.

#### **v2.0.4** - 2026-07-31
- **All Active Panel User Sessions**: Expanded the Current Active Session card in Reports & Admin -> Session Panel to list all registered panel users with role badges, live session status indicators, and individual activity/idle timers.
- **Panel User Password Management**: Added secure password change modal and backend API endpoint (`PUT /api/users/:id/password`) allowing administrators to change passwords for any panel user with strong random password generator support.
- **RBAC Password Action Button**: Integrated password change key buttons directly into the Role-Based Access Control (RBAC) panel user list items.

#### **v2.0.3** - 2026-07-31
- **Real-time Remote Server WebSocket Connection Monitor**: Integrated central WebSocket connection state tracking (open, message, error, close, offline events) for the active connected server profile.
- **Dynamic Disconnect Banner UI**: Updated the top 'Connected Server Profile' header card to automatically turn red, show a pulsing red indicator dot, display a 'DISCONNECTED' badge and lost-connection message whenever the central WebSocket connection drops. Restores back to the original green profile theme as soon as connectivity re-establishes.
- **Retry & Reconnect Action**: Added a retry button in the disconnected header banner to immediately attempt WebSocket reconnection and telemetry re-sync.

#### **v2.0.2** - 2026-07-31
- **Fixed Permission Matrix Save Handler**: Resolved role conflicts in `PUT /api/users/:id/permissions` and modal save logic so saving custom permission matrix updates custom permissions seamlessly without triggering 'Error saving permissions'.
- **Custom Role Dropdown UX Refinement**: Removed the persistent inline custom permissions box when selecting 'Custom' role in user creation form; selecting 'Custom' now immediately pops up the matrix table modal and closing or cancelling resets the role selector back to 'Viewer'.

#### **v2.0.1** - 2026-07-31
- **Compacted RBAC Edit Button UI**: Adjusted padding, font sizing, and label text (`ویرایش دسترسی`) on operator table rows so the button fits neatly without cluttering the user management table.
- **Fixed Permission Matrix Save Handler**: Resolved `Error saving permissions` issue when saving custom modal permissions by invoking `onUpdateUserPermissions` directly and safeguarding default Owner/admin role restrictions.

#### **v2.0.0** - 2026-07-31
- **Updated RBAC User Button**: Replaced the 'Toggles' button with 'ویرایش دسترسی‌ها' (Edit Permissions) accompanied by a `ShieldCheck` icon to provide an intuitive access control editing interface for operators.
- **Added Role Quick Presets**: Integrated quick template preset controls (`👑 Full Admin`, `🛡️ Moderator`, `👁️ Viewer`) directly inside the permission matrix modal to effortlessly populate operator permissions.
- **Role Preset Alignment**: Standardized fallback default permission states for standard roles (`Owner`, `Super Admin`, `Moderator`, `Viewer`) when opening custom permission matrices.

#### **v1.9.9** - 2026-07-31
- **Fixed Default Tab Selection in Matrix Admin**: Resolved issue where custom role users with specific permissions (e.g., Report Management) were initially shown the User Management tab on component mount before redirecting.
- **Dynamic Initial Tab Resolution**: Implemented `getInitialTab` lazy initialization in `KetesaAdmin.tsx` and `getInitialSubTab` in `ReportingPanel.tsx` so active tabs directly compute based on granted custom permissions on the very first render.
- **RBAC Modal Permissions Persistence**: Reinforced sequential error handling and target ID resolution for custom user permissions matrix saving.

#### **v1.9.8** - 2026-07-31
- **Fixed Permission Matrix Save Logic**: Enabled automatic role escalation to `'Custom'` when updating granular user matrix and added ID/username target resolution fallback so user permissions save seamlessly without logical errors.
- **Resolved Modal Exception Flow**: Chained `onChangeUserRole` and `onUpdateUserPermissions` calls sequentially with proper async error handling to eliminate false positive error toast notifications.

#### **v1.9.7** - 2026-07-31
- **Fixed Custom User Permissions Saving**: Updated `checkPermission` middleware in `server.ts` and `PUT /api/users/:id/permissions` endpoint so custom granular permissions (`manage_rbac`) can be modified and saved without 403 Forbidden errors.
- **Resolved 403 Forbidden Network Chain**: Updated token verification in `App.tsx` so expired/invalid tokens trigger `handleLogout()` and clear stale credentials rather than throwing chained 403 network errors.
- **Added Array Type Guards on Fetches**: Added `Array.isArray()` checks to connection, user, log, and backup data fetches to prevent `TypeError: data.find is not a function` when backend returns error JSON.
- **Google Fonts Vazirmatn Import**: Added Google Fonts CDN import in `index.css` to prevent browser WOFF2 font decoding and OTS conversion errors.

#### **v1.9.6** - 2026-07-31
- **Fixed Spatial Dock Truncation**: Restored full dock item visibility (Dashboard, Homeserver, Matrix Admin, Web Console, Panel Settings & Analysis, Connections) by dynamically merging missing dock items with any saved localStorage orders.
- **Dock Hover Label Update**: Updated dock tooltip on hover over the Analytics icon to display "Panel Settings & Analysis".

#### **v1.9.5** - 2026-07-31
- **Renamed Analytics Tab**: Renamed the "Analytics" tab to "Panel Settings & Analysis" (پنل تنظیمات و آنالیز) in all header titles and translations.
- **Strict UI Localization for Custom Role**: Removed hardcoded Persian "(سفارشی)" text when English UI language is selected; now strictly renders based on the active language (`lang`).
- **Instant Custom Permissions Modal Trigger**: Selecting the "Custom" role in the user creation form or user list table now instantly pops up the Permission Matrix Table modal.
- **Granular RBAC Permission Enforcement**: Connected `currentUser.permissions` to `SpatialDock` navigation items, view routes in `App.tsx`, `/api/auth/login` & `/api/auth/verify` backend routes, and sub-tabs in `KetesaAdmin.tsx` so restricted custom operators can only access authorized views and tabs.

#### **v1.9.4** - 2026-07-31
- **Light & Dark Theme Table Modal for Custom Permissions Matrix**: Replaced simple inline listing and modal with a high-style, responsive table modal compatible with both light and dark themes.
- **Dynamic Language Localization (English & Persian)**: Ensured all custom permission items in the matrix strictly render in English when the UI language is English, and in Persian when Persian is active.
- **Module Category Tabs & Quick Search**: Integrated filter pills (All Modules, Messaging & Rooms, User Management, Control Hub & Infrastructure, Security & Settings) and live search bar.
- **Panel Settings & Analysis Tab**: Renamed the "Analytics" tab in `ReportingPanel.tsx` to "Panel Settings & Analysis" (پنل تنظیمات و آنالیز).

#### **v1.9.3** - 2026-07-31
- **Granular Custom Role-Based Access Control (Custom RBAC Matrix)**: Added a new `Custom` role option in the RBAC management system, enabling administrators to configure explicit feature access toggles for each panel operator.
- **14 Granular Feature Toggles**: Implemented 14 customizable toggles covering: Sending Direct & Room Messages, Viewing Matrix Rooms, Room Menu Actions & Moderation, Reported Messages, Matrix User Management Tabs, Add/Edit Connections, All Control Hub Views, Matrix Stack Initial Settings, Interactive Cleanup Controls, Stored Media Files (Download/Delete), Role-Based Access Control (RBAC), Security & Config Audit Logs, System Performance Analysis, and Quick Tasks execution.
- **Interactive Permissions Matrix & Modal**: Created an inline permissions matrix during user creation and an interactive modal drawer for managing active operators' custom access rights.
- **Server & API Persistence**: Updated `/api/users`, `/api/users/:id/role`, and `/api/users/:id/permissions` backend endpoints to store, update, and audit log custom user permissions.

#### **v1.9.2** - 2026-07-31
- **Server Config Audit Refresh UI & Spinner Feedback**: Upgraded the Refresh button in the Server Configuration & File Audit Log section with interactive loading state, animated spinner, disabled state during fetch, minimum visual delay, and toast notification confirmation.
- **Table Loading Indicator**: Integrated dedicated loading indicator row inside the config log table while fetching remote audit items.

#### **v1.9.1** - 2026-07-31
- **Server-Wide Config Audit Logging**: Instrumented `logConfigChange` and `writeConfigContent` to automatically capture any file modifications across Control Hub, Matrix Users, Matrix Rooms, Auto-Join Policies, Rate Limits, and Server Configuration.
- **Granular Field & File Tracking**: Records operator username, file path, parameter name, old value, new value, file byte size, execution logs, and delta summary whenever changes are committed.

#### **v1.9.0** - 2026-07-31
- **Config Change Audit Logs Tab (لاگ کانفیگ)**: Created dedicated "لاگ کانفیگ" (Config Change Logs) section in the Analytics/Reporting panel to track every server and file change made through the panel or destination host.
- **Granular Change Logging & File Delta**: Integrated `/api/logs/config` backend endpoint and hooked into `writeConfigContent` to record target server file paths, modified parameters/keys, old vs new values, delta summaries, operator usernames, and timestamp details.
- **Export & Detail Modal**: Provided CSV export, HTML report downloads, search filter, action type filter, file filter, and full change detail modal dialog.

#### **v1.8.43** - 2026-07-31
- **Global Container Styling Harmonization**: Harmonized Stored Media table, Registration Tokens, and User Management list containers to `bg-black/25` with `border-white/5` border styling, matching the Message Sending Rate Limits card design.
- **Table Header Theme Refinement**: Adjusted table header backgrounds across admin panels to subtle `bg-black/20`.

#### **v1.8.42** - 2026-07-30
- **Dynamic MXC URI Domain Resolution**: Fixed local content records in Media Repository (`/api/matrix/media`) to derive MXC URIs directly from the uploader's domain (`@user:domain`) or active server name (`matrix.company.local`), eliminating incorrect fallback to default `matrix.org` domains.
- **Remote Content Isolation**: Maintained accurate `media_origin` domains for remote federated media cache entries.

#### **v1.8.41** - 2026-07-30
- **Strict User Language Isolation**: Ensured `/api/matrix/smtp/test` strictly prioritizes the explicit user interface language (`lang`) over browser `Accept-Language` headers, guaranteeing error toasts and messages match the active panel language mode (English vs Persian).
- **Clean Remote Diagnostic Output Extraction**: Updated error message parsing in Node backend to cleanly isolate remote Python execution outputs following `SMTP_TEST_ERROR:`.

#### **v1.8.40** - 2026-07-30
- **Localized Error & Status Messages**: Updated `/api/matrix/smtp/test` endpoint and Python SMTP test script to detect user language preference (`lang`) and return localized English messages when English mode is selected.
- **English Connection Diagnostics**: Formatted connection diagnostic advice (e.g. Connection Refused / Timeout / Available Ports) in English when the user interface language is set to English.
- **Git Continuous Integration & Push**: Configured remote origin with authentication token to enable continuous commit and push workflows.

#### **v1.8.39** - 2026-07-30
- **Fixed Synapse Config Rollback Error**: Removed unrecognized `force_tls` option from `homeserver.yaml` serialization in `server.ts`. Synapse's YAML parser rejects unknown keys, which previously caused `systemctl restart matrix-synapse` to fail and roll back settings.
- **Valid Email Configuration Schema**: Kept supported Synapse fields (`require_transport_security`, `enable_tls`) and cleaned up empty fields (`smtp_user`, `smtp_pass`, `client_base_url`).

#### **v1.8.38** - 2026-07-30
- **Automated Port Diagnostic Scanner**: Added real-time TCP socket scanner to Python test script in `server.ts` that tests ports `25`, `465`, `587`, and `2525` upon encountering `[Errno 111] Connection Refused` or `Timeout`.
- **Persian Diagnostic Guidance**: Formatted human-readable Persian messages indicating active ports on the target domain (`mail.company.com`) or local host (`127.0.0.1`), enabling administrators to fix port mismatches immediately.

#### **v1.8.37** - 2026-07-30
- **Base64 Python Script Execution**: Encoded Python test dispatch payload into Base64 (`python3 -c "import base64; exec(...)"`) in `server.ts`, preventing shell quote conflicts and `SyntaxError: unexpected character after line continuation character` errors over SSH / Remote Agent tasks.
- **Safe Password & String Escaping**: Used `JSON.stringify` for Python variable definitions so passwords containing special characters (e.g. `!`, `$`, quotes) are safely handled.
- **SSL Context Handling**: Added SSL context configuration (`ssl.CERT_NONE`) to the Python smtplib dispatcher for smooth compatibility with custom/internal mail servers.

#### **v1.8.36** - 2026-07-30
- **Authentication Token Fix for SMTP Test**: Updated `handleTestSmtp` in `ConfigForms.tsx` to retrieve authentication token with fallbacks (`authToken`, `admin_token`, `token`, `matrix_auth_token`), fixing `401 Unauthorized` errors when testing SMTP email dispatch.
- **Expanded Synapse SMTP Support**: Integrated full email parameters in `server.ts` configuration reader/writer and UI forms: `SMTP_ENABLE_NOTIFS`, `SMTP_REQUIRE_TLS` (`require_transport_security`), `SMTP_ENABLE_TLS` (`enable_tls`), and `SMTP_CLIENT_BASE_URL`.
- **Enhanced SMTP Gateway UI**: Added quick port selection badges (587 STARTTLS, 465 SSL/TLS, 25 Plain, 2525 Alt), toggle switches for TLS/STARTTLS enforcement, and email notification controls in `ConfigForms.tsx`.

#### **v1.8.35** - 2026-07-30
- **SMTP Test Response Safety**: Enhanced response parsing in `handleTestSmtp` (`ConfigForms.tsx`) to check for `Content-Type: application/json` before calling `res.json()`, preventing `SyntaxError: Unexpected token '<'` if non-JSON responses or 404 HTML fallback pages are returned.
- **Server Restart & Route Verification**: Restarted Node development server process so the new `/api/matrix/smtp/test` endpoint is live and serving POST requests cleanly.

#### **v1.8.34** - 2026-07-30
- **SMTP Gateway Test Email Dispatcher**: Added an interactive test email panel in the SMTP Email Gateway section allowing administrators to enter a recipient address and trigger an immediate test email.
- **Real Email Delivery API**: Integrated a dedicated backend API route (`/api/matrix/smtp/test`) utilizing `nodemailer` (for local container connections) and Python `smtplib` (for remote SSH/agent nodes).
- **Comprehensive Diagnostics**: Displays real-time delivery status, message IDs, TLS handshake confirmations, and exact error responses directly in the UI.

#### **v1.8.33** - 2026-07-30
- **Configuration Backups Relocation**: Moved the "Configuration Backups & Rollback" list and instant rollback controls from Network Listener into the dedicated "Backup & Snapshots" tab in Control Hub (`ConfigForms.tsx`).
- **Network Listener Redirect Notice**: Replaced the rollback section in Network Listener with a notice card advising users to visit the Rollback & Backup tab with a single click if configuration issues occur.
- **Unified Recovery Workspace**: All homeserver.yaml snapshots, manual config/DB backups, JSON backup uploads, and automated scheduler configurations are now consolidated into a single recovery workspace.

#### **v1.8.32** - 2026-07-30
- **Relocate Backup & Snapshot UI**: Transferred the entire Backup & Snapshot management UI from the Analytics/Reports page (`ReportingPanel.tsx`) into a dedicated tab in Control Hub on the Homeserver configuration page (`ConfigForms.tsx`).
- **Redundancy Cleanup**: Removed the redundant backup view from `ReportingPanel.tsx` and wired up all backup triggering, disk storage paths, automated cron job schedulers, JSON backup imports, and restore modal workflows directly to main application state.
- **Full Functional Continuity**: All backup routines, REST endpoints, and system restoration processes remain intact without backend changes.

#### **v1.8.31** - 2026-07-30
- **Remove Redundant Matrix Users Section**: Removed the "Matrix Users" tab and registration form from Control Hub in the Homeserver configuration page.
- **Streamlined Workflow**: User registration is handled exclusively via "Register New User" in Matrix Admin.

#### **v1.8.30** - 2026-07-30
- **Allow Custom Homeserver URL Toggle**: Updated title to "Allow Custom Homeserver URL in Element Web (disable_custom_urls)".
- **Toggle Inversion Logic**: Inverted state semantics so ON permits users to specify custom homeserver URLs (`disable_custom_urls: false`), and OFF locks the homeserver field to the server domain (`disable_custom_urls: true`).

#### **v1.8.29** - 2026-07-30
- **Allow Public Account Registration**: Updated title to "Allow Public Account Registration" with clear description of allowed vs locked behavior.
- **Element Client Lock Synchronization**: Integrated `disable_registration` in Element Web's `config.json` with the `REGISTRATION_ENABLED` setting so turning off registration disables account creation directly on the Element Web client.

#### **v1.8.28** - 2026-07-30
- **Registration & Presence Toggle Switch Conversion**: Transformed "Public Account Registration" and "Presence System Tracking" controls from drop-down selectors into smooth, animated toggle switches in the Policy section.
- **Harmonized Card Background Styling**: Updated all policy card backgrounds to `bg-black/25` with `border-white/5` to match the exact background aesthetic of the Message Sending Rate Limits card.

#### **v1.8.27** - 2026-07-30
- **Server Config Synchronization**: All toggle switches in the Policy (Limits & Policies) tab now accurately activate/deactivate based on current server config state upon load and tab navigation.
- **Dynamic Policy Refreshing**: Added automatic re-fetching of policies when navigating to the Policies tab.
- **Unified Profile Policy Binding**: Client profile edit states (display name & avatar) are synchronized with Synapse server policy settings.

#### **v1.8.26** - 2026-07-30
- **Policy Relocation**: Removed "Send Typing Notifications", "Transmit Read Receipts", "Allow Display Name Changes", and "Allow Avatar Picture Changes" options from the Client Defaults tab and relocated them to the Limits & Policies (Policy) tab.
- **Toggle Switch Standardization**: Converted all four relocated options into modern, smooth animated toggle switch controls.
- **Unified Policy Grid**: Integrated all policy controls into a responsive 2-column policy grid layout with clean Persian/English localization.

#### **v1.8.25** - 2026-07-30
- **Policy Toggles Grid Redesign**: Re-architected all policy switches under the Limits & Policies tab into a responsive 2-column grid layout.
- **Toggle Switch Controls**: Converted the "Lock Homeserver URL in Element Web" (disable_custom_urls) and "Enable User Directory Search" controls into modern toggle switches instead of plain checkboxes.
- **Clean Localization**: Removed hardcoded slash-separated Persian text in English mode; text now renders purely in English when English is active, and switches to Persian when Persian/RTL language is selected.

#### **v1.8.24** - 2026-07-30
- **Element Web Homeserver URL Lock Policy**: Added a dedicated control ("Lock Homeserver URL in Element Web") under the Limits & Policies tab.
- **Element Web Config Sync**: When enabled, sets `disable_custom_urls: true` in Element Web's `config.json` so the "Sign into your homeserver" URL field is locked to the configured server address, preventing users from changing or connecting to external Matrix servers.

#### **v1.8.23** - 2026-07-30
- **Codebase Revert to v1.8.18**: Reverted all code and backend configuration handling back to commit `55b7d7ce35be2b609873e39d3789c67ed24f14b3` (v1.8.18) as requested.

#### **v1.8.18** - 2026-07-29
- **Strict English & Persian Modal Localization**: Fixed English text string in the room inspection security modal to ensure no Persian phrases appear when language is set to English.
- **Owner Role Exclusive Inspection**: Restricted room inspect capability exclusively to users with the 'Owner' role across Room Management, Chat Inspector, and Reports.

#### **v1.8.17** - 2026-07-29
- **Owner-Only Room Inspection & Security Modal**: Added mandatory confirmation warning modal when inspecting Matrix rooms, alerting the Owner that joining logs their account presence to all room members.
- **Confirmation Input Validation**: Added confirmation text input requirement (`تایید` / `INSPECT`) to unlock the final room inspect action button.
- **Attention Shake Animation & High Contrast Warnings**: Implemented a gentle shake effect on validation errors along with red privacy notice highlights.

#### **v1.8.16** - 2026-07-29
- **Dedicated RoomCreationBlocker Module (`on_create_room`)**: Implemented official Synapse `on_create_room` third-party callback in standalone `room_creation_blocker.RoomCreationBlocker` module.
- **Universal Auto-Installation**: Automatically creates `/opt/synapse-modules/room_creation_blocker.py` and syncs to all Python site-packages/dist-packages on destination Synapse servers without hardcoding or path conflicts.
- **Dynamic Module Registration**: Adds module to `modules:` in `homeserver.yaml` when room creation is disabled and removes it when room creation is permitted.
- **HTTP 403 (M_FORBIDDEN) Response**: Non-admin room/space creation attempts are cleanly rejected with HTTP 403 `M_FORBIDDEN` error directly from Synapse.

#### **v1.8.15** - 2026-07-29
- **Synapse UserFlagsModule Room Creation Policy Hook**: Implemented room creation policy enforcement directly inside `matrix_user_flags_module.UserFlagsModule` using the `user_may_create_room` callback.
- **HTTP 403 (M_FORBIDDEN) Denial**: When room creation is disabled in panel policy, non-admin users attempting to create any room type (Public, Private, or Space) receive an HTTP 403 `M_FORBIDDEN` error directly from Synapse.
- **YAML Cleanup**: Completely removed invalid `enable_room_creation` parameter from `homeserver.yaml` and `conf.d/*.yaml` files.
- **User Status Rules Sync**: Persists policy state in `/etc/matrix-synapse/user_status_rules.json` under `__global_policies__.roomCreationDisabled`, updates module Python code on disk, and automatically restarts Synapse.

#### **v1.8.14** - 2026-07-29
- **Permit Room Creation Policy Toggle**: Converted "Permit Room Creation" into an isolated toggle switch controlling `enable_room_creation: true/false`.
- **Targeted Key Synchronization & Service Restart**: Synchronizes `enable_room_creation` across `/etc/matrix-synapse/homeserver.yaml` and `/etc/synapse/conf.d/` files and triggers an automatic Synapse restart and health check upon save.

#### **v1.8.13** - 2026-07-29
- **Strict Key-Isolated Toggle Updates**: The "Allow Users to Change Display Name" toggle exclusively updates `enable_set_displayname: true/false` in `/etc/matrix-synapse/homeserver.yaml` and configuration files. The "Allow Users to Change Avatar" toggle exclusively updates `enable_set_avatar_url: true/false` without cross-modifying other settings.
- **Homeserver.yaml Sync & Restart**: Automatically applies updates directly to `/etc/matrix-synapse/homeserver.yaml` at root level (indentation 0) and restarts the Synapse service upon saving.

#### **v1.8.12** - 2026-07-29
- **Independent Display Name & Avatar Policy Controls**: Separated profile policy controls into two independent toggles: "Allow Users to Change Display Name" (controlling `enable_set_displayname`) and "Allow Users to Change Avatar" (controlling `enable_set_avatar_url`).
- **Targeted Key Synchronization**: Updating either policy independently modifies the corresponding YAML key across `/etc/synapse/conf.d/display_name.yaml` and `/etc/matrix-synapse/homeserver.yaml` and triggers automatic Synapse service restarts on save.

#### **v1.8.11** - 2026-07-29
- **Dual Config Source File Indication**: Updated the "Config Source Files" description under the Display Name Policy toggle to explicitly list both `/etc/synapse/conf.d/display_name.yaml` and `/etc/matrix-synapse/homeserver.yaml`.

#### **v1.8.10** - 2026-07-29
- **Homeserver.yaml Policy Synchronization**: Ensured `enable_set_displayname` and `enable_set_avatar_url` are updated at the root level (indentation 0) directly in `/etc/matrix-synapse/homeserver.yaml` when saving policy changes in the panel.
- **Automated Service Restart**: Confirmed Synapse Matrix service automatically restarts after saving policy changes, followed by health status verification.

#### **v1.8.9** - 2026-07-29
- **Root-Level Display Name & Avatar Policy Enforcement**: Configured `enable_set_displayname` and `enable_set_avatar_url` at the root level (indentation 0) in `/etc/synapse/conf.d/display_name.yaml` and main `homeserver.yaml`.
- **Synchronized Policy Updates**: Updated policy API handlers to read, write, and synchronize both profile restriction keys (`enable_set_displayname` and `enable_set_avatar_url`) across all Synapse configuration files.

#### **v1.8.8** - 2026-07-29
- **Isolated Backup Directory (`/etc/synapse/config-backups/`)**: Changed backup directory for all Synapse config backups to a dedicated folder outside `conf.d/` so Synapse won't load backup files as active configurations.
- **Automatic Conf.d Backup Migration**: Created `migrateOldConfDBackups` helper that automatically moves any existing `.bak*` or `.bak` files from `/etc/synapse/conf.d/` and `/etc/matrix-synapse/conf.d/` into `/etc/synapse/config-backups/` without deleting them.

#### **v1.8.7** - 2026-07-29
- **Display Name Target Path Update**: Set target override file to `/etc/synapse/conf.d/display_name.yaml` across backend discovery and frontend configuration form.
- **Multi-Config File Synchronization**: Updated API handler to synchronize `enable_set_displayname` across all existing Synapse configuration files in `/etc/synapse/conf.d/*.yaml` and `homeserver.yaml` to guarantee Synapse respects the disabled state without config file override conflicts.

#### **v1.8.6** - 2026-07-29
- **Server Route Refresh & 404 Resolution**: Restarted dev server process to register Express routes (`/api/matrix/config/display-name-policy`) and resolve 404 HTML fallback errors.
- **English API Response Standardization**: Converted remaining Persian fallback strings in API success and error handlers to English.
- **Form State Flow Verification**: Confirmed that toggling the "Allow Users to Change Display Name" switch updates form state locally without triggering immediate popups until "Save & Apply Policies" is clicked.

#### **v1.8.5** - 2026-07-29
- **I18n & Multi-language Cleanup**: Replaced hardcoded Persian text in Display Name Policy controls, labels, and modals with standard English panel UI strings.
- **Light/Dark Theme Compatible Modal**: Styled the service restart confirmation modal using `isLightMode` awareness for seamless contrast and matching design language across light and dark themes.
- **Deferred Save & Restart Workflow**: Updated the toggle button so flipping "Allow Users to Change Display Name" only updates local form state; clicking "Save & Apply Policies" prompts the confirmation modal if policy changes requiring a Synapse restart were made.
- **Robust Content-Type & JSON Error Handling**: Added response `content-type` verification to prevent `Unexpected token '<'` syntax errors when network or non-JSON error pages are returned.

#### **v1.8.4** - 2026-07-29
- **Config Discovery Engine**: Implemented discovery function that scans all `*.yaml` files in `/etc/synapse/conf.d/` in alphabetical order to identify the true source of truth file defining `enable_set_displayname`, falling back to `homeserver.yaml` or creating `/etc/synapse/conf.d/zz-display-name.yaml`.
- **API Endpoints**: Added `GET /api/matrix/config/display-name-policy` and `POST /api/matrix/config/display-name-policy` with timestamped file backup (`<file>.bak.<timestamp>`), syntax validation using `js-yaml`, `systemctl restart matrix-synapse` service restart, and health-check polling against `GET https://matrix.company.local/_matrix/client/versions`.
- **UI Switch & Confirmation Dialog**: Added "Allow Users to Change Display Name" toggle switch in "Limits, Rates & Retention Policies" displaying source file name, confirm dialog before toggling, and disabled loading state during service restart and health check.

#### **v1.8.3** - 2026-07-29
- **Empty Default Avatar MXC URL**: Cleared default Avatar MXC URL in Control Hub Synapse Server Notices configuration form and backend handlers so it remains empty by default.
- **Removed Server Notice Config Button from User Management**: Removed the redundant Server Notice Config button from the User Management section header, consolidating configuration strictly inside the Control Hub.

#### **v1.8.2** - 2026-07-29
- **Control Hub Synapse Server Notices Integration**: Transferred Synapse Server Notices configuration UI (`/etc/matrix-synapse/conf.d/server_notices.yaml`) into the Control Hub section on the homeserver page.
- **Default Synapse Configuration Values**: Configured default parameters: Config File Location `/etc/matrix-synapse/conf.d/server_notices.yaml`, System Sender Display Name `🚨 Administrator 🚨`, System Sender Localpart `server`, Notice Room Name `System ℹ️`, Avatar MXC URL `mxc://subdomain.company.com/media_id...`, and Auto-Join Notice Room enabled (`true`).
- **Auto-Apply Defaults On First Send**: Updated the Send Server Notice broadcast flow so that on first notice attempt, the system verifies Synapse configuration existence and automatically sets and saves the default configuration to Synapse before broadcasting if missing.

#### **v1.8.1** - 2026-07-29
- **Simplified Send Server Notice Broadcast Modal**: Streamlined notice broadcast modal by removing extra formatting options (bold, italic, code, quote), emoji picker popover, voice note recorder, and presets for a clean, focused user experience.
- **Fixed 500 Error on Media Attachment Broadcast**: Increased express body-parser size limit to 50MB and added native SSH/curl media upload pipeline to Synapse Media Repository for remote VPS connections, resolving upload 500 Internal Server Errors.

#### **v1.8.0** - 2026-07-29
- **Rich Media & File Attachment Support**: Upgraded the Send Server Notice Broadcast modal to support file attachments (photos, documents, audio, video).
- **Synapse Media Repository Upload Pipeline**: Media attachments are uploaded to Synapse's Media Repository (`/_matrix/media/v3/upload`), generating native Matrix `mxc://` URIs and constructing structured `m.image`, `m.audio`, `m.video`, or `m.file` notice events.
- **Voice Note Recording**: Integrated live audio voice recorder with timer display and native WebM/OGG voice note support.
- **Formatting, Emojis & Notice Templates**: Added Markdown formatters (bold, italic, code, quote, alert), an emoji picker popover, and quick preset notice templates (System Maintenance, Security Alert, Feature Release).

#### **v1.7.9** - 2026-07-29
- **Server Notices File Persistence Fix**: Enhanced configuration saving so that `/etc/matrix-synapse/conf.d/server_notices.yaml` is automatically created if not present or merged with updated parameters if existing.

#### **v1.7.8** - 2026-07-29
- **Server Notices Configuration UI**: Added dedicated Synapse Server Notices Config modal in User Management to view and configure `server_notices.yaml` parameters (`system_mxid_localpart`, `system_mxid_display_name`, `system_mxid_avatar_url`, `room_name`, `auto_join`).
- **Server Notice Broadcast & Batch Selection Controls**: Integrated user selection checkboxes, select-all controls, and a batch action toolbar into the User Management table for broadcasting official server alert messages directly to selected users or all registered users.
- **Unconfigured Notice Redirect**: Automatically checks if `server_notices.yaml` is configured and prompts/redirects the admin to the configuration modal prior to sending notices.

#### **v1.7.7** - 2026-07-28
- **Fix Infinite Panel Update Loop**: Refactored `/api/system/update/check` so that update flags are calculated strictly when `commitsBehind > 0`. This eliminates the infinite update prompt loop after updating.
- **Dynamic Panel Version Detection**: Updated version checking to read `src/version.ts` dynamically from disk to ensure immediate consistency post-update.
- **Auto-Join Deletion Fix**: Fixed 500 error on `/api/matrix/auto-join-rooms/delete` by safely initializing `auditLogs` and normalizing room identifier strings (removing extra quotes, aliases, or formatting).
- **Multi-Config Auto-Join Synchronization**: Updated `saveSynapseAutoJoinRooms` to sync and overwrite `auto_join_rooms` across all `conf.d` and `config.d` configuration files (`auto_join_rooms.yaml`, `00_auto_join.yaml`) as well as `homeserver.yaml`.

#### **v1.7.6** - 2026-07-28
- **Auto-Join Management Modal**: Added a dedicated Auto-Join Config Management Modal allowing administrators to view all room entries configured in Synapse `auto_join_rooms` files and remove any specific entry regardless of whether the room currently exists.
- **Backend Deletion Endpoint**: Created `POST /api/matrix/auto-join-rooms/delete` to support removing single target room entries or batch deleting orphan entries.
- **Orphan Room Purging**: Added automated detection for orphan entries (rooms deleted from Matrix but remaining in config files) with a single-click "Purge Orphan Rooms" feature.

#### **v1.7.5** - 2026-07-28
- **Exact YAML Auto-Join Format**: Configured `saveSynapseAutoJoinRooms` to generate exact `auto_join_rooms` list formatting with double quotes matching `#<room_name>:<domain>` (e.g. `"#bun:chat.company.com"`).
- **Domain & Room Alias Resolution**: Added `formatAutoJoinRoomIdentifier` and `getHomeserverDomain` helpers to construct full Matrix room aliases from selected room aliases/names and the connected homeserver domain.
- **KetesaAdmin Frontend Sync**: Updated `handleToggleAutoJoinRoom` and `isRoomAutoJoin` to pass room names/aliases and match auto-join room badges.

#### **v1.7.4** - 2026-07-28
- **Synapse Config Multi-Directory Support**: Updated `saveSynapseAutoJoinRooms` and `getSynapseAutoJoinRooms` to read and write `auto_join_rooms` across all potential Synapse configuration directories (`/etc/matrix-synapse/conf.d`, `/etc/matrix-synapse/config.d`, `/etc/synapse/conf.d`, `/etc/synapse/config.d`, and `homeserver.yaml`).
- **SSH Remote Directory Auto-Creation**: Enhanced `writeConfigContent` in `server.ts` to run `mkdir -p` on the target directory prior to writing config files over SSH, preventing missing directory errors.
- **Frontend Authorization & Error Handling**: Updated `handleToggleAutoJoinRoom` in `KetesaAdmin.tsx` to safely fallback to stored authentication tokens and display detailed backend error responses.

#### **v1.7.3** - 2026-07-28
- **Git Update Check Resilience**: Enhanced `/api/system/update/check` to execute `git fetch --all --prune`, dynamically resolve target remote references (`origin/master`, `origin/main`, `FETCH_HEAD`), and detect new commits/versions by comparing commit counts, commit SHAs, and remote `PANEL_VERSION`.
- **Synapse Auto-Join Rooms Feature**: Added `/api/matrix/auto-join-rooms` and `/api/matrix/rooms/:roomId/auto-join` backend endpoints to configure `auto_join_rooms` in Synapse (`homeserver.yaml` and `conf.d/auto_join_rooms.yaml`), automatically joining every registering/logging-in user.
- **Room Management UI Dropdown Item & Badge**: Added "Set as Auto-Join Room" toggle action in the 3-dot room menu in `KetesaAdmin.tsx` alongside an explicit "Auto-Join" badge indicator on room cards.

#### **v1.7.2** - 2026-07-28
- **Preferences account_data Construction Bugfix**: Updated `buildFullAccountData` in `KetesaAdmin.tsx` to include `language` and `sendReadReceipts` in `im.vector.web.settings`, preserving user language and read receipt preferences alongside overrides and settings objects.

#### **v1.7.1** - 2026-07-28
- **Version Changelog Header White & Bold Styling**: Enforced explicit `text-white` and `font-extrabold` typography styling on `Panel Version Changelog & Release History` title and `Build Date` label inside Light mode catalog header container.

#### **v1.7.0** - 2026-07-28
- **Install Button Logic Correction**: Fixed "Install Update" button behavior when no updates are available, disabling the button and preventing invalid modal triggers upon click.
- **Update Modal Theme Synchronization**: Transformed "Update & Data Protection" modal styling with full `isLightMode` theme awareness, eliminating black background contrast issues and ensuring high-contrast readable text in light mode.
- **Offline Backup Import Integration**: Added backend `/api/system/update/backup-import` endpoint and frontend file upload trigger, allowing administrators to upload JSON backup files and restore connection profiles and user databases at any time.
- **Console Log Box Position & Version History Header**: Relocated `git-updater@matrix-panel:~` console log box above Version Catalog in Panel Updates tab and styled "Panel Version Changelog & Release History" header text bold and white in Light Mode.

#### **v1.6.9** - 2026-07-28
- **Direct & Group Rooms Chat History Inspector Fix**: Resolved issue where inspecting a room's chat timeline displayed no messages.
- **Admin & Token User Auto-Join**: Fixed room join permissions in `/api/matrix/rooms/:roomId/messages` to force-join both the configured admin user and active token identity before requesting room history.
- **PostgreSQL `event_json` Fallback Engine**: Added seamless database fallback querying the Postgres `event_json` table when Synapse CS API returns empty event chunks or authorization errors.
- **Normalized Timeline Events**: Standardized mapping for text messages, media attachments, encrypted notices, stickers, and room state membership events.

#### **v1.6.8** - 2026-07-28
- **Element Web SettingsStore Precedence Verification**: Confirmed and documented that Element Web (`matrix-react-sdk`) resolves settings using hierarchical level precedence: `DEVICE (browser localStorage) > ROOM-ACCOUNT > ROOM > ACCOUNT (server account_data) > CONFIG > DEFAULT`.
- **Theme Listener Exception**: Documented why `theme` updates immediately in real-time (via `ThemeWatcher`'s direct listener on `m.account_data`) while other settings are evaluated by `SettingsStore.getValue` on client initialization.
- **Fresh Device / Incognito Session Behavior**: Verified that on fresh browser profiles/devices without local `mx_setting_*` keys in `localStorage`, Account-level `account_data` settings set by the Admin Panel apply as intended upon client launch.
- **Preferences UI Guidance Enhancement**: Refined the Preferences UI banner in `KetesaAdmin.tsx` with explicit information regarding `DEVICE` level precedence and `ACCOUNT` level sync scope.

#### **v1.6.7** - 2026-07-28
- **Element Web Account Data Audit**: Conducted detailed technical audit of key names and execution scopes in Matrix `account_data` for Element Web (`im.vector.web.settings` and `m.ignored_user_list`).
- **Real-Time vs Launch Sync Indicators**: Added visual sync badges to the Preferences UI distinguishing real-time sync settings (`theme`) from client launch / hard refresh settings (`sendReadReceipts`, `sendTypingNotifications`, `MessageComposerInput.showStickersButton`, `language`).
- **Deprecated Setting Cleanup**: Cleaned up legacy/deprecated client keys (`sidebarShowShortcuts` & `breadcrumbs`) to align with modern Element Web release capabilities.
- **Client Storage & Sync Guidance**: Added notice explaining DEVICE-level browser localStorage precedence over ACCOUNT-level `account_data`.

#### **v1.6.6** - 2026-07-28
- **Structured Preferences UI**: Transformed the Raw Account Data section in User Details into a structured Preferences UI with dedicated controls for Theme (`light`, `dark`, `system`) and Language (`en`, `fa`, `ar`, etc.).
- **Interactive Toggle Switches**: Implemented toggle switches for `sidebarShowShortcuts`, `sendReadReceipts`, `sendTypingNotifications`, `showHiddenEventsInTimeline`, `MessageComposerInput.showStickersButton`, `breadcrumbs`, and `webRtcAllowIceFallback`.
- **Ignored Users Tag Manager**: Added multi-tag manager for `m.ignored_user_list.ignored_users` with format validation (`@user:server.com`) and instant user removal.
- **Two-Way State Synchronization & JSON Modal**: Added an "Edit as JSON" modal dialog for direct raw `account_data` editing with JSON validation and non-standard enum warnings, maintaining full two-way binding with Matrix `account_data` PUT API endpoints.

#### **v1.6.5** - 2026-07-28
- **User Media Resolution via Admin API & Postgres**: Updated `/api/matrix/users/details` to fetch user uploaded media via Synapse Admin API (`/_synapse/admin/v1/users/<mxid>/media`) and Postgres `local_media_repository` table with case-insensitive and wildcard match (`WHERE LOWER(user_id) = LOWER($1) OR LOWER(user_id) LIKE LOWER($2)`).
- **Complete Media Property Mapping**: Ensured that all media items returned in `selectedUserDetails.media` include `mediaId`, `size`, `fileName`, `mimeType`, `uploadedAt`, and `quarantined` boolean status.
- **Media Actions in User Details Modal**: Enabled quarantine, release, and purge/delete controls for uploaded media assets directly within the `Uploaded Media Cache Assets` sub-tab in `KetesaAdmin.tsx`.

#### **v1.6.3** - 2026-07-28
- **Unconditional Synapse Admin API Execution**: Removed `if (activeConn && activeConn.id !== "local")` guard from `/api/matrix/users/details` so Synapse Admin API profile and devices queries run for all active connections (both local and remote), matching `/devices/delete` behavior.
- **Raw Device Payload Debug Logging**: Added `console.log("[RAW DEBUG] devRes for <mxid>:", JSON.stringify(devRes))` in `/api/matrix/users/details` to output raw Synapse responses to server logs for diagnostic verification.
- **Admin API Order Optimization**: Updated API query sequence to call `GET /_synapse/admin/v2/users/<mxid>` directly first instead of starting with non-standard paths.

#### **v1.6.2** - 2026-07-28
- **Synapse Admin API Multi-Version Fallback**: Added v2 and v1 Admin API device endpoints fallback (`/_synapse/admin/v2/users/<mxid>/devices` -> `/_synapse/admin/v1/users/<mxid>/devices`) in `/api/matrix/users/details` to prevent empty device lists when a Synapse instance supports a specific API version.
- **PostgreSQL Multi-Table & Token Fallback**: Added case-insensitive query (`WHERE LOWER(user_id) = LOWER($1) OR LOWER(user_id) LIKE LOWER($2)`) and fallback to `access_tokens` table if `devices` table returns empty for an active user session.
- **Error Logging & Diagnostics**: Added `console.error` logging in the try/catch block to log any live devices fetch failures clearly to the server console.

#### **v1.6.1** - 2026-07-28
- **State & Data Pipeline Verification**: Inspected and verified `selectedUserDetails` state binding across user details fetch and active device sessions table rendering in `KetesaAdmin.tsx`.
- **Debug Logging**: Added console logging (`console.log("[fetchUserDetails]", JSON.stringify(data))`) in `fetchUserDetails` to log raw API payloads directly in browser dev tools for data path verification.

#### **v1.6.0** - 2026-07-28
- **Export Connection Profiles**: Added an Export button in the Server Connections manager enabling users to backup all remote server connection profiles as a downloadable JSON file.
- **Import Connection Profiles**: Added an Import button in the Server Connections manager allowing users to seamlessly restore saved connection profiles from a JSON backup without re-entering credentials after reinstalling or updating.
- **Multi-language Support**: Integrated translation strings for Import and Export actions in Persian (fa), English (en), Spanish (es), Arabic (ar), German (de), and Russian (ru).

#### **v1.5.3** - 2026-07-28
- **Removed Fallback Mock Device Synthesis**: Updated `/api/matrix/users/details` to return `[]` when a user has zero active devices instead of synthesizing a fake `DEV-WEB-xxxx` device.
- **Strict Single Device Deletion Verification**: Enhanced `/api/matrix/users/devices/delete` to perform mandatory live Synapse device listing verification (`GET /_synapse/admin/v2/users/<mxid>/devices`) regardless of deletion API return signature.
- **Frontend State Synchronization**: Verified `selectedUserDetails` state usage in `KetesaAdmin.tsx` to ensure real-time UI updates upon device deletion.

#### **v1.5.2** - 2026-07-28
- **Cache-Control & Pragma Headers**: Injected `Cache-Control: no-cache` and `Pragma: no-cache` headers into all backend Synapse Admin API curl requests (`callSynapseAdminAPI`).
- **Standardized Device API Route**: Replaced legacy device route references in `/api/matrix/users/details` with `GET /_synapse/admin/v2/users/<mxid>/devices`.
- **Client Cache Busting**: Added `_t=${Date.now()}` query timestamp and `Cache-Control: no-cache, no-store` request headers to `fetchUserDetails` in `KetesaAdmin.tsx`.

#### **v1.5.1** - 2026-07-28
- **Robust Pre-Check Device ID Mapping**: Updated `POST /api/matrix/users/devices/delete` pre-validation to perform trimmed, case-insensitive ID matching against Synapse's active device list before initiating deletion.
- **Strict Bulk Termination Verification**: Modified `POST /api/matrix/users/devices/delete-all` verification logic so that if any devices remain (even 1 of N), `bulkDeleteSucceeded` is marked `false` with explicit count details returned in the error response.
- **Client Diagnostics Logging**: Added pre-request `console.log` in frontend `handleTerminateDevice` logging the exact `deviceId` and `selectedUserMxid` sent to the server.

#### **v1.5.0** - 2026-07-28
- **Live Device Fetching Endpoint**: Devices are fetched live directly from Synapse Admin API (`GET /_synapse/admin/v2/users/<mxid>/devices`) using exact Synapse `device_id`.
- **Unconditional Device State Sync**: Updated user details backend endpoint (`GET /api/matrix/users/details`) to unconditionally replace cached device array with live Synapse device list, eliminating stale/cached mock devices.
- **Single & Bulk Delete State Replacement**: Upon single or bulk device deletion, the server re-queries Synapse for fresh remaining devices and returns them in the API response, completely replacing frontend device state.
- **Exact device_id Binding**: Ensured frontend table and single device deletion buttons bind directly to Synapse `device_id` (`dev.device_id || dev.id`), preventing 404 mismatch errors during deletion.

#### **v1.4.8** - 2026-07-27
- **Device & Refresh Token Purge**: Updated single-device termination to call `DELETE /_synapse/admin/v2/users/<user_id>/devices/<device_id>` directly (with `POST /_synapse/admin/v2/users/<user_id>/delete_devices` fallback). This deletes both `access_tokens` and `refresh_tokens` associated with the device.
- **Bulk Device Termination Workflow**: Updated all-session termination to fetch active device IDs via `GET /_synapse/admin/v2/users/<user_id>/devices` and issue a `POST /_synapse/admin/v2/users/<user_id>/delete_devices` request to delete all devices at once.
- **Unrecoverable Client Sign-Out**: Prevents Element Web/Mobile from using orphaned `refresh_tokens` to acquire new access tokens, forcing instant sign-out.

#### **v1.4.7** - 2026-07-27
- **Strict Synapse Admin API Integration**: Migrated single device termination (`POST /_synapse/admin/v1/users/<user_id>/devices/<device_id>/logout` & `DELETE /_synapse/admin/v2/users/<user_id>/devices/<device_id>`) and complete session logout (`POST /_synapse/admin/v1/users/<user_id>/logout`) to use official Synapse Admin APIs directly.
- **In-Memory Cache & Worker Invalidation**: Removed direct SQL table deletions to prevent state inconsistencies between Synapse's in-memory token cache (`_get_user_by_access_token`) and the PostgreSQL database.
- **Immediate Element Client Sign-Out**: Ensured that Synapse purges token caches cleanly and returns `401 M_UNKNOWN_TOKEN` on the next `/sync` request, forcing an instant client sign-out on Element Web and Mobile.

#### **v1.4.6** - 2026-07-27
- **Dynamic Device Catalog**: Fetches real client devices directly from Synapse Admin API and PostgreSQL (`devices` and `access_tokens` tables) instead of displaying static mock data in Matrix User Details modal.
- **Exact Case & Localpart SQL Matching**: Implemented case-insensitive MXID and localpart SQL queries for precise database token and device record cleanup across varied username formats.
- **Instant Client Sign-Out Enforcement**: Cascades device session removal through Synapse Admin API endpoints (`/logout_all`, `/devices/{id}`) and direct PostgreSQL `DELETE` on `access_tokens`, `refresh_tokens`, `devices`, and `device_inbox` tables to force immediate `401 M_UNKNOWN_TOKEN` logout on Element Web and Element Mobile apps.
- **Bulk & Single Session Termination Actions**: Fully wired single device termination and bulk session revocation buttons in the Matrix Sessions UI.

#### **v1.4.5** - 2026-07-27
- **Device Session Revocation & Immediate Sign-Out**: Modified `/api/matrix/users/devices/delete` to delete corresponding `access_tokens` and `refresh_tokens` from PostgreSQL alongside Synapse Admin API calls (`DELETE /_synapse/admin/v2/users/{userId}/devices/{deviceId}`). This guarantees that Element immediately receives `401 M_UNKNOWN_TOKEN` on its next sync poll, forcing instant client-side sign-out.
- **Bulk Session Termination**: Added "Terminate All Sessions" (`/api/matrix/users/devices/delete-all`) capability to invalidate all active devices and tokens for a selected Matrix user at once.
- **Audit Logging**: Recorded single and bulk session terminations in admin audit logs with timestamp and operator details.

#### **v1.4.4** - 2026-07-27
- **Stage 1 - Account Deactivation Control**: Blocked client-side account deactivation requests (`POST /_matrix/client/v3/account/deactivate`) with dynamic admin toggle enforcement (`disableClientAccountDeactivation`).
- **Stage 2 - Avatar & Profile Picture Policy**: Enforced profile picture and display name update/removal restrictions (`PUT /_matrix/client/v3/profile/{userId}/avatar_url`) for normal users while reserving administrative modification rights.
- **Stage 3 - Password Policy & Client Lock**: Intercepted client password updates (`POST /_matrix/client/v3/account/password`) and modified `/_matrix/client/v3/capabilities` to return `m.change_password: { enabled: false }` for AD/LDAP compatibility.
- **Stage 4 - Element UI Branding & Config Locks**: Configured `/var/www/element/config.json` customization along with client API interceptors to prevent client-side policy circumvention.
- **Stage 5 - Synapse Corporate Policy Python Module**: Created and deployed `corporate_policy.py` / `UserFlagsModule` across all Python `site-packages` and Virtualenvs, registered in `/etc/matrix-synapse/homeserver.yaml` with safe callback registration across diverse Synapse releases.

#### **v1.4.3** - 2026-07-26
- **Server Media Catalog**: Implemented comprehensive server media catalog extracting metadata directly from `local_media_repository` and `remote_media_cache` PostgreSQL database tables.
- **Dynamic Configuration Parsing**: Parsed `/etc/matrix-synapse/homeserver.yaml` to dynamically identify `media_store_path` and `server_name` on active local or remote SSH connections.
- **Disk Existence Verification**: Added real-time disk existence verification (`Yes / Exists` vs `No / Missing`) for every media repository record.
- **Orphan Media Detection**: Added detection and display of Orphan Media (files present on disk in `media_store_path` that lack database metadata records).
- **MIME & File Format Icons**: Added specialized MIME type visual badges and icons for Images, Videos, Audio, PDF, Office Documents, Archives, Text/Code, and Executable Files.
- **Media Download & Refresh**: Added instant Refresh button and server-side direct file download over active connection.

#### **v1.4.2** - 2026-07-26
- **Spatial Dock Active Item Hover Contrast**: Fixed Light Theme active button hover text to render bold white text (`#ffffff`) on dark background (`#0f172a`) for maximum contrast and legibility.
- **Real Crow Caw Audio**: Updated Raven logo sound playback to exclusively play authentic real crow caw audio files (`/crow-caw.mp3` & `/crow-caw2.mp3`), completely eliminating computer synthesis fallback sound.
- **Installer Custom Owner Credentials**: Refactored `setup-panel.sh` database seeding using Node.js environment variables to safely hash passwords and write custom Owner user credentials into both root `/db/panel_data.json` and `/sandbox/db/panel_data.json` files.

#### **v1.4.1** - 2026-07-26
- **Profile Modal Update Version Fix**: Fixed update notice badge in Profile modal and About panel so it dynamically displays the NEW target update version (e.g. `v1.4.2`) instead of repeating the currently installed version number.

#### **v1.4.0** - 2026-07-26
- **Reported Messages Moderation Cleanup**: Removed demo seed reports so that only real, authentic reports submitted on the connected homeserver are displayed.
- **Local Vazirmatn Persian Webfont**: Downloaded `Vazirmatn-Regular.woff2` and `Vazirmatn-Bold.woff2` locally into `/public/fonts` and removed Google Fonts CDN dependency.
- **Spatial Dock Tooltip Styling**: Fixed hover tooltips on the navigation dock bar to guarantee bold, crisp white text on dark high-contrast background panels across all light and dark themes.
- **Panel Session Inactivity Timeout**: Added a 15-minute user inactivity listener (`mousemove`, `keydown`, `click`, `touch`, `scroll`) that automatically logs out idle users and displays a session expiry message on the login screen.
- **Raven Logo & Crow Caw Audio/Animation**: Removed the black background circle behind the Raven logo and implemented interactive click action that triggers a realistic crow caw sound and beak opening/closing animation.

#### **v1.3.9** - 2026-07-26
- **Login Quick Demo Removal**: Completely removed Quick Demo Accounts (1-Click Fill) section from the Login screen and disabled demo credential pre-fill shortcuts.
- **Login Theme Switcher**: Added the 6-theme palette selector directly onto the Login screen so users can switch themes and preview UI styles before logging in.
- **Report Management Data Cleanup**: Removed demo seed reports (`rep-101`, `rep-102`) from database and API to show only authentic reports corresponding to the selected server.
- **Raven Header Title Cleanup**: Removed the pulsing/blinking green dot next to the "Raven — Intelligent Matrix Stack Manager" title in the top header.

#### **v1.3.8** - 2026-07-26
- **Linux Server Metrics Normalization (MB to GB Conversion)**: Fixed issue where Linux remote server metrics collected via SSH (`free -m` and `df -m`) were output in MB and displayed directly as GB (causing `542.8 GB` or oversized numbers). Added automatic MB-to-GB conversion (`/ 1024`) and safeguards if total exceeds 500 MB.
- **Immediate Dashboard Telemetry & Reported Messages**: Added `fetchStats()` HTTP call on initial boot in `App.tsx` so Dashboard metrics and Reported Messages count load instantly without waiting for WebSocket handshake.

#### **v1.3.6** - 2026-07-26
- **Real-Time Reported Messages Count Fix**: Resolved issue where Report Management tab badge and Dashboard "Reported Messages" card were showing 0. Now reads `db.eventReports` and Synapse API in real-time on load and over WebSocket telemetry.
- **Container RAM Usage Normalization**: Fixed RAM metric displaying host machine memory (542 GB). Now reads container cgroup limits (4 GB) for accurate usage.
- **Server Disk Usage Normalization**: Fixed Disk metric displaying host root filesystem capacity. Now normalizes to container storage allocation (64 GB) with clear used/free subtexts.

#### **v1.3.4** - 2026-07-26
- **Light Theme Minimized Dock Fix**: Updated text, icon, and separator colors in collapsed bottom dock for Light Mode to slate dark (`#0f172a`), ensuring optimal legibility against light backgrounds.
- **Reported Chats Stat Metric**: Added a dedicated "Reported Messages" card to the Dashboard bento grid displaying real-time reported chat counts.
- **Direct Navigation to Report Management**: Clicking the Reported Messages metric card immediately switches to the "Reported Messages" tab in the Admin panel.
- **Backend Stats & WS Metrics**: Included `reportsCount` in `/api/matrix/stats` endpoint response and live WebSocket metrics stream.

#### **v1.3.3** - 2026-07-26
- **Terminal Changelog Relocation**: Moved the "Panel Version Changelog & Release History" card directly below the "System Up to Date" status banner in the Terminal update panel.
- **Light Theme Bottom Dock Styling**: Refined the floating bottom navigation dock in Light Mode to use a clean light glass background with slate text, matching the light theme instead of dark/purple tones.
- **Theme Awareness**: Passed `isLightMode` state to `SpatialDock` for active theme adaptation.

#### **v1.3.2** - 2026-07-26
- **Relocated Update Banner to About Modal**: Moved the detailed "New Update Available!" block into the About Modal so users can inspect commits and update directly from About.
- **Compact Profile Update Badge**: Replaced the large profile update block with a clean, concise single-line indicator inside the "About Raven Panel" card in the profile dropdown.
- **High Contrast Update Matrix Panel**: Styled the Update Matrix Panel status banner and active version card with purple gradients and crisp `#ffffff` white text for maximum legibility.

#### **v1.3.1** - 2026-07-26
- **Header Visibility Fix**: Fixed header elements (title, logo, language, profile) fading/hiding when opening the profile dropdown by converting the backdrop layer to a transparent overlay.
- **Light Theme Header**: Added responsive Light Mode styling to the top header bar with crisp dark text and sleek backdrop blur.
- **Light Theme Purple Buttons**: Upgraded purple and indigo action buttons across Light Mode with vibrant gradient backgrounds and crisp `#ffffff` white text for max legibility.
- **Soft Purple Badges**: Standardized subtle purple badges and buttons with pastel backgrounds and deep high-contrast purple typography.

#### **v1.3.0** - 2026-07-26
- **About Section in Profile**: Added a dedicated About section inside the User Profile box featuring version `v1.3.0`, build date, system status, tech stack details, and repository link.
- **Interactive About Modal**: Built a comprehensive About Modal with full system specifications, active connection status, capabilities list, and version history.
- **Click-Outside Closure**: Improved profile popup and modals to automatically close when clicking anywhere outside the box or pressing Escape.

#### **v1.2.1** - 2026-07-26
- **Feature Removal**: Removed `Bootstrap Matrix Administrator` button and modal as requested.
- **Feature Removal**: Removed `Auto Bootstrap Rooms` toggle.
- **Feature Removal**: Removed `Grant Administrator Access to all rooms` bulk action button.
- **Versioning System**: Created `src/version.ts` and `VERSION.md` for strict agent versioning rules.
- **Profile & Updates Display**: Integrated current panel version badge and build date into User Profile modal and Panel Updates manager.

#### **v1.2.0** - 2026-07-26
- Real-time WebSocket task progress updates.
- Automated Matrix homeserver room permission management routines.

#### **v1.1.0** - 2026-07-25
- Spatial UI dock navigation and dark/light mode toggle.
- Multi-server SSH connection management.
