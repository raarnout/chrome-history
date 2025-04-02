import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import os from 'os';
import fs from 'fs';

interface HistoryItem {
  url: string;
  title: string;
  last_visit_time: number;
}

function getAllHistoryDbPaths(): string[] {
  const homeDir = os.homedir();
  let basePath = '';
  const isMac = os.type() === 'Darwin' || os.platform() === 'darwin';
  const isWindows = os.platform() === 'win32';
  const historyPaths: string[] = [];

  if (isMac) {
    basePath = path.join(homeDir, 'Library/Application Support/Google/Chrome');
    console.log('Checking Chrome profiles in:', basePath);

    try {
      const profiles = fs.readdirSync(basePath);
      console.log('Available profiles:', profiles);

      // Check alle profielen
      for (const profile of profiles) {
        const historyPath = path.join(basePath, profile, 'History');
        if (fs.existsSync(historyPath)) {
          const tempHistoryPath = path.join(
            os.tmpdir(),
            `History_Copy_${profile}`
          );
          try {
            fs.copyFileSync(historyPath, tempHistoryPath);
            console.log(`Copied Chrome history to: ${tempHistoryPath}`);
            historyPaths.push(tempHistoryPath);
          } catch (error) {
            console.error(
              `ERROR: Failed to copy history file for ${profile}:`,
              error
            );
          }
        }
      }
    } catch (error) {
      console.error('Error reading Chrome profiles:', error);
    }
  } else if (isWindows) {
    basePath = path.join(homeDir, 'AppData/Local/Google/Chrome/User Data');
    const possibleProfiles = ['Default', 'Profile 1', 'Profile 2', 'Profile 3'];

    for (const profile of possibleProfiles) {
      const historyPath = path.join(basePath, profile, 'History');
      if (fs.existsSync(historyPath)) {
        const tempHistoryPath = path.join(
          os.tmpdir(),
          `History_Copy_${profile}`
        );
        try {
          fs.copyFileSync(historyPath, tempHistoryPath);
          console.log(`Copied Chrome history to: ${tempHistoryPath}`);
          historyPaths.push(tempHistoryPath);
        } catch (error) {
          console.error(
            `ERROR: Failed to copy history file for ${profile}:`,
            error
          );
        }
      }
    }
  } else {
    console.error('ERROR: Unsupported OS detected:', os.platform());
  }

  return historyPaths;
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

  const historyDbPaths = getAllHistoryDbPaths();

  if (historyDbPaths.length === 0) {
    console.error('ERROR: No Chrome history databases found.');
    return NextResponse.json(
      {
        error:
          'Geen Chrome geschiedenis gevonden. Controleer of Chrome correct is geïnstalleerd.',
      },
      { status: 500 }
    );
  }

  console.log(`Found ${historyDbPaths.length} Chrome history databases`);

  try {
    let allHistory: HistoryItem[] = [];

    // Lees de geschiedenis van elk profiel
    for (const dbPath of historyDbPaths) {
      try {
        const db = await open({
          filename: dbPath,
          driver: sqlite3.Database,
        });

        let history;
        if (dateParam) {
          const startTimestamp = getWebkitTimestamp(dateParam);
          const endTimestamp = startTimestamp + 24 * 60 * 60 * 1000 * 1000; // Add 24 hours in microseconds

          history = await db.all(
            `SELECT url, title, last_visit_time FROM urls 
             WHERE last_visit_time >= ? AND last_visit_time < ? 
             ORDER BY last_visit_time DESC`,
            [startTimestamp, endTimestamp]
          );
        } else {
          history = await db.all(
            `SELECT url, title, last_visit_time FROM urls ORDER BY last_visit_time DESC`
          );
        }

        allHistory = [...allHistory, ...history];
        await db.close();
      } catch (error) {
        console.error(`Error reading database at ${dbPath}:`, error);
        return NextResponse.json(
          {
            error:
              'Kon de Chrome geschiedenis niet lezen. Probeer het opnieuw.',
          },
          { status: 500 }
        );
      }
    }

    // Sorteer alle geschiedenis op tijdstip
    allHistory.sort((a, b) => b.last_visit_time - a.last_visit_time);

    return NextResponse.json(allHistory);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Kon de Chrome geschiedenis niet lezen. Probeer het opnieuw.' },
      { status: 500 }
    );
  }
}
