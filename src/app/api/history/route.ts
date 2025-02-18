import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Get the Chrome User Data folder
const chromePath = path.join(
  os.homedir(),
  'Library/Application Support/Google/Chrome'
);

// Find the correct profile directory
function getHistoryDbPath(): string | null {
  const possibleProfiles = ['Default', 'Profile 1', 'Profile 2', 'Profile 3'];

  for (const profile of possibleProfiles) {
    const historyPath = path.join(chromePath, profile, 'History');
    if (fs.existsSync(historyPath)) {
      return historyPath;
    }
  }

  return null;
}

// Convert JavaScript Date to Chrome WebKit timestamp format
function getWebkitTimestamp(dateString: string): number {
  const date = new Date(dateString);
  const epochStart = new Date(1601, 0, 1).getTime();
  return (date.getTime() - epochStart) * 1000; // Convert to microseconds
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const dateParam = url.searchParams.get('date');

  const historyDbPath = getHistoryDbPath();

  if (!historyDbPath) {
    return NextResponse.json(
      { error: 'Chrome history database not found. Try closing Chrome.' },
      { status: 500 }
    );
  }

  try {
    const db = await open({
      filename: historyDbPath,
      driver: sqlite3.Database,
    });

    let history;
    if (dateParam) {
      // Fetch history for a specific date
      const startTimestamp = getWebkitTimestamp(dateParam);
      const endTimestamp = startTimestamp + 24 * 60 * 60 * 1000 * 1000; // Add 24 hours in microseconds

      history = await db.all(
        `
        SELECT url, title, last_visit_time
        FROM urls
        WHERE last_visit_time >= ? AND last_visit_time < ?
        ORDER BY last_visit_time DESC
        `,
        [startTimestamp, endTimestamp]
      );
    } else {
      // Fetch **ALL** history if no date is given
      history = await db.all(`
        SELECT url, title, last_visit_time
        FROM urls
        ORDER BY last_visit_time DESC
      `);
    }

    await db.close();

    return NextResponse.json(history);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to read history. Ensure Chrome is closed.' },
      { status: 500 }
    );
  }
}
