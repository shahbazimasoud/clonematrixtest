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

export const PANEL_VERSION = "2.11.6";
export const PANEL_BUILD_DATE = "2026-08-08";
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
      "Robust API Endpoints: Implemented GET and POST /api/matrix/config/display-name-policy with automatic backup (<file>.bak.<timestamp>), js-yaml syntax validation, systemctl restart matrix-synapse execution, and health-check polling on GET https://matrix.kheilisabz.local/_matrix/client/versions",
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
      "Exact YAML Auto-Join Format: Configured saveSynapseAutoJoinRooms to generate exact auto_join_rooms list structure with quotes matching #<room_name>:<domain> (e.g. '#bun:chat.kheilisabz.com')",
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
