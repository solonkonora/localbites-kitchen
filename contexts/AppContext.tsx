'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import api from '@/lib/apiClient';
import type { Recipe, Category } from '@/types';

interface AppContextType {
  isLoading: boolean;
  recipes: Recipe[];
  allRecipes: Recipe[];
  categories: Category[];
  searchQuery: string;
  selectedRecipe: Recipe | null;
  error: Error | null;
  setRecipes: (recipes: Recipe[]) => void;
  fetchRecipes: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  searchRecipes: (query?: string) => Promise<void>;
  createRecipe: (
    payload: Partial<Recipe>, 
    ingredients?: Array<{ name: string; quantity: string; unit?: string }>, 
    instructions?: Array<{ step_number: number; description: string }>
  ) => Promise<Recipe>;
  updateRecipe: (id: number, payload: Partial<Recipe>) => Promise<Recipe>;
  removeRecipe: (id: number) => Promise<void>;
  openRecipe: (id: number) => Promise<void>;
  closeRecipe: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      const categoryList = Array.isArray(data) ? data : [];
      // Remove duplicates if any exist
      const uniqueCategories = categoryList.filter((cat, index, self) =>
        index === self.findIndex((c) => c.id === cat.id)
      );
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching categories', err);
    }
  }, []);

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getRecipes();
      const recipeList = Array.isArray(data) ? data : [];
      setAllRecipes(recipeList);
      setRecipes(recipeList);
      setSearchQuery('');
    } catch (err) {
      console.error('Error fetching recipes', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchRecipes = useCallback(async (query: string = '') => {
    const q = query.trim().toLowerCase();
    setSearchQuery(q);
    
    let recipeList = allRecipes;
    if (recipeList.length === 0) {
      setIsLoading(true);
      setError(null);
      try {
        const all = await api.getRecipes();
        recipeList = Array.isArray(all) ? all : [];
        setAllRecipes(recipeList);
      } catch (err) {
        console.error('Search error', err);
        setError(err as Error);
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    }
    
    if (!q) {
      setRecipes(recipeList);
      return;
    }
    
    const filtered = recipeList.filter((r) => {
      const title = (r.title || '').toString().toLowerCase();
      const desc = (r.description || '').toString().toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
    setRecipes(filtered);
  }, [allRecipes]);

  const createRecipe = useCallback(async (
    payload: Partial<Recipe>,
    ingredients: Array<{ name: string; quantity: string; unit?: string }> = [],
    instructions: Array<{ step_number: number; description: string }> = []
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const created = await api.createRecipe(payload);
      const recipeId = created.id;

      if (ingredients.length > 0) {
        await api.createIngredients(recipeId, ingredients);
      }

      if (instructions.length > 0) {
        await api.createInstructions(recipeId, instructions);
      }

      await fetchRecipes();
      return created;
    } catch (err) {
      console.error('Create recipe error', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecipes]);

  const updateRecipe = useCallback(async (id: number, payload: Partial<Recipe>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await api.updateRecipe(id, payload);
      await fetchRecipes();
      return updated;
    } catch (err) {
      console.error('Update recipe error', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecipes]);

  const removeRecipe = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.deleteRecipe(id);
      await fetchRecipes();
    } catch (err) {
      console.error('Delete recipe error', err);
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchRecipes]);

  const openRecipe = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const r = await api.getRecipe(id);
      setSelectedRecipe(r);
    } catch (err) {
      console.error('Open recipe error', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeRecipe = useCallback(() => {
    setSelectedRecipe(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoading,
        recipes,
        allRecipes,
        categories,
        searchQuery,
        selectedRecipe,
        error,
        setRecipes,
        fetchRecipes,
        fetchCategories,
        searchRecipes,
        createRecipe,
        updateRecipe,
        removeRecipe,
        openRecipe,
        closeRecipe,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
