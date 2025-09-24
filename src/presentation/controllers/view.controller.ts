import { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ViewController {
  /**
   * Render main application page
   * Handles user interactions for rendering views
   */
  renderMainPage(_req: Request, res: Response): void {
    res.sendFile(path.join(__dirname, '..', 'views', 'public', 'index.html'));
  }
}