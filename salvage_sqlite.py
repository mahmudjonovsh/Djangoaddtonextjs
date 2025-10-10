#!/usr/bin/env python3
"""
salvage_sqlite.py

Try to detect and repair a malformed SQLite database used by this Django project.

Behavior:
- Makes a timestamped backup of the original DB (backend/db.sqlite3.BAK-<ts>)
- Runs PRAGMA integrity_check; if OK, exits without changing the DB
- If not OK, attempts to dump the DB with connection.iterdump() and re-create a new DB
- If re-creation succeeds, replaces the original DB with the fixed DB (after keeping the backup)

This script is safe to run repeatedly. It prints progress and exits with non-zero on unrecoverable errors.
"""
import sqlite3
import shutil
import os
import sys
import time
import traceback


def main():
    db_path = os.path.join('backend', 'db.sqlite3')
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        sys.exit(2)

    ts = time.strftime('%Y%m%d%H%M%S')
    backup_path = db_path + f'.BAK-{ts}'
    try:
        print(f"Backing up '{db_path}' -> '{backup_path}'")
        shutil.copy2(db_path, backup_path)
    except Exception:
        print("Failed to create backup; aborting")
        traceback.print_exc()
        sys.exit(3)

    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        print('Running PRAGMA integrity_check;')
        res = cur.execute('PRAGMA integrity_check;').fetchone()
        if res and res[0].lower() == 'ok':
            print('PRAGMA integrity_check: OK — database appears healthy. No action needed.')
            conn.close()
            sys.exit(0)
        else:
            print('PRAGMA integrity_check returned:', res)

        print('Attempting to dump the database via connection.iterdump()')
        try:
            dump_lines = list(conn.iterdump())
        except Exception:
            print('iterdump() failed on the corrupted database')
            traceback.print_exc()
            conn.close()
            sys.exit(4)

        dump_sql = '\n'.join(dump_lines)
        dump_file = db_path + f'.dump-{ts}.sql'
        with open(dump_file, 'w', encoding='utf-8') as f:
            f.write(dump_sql)
        print(f'Dump written to {dump_file} ({len(dump_lines)} lines)')

        conn.close()

        new_db = db_path + f'.fixed-{ts}'
        if os.path.exists(new_db):
            os.remove(new_db)

        print(f'Creating new DB from dump: {new_db}')
        new_conn = sqlite3.connect(new_db)
        try:
            new_conn.executescript(dump_sql)
            new_conn.commit()
            new_conn.close()
            print('New DB created successfully.')
        except Exception:
            print('Failed to create new DB from dump')
            traceback.print_exc()
            try:
                new_conn.close()
            except Exception:
                pass
            sys.exit(5)

        # Replace the original DB with the fixed one (keep the backup)
        replaced_path = db_path + f'.replaced-{ts}'
        print('Replacing original DB with repaired DB')
        try:
            os.replace(db_path, replaced_path)
            os.replace(new_db, db_path)
            print(f'Original DB moved to {replaced_path} and fixed DB moved to {db_path}')
            print('Repair complete. Keep the backup file if you need to inspect or restore it:')
            print('  Backup:', backup_path)
            print('  Old original (moved):', replaced_path)
            print('  Dump file:', dump_file)
            sys.exit(0)
        except Exception:
            print('Failed to replace original DB with fixed DB — manual intervention required')
            traceback.print_exc()
            sys.exit(6)

    except sqlite3.DatabaseError:
        print('SQLite raised DatabaseError while opening the DB — it may be badly corrupted')
        traceback.print_exc()
        sys.exit(4)


if __name__ == '__main__':
    main()
