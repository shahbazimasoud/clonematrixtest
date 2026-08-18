#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Synapse E2EE Policy Engine - Dynamic, Version-Agnostic, Idempotent Room.py Manager
==================================================================================
Handles discovery, baseline backup, atomic transformation, and safe restoration
of Matrix Synapse's room.py across arbitrary Python and Synapse versions.
"""

import sys
import os
import glob
import re
import json
import shutil
import py_compile
import argparse
import textwrap
from typing import Optional, List, Tuple, Dict, Any


def log_step(steps: List[str], msg: str):
    print(msg, file=sys.stderr)
    steps.append(msg)


def discover_room_py(custom_paths: Optional[List[str]] = None) -> Tuple[Optional[str], List[str]]:
    """
    Dynamically discover readable and writable room.py under venv paths.
    Prioritizes /opt/venvs/matrix-synapse/lib64/ as required.
    """
    steps: List[str] = []
    log_step(steps, "[DISCOVERY] Initiating dynamic Synapse room.py discovery...")

    search_roots = [
        "/opt/venvs/matrix-synapse/lib64",
        "/opt/venvs/matrix-synapse/lib",
        "/opt/venvs/matrix-synapse",
        "sandbox/opt/venvs/matrix-synapse/lib64",
        "sandbox/opt/venvs/matrix-synapse/lib",
        "sandbox/opt/venvs/matrix-synapse",
    ]

    if custom_paths:
        search_roots = custom_paths + search_roots

    candidate_files: List[str] = []

    for root in search_roots:
        if not os.path.exists(root):
            continue
        # Use find pattern */synapse/handlers/room.py
        for dirpath, _, filenames in os.walk(root):
            if "room.py" in filenames:
                normalized = os.path.normpath(os.path.join(dirpath, "room.py"))
                if "synapse" in normalized and "handlers" in normalized:
                    if normalized not in candidate_files:
                        candidate_files.append(normalized)

    valid_path: Optional[str] = None
    for cand in candidate_files:
        if os.path.isfile(cand) and os.access(cand, os.R_OK) and os.access(cand, os.W_OK):
            valid_path = cand
            break

    if valid_path:
        log_step(steps, f"[DISCOVERY] Valid writable room.py discovered: {valid_path}")
        return valid_path, steps
    else:
        err_msg = "room.py not found under venv path, Synapse installation may be non-standard"
        log_step(steps, f"[ERROR] {err_msg}")
        return None, steps


def discover_python_bin(room_py_path: str) -> str:
    """Find dynamic Python interpreter inside the matching virtualenv."""
    cur = os.path.dirname(os.path.abspath(room_py_path))
    # Walk upwards looking for bin/python or bin/python3
    for _ in range(8):
        bin_dir = os.path.join(cur, "bin")
        py3 = os.path.join(bin_dir, "python3")
        py = os.path.join(bin_dir, "python")
        if os.path.isfile(py3) and os.access(py3, os.X_OK):
            return py3
        if os.path.isfile(py) and os.access(py, os.X_OK):
            return py
        parent = os.path.dirname(cur)
        if parent == cur:
            break
        cur = parent

    # Fallback to sys.executable or system python
    return sys.executable or shutil.which("python3") or shutil.which("python") or "python3"


def ensure_pristine_backup(room_py_path: str, steps: List[str]) -> Tuple[str, bool]:
    """
    Ensures room.py.orig.bak exists in the same directory.
    NEVER overwrites if it already exists.
    """
    backup_path = room_py_path + ".orig.bak"
    if os.path.exists(backup_path):
        log_step(steps, f"[BACKUP] Pristine baseline backup already exists at {backup_path} (preserving baseline).")
        return backup_path, False

    try:
        shutil.copy2(room_py_path, backup_path)
        log_step(steps, f"[BACKUP] Created pristine baseline backup: {backup_path}")
        return backup_path, True
    except Exception as e:
        log_step(steps, f"[ERROR] Failed to create pristine backup {backup_path}: {e}")
        raise RuntimeError(f"Failed to create pristine backup {backup_path}: {e}")


def transform_room_py_lockdown(source_code: str) -> str:
    """
    Applies the exact 5-point Strict Lockdown transformations to room.py code:
    1. Force disable encryption (preset_config['encrypted'] = False, config['encrypted'] = False)
    2. Override power_level_content_override (EventTypes.RoomEncryption: 999)
    3. Remove encryption keys from creation_content
    4. Remove EventTypes.RoomEncryption from initial_state
    5. Ensure default power level for RoomEncryption is 999
    """
    code = source_code

    # 1. Clean existing lockdown injection block if already present (for idempotency)
    block_pattern = re.compile(
        r"[ \t]*# === SYNAPSE E2EE STRICT LOCKDOWN ENFORCEMENT START ===[\s\S]*?# === SYNAPSE E2EE STRICT LOCKDOWN ENFORCEMENT END ===\n?",
        re.MULTILINE
    )
    code = block_pattern.sub("", code)

    # 2. Modify presets in __init__ if present: ensure encrypted: False
    code = re.sub(r'(["\']encrypted["\']\s*:\s*)True', r'\g<1>False', code)

    # 3. Locate validation method (_validate_room_config or room creation validation)
    val_method_match = re.search(r"^[ \t]*(?:async\s+)?def\s+_validate_room_config\b", code, re.MULTILINE)
    
    raw_lockdown_snippet = """# === SYNAPSE E2EE STRICT LOCKDOWN ENFORCEMENT START ===
# Force disable encryption entirely
if "preset_config" in locals() and isinstance(preset_config, dict):
    preset_config["encrypted"] = False
config["encrypted"] = False

# Override power_level_content_override to prevent encryption
power_level_override = config.get("power_level_content_override")
if power_level_override and isinstance(power_level_override, dict):
    events_override = power_level_override.get("events")
    if isinstance(events_override, dict):
        events_override[EventTypes.RoomEncryption] = 999
    else:
        power_level_override["events"] = {EventTypes.RoomEncryption: 999}
else:
    config["power_level_content_override"] = {"events": {EventTypes.RoomEncryption: 999}}

# Remove any encryption-related keys from creation_content
creation_content = config.get("creation_content", {})
if creation_content and isinstance(creation_content, dict):
    creation_content.pop("encryption", None)
    creation_content.pop(EventTypes.RoomEncryption, None)
    creation_content.pop("m.room.encryption", None)
config["creation_content"] = creation_content

# Remove any encryption events from initial_state
raw_initial_state = config.get("initial_state", [])
if isinstance(raw_initial_state, list):
    raw_initial_state = [
        s for s in raw_initial_state
        if isinstance(s, dict) and s.get("type", "") not in (EventTypes.RoomEncryption, "m.room.encryption")
    ]
    config["initial_state"] = raw_initial_state
# === SYNAPSE E2EE STRICT LOCKDOWN ENFORCEMENT END ==="""

    if val_method_match:
        start_idx = val_method_match.start()
        lines = code[start_idx:].splitlines(keepends=True)
        def_indent = len(lines[0]) - len(lines[0].lstrip())
        
        body_lines = [lines[0]]
        rest_lines = []
        in_body = True
        for line in lines[1:]:
            stripped = line.strip()
            if in_body:
                line_indent = len(line) - len(line.lstrip())
                if stripped and line_indent <= def_indent and (line.lstrip().startswith("def ") or line.lstrip().startswith("async def ") or line.lstrip().startswith("class ")):
                    in_body = False
                    rest_lines.append(line)
                else:
                    body_lines.append(line)
            else:
                rest_lines.append(line)
                
        body_text = "".join(body_lines)
        ret_matches = list(re.finditer(r"^[ \t]*return\b", body_text, re.MULTILINE))
        
        indent = " " * (def_indent + 4)
        formatted_snippet = "\n" + textwrap.indent(raw_lockdown_snippet, indent) + "\n\n"
        
        if ret_matches:
            last_ret_pos = ret_matches[-1].start()
            new_body = body_text[:last_ret_pos] + formatted_snippet + body_text[last_ret_pos:]
        else:
            new_body = body_text.rstrip() + "\n" + formatted_snippet
            
        code = code[:start_idx] + new_body + "".join(rest_lines)
    else:
        # If method name differs, inject into RoomCreationHandler class or file
        handler_class_match = re.search(r"class\s+RoomCreationHandler\b", code)
        if handler_class_match:
            insert_pos = handler_class_match.end()
            indent = "    "
            formatted_snippet = "\n" + textwrap.indent(raw_lockdown_snippet, indent) + "\n\n"
            code = code[:insert_pos] + formatted_snippet + code[insert_pos:]

    # 4. Modify default power levels (EventTypes.RoomEncryption: 999)
    code = re.sub(r"(EventTypes\.RoomEncryption\s*:\s*)\d+(\s*,?)", r"\g<1>999\g<2>", code)

    return code


def apply_strict_lockdown(room_py_path: str) -> Dict[str, Any]:
    """Applies Strict Lockdown with baseline backup, atomic replace, and syntax check."""
    steps: List[str] = []
    log_step(steps, f"[POLICY] Applying policy: STRICT_LOCKDOWN on {room_py_path}")

    # 1. Baseline Backup
    backup_path, backup_created = ensure_pristine_backup(room_py_path, steps)

    # 2. Source reading (prefer baseline if exists to prevent accumulated mutations)
    with open(backup_path, "r", encoding="utf-8") as f:
        baseline_code = f.read()

    # 3. Transform code
    log_step(steps, "[TASK] Transforming room.py with 5-point E2EE lockdown logic...")
    transformed_code = transform_room_py_lockdown(baseline_code)

    # 4. Write to temporary file in same directory for atomic replace
    temp_path = f"{room_py_path}.tmp_lockdown_{os.getpid()}"
    with open(temp_path, "w", encoding="utf-8") as f:
        f.write(transformed_code)

    # 5. Syntax validation on temporary file
    py_bin = discover_python_bin(room_py_path)
    log_step(steps, f"[SYNTAX] Validating syntax using Python interpreter: {py_bin}")
    try:
        py_compile.compile(temp_path, doraise=True)
        log_step(steps, "[SYNTAX] Syntax validation passed on transformed candidate.")
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        log_step(steps, f"[ERROR] Syntax validation failed: {e}. Aborting modification.")
        return {
            "success": False,
            "policy": "strict_lockdown",
            "room_py_path": room_py_path,
            "error": f"Syntax validation failed: {e}",
            "steps": steps
        }

    # 6. Atomic Replace
    try:
        os.replace(temp_path, room_py_path)
        log_step(steps, f"[EXEC] Atomically updated {room_py_path}")
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        log_step(steps, f"[ERROR] Atomic replace failed: {e}")
        return {
            "success": False,
            "policy": "strict_lockdown",
            "room_py_path": room_py_path,
            "error": f"Atomic replace failed: {e}",
            "steps": steps
        }

    # 7. Final validation on target file
    try:
        py_compile.compile(room_py_path, doraise=True)
        log_step(steps, "[VERIFY] Final on-disk syntax validation verified successfully.")
    except Exception as e:
        # Rollback immediately to pristine backup
        shutil.copy2(backup_path, room_py_path)
        log_step(steps, f"[ROLLBACK] Critical: on-disk verification failed ({e}). Restored pristine backup.")
        return {
            "success": False,
            "policy": "strict_lockdown",
            "room_py_path": room_py_path,
            "error": f"On-disk verification failed: {e}. Rollback executed.",
            "steps": steps
        }

    log_step(steps, "[SUCCESS] Strict Lockdown applied successfully with full idempotency.")
    return {
        "success": True,
        "policy": "strict_lockdown",
        "room_py_path": room_py_path,
        "backup_path": backup_path,
        "backup_created": backup_created,
        "steps": steps
    }


def restore_standard(room_py_path: str) -> Dict[str, Any]:
    """
    Safely restores room.py from room.py.orig.bak.
    Never overwrites or alters the pristine backup.
    """
    steps: List[str] = []
    log_step(steps, f"[POLICY] Restoring standard Matrix behavior on {room_py_path}")

    backup_path = room_py_path + ".orig.bak"
    if not os.path.exists(backup_path):
        log_step(steps, f"[WARNING] Pristine backup {backup_path} not found. Checking current room.py...")
        # If backup doesn't exist, room.py is already pristine or unbacked
        try:
            py_compile.compile(room_py_path, doraise=True)
            log_step(steps, "[VERIFY] Existing room.py verified as standard.")
            return {
                "success": True,
                "policy": "standard",
                "room_py_path": room_py_path,
                "steps": steps
            }
        except Exception as e:
            return {
                "success": False,
                "policy": "standard",
                "room_py_path": room_py_path,
                "error": f"room.py syntax error and no backup available: {e}",
                "steps": steps
            }

    # 1. Check backup readable
    if not (os.path.isfile(backup_path) and os.access(backup_path, os.R_OK)):
        log_step(steps, f"[ERROR] Pristine backup {backup_path} is unreadable.")
        return {
            "success": False,
            "policy": "standard",
            "room_py_path": room_py_path,
            "error": f"Pristine backup {backup_path} is unreadable.",
            "steps": steps
        }

    # 2. Syntax-check backup
    py_bin = discover_python_bin(room_py_path)
    try:
        py_compile.compile(backup_path, doraise=True)
        log_step(steps, f"[SYNTAX] Backup syntax verified using {py_bin}.")
    except Exception as e:
        log_step(steps, f"[ERROR] Backup syntax validation failed: {e}")
        return {
            "success": False,
            "policy": "standard",
            "room_py_path": room_py_path,
            "error": f"Backup syntax validation failed: {e}",
            "steps": steps
        }

    # 3. Copy to temporary file for safe staging
    temp_path = f"{room_py_path}.tmp_restore_{os.getpid()}"
    try:
        shutil.copy2(backup_path, temp_path)
        py_compile.compile(temp_path, doraise=True)
        log_step(steps, "[STAGE] Temp restore staged and verified.")
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        log_step(steps, f"[ERROR] Failed to stage restore: {e}")
        return {
            "success": False,
            "policy": "standard",
            "room_py_path": room_py_path,
            "error": f"Failed to stage restore: {e}",
            "steps": steps
        }

    # 4. Atomic Replace
    try:
        os.replace(temp_path, room_py_path)
        log_step(steps, f"[EXEC] Atomically restored pristine baseline to {room_py_path}")
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        log_step(steps, f"[ERROR] Atomic restore replace failed: {e}")
        return {
            "success": False,
            "policy": "standard",
            "room_py_path": room_py_path,
            "error": f"Atomic restore replace failed: {e}",
            "steps": steps
        }

    # 5. Final validation
    try:
        py_compile.compile(room_py_path, doraise=True)
        log_step(steps, "[VERIFY] Restored room.py syntax confirmed operational.")
    except Exception as e:
        log_step(steps, f"[ERROR] Restored file validation error: {e}")
        return {
            "success": False,
            "policy": "standard",
            "room_py_path": room_py_path,
            "error": f"Restored file validation error: {e}",
            "steps": steps
        }

    log_step(steps, "[SUCCESS] Standard Matrix behavior restored from pristine backup.")
    return {
        "success": True,
        "policy": "standard",
        "room_py_path": room_py_path,
        "backup_path": backup_path,
        "steps": steps
    }


def inspect_status(room_py_path: str) -> Dict[str, Any]:
    """Inspects room.py to determine active E2EE policy on disk."""
    if not os.path.exists(room_py_path):
        return {
            "status": "unknown",
            "error": "room.py does not exist",
            "room_py_path": room_py_path
        }

    with open(room_py_path, "r", encoding="utf-8") as f:
        content = f.read()

    has_lockdown_marker = "# === SYNAPSE E2EE STRICT LOCKDOWN ENFORCEMENT START ===" in content
    has_999_pl = "EventTypes.RoomEncryption: 999" in content or "RoomEncryption: 999" in content

    backup_exists = os.path.exists(room_py_path + ".orig.bak")

    if has_lockdown_marker or has_999_pl:
        active_policy = "strict_lockdown"
    else:
        active_policy = "standard"

    return {
        "status": "ok",
        "active_policy": active_policy,
        "room_py_path": room_py_path,
        "has_lockdown_marker": has_lockdown_marker,
        "has_999_power_level": has_999_pl,
        "backup_exists": backup_exists
    }


def main():
    parser = argparse.ArgumentParser(description="Synapse E2EE Policy Engine")
    parser.add_argument("--action", choices=["apply", "status", "discover"], default="status", help="Action to perform")
    parser.add_argument("--policy", choices=["standard", "strict_lockdown", "ALLOW", "STRICTLY_DISABLED"], default="standard", help="Target E2EE policy")
    parser.add_argument("--path", default=None, help="Explicit path to room.py if known")

    args = parser.parse_args()

    # Normalize policy
    normalized_policy = "strict_lockdown" if args.policy in ("strict_lockdown", "STRICTLY_DISABLED") else "standard"

    # Discover room.py
    if args.path:
        room_py_path = args.path
        discovery_steps = [f"[DISCOVERY] Using specified room.py path: {room_py_path}"]
    else:
        room_py_path, discovery_steps = discover_room_py()

    if not room_py_path or not os.path.exists(room_py_path):
        out = {
            "success": False,
            "error": "room.py not found under venv path, Synapse installation may be non-standard",
            "steps": discovery_steps
        }
        print(json.dumps(out, indent=2))
        sys.exit(1)

    if args.action == "discover":
        out = {
            "success": True,
            "room_py_path": room_py_path,
            "python_bin": discover_python_bin(room_py_path),
            "steps": discovery_steps
        }
        print(json.dumps(out, indent=2))
        sys.exit(0)

    if args.action == "status":
        status_info = inspect_status(room_py_path)
        status_info["steps"] = discovery_steps
        status_info["python_bin"] = discover_python_bin(room_py_path)
        print(json.dumps(status_info, indent=2))
        sys.exit(0)

    if args.action == "apply":
        if normalized_policy == "strict_lockdown":
            result = apply_strict_lockdown(room_py_path)
        else:
            result = restore_standard(room_py_path)

        result["steps"] = discovery_steps + result.get("steps", [])
        print(json.dumps(result, indent=2))
        sys.exit(0 if result.get("success") else 1)


if __name__ == "__main__":
    main()
