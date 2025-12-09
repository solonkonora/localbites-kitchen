// API client for LocalBite backend
import type { 
  Recipe, 
  Category, 
  User, 
  AuthResponse, 
  Ingredient, 
  Instruction,
  Favorite 
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

interface RequestOptions {
  method?: string;
  headers?: HeadersInit;
  body?: Record<string, unknown> | string;
  credentials?: RequestCredentials;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  
  // Get token from localStorage if available (only on client side)
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const opts: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    credentials: options.credentials || 'include',
  };

  if (options.body) {
    opts.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }

  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text();
    let errorData: string | Record<string, unknown> = text;
    try { 
      errorData = JSON.parse(text); 
    } catch { 
      // ignore non-json response 
    }
    
    const errorMessage = typeof errorData === 'object' && errorData.message 
      ? String(errorData.message) 
      : `API request failed: ${res.status} ${res.statusText}`;
    
    const error = Object.assign(
      new Error(errorMessage),
      { status: res.status, response: errorData }
    );
    throw error;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text() as T;
}

// Recipe endpoints
export async function getRecipes(): Promise<Recipe[]> {
  return request<Recipe[]>('/recipes', { method: 'GET' });
}

export async function getMyRecipes(): Promise<Recipe[]> {
  return request<Recipe[]>('/recipes/my-recipes', { method: 'GET' });
}

export async function getRecipe(id: number): Promise<Recipe> {
  return request<Recipe>(`/recipes/${id}`, { method: 'GET' });
}

export async function createRecipe(data: Partial<Recipe>): Promise<Recipe> {
  return request<Recipe>('/recipes', { method: 'POST', body: data });
}

export async function updateRecipe(id: number, data: Partial<Recipe>): Promise<Recipe> {
  return request<Recipe>(`/recipes/${id}`, { method: 'PUT', body: data });
}

export async function deleteRecipe(id: number): Promise<void> {
  return request<void>(`/recipes/${id}`, { method: 'DELETE' });
}

export async function uploadImage(formData: FormData): Promise<{ imageUrl: string }> {
  const url = `${API_BASE}/recipes/upload-image`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: headers,
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    let errorData: string | Record<string, unknown> = text;
    try { 
      errorData = JSON.parse(text); 
    } catch { 
      // ignore non-json response
    }
    
    const errorMessage = typeof errorData === 'object' && errorData.message 
      ? String(errorData.message) 
      : `Image upload failed: ${res.status} ${res.statusText}`;
    
    const error = Object.assign(
      new Error(errorMessage),
      { status: res.status, response: errorData }
    );
    throw error;
  }

  return res.json();
}

// Auth endpoints
export async function signup(email: string, password: string, full_name: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/signup', { 
    method: 'POST', 
    body: { email, password, full_name } 
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', { 
    method: 'POST', 
    body: { email, password } 
  });
}

export async function logout(): Promise<void> {
  return request<void>('/auth/logout', { method: 'POST' });
}

export async function getCurrentUser(): Promise<{ user: User }> {
  return request<{ user: User }>('/auth/me', { method: 'GET' });
}

export async function requestMagicLink(email: string): Promise<{ message: string; isNewUser: boolean }> {
  return request<{ message: string; isNewUser: boolean }>('/auth/request-magic-link', { 
    method: 'POST', 
    body: { email } 
  });
}

export async function verifyMagicLink(token: string): Promise<AuthResponse & { isNewUser: boolean }> {
  return request<AuthResponse & { isNewUser: boolean }>('/auth/verify-magic-link', { 
    method: 'POST', 
    body: { token } 
  });
}

export async function verifyEmail(token: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/verify-email', { 
    method: 'POST', 
    body: { token } 
  });
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  return request<{ message: string }>('/auth/resend-verification', { 
    method: 'POST', 
    body: { email } 
  });
}

// Favorites endpoints
export async function getFavorites(): Promise<Favorite[]> {
  return request<Favorite[]>('/favorites', { method: 'GET' });
}

export async function addFavorite(recipeId: number): Promise<Favorite> {
  return request<Favorite>(`/favorites/${recipeId}`, { method: 'POST' });
}

export async function removeFavorite(recipeId: number): Promise<void> {
  return request<void>(`/favorites/${recipeId}`, { method: 'DELETE' });
}

export async function checkFavorite(recipeId: number): Promise<{ isFavorite: boolean }> {
  return request<{ isFavorite: boolean }>(`/favorites/check/${recipeId}`, { method: 'GET' });
}

// Instructions endpoints
export async function getInstructions(recipeId: number): Promise<Instruction[]> {
  return request<Instruction[]>(`/instructions/${recipeId}`, { method: 'GET' });
}

export async function createInstructions(
  recipeId: number, 
  instructions: Array<{ step_number: number; description: string }>
): Promise<Instruction[]> {
  return request<Instruction[]>(`/instructions/${recipeId}`, {
    method: 'POST',
    body: { instructions },
  });
}

export async function updateInstruction(id: number, data: Partial<Instruction>): Promise<Instruction> {
  return request<Instruction>(`/instructions/${id}`, { method: 'PUT', body: data });
}

export async function deleteInstruction(id: number): Promise<void> {
  return request<void>(`/instructions/${id}`, { method: 'DELETE' });
}

// Ingredients endpoints
export async function getIngredients(recipeId: number): Promise<Ingredient[]> {
  return request<Ingredient[]>(`/ingredients/${recipeId}`, { method: 'GET' });
}

export async function createIngredients(
  recipeId: number,
  ingredients: Array<Partial<Ingredient>>
): Promise<Ingredient[]> {
  const results: Ingredient[] = [];
  for (const ingredient of ingredients) {
    const result = await request<Ingredient>(`/ingredients/${recipeId}`, {
      method: 'POST',
      body: ingredient,
    });
    results.push(result);
  }
  return results;
}

export async function updateIngredient(id: number, data: Partial<Ingredient>): Promise<Ingredient> {
  return request<Ingredient>(`/ingredients/${id}`, { method: 'PUT', body: data });
}

export async function deleteIngredient(id: number): Promise<void> {
  return request<void>(`/ingredients/${id}`, { method: 'DELETE' });
}

// Categories endpoints
export async function getCategories(): Promise<Category[]> {
  return request<Category[]>('/categories', { method: 'GET' });
}

const api = { 
  getRecipes, 
  getMyRecipes,
  getRecipe,
  getRecipeById: getRecipe,
  createRecipe, 
  updateRecipe, 
  deleteRecipe,
  uploadImage,
  signup,
  login,
  logout,
  getCurrentUser,
  requestMagicLink,
  verifyMagicLink,
  verifyEmail,
  resendVerification,
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
  getInstructions,
  getInstructionsByRecipeId: getInstructions,
  createInstructions,
  updateInstruction,
  deleteInstruction,
  getIngredients,
  getIngredientsByRecipeId: getIngredients,
  createIngredients,
  updateIngredient,
  deleteIngredient,
  getCategories
};

export default api;
