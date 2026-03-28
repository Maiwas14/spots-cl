export type CategoriaTipo =
  | 'naturaleza'
  | 'playa'
  | 'ciudad'
  | 'sendero'
  | 'pueblo'
  | 'lago'
  | 'montana';

export interface Region {
  id: number;
  nombre: string;
  slug: string;
  orden: number;
}

export interface Comuna {
  id: number;
  nombre: string;
  region_id: number;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  region_id: number | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  titulo: string;
  descripcion: string | null;
  imagen_url: string;
  lat: number | null;
  lng: number | null;
  region_id: number | null;
  comuna_id: number | null;
  categoria: CategoriaTipo;
  dificultad: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  profiles?: Profile;
  regiones?: Region;
  comunas?: Comuna;
  user_saved?: boolean;
  user_rating?: number;
}

export interface Guardado {
  user_id: string;
  post_id: string;
  created_at: string;
}
