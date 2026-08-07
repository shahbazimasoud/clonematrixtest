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

## Current Panel Version: **v2.10.0** (Released: 2026-08-07)

### Changelog History

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
- **Dynamic MXC URI Domain Resolution**: Fixed local content records in Media Repository (`/api/matrix/media`) to derive MXC URIs directly from the uploader's domain (`@user:domain`) or active server name (`matrix.kheilisabz.local`), eliminating incorrect fallback to default `matrix.org` domains.
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
- **Persian Diagnostic Guidance**: Formatted human-readable Persian messages indicating active ports on the target domain (`mail.kheilisabz.com`) or local host (`127.0.0.1`), enabling administrators to fix port mismatches immediately.

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
- **API Endpoints**: Added `GET /api/matrix/config/display-name-policy` and `POST /api/matrix/config/display-name-policy` with timestamped file backup (`<file>.bak.<timestamp>`), syntax validation using `js-yaml`, `systemctl restart matrix-synapse` service restart, and health-check polling against `GET https://matrix.kheilisabz.local/_matrix/client/versions`.
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
- **Exact YAML Auto-Join Format**: Configured `saveSynapseAutoJoinRooms` to generate exact `auto_join_rooms` list formatting with double quotes matching `#<room_name>:<domain>` (e.g. `"#bun:chat.kheilisabz.com"`).
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
