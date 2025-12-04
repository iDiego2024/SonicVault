
export interface Album {
  id: string;
  artist: string;
  title: string;
  rating: number | null; // 0-5
  ownership: string; // Digital, Vinyl, CD, etc.
  year: string;
  tags: string[];
  coverUrl?: string;
  reviewUrl?: string;
  spotifyUrl?: string;
  rymUrl?: string;
  // New Last.fm fields
  description?: string;
  listeners?: string;
  playcount?: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export type SortField = 'artist' | 'rating' | 'year' | 'added';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  search: string;
  minRating: number;
  year: string;
  tag: string;
}