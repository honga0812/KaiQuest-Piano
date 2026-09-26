#!/usr/bin/env python3
import os
import sys
import subprocess
import zipfile
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DIST_DIR = os.path.join(ROOT_DIR, 'dist')
PUBLIC_DIR = os.path.join(ROOT_DIR, 'public')
ZIP_OUT_PUBLIC = os.path.join(PUBLIC_DIR, 'kaiquest-piano-deploy.zip')
ZIP_OUT_DIST = os.path.join(DIST_DIR, 'kaiquest-piano-deploy.zip')
ZIP_OUT_ROOT = os.path.join(ROOT_DIR, 'kaiquest-piano-deploy.zip')

print(f"Cleaning previous archives in {ROOT_DIR}...")
for target in [ZIP_OUT_PUBLIC, ZIP_OUT_DIST, ZIP_OUT_ROOT]:
    if os.path.exists(target):
        try:
            os.remove(target)
        except Exception as e:
            print(f"Notice: could not remove {target}: {e}")

print(f"Building applet in {ROOT_DIR}...")
build_res = subprocess.run(["npm", "run", "build"], cwd=ROOT_DIR)
if build_res.returncode != 0:
    print("Build failed, aborting zip creation.", file=sys.stderr)
    sys.exit(1)

if not os.path.exists(DIST_DIR):
    print("dist/ not found, build error.", file=sys.stderr)
    sys.exit(1)

os.makedirs(PUBLIC_DIR, exist_ok=True)
os.makedirs(DIST_DIR, exist_ok=True)

# Files in project root to include in zip
files_to_pack = [
    'server.js',
    'start-windows.bat',
    'start-mac-linux.sh',
    'README_DEPLOY.md',
    'package.json',
]

temp_zip = os.path.join(ROOT_DIR, 'temp_deploy_build.zip')
if os.path.exists(temp_zip):
    os.remove(temp_zip)

print("Creating clean zip archive...")
with zipfile.ZipFile(temp_zip, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zipf:
    # 1. Add root helper files
    for f in files_to_pack:
        abs_p = os.path.join(ROOT_DIR, f)
        if os.path.exists(abs_p):
            zipf.write(abs_p, arcname=f)
            print(f"  + Added: {f}")

    # 2. Add dist/ tree (strictly skip any .zip files)
    for root, dirs, files in os.walk(DIST_DIR):
        for file in files:
            if file.endswith('.zip') or file.startswith('.DS_Store'):
                continue
            abs_p = os.path.join(root, file)
            rel_p = os.path.relpath(abs_p, ROOT_DIR)
            zipf.write(abs_p, arcname=rel_p)

# Verify the zip archive is 100% valid
with zipfile.ZipFile(temp_zip, 'r') as check_zip:
    test_err = check_zip.testzip()
    if test_err is not None:
        print(f"Corrupted zip entry detected: {test_err}", file=sys.stderr)
        sys.exit(1)
    file_count = len(check_zip.namelist())
    print(f"Verified archive: {file_count} files, no corruptions.")

# Copy to final destinations
shutil.copy2(temp_zip, ZIP_OUT_PUBLIC)
shutil.copy2(temp_zip, ZIP_OUT_DIST)
shutil.copy2(temp_zip, ZIP_OUT_ROOT)
os.remove(temp_zip)

size_mb = os.path.getsize(ZIP_OUT_PUBLIC) / (1024 * 1024)
print(f"✅ Successfully created deployment archive: {ZIP_OUT_PUBLIC} ({size_mb:.2f} MB)")
print(f"✅ Duplicate saved at: {ZIP_OUT_DIST}")
print(f"✅ Duplicate saved at: {ZIP_OUT_ROOT}")
