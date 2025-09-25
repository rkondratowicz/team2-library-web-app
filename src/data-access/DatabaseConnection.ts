import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

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
    const populateScript = path.join(scriptsDir, 'populate-sample-books.sql');

    if (fs.existsSync(populateScript)) {
      const count = await this.get('SELECT COUNT(*) as count FROM books');
      if (count.count === 0) {
        const sql = fs.readFileSync(populateScript, 'utf-8');
        await this.run(sql);
        console.log('Sample data populated');
      } else {
        console.log('Sample data already exists, skipping population');
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
