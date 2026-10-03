import os
import sys
import hashlib
import uuid
from datetime import datetime, timedelta
try:
    import winreg
except ImportError:
    winreg = None

# Master secret key known only inside the app and developer's key generator
MASTER_SECRET_KEY = "SMART-POS-2026-BANO-QABIL-ABJABBAR-DEV-SECRET"

def get_machine_id():
    """Generates a consistent, hardware-locked Machine ID for this computer."""
    # 1. Windows Cryptography MachineGuid
    guid = ""
    if winreg:
        try:
            with winreg.OpenKey(winreg.HKEY_LOCAL_MACHINE, r"SOFTWARE\Microsoft\Cryptography") as key:
                guid, _ = winreg.QueryValueEx(key, "MachineGuid")
        except Exception:
            pass

    # 2. Network MAC address
    mac = str(uuid.getnode())

    # 3. Environment computer name
    comp_name = os.environ.get('COMPUTERNAME', '')

    # Combine all hardware fingerprints
    raw = f"{guid}:{mac}:{comp_name}:{MASTER_SECRET_KEY}"
    h = hashlib.sha256(raw.encode('utf-8')).hexdigest()[:12].upper()
    return f"POS-{h[0:4]}-{h[4:8]}-{h[8:12]}"

def generate_license(machine_id, lic_type='lifetime', days=30):
    """Generates a signed activation key for a given machine ID."""
    machine_id = machine_id.strip().upper()
    if lic_type == 'lifetime':
        type_code = 'LIFE'
        expiry = '99991231'
    else:
        type_code = f"TR{min(int(days), 99):02d}"
        exp_date = datetime.now() + timedelta(days=int(days))
        expiry = exp_date.strftime('%Y%m%d')

    payload = f"{machine_id}|{type_code}|{expiry}|{MASTER_SECRET_KEY}"
    sig = hashlib.sha256(payload.encode('utf-8')).hexdigest()[:8].upper()

    # Key format: ACT-LIFE-99991231-A1B2-C3D4
    key = f"ACT-{type_code}-{expiry}-{sig[0:4]}-{sig[4:8]}"
    return key, expiry

def verify_license(machine_id, key):
    """
    Verifies the license key for this specific machine.
    Returns: (is_valid: bool, status: str, message: str, expiry: str)
    status can be: 'lifetime', 'trial', 'expired', 'invalid_signature', 'invalid_format'
    """
    if not key or not isinstance(key, str):
        return False, "unregistered", "سافٹ ویئر ایکٹیویٹ نہیں ہے۔ براہ کرم لائسنس کی درج کریں۔", None

    machine_id = machine_id.strip().upper()
    key = key.strip().upper()
    parts = key.split('-')
    if len(parts) != 5 or parts[0] != 'ACT':
        return False, "invalid_format", "غلط لائسنس کی فارمیٹ! براہ کرم درست کی درج کریں۔", None

    type_code = parts[1]
    expiry = parts[2]
    sig_given = parts[3] + parts[4]

    # Re-calculate expected signature for this machine
    payload = f"{machine_id}|{type_code}|{expiry}|{MASTER_SECRET_KEY}"
    expected_sig = hashlib.sha256(payload.encode('utf-8')).hexdigest()[:8].upper()

    if sig_given != expected_sig:
        return False, "invalid_signature", "یہ لائسنس کی اس کمپیوٹر کے لیے درست نہیں ہے۔", None

    # Check expiration date
    today_str = datetime.now().strftime('%Y%m%d')
    if today_str > expiry:
        return False, "expired", "اس سافٹ ویئر کی آزمائشی مدت (Trial) ختم ہو چکی ہے۔", expiry

    if type_code == 'LIFE':
        return True, "lifetime", "لائف ٹائم لائسنس فعال ہے!", expiry
    else:
        try:
            exp_dt = datetime.strptime(expiry, '%Y%m%d')
            now_dt = datetime.now()
            days_left = max(0, (exp_dt.date() - now_dt.date()).days)
            return True, "trial", f"آزمائشی لائسنس فعال ہے ({days_left} دن باقی ہیں)۔", expiry
        except Exception:
            return True, "trial", "آزمائشی لائسنس فعال ہے۔", expiry
