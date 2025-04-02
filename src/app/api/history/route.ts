import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Cache voor de database connectie
let db: Database | null = null;
let lastDbPath: string | null = null;

function getHistoryDbPath(): string | null {
  const homeDir = os.homedir();
  let basePath = '';
  const isMac = os.type() === 'Darwin' || os.platform() === 'darwin';
  const isWindows = os.platform() === 'win32';

  if (isMac) {
    basePath = path.join(homeDir, 'Library/Application Support/Google/Chrome');
  } else if (isWindows) {
    basePath = path.join(homeDir, 'AppData/Local/Google/Chrome/User Data');
  } else {
    console.error('ERROR: Unsupported OS detected:', os.platform());
    return null;
  }

  const possibleProfiles = ['Default', 'Profile 1', 'Profile 2', 'Profile 3'];

  for (const profile of possibleProfiles) {
    const historyPath = path.join(basePath, profile, 'History');

    if (fs.existsSync(historyPath)) {
      if (isWindows) {
        //Windows: Copy the file to prevent file-locking issues
        const tempHistoryPath = path.join(os.tmpdir(), 'History_Copy');
        try {
          fs.copyFileSync(historyPath, tempHistoryPath);
          console.log(`Copied Chrome history to: ${tempHistoryPath}`);
          return tempHistoryPath;
        } catch (error) {
          console.error('ERROR: Failed to copy history file:', error);
          return null;
        }
      } else {
        //macOS: Directly return the file path (no locking issues)
        return historyPath;
      }
    }
  }

  console.error('ERROR: No Chrome history database found.');
  return null;
}

// Convert JavaScript Date to Chrome WebKit timestamp format
function getWebkitTimestamp(dateString: string): number {
  const date = new Date(dateString);
  const epochStart = new Date(1601, 0, 1).getTime();
  return (date.getTime() - epochStart) * 1000; // Convert to microseconds
}

async function getDatabase() {
  const historyDbPath = getHistoryDbPath();

  if (!historyDbPath) {
    throw new Error('Chrome history database not found');
  }

  // Als de database al open is en het pad hetzelfde is, hergebruik de connectie
  if (db && lastDbPath === historyDbPath) {
    return db;
  }

  // Sluit bestaande connectie als die er is
  if (db) {
    await db.close();
  }

  // Open nieuwe connectie
  db = await open({
    filename: historyDbPath,
    driver: sqlite3.Database,
  });

  lastDbPath = historyDbPath;
  return db;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get('date');

    const db = await getDatabase();

    let history;
    if (dateParam) {
      const startTimestamp = getWebkitTimestamp(dateParam);
      const endTimestamp = startTimestamp + 24 * 60 * 60 * 1000 * 1000;

      history = await db.all(
        `SELECT url, title, last_visit_time 
         FROM urls 
         WHERE last_visit_time >= ? AND last_visit_time < ? 
         ORDER BY last_visit_time DESC
         LIMIT 1000`, // Beperk het aantal resultaten voor betere performance
        [startTimestamp, endTimestamp]
      );
    } else {
      history = await db.all(
        `SELECT url, title, last_visit_time 
         FROM urls 
         ORDER BY last_visit_time DESC
         LIMIT 1000` // Beperk het aantal resultaten voor betere performance
      );
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to read history. Ensure Chrome is closed.' },
      { status: 500 }
    );
  }
}
