export interface Book {
  id: string;
  title: string;
  author: string;
  created_at?: string;
}

export interface QueryResult {
  count: number;
  [key: string]: unknown;
}
