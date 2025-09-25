import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface QueryResult {
  count: number;
  [key: string]: unknown;
}

export class DatabaseConnection {
  private db: sqlite3.Database | null = null;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(__dirname, '..', '..', 'library.db');
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          resolve();
        }
      });
    });
  }

  async runMigrations(): Promise<void> {
    const migrationsDir = path.join(
      __dirname,
      '..',
      '..',
      'src',
      'data-access',
      'migrations'
    );

    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found');
      return;
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(migrationPath, 'utf-8');

      await this.run(sql);
      console.log(`Executed migration: ${file}`);
    }
  }

  async populateSampleData(): Promise<void> {
    const scriptsDir = path.join(__dirname, '..', '..', 'scripts');

    // Populate books sample data
    const booksScript = path.join(scriptsDir, 'populate-sample-books.sql');
    if (fs.existsSync(booksScript)) {
      const booksCount = await this.get('SELECT COUNT(*) as count FROM books');
      if (booksCount.count === 0) {
        const sql = fs.readFileSync(booksScript, 'utf-8');
        await this.run(sql);
        console.log('Sample books data populated');
      } else {
        console.log('Sample books data already exists, skipping population');
      }
    }

    // Populate members sample data
    const membersScript = path.join(scriptsDir, 'populate-sample-members.sql');
    if (fs.existsSync(membersScript)) {
      const membersCount = await this.get(
        'SELECT COUNT(*) as count FROM members'
      );
      if (membersCount.count === 0) {
        const sql = fs.readFileSync(membersScript, 'utf-8');
        await this.run(sql);
        console.log('Sample members data populated');
      } else {
        console.log('Sample members data already exists, skipping population');
      }
    }
  }

  async run(sql: string, params: unknown[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async get(sql: string): Promise<QueryResult> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.get(sql, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as QueryResult);
        }
      });
    });
  }

  async all(sql: string, params: unknown[] = []): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getOne(sql: string, params: unknown[] = []): Promise<unknown | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not connected'));
        return;
      }

      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      });
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Database connection closed');
          resolve();
        }
      });
    });
  }
}

export const databaseConnection = new DatabaseConnection();
