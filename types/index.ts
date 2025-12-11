// Core type definitions for LocalBite

export interface User {
  id: number;
  email: string;
  username?: string;
  full_name?: string;
  created_at?: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  image_path?: string;
  category_id: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Ingredient {
  id: number;
  recipe_id: number;
  name: string;
  quantity: string;
  unit?: string;
  is_main: boolean;
}

export interface Instruction {
  id: number;
  recipe_id: number;
  step_number: number;
  description: string;
}

export interface Favorite {
  id: number;
  user_id: number;
  recipe_id: number;
  created_at?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}

export interface APIError {
  message: string;
  status?: number;
  response?: unknown;
}
