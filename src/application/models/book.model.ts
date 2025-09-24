/**
 * Book Model
 * Represents the structure and validation for Book entities
 */
export interface Book {
  id: number;
  title: string;
  author: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class BookModel {
  id: number;
  title: string;
  author: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<Book>) {
    this.id = data.id || 0;
    this.title = data.title || '';
    this.author = data.author || '';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Validate book data
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.title || this.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!this.author || this.author.trim().length === 0) {
      errors.push('Author is required');
    }

    if (this.title && this.title.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    if (this.author && this.author.length > 100) {
      errors.push('Author must be less than 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert to plain object
   */
  toJSON(): Book {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}