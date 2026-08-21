/**
 * Raven Matrix Admin Panel - Central Version Configuration
 * 
 * ============================================================================
 * IMPORTANT INSTRUCTION FOR ALL AI AGENTS & DEVELOPERS:
 * ============================================================================
 * Whenever you make ANY code modification, bug fix, feature addition, or UI change
 * to this application/panel, you MUST increment the panel version defined below!
 * 
 * Versioning Rules:
 * - Patch / Minor fix (e.g. bug fix, styling tweak): increment patch version (e.g., v1.2.0 -> v1.2.1)
 * - Minor Feature (e.g. new button, new settings option): increment minor version (e.g., v1.2.1 -> v1.3.0)
 * - Major Release (e.g. major architectural change, framework upgrade): increment major version (e.g., v1.3.0 -> v2.0.0)
 * 
 * Always make sure PANEL_VERSION and PANEL_BUILD_DATE are updated and kept in sync!
 * ============================================================================
 */

export const PANEL_VERSION = "2.25.3";
export const PANEL_BUILD_DATE = "2026-08-21";
export const PANEL_NAME = "Raven Matrix Admin Panel";
export const PANEL_CODENAME = "Raven Spatial";

export interface VersionEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export function getUpdateVersionString(currentVersion: string, latestRemoteVersion?: string): string {
  if (latestRemoteVersion && latestRemoteVersion.trim() !== '' && latestRemoteVersion !== currentVersion) {
    return latestRemoteVersion;
  }
  const parts = currentVersion.split('.').map(n => parseInt(n, 10));
  if (parts.length === 3 && !parts.some(isNaN)) {
    return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
  }
  return currentVersion;
}

export const VERSION_HISTORY: VersionEntry[] = [
  {
    version: "2.25.3",
    date: "2026-08-21",
    title: "Strict Remote Execution Engine for Matrix & Element Backup Operations",
    changes: [
      "Eliminated all local and sandbox fallbacks for configuration and snapshot backups, ensuring all execution occurs strictly on the active remote destination server.",
      "Added multi-stage verification on the destination server: verified non-zero byte size with stat, confirmed readability with tar -tzf, and asserted the presence of both /var/www/element/ and /etc/matrix-synapse/ hierarchies.",
      "Refactored scanServerBackups, download, restore, delete, and rollback endpoints to target /opt/matrix-element-Backup on the active destination connection exclusively.",
      "Added exact error reporting across API layers with localization and toast alerts without swallow or silent fallback."
    ]
  },
  {
    version: "2.25.2",
    date: "2026-08-20",
    title: "Remote-First Architecture & Strict Multi-Path Archive Verification for /opt/matrix-element-Backup",
    changes: [
      "Remote-First Execution Enforcement: All backup creation, listing, and restore procedures execute exclusively on the remote server via active SSH/Agent connection.",
      "Strict Archive Verification: Eliminated silent error handling; backups are verified via remote filesystem checks (test -f, test -s, tar -tzf) before returning success.",
      "Path Traversal Protection: Enforced strict boundary checks during restoration to ensure archives contain only authorized Matrix Synapse and Element configuration targets.",
      "Companion Manifest & Detailed Toast Reporting: Guaranteed companion JSON manifest generation on remote target paths and surfaced explicit remote failure messages to the UI."
    ]
  },
  {
    version: "2.25.1",
    date: "2026-08-20",
    title: "Fix Backup Delivery & Direct Multi-Path Storage in /opt/matrix-element-Backup",
    changes: [
      "Target Directory Archival Fix: Resolved empty /opt/matrix-element-Backup issue by generating genuine compressed .tar.gz archives, companion JSON manifests, and direct snapshot subdirectories in target locations.",
      "Dual Environment Mirroring: Synchronized backup writes across primary filesystem (/opt/matrix-element-Backup/) and sandbox environments simultaneously.",
      "Resilient Remote Bash Script: Upgraded SSH & Agent execution with multi-path detection for /var/www/element/** and /etc/matrix-synapse/**, automatic directory provisioning, and permissions enforcement.",
      "Instant UI Snapshot Refresh: Automated live catalog re-fetching upon backup creation to display new archives immediately in Homeserver and Reporting panels."
    ]
  },
  {
    version: "2.25.0",
    date: "2026-08-19",
    title: "Dedicated /opt/matrix-element-Backup Storage & Multi-Path Element/Synapse Configuration Backup Suite",
    changes: [
      "Dedicated /opt/matrix-element-Backup Directory: Standardized remote server backup archive storage to /opt/matrix-element-Backup with dynamic directory creation, write verification, and catalog scanning.",
      "Multi-Path Configuration Backup Engine: Comprehensive backup of /var/www/element/ (including all subdirectories) and /etc/matrix-synapse/ (including all subdirectories) in both remote SSH/Agent and local environments.",
      "Dual Format Archival & Restoration: Integrated full .tar.gz archive creation and extraction alongside JSON structured dumps with recursive directory traversal.",
      "Granular Scope-Based Rollback: Supported rollback targets ('all' for both Element and Synapse, 'synapse' for /etc/matrix-synapse, and 'element' for /var/www/element) with automatic Synapse service restart and error recovery.",
      "Enhanced UI Visualizations: Updated Configuration Snapshots and Archived Backups Catalog to highlight covered paths, directory tags, and quick-rollback action triggers."
    ]
  },
  {
    version: "2.24.3",
    date: "2026-08-19",
    title: "Eliminate Double Scrollbars & Unified Natural Page Scroll in Wallpaper & Config Views",
    changes: [
      "Scroll Architecture Overhaul: Resolved double scrolling and jumpy viewport behavior across Element Login Config & Wallpaper and Homeserver Settings tabs by removing conflicting nested overflow wrappers.",
      "Sticky Subtab Navigation: Implemented sticky positioning (lg:sticky lg:top-24) on the sidebar navigation for smooth desktop tab switching while allowing full natural page scrolling."
    ]
  },
  {
    version: "2.24.2",
    date: "2026-08-19",
    title: "Active Client Devices Dropdown Menu Z-Index & Table Overflow Fix",
    changes: [
      "Z-Index & Stacking Context Fix: Fixed the 3-dot dropdown menu in Matrix Admin -> Active Client Devices & Matrix Sessions to prevent clipping under table rows and containers.",
      "Table Container Overflow: Updated devices table wrapper to overflow-visible and assigned high priority z-index layering to the active row and dropdown overlay."
    ]
  },
  {
    version: "2.24.1",
    date: "2026-08-19",
    title: "Auth Policy UI Harmonization & Local DB Option Refinement",
    changes: [
      "Palette Harmonization: Harmonized User Login Source & Authentication Policy card colors, borders, and glass effects with other Element Login cards.",
      "Dual Option Simplification: Refined policy selector to 2 distinct options: 'Both (Local + LDAP/AD)' and 'Active Directory Only (Block Local Users)' by removing the redundant local-only option.",
      "UI Cleanliness: Standardized typography, badges, and YAML preview code block styling."
    ]
  },
  {
    version: "2.24.0",
    date: "2026-08-19",
    title: "User Authentication Policy & Local Login Control (/etc/matrix-synapse/conf.d/password.yaml)",
    changes: [
      "Purge CAPTCHA & Anti-Brute Force: Completely removed CAPTCHA, brute-force challenges, and related backend endpoints from the codebase.",
      "Local vs. Active Directory Login Control: Added User Authentication Policy management inside Element Login Config & Wallpaper tab with three policy modes: Both (Local + LDAP/AD), Active Directory / LDAP Only, or Local DB Only.",
      "Synapse password.yaml Management: Automated creation and updates of /etc/matrix-synapse/conf.d/password.yaml containing password_config (enabled and localdb_enabled).",
      "Dynamic Local User Disabling: Selecting Active Directory / LDAP Only sets localdb_enabled: false, blocking local database user logins across Matrix Synapse.",
      "Dedicated REST API Endpoints: Added /api/matrix/auth-policy GET/POST and integrated policy state in branding save & fetch pipelines."
    ]
  },
  {
    version: "2.23.0",
    date: "2026-08-19",
    title: "Element Login Security & CAPTCHA Protection Hub",
    changes: [
      "Login Security & CAPTCHA Configuration Card: Added comprehensive CAPTCHA security management interface inside Element Login Config & Wallpaper tab.",
      "Dual CAPTCHA Activation Modes: Supported smart triggering upon repeated failed login attempts ('on_failed') or mandatory challenge on every login ('always').",
      "Dynamic Failed Attempts Threshold: Configurable trigger threshold slider with quick presets (1, 2, 3, 5 attempts) to prevent brute-force attacks.",
      "Live Interactive CAPTCHA Preview & Tester: Integrated real-time SVG CAPTCHA generator and sandbox input testing directly in the configuration panel.",
      "End-to-End Persistence: Full backend synchronization across /api/matrix/branding/save, /api/matrix/branding/config, /api/security/settings, and audit logging."
    ]
  },
  {
    version: "2.22.0",
    date: "2026-08-19",
    title: "Favicon System-Wide Sync, Light Theme UI Polish & Default Country Code Purge",
    changes: [
      "Favicon Comprehensive Deployment: Added automatic multi-path deployment and DOM synchronization for custom Element Web favicons across /var/www/element/img/, /var/www/element/favicon.ico, and HTML DOM link headers.",
      "Light Theme UI Palette Refinement: Unified background, border, and text inputs across Default Widget Container Height, Element Call Settings, and Login Options for harmonious light & dark mode appearance.",
      "Default Country Code Removal: Completely purged Default Country Code from both frontend UI components and backend branding config save/load pipelines."
    ]
  },
  {
    version: "2.21.0",
    date: "2026-08-19",
    title: "Element Config Expansion: Default Theme, 3PID Disable, Widget Height, Country Code & Element Call",
    changes: [
      "Default Theme Configuration: Added UI and backend synchronization for default_theme ('light' or 'dark') in /var/www/element/config.json.",
      "3PID Login Control & Dropdown Suppression: Added disable_3pid_login support grouped with login identifier options to suppress 3PID logins and hide the dropdown in Element login page.",
      "Default Widget Container Height: Added configurable default_widget_container_height setting with 280px default and quick-preset adjustments.",
      "Default Country Code: Added default_country_code selector supporting GB (+44), IR (+98), ES (+34), SA (+966), DE (+49), and RU (+7).",
      "Element Call Settings: Added element_call object configuration including custom brand title, disable toggle, and exclusive mode."
    ]
  },
  {
    version: "2.20.0",
    date: "2026-08-19",
    title: "Element Login & Branding Asset Unified Storage Migration to /var/www/element/img/",
    changes: [
      "Branding Directory Standardization: Migrated wallpaper uploads, header logo uploads, and favicon assets to /var/www/element/img/ with automatic directory creation.",
      "Unified Discovery & Gallery Scanning: Updated wallpaper gallery scanning and image listings to scan /var/www/element/img/ and its subdirectories dynamically.",
      "Config Sync & Asset Serving: Seamlessly serve and link Element login branding assets (wallpaper, headerLogo, and favicon) directly from /var/www/element/img/ in Element config.json."
    ]
  },
  {
    version: "2.19.0",
    date: "2026-08-19",
    title: "Complete Removal of Room Ban Functionality and BAN Subsystems (Frontend & Backend)",
    changes: [
      "Room Members Moderation Streamlining: Completely removed the Ban action button from Room Members list, keeping pure Kick moderation.",
      "Removed Users BAN & History BAN Sections: Removed all Active Banned and History Banned UI sections, tabs, counters, and management modals from the Room Members modal and global Room Management toolbar.",
      "Backend API Cleanup: Purged all legacy room ban/unban routes and endpoints (/api/matrix/rooms/members/ban, /api/matrix/rooms/members/unban, /api/matrix/banned-users, and /api/matrix/banned-users/:id).",
      "Type Definition & Member Model Refactor: Cleaned up MatrixRoom interfaces and server room member responses to eliminate banned members arrays and obsolete state trackers."
    ]
  },
  {
    version: "2.18.0",
    date: "2026-08-18",
    title: "Banned Members Management Split: Users BAN & History BAN with Frequency Tracking",
    changes: [
      "Banned Members Two-Section Division: Segmented Banned Members into 'Users BAN' (active bans currently enforced on room/server) and 'History BAN' (full historical archive of ban events with multi-ban frequency tracking).",
      "Dedicated Global Banned Members Modal: Added a top toolbar action in Room Management opening a comprehensive management modal supporting quick searching, filtering, and real-time unbanning.",
      "Room-Specific Banned Tabs: Updated the View Members modal to feature two dedicated sub-tabs: 'Users BAN (Active)' and 'History BAN', displaying past reasons, dates, and moderator details.",
      "Synapse-Authoritative Unban & Immediate State Sync: Integrated real-time unban handling that removes users from Synapse room ban state, updates local ban lists, and syncs history logs instantly."
    ]
  },
  {
    version: "2.17.12",
    date: "2026-08-18",
    title: "Deterministic Non-Speculative Matrix Room Ban & Unban Architecture",
    changes: [
      "Deterministic Matrix Moderation APIs: Replaced speculative candidate endpoint retry loops in `handleRoomKickOrBan` with canonical Matrix Client-Server API endpoints (`POST /_matrix/client/v3/rooms/{roomId}/ban` and `POST /_matrix/client/v3/rooms/{roomId}/unban`).",
      "Authoritative Synapse State Verification: Integrated `getRoomMemberState` helper querying live homeserver state events to strictly verify that ban operations result in `membership='ban'` and unban operations transition out of `'ban'` before returning success.",
      "Reliable Admin Moderation Elevation: Enhanced `ensureAdminHasRoomPower` to support unban actions and pass explicit admin MXID targeting when elevating permissions with `make_room_admin`.",
      "Synchronized View Members State: Ensured the modal and room state immediately synchronize with live Synapse member and ban lists post-action."
    ]
  },
  {
    version: "2.17.11",
    date: "2026-08-18",
    title: "Synapse-Authoritative Room Unban Architecture & Verification",
    changes: [
      "Synapse-Authoritative Room Unban: Unified room unban into `handleRoomKickOrBan` with Power Level 100 admin elevation, executing standard Matrix Client-Server unban endpoints (POST /_matrix/client/v3/rooms/{roomId}/unban and PUT /_matrix/client/v3/rooms/{roomId}/state/m.room.member/{mxid} with membership='leave').",
      "Strict Unban Verification: Verified with Synapse homeserver state that membership is no longer 'ban' before declaring success.",
      "Synchronized UI & Local Storage: Immediately clears unbanned users from room banned lists in both modal and room list state, with background authoritative re-synchronization."
    ]
  },
  {
    version: "2.17.10",
    date: "2026-08-18",
    title: "Direct Room Member Ban Button in View Members Modal",
    changes: [
      "View Members Modal Room Ban: Added direct 'Ban' moderation action button alongside 'Kick' for active members inside Room Management → View Members modal.",
      "Synapse-Authoritative Execution: Triggers the authoritative homeserver ban workflow with confirmation dialog and optional reason prompt, updating member state and banned members list upon Synapse confirmation."
    ]
  },
  {
    version: "2.17.9",
    date: "2026-08-18",
    title: "Synapse-Authoritative Room Ban Architecture & State Verification",
    changes: [
      "Synapse-Authoritative Room Ban: Implemented strict Matrix Client-Server API integration for banning room members (PUT /_matrix/client/v3/rooms/{roomId}/state/m.room.member/{mxid} and POST /_matrix/client/v3/rooms/{roomId}/ban with membership='ban') without modifying PostgreSQL tables directly.",
      "Strict Membership State Verification: Operation success is only declared when Synapse homeserver state explicitly confirms membership='ban' for the target user in the room.",
      "Profile & Identity Preservation: User profile properties (display names, active states, avatar URLs) remain strictly preserved without mutation during ban execution.",
      "Synchronized Moderation Logs & UI: Added structured `bannedUsersLogs` history recording and post-confirmation frontend state updates with background room member synchronization."
    ]
  },
  {
    version: "2.17.8",
    date: "2026-08-18",
    title: "Synapse-Authoritative Room Kick and Member Moderation Architecture",
    changes: [
      "Synapse-Authoritative Room Kick: Removed all direct PostgreSQL membership/event table DELETE operations and replaced speculative endpoints with standard Matrix Client moderation APIs (POST /_matrix/client/v3/rooms/{roomId}/kick).",
      "Mandatory Synapse Verification: The backend explicitly queries Synapse room member state following the moderation action and verifies the target user is no longer joined before reporting success.",
      "Strict Post-Confirmation UI and Database Updates: The frontend no longer optimistically removes members or masks errors; local storage and room member cards are updated only upon verified Synapse confirmation, with authoritative state re-synchronization.",
      "Robust Admin Room Moderation Elevation: Enhanced `ensureAdminJoinedAndPL100` to reliably identify active admin credentials, ensure room membership, and elevate Power Level 100 before executing moderation requests."
    ]
  },
  {
    version: "2.17.7",
    date: "2026-08-17",
    title: "Pure Room Membership Architecture & Profile Preservation for Add Member Flow",
    changes: [
      "Strict User Profile Preservation: Completely eliminated unauthorized user profile mutations (`PUT /_synapse/admin/v2/users/...`) in `forceUserJoinRoomInSynapse`. Adding a user to a room strictly preserves display names, admin status, active state, avatars, passwords, and 3pids.",
      "Eliminated Display Name Fabrication: Removed all MXID-based display name fabrication heuristics across backend member endpoints and frontend handlers. User profiles and display names are queried directly from Synapse as the authoritative source.",
      "Strict Membership Verification: Room membership operations (join vs invite) are explicitly verified against Synapse room state and client APIs before updating local representations.",
      "Guaranteed State Integrity: Local database state (`room.joinedMembers` and `room.membersCount`) is updated only after confirmed Synapse membership success, preventing false-positive additions."
    ]
  },
  {
    version: "2.17.6",
    date: "2026-08-17",
    title: "Dynamic Synapse Auto-Join Runtime Configuration Discovery & Canonical File Architecture",
    changes: [
      "Dynamic Runtime Config Discovery: Synapse configuration path is now dynamically discovered from the running systemd service (ExecStart) and process command-line arguments (--config-path) rather than hardcoded path guesses.",
      "Eliminated config.d Guessing & Multi-Directory Writes: Completely removed all legacy code that wrote auto_join_rooms to arbitrary /etc/matrix-synapse/config.d directories.",
      "Single Canonical Source of Truth: Auto-Join configuration is managed in ONE canonical file (such as conf.d/auto_join_rooms.yaml or homeserver.yaml if standalone) without generating duplicate files or modifying homeserver.yaml unnecessarily.",
      "Python Runtime Validation & Safe Service Restart: Every auto-join update is strictly validated using Synapse Python runtime checks and YAML schema validation before initiating a verified Synapse service restart.",
      "Robust Domain Resolution & Matrix Room Identification: Replaced hardcoded dummy domains with runtime server_name discovery and preserved standard Matrix Room IDs without fake alias fabrication."
    ]
  },
  {
    version: "2.17.5",
    date: "2026-08-17",
    title: "Dynamic Runtime Discovery for Synapse Python Environment & Module Deployment",
    changes: [
      "Replaced hardcoded Python versions, filesystem broad scans, and directory guessing with runtime discovery via active systemd matrix-synapse service and running process inspection.",
      "Queried discovered Synapse Python interpreter dynamically for exact sys.path and verified site-packages directories using Python standard runtime APIs.",
      "Ensured idempotent single-target module deployment into verified Synapse site-packages and primary config locations with validation via interpreter import checks.",
      "Eliminated silently swallowed errors in module deployment and service restarts, providing transparent step-by-step progress logging in API responses."
    ]
  },
  {
    version: "2.17.4",
    date: "2026-08-16",
    title: "Complete Light Mode Compatibility for Live Installer Log Terminal & Console UI",
    changes: [
      "Fixed Live Installer Log terminal container (`# Reading live installer log: /var/log/matrix_stack_install.log`) background, borders, and text contrast in light mode.",
      "Added light mode color support to formatLogLine helper for success, warning, error, and step highlights with high-contrast readable tones.",
      "Adapted Web Console terminal outer frame, header, tab switchers, and terminal input bar (`root@matrix-node:~#`) seamlessly across dark and light themes."
    ]
  },
  {
    version: "2.17.3",
    date: "2026-08-16",
    title: "Rename Update Suite to 'Update Element Web'",
    changes: [
      "Updated page header title to 'Update Element Web' (مدیریت بروزرسانی المنت وب).",
      "Updated tab navigation button in Web Console terminal header to 'update-element-web'.",
      "Updated Quick Tasks entry title to 'Update Element Web' (آپدیت المنت وب) with matching emerald theme accent.",
      "Refined terminal initial welcome log stream to reflect 'Update Element Web' suite."
    ]
  },
  {
    version: "2.17.2",
    date: "2026-08-16",
    title: "Streamline Element Updates Suite, Fix Light Mode Terminal & Button Loading Colors",
    changes: [
      "Streamlined Element & Synapse update section to focus directly on Element Web deployment (Auto GitHub release download vs Manual offline package upload & installation), removing 'Both Components' and 'Synapse Server Only' options.",
      "Added complete light mode styling across the entire Element update section, comparison cards, and deployment forms.",
      "Fixed live terminal console (element-updater@matrix:~) background and log syntax colors to match light and dark modes with high contrast.",
      "Fixed 'Check updates' and 'Install update' button loading states in panel-updates tab to use appropriate theme colors instead of turning dark."
    ]
  },
  {
    version: "2.17.1",
    date: "2026-08-16",
    title: "Add Element Login Page Branding Controls: Forgot Password & Create Account Toggles",
    changes: [
      "Added interactive toggles in Element Login Page Branding & Footer Controls to show/hide 'Forgot password?' and 'New here? Create an account' links.",
      "Integrated backend persistence for showForgotPassword and showCreateAccount in /var/www/element/config.json with UIFeature.passwordReset and UIFeature.registration settings.",
      "Implemented comprehensive CSS and runtime DOM injection in syncElementBrandingDom to cleanly hide respective elements and link prompts across Element Web login flows.",
      "Added multi-language localizations (Persian, English, etc.) for both toggles in the admin panel."
    ]
  },
  {
    version: "2.17.0",
    date: "2026-08-16",
    title: "Overhaul Security Controls & Dynamic Synapse E2EE Policy Engine",
    changes: [
      "Removed deprecated E2EE policies ('Disabled By Default' and 'Disabled By Default Permissive') from both frontend and backend, retaining solely 'Allowed / Standard' and 'Strict Lockdown'.",
      "Built dynamic, version-agnostic Synapse room.py policy engine with automated pristine baseline backup (room.py.orig.bak), atomic replacement, and Python syntax compilation verification.",
      "Implemented comprehensive 5-point room.py lockdown logic enforcing encrypted: False, power_level_content_override with EventTypes.RoomEncryption at 999, removal of creation_content encryption keys, and state filtering.",
      "Integrated dynamic discovery prioritizing venv locations without hardcoded line numbers, Python versions, or Synapse versions.",
      "Preserved full multi-language i18n support and synchronized service restarts across Synapse and Nginx."
    ]
  },
  {
    version: "2.16.7",
    date: "2026-08-14",
    title: "Enhance Visibility of Live Execution Terminal in Policy Modals",
    changes: [
      "Updated Active Terminal execution modals in Policy and Configuration sections (Session & Authentication Policies, Push Notifications, Media Repository, Administrator Contact, and E2EE).",
      "Revamped terminal stdout text coloring to high-contrast crisp white and bright light blue/cyan for maximum readability against dark backgrounds."
    ]
  },
  {
    version: "2.16.6",
    date: "2026-08-14",
    title: "Update Official Panel Title to 'Raven — Matrix Stack Manager'",
    changes: [
      "Updated official panel name and browser title from 'Raven — Intelligent Matrix Stack Manager' to 'Raven — Matrix Stack Manager'.",
      "Synchronized title across index.html, metadata.json, UI header, translations (Persian, English, etc.), README.md, and setup installers."
    ]
  },
  {
    version: "2.16.5",
    date: "2026-08-14",
    title: "Rename Control Hub Tab to Login Config & Wallpaper",
    changes: [
      "Renamed the Wallpaper & Branding tab in Control Hub to 'Login Config & Wallpaper' (تنظیمات لاگین و والپیپر).",
      "Updated tab headers, descriptions, and multi-language localizations across the panel to reflect full login configuration and wallpaper management features."
    ]
  },
  {
    version: "2.16.4",
    date: "2026-08-14",
    title: "Add Element Login Identifier Dropdown Configuration (Username, Email, Phone)",
    changes: [
      "Added dedicated login identifier configuration in Wallpaper & Login Branding settings to allow admins to choose which login options (Username [login_field_mxid], Email [login_field_email], Phone [login_field_password]) appear in the Element login dropdown (<select id=\"mx_Field_1\">).",
      "Implemented live interactive preview of the Element login dropdown in the admin panel reflecting active options in real-time.",
      "Added backend CSS and DOM injection support in syncElementBrandingDom to filter select options, auto-fallback to active identifiers, and lock single-option states.",
      "Added validation to require at least one active login identifier before saving branding configuration."
    ]
  },
  {
    version: "2.16.3",
    date: "2026-08-14",
    title: "Fix Element Web Config Collision by Removing Conflicting Legacy default_hs_url",
    changes: [
      "Fixed 'Invalid configuration: a default_hs_url can't be specified along with default_server_name or default_server_config' error in Element Web v1.11+ / v1.12+.",
      "Cleaned ensureElementConfigIntegrity in backend to strictly use modern default_server_config and explicitly delete conflicting legacy default_hs_url and default_server_name keys from /var/www/element/config.json.",
      "Ensured Element Web v1.12.24 bootstraps cleanly with modern homeserver config."
    ]
  },
  {
    version: "2.16.2",
    date: "2026-08-14",
    title: "Enforce Element Web Config Integrity Guard and Fix Wallpaper Save Misconfiguration",
    changes: [
      "Fixed 'Your Element is misconfigured' error caused by branding/wallpaper save operations overwriting /var/www/element/config.json without preserving default_server_config.",
      "Implemented ensureElementConfigIntegrity self-healing engine in backend that guarantees default_server_config, homeserver base_url, server_name, and schema structure are perpetually preserved and validated.",
      "Added automatic interception in writeConfigContent to prevent accidental stripping of critical Element Web configuration fields during any branding, wallpaper, logo, or video settings mutation.",
      "Enforced proper file permissions (644) and directory permissions (755) when copying custom wallpapers and logos to /var/www/element."
    ]
  },
  {
    version: "2.16.1",
    date: "2026-08-14",
    title: "Restore Remote Filesystem as Single Source of Truth for Wallpaper Gallery Discovery",
    changes: [
      "Fixed remote wallpaper gallery discovery by actively querying /opt/matrix-synapse/wallpaper directly on the remote filesystem via multi-strategy scanner (Python stat + shell find).",
      "Eliminated dependency on panel reinstall state, database cache, or local sandbox for existing wallpapers; pre-existing files on remote server are discovered immediately.",
      "Added binary stream transfer with Base64 encoding/decoding and start/end delimiters for high-speed, zero-corruption wallpaper asset streaming over remote connection.",
      "Added support for all valid image types (.jpg, .jpeg, .png, .webp, .svg, .gif, .ico, .avif) with dynamic MIME type mapping."
    ]
  },
  {
    version: "2.16.0",
    date: "2026-08-14",
    title: "Fix WallpaperTab Runtime ReferenceError and Restore Tab Render",
    changes: [
      "Fixed runtime crash (ReferenceError: ImageIcon is not defined) in WallpaperTab causing a black screen on tab opening by correctly importing Image as ImageIcon from lucide-react.",
      "Verified all icon components and visual fallbacks across Wallpaper & Branding tab for seamless render."
    ]
  },
  {
    version: "2.15.9",
    date: "2026-08-14",
    title: "Fix Broken Wallpaper Gallery Image Loading & Implement Zero-Broken-Image Architecture",
    changes: [
      "Fixed broken image display in the Wallpaper gallery during initial startup and panel updates by introducing clean base64 stream extraction with start/end markers over SSH.",
      "Added auto-seeding of 5 built-in SVG wallpaper presets (Deep Space Mesh, Emerald Aurora, Midnight Cyber Peaks, Quantum Nebula, Minimal Dark Grid) ensuring the gallery is never empty upon initial boot.",
      "Implemented resilient dynamic SVG fallback renderer in the wallpaper file endpoint preventing 404 broken image states for any wallpaper asset.",
      "Added WallpaperThumbnail component in the frontend featuring animated loading skeletons, smooth fade-in transitions, and graceful fallback card rendering."
    ]
  },
  {
    version: "2.15.8",
    date: "2026-08-14",
    title: "Decouple Wallpaper & Branding Selection from Immediate Server Application",
    changes: [
      "Decoupled wallpaper and header logo selection from immediate server writes: choosing a wallpaper, logo, or changing branding settings now updates local draft state and requires clicking 'Save & Apply Branding to Server'.",
      "Added draft state indicators and a sticky 'Unsaved Changes in Draft' notification banner with quick Discard and Save & Apply action buttons.",
      "Updated backend /api/matrix/branding/save endpoint to accept and atomically apply activeWallpaper and activeLogo alongside other branding fields in a single remote SSH update.",
      "Fixed asset preview for Element Favicon and Header Logo with dynamic path resolution and error recovery."
    ]
  },
  {
    version: "2.15.7",
    date: "2026-08-14",
    title: "Element Favicon & Header Logo Loading Fix & Resilient Multi-Path Asset Delivery",
    changes: [
      "Fixed broken icon display for Element Favicon and Header Logo Above Login Form in the Branding & Wallpaper tab.",
      "Added multi-path asset resolver and direct proxy endpoint (/api/matrix/branding/asset) checking /opt/matrix-synapse/wallpaper, /var/www/element/img/logos, /var/www/element/wallpaper, and /var/www/element.",
      "Implemented graceful fallback SVG rendering for standard Element matrix favicon and branding logo when custom files are not yet uploaded or temporarily unreachable.",
      "Enhanced UI error handling in WallpaperTab with dedicated fallback icon states, ensuring zero blank previews."
    ]
  },
  {
    version: "2.15.6",
    date: "2026-08-14",
    title: "Native Element Web Logo Click Target URL Integration & Clean Architecture",
    changes: [
      "Identified root cause of empty logo href: Element Web / Matrix React SDK natively reads 'branding.logo_link_url' (and 'logoLinkUrl') from config.json to render the anchor href.",
      "Configured branding.logo_link_url as the Single Source of Truth in /var/www/element/config.json, ensuring Element Web's login page naturally renders <a href=\"...\" target=\"_blank\" rel=\"noopener\" class=\"mx_DefaultWelcome_logo\"> without runtime hacks.",
      "Removed unneeded inline JS/MutationObserver script injections from index.html to maintain clean, production-grade Element Web templates.",
      "Synchronized logoClickUrl handling seamlessly across backend wallpaper and branding endpoints."
    ]
  },
  {
    version: "2.15.5",
    date: "2026-08-14",
    title: "Reliable Element Login Logo Click Target URL Redirection & Multi-Path HTML DOM Injection",
    changes: [
      "Replaced fragile sed-based script injection with safe base64-encoded HTML document patching across all candidate Element Web paths (/var/www/element, /usr/share/nginx/html, /var/www/html, /var/www/element-web).",
      "Added capture-phase click and pointer event interception to guarantee clicks on a.mx_DefaultWelcome_logo, a.mx_AuthHeader_logo, and inner img elements navigate to the custom Logo Click Target URL.",
      "Added continuous MutationObserver and interval href re-application to ensure React DOM reconciliation in Element Web cannot reset or strip the custom logo link URL."
    ]
  },
  {
    version: "2.15.4",
    date: "2026-08-14",
    title: "Element Logo Click Target URL Redirection & DOM Sync",
    changes: [
      "Added complete Logo Click Target URL synchronization across all standard Element Web config keys (welcome_logo_target_url, auth_header_logo_target_url, logo_target_url).",
      "Injected automatic runtime DOM binding for Element header and welcome logo anchors (a.mx_DefaultWelcome_logo, a.mx_AuthHeader_logo) ensuring clicks reliably navigate to the custom designated target URL."
    ]
  },
  {
    version: "2.15.3",
    date: "2026-08-14",
    title: "Fix WallpaperTab Syntax and Upload Handler Resolution",
    changes: [
      "Resolved Vite transform JSX syntax error in WallpaperTab upload section and showcase gallery.",
      "Fixed unresolved handleUploadSubmit handler binding on upload button.",
      "Cleaned up redundant JSX fragments in showcase gallery view."
    ]
  },
  {
    version: "2.15.2",
    date: "2026-08-14",
    title: "Wallpaper Gallery Pagination, Reset to Defaults & Localized Light-Theme Delete Modal",
    changes: [
      "Added interactive pagination controls (first, previous, page numbers, next, last, and items-per-page selector) to Wallpaper gallery for Grid, List, and Showcase views.",
      "Added 'Reset to Defaults' (بازگشت به پیش‌فرض) button in the branding section to easily restore Element login parameters to factory defaults.",
      "Redesigned the 'Confirm Wallpaper Deletion' modal with theme-neutral light/dark styling and full 6-language localization.",
      "Verified Element logo click URL and login footer suppression settings synchronization with target server config.json."
    ]
  },
  {
    version: "2.15.1",
    date: "2026-08-14",
    title: "Light Theme Polish, Direct Upload Button & Simulator Removal in Wallpaper Hub",
    changes: [
      "Fixed dark/black element styling in Wallpaper & Branding view: Favicon box, Header Logo box, Logo Click Link input, Brand Name input, and configuration cards now fully match light theme and dark theme.",
      "Fixed Upload Wallpaper button to directly open the native file selection dialog for single and multiple image selection.",
      "Removed Live Element Login Simulator section for a streamlined, responsive branding configuration layout."
    ]
  },
  {
    version: "2.15.0",
    date: "2026-08-14",
    title: "Element Wallpaper Management & Login Page Customization Hub",
    changes: [
      "Added dedicated Wallpaper & Branding section to Control Hub for managing /opt/matrix-synapse/wallpaper.",
      "Implemented image uploads to /opt/matrix-synapse/wallpaper with multi-format support, grid/list/showcase view switcher, and one-click active wallpaper selector for Element Web.",
      "Implemented Element Login Page Customization: Footer visibility toggle (show/hide auth footer links and copyright), custom Favicon upload, custom Header Logo upload above login form, and custom Logo Click Target Link URL configuration.",
      "Added interactive live Element Login Simulator with real-time preview of active wallpaper, custom logo, clickable URL tooltip, and dynamic login footer."
    ]
  },
  {
    version: "2.14.7",
    date: "2026-08-14",
    title: "Remove Typing, Read Receipts, Presence, and Room Creation Policies",
    changes: [
      "Removed Typing Notifications, Read Receipts, Presence Tracking, and Room Creation policy cards and controls from frontend Homeserver config view.",
      "Cleaned up associated backend API routes, parser logic, and module blocker handlers from server configuration engine."
    ]
  },
  {
    version: "2.14.6",
    date: "2026-08-14",
    title: "Lock and Gray-Out Media Store Path Field in Panel",
    changes: [
      "Made Media Store Path input field strictly read-only and disabled in Media Repository config view.",
      "Added grayed-out visual styling, Lock icon badge, and fixed server system configuration indicator."
    ]
  },
  {
    version: "2.14.5",
    date: "2026-08-12",
    title: "Add Unconditional [E2EE_TRACE] Logging to check_event_allowed",
    changes: [
      "Added unconditional logger.warning for check_event_allowed entry to trace live event processing during E2EE toggle attempts in Element Web.",
      "Verified environment status and executed server diagnostic commands for Synapse module registration and policy inspection."
    ]
  },
  {
    version: "2.14.4",
    date: "2026-08-12",
    title: "Fix Synapse Module API Third-Party Rules & Spam-Checker Callback Separation",
    changes: [
      "Fixed critical registration bug in UserFlagsModule.__init__ by separating register_third_party_rules_callbacks and register_spam_checker_callbacks into independent try/except blocks.",
      "Removed check_event_allowed argument from register_spam_checker_callbacks call to prevent TypeError during Synapse module initialization.",
      "Registered check_event_allowed specifically under register_third_party_rules_callbacks where it is officially supported in Synapse Module API.",
      "Enhanced _get_e2ee_policy error logging and ensured fail-closed behavior (STRICTLY_DISABLED, False) on any policy read or JSON parse errors."
    ]
  },
  {
    version: "2.14.3",
    date: "2026-08-12",
    title: "Enforce Organization E2EE Lockdown at Synapse Event Authorization Engine",
    changes: [
      "Enhanced matrix_user_flags_module.py to extract event metadata safely from FrozenEvent objects across all Synapse Module API callbacks.",
      "Added explicit [E2EE_TRACE] diagnostic logging capturing event_type, room_id, sender, and policy state on all m.room.encryption state event checks.",
      "Configured check_event_allowed and user_may_create_room callbacks to raise HTTP 403 SynapseError with M_FORBIDDEN code on STRICTLY_DISABLED policy or read failures.",
      "Guaranteed fail-closed protection so m.room.encryption state events cannot be persisted regardless of user power level, client, or room admin status.",
      "Updated module deployment pipeline to ensure matrix_user_flags_module.py is copied to all Python virtual environment site-packages directories on target servers."
    ]
  },
  {
    version: "2.14.2",
    date: "2026-08-12",
    title: "Fail-Closed Authoritative Synapse E2EE Enforcement & Policy Engine Refactor",
    changes: [
      "Refactored Synapse UserFlagsModule (matrix_user_flags_module.py) to implement fail-closed authoritative E2EE enforcement directly inside Synapse's event processing pipeline.",
      "Removed fail-open exception handling for E2EE checks, ensuring any read failure or error while evaluating /etc/matrix-synapse/e2ee_policy.json strictly blocks m.room.encryption events.",
      "Replaced fake default_power_level_content_override mechanism with authoritative check_event_allowed and user_may_create_room ModuleApi callbacks.",
      "Updated user_may_create_room callback to inspect initial_state, creation_content, and boolean encryption flags, blocking encrypted room creation for all users regardless of power level.",
      "Updated UI descriptions in Security Controls & E2EE Policy to clearly state that STRICTLY_DISABLED enforces server-side rejection of m.room.encryption events across all clients."
    ]
  },
  {
    version: "2.14.1",
    date: "2026-08-12",
    title: "Authoritative Synapse Event Authorization Engine Module for E2EE Enforcement",
    changes: [
      "Implemented authoritative Synapse Event Engine Module (matrix_user_flags_module.py) registering check_event_allowed & user_may_create_room callbacks via Synapse ModuleApi.",
      "Enforced STRICTLY_DISABLED policy directly inside Synapse event processing pipeline, rejecting m.room.encryption state events and encrypted room creation with HTTP 403 M_FORBIDDEN before events are added to room DAG.",
      "Ensured Room Admins cannot bypass E2EE lockdown policy via direct Matrix Client-Server API calls, custom clients, or Element Web.",
      "Automated policy synchronization writing /etc/matrix-synapse/e2ee_policy.json and registering module in homeserver.yaml under modules: array.",
      "Preserved existing encrypted rooms and historical encrypted events without converting them to plaintext or destroying data."
    ]
  },
  {
    version: "2.14.0",
    date: "2026-08-12",
    title: "Organization-Wide Strict E2EE Enforcement Policy & Backend Interceptor Architecture",
    changes: [
      "Refactored Security Controls & E2EE Policy into an enterprise-wide E2EE enforcement policy with 3 distinct modes: STRICTLY_DISABLED (Strict Lockdown), DISABLED_BY_DEFAULT (Permissive), and ALLOW (Standard Matrix).",
      "Implemented server-side backend Matrix Client-Server API interceptor in server.ts to reject m.room.encryption state events and createRoom encryption requests with HTTP 403 E2EE_ORG_POLICY_BLOCKED when STRICTLY_DISABLED policy is active.",
      "Ensured Room Admins cannot bypass E2EE lockdown policy in Element Web, admin console, or direct Matrix C2S API calls.",
      "Configured multi-layer enforcement on target Matrix Server: Element Web config.json (forbidden_settings & feature_e2ee), Nginx well-known (force_disable), Synapse homeserver.yaml (m.room.encryption level 999 & encryption_enabled_by_default_for_room_type), and proxy interceptor.",
      "Updated UI with 3-mode selection cards, target server identity logging, and execution verification steps."
    ]
  },
  {
    version: "2.13.39",
    date: "2026-08-12",
    title: "Comprehensive Homeserver Configuration i18n & Localization Refactoring",
    changes: [
      "Audited all sections in Homeserver tab (Network, Server Notices, Backups, Certificates, LDAP, Single Sign-On, SMTP, Limits/Rates/Retention Policies, Push, Admin Contact, Session Lifetime).",
      "Standardized multi-language string handling across ConfigForms using a unified loc() helper supporting Persian, English, Spanish, Arabic, German, and Russian.",
      "Fixed hardcoded English descriptions, labels, helper texts, and status badges across all sub-tabs to dynamically adapt based on selected UI language.",
      "Ensured complete i18n consistency across Homeserver management and policy configuration components."
    ]
  },
  {
    version: "2.13.38",
    date: "2026-08-11",
    title: "User Session & Authentication Policies (session_lifetime.yaml) End-to-End Implementation",
    changes: [
      "Added 'User Session & Authentication Policies' section to Homeserver -> Limits, Rates & Retention Policies.",
      "Implemented remote Synapse configuration management for /etc/matrix-synapse/conf.d/session_lifetime.yaml.",
      "Added discoverSessionLifetimeConfig & updateSessionLifetimeConfig backend handlers with conf.d validation, duration format checking, timestamped backups, and Synapse check-config validation.",
      "Added REST endpoints GET/POST/PUT /api/matrix/config/session-lifetime-config.",
      "Integrated Session Lifetime essential distinction notice explaining session expiration vs E2EE keys & retention.",
      "Added controls for Refreshable Access Token Lifetime, Refresh Token Lifetime, UI Auth Timeout, and Login via Existing Session options.",
      "Integrated Live Terminal Execution Modal for real-time remote execution logging, health check verification, and rollback."
    ]
  },
  {
    version: "2.13.37",
    date: "2026-08-11",
    title: "Synapse admin_contact Configuration Management End-to-End Implementation",
    changes: [
      "Added Administrator Contact configuration section to 'Limits, Rates & Retention Policies' in Homeserver settings.",
      "Implemented discoverAdminContactConfig and updateAdminContactConfig in server.ts with conf.d include check, YAML syntax validation, backup creation, and Synapse check-config.",
      "Added REST endpoints GET/POST/PUT /api/matrix/config/admin-contact-config for reading and applying admin_contact configuration.",
      "Integrated Live Terminal Execution Modal displaying step-by-step remote SSH/Agent execution and health verification logs.",
      "Added disclaimer notice explaining admin_contact scope and usage in Synapse resource-limit error responses."
    ]
  },
  {
    version: "2.13.36",
    date: "2026-08-11",
    title: "Reorganize Policy Form Layout: Media Storage & Retention inside Media Repository, Rate Limits at Bottom",
    changes: [
      "Moved Max Media Upload Size, Message Retention Period, Local Media Retention, and Remote Cached Media Retention into the Media Repository & URL Previews container.",
      "Moved Message Sending Rate Limits container to the bottom of the tab, placed after Allow Custom Homeserver URL in Element Web."
    ]
  },
  {
    version: "2.13.35",
    date: "2026-08-11",
    title: "Media YAML Single-Quote IP Blacklist, Double-Quote Accept-Language & Multi-Language Defaults",
    changes: [
      "Formatted `url_preview_ip_range_blacklist` entries to use single quotes ('127.0.0.0/8') in media.yaml.",
      "Formatted `url_preview_accept_language` entries to use double quotes (\"fa-IR\") in media.yaml.",
      "Expanded default URL preview accept languages to include Persian, Arabic, Spanish, German, Russian, and English."
    ]
  },
  {
    version: "2.13.34",
    date: "2026-08-11",
    title: "Media Repository Route Endpoint Registration & Safe JSON Error Handling",
    changes: [
      "Registered `/api/matrix/config/media-config` endpoints in server.ts and verified dev server execution state.",
      "Added safe response content parsing to prevent `Unexpected token '<', '<!DOCTYPE '` syntax errors when server returns non-JSON responses."
    ]
  },
  {
    version: "2.13.33",
    date: "2026-08-10",
    title: "Push Jitter Delay Automatic Duration Suffix Formatting",
    changes: [
      "Added automatic 's' suffix formatting for Push Jitter Delay inputs when raw numeric values are entered without unit identifiers.",
      "Preserved existing duration units (e.g., '1s', '500ms') without duplicating suffixes upon configuration save."
    ]
  },
  {
    version: "2.13.32",
    date: "2026-08-10",
    title: "Light Mode Alignment & Jitter Delay UI Polish",
    changes: [
      "Matched Jitter Delay input styling, background color, and border radius to the Rate Limit 'Messages Per Second' text box.",
      "Refactored Push Notification card container and Active Terminal modal with theme-aware styling for seamless Light Mode compatibility."
    ]
  },
  {
    version: "2.13.31",
    date: "2026-08-10",
    title: "Production Synapse Push Notification Configuration Management",
    changes: [
      "Added Synapse Push Notification management section to 'Limits, Rates & Retention Policies' interface.",
      "Supported boolean toggles for push.enabled and push.include_content, with customizable push.jitter_delay string input.",
      "Implemented modular conf.d/push.yaml discovery, creation, backup, and rollback mechanisms on remote Matrix servers.",
      "Integrated Live Terminal modal displaying step-by-step connection, discovery, verification, and Synapse reload logs.",
      "Maintained full backward compatibility with existing Synapse configurations without modifying unrelated YAML sections."
    ]
  },
  {
    version: "2.13.30",
    date: "2026-08-10",
    title: "Version-Agnostic Production E2EE Organization Policy Refactor & Capability Detection",
    changes: [
      "Implemented version-agnostic E2EE policy architecture with dynamic server Capability Detection layer for Synapse & Element Web.",
      "Integrated step-by-step real-time backend execution logging streamed directly into the confirmation modal.",
      "Added multi-layer server-side enforcement including default_power_level_content_override (level 999), Element feature_e2ee toggle, and Nginx force_disable well-known metadata.",
      "Implemented automatic timestamped configuration backups (homeserver.yaml.bak_e2ee_*), syntax validation, and instant rollback on failure.",
      "Ensured non-E2EE rooms permit password-only login and history access on new devices without requiring device keys, SSSS, or key recovery."
    ]
  },
  {
    version: "2.13.29",
    date: "2026-08-10",
    title: "Light Theme Contrast & E2EE Policy Card Styling Refactor",
    changes: [
      "Fixed yellow warning box contrast in Security Controls & E2EE Policy for Light Theme, making important technical boundary notices fully readable.",
      "Redesigned the 3 policy status cards and target node badge with light/dark adaptive background and border styling.",
      "Refactored E2EE confirmation modal to support light theme backdrop, high-contrast modal background, dark typography, and status elements."
    ]
  },
  {
    version: "2.13.28",
    date: "2026-08-10",
    title: "E2EE Organization Lockdown Architecture & Light Theme UI Design Refactor",
    changes: [
      "Completely refactored Homeserver -> Security Controls & E2EE Organization Lockdown to execute real configuration operations on Synapse 1.118.0.",
      "Eliminated e2ee_disable shell command alias requirement and integrated multi-tier default encryption enforcement via Synapse homeserver.yaml (encryption_enabled_by_default_for_room_type & default_power_level_content_override).",
      "Integrated automated configuration safety backup, Python homeserver config validation, and instant rollback on failure.",
      "Overhauled Light Theme CSS rules in index.css and ConfigForms.tsx, restoring high-contrast status badges, clear typography, and elegant card styling."
    ]
  },
  {
    version: "2.13.27",
    date: "2026-08-10",
    title: "Remote E2EE Security Policy Control Center & Architecture Refactor",
    changes: [
      "Refactored Homeserver -> Security Controls & E2EE to operate directly on the target Remote Matrix Server over SSH / Agent connection.",
      "Replaced fake e2ee_disable shell command terminal redirect with real GET/POST /api/matrix/e2ee backend API endpoints.",
      "Added multi-layer policy enforcement: Element Web config.json (feature_e2ee), Nginx /.well-known (force_disable), and Synapse homeserver.yaml (m.room.encryption power level override).",
      "Integrated automatic configuration safety backup, schema structure validation, and immediate rollback upon write failure.",
      "Replaced misleading plaintext database storage claims with technically accurate scope notices and confirmation modal."
    ]
  },
  {
    version: "2.13.26",
    date: "2026-08-10",
    title: "Preferred Jitsi Domain & Video Conferencing Control Hub Integration",
    changes: [
      "Wired up the Preferred Jitsi Domain setting and Video Conferencing controls in Homeserver Control Hub (Media & Video Conferencing tab).",
      "Refactored backend endpoints GET/POST /api/matrix/video to support remote SSH/Agent configuration persistence and dual property keys (preferredDomain and preferred_domain).",
      "Added real-time status loading, Persian and English localization, and toast notifications on updates."
    ]
  },
  {
    version: "2.13.25",
    date: "2026-08-10",
    title: "Domain Standardization: Replace kheilisabz placeholders with company",
    changes: [
      "Replaced all occurrences of kheilisabz domain placeholders and fallback references with company across server routines, installation scripts, and version documentation."
    ]
  },
  {
    version: "2.13.24",
    date: "2026-08-10",
    title: "Secure Standalone Remote Python SMTP Test Runner & Parameter Engine",
    changes: [
      "Eliminated Python inline syntax errors (EOL while scanning string literal) by introducing a standalone file-based Python SMTP runner.",
      "Secured SMTP test parameters and credentials via JSON payload file with chmod 600 permissions, ensuring zero secrets in process args (ps aux) or command lines.",
      "Added strict remote cleanup in finally block ensuring temporary payloads and runner scripts are immediately purged after execution.",
      "Added support for Port 465 SSL/TLS, Port 587/25 STARTTLS, explicit EHLO/AUTH and anonymous relay testing.",
      "Added password sanitization preventing credential leaks in exception stack traces and live logs."
    ]
  },
  {
    version: "2.13.23",
    date: "2026-08-10",
    title: "Remote Synapse SMTP/Email Audit, Dynamic Configuration & Real Testing Engine Refactor",
    changes: [
      "Refactored Synapse email/SMTP backend and frontend to operate dynamically on the active selected Remote Matrix Server.",
      "Implemented dynamic discovery (discoverRemoteSynapseConfigAndEnv) locating homeserver.yaml and python binary on target host.",
      "Added HomeServerConfig schema validation via Python in /api/matrix/smtp/save with backup and atomic overwrite before service restart.",
      "Added real TCP/DNS/TLS/AUTH connectivity test (/api/matrix/smtp/test-connection) and test email dispatch (/api/matrix/smtp/test).",
      "Connected frontend ConfigForms SMTP form to backend save and test endpoints with Password Masking and TCP/TLS test button."
    ]
  },
  {
    version: "2.13.22",
    date: "2026-08-10",
    title: "Rollback & Restore Center UI and Backend Removal",
    changes: [
      "Removed Rollback & Restore Center component and 'Snapshots available' counter from Element/Synapse update tab.",
      "Removed pre-update backup snapshot creation and esAutoBackup toggle from frontend TerminalPanel.",
      "Removed backend endpoints GET /api/matrix/element-synapse/backups, POST /api/matrix/element-synapse/backup, and POST /api/matrix/element-synapse/rollback.",
      "Cleaned up unused icon imports and state variables across TerminalPanel component."
    ]
  },
  {
    version: "2.13.21",
    date: "2026-08-10",
    title: "Dynamic Upstream Release Resolution & End-to-End Online Auto Update Pipeline",
    changes: [
      "Eliminated hardcoded target versions (1.158.0/1.108.0) across backend and frontend UI components.",
      "Implemented dynamic resolution querying PyPI (https://pypi.org/pypi/matrix-synapse/json) and GitHub API for current latest releases.",
      "Added semver comparison logic: reports 'already up to date' without package installation if Current >= Latest.",
      "Enforced pinned installation (matrix-synapse==<resolvedTargetVer>) using detected virtualenv Python executable.",
      "Captured pip exit codes and error output directly, failing immediately without unpinned fallbacks or false PASS.",
      "Structured terminal logs: [TASK], [IDENTITY], [ENV], [VERSION] Current/Latest/Required/Target, [HEALTH], [VERSION] Post-update."
    ]
  },
  {
    version: "2.13.20",
    date: "2026-08-10",
    title: "End-to-End Remote Synapse Update Flow Overhaul & Virtualenv Version Verification",
    changes: [
      "Overhauled Synapse update pipeline to detect actual systemd virtualenv executable (/opt/venvs/matrix-synapse/bin/python) on remote server.",
      "Added strict pre-check comparing current installed Synapse version against target version, aborting redundant execution if already up to date.",
      "Implemented post-update version comparison validating actual version increase on remote host to prevent false PASS reporting.",
      "Enhanced Live Console logging with explicit host identity, Python path, installation method, before/after versions, and API health check results.",
      "Cleaned up template literal backslash escaping and error handling across server update routes."
    ]
  },
  {
    version: "2.13.19",
    date: "2026-08-10",
    title: "Template Literal Backslash Escape Audit for Remote Synapse Update Commands",
    changes: [
      "Audited and fixed template literal backslash escaping in server.ts for dpkg-query command strings.",
      "Eliminated JavaScript evaluation of ${Version} in template literals that caused 'ReferenceError: Version is not defined'.",
      "Enforced proper Bash script generation where literal \${Version} is output to the shell command stream.",
      "Re-verified complete Synapse Online Auto update workflow on remote target server."
    ]
  },
  {
    version: "2.13.18",
    date: "2026-08-10",
    title: "Fix ReferenceError in Synapse Online Auto Update & Enforce Remote Version Resolution",
    changes: [
      "Resolved root cause of '[ERR] Version is not defined' caused by unescaped ${Version} in JavaScript template literals inside server.ts dpkg-query command string.",
      "Added explicit Synapse version resolution step for Online Auto mode, querying installed version from remote server and resolving target release version before starting update.",
      "Ensured all backup, package upgrade, systemd service restart, and health check commands execute exclusively on target Remote Matrix Server using existing connection profile.",
      "Validated input version strings to prevent shell command injection while supporting both automatic online release detection and explicit version targets."
    ]
  },
  {
    version: "2.13.17",
    date: "2026-08-10",
    title: "Remote Target Execution Enforcement for Element Web & Synapse Online Updates",
    changes: [
      "Fixed Synapse Server Only update target to strictly execute online update commands on the active Remote Matrix Server instead of local Panel Server (Raven).",
      "Added pre-update target verification logging non-destructive remote system identity (hostname, hostname -I, id -un, $HOME) and testing filesystem marker creation (/tmp/matrix-panel-target-test).",
      "Added connection ID passing (connectionId) from frontend TerminalPanel.tsx to /api/matrix/element-synapse/update to avoid reliance on global connection state.",
      "Enhanced Synapse version detection before and after update (python3 -m pip show matrix-synapse & dpkg-query), updating database state only upon verified success.",
      "Enforced clean remote execution with runServerCommand and getRemotePackageDir passing targetConn across all update steps."
    ]
  },
  {
    version: "2.13.16",
    date: "2026-08-09",
    title: "Remote Package Discovery & Scanner Quote Escaping Fix",
    changes: [
      "Fixed remote package scanner execution failure caused by broken bash quote wrapping (bash -c 'PKG_DIR=\"'\"...\"'\"') that evaluated PKG_DIR to empty string.",
      "Fixed find parentheses syntax error in JS template string where unescaped backslashes \\( and \\) stripped character escaping.",
      "Fixed getRemotePackageDir script escaping and added case-insensitive extension matching (-iname *.tar.gz, *.tgz, *.zip) for remote package discovery.",
      "Cleaned up quote wrapping across upload verification, package check, and manual Element deployment scripts.",
      "Added detailed error logging and proper HTTP status reporting for package scanning failures."
    ]
  },
  {
    version: "2.13.15",
    date: "2026-08-09",
    title: "SFTP & Retry SSH Architecture for Remote Package Transfers",
    changes: [
      "Fixed 'Unable to exec' SSH channel exhaustion during chunked package uploads by buffering chunks locally on Raven and streaming the completed archive via dedicated SFTP fastPut.",
      "Added SSH connection auto-recovery and channel retry logic in executeSSHCommand and uploadSSHFile.",
      "Enforced dynamic Remote Matrix Server path ($HOME/matrix/matrix_package) across UI, scanner, rescan, and deployment workflows with getent passwd user home resolution.",
      "Added post-upload archive integrity verification (tar/unzip) and automatic rollback of corrupted partial uploads."
    ]
  },
  {
    version: "2.13.14",
    date: "2026-08-09",
    title: "Remote Matrix Server Package Repository Refactor ($HOME/matrix/matrix_package)",
    changes: [
      "Refactored Element Web manual package management to store release archives exclusively on the active Remote Matrix Server at $HOME/matrix/matrix_package.",
      "Dynamically resolved target connection SSH user home directory using getent passwd for both root and non-root connection accounts.",
      "Ensured package chunk streaming writes directly to the Remote Matrix Server with immediate cleanup of temporary Raven transfer buffers.",
      "Updated package scanner (/api/matrix/element-synapse/manual-packages) and manual update execution to operate strictly on the Remote Matrix Server repository.",
      "Eliminated Raven server permanent package storage in /var/backups/matrix/packages for remote connections."
    ]
  },
  {
    version: "2.13.13",
    date: "2026-08-09",
    title: "Robust Manual Element Web Update Pipeline & End-to-End Verification",
    changes: [
      "Streamlined chunked package upload with real-time remote server chunk streaming over active SSH/Agent connection.",
      "Added pre-update package integrity testing (zip/tar integrity validation) before attempting extraction.",
      "Ensured preserved config.json is restored and initial config.sample.json fallback initialized when missing.",
      "Replaced insecure chmod 777 with secure www-data/nginx file permissions (755 directories, 644 files).",
      "Enhanced server-side update execution error detection and live terminal console log propagation."
    ]
  },
  {
    version: "2.13.12",
    date: "2026-08-09",
    title: "Fix Element Web Manual Update Script Execution & Multi-Server Package Sync",
    changes: [
      "Fixed POSIX shell compatibility in manual Element Web deployment bash script (replaced [[ ... ]] with POSIX case statement).",
      "Wrapped update script execution in explicit 'bash -c' subshell to prevent Dash (/bin/sh) command interpretation failures.",
      "Fixed runServerCommand output stream handler to capture stderr and execution error details instead of discarding them when stdout is present.",
      "Added automatic package synchronization to remote SSH / Agent target servers when uploading packages via /api/matrix/element-synapse/upload-element.",
      "Enhanced frontend auto-package selection fallback in TerminalPanel.tsx when initiating manual deployment."
    ]
  },
  {
    version: "2.13.11",
    date: "2026-08-09",
    title: "Element Web Manual Deployment Mode & Server Package Repository",
    changes: [
      "Added 'Manual Mode' (حالت manual) option for Element Web updates in Web Console -> Update Element & Synapse suite.",
      "Implemented server repository package scanner (/api/matrix/element-synapse/manual-packages) to detect existing uploaded Element release archives (.tar.gz, .zip) in /var/backups/matrix/packages and list them for 1-click deployment.",
      "Added chunked package uploader (/api/matrix/element-synapse/upload-element) with live progress bar to upload Element Web release archives directly to server storage.",
      "Updated backend manual deployment pipeline to safely extract, install to /var/www/element, preserve config.json, assign www-data/nginx permissions, and reload Nginx."
    ]
  },
  {
    version: "2.13.10",
    date: "2026-08-09",
    title: "Synchronize Nginx client_max_body_size with Max Media Upload Size",
    changes: [
      "Updated Nginx configuration synchronizer (syncNginxSiteConfigsOnServerParamsChange) to dynamically apply client_max_body_size across all Nginx site and global configs when Max Media Upload Size (LIMIT_MB) is updated.",
      "Added automatic creation/update of /etc/nginx/conf.d/matrix_upload_size.conf to enforce global Nginx upload limits matching homeserver settings.",
      "Ensured Nginx syntax check and service reload execute automatically after setting upload limit changes."
    ]
  },
  {
    version: "2.13.9",
    date: "2026-08-09",
    title: "Fix Modular Synapse Config Validation (conf.d & server_name)",
    changes: [
      "Updated Synapse config validator to automatically include all supplementary configuration files in /etc/matrix-synapse/conf.d/*.yaml.",
      "Gracefully handled missing 'server_name' mandatory check during partial and modular configuration validation."
    ]
  },
  {
    version: "2.13.8",
    date: "2026-08-09",
    title: "Fix Synapse Config Validation (HomeServerConfig)",
    changes: [
      "Fixed Synapse configuration validation failure by replacing the unrecognized --check-config CLI flag with Python's native HomeServerConfig loader.",
      "Ensured proper validation handling across both local and SSH/Agent execution models."
    ]
  },
  {
    version: "2.13.7",
    date: "2026-08-09",
    title: "Privacy Toggles & Matrix Settings Sync Fix",
    changes: [
      "Fixed PostgreSQL account_data serialization for typing notifications and read receipts by using native JSON booleans instead of string literals.",
      "Enhanced Element config.json synchronization to handle both camelCase and snake_case setting keys (sendTypingNotifications, send_typing_notifications, sendReadReceipts, send_read_receipts).",
      "Fixed Synapse presence tracking configuration by writing presence.enabled and use_presence across all candidate conf.d and config.d directories.",
      "Added server-level rate-limiting disable rule for typing notifications when disabled in admin settings."
    ]
  },
  {
    version: "2.13.6",
    date: "2026-08-09",
    title: "Complete Removal of Disk & LVM Management Module",
    changes: [
      "Completely removed Disk & LVM Management component and tab from the panel UI.",
      "Removed backend API routes (/api/disk/overview, /api/disk/lvm/overview, /api/disk/lvm/snapshot/*).",
      "Cleaned up permissions and type declarations."
    ]
  },
  {
    version: "2.13.5",
    date: "2026-08-09",
    title: "Toast Notification Argument Ordering Fix & Robust LVM Snapshot Parsing",
    changes: [
      "Fixed incorrect Toast Notification parameter ordering in Disk Management which caused success messages to display in red error styling.",
      "Added normalized notify helper in DiskManagement component ensuring 'success', 'error', and 'warning' toasts always receive correct type and text arguments.",
      "Enhanced LVM report parser in backend to extract JSON even when terminal streams include leading warning header text or file descriptor leak logs.",
      "Upgraded snapshot detection logic to recognize origin LVs, thin snapshots, data percentages, and LVM attribute flags ('s', 'S', 'v', 'V').",
      "Full Light Mode visual optimization for Mount Points, Volume Groups, and Snapshots cards."
    ]
  },
  {
    version: "2.13.4",
    date: "2026-08-09",
    title: "Light Theme Modal Compatibility & LVM Exit Code 5 Graceful Handling",
    changes: [
      "Fixed raw 'Command failed with exit code 5' error by parsing LVM terminal output from SSH streams when Volume Group lacks free space.",
      "Added clear, actionable Persian/English explanatory messages guiding administrators when Volume Group has 0 free extents for snapshot allocation.",
      "Full Light Theme support across all 4 Disk Management modals (Create, Rollback, Delete, Reboot notice) with dynamic background, input, and text contrast."
    ]
  },
  {
    version: "2.13.3",
    date: "2026-08-09",
    title: "Enhanced LVM Snapshot Exception Handling & Detailed In-Modal Error Messages",
    changes: [
      "Fixed unhandled 500 network exceptions by capturing command errors directly from SSH/Agent command execution.",
      "Added intelligent LVM error translation for insufficient VG free space, missing root permissions, and duplicate snapshot names.",
      "Added an in-modal error alert box in Disk Management to clearly present LVM and system diagnostics to administrators."
    ]
  },
  {
    version: "2.13.2",
    date: "2026-08-09",
    title: "Fix LVM Snapshot Creation & Command Privileges",
    changes: [
      "Fixed issue in LVM snapshot creation where missing root/sudo privileges caused command execution failures.",
      "Fixed percentage size parameter parsing bug where '10%FREE' or '10%' caused syntax errors in lvcreate.",
      "Enhanced stderr capture (2>&1) and improved LVM success detection when benign warnings are printed."
    ]
  },
  {
    version: "2.13.1",
    date: "2026-08-09",
    title: "Fix Disk & LVM Management Layout Placement in ConfigForms",
    changes: [
      "Fixed UI layout bug where Disk & LVM Management view was rendered outside the lg:col-span-3 right column container.",
      "Restored proper grid alignment in Control Hub so tab content renders cleanly in the right panel."
    ]
  },
  {
    version: "2.13.0",
    date: "2026-08-09",
    title: "Disk & LVM Management in Homeserver Settings",
    changes: [
      "Added new 'Disk & LVM Management' section to Homeserver Settings (ConfigForms).",
      "Implemented live partition monitoring, filesystem detection, and mount space usage overview.",
      "Added LVM Physical Volumes, Volume Groups, and Logical Volume snapshot management.",
      "Implemented LVM snapshot creation, rollback (merge), and deletion operations via SSH / Agent remote connection queue.",
      "Added automated snapshot capacity fill alerts (warning at >= 80% and critical at >= 95%) with mandatory confirmation modals."
    ]
  },
  {
    version: "2.12.0",
    date: "2026-08-09",
    title: "Real Synapse & Element Configuration Switches Integration",
    changes: [
      "Implemented true Presence System Tracking toggle writing presence.enabled in homeserver.yaml using AST/js-yaml parser, created timestamped backups outside conf.d, validated with check-config, and executed full Synapse service restart.",
      "Implemented real Send Typing Notifications and Transmit Read Receipts toggles writing settingDefaults and setting_defaults in Element Web config.json on the target server.",
      "Added Account Data Override option syncing typing and read receipt settings directly to existing users in Matrix Postgres database (account_data table).",
      "Synchronized UI switch states on load with actual live server configuration values."
    ]
  },
  {
    version: "2.11.11",
    date: "2026-08-08",
    title: "Light Translucent Gray Frosted Blur for DB Disconnected Overlay",
    changes: [
      "Updated DB Disconnected card overlay to a light frosted translucent backdrop (slate-100/80 light mode & slate-900/80 dark mode) with smooth blur filter.",
      "Refined typography and warning badge contrast to harmonize seamlessly with clean light theme."
    ]
  },
  {
    version: "2.11.10",
    date: "2026-08-08",
    title: "Database Connection Lost / Unconfigured Overlay for Dashboard Metrics",
    changes: [
      "Added automatic database connectivity verification (checkDatabaseConnection) for both REST stats API and real-time WebSocket metrics streams.",
      "Implemented a blur / dim overlay over Public Rooms, Private Rooms, Active Users, Stored Media Size, and Reported Messages cards when database connection is disconnected or not configured.",
      "Displayed clear English message 'Database Disconnected' over database-dependent dashboard cards whenever database connectivity is down."
    ]
  },
  {
    version: "2.11.9",
    date: "2026-08-08",
    title: "Direct Remote Server Integration for Dashboard Public & Private Room Metrics & Versions",
    changes: [
      "Fixed Public and Private room counters on the dashboard to fetch real-time data directly from the active connected Matrix server using Synapse Admin API /_synapse/admin/v1/rooms.",
      "Ensured room stats immediately reflect the active target server connected via SSH, Agent, or API, avoiding stale local fallback cache.",
      "Enhanced Element Web and Synapse version detection to query live server HTTP endpoints, SSH file paths (/var/www/element/version), and Python packages for maximum accuracy.",
      "Synchronized both REST stats API (/api/matrix/stats) and real-time WebSocket metrics streams (sendMetrics) with active connection profiles."
    ]
  },
  {
    version: "2.11.8",
    date: "2026-08-08",
    title: "Real-Time Connected Server Version Detection for Element Web & Synapse Dashboard Cards",
    changes: [
      "Updated backend telemetry and WebSocket streams to dynamically inspect the exact installed versions of Synapse homeserver and Element Web client directly from the active connected server.",
      "Included live detected versions in all periodic WebSocket metrics streams and REST stats endpoints.",
      "Ensured dashboard Element Web and Synapse cards display live version telemetry with instant update badge detection."
    ]
  },
  {
    version: "2.11.7",
    date: "2026-08-08",
    title: "Custom Step-by-Step Element Web & Synapse Server Update Workflows with Rollback Storage",
    changes: [
      "Implemented step-by-step bash update pipeline for Element Web Only option including GitHub API version lookup, tarball extraction, config preservation, nginx reload, and backup archiving.",
      "Implemented step-by-step bash update pipeline for Synapse Server Only option including homeserver.yaml backup, apt update, service stop, apt install --only-upgrade, service & worker restart, and curl health check.",
      "Ensured all rollback backups and configuration snapshots are saved into /opt/matrix_rollback directory (creating the folder automatically if missing).",
      "Piped full execution output step-by-step to the UI terminal stream."
    ]
  },
  {
    version: "2.11.6",
    date: "2026-08-08",
    title: "Remote Script Updates via install-matrix-stack.sh Menu Pipeline",
    changes: [
      "Updated Element Web & Synapse update workflow to execute install-matrix-stack.sh menu choices on the active connected server.",
      "Mapped Element Web Only target to Maintenance & Updates (Item 6) -> Updates (Item 1) -> Update Element Web (Item 3) -> Use latest (Item 2).",
      "Mapped Synapse Server Only target to Maintenance & Updates (Item 6) -> Updates (Item 1) -> Update Matrix Synapse (Item 2) -> Confirm (y).",
      "Mapped Both Components target to execute both Element Web and Synapse update menu sequences sequentially.",
      "Cleaned ANSI formatting and piped live terminal output directly to the UI execution stream."
    ]
  },
  {
    version: "2.11.5",
    date: "2026-08-08",
    title: "Connected Server Telemetry Sync & Dynamic Profile Stats Refetch",
    changes: [
      "Updated backend /api/matrix/stats endpoint to query active connection profile metrics and services instead of local system metrics when connected to a remote server.",
      "Ensured active connection profile switches trigger full stats reset and telemetry refetch for the target connected server.",
      "Preserved all dashboard card structures, titles, and layout containers during shimmer state so real server metrics load smoothly."
    ]
  },
  {
    version: "2.11.4",
    date: "2026-08-08",
    title: "Dashboard Shimmer Persistence on Server Fetch & Service/Connection Cards Shimmer & Version Badges",
    changes: [
      "Persisted shimmer loading state across all dashboard cards during stats refresh and boot until live connected server telemetry is set, preventing momentary display of stale/cached values.",
      "Added shimmer loading placeholder states for Matrix Connection Details and Linux Service Statuses cards.",
      "Added prominent New Update Available badges directly in Element Web and Synapse Server card title headers whenever installed version is behind latest release."
    ]
  },
  {
    version: "2.11.3",
    date: "2026-08-08",
    title: "Dashboard Cards Shimmer Loading State on Data Fetch & Manual Refresh",
    changes: [
      "Added continuous shimmer loading effect across all Dashboard metric cards (CPU, RAM, Disk, Active Users, Rooms, Media Size, Reports) during initial data load and manual stats refresh.",
      "Added matching shimmer loading placeholder cards for Element Web and Synapse Server version cards during data refresh."
    ]
  },
  {
    version: "2.11.2",
    date: "2026-08-08",
    title: "Fix Terminal Console Uncaught ReferenceError TDZ Initialization Crash",
    changes: [
      "Resolved 'Cannot access safeConfirm/isRtl before initialization' ReferenceError when mounting or navigating to Terminal Panel console mode.",
      "Moved helper function declarations (isRtl, hasWriteAccess, safeConfirm) to top of TerminalPanel component body to prevent TDZ scoping errors."
    ]
  },
  {
    version: "2.11.1",
    date: "2026-08-08",
    title: "Terminal Log Stream Localization & High-Contrast Light Mode Styling",
    changes: [
      "Localized Element & Synapse update terminal log stream according to active panel language (English & Persian/Arabic).",
      "Enhanced terminal log box visibility with solid dark slate CLI styling and high-contrast bright green and white text for high legibility in light mode."
    ]
  },
  {
    version: "2.11.0",
    date: "2026-08-08",
    title: "Element Web & Synapse Server Update & Rollback Suite",
    changes: [
      "Added 'Update Element & Synapse' task to Quick Tasks in Terminal Panel with target selection (Element, Synapse, or Both).",
      "Integrated mandatory pre-update backups with 1-click rollback capability to restore previous snapshots.",
      "Added Dashboard metric cards for Element Web and Synapse Server with version badges and update indicators.",
      "Implemented backend REST endpoints for fetching versions, creating backups, running updates, and executing rollbacks."
    ]
  },
  {
    version: "2.10.7",
    date: "2026-08-08",
    title: "Complete Removal of VPN Management Feature",
    changes: [
      "Removed VPN Management UI: Removed the 'VPN Management' tab button, states, handlers, and views from src/components/ReportingPanel.tsx.",
      "Removed VPN Backend Endpoints: Cleaned up all /api/vpn-clients/* and /api/vpn-proxy/* REST API handlers and helper functions from server.ts."
    ]
  },
  {
    version: "2.10.6",
    date: "2026-08-08",
    title: "Installer Script Display Version Update to 'latest'",
    changes: [
      "Installer Banner & Version Output: Updated setup-panel.sh, matrix-installer.sh, and install-matrix-stack.sh to print 'latest' instead of numeric version strings during installation."
    ]
  },
  {
    version: "2.10.5",
    date: "2026-08-08",
    title: "SSTP Master Systemd Unit Provisioning, Automatic Protocol Port Selection & Remote Target Profile Execution",
    changes: [
      "SSTP Master Systemd Unit Resolution: Fixed 'Unit sstp-client.service could not be found' error by auto-provisioning both template (/etc/systemd/system/sstp-client@.service) and master daemon (/etc/systemd/system/sstp-client.service) units on target remote Linux servers.",
      "Automatic Protocol Port Mapping: Configured profile creation forms to auto-select default protocol ports (SSTP: 443, WireGuard: 51820, OpenVPN: 1194, L2TP: 1701, PPTP: 1723, V2Ray: 443, etc.) while keeping the port field fully customizable.",
      "Remote Target VPN Profile Execution: Ensured VPN profiles, SSTP connections, start/stop actions, status checks, and journalctl log retrievals execute exclusively on the selected target remote server via WebSocket tunnel."
    ]
  },
  {
    version: "2.10.4",
    date: "2026-08-07",
    title: "Remote Target Server Execution Plane Enforcement & Profile Editing Support",
    changes: [
      "Target Server Execution Plane Enforcement: Guaranteed all VPN and SSTP connection profiles run commands exclusively on the selected target remote server via WebSocket tunnel.",
      "Removed Local Hardcoded Mocks: Eliminated mock assigned IP address generators and fake disconnected/connected state overrides.",
      "VPN Connection Editing Support: Added full profile editing functionality (ویرایش) for SSTP and client connection profiles, pre-filling server parameters and certificate configurations.",
      "Remote Server Diagnostic Header: Added a real-time target server diagnostic box displaying remote hostname, OS distribution, user permissions, sstpc binary paths, and systemd units."
    ]
  },
  {
    version: "2.10.3",
    date: "2026-08-07",
    title: "Remote SSTP VPN Client Provider Implementation & Per-Connection Systemd Engine",
    changes: [
      "Remote WebSocket Execution: All SSTP operations (installation, configuration, start/stop/restart, status checks, and journalctl log retrieval) execute on target remote servers using the existing WebSocket agent connection without SSH.",
      "Per-Connection Systemd Template Engine: Implemented per-profile SSTP connection architecture utilizing /etc/sstp-client/<profile>.conf configurations and dynamically generated /etc/systemd/system/sstp-client@.service template units.",
      "Robust Connection State Verification: Status checks verify actual PPP interface creation (ip addr show grep ppp), IP address assignments, peer endpoints, and /proc/net/dev network traffic stats.",
      "Full API & UI Integration: Provided dedicated REST endpoints for SSTP metadata detection, profile management, service control, and connection actions, alongside SSTP SSL/TLS and PPP parameter forms in the UI modal."
    ]
  },
  {
    version: "2.10.2",
    date: "2026-08-07",
    title: "Persistent 'Remember Me' 90-Day Token via HttpOnly Cookie & LocalStorage Token Removal",
    changes: [
      "HttpOnly Cookie Persistence: Enabled long-lived 90-day JWT persistent session tokens stored in HttpOnly cookies with SameSite=Strict and Secure flags when 'Remember Me' is selected.",
      "XSS & Security Hardening: JavaScript access to session tokens via document.cookie is completely blocked, and authentication tokens are no longer stored in localStorage.",
      "Seamless Cookie Authentication: Express backend middleware (cookieParser) and frontend fetch requests (credentials: 'include') automatically authenticate sessions via HttpOnly cookies."
    ]
  },
  {
    version: "2.10.1",
    date: "2026-08-07",
    title: "Remote SSH/Tunnel Execution for VPN Management & Target Server Routing",
    changes: [
      "Remote Server Command Execution: All VPN package status queries, installations, uninstalls, systemd service controls, and journalctl log retrievals now execute on the selected target remote server via active SSH/Tunnel connection.",
      "Remote VPN Client Profiles: Client profile connections, disconnects, and configuration deployments now execute directly on the target remote server filesystem (/etc/wireguard, /etc/openvpn, /etc/xray).",
      "Dynamic Target Resolution: Backend automatically resolves targetId from Connection Manager profiles, falling back to local host execution if target is local host."
    ]
  },
  {
    version: "2.10.0",
    date: "2026-08-07",
    title: "Persistent Login 'Remember Me' & Offline In-House CAPTCHA Security",
    changes: [
      "Login 'Remember Me' Toggle: Added a persistent 'Remember Me' control on the login screen with dynamic multi-language wording (Persian, English, Spanish, Arabic, German, Russian).",
      "Backend Long-Lived Token & Session: Integrated 30-day extended JWT session tokens and backend session persistence when 'Remember Me' is enabled.",
      "In-House Offline Vector CAPTCHA: Confirmed zero internet dependency for login security using an in-house Node.js SVG vector CAPTCHA generator that functions completely offline without external APIs."
    ]
  },
  {
    version: "2.9.9",
    date: "2026-08-07",
    title: "VPN Package List Accordion UI Refactor & Light Theme Compatibility",
    changes: [
      "Installer & Packages Accordion Refactor: Converted the card grid into a collapsible accordion list view with search and category filtering, expanding to reveal executable paths, config directories, systemd units, and quick terminal commands.",
      "Light Theme Compatibility: Audited and updated all VPN sub-tabs, cards, badges, connection tables, and modals to support both Light and Dark modes dynamically.",
      "Real System Control & Override State: Verified backend systemctl and process status integration with persistent package overrides."
    ]
  },
  {
    version: "2.9.8",
    date: "2026-08-07",
    title: "Remote VPN Client Installation & Daemon Control Suite",
    changes: [
      "VPN Management Section in Reports & Admin: Re-added a dedicated 'VPN' section with sub-tabs for Installer & Packages, Daemon Control, and Connection Profiles.",
      "Remote Installation Stream Modal: Added support for installing client protocols (WireGuard, V2Ray/Xray, L2TP, SSTP, PPTP, OpenVPN, Tailscale) on remote target servers with a live log modal that can be minimized and re-opened.",
      "Daemon & Connection Controls: Enabled starting, stopping, restarting, and viewing system journal logs for VPN daemons, as well as importing and connecting to VPN profiles.",
      "Localization & Language Sync: All messages, UI elements, and modal labels respect active language settings without Persian hardcoding."
    ]
  },
  {
    version: "2.9.7",
    date: "2026-08-07",
    title: "Complete Removal of VPN & Proxy Service Suite",
    changes: [
      "Removed Frontend UI: Completely removed the VPN & Proxy Services management subtab, connection modal, user credentials manager, and routing protection controls from ReportingPanel.",
      "Removed Backend Endpoints: Eliminated all /api/vpn-proxy/* and /api/vpn-clients/* REST API endpoints, drivers, and package installers from server.ts.",
      "Codebase Cleanup: Cleaned state variables, handler functions, and subtab navigation references."
    ]
  },
  {
    version: "2.9.6",
    date: "2026-08-07",
    title: "Tabbed VPN Interface, SSTP PPA Auto-Install, Full English Localization & UI Refactoring",
    changes: [
      "Tabbed Navigation Interface: Organized the VPN & Proxy Management suite into dedicated sub-tabs (VPN Clients, Proxy Services, Server Daemons, Users, Connection Profiles, Routing & Anti-Lockout) eliminating clutter.",
      "SSTP Package Installation Resolution: Implemented automatic PPA repository addition (ppa:sstp-project/sstp) for Ubuntu/Debian target nodes when installing sstp-client.",
      "Complete English Localization: Converted all UI labels, action buttons, status messages, modal forms, and notification alerts from Persian to English.",
      "Mock Data Purge: Cleared hardcoded mock clients and proxy user instances, ensuring real system state and target connections are loaded.",
      "Relocated Direct Panel Route Tester: Moved the 'Test Direct Panel Route' button and latency diagnostic panel to the bottom of the Routing & Anti-Lockout tab."
    ]
  },
  {
    version: "2.9.5",
    date: "2026-08-07",
    title: "VPN Client Dropdown UI Refactor & Remote Target Connection Execution",
    changes: [
      "Dropdown VPN Client Interface: Transformed the VPN Clients grid into a clean, un-cluttered dropdown interface allowing selection and focused management of individual VPN client packages (WireGuard, OpenVPN, Tailscale, ZeroTier, OpenConnect, StrongSwan, SoftEther, SSTP, L2TP, PPTP).",
      "Remote Server Target Execution: Added a target connection server dropdown to select and execute VPN client installations, service controls, and log checks directly on remote target servers over WebSocket Agent or SSH.",
      "Quick Selection Pills: Added clean status pill chips for rapid switching between VPN client packages with real-time status indicators."
    ]
  },
  {
    version: "2.9.4",
    date: "2026-08-07",
    title: "Fix CheckCircle Missing Import & PostgreSQL Row Type Resolution",
    changes: [
      "Fixed CheckCircle Icon Import: Added missing CheckCircle import from lucide-react in ReportingPanel.tsx, resolving the black screen runtime exception.",
      "Fixed Server PostgreSQL Result Type: Resolved TypeScript type property mismatch in devices query handling."
    ]
  },
  {
    version: "2.9.3",
    date: "2026-08-07",
    title: "Linux Distribution Auto-Detection & Automated VPN Clients Package & Service Control",
    changes: [
      "Target Linux OS & Package Manager Auto-Detection: Automatically parses /etc/os-release on the target server to detect distribution (Ubuntu, Debian, CentOS, Rocky, Fedora, Arch, openSUSE) and package manager (apt, dnf, yum, pacman, zypper).",
      "VPN Clients UI Section: Integrated dedicated 'VPN Clients' management section listing 10 supported Linux VPN tools (WireGuard, OpenVPN, Tailscale, ZeroTier, OpenConnect, StrongSwan, SoftEther, SSTP, L2TP, PPTP).",
      "Package Lifecycle Control: Added one-click remote Installation, Uninstallation, Start, Stop, Restart, and Enable/Disable at boot service actions over persistent agent WebSocket connection without SSH.",
      "Import/Export & Logs Viewer: Added interactive modal for importing .conf and .ovpn configuration files, and viewing real-time systemctl/journalctl logs for individual VPN packages.",
      "Refactored VPN/Proxy UI Layout: Fully refactored light and dark theme compatibility, eliminated text clipping/overflow for badges (e.g. Disconnected and SSTP tags), and harmonized button typography."
    ]
  },
  {
    version: "2.9.2",
    date: "2026-08-07",
    title: "Real Target Server VPN Execution Engine & Card UI Layout Overflow Fix",
    changes: [
      "Real Target Server Driver: Implemented real system calls (sstpc, xl2tpd, pptp-linux, connect-proxy) to configure and control VPN client connections directly on the destination server.",
      "Automated Package Installer: Added backend detection and automated package manager execution (apt-get / yum / apk) to install missing protocol dependencies on the server.",
      "Real Latency & Interface Monitoring: Integrated system ping latency measurement and network interface tunnel IP inspection.",
      "UI Overflow Resolution: Fixed badge and text wrapping in connection cards preventing SSTP and Disconnected tags from clipping outside container bounds."
    ]
  },
  {
    version: "2.9.1",
    date: "2026-08-07",
    title: "Windows-Like VPN Client Profile Manager & Complete Light/Dark Theme Compatibility",
    changes: [
      "Windows-Like VPN Connections: Added full support for creating and managing VPN client profiles with custom usernames, passwords, server hosts, ports, and optional PSK keys.",
      "SSTP Certificate Bypass Option: Introduced 'No SSL Certificate Required' toggle for SSTP connections matching Windows native VPN behavior.",
      "One-Click Connect/Disconnect: Added interactive stateful Connect and Disconnect handlers with live latency and tunnel IP feedback.",
      "Complete Theme Compatibility: Refactored entire VPN & Proxy management UI components, forms, modals, tables, and buttons to adapt dynamically between Light and Dark themes."
    ]
  },
  {
    version: "2.9.0",
    date: "2026-08-07",
    title: "VPN & Proxy Management Suite & Target Server Automated Package Installer",
    changes: [
      "VPN Protocols Management: Added support for PPTP, L2TP/IPsec, and SSTP (SSL VPN) protocols with start/stop/restart service control and status tracking.",
      "Proxy Services: Added SOCKS5 and HTTP/HTTPS proxy management with authentication controls and service toggles.",
      "Target Server Automated Package Setup: Added remote package installation workflow (ppp, pptpd, xl2tpd, sstp-server, dante-server) with live deployment logs modal.",
      "Anti-Lockout Route Protection: Added panel direct static route protection toggle and connection latency tester to prevent panel lockouts during VPN setup.",
      "User Credentials Management: Added CRUD management for VPN and proxy user accounts with protocol assignments and static IP bindings."
    ]
  },
  {
    version: "2.8.4",
    date: "2026-08-06",
    title: "Persistent Login Security Errors, Raven Logo 106px & Password Focus Eye Animation",
    changes: [
      "Persistent Login Security State: Persisted login username, security warnings, CAPTCHA requirements, lockout timer countdowns, and error messages in localStorage to maintain security state across page refreshes.",
      "Raven Logo 106px Resize: Enlarged the login card RavenLogo to 106px x 106px.",
      "Password Field Eye Animation: Refined raven eye animation logic to close eyes exclusively when the password input field is focused, opening eyes when focus moves to username or other fields."
    ]
  },
  {
    version: "2.8.3",
    date: "2026-08-06",
    title: "Multilingual Login Error Messages & Dynamic Language Sync",
    changes: [
      "Multilingual Login Errors: Integrated multi-language login error responses in server.ts supporting Persian, English, Spanish, Arabic, German, and Russian.",
      "Dynamic Error Language Sync: Added automatic real-time error message language synchronization when switching UI languages on the login screen.",
      "Localized Captcha & Lockout Messages: Localized CAPTCHA validation errors, missing field alerts, and account lockout threshold notifications based on selected locale."
    ]
  },
  {
    version: "2.8.2",
    date: "2026-08-06",
    title: "Panel Security Rules, CAPTCHA Protection, Account Lockout & Login UI Enhancements",
    changes: [
      "Panel Security Rules Tab: Added a dedicated 'Panel Security & Lockout' section in Reports & Admin panel to configure automated login lockout thresholds, lockout durations, and CAPTCHA trigger policies.",
      "Account Lockout & Captcha Enforcement: Integrated backend brute-force prevention with SVG CAPTCHA generation and automatic temporary account locking after repeated failed login attempts.",
      "Raven Eyes Password Animation: Updated login RavenLogo component to dynamically close its eyes when typing or focusing on the password field.",
      "Enlarged Login Logo: Increased login card raven logo size from 56px to 86px with ambient glow effects."
    ]
  },
  {
    version: "2.8.1",
    date: "2026-08-06",
    title: "Interactive Room Card Loading State Overlay",
    changes: [
      "Room Card Action Overlay: Added a responsive backdrop blur loading overlay with animated spinner and status label on room cards during asynchronous room actions.",
      "Action State Tracking: Tracked pending room action states across Auto-Join toggles, Grant Room Administrator permissions, Room Shutdown & Deletion, and Power Level updates."
    ]
  },
  {
    version: "2.8.0",
    date: "2026-08-06",
    title: "Filtered User and Room Management Views",
    changes: [
      "Mock Data Purge: Removed fake demo users and demo rooms from local panel database (panel_data.json).",
      "User & Room Filtering: Updated /api/matrix/users and /api/matrix/rooms endpoints to strictly exclude mock/demo entries and ensure only real Synapse and database users and rooms are presented in the User and Room Management sections."
    ]
  },
  {
    version: "2.7.9",
    date: "2026-08-06",
    title: "Full Multi-Level Power Level Assignment Support in Assign Privileged Modal",
    changes: [
      "Power Level Selector Enhancements: Added full multi-level power level support (Level 100 Admin, Level 75 Senior Mod, Level 50 Moderator, Level 25 Helper, Level 0 Default Member) plus Custom Power Level numeric input in the 'Assign Privileged Power Level' modal.",
      "Synapse API State Handling: Populated default power_levels state properties on /api/matrix/rooms/power_levels to ensure Synapse accepts state event updates for all power levels (not just level 100), and auto-joins target user to room before state mutation.",
      "Database Synchronization: Updated role string categorization and synchronized Postgres/JSON room membership power levels across all levels."
    ]
  },
  {
    version: "2.7.8",
    date: "2026-08-06",
    title: "Theme-Adapted Loading Overlay in Matrix Admin & Room Members Modal",
    changes: [
      "Theme Compatibility Fix: Adapted the full-screen modal loading overlay during Kick and Ban actions in Matrix Admin & Room Members modal to seamlessly blend with Light Mode (slate-50 backdrop, indigo-100 ring, slate-800 typography) and Dark Mode (slate-950 backdrop, indigo-600 ring).",
      "Visual Consistency: Replaced static pitch-black backdrop with dynamic glassmorphism theme styling matching panel aesthetics."
    ]
  },
  {
    version: "2.7.7",
    date: "2026-08-06",
    title: "Full-Screen Matrix Admin Loading Overlay for Kick & Ban Actions",
    changes: [
      "Added Full-Screen Loading Overlay: Implemented an interactive modal backdrop lock across the entire Advanced Matrix User Configuration & Monitoring (Matrix Admin) window when executing Kick or Ban actions in the Rooms List.",
      "Modal Interaction Prevention: Prevented accidental window closing or multi-click events while awaiting server response during moderation actions."
    ]
  },
  {
    version: "2.7.6",
    date: "2026-08-05",
    title: "Fix Room Member Synchronization, Addition & Kick Race Conditions",
    changes: [
      "Fixed Room Member Listing & Member Addition: Removed restrictive kickedUsersLogs purge in server.ts that permanently hid members from room lists after re-joining.",
      "Fixed Kicked User First-Attempt Reappearance Bug: Updated background member sync in KetesaAdmin.tsx so that newly added or existing members are kept while kicked/banned users remain filtered out even if Synapse state cache is temporarily delayed.",
      "Enhanced Direct Moderation Endpoints: Added Synapse Admin API candidates to handleRoomKickOrBan in server.ts for instant kick/ban execution."
    ]
  },
  {
    version: "2.7.5",
    date: "2026-08-05",
    title: "Interactive Pre-Uninstall Prompt & TTY Input Confirmation",
    changes: [
      "Updated `uninstall-panel.sh`: Shifted deletion prompt to the very beginning of script execution before stopping services or touching files.",
      "Fixed Non-Interactive Execution: Configured input reading from `/dev/tty` so curl piping (`curl -sSL ... | sudo bash`) waits for explicit user confirmation ('DELETE') before executing any uninstallation actions."
    ]
  },
  {
    version: "2.7.4",
    date: "2026-08-05",
    title: "Fix First-Kick Re-appearance & Stale Room Member Sync Bug",
    changes: [
      "Prevented Kicked Member Re-appearance: Updated background member sync in `KetesaAdmin.tsx` to preserve optimistic removals and prevent stale Synapse `/members` responses from restoring kicked/banned users back into the UI.",
      "Kicked Users Server Filtering: Updated `/api/matrix/rooms/:roomId/members` in `server.ts` to purge recently kicked users stored in `kickedUsersLogs`, preventing stale Matrix room state cache from re-listing kicked members."
    ]
  },
  {
    version: "2.7.3",
    date: "2026-08-05",
    title: "Instant Room Member Kick & Moderation Engine Optimization",
    changes: [
      "Accelerated Kick & Moderation Execution: Updated `handleRoomKickOrBan` in `server.ts` to guarantee admin join state and PL 100 before executing moderation actions, appending targeted `user_id` query parameters across Matrix CS API endpoints.",
      "Optimistic UI Member Removal: Enhanced `handleRoomMemberAction` in `KetesaAdmin.tsx` to optimistically remove kicked/banned members from the Room Members list modal state instantly without blocking user UI.",
      "PostgreSQL State Synchronization: Ensured `room_memberships` and `current_state_events` tables in Postgres reflect kicks and bans immediately alongside local state updates."
    ]
  },
  {
    version: "2.7.2",
    date: "2026-08-05",
    title: "Room Members Listing Restoration & Initial Load/Sync Acceleration",
    changes: [
      "Restored Room Members List Display: Updated `/api/matrix/rooms/:roomId/members` endpoint in server.ts to utilize primary Synapse Admin State API (`/_synapse/admin/v1/rooms/<roomId>/state`), reliably retrieving active room members, display names, avatars, power levels, and roles regardless of bot membership.",
      "Accelerated Initial Sync Speed: Reordered event resolution in `/api/matrix/reports` to query PostgreSQL event_json table first (1ms resolution), bypassing blocking Synapse Admin API event retrieval loops.",
      "Eliminated Race Conditions: Updated `fetchRoomMembers` in KetesaAdmin.tsx with functional React state updaters for room member modals."
    ]
  },
  {
    version: "2.7.1",
    date: "2026-08-05",
    title: "Room Members Endpoint Performance & Sync Speed Restoration",
    changes: [
      "Optimized Room Members API Endpoint: Replaced heavy full room state retrieval (`/_synapse/admin/v1/rooms/<roomId>/state`) with lightweight targeted queries (`/state/m.room.power_levels` and Matrix `/joined_members`).",
      "Restored Sync Performance: Eliminates megabyte state payload downloads, drastically boosting response speed from 5+ seconds down to milliseconds.",
      "Fixed Room Member Listing: Restored proper member list parsing across Matrix Client `/joined_members`, Synapse `/members`, Matrix `/members`, Postgres `room_memberships`, and local DB fallbacks."
    ]
  },
  {
    version: "2.7.0",
    date: "2026-08-05",
    title: "Kicked Users Audit History, Room Ban Option Removal & Enhanced Room Empty State UI",
    changes: [
      "Removed Ban Option from Room Members Modal: Removed the Ban button from active room member list in Modal View Members per user request.",
      "Kicked Users Audit Logging: Integrated automatic kick event logging in handleRoomKickOrBan (server.ts), capturing user MXID, display name, room ID/name, issuer, date/time, reason, last seen IP address, and User Agent from Postgres/Matrix database.",
      "Kicked Users Management UI: Added dedicated Kicked Users History modal in Room Management with search filter (by user, room, kicker, reason, IP), item removal, and full history purge capabilities.",
      "Rooms Empty State UI Upgrade: Redesigned the empty rooms list UI with a styled Hash icon card, bold Persian/English empty state headers, and descriptive guidance matching Reported Messages section."
    ]
  },
  {
    version: "2.6.9",
    date: "2026-08-05",
    title: "Room Member List Synapse State Synchronization & UI Search Fix",
    changes: [
      "Synapse Room State Active Member Filter: Updated GET /api/matrix/rooms/:roomId/members endpoint to prioritize Synapse Admin room state API (/_synapse/admin/v1/rooms/<roomId>/state) to extract exact active room membership states ('join' vs 'leave' / 'ban' / 'invite').",
      "Purged Stale Room Members: Fixed step 2 member mapping that was previously including historical or non-joined users, ensuring only active joined room members appear in View Members modal.",
      "Enhanced Member Display & Search: Updated Room Members modal to display user Display Name alongside MXID and enable searching by both Display Name and @mxid."
    ]
  },
  {
    version: "2.6.8",
    date: "2026-08-05",
    title: "Room Members List Filtering & Live Sync Fix",
    changes: [
      "Accurate Room Member Filtering: Updated /api/matrix/rooms/:roomId/members endpoint to accurately query active room memberships (membership = 'join') via Matrix C2S /joined_members API, Synapse Admin API, and Postgres DB queries.",
      "Excluded Non-Room Users & Ex-Members: Filtered out left, kicked, invited, or banned users from appearing in active room member lists.",
      "Modal On-Demand Live Refetching: Updated room member modals in KetesaAdmin.tsx to always fetch live member data when opened and refresh after member management actions."
    ]
  },
  {
    version: "2.6.7",
    date: "2026-08-05",
    title: "Room Member Kick & Ban Moderation Power Flow Fix",
    changes: [
      "Room Power Elevation Flow: Added ensureAdminHasRoomPower helper to check room power_levels state (m.room.power_levels) and automatically invoke /_synapse/admin/v1/rooms/<roomId>/make_room_admin if admin power level is below required kick/ban threshold.",
      "In-Memory Power Cache: Implemented per-room 5-minute TTL power state caching to prevent redundant make_room_admin calls during session moderation.",
      "Target Power Safeguard: Implemented strict target power level checks, gracefully erroring when target holds equal or higher power level than admin.",
      "Ban Confirmation & Reason Prompt: Enhanced Ban action with explicit user confirmation showing target display name and MXID alongside an optional reason prompt.",
      "Modal Member Refresh: Ensured immediate re-fetch of /api/matrix/rooms/<roomId>/members upon successful kick or ban action."
    ]
  },
  {
    version: "2.6.6",
    date: "2026-08-05",
    title: "Add Member Modal Simplification & AD Groups Tab Removal",
    changes: [
      "Active Directory Tab Removal: Completely removed the Active Directory Groups tab header and option from the Add Member room modal.",
      "Simplified Direct Add Workflow: Streamlined the Add Member modal layout to focus exclusively on direct user search and room joining."
    ]
  },
  {
    version: "2.6.5",
    date: "2026-08-05",
    title: "AD Group Search Filter Repair, Auto-Join Sync Execution, Direct User Join Fix & Installer Version Realignment",
    changes: [
      "Active Directory Group Member Search Repair: Upgraded searchAdGroupMembersViaServerCmd to resolve group DNs first before searching user memberOf or member attributes, fixing wildcard DN search errors in Active Directory.",
      "Room AD Group Auto-Join Execution: Reinforced syncRoomWithAdGroups with forceUserJoinRoomInSynapse helper to automatically provision accounts and join AD group members to Matrix Synapse rooms.",
      "Direct User Modal Join Fix: Fixed permissions and state synchronization in /api/matrix/rooms/members/join and KetesaAdmin handleForceJoinMember, ensuring clicking Add in Direct User List instantly joins the user to the room.",
      "Installer Version Realignment: Updated setup-panel.sh to re-extract and display the latest version v2.6.5 dynamically after repository checkout."
    ]
  },
  {
    version: "2.6.4",
    date: "2026-08-05",
    title: "AD Group Live Query Remote Server Fallback, Sync Interval UI Fit & Installer Version Fix",
    changes: [
      "Remote Server LDAP Command Query: Implemented server-side ldapsearch command execution over SSH/Agent connection when managing remote Matrix servers, fixing ECONNRESET socket failures on AD group refresh.",
      "Sync Interval Control Container Fit: Re-architected Sync Interval (Mins) input control layout with flexible min-w-0 constraints to prevent box overflow on responsive grid displays.",
      "Installer Terminal Version Alignment: Updated setup-panel.sh and package.json to dynamically reflect latest version v2.6.4 during VPS installation."
    ]
  },
  {
    version: "2.6.3",
    date: "2026-08-05",
    title: "Add Member AD Modal UI Redesign & Grid Layout Expansion",
    changes: [
      "Expanded Modal Width: Enlarged Add Member room modal container (Modal 5B) to max-w-5xl for enhanced visibility and responsive layout.",
      "Responsive Grid Partitioning: Restructured Active Directory tab into a 12-column grid layout splitting group mapping list and auto-sync settings cleanly.",
      "Enhanced Tab Visual Hierarchy: Optimized scrollable content areas, borders, and controls for AD group search and sync controls across light and dark themes."
    ]
  },
  {
    version: "2.6.2",
    date: "2026-08-05",
    title: "Refresh Active Directory Groups Real-Time Fetching, Toast Notifications & Custom Group Creation",
    changes: [
      "Cache-Bypassing AD Group Fetch: Added timestamp (_t) query parameter and Cache-Control headers to GET /api/matrix/ldap/groups to bypass browser and proxy caching on group refresh.",
      "Interactive Refresh Toast Feedback: Added clear toast notifications on clicking 'Refresh AD Groups' button informing the user of live Active Directory vs local database group fetch status and count.",
      "Custom AD Group Creation Engine: Added POST /api/matrix/ldap/groups backend endpoint and quick-add button in UI search results when searching for non-listed group names."
    ]
  },
  {
    version: "2.6.1",
    date: "2026-08-04",
    title: "AD Auto-Sync State Key Alignment & Graceful Unconfigured LDAP Notice Handling",
    changes: [
      "Fixed Settings State Key Alignment: Normalized AD sync toggle and interval state parameters (enabled & intervalMinutes) between React frontend and Node.js Express API so settings save reliably.",
      "Fixed Log Property Display: Mapped backend roomsChecked and usersJoined log properties correctly to UI log entry card counters.",
      "Graceful LDAP Unconfigured Notice: Handled missing LDAP URI configuration as an informational notice rather than a room sync failure when local DB group members are synchronized."
    ]
  },
  {
    version: "2.6.0",
    date: "2026-08-04",
    title: "Native Node.js LDAP Client Integration, Auto-Sync Background Scheduler & Log Management",
    changes: [
      "Critical Security Vulnerability Fix: Replaced vulnerable Python string-interpolation shell execution in Active Directory search (searchAdGroupMembersLive) with native Node.js ldapts client and sanitized LDAP filter escaping (escapeLdapFilterValue).",
      "Automatic AD Background Sync Engine: Implemented node-cron recurring background scheduler and runAllRoomsAdSync engine to continuously synchronize mapped AD room members across local database and Matrix Synapse.",
      "AD Sync Settings & Logs API: Added GET/POST /api/matrix/ad-sync/settings, GET /api/matrix/ad-sync/logs, and POST /api/matrix/ad-sync/run-now backend management API endpoints.",
      "Interactive Sync UI & Logs Display: Added automatic sync toggle, interval input, instant manual sync trigger, and persistent AD sync history log panel in KetesaAdmin."
    ]
  },
  {
    version: "2.5.9",
    date: "2026-08-04",
    title: "AD Group Room Auto-Join Rule Enforcement & Member Sync Optimization",
    changes: [
      "Auto-Join Rule Enforcement: Mapped AD groups assigned to rooms serve as continuous auto-join rules so any user belonging to those AD groups is automatically joined to the room.",
      "Live Active Directory Sync: Fetches all AD group members from LDAP or user database, automatically joins them to the room in local DB and Synapse server.",
      "Room Members Endpoint Merge: Updated GET /api/matrix/rooms/:roomId/members to merge local DB joined members so auto-joined AD members immediately reflect in the room member list."
    ]
  },
  {
    version: "2.5.8",
    date: "2026-08-04",
    title: "Save & Join AD Group Members Room Action 404 Fix & Auto-Join Repair",
    changes: [
      "URL Encoding Fix: Encoded roomId parameter in fetch calls (/api/matrix/rooms/${encodeURIComponent(roomId)}/ad-groups) to prevent 404 errors when room IDs contain colons and exclamation marks.",
      "Room Dynamic Initialization: Updated POST /api/matrix/rooms/:roomId/ad-groups in server.ts to automatically initialize local room records for Synapse-native rooms not yet in local DB, eliminating 404 Room Not Found errors.",
      "Dropdown Action Binding: Updated room dropdown 'Add Member' button to invoke handleOpenAddMemberModal(r) to properly fetch room members and load AD groups list."
    ]
  },
  {
    version: "2.5.7",
    date: "2026-08-04",
    title: "Automatic Live Active Directory Group Member Sync & Auto-Join Endpoint Integration",
    changes: [
      "Live AD Group Member Sync: Enhanced POST /api/matrix/rooms/:roomId/ad-groups to execute live LDAP queries against Active Directory servers for all selected groups.",
      "Automatic User Creation & Auto-Join: Fetches all active member accounts (usernames, display names, email addresses) belonging to selected AD groups and automatically creates/joins them as room members.",
      "Resilient Fallback Handling: Maintains graceful fallback user generation if AD server is offline or returns empty member records."
    ]
  },
  {
    version: "2.5.6",
    date: "2026-08-04",
    title: "Active Directory Live Group & User Query Synchronization in Room Add Member Modal",
    changes: [
      "Multi-Method AD Query Engine: Built a resilient Python query engine with python-ldap, ldap3, and ldapsearch CLI support for querying live Active Directory servers.",
      "Live Active Directory Group Auto-Populate: Active Directory Groups List in the Add Member room modal now automatically loads real groups, DSNs, and member counts directly from the connected Active Directory server.",
      "Pre-fetch AD Groups on Modal Launch: Add Member modal automatically triggers fetchAdGroups on open and binds selected AD groups to the room."
    ]
  },
  {
    version: "2.5.5",
    date: "2026-08-04",
    title: "Dynamic Control Hub LDAP/AD Configuration Integration for Group & User Loading",
    changes: [
      "Dynamic LDAP Configuration Reader: Configured GET /api/matrix/ldap/groups and parseLdapFromYaml to load live LDAP server URI, Search Base DN, Bind Mode, Bind Account DN, and Bind Password directly from server configuration files (homeserver.yaml and /etc/matrix-stack-ldap.conf) and Control Hub AD settings.",
      "Purged Legacy Mock LDAP URIs: Completely removed default ldap.company.local mock fallback URIs from client initial state, server endpoints, and Control Hub resolution logic.",
      "Enhanced YAML Module Parser: Upgraded parseLdapFromYaml with js-yaml object parsing for exact extraction of LDAP module configurations on target Synapse servers."
    ]
  },
  {
    version: "2.5.4",
    date: "2026-08-04",
    title: "Control Hub Active Directory Configuration Binding",
    changes: [
      "Dynamic Active Directory Configuration Binding: Configured GET /api/matrix/ldap/groups to load live LDAP server URI, base DN, and bind credentials directly from Control Hub -> Active Directory settings, homeserver.yaml, and active connections.",
      "Removed Test/Placeholder LDAP URIs: Eliminated default fake fallback URIs (ldap://dc1.company.local:389 / ldap://ldap.company.local:389) and updated the Add Member modal banner to reflect actual Control Hub AD settings."
    ]
  },
  {
    version: "2.5.3",
    date: "2026-08-04",
    title: "Active Directory Member Selection & Automatic Group Room Sync",
    changes: [
      "Active Directory Group Direct Fetch: Implemented GET /api/matrix/ldap/groups API endpoint to fetch real Active Directory security groups directly from LDAP/AD server.",
      "Multi-Select AD Groups UI: Replaced manual comma-separated text input with an interactive multi-select checkbox list featuring real-time group search and member count badges.",
      "Automatic Group Member Room Joining: Enhanced POST /api/matrix/rooms/:roomId/ad-groups endpoint to automatically register and join all users belonging to selected AD groups directly to the Matrix room.",
      "Removed Simulation UI: Completely removed test simulation form and mock logic, replacing it with direct Active Directory connection status indicators."
    ]
  },
  {
    version: "2.5.2",
    date: "2026-08-04",
    title: "Connection Loading State & Clean Profile Card View",
    changes: [
      "Removed Redundant Top Disconnection Banner: Removed duplicate top alert bar to keep the UI clean.",
      "Connection Verification Loading State: Kept server status indicator in a amber 'Connecting' / loading state until health check or WebSocket connection is fully verified before switching to green.",
      "Original Remote Disconnection Card Maintained: Restored full layout of original remote connection profile card with retry action."
    ]
  },
  {
    version: "2.5.1",
    date: "2026-08-04",
    title: "Continuous Active Server Connection Monitor & Global Header Status Indicator",
    changes: [
      "Continuous Server Health Polling: Implemented 10-second automated health verification monitoring for active server connections (Local Sandbox, Remote SSH, or Server Agent).",
      "Global Header Connection Badge: Added active connection status badge (Connected / Disconnected) to the sticky top header bar across all admin views.",
      "Global Disconnection Alert Banner: Added sticky alert banner across all pages when connection to the active server is interrupted with quick retry and connection manager navigation."
    ]
  },
  {
    version: "2.5.0",
    date: "2026-08-04",
    title: "Default SSL Installation (Port 8443), Private IP Display & WSS Tunnel Proxying",
    changes: [
      "Default SSL Installer (Port 8443): Configured setup-panel.sh to default to port 8443 with self-signed SSL/TLS certificate setup.",
      "Private IP Access Summary: Formatted installation summary address to display HTTPS access using the server's local private IP address (https://<PRIVATE_IP>:<PORT>).",
      "WebSocket/WSS Tunnel Handshake: Added Nginx proxy headers (Upgrade, Connection, timeouts) for secure WebSocket handshakes over SSL."
    ]
  },
  {
    version: "2.4.9",
    date: "2026-08-04",
    title: "Installer Banner Formatting & Neutral Domain Examples",
    changes: [
      "Installer Banner UI: Added version tag and line breaks below Developer info in setup-panel.sh.",
      "Neutral Domain Examples: Replaced domain examples in setup-panel.sh prompt notice with generic matrix.domain.local and matrixapp.domain.local placeholders."
    ]
  },
  {
    version: "2.4.8",
    date: "2026-08-03",
    title: "Restore Codebase State to Commit 4440c7b",
    changes: [
      "Project State Restore: Restored the complete project codebase and all components to commit 4440c7b (v2.4.7) state per user request.",
      "New Commit Deployment: Re-committed and pushed the restored state directly to the master and main branches."
    ]
  },
  {
    version: "2.4.7",
    date: "2026-08-03",
    title: "Service Discovery Logic Fix & High-Contrast Light Mode Button Styling",
    changes: [
      "Robust Service Discovery: Enhanced /api/certificates/status and getDiscoveredDomains to recursively scan /etc/nginx/ and /etc/matrix/ for active server_name directives and Synapse TLS configurations without crashing on bash exit codes.",
      "High-Contrast Light Mode Refresh Discovery Button: Updated Refresh Discovery button CSS in Light theme to solid indigo background with crisp white typography and icon for optimal legibility.",
      "Fail-Safe Endpoint Resilience: Added error fallbacks so service discovery never returns a 500 status code and always delivers discovered services and certificate statuses."
    ]
  },
  {
    version: "2.4.6",
    date: "2026-08-03",
    title: "SSL Certificates Tab UI Redesign & Panel SSL / Self-Signed Cleanup",
    changes: [
      "Removed Panel SSL Proxy & Self-Signed Sections: Cleaned up Admin Panel SSL Proxy and Self-Signed certificate forms per user request.",
      "SSL Certificate Management UI Redesign: Created a clean, modern single-section SSL installation layout with PEM inspection and target domain checklist.",
      "Enhanced Visual Hierarchy: Updated discovered services cards and installation form to adapt seamlessly across both Light and Dark themes with high-contrast text."
    ]
  },
  {
    version: "2.4.5",
    date: "2026-08-03",
    title: "Flexible Panel SSL Upstream & External Host Proxy Support",
    changes: [
      "Custom Panel Upstream URL Support: Added configurable backend target URL field (e.g. http://127.0.0.1:3000 or custom http://IP:PORT) for Admin Panel HTTPS Nginx reverse proxy.",
      "Remote & Separated Host SSL Proxying: Updated deployCertificatePipeline to support securing Raven Panel when hosted on a different machine or custom port from Matrix/Element.",
      "Smart Panel Upstream Validation: Prevented SSL deployment rollbacks when Raven Panel is hosted externally or starting up, while maintaining Nginx syntax validation."
    ]
  },
  {
    version: "2.4.4",
    date: "2026-08-03",
    title: "SSL Certificate Auto-Discovery & conf_name Script Execution Fix",
    changes: [
      "Fixed conf_name ReferenceError: Escaped bash template variable in ensureNginxSslSiteConfig to prevent Node.js execution runtime errors during SSL application.",
      "Comprehensive Nginx Server Block Discovery: Updated site block discovery to scan all server_name declarations across Nginx site configs, ensuring all domains are auto-discovered even before SSL certificates are generated.",
      "Robust Shell Awk Column Extraction: Corrected single-quote escaping in awk commands inside SSH bash scripts for accurate cert/key file path parsing."
    ]
  },
  {
    version: "2.4.3",
    date: "2026-08-03",
    title: "SSL Certificate Pipeline Shell Execution & Loopback Health Check Fix",
    changes: [
      "Shell Script Exit Code Normalization: Fixed exit code 1 thrown by SSH execution when Nginx site configs or SSL directories pre-existed or grep/test conditions evaluated to false.",
      "Base64 SSH Configuration Writer: Updated writeConfigContent SSH channel to write temporary certificate and key files via base64 decoding, preventing quoting and formatting syntax failures.",
      "Smart HTTPS Health Check Resilience: Added loopback resolution fallbacks (--resolve and Host headers) and graceful status code verification when Nginx syntax test and systemctl reloads succeed."
    ]
  },
  {
    version: "2.4.2",
    date: "2026-08-03",
    title: "Nginx Site Configuration Sync & English SSL Diagnostics Localization",
    changes: [
      "Nginx Sites Synchronization: Automatically updates domain server_name, ssl_certificate, and ssl_certificate_key paths across matrix.conf, element.conf, and wellknown.conf when Server Parameters or SSL Certificates are modified.",
      "English SSL Error Localization: Converted all certificate inspection, verification, and deployment error messages and response feedback to standard English."
    ]
  },
  {
    version: "2.4.1",
    date: "2026-08-03",
    title: "SSL/TLS Certificate Management Pipeline & Dual PEM/Separate Upload Support",
    changes: [
      "Auto-Discovery & Inspection Pipeline: Scans Nginx sites and Synapse homeserver TLS configs, extracting domains, SANs, and certificate issuer details.",
      "Dual Upload Mode Support: Integrated combined PEM (Cert + Key) and separate (.crt & .key) file upload modes with interactive PEM inspection.",
      "Warning Acknowledgement & Auto-Rollback: Added warnings display with explicit user confirmation checkbox and automatic backup/rollback deployment pipeline."
    ]
  },
  {
    version: "2.4.0",
    date: "2026-08-03",
    title: "Web Console Update Matrix Panel Tab Auto-Selection",
    changes: [
      "Web Console Update Button Routing: Clicking 'Update Matrix Panel' now automatically switches the active terminal view to the 'panel-updates' tab above the terminal, highlighting the tab and displaying system update status and options."
    ]
  },
  {
    version: "2.3.9",
    date: "2026-08-03",
    title: "Panel Analytics Chart Tooltip High-Contrast Styling",
    changes: [
      "Chart Tooltip Contrast Optimization: Added CustomChartTooltip component and explicit CSS rules ensuring chart hover tooltips display bright, high-contrast, bold text on dark backdrop in both Light and Dark themes across Panel Settings & Analysis."
    ]
  },
  {
    version: "2.3.8",
    date: "2026-08-03",
    title: "User Preferences UI Cleanup",
    changes: [
      "User Details Preferences Optimization: Removed Client Language selector, Messaging & Interaction Settings container, Element Web SettingsStore Precedence explanation box, interaction toggles (Send Read Receipts, Send Typing Notifications, Show Hidden Events, Show Stickers Button, WebRTC ICE Fallback), and Ignored Users section per user request."
    ]
  },
  {
    version: "2.3.7",
    date: "2026-08-01",
    title: "Raven Panel Installer Version & Terminal Diagnostics Display",
    changes: [
      "Installer Panel Version Display: Added dynamic PANEL_VERSION extraction and display (v2.3.7) to setup-panel.sh ASCII banner and final installation report summary.",
      "Terminal Environment Diagnostics: Added OS, CPU core count, system RAM, target directory, and systemd service status outputs in terminal setup-panel.sh script.",
      "Terminal Management Commands: Enhanced terminal completion report with quick management commands for journalctl logs, systemctl service control, and uninstaller execution."
    ]
  },
  {
    version: "2.3.6",
    date: "2026-08-01",
    title: "Stored Media File Upload Persistence & State Integration",
    changes: [
      "Unconditional Local Media Persistence Merging: Updated server GET /api/matrix/media endpoint to unconditionally merge items from db.matrixMedia into the active media list, resolving the issue where newly uploaded media items were hidden during server fetches.",
      "Optimistic Media List Updates: Added optimistic state prepending in KetesaAdmin.tsx when uploading new files, instantly showing uploaded media in the table.",
      "Asynchronous FileReader & Input Reset Fix: Wrapped FileReader onload handler in a try-catch block and reset input element value on completion to allow re-uploading files."
    ]
  },
  {
    version: "2.3.5",
    date: "2026-08-01",
    title: "Media Cleanup Light Theme & Stored Media Refresh Fix",
    changes: [
      "Light Theme Adaptability for Media Cleanup: Updated Purge Media Older Than and Purge Media of Specific Domain inputs and containers to dynamically use light background (white/slate-50) and borders in light mode instead of forced dark backgrounds.",
      "Stored Media List Refresh Button: Fixed media list refresh button above Stored Media Files table by attaching dedicated isRefreshingMedia loading state, animated spin icon, active click scale effect, and toast feedback upon completion.",
      "Full Light Mode Media Tab Styling: Extended light theme styling across media analytics widgets, format filter tabs, uploader/origin selects, and search input."
    ]
  },
  {
    version: "2.3.4",
    date: "2026-08-01",
    title: "Smooth Optimistic Email & Phone List State Management",
    changes: [
      "Eliminated Email & Phone List Flickering: Removed redundant fetchUserDetails background network request after adding/removing email and phone addresses, preventing consecutive state updates and list flickering.",
      "Seamless Array Merging: Updated frontend handlers to merge returned email and phone lists into existing component state using Set deduplication.",
      "Server Default Email Preservation: Enforced retention of default domain email along with newly added emails in server user details endpoint resolution."
    ]
  },
  {
    version: "2.3.3",
    date: "2026-08-01",
    title: "Contact Info Email & Phone Consolidation Fix",
    changes: [
      "Contact Info Multi-Email Consolidation: Resolved issue where adding new emails caused previous emails to vanish and replaced them with default fallbacks by consolidating emails across Synapse Admin API, Postgres user_threepids table, and db.matrixUsers local storage.",
      "Email & Phone Persistence: Guaranteed local user object creation/update in db.matrixUsers and Synapse Admin API / user_threepids table updates when adding or removing emails and phones.",
      "Optimistic State Integration: Updated frontend email and phone handlers in KetesaAdmin.tsx to merge server response arrays into local UI state seamlessly."
    ]
  },
  {
    version: "2.3.2",
    date: "2026-08-01",
    title: "Atomic Lock Session Revocation & Dedicated Account Status Helper Functions",
    changes: [
      "Atomic Lock Execution: Step 1 sets locked=true via PUT /_synapse/admin/v2/users/<encodeURIComponent(user_id)>. Step 2 fetches active devices via GET /_synapse/admin/v2/users/<encodeURIComponent(user_id)>/devices and revokes all active tokens via POST /_synapse/admin/v2/users/<encodeURIComponent(user_id)>/delete_devices.",
      "Reversible Unlock: Toggling locked=false executes Step 1 with locked=false without wiping devices.",
      "Dedicated Helper Functions: Implemented setSynapseUserLockStatus, setSynapseUserSuspendStatus, and setSynapseUserShadowBanStatus using URL-encoded MXID parameters."
    ]
  },
  {
    version: "2.3.1",
    date: "2026-08-01",
    title: "Official Matrix Synapse Account State Specifications (Locked, Suspended & Shadow Banned)",
    changes: [
      "Locked (locked: true): Prevents new login attempts returning 403 (M_USER_LOCKED). Invalidates existing sessions without deleting user messages or account history. Reversible via admin PUT /_synapse/admin/v2/users/<mxid>.",
      "Suspended (suspended: true): Enables read-only access (login & room reading allowed) while preventing write actions (message sending, invitations, room joins, profile updates). Reversible via admin PUT /_synapse/admin/v2/users/<mxid>.",
      "Shadow-Banned (shadow_banned: true): Suppresses message delivery to other room members silently without raising errors to the user. Reversible via admin PUT /_synapse/admin/v2/users/<mxid>."
    ]
  },
  {
    version: "2.3.0",
    date: "2026-08-01",
    title: "Locked User Visibility & Universal Multi-Key User Status Synchronization",
    changes: [
      "Flexible Multi-Key User Status Resolution: Added findUserRuleAndLocal helper to resolve user status rules across all MXID variations (@username:domain, username, @username) in /etc/matrix-synapse/user_status_rules.json and db.matrixUsers.",
      "Locked User Filter Visibility: Guaranteed that locked users appear in the Locked filter tab as well as in the All Users list view with status badges.",
      "Universal Un-Shadow-Ban & Unlock Fix: Updated /api/matrix/users/details/update to synchronize updates across all user key variations simultaneously in user_status_rules.json and db.matrixUsers, ensuring un-shadow-banning clean updates allow users to send messages.",
      "Optimistic Frontend User State Update: Updated handleUpdateUserParams in KetesaAdmin.tsx to match user status updates flexibly across MXID variations in local state."
    ]
  },
  {
    version: "2.2.9",
    date: "2026-08-01",
    title: "User Management Filter Synchronization for Locked, Suspended & Shadow Banned Users",
    changes: [
      "User List Status Rule Aggregation: Updated /api/matrix/users endpoint to merge rules from /etc/matrix-synapse/user_status_rules.json and Postgres columns (locked, suspended, shadow_banned) into the user list.",
      "Filter Accuracy: Ensured users filtered by Locked, Suspended, Shadow Banned, Active, Deactivated, and Admins display accurately according to their synchronized status.",
      "Optimistic List State Update: Updated handleUpdateUserParams in UI to immediately reflect user status changes in the main list state."
    ]
  },
  {
    version: "2.2.8",
    date: "2026-08-01",
    title: "User Management Shadow-Ban Visibility & Un-Shadow-Ban State Synchronization",
    changes: [
      "Un-Shadow-Ban State Synchronization: Updated user details endpoint to synchronize shadow ban updates across Synapse Admin API v2/v1, PostgreSQL database users table, user_status_rules.json, and db.matrixUsers.",
      "Prominent User Details Status Badges: Added live status badges (Shadow Banned, Suspended, Locked, Admin) in the User Management modal header and identity card for instant verification.",
      "User Management Details UI Cleanup: Removed Disable Client-Side Password Change flag from user details modal and update handler."
    ]
  },
  {
    version: "2.2.7",
    date: "2026-08-01",
    title: "User Management Details UI Cleanup & AD User Password Reset Guard",
    changes: [
      "User Management Details UI Cleanup: Removed deprecated flags (Disable Client-Side Account Deactivation, Erased, Disable Client-Side Avatar Change) from user details panel and parameters handler.",
      "Active Directory Password Reset Guard: Added checkIsAdUser helper and UI notice warning that Active Directory user passwords must be changed directly in Active Directory, while keeping local user password resets enabled."
    ]
  },
  {
    version: "2.2.6",
    date: "2026-08-01",
    title: "In-Memory Native Node.js Crypto Certificate & Key Matcher Fix",
    changes: [
      "In-Memory Crypto Verification: Resolved SSL key validation failure ('Private key does not match PEM certificate') by utilizing Node's native crypto module (crypto.createPrivateKey & crypto.X509Certificate) directly in server.ts memory.",
      "Zero Shell / SSH Escaping Issues: Completely bypasses remote SSH command escaping, csplit missing dependencies, and OpenSSL MD5 formatting discrepancies, supporting all RSA, ECDSA, EC, PKCS#1, and PKCS#8 key formats."
    ]
  },
  {
    version: "2.2.5",
    date: "2026-08-01",
    title: "Universal Cross-Algorithm PEM Key Verification & Informative Persian Error Diagnostics",
    changes: [
      "Universal Key Matcher: Upgraded SSL verification (verifyCertAndKeyMatch) to extract and compare Public Keys from certificates and private keys using OpenSSL pkey/rsa/ec commands, supporting ECDSA, EC, RSA 2048/4096, PKCS#1, PKCS#8, and fullchain PEM bundles without false 'Modulus mismatch' errors.",
      "Clear Persian Diagnostics: Replaced generic error responses with informative Persian error messages explaining key password/format errors, public key mismatches, or fullchain sequence issues in the UI."
    ]
  },
  {
    version: "2.2.4",
    date: "2026-08-01",
    title: "Universal Target Remote Server PEM SSL Deployment & Standalone Matrix/Element Engine",
    changes: [
      "PEM Deployment Pipeline: Ensures uploaded PEM certificates and private keys are deployed directly to the target remote server where Matrix/Element are running, populating both /etc/nginx/ssl and /etc/letsencrypt/live paths with restricted permissions (chmod 600 key).",
      "Dynamic Nginx Config & Standalone Handling: Intelligently updates existing Nginx configuration files matching the domain, or auto-generates dedicated Nginx server blocks tailored for standalone Matrix homeservers (proxying 8008), Element web clients, or the Raven Admin Panel."
    ]
  },
  {
    version: "2.2.3",
    date: "2026-08-01",
    title: "Deep Target Server Domain Discovery & Multi-Location SSL Inspection Engine",
    changes: [
      "Deep Remote Domain Scanner: Implemented deep server-side bash discovery querying active connection domains, Let's Encrypt directories (/etc/letsencrypt/live & /etc/letsencrypt/renewal), certbot certificates, recursive Nginx server_name search across all site files, OpenSSL cert SAN/CN extraction, and homeserver/element config files.",
      "Multi-Location Certificate Status Check: Updated /api/certificates/status to inspect /etc/nginx/ssl/, /etc/letsencrypt/live/, /etc/ssl/certs/, /etc/matrix/ssl/ and Nginx ssl_certificate directives to detect valid or self-signed certs.",
      "Universal Certificate Downloader: Upgraded /api/certificates/:domain/download to dynamically search and serve certificate files across all server SSL paths."
    ]
  },
  {
    version: "2.2.2",
    date: "2026-08-01",
    title: "SSL UI Light Textbox Backgrounds, Custom Domain Additions & Self-Signed CRT Download Engine",
    changes: [
      "Light Textbox Backgrounds: Converted all text box, text area, select, and subdomain list backgrounds in the SSL Certificate page to bright, light, high-contrast colors (slate-800/slate-100) for maximum legibility.",
      "Custom Domain Additions: Added a '+ Add Domain' input control allowing users to manually register any custom subdomain for instant SSL PEM installation or self-signed cert generation.",
      "Self-Signed CRT Generation & Download Fix: Implemented async blob download handler in ConfigForms.tsx and added fallback generation for custom domains in /api/certificates/generate-self-signed."
    ]
  },
  {
    version: "2.2.1",
    date: "2026-08-01",
    title: "SSL Certificate UI Fix & Missing Icon Dependency Patch",
    changes: [
      "Fixed Blank Screen in SSL Certificate Tab: Added missing Eye icon import from lucide-react in ConfigForms.tsx to resolve Uncaught ReferenceError on Certificate Management tab load."
    ]
  },
  {
    version: "2.2.0",
    date: "2026-08-01",
    title: "Automated Multi-Domain Wildcard PEM Certificate Deployment & Admin Panel SSL Proxying",
    changes: [
      "Automated PEM & Key Inspection: Created /api/certificates/inspect-pem to extract SANs, expiration, wildcard status (*.domain.com), and modulus matching between certificate and private key.",
      "Multi-Domain & Wildcard SSL Batch Deployment: Added /api/certificates/apply-multi-domain endpoint to automatically deploy a single PEM / Wildcard certificate to all discovered subdomains (Matrix, Element, Sliding Sync, etc.) and configure Nginx SSL site blocks in a single operation.",
      "Admin Panel SSL Proxying (Port 443 -> Port 3000): Added dedicated Nginx SSL proxy configuration (/etc/nginx/sites-available/raven-panel.conf) to secure the Admin Panel itself over HTTPS port 443 with WebSocket/HMR reverse proxying.",
      "Subdomain Selection & Checklist UI: Enhanced Certificate Management with interactive checkboxes, Select All/Deselect All options, live inspection feedback, and automatic domain matching."
    ]
  },
  {
    version: "2.1.0",
    date: "2026-08-01",
    title: "Certificate Management in Control Hub & Active User Session 3-Dots Popup Dropdown with Real-Time Dock Verification",
    changes: [
      "Certificate Management Engine & UI: Integrated complete SSL/TLS Certificate Management into Control Hub with automatic domain discovery from homeserver.yaml, server_name.yaml, and Nginx site configs. Supports PEM/Key upload, modulus validation via OpenSSL, self-signed cert generation, backup/rollback, and Nginx reload.",
      "Active Logged-In User Sessions 3-Dots Dropdown: Replaced static buttons on Active Logged-In User Sessions cards and client device cards with a 3-dots (MoreVertical) popup dropdown menu supporting elevated z-index (z-30) and adaptive light/dark mode styling.",
      "Real-Time Dock & Action Session Verification: Configured global fetch 401 response interceptor, pre-navigation dock verification in App.tsx (handleViewChange), and 10-second background verification pulse. Clicking any dock item or panel control instantly verifies session state and kicks revoked users to the login screen.",
      "Solid ASCII Raven Installer & Credits: Updated setup-panel.sh and uninstall-panel.sh with a solid block ASCII Raven banner, developer credit (Masoud Shahbazi - https://www.linkedin.com/in/masoudshahbazi/), and default owner credentials (admin/admin)."
    ]
  },
  {
    version: "2.0.9",
    date: "2026-07-31",
    title: "Installer/Uninstaller Solid ASCII Banner, Developer Credit & Default Password Update",
    changes: [
      "Solid ASCII Raven Banner: Overhauled the installer setup (setup-panel.sh) and uninstaller (uninstall-panel.sh) headers with a solid block ASCII art banner.",
      "Developer Credit & LinkedIn Link: Added developer credit header (Developer: Masoud Shahbazi - https://www.linkedin.com/in/masoudshahbazi/) beneath the Raven title banner.",
      "Default Owner Credentials Update: Updated initial owner default credentials in setup-panel.sh from admin123456 to username 'admin' and password 'admin'."
    ]
  },
  {
    version: "2.0.8",
    date: "2026-07-31",
    title: "Active Logged-In User Sessions 3-Dots Popup Dropdown & Instant Dock/Interaction Session Verification",
    changes: [
      "Active Logged-In User Sessions 3-Dots Dropdown: Replaced inline action buttons on Active Logged-In User Sessions cards with a sleek, compact 3-dots (MoreVertical) popup dropdown menu supporting elevated z-index (z-30) and adaptive light/dark mode styling.",
      "Instant Dock & Interactivity Session Verification: Configured a global fetch 401 response interceptor and pre-navigation verification in App.tsx (handleViewChange). Clicking any dock item or triggering any panel action immediately validates session state and kicks revoked users to the login screen."
    ]
  },
  {
    version: "2.0.7",
    date: "2026-07-31",
    title: "RBAC System Operators Card Dropdown Z-Index Elevation & Adaptive Light Theme Styling",
    changes: [
      "Z-Index Stacking Elevation: Dynamically updated active RBAC operator card container styling with relative z-30 overflow-visible when the 3-dots actions menu is toggled open, preventing menu truncation or clipping under cards below.",
      "Adaptive Light Theme Dropdown Styling: Replaced dark fixed slate background with responsive light/dark background themes (bg-white/95 with slate border in light mode, bg-slate-900/95 in dark mode) for flawless readability."
    ]
  },
  {
    version: "2.0.6",
    date: "2026-07-31",
    title: "Instant Kicked User Logout & Active System Operators Card Overflow Fix with 3-Dots Dropdown",
    changes: [
      "Instant Kicked User Logout: Configured active token and user invalidation middleware along with a periodic background auth check in App.tsx. When a user session is terminated/kicked, the target client is immediately thrown out of the panel and redirected to the login screen.",
      "Active System Operators Overflow Prevention: Added responsive flex wrapping, truncate properties, and max-width constraints to the RBAC Active System Operators cards to ensure no items leak outside the card container.",
      "3-Dots Operator Actions Dropdown: Replaced static inline action buttons (Edit Permissions, Change Password, Delete User) with a sleek, compact 3-dots popup menu button (MoreVertical) with backdrop overlay support."
    ]
  },
  {
    version: "2.0.5",
    date: "2026-07-31",
    title: "Active Panel User Sessions UI Card Layout Fix, Online Users Filtering & Force Logout Management",
    changes: [
      "Active Sessions Card Overflow Fix: Completely overhauled the Active Panel User Sessions card layout with responsive flex wrapping, text truncation, and tight badge spacing to prevent key action buttons and role tags from leaking outside the card container.",
      "Online-Only Active Session Filtering: Updated the Active User Sessions list to display exclusively logged-in users with active panel sessions instead of all registered database users.",
      "Force Logout / Kick Session Support: Added a Force Logout ('Kick') action button for administrators to terminate and invalidate active user sessions directly from the Session Panel.",
      "Save Buttons Styling Refinement: Applied explicit bold white text (text-white font-bold) to both Session Settings and Role Timeout Matrix save buttons."
    ]
  },
  {
    version: "2.0.4",
    date: "2026-07-31",
    title: "All Logged-In Active User Sessions Display & User Password Change Management",
    changes: [
      "All Active Panel User Sessions: Expanded the Current Active Session card in Reports & Admin -> Session Panel to list all registered panel users with role badges, live session status indicators, and individual activity/idle timers.",
      "Panel User Password Management: Added secure password change modal and backend API endpoint (PUT /api/users/:id/password) allowing administrators to change passwords for any panel user with strong password generator support.",
      "RBAC Password Action Button: Integrated password change key buttons directly into the Role-Based Access Control (RBAC) panel user list items."
    ]
  },
  {
    version: "2.0.3",
    date: "2026-07-31",
    title: "Real-time Remote Server WebSocket Connection Status & Disconnected Banner Indicator",
    changes: [
      "Real-time WebSocket Connection Monitor: Integrated central WebSocket connection state tracking (open, close, error, reconnect) for active remote server profiles.",
      "Dynamic Disconnect Banner UI: Updated top 'Connected Server Profile' card to instantly switch to red highlight, display blinking red disconnect indicator, show custom 'DISCONNECTED' badge and lost-connection message when WebSocket connection drops.",
      "Retry Connection Action: Added retry and reconnect handlers to automatically restore WebSocket telemetry and re-sync status."
    ]
  },
  {
    version: "2.0.2",
    date: "2026-07-31",
    title: "Granular Permission Matrix Edit Fix & Custom Role Dropdown UX Refinement",
    changes: [
      "Fixed Error Saving Permission Matrix: Resolved role conflict in server permission update route and permission modal handlers so custom granular permissions save seamlessly for both existing and new operators.",
      "Custom Role Dropdown UX Refinement: Removed persistent inline custom permissions box below new user dropdown; selecting Custom now immediately opens the matrix table modal and closing or cancelling resets role dropdown to Viewer."
    ]
  },
  {
    version: "2.0.1",
    date: "2026-07-31",
    title: "RBAC Edit Button Compact UI & Modal Permission Save Fix",
    changes: [
      "Compact RBAC Edit Button: Compacted padding and font sizing of 'ویرایش دسترسی' button to fit perfectly in operator table rows without overflow.",
      "Fixed Permissions Save Handler: Resolved 'Error saving permissions' error when saving custom modal permissions by invoking onUpdateUserPermissions directly and safeguarding default Owner/admin role restrictions."
    ]
  },
  {
    version: "2.0.0",
    date: "2026-07-31",
    title: "RBAC Edit Permissions Modal & Role Quick Presets",
    changes: [
      "Updated RBAC User Button: Replaced the 'Toggles' button with 'ویرایش دسترسی‌ها' (Edit Permissions) with a ShieldCheck icon to intuitively manage operator permissions.",
      "Added Role Quick Presets: Introduced quick template buttons ('👑 Full Admin', '🛡️ Moderator', '👁️ Viewer') inside the permission matrix modal to quickly populate operator permissions.",
      "Role Preset Alignment: Standardized default permissions for standard roles (Owner, Super Admin, Moderator, Viewer) when opening custom permission matrices."
    ]
  },
  {
    version: "1.9.9",
    date: "2026-07-31",
    title: "RBAC Initial Tab Selection & Subtab Lazy Resolution Fix",
    changes: [
      "Fixed Default Tab Selection in Matrix Admin: Resolved issue where custom role users with specific permissions (e.g., Report Management) were initially shown the User Management tab on component mount before redirecting.",
      "Dynamic Initial Tab Resolution: Implemented getInitialTab lazy initialization in KetesaAdmin.tsx and getInitialSubTab in ReportingPanel.tsx so active tabs directly compute based on granted custom permissions on the very first render.",
      "RBAC Modal Permissions Persistence: Reinforced sequential error handling and target ID resolution for custom user permissions matrix saving."
    ]
  },
  {
    version: "1.9.8",
    date: "2026-07-31",
    title: "Granular Permission Matrix Modal Save & Role Sync Fix",
    changes: [
      "Fixed Permission Matrix Save Logic: Enabled automatic role escalation to 'Custom' when updating granular user matrix and added ID/username target resolution fallback so user permissions save seamlessly.",
      "Resolved Modal Exception Flow: Chained onChangeUserRole and onUpdateUserPermissions calls sequentially with proper async error handling to prevent false positive toast error messages."
    ]
  },
  {
    version: "1.9.7",
    date: "2026-07-31",
    title: "Custom Granular RBAC Persistence & API Auth Error Resilience Fix",
    changes: [
      "Fixed Custom User Permissions Saving: Updated checkPermission middleware in server.ts and PUT /api/users/:id/permissions endpoint so custom granular permissions (manage_rbac) can be modified and persisted seamlessly without 403 Forbidden errors.",
      "Resolved 403 Forbidden Console Chain: Fixed token verification check in App.tsx so expired or invalid tokens automatically clear local auth state and prompt login instead of causing consecutive 403 network failures.",
      "Fixed 'data.find is not a function' TypeError: Added Array.isArray checks on connections, users, audit logs, and backups fetch handlers to ensure error objects never corrupt array states.",
      "Google Fonts Vazirmatn Import: Added Google Fonts CDN font import to index.css to eliminate browser OTS WOFF2 font conversion warnings."
    ]
  },
  {
    version: "1.9.6",
    date: "2026-07-31",
    title: "Spatial Dock Item Restoration & Hover Tooltip Update",
    changes: [
      "Fixed Spatial Dock Truncation: Restored full dock item visibility (Dashboard, Homeserver, Matrix Admin, Web Console, Panel Settings & Analysis, Connections) by ensuring default items and array merging dynamically merge saved orders",
      "Dock Hover Label Update: Updated hover tooltip for the Analytics icon to display 'Panel Settings & Analysis' across all language modes"
    ]
  },
  {
    version: "1.9.5",
    date: "2026-07-31",
    title: "Granular RBAC Enforcement, Instant Custom Modal Trigger, and Localization Fixes",
    changes: [
      "Renamed Analytics Tab: Successfully renamed 'Analytics' tab and header title to 'Panel Settings & Analysis' (پنل تنظیمات و آنالیز)",
      "Strict UI Localization for Custom Role: Fixed 'Custom (سفارشی)' text in English UI mode so that custom roles display cleanly based on selected UI language",
      "Instant Custom Permissions Modal Trigger: Choosing 'Custom' role in user creation or user table now opens the permissions modal table immediately",
      "Granular RBAC Enforcement: Integrated custom permissions into SpatialDock, App view router, server auth verify API, and KetesaAdmin tab rendering so operators only see authorized modules and tabs"
    ]
  },
  {
    version: "1.9.4",
    date: "2026-07-31",
    title: "Theme-Aware Sleek Table Modal for Custom Permissions Matrix & Panel Settings Localization",
    changes: [
      "Light-Theme Compatible Custom RBAC Modal: Replaced inline & simple dark modal with a sleek, responsive table-based modal matching both Light and Dark themes",
      "Module Category Filtering & Search: Added quick category tabs (Messaging, Users, Control Hub, Security) and instant search filtering inside the custom permissions modal",
      "Dynamic Dual-Language RBAC Labels: Ensured all 14 custom permissions display English titles/descriptions when English UI is selected, and Persian labels when Persian is selected",
      "Renamed Analytics Tab: Renaming 'Analytics' tab to 'Panel Settings & Analysis' (پنل تنظیمات و آنالیز) in all translations"
    ]
  },
  {
    version: "1.9.3",
    date: "2026-07-31",
    title: "Granular Custom Role-Based Access Control (Custom RBAC Matrix)",
    changes: [
      "Custom Role Definition: Added new Custom role option in RBAC management allowing admins to configure explicit feature access toggles for each operator",
      "Granular Permission Matrix (14 Toggles): Implemented 14 customizable toggles covering messaging, room viewing, room moderation, reported messages, Matrix user management, server connections, Control Hub views, stack settings, cleanup controls, stored media, RBAC management, audit logs, performance analysis, and quick tasks",
      "Interactive Toggle Matrix & Modal: Created inline permission selector for creating new users and an interactive modal drawer for managing active operators' custom access rights",
      "Server & DB Persistence: Updated /api/users, /api/users/:id/role, and /api/users/:id/permissions endpoints to store, update, and audit log granular custom permissions"
    ]
  },
  {
    version: "1.9.2",
    date: "2026-07-31",
    title: "Server Config Audit Log Refresh UI & Spinner Enhancements",
    changes: [
      "Interactive Refresh Button Feedback: Added minimum visual spinner delay, disabled button state, and live status label (در حال به‌روزرسانی...) to Server Configuration & File Audit Log",
      "Table Loading State: Added dedicated animated spinner row inside config log table while fetching remote log items",
      "Toast Confirmation: Dispatched success toast notification upon completing log refresh"
    ]
  },
  {
    version: "1.9.1",
    date: "2026-07-31",
    title: "Comprehensive Automatic Logging across Control Hub, Matrix Users & Server Files",
    changes: [
      "Server-Wide Config Audit Integration: Connected writeConfigContent and logConfigChange helper across all server config writers",
      "Control Hub & Matrix Users Audit Trail: Integrated config log dispatching for user parameter updates, rate limit modifications, password resets, room controls, and file editing",
      "Granular File & Line Tracking: Captures operator usernames, target file paths, parameter names, old/new values, byte lengths, and delta summaries"
    ]
  },
  {
    version: "1.9.0",
    date: "2026-07-31",
    title: "Server Configuration & Target Host File Change Audit Log (لاگ کانفیگ)",
    changes: [
      "Config Change Audit Logs Tab (لاگ کانفیگ): Implemented dedicated Server Configuration & File Audit Log section in ReportingPanel for granular tracking of target server modifications",
      "Granular Change Logging & Diffs: Added /api/logs/config backend API and automatic logging in writeConfigContent to log target host file paths, modified parameters, old/new values, diff summaries, and operator details",
      "Export & Inspection Tools: Added CSV export, custom HTML report generation, action/file filters, search controls, and full detail modal dialog for configuration change logs"
    ]
  },
  {
    version: "1.8.43",
    date: "2026-07-31",
    title: "Global Container Styling Harmonization & Policy Card Background Alignment",
    changes: [
      "Global Container Theme Harmonization: Unified Stored Media, Active Tokens, and Managed Users list containers to use bg-black/25 with border-white/5, perfectly aligning with Message Sending Rate Limits card styling",
      "Table Header Refinement: Updated table header rows across media cleanup and user management modules to subtle bg-black/20"
    ]
  },
  {
    version: "1.8.42",
    date: "2026-07-30",
    title: "Accurate Dynamic MXC URI Domain Resolution for Local Media Content",
    changes: [
      "Dynamic MXC Domain Resolution: Fixed media repository scanner to derive local content MXC URIs directly from user_id domains (@user:local_domain) or active server name rather than falling back to default matrix.org or generic placeholders",
      "Remote Media Origin Isolation: Ensured remote content cache records accurately retain media_origin domains in MXC URIs"
    ]
  },
  {
    version: "1.8.41",
    date: "2026-07-30",
    title: "Strict User Language Isolation for SMTP Gateway Testing",
    changes: [
      "Explicit Language Prioritization: Ensured /api/matrix/smtp/test strictly honors body parameter 'lang' over Accept-Language browser headers when returning error toasts and diagnostics",
      "Robust Remote Agent Output Extraction: Updated error string parsing in Node server to extract exact Python output following 'SMTP_TEST_ERROR:' without prefix leaks"
    ]
  },
  {
    version: "1.8.40",
    date: "2026-07-30",
    title: "Localization Fix for SMTP Gateway Test Messages & Git Sync Integration",
    changes: [
      "Strict Language Localization: Updated /api/matrix/smtp/test API endpoint and Python SMTP test script to detect user language preference ('lang') and return English error and status messages when English mode is active",
      "English Connection Diagnostic Guidance: Provided clear English diagnostic outputs for Connection Refused and Timeout errors on SMTP test dispatcher when language is not set to Persian",
      "Git Push Sync Integration: Configured git remote with PAT token for continuous commit and push workflows"
    ]
  },
  {
    version: "1.8.39",
    date: "2026-07-30",
    title: "Fix Matrix Synapse Config Rollback Bug (Removed Invalid force_tls Key)",
    changes: [
      "Removed Invalid Schema Property: Eliminated unrecognized 'force_tls' key from Synapse homeserver.yaml generation that caused Synapse service restart failure and configuration rollback",
      "Valid Email Options: Preserved valid Synapse email parameters ('require_transport_security' and 'enable_tls')",
      "Clean Credential Handling: Automatically cleans up empty SMTP user/pass and client_base_url keys from homeserver.yaml"
    ]
  },
  {
    version: "1.8.38",
    date: "2026-07-30",
    title: "Smart Port Diagnostics & Auto Port Scanner for Connection Refused Error",
    changes: [
      "Automated Port Diagnostic Scanner: Added real-time TCP socket scanner to Python test script that tests ports 25, 465, 587, and 2525 upon encountering [Errno 111] Connection Refused or Timeout",
      "Persian Troubleshooting Advice: Provides clear diagnostic output pointing out which ports are open on the target SMTP server or local loopback (127.0.0.1) so admins can switch ports effortlessly",
      "Detailed Connection Diagnostics: Replaces cryptic Python stack traces with human-readable Persian advice explaining firewall, port, and IP connectivity status"
    ]
  },
  {
    version: "1.8.37",
    date: "2026-07-30",
    title: "Fix Python Shell Execution SyntaxError in Remote SMTP Test Dispatcher",
    changes: [
      "Base64 Python Execution: Encoded Python script payload into Base64 (`python3 -c \"import base64; exec(...)\"`) to eliminate multiline character escaping and shell quote collision issues across SSH/Agent remote execution",
      "Robust Variable Passing: Utilized `JSON.stringify` for Python variable injection ensuring clean string escaping for passwords and special characters",
      "SSL/TLS Fallback Context: Included SSL context overrides (`ssl.CERT_NONE`) in Python smtplib dispatcher for seamless connectivity to servers with custom or internal certificates"
    ]
  },
  {
    version: "1.8.36",
    date: "2026-07-30",
    title: "Expanded Synapse SMTP Options & Token Auth Fix for Test Email Dispatch",
    changes: [
      "Authentication Token Fix: Resolved 401 (Unauthorized) error on SMTP test endpoint by providing multi-level token fallback (authToken, admin_token, matrix_auth_token)",
      "Expanded Synapse SMTP Parameters: Added UI controls and backend Synapse config support for enable_notifs, require_transport_security (TLS/SSL), enable_tls (STARTTLS), and client_base_url",
      "SMTP Port Presets & Toggles: Added quick port selector badges (587 STARTTLS, 465 SSL/TLS, 25, 2525) and interactive security toggle switches in the SMTP Email Gateway section"
    ]
  },
  {
    version: "1.8.35",
    date: "2026-07-30",
    title: "Fix Non-JSON Response Handling in SMTP Test Endpoint & Restart Server",
    changes: [
      "Response Handling Fix: Updated frontend SMTP test response handler to check Content-Type header before parsing JSON, preventing SyntaxError on non-JSON server responses",
      "Server Endpoint Active: Restarted Node dev server to ensure /api/matrix/smtp/test API endpoint is live and accepting POST requests",
      "Graceful Fallback: Provides clear user error messages if endpoint returns HTML or unexpected status codes"
    ]
  },
  {
    version: "1.8.34",
    date: "2026-07-30",
    title: "Add SMTP Gateway Test Email Dispatcher",
    changes: [
      "SMTP Test Dispatcher UI: Added an interactive test email panel in the SMTP Email Gateway section allowing administrators to enter a recipient address and verify email delivery",
      "Real Email Delivery API: Integrated a dedicated backend endpoint (/api/matrix/smtp/test) utilizing nodemailer and Python smtplib for remote SSH/agent nodes",
      "Detailed Diagnostics: Returns comprehensive diagnostic feedback including server response codes, TLS handshakes, and delivery confirmations"
    ]
  },
  {
    version: "1.8.33",
    date: "2026-07-30",
    title: "Move Configuration Backups & Rollback Block to Backup & Snapshots Tab",
    changes: [
      "Configuration Backups Relocation: Transferred the 'Configuration Backups & Rollback' snapshots list and instant rollback controls from Network Listener into the dedicated 'Backup & Snapshots' tab in Control Hub",
      "Network Listener Quick Redirect: Replaced the rollback block in Network Listener with a prominent notice card guiding users to the Rollback & Backups tab with a single click",
      "Unified Recovery Workspace: Consolidated manual backups, database dumps, JSON uploads, automated cron schedulers, and configuration rollback snapshots in one centralized view"
    ]
  },
  {
    version: "1.8.32",
    date: "2026-07-30",
    title: "Relocate Backup & Snapshot UI to Control Hub in Homeserver Page",
    changes: [
      "UI Relocation: Moved the Backup & Snapshot management UI from the Analytics/Reports page into a dedicated tab in Control Hub (Homeserver Configuration page)",
      "Redundancy Cleanup: Removed duplicate Backup & Snapshot view from ReportingPanel and connected backup actions directly to App state",
      "Full Functional Continuity: Preserved all backup triggering, disk storage configuration, automated cron schedulers, JSON backup imports, and restore workflows without changing backend endpoints"
    ]
  },
  {
    version: "1.8.31",
    date: "2026-07-30",
    title: "Remove Redundant Matrix Users Section from Control Hub",
    changes: [
      "Control Hub Cleanup: Removed the 'Matrix Users' tab and registry form from Control Hub in Homeserver configuration page",
      "Redundancy Elimination: Streamlined user management workflows by delegating user registration exclusively to 'Register New User' in Matrix Admin"
    ]
  },
  {
    version: "1.8.30",
    date: "2026-07-30",
    title: "Allow Custom Homeserver URL Toggle Title & Logic Inversion",
    changes: [
      "Title & Label Update: Added 'Allow' prefix resulting in 'Allow Custom Homeserver URL in Element Web (disable_custom_urls)'",
      "Logic Inversion: Updated toggle behavior so ON allows entering custom homeserver URLs (disable_custom_urls: false) and OFF locks custom URLs to the configured server (disable_custom_urls: true)"
    ]
  },
  {
    version: "1.8.29",
    date: "2026-07-30",
    title: "Allow Public Account Registration Synchronization & Element Lock",
    changes: [
      "Title & Description Update: Updated toggle title to 'Allow Public Account Registration' with detailed explanation of allowed vs locked behavior",
      "Element Client Lock Integration: Synchronized disable_registration in Element Web config.json with homeserver enable_registration toggle so turning off registration locks Element Web signups"
    ]
  },
  {
    version: "1.8.28",
    date: "2026-07-30",
    title: "Registration & Presence Toggles & Card Theme Matching",
    changes: [
      "Registration & Presence Toggle Conversion: Converted Public Account Registration and Presence System Tracking options into animated toggle switches inside the Policy section",
      "Unified Card Background: Harmonized the background color of all policy toggle cards to bg-black/25 with subtle border styling matching the Message Sending Rate Limits container"
    ]
  },
  {
    version: "1.8.27",
    date: "2026-07-30",
    title: "Server Configuration Toggle State Synchronization",
    changes: [
      "Server Config Sync: Ensured all policy toggle switches on the Limits & Policies page directly reflect live server configuration state",
      "Tab Opening Refresh: Automatically re-fetches policy configuration whenever the user navigates to the Policies tab",
      "Unified State Binding: Bound client profile editing states (name & avatar) to server-side display name and avatar policies for active/inactive accuracy"
    ]
  },
  {
    version: "1.8.26",
    date: "2026-07-30",
    title: "Client Policy Relocation & Toggle Switch Standardization",
    changes: [
      "Policy Page Integration: Transferred Send Typing Notifications, Transmit Read Receipts, Allow Display Name Changes, and Allow Avatar Picture Changes from Client Defaults to the Policy Page",
      "Toggle Switch Controls: Converted all 4 transferred options into modern animated toggle switch controls",
      "Clean Policy Grid: Re-organized Policy page controls into a unified 2-column grid layout with clean RTL/LTR localization support"
    ]
  },
  {
    version: "1.8.25",
    date: "2026-07-30",
    title: "Policy Toggles Grid Redesign & Localized Switch Controls",
    changes: [
      "Policy Toggle Switches: Converted all policy options (including Lock Homeserver URL) into modern smooth animated toggle switch controls",
      "2-Column Grid Layout: Re-architected long full-width policy rows into a compact, responsive 2-column grid layout",
      "Clean Localization: Removed slash-separated bilingual strings in favor of dynamic language rendering via isRtl"
    ]
  },
  {
    version: "1.8.24",
    date: "2026-07-30",
    title: "Element Web Homeserver URL Lock Policy",
    changes: [
      "Homeserver URL Lock: Added 'Lock Homeserver URL in Element Web (disable_custom_urls)' control in Limits & Policies tab",
      "Element config.json Integration: Automatically syncs disable_custom_urls setting in Element Web config.json to prevent users from connecting to unapproved external homeservers"
    ]
  },
  {
    version: "1.8.23",
    date: "2026-07-30",
    title: "Revert Codebase to v1.8.18",
    changes: [
      "Codebase Revert: Restored all code state to commit 55b7d7ce35be2b609873e39d3789c67ed24f14b3 (v1.8.18) as requested by the user"
    ]
  },
  {
    version: "1.8.18",
    date: "2026-07-29",
    title: "Inspect Room Warning Modal Language Fix & Localization Cleanup",
    changes: [
      "Strict Language Separation: Cleaned inspect room security modal localization to remove mixed Persian characters from English language mode",
      "Owner Access Restriction: Enforced Owner role check on inspect chat buttons in Room Management, User History Inspector, and Reports",
      "Interactive Confirmation Modal: Added shake animation, warning icons, and exact confirmation phrase validation before entering room inspection"
    ]
  },
  {
    version: "1.8.17",
    date: "2026-07-29",
    title: "Owner-Only Room Inspection Policy & Security/Privacy Warning Confirmation Modal",
    changes: [
      "Owner Role Exclusive Access: Restricted room and group inspection (Inspect Chat/Room) exclusively to Owner role level, hiding inspect controls for all other roles",
      "Interactive Privacy Warning Modal: Replaced direct room joining with a mandatory security warning modal alerting the Owner that joining inspects the room with their account presence",
      "Confirmation Word Validation: Implemented confirmation input box requiring exact phrase ('تایید' / 'INSPECT') to enable final confirmation button",
      "Light Theme Compatibility & Red Privacy Alerts: Styled modal with clean light mode aesthetics, high-contrast red privacy warnings, warning icons, and subtle gentle-shake attention animation"
    ]
  },
  {
    version: "1.8.16",
    date: "2026-07-29",
    title: "Dedicated RoomCreationBlocker Module with on_create_room Third-Party Callback",
    changes: [
      "Dedicated RoomCreationBlocker Module: Created standalone Python module (room_creation_blocker.RoomCreationBlocker) implementing official on_create_room third-party rules callback",
      "Universal Auto-Installation: Automatically creates /opt/synapse-modules/room_creation_blocker.py and copies across all Python site-packages/dist-packages on target servers",
      "Clean Dynamic Registration: Registers module in homeserver.yaml under modules: when room creation is disabled and cleanly removes it when enabled",
      "HTTP 403 (M_FORBIDDEN) Enforcement: Rejects non-admin room/space creation with HTTP 403 M_FORBIDDEN error directly from Synapse engine"
    ]
  },
  {
    version: "1.8.15",
    date: "2026-07-29",
    title: "Synapse UserFlagsModule Room Creation Restriction Policy",
    changes: [
      "UserFlagsModule Room Creation Hook: Implemented room creation restrictions directly inside matrix_user_flags_module.UserFlagsModule via user_may_create_room callback",
      "M_FORBIDDEN Error Handling: Non-admin room/space creation attempts are rejected with HTTP 403 (M_FORBIDDEN) when policy is disabled",
      "YAML Cleanup: Completely removed invalid enable_room_creation YAML parameter from homeserver.yaml and conf.d files",
      "User Status Rules Sync: Policy is persisted in /etc/matrix-synapse/user_status_rules.json under global_policies with automatic module re-injection and Synapse restart"
    ]
  },
  {
    version: "1.8.14",
    date: "2026-07-29",
    title: "Dedicated Permit Room Creation Policy Toggle & Sync",
    changes: [
      "Permit Room Creation Toggle: Converted 'Permit Room Creation' into a dedicated switch in Limits & Policies",
      "Key Isolation: Toggling Permit Room Creation exclusively controls enable_room_creation in homeserver.yaml and conf.d files",
      "Multi-File & Restart Sync: Synchronizes enable_room_creation across /etc/synapse/conf.d and /etc/matrix-synapse/homeserver.yaml with automatic Synapse restart and health verification"
    ]
  },
  {
    version: "1.8.13",
    date: "2026-07-29",
    title: "Strict Single-Key Targeting for Display Name & Avatar Toggles",
    changes: [
      "Explicit Key Isolation: Toggling 'Allow Users to Change Display Name' exclusively sets enable_set_displayname in homeserver.yaml and conf.d files",
      "Explicit Avatar Key Isolation: Toggling 'Allow Users to Change Avatar' exclusively sets enable_set_avatar_url in homeserver.yaml and conf.d files",
      "Homeserver.yaml Auto-Creation & Sync: Ensures /etc/matrix-synapse/homeserver.yaml receives direct root-level key modifications without touching un-toggled settings"
    ]
  },
  {
    version: "1.8.12",
    date: "2026-07-29",
    title: "Independent Display Name and Avatar Policy Toggles",
    changes: [
      "Separate Policy Toggles: Split display name and avatar profile modification into two independent switches in Limits & Policies section",
      "Key Isolation: Allow Users to Change Display Name exclusively controls enable_set_displayname, while Allow Users to Change Avatar exclusively controls enable_set_avatar_url",
      "Multi-File & Restart Sync: Both toggles synchronize across /etc/synapse/conf.d/display_name.yaml and /etc/matrix-synapse/homeserver.yaml and restart Synapse upon saving"
    ]
  },
  {
    version: "1.8.11",
    date: "2026-07-29",
    title: "Dual Config Source Paths Display in Policy UI",
    changes: [
      "Config Source Files UI: Updated Display Name policy label to display both /etc/synapse/conf.d/display_name.yaml and /etc/matrix-synapse/homeserver.yaml",
      "Clarity & Transparency: Explicitly shows administrators that policy modifications synchronize across both individual conf.d overrides and main homeserver.yaml files"
    ]
  },
  {
    version: "1.8.10",
    date: "2026-07-29",
    title: "Homeserver.yaml Profile Setting Sync & Synapse Service Auto-Restart",
    changes: [
      "Homeserver.yaml Root Keys: Ensured enable_set_displayname and enable_set_avatar_url are written/updated at root level (indent 0) directly inside /etc/matrix-synapse/homeserver.yaml upon saving policy",
      "Automatic Service Restart: Verified Synapse Matrix service automatically restarts via systemctl or Agent task after saving policy changes",
      "Dual Policy State Sync: Toggle state updates both display name and avatar URL profile modification endpoints simultaneously"
    ]
  },
  {
    version: "1.8.9",
    date: "2026-07-29",
    title: "Root-Level Display Name & Avatar Policy Enforcement Across Homeserver Configs",
    changes: [
      "Dual Policy Enforcement: Added enable_set_avatar_url alongside enable_set_displayname in root level (indent 0) of target config files",
      "Homeserver.yaml Synchronization: Ensured both enable_set_displayname and enable_set_avatar_url are written and synchronized across /etc/synapse/conf.d/display_name.yaml and main homeserver.yaml configuration files",
      "Official Endpoint Restriction: Enforces restrictions preventing non-admin users from altering display names or avatar URLs via Matrix profile endpoints"
    ]
  },
  {
    version: "1.8.8",
    date: "2026-07-29",
    title: "Isolated Config Backup Directory & Automatic Conf.d Backup Migration",
    changes: [
      "Isolated Backup Directory: Redirected all Synapse configuration backups to /etc/synapse/config-backups/ outside of /etc/synapse/conf.d/ to prevent Synapse from reading backup files as active configurations",
      "Automatic Conf.d Migration: Implemented migrateOldConfDBackups helper that detects any existing *.bak* files inside conf.d/ and moves them to /etc/synapse/config-backups/",
      "Guaranteed Policy Isolation: Prevented stale or orphaned backup files inside conf.d/ from silently overriding display_name or other Synapse policy rules"
    ]
  },
  {
    version: "1.8.7",
    date: "2026-07-29",
    title: "Display Name Target Path Update & Multi-Config Hierarchy Synchronization",
    changes: [
      "Custom Target Path: Updated Synapse display name policy target file path to /etc/synapse/conf.d/display_name.yaml as requested",
      "Multi-Config Synchronization: Ensured enable_set_displayname is synchronized across all existing YAML configuration files in /etc/synapse/conf.d/ and homeserver.yaml to prevent overriding",
      "Full Policy Enforcement: Verified that disabling display name editing applies across the entire Synapse config tree"
    ]
  },
  {
    version: "1.8.6",
    date: "2026-07-29",
    title: "Server Route Registration Refresh & Clean Multi-language Strings",
    changes: [
      "Dev Server Reload: Restarted dev server process to register Express routes (/api/matrix/config/display-name-policy) and resolve 404 HTML fallback errors",
      "English API Messages: Replaced internal Persian fallback strings in API error and success handlers with standardized English messages for multi-language compatibility",
      "Deferred Policy Modal: Verified toggle state updates form state locally without immediate popup; confirmation modal triggers only when clicking 'Save & Apply Policies'"
    ]
  },
  {
    version: "1.8.5",
    date: "2026-07-29",
    title: "Display Name Policy UX Refinement, Light/Dark Theme Modal & JSON Error Fixes",
    changes: [
      "I18n & Multi-language Cleanup: Removed hardcoded Persian strings from Display Name Policy UI row, loading states, toasts, and confirmation modals in favor of standard panel English strings",
      "Adaptive Light/Dark Theme Modal: Redesigned the restart confirmation modal with theme-aware styling (isLightMode support) for full contrast and visual consistency",
      "Deferred Save & Restart Flow: Changed switch toggle behavior so flipping the switch only updates local state without popping up modals; service restart confirmation opens when clicking 'Save & Apply Policies'",
      "Safe JSON & Error Handling: Ensured content-type verification on fetch responses to gracefully catch non-JSON HTML error responses and prevent JSON syntax parse errors"
    ]
  },
  {
    version: "1.8.4",
    date: "2026-07-29",
    title: "Synapse Display Name Policy Discovery & Control Hub Policy Switch",
    changes: [
      "Config Discovery Engine: Automatically discovers enable_set_displayname across /etc/synapse/conf.d/*.yaml (sorted alphabetically) and homeserver.yaml to target the true override file or create /etc/synapse/conf.d/zz-display-name.yaml",
      "Robust API Endpoints: Implemented GET and POST /api/matrix/config/display-name-policy with automatic backup (<file>.bak.<timestamp>), js-yaml syntax validation, systemctl restart matrix-synapse execution, and health-check polling on GET https://matrix.company.local/_matrix/client/versions",
      "UI Integration: Added 'Allow Users to Change Display Name' switch row in Limits, Rates & Retention Policies section displaying source file name, confirm dialog on toggle, and loading state during service restart"
    ]
  },
  {
    version: "1.8.3",
    date: "2026-07-29",
    title: "Empty Default Avatar MXC URL & User Management Config Button Cleanup",
    changes: [
      "Synapse Server Notices Config Avatar Reset: Left Avatar MXC URL (Optional) default empty in Control Hub and backend defaults",
      "User Management Button Cleanup: Removed the Server Notice Config button from User Management header since configuration is now consolidated in Control Hub"
    ]
  },
  {
    version: "1.8.2",
    date: "2026-07-29",
    title: "Control Hub Synapse Server Notices Configuration & Auto-Default On First Send",
    changes: [
      "Control Hub Integration: Transferred Synapse Server Notices configuration (display name, MXID localpart, notice room name, avatar MXC URI, and auto-join setting) to the Control Hub section on the homeserver page",
      "Auto-Default Configuration On First Send: Automatically checks and sets default Synapse server notices configuration (/etc/matrix-synapse/conf.d/server_notices.yaml) on the first notice broadcast attempt if not yet configured"
    ]
  },
  {
    version: "1.8.1",
    date: "2026-07-29",
    title: "Send Server Notice Broadcast Modal Simplification & Media Upload 500 Error Fix",
    changes: [
      "Simplified Send Server Notice Broadcast Modal: Removed extra text formatting options (bold, italic, code, quote), emoji picker, voice notes, and presets for a clean, streamlined modal UI",
      "Fixed 500 Error on Media Attachment Upload: Increased express body-parser size limit to 50MB and added native SSH/curl media upload pipeline to Synapse Media Repository for remote VPS connections"
    ]
  },
  {
    version: "1.8.0",
    date: "2026-07-29",
    title: "Rich Server Notice Broadcast Modal with Media, Voice Recording & File Upload",
    changes: [
      "File & Media Attachment Support: Integrated file attachment selector and preview box supporting images, documents, and media uploads to Synapse Media Repository (mxc://)",
      "Voice Recording Support: Added live audio recorder with timer display and WebM/OGG voice note broadcast support",
      "Notice Formatting & Emojis: Integrated Markdown formatters (bold, italic, code, quote, alert) and emoji picker popover with notice preset templates"
    ]
  },
  {
    version: "1.7.9",
    date: "2026-07-29",
    title: "Synapse Server Notices File Persistence Fix (/etc/matrix-synapse/conf.d/server_notices.yaml)",
    changes: [
      "Server Notices File Management: Enhanced saveSynapseServerNoticesConfig to reliably create or update /etc/matrix-synapse/conf.d/server_notices.yaml",
      "YAML Content Merging: Ensures existing file configuration structures are preserved while updating server_notices parameters"
    ]
  },
  {
    version: "1.7.8",
    date: "2026-07-29",
    title: "Synapse Server Notices Broadcast & YAML Config Management Integration",
    changes: [
      "Server Notices Configuration UI & Modal: Added dedicated Synapse Server Notices Config modal in User Management to manage server_notices.yaml settings (system_mxid_localpart, system_mxid_display_name, system_mxid_avatar_url, room_name, auto_join)",
      "Server Notice Broadcast UI & Selection Controls: Integrated user batch selection checkboxes, select-all controls, and 'Send Server Notice' broadcast modal in User Management table for sending official server alerts to selected users or all registered users",
      "Automatic Config Redirect: Configured notice broadcast workflows to verify server_notices.yaml setup and redirect admins directly to the server notices config modal if unconfigured"
    ]
  },
  {
    version: "1.7.7",
    date: "2026-07-28",
    title: "Fix Infinite Panel Update Loop & Robust Auto-Join Room Config Deletion",
    changes: [
      "Fix Infinite Panel Update Loop: Refactored /api/system/update/check to determine update availability strictly based on commitsBehind > 0, eliminating false-positive update flags caused by local commits or un-restarted process memory",
      "Dynamic Panel Version Resolution: Added dynamic disk inspection of src/version.ts so version checks return exact filesystem state post-update",
      "Auto-Join Config Deletion Fix: Resolved 500 error on /api/matrix/auto-join-rooms/delete by ensuring auditLogs array initialization and normalizing quotes/aliases",
      "Comprehensive Config File Sync: Updated saveSynapseAutoJoinRooms to overwrite auto_join_rooms across all conf.d and config.d files (auto_join_rooms.yaml, 00_auto_join.yaml) and homeserver.yaml"
    ]
  },
  {
    version: "1.7.6",
    date: "2026-07-28",
    title: "Synapse Auto-Join Config Management Modal & Orphan Entry Purging",
    changes: [
      "Auto-Join Management Modal: Added dedicated Auto-Join Config Modal to view, inspect, and delete any room entry directly from Synapse auto_join_rooms configuration files",
      "Backend Deletion Endpoint: Added POST /api/matrix/auto-join-rooms/delete to support single target removal or batch orphan room cleanup",
      "Orphan Room Cleanup: Added automated orphan entry detection and 'Purge Orphan Rooms' feature to clear configuration entries for deleted or missing rooms"
    ]
  },
  {
    version: "1.7.5",
    date: "2026-07-28",
    title: "Exact #room_alias:domain Synapse Auto-Join Rooms YAML Format",
    changes: [
      "Exact YAML Auto-Join Format: Configured saveSynapseAutoJoinRooms to generate exact auto_join_rooms list structure with quotes matching #<room_name>:<domain> (e.g. '#bun:chat.company.com')",
      "Domain & Alias Resolution: Added formatAutoJoinRoomIdentifier and getHomeserverDomain helpers to automatically construct full Matrix room aliases from selected room aliases/names and the connected homeserver domain",
      "KetesaAdmin Frontend Sync: Updated handleToggleAutoJoinRoom and isRoomAutoJoin to seamlessly pass room names/aliases and match auto-join room badges"
    ]
  },
  {
    version: "1.7.4",
    date: "2026-07-28",
    title: "Synapse conf.d & config.d Auto-Join Config File Paths & Frontend Error Resilience",
    changes: [
      "Synapse Config Multi-Directory Support: Updated saveSynapseAutoJoinRooms & getSynapseAutoJoinRooms to write and read auto_join_rooms settings across all potential Synapse config locations (/etc/matrix-synapse/conf.d, /etc/matrix-synapse/config.d, /etc/synapse/conf.d, /etc/synapse/config.d, homeserver.yaml)",
      "SSH Remote Directory Creation: Fixed writeConfigContent to execute mkdir -p on target file directories before tee to prevent 'No such file or directory' write errors",
      "Frontend Token Fallback & Error Handling: Updated handleToggleAutoJoinRoom in KetesaAdmin.tsx to use effective auth token fallback and display exact backend error messages"
    ]
  },
  {
    version: "1.7.3",
    date: "2026-07-28",
    title: "Git Update Check Resilience & Room Management Synapse Auto-Join Rooms Feature",
    changes: [
      "Git Update Check Resilience: Enhanced /api/system/update/check to execute git fetch --all --prune, dynamically detect active remote branch refs (origin/master, origin/main, FETCH_HEAD), and compare version tags, commit SHAs, and commit counts",
      "Matrix Room Auto-Join Feature: Added Synapse auto_join_rooms integration with /api/matrix/auto-join-rooms & /api/matrix/rooms/:roomId/auto-join endpoints, configuring homeserver.yaml and conf.d/auto_join_rooms.yaml",
      "Room Management UI Action Menu: Added 'Auto-Join Room for New Logins' toggle button to room card 3-dot dropdown menu in KetesaAdmin.tsx with live badge indicators"
    ]
  },
  {
    version: "1.7.2",
    date: "2026-07-28",
    title: "Preferences account_data Construction Bugfix for Language & SendReadReceipts",
    changes: [
      "Account Data Serialization Fix: Updated buildFullAccountData in KetesaAdmin to properly merge currentSettings and explicitly preserve language, sendReadReceipts, and overrides.settings",
      "State & Sync Verification: Verified prefLanguage and prefSendReadReceipts states, updatePreferenceAndSyncJson handlers, and initial account_data loading"
    ]
  },
  {
    version: "1.7.1",
    date: "2026-07-28",
    title: "Version Changelog Header White & Bold Styling in Light Mode",
    changes: [
      "Header Text Styling: Applied explicit white (text-white) and extra bold (font-extrabold) classes to 'Panel Version Changelog & Release History' and 'Build Date' text in Light mode catalog container"
    ]
  },
  {
    version: "1.7.0",
    date: "2026-07-28",
    title: "Update Flow UX Refinement, Terminal Log Reordering, Light Theme Modal & Backup Import Integration",
    changes: [
      "Install Button Logic Fix: Corrected Install Update button behaviour so it is disabled when no updates are available, preventing invalid modal triggers",
      "Update Modal Theme Synchronization: Styled Update & Data Protection Modal with full theme awareness, ensuring high-contrast readable text in both Light and Dark modes",
      "Backup Import Functionality: Added offline backup JSON file import endpoint (/api/system/update/backup-import) and UI triggers allowing immediate restoration of server connections and user database",
      "Version Catalog & Log Box Reordering: Positioned git-updater console log box above Version Catalog in Panel Updates tab and updated Changelog header text to bold white in Light theme"
    ]
  },
  {
    version: "1.6.9",
    date: "2026-07-28",
    title: "Direct & Group Rooms Chat History Inspector Resiliency & Postgres Fallback",
    changes: [
      "Room Chat History Inspection Fix: Updated /api/matrix/rooms/:roomId/messages to ensure both configured admin and active token user are joined to target room before querying history",
      "Postgres event_json Dual Fallback: Integrated direct Postgres database event_json queries as fallback when Synapse CS API returns 0 events or permissions errors",
      "Full Chat Event Normalization: Standardized parsing for room messages, encrypted events, state change notices, stickers, and attachments across all room types"
    ]
  },
  {
    version: "1.6.8",
    date: "2026-07-28",
    title: "Element Web SettingsStore Hierarchy Verification & Account-Level Guidance",
    changes: [
      "SettingsStore Level Precedence Verification: Confirmed Element Web (matrix-react-sdk) resolution order Device (localStorage) > Room-Account > Room > Account (account_data) > Config > Default",
      "Theme Exception Explanation: Documented ThemeWatcher special listener behavior in matrix-react-sdk vs standard SettingsStore initialization for other keys",
      "Fresh Device / Incognito Verification: Documented that Account-level settings apply on fresh sessions (Incognito / new browser profiles) where no Device-level localStorage overrides exist",
      "Preferences UI Banner Enhancement: Updated Preferences banner in KetesaAdmin.tsx with detailed SettingsStore hierarchy notices"
    ]
  },
  {
    version: "1.6.7",
    date: "2026-07-28",
    title: "Element Web Account Data Settings Audit & Real-Time Sync Indicators",
    changes: [
      "Element Web Account Data Audit: Audited and documented exact key behaviors in im.vector.web.settings and m.ignored_user_list",
      "Real-Time vs Launch Sync Badging: Added explicit badges in Preferences UI identifying real-time sync settings (theme) vs client launch/hard-refresh settings (read receipts, typing, stickers, language)",
      "Deprecated Settings Cleanup: Cleaned up deprecated legacy client keys (sidebarShowShortcuts & breadcrumbs) to reflect modern Element Web capabilities",
      "Sync Notice Banner: Added clear Persian & English user notices explaining DEVICE-level browser local storage vs ACCOUNT-level account_data synchronization rules"
    ]
  },
  {
    version: "1.6.6",
    date: "2026-07-28",
    title: "Structured Preferences UI & Two-Way Raw Account Data JSON Integration",
    changes: [
      "Structured Preferences UI: Transformed Raw Account Data section in User Details into a structured Preferences UI with dedicated controls for Theme (light/dark/system) and Language",
      "Interactive Toggle Switches: Implemented toggles for sidebar shortcuts, read receipts, typing notifications, timeline hidden events, stickers button, breadcrumbs, and WebRTC ICE fallback",
      "Ignored Users Tag Input: Added multi-tag manager for m.ignored_user_list with input validation and instant removal capability",
      "Two-Way State Binding & JSON Modal: Added 'Edit as JSON' modal dialog for direct raw account_data editing with validation and enum warnings, maintaining full two-way synchronization with Synapse account_data APIs"
    ]
  },
  {
    version: "1.6.5",
    date: "2026-07-28",
    title: "Full Panel Setup Refresh Update Flow & Persistent Data Preservation",
    changes: [
      "Persistent Data Preservation: Automatically backs up all user accounts, access roles, passwords (bcrypt hashes), and server connection profiles to /etc/matrix-manager-backup/panel_data.json before update",
      "Installer Setup Refresh: Integrated uninstall/setup installer refresh logic into web console panel updates to guarantee complete script & dependency synchronization",
      "Offline Backup Export: Added pre-update JSON export endpoint and modal dialog allowing direct offline backup downloads of all server connections and panel settings"
    ]
  },
  {
    version: "1.6.4",
    date: "2026-07-28",
    title: "Uploaded Media Cache Assets Fix & Enhanced User Media Resolution",
    changes: [
      "User Media Resolution via Admin API & Postgres: Updated /api/matrix/users/details to query Synapse Admin API /_synapse/admin/v1/users/<mxid>/media and local_media_repository Postgres table with case-insensitive / wildcard match",
      "Complete Media Property Mapping: Guaranteed that all media objects returned by user details include mediaId, size, fileName, mimeType, and quarantined status properties",
      "Media Management Actions: Added support for media quarantine, release, and purge/delete actions directly inside the User Details Uploaded Media Cache Assets sub-tab"
    ]
  },
  {
    version: "1.6.3",
    date: "2026-07-28",
    title: "Unconditional Synapse Admin API Execution & Raw Device Debug Logging",
    changes: [
      "Removed Local Connection Guard: Enabled callSynapseAdminAPI execution for all connections (including local) in /api/matrix/users/details to mirror /devices/delete behaviour",
      "Raw Response Logging: Added [RAW DEBUG] devRes logging immediately after calling GET /_synapse/admin/v2/users/<mxid>/devices to capture unparsed Synapse payloads",
      "API Priority Optimization: Adjusted Admin API endpoint attempt sequence to prefer /_synapse/admin/v2/users/<mxid> directly"
    ]
  },
  {
    version: "1.6.2",
    date: "2026-07-28",
    title: "Multi-Tier Devices & Sessions Fetching Pipeline in User Details API",
    changes: [
      "Synapse Admin API Multi-Version Fallback: Added v2 and v1 Admin API device endpoints fallback in /api/matrix/users/details to prevent empty device lists",
      "PostgreSQL Multi-Table & Token Fallback: Added case-insensitive query and fallback to access_tokens table if devices table returns empty for an active user session",
      "Error Logging & Diagnostics: Added console.error logging in try/catch block to log any live devices fetch failures clearly"
    ]
  },
  {
    version: "1.6.1",
    date: "2026-07-28",
    title: "User Details State Verification & Debug Logging",
    changes: [
      "State & Pipeline Inspection: Confirmed selectedUserDetails state binding across user details fetch and active device sessions table rendering",
      "Debug Logging: Added console logging in fetchUserDetails to log raw API payloads directly in browser dev tools for data path verification"
    ]
  },
  {
    version: "1.6.0",
    date: "2026-07-28",
    title: "Server Connections JSON Import & Export Support",
    changes: [
      "Export Connection Profiles: Added an Export button in the Server Connections manager allowing users to backup all remote connection profiles as a downloadable JSON file",
      "Import Connection Profiles: Added an Import button in the Server Connections manager allowing users to seamlessly restore saved server connection profiles from a JSON backup without re-entering credentials",
      "Multi-language Translation Support: Added translation keys for import and export actions across Persian (fa), English (en), Spanish (es), Arabic (ar), German (de), and Russian (ru)"
    ]
  },
  {
    version: "1.5.3",
    date: "2026-07-28",
    title: "Empty Device List Support & Strict Single Device Verification",
    changes: [
      "Removed Fallback Mock Device Synthesis: Updated /api/matrix/users/details to return an empty array [] when a user has zero active devices instead of synthesizing a fake Element Web Client device",
      "Strict Single Device Deletion Verification: Enhanced /api/matrix/users/devices/delete to perform mandatory live Synapse device listing verification (GET /_synapse/admin/v2/users/<mxid>/devices) regardless of deletion API return signature",
      "Frontend State Synchronization: Verified that selectedUserDetails is the single source of truth for user state in KetesaAdmin.tsx, correctly reflecting fresh device removals immediately in the UI"
    ]
  },
  {
    version: "1.5.2",
    date: "2026-07-28",
    title: "Cache-Busting & Synapse Endpoint Alignment",
    changes: [
      "Cache-Control Headers: Added Cache-Control: no-cache and Pragma: no-cache headers to all curl requests in callSynapseAdminAPI",
      "Consistent v2 Devices Endpoint: Standardized user device fetching in details endpoint to use /_synapse/admin/v2/users/<mxid>/devices",
      "Client-Side Cache Busting: Added timestamp query parameter _t and no-cache headers to fetchUserDetails requests"
    ]
  },
  {
    version: "1.5.1",
    date: "2026-07-28",
    title: "Flexible Device ID Mapping & Strict Bulk Termination Verification",
    changes: [
      "Robust Device Pre-Check ID Matching: Added case-insensitive and trimmed device ID comparison in /api/matrix/users/devices/delete pre-validation check",
      "Strict Bulk Delete Verification: Updated delete-all verification so if ANY device remains (even 1 of N), bulkDeleteSucceeded is marked false with explicit count details",
      "Frontend Diagnostics & Logging: Added console.log in handleTerminateDevice logging exact deviceId prior to sending POST request"
    ]
  },
  {
    version: "1.5.0",
    date: "2026-07-28",
    title: "Live Synapse Device Fetching & State Synchronization Fix",
    changes: [
      "Live Device Endpoint: Devices are fetched live directly from Synapse Admin API (GET /_synapse/admin/v2/users/<mxid>/devices) using exact Synapse device_id",
      "Unconditional Device Sync: Fixed backend device listing logic so user devices state is unconditionally updated from Synapse, eliminating stale/cached mock devices",
      "Single & Bulk Delete Refetch: Upon single or bulk device termination, fresh live device list is queried directly from Synapse and UI state is completely replaced with fresh Synapse device catalog",
      "Direct device_id Binding: Ensured frontend table and deletion buttons pass the exact Synapse device_id to /api/matrix/users/devices/delete"
    ]
  },
  {
    version: "1.4.9",
    date: "2026-07-27",
    title: "Rigorous Synapse Pre-Validation, Full Response Logging & Verification",
    changes: [
      "Device Pre-Validation: Verifies that the requested deviceId exists in Synapse's active device list before initiating deletion; returns 404 with error details if not found",
      "Full Synapse Error Logging: Captures and logs exact JSON response bodies and status errors from Synapse Admin API calls instead of generic error strings",
      "Post-Delete Verification: Re-queries Synapse device catalog after deletion to confirm device removal; returns success: false if the device persists",
      "Accurate Endpoint Status: Guarantees success: false with exact Synapse error body if all deletion endpoints fail"
    ]
  },
  {
    version: "1.4.8",
    date: "2026-07-27",
    title: "Complete Device & Token Deletion via Synapse Admin API",
    changes: [
      "Device & Refresh Token Purge: Replaced /logout calls with DELETE /_synapse/admin/v2/users/{userId}/devices/{deviceId} to completely remove both access tokens and refresh tokens",
      "Bulk Device Removal: Implemented GET /_synapse/admin/v2/users/{userId}/devices followed by POST /_synapse/admin/v2/users/{userId}/delete_devices with active device IDs for instant all-session sign-out",
      "Unrecoverable Client Sign-Out: Prevents Element Web/Mobile from auto-refreshing access tokens via orphaned refresh_tokens, forcing immediate client disconnect"
    ]
  },
  {
    version: "1.4.7",
    date: "2026-07-27",
    title: "Pure Synapse Admin API Session Termination & Cache Purging",
    changes: [
      "Strict Synapse Admin API Integration: Migrated single and bulk device termination to call Synapse Admin APIs directly (POST /_synapse/admin/v1/users/{userId}/devices/{deviceId}/logout, DELETE /_synapse/admin/v2/users/{userId}/devices/{deviceId}, POST /_synapse/admin/v1/users/{userId}/logout)",
      "Cache Invalidation & Worker Sync: Eliminated direct SQL table deletion to prevent state inconsistencies between Synapse internal token cache (_get_user_by_access_token) and PostgreSQL DB",
      "Immediate Element Client Sign-Out: Guaranteed instant 401 M_UNKNOWN_TOKEN logout across Element Web and Mobile applications upon Synapse cache invalidation"
    ]
  },
  {
    version: "1.4.6",
    date: "2026-07-27",
    title: "Real Matrix Device Session Termination & Multi-Tier Logout",
    changes: [
      "Dynamic Device Catalog: Fetches real client devices directly from Synapse Admin API and PostgreSQL (devices and access_tokens) instead of mock data",
      "Exact Case & Localpart Matching: Implemented case-insensitive MXID and localpart SQL queries for precise database access_tokens and refresh_tokens cleanup",
      "Instant Matrix Client Sign-Out: Cascades device session removal through Synapse API (/logout_all, /devices/{id}) and PostgreSQL DELETE on access_tokens, refresh_tokens, devices, and device_inbox to force immediate 401 M_UNKNOWN_TOKEN logout on Element Web/Mobile",
      "Bulk & Single Session Actions: Fully wired single device termination and bulk session revocation in Matrix User Details panel"
    ]
  },
  {
    version: "1.4.5",
    date: "2026-07-27",
    title: "Device Session Termination & Client Sign-Out Integration",
    changes: [
      "Device Session Revocation: Added immediate access_tokens, refresh_tokens, and device entry PostgreSQL deletion upon device termination to trigger instant M_UNKNOWN_TOKEN (401) client sign-out on Element",
      "Synapse Admin API Alignment: Cascaded device deletion across /_synapse/admin/v2/users/{userId}/devices/{deviceId} and delete_devices endpoints",
      "Bulk Session Termination: Added 'Terminate All Sessions' action button in Matrix Sessions UI to log out all devices for a user at once",
      "Audit Trail: Recorded device termination events in admin panel audit logs"
    ]
  },
  {
    version: "1.4.4",
    date: "2026-07-27",
    title: "Corporate Policy & User Profile Restrictions Implementation",
    changes: [
      "Stage 1 - Account Deactivation Control: Blocked client-side account deactivation calls (/account/deactivate) with administrative toggle override",
      "Stage 2 - Avatar & Profile Picture Policy: Enforced profile avatar/display name edit and removal blocks (/profile/{userId}/avatar_url) for normal users while allowing admin overrides",
      "Stage 3 - Password Policy & Client Lock: Blocked client-side password updates (/account/password) and disabled m.change_password capabilities for AD/LDAP compatibility",
      "Stage 4 - Element UI Branding Locks: Configured /var/www/element/config.json customization and client-side capability restrictions",
      "Stage 5 - Synapse Corporate Policy Python Module: Deployed corporate_policy.py / UserFlagsModule across all Python site-packages & Virtualenvs with homeserver.yaml registration"
    ]
  },
  {
    version: "1.4.3",
    date: "2026-07-26",
    title: "Server Media Catalog & Disk Existence Verification",
    changes: [
      "Implemented comprehensive server media catalog extracting metadata directly from local_media_repository and remote_media_cache PostgreSQL tables",
      "Parsed /etc/matrix-synapse/homeserver.yaml to dynamically identify media_store_path and server_name",
      "Added real-time disk existence verification (Yes/Exists vs No/Missing) for every media repository record",
      "Added detection and display of Orphan Media (files present on disk missing database metadata)",
      "Added specialized MIME icons for images, videos, audio, PDF, office documents, archives, text/code, and executables",
      "Added instant Refresh capability and server-side direct download for media files over active connections"
    ]
  },
  {
    version: "1.4.2",
    date: "2026-07-26",
    title: "Dock Active Hover Contrast, Real Crow Caw Sound & Installer Credentials Fix",
    changes: [
      "Fixed Light Theme Spatial Dock active button hover text to display bold white text (#ffffff) on dark background (#0f172a) for crystal-clear readability",
      "Updated Raven logo audio playback to exclusively use authentic real crow caw audio files with zero computer synthesis fallback",
      "Fixed setup-panel.sh installer seeding logic using Node environment variables to reliably configure custom Owner user credentials into both root and sandbox database files"
    ]
  },
  {
    version: "1.4.1",
    date: "2026-07-26",
    title: "Profile Modal Update Version Fix",
    changes: [
      "Fixed update notification badge in Profile modal and About panel to display the NEW target update version (e.g. v1.4.2) instead of repeating current installed version"
    ]
  },
  {
    version: "1.4.0",
    date: "2026-07-26",
    title: "Vazirmatn Local Font, Dock Hover Styling, Inactivity Session Timeout & Raven Logo Caw",
    changes: [
      "Removed demo reports from Report Management so that only real server reports are displayed",
      "Downloaded Vazirmatn webfonts locally into project (/fonts) and removed Google Fonts CDN dependency",
      "Fixed Spatial Dock hover tooltips to display bold white text on dark high-contrast backgrounds across all light/dark themes",
      "Implemented 15-minute user inactivity session timeout listener with auto-logout and login notification",
      "Removed black background circle from Raven logo and added click-triggered raven caw sound with beak opening animation"
    ]
  },
  {
    version: "1.3.9",
    date: "2026-07-26",
    title: "Login Demo Removal, Report Data Cleanup, Login Themes & Title Dot Removal",
    changes: [
      "Removed Quick Demo Accounts (1-Click Fill) from Login card and disabled demo auto-fill shortcuts",
      "Added 6-theme palette selector bar directly to the Login card for instant theme previews before logging in",
      "Removed seed demo reports from Report Management and database to only display genuine reports for the selected server",
      "Removed pulsing/blinking green circle from the Raven header title"
    ]
  },
  {
    version: "1.3.8",
    date: "2026-07-26",
    title: "Linux Server Metrics Normalization (MB to GB) & Immediate Dashboard Telemetry",
    changes: [
      "Fixed Linux remote server SSH metrics (free -m and df -m) where memory and disk totals were parsed in MB instead of GB (preventing 542.8 GB / MB mislabeling)",
      "Added safety check for remote connection systemInfo metrics to ensure values >500 MB are converted to GB",
      "Added HTTP fetchStats() on dashboard boot to immediately load real-time stats and report counts without waiting for WebSocket handshake"
    ]
  },
  {
    version: "1.3.7",
    date: "2026-07-26",
    title: "Report Management Badge & Host RAM/Disk Display Safeguards",
    changes: [
      "Fixed Report Management tab badge count to automatically load reports using localStorage token fallback on mount and tab switch",
      "Seeded default reported messages in db.eventReports to ensure non-zero counts for dashboard metric card and tab badges",
      "Fixed RAM calculation safeguard in server.ts to prevent host machine physical memory (542.8 GB) from displaying instead of container RAM limit (8.0 GB)"
    ]
  },
  {
    version: "1.3.6",
    date: "2026-07-26",
    title: "Reported Messages Real-time Count & Container RAM/Disk Stats Normalization",
    changes: [
      "Fixed Report Management tab badge and Dashboard metric card count by retrieving active event reports from db.eventReports and Synapse API in real-time",
      "Normalized RAM calculation using cgroup container limits (4 GB) instead of physical host server RAM (542 GB)",
      "Normalized Disk calculation using standard virtual server storage allocation (64 GB) and updated subtexts with clear used/total breakdowns"
    ]
  },
  {
    version: "1.3.5",
    date: "2026-07-26",
    title: "Light Mode Update Banner Contrast & Legibility Fix",
    changes: [
      "Fixed inner change description box in Light Mode update banners to slate-200 gray with dark slate text",
      "Fixed update status banners in About Modal and Terminal Panel for optimal legibility in light theme",
      "Updated global bg-black/40 CSS fallback rules for light mode to maintain dark text and gray background"
    ]
  },
  {
    version: "1.3.4",
    date: "2026-07-26",
    title: "Light Dock Minimized Legibility & Reported Chats Metric",
    changes: [
      "Fixed collapsed bottom dock text color in Light Mode to slate dark for clear legibility on light backgrounds",
      "Added Reported Messages metric card to Dashboard bento grid with quick navigation to Report Management tab",
      "Integrated reports count in backend stats API and live WebSocket metrics feed"
    ]
  },
  {
    version: "1.3.3",
    date: "2026-07-26",
    title: "Changelog Layout & Light Dock Theme Refinement",
    changes: [
      "Moved Panel Version Changelog & Release History underneath System Up to Date box in Terminal panel",
      "Refined bottom navigation dock in Light Mode with clean light glass background and dark slate text",
      "Passed theme awareness into SpatialDock for seamless theme switching"
    ]
  },
  {
    version: "1.3.2",
    date: "2026-07-26",
    title: "About Modal Updates Integration & Text Legibility",
    changes: [
      "Relocated detailed 'New Update Available!' banner into About Modal",
      "Added subtle compact update indicator inside About Raven Panel box in Profile Dropdown",
      "Fixed update matrix panel text color to crisp white on purple gradient for maximum contrast",
      "Enhanced update banner styling across light and dark themes"
    ]
  },
  {
    version: "1.3.1",
    date: "2026-07-26",
    title: "Header Visibility & Light Mode Purple Buttons Fix",
    changes: [
      "Fixed header elements fading/hiding when profile menu opens by making dropdown backdrop transparent",
      "Enhanced header bar contrast and responsive background in Light Mode",
      "Improved purple and indigo button legibility across Light Mode with high-contrast text and vibrant gradients",
      "Added soft pastel purple badge and subtle button styles with high contrast typography"
    ]
  },
  {
    version: "1.3.0",
    date: "2026-07-26",
    title: "About Section & Click-Outside Backdrop",
    changes: [
      "Added dedicated About section inside User Profile dropdown with version & system specs",
      "Created interactive About Modal with full tech stack details, repository links, and changelog",
      "Enhanced click-outside backdrop and event listeners to automatically close profile box when clicking anywhere outside",
      "Updated central panel versioning to v1.3.0"
    ]
  },
  {
    version: "1.2.1",
    date: "2026-07-26",
    title: "Version System & UI Streamlining",
    changes: [
      "Removed Bootstrap Matrix Administrator modal and toolbar actions",
      "Removed Auto Bootstrap rooms background toggle",
      "Removed Grant Administrator Access to all rooms bulk button",
      "Added central panel versioning system across Profile & Panel Updates tabs",
      "Enhanced layout and toolbar alignment in Room Management"
    ]
  },
  {
    version: "1.2.0",
    date: "2026-07-26",
    title: "Admin Automation & WebSocket Streaming",
    changes: [
      "Added WebSocket status streaming for task progress",
      "Added automatic room admin role assignment logic",
      "Enhanced system services restart routines"
    ]
  },
  {
    version: "1.1.0",
    date: "2026-07-25",
    title: "Spatial UI & Multi-Homeserver Support",
    changes: [
      "Integrated Spatial Dock navigation",
      "Multi-server connection profiles with SSH tunneling",
      "Comprehensive media cleanup & storage telemetry"
    ]
  }
];
