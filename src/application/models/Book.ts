export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  genre?: string;
  publication_year?: number;
  description?: string;
  copies_available?: number;
  created_at?: string;
}
