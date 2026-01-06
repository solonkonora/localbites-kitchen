"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Trash2, Plus, Upload, X, ArrowLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Category, Ingredient, Instruction } from "@/types";

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams();
  const recipeId = parseInt(params.id as string);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_path: "",
    category_id: "1",
  });
  const [mainIngredients, setMainIngredients] = useState<Ingredient[]>([]);
  const [optionalIngredients, setOptionalIngredients] = useState<Ingredient[]>(
    []
  );
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch recipe data
  const { data: recipe, isLoading: recipeLoading } = useQuery({
    queryKey: ["recipe", recipeId],
    queryFn: () => apiClient.getRecipe(recipeId),
  });

  // Fetch ingredients
  const { data: ingredientsData = [], isLoading: ingredientsLoading } =
    useQuery({
      queryKey: ["ingredients", recipeId],
      queryFn: () => apiClient.getIngredients(recipeId),
    });

  // Fetch instructions
  const { data: instructionsData = [], isLoading: instructionsLoading } =
    useQuery({
      queryKey: ["instructions", recipeId],
      queryFn: () => apiClient.getInstructions(recipeId),
    });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: apiClient.getCategories,
  });

  // Populate form when data loads - batch all state updates together
  useEffect(() => {
    if (
      !isInitialized &&
      recipe &&
      ingredientsData.length > 0 &&
      instructionsData.length > 0
    ) {
      startTransition(() => {
        // Initialize form data
        setFormData({
          title: recipe.title,
          description: recipe.description || "",
          image_path: recipe.image_path || "",
          category_id: recipe.category_id?.toString() || "1",
        });
        
        if (recipe.image_path) {
          setImagePreview(recipe.image_path);
        }
        
        // Initialize ingredients
        const main = ingredientsData.filter((ing) => ing.is_main);
        const optional = ingredientsData.filter((ing) => !ing.is_main);
        setMainIngredients(
          main.length > 0
            ? main
            : [{ name: "", quantity: "", unit: "", is_main: true } as Ingredient]
        );
        setOptionalIngredients(
          optional.length > 0
            ? optional
            : [{ name: "", quantity: "", unit: "", is_main: false } as Ingredient]
        );
        
        // Initialize instructions
        setInstructions(instructionsData);
        
        setIsInitialized(true);
      });
    }
  }, [recipe, ingredientsData, instructionsData, isInitialized]);

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const response = await apiClient.uploadImage(formData);
      return response.imageUrl;
    },
  });

  // Update recipe mutation
  const updateRecipeMutation = useMutation({
    mutationFn: async (data: {
      recipe: Omit<typeof formData, "category_id"> & { category_id: number };
      ingredients: Omit<Ingredient, "id" | "recipe_id" | "created_at">[];
      instructions: Omit<Instruction, "id" | "recipe_id" | "created_at">[];
    }) => {
      // Update recipe
      await apiClient.updateRecipe(recipeId, data.recipe);

      // Delete existing ingredients and instructions
      await Promise.all([
        ...ingredientsData.map((ing) => apiClient.deleteIngredient(ing.id)),
        ...instructionsData.map((inst) => apiClient.deleteInstruction(inst.id)),
      ]);

      // Add new ingredients and instructions
      await apiClient.createIngredients(recipeId, data.ingredients);
      await apiClient.createInstructions(recipeId, data.instructions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      queryClient.invalidateQueries({ queryKey: ["myRecipes"] });
      queryClient.invalidateQueries({ queryKey: ["recipe", recipeId] });
      queryClient.invalidateQueries({ queryKey: ["ingredients", recipeId] });
      queryClient.invalidateQueries({ queryKey: ["instructions", recipeId] });
      setSuccess("Recipe updated successfully!");

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard?tab=my-recipes");
      }, 2000);
    },
    onError: (err: Error) => {
      console.error("Error updating recipe:", err);
      setError(err.message || "Failed to update recipe. Please try again.");
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image_path: "" }));
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string | boolean,
    isMain: boolean
  ) => {
    if (isMain) {
      const updated = [...mainIngredients];
      updated[index] = { ...updated[index], [field]: value };
      setMainIngredients(updated);
    } else {
      const updated = [...optionalIngredients];
      updated[index] = { ...updated[index], [field]: value };
      setOptionalIngredients(updated);
    }
  };

  const addIngredient = (isMain: boolean) => {
    const newIngredient = {
      name: "",
      quantity: "",
      unit: "",
      is_main: isMain,
    } as Ingredient;
    if (isMain) {
      setMainIngredients([...mainIngredients, newIngredient]);
    } else {
      setOptionalIngredients([...optionalIngredients, newIngredient]);
    }
  };

  const removeIngredient = (index: number, isMain: boolean) => {
    if (isMain && mainIngredients.length > 1) {
      setMainIngredients(mainIngredients.filter((_, i) => i !== index));
    } else if (!isMain && optionalIngredients.length > 1) {
      setOptionalIngredients(optionalIngredients.filter((_, i) => i !== index));
    }
  };

  const handleInstructionChange = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = { ...updated[index], description: value };
    setInstructions(updated);
  };

  const addInstruction = () => {
    setInstructions([
      ...instructions,
      { step_number: instructions.length + 1, description: "" } as Instruction,
    ]);
  };

  const removeInstruction = (index: number) => {
    if (instructions.length > 1) {
      const updated = instructions
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, step_number: i + 1 }));
      setInstructions(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate main ingredients
    const validMainIngredients = mainIngredients.filter(
      (ing) => ing.name.trim() && ing.quantity.trim()
    );
    if (validMainIngredients.length === 0) {
      setError(
        "Please add at least one main ingredient with name and quantity."
      );
      return;
    }

    // Validate optional ingredients
    const validOptionalIngredients = optionalIngredients.filter(
      (ing) => ing.name.trim() && ing.quantity.trim()
    );

    const allValidIngredients = [
      ...validMainIngredients,
      ...validOptionalIngredients,
    ];

    // Validate instructions
    const validInstructions = instructions.filter((inst) =>
      inst.description.trim()
    );
    if (validInstructions.length === 0) {
      setError("Please add at least one cooking instruction.");
      return;
    }

    try {
      // Upload new image if selected
      let imageUrl = formData.image_path;
      if (imageFile) {
        imageUrl = await uploadImageMutation.mutateAsync(imageFile);
      }

      await updateRecipeMutation.mutateAsync({
        recipe: {
          ...formData,
          image_path: imageUrl,
          category_id: parseInt(formData.category_id),
        },
        ingredients: allValidIngredients.map(
          ({ name, quantity, unit, is_main }) => ({
            name,
            quantity,
            unit,
            is_main,
          })
        ),
        instructions: validInstructions.map(({ step_number, description }) => ({
          step_number,
          description,
        })),
      });
    } catch (err) {
      console.error("Error in handleSubmit:", err);
    }
  };

  const isLoading = recipeLoading || ingredientsLoading || instructionsLoading;
  const isSaving =
    uploadImageMutation.isPending || updateRecipeMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Recipe not found</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => router.push("/dashboard?tab=my-recipes")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to My Recipes
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Recipe</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipe Name */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Food Name *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Jollof Rice"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your recipe..."
              rows={4}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipe Image
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
              {!imagePreview ? (
                <label htmlFor="image-input" className="cursor-pointer block">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Upload className="text-orange-600" size={24} />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Click to upload image
                    </span>
                    <span className="text-sm text-gray-500">
                      (Max 5MB, JPG/PNG)
                    </span>
                  </div>
                </label>
              ) : (
                <div className="relative inline-block">
                  {imagePreview.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 rounded-lg shadow-md"
                    />
                  ) : (
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={400}
                      height={300}
                      className="max-h-64 w-auto rounded-lg shadow-md"
                    />
                  )}
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    aria-label="Remove image"
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
              <input
                type="file"
                id="image-input"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category *
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Main Ingredients Section */}
          <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Main Ingredients *
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Essential ingredients that define this recipe
                </p>
              </div>
              <button
                type="button"
                onClick={() => addIngredient(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus size={18} /> Add Main
              </button>
            </div>
            <div className="space-y-3">
              {mainIngredients.map((ingredient, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "name",
                        e.target.value,
                        true
                      )
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Quantity"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "quantity",
                        e.target.value,
                        true
                      )
                    }
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={ingredient.unit}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "unit",
                        e.target.value,
                        true
                      )
                    }
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                  />
                  {mainIngredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index, true)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove ingredient"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Optional Ingredients Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Optional Ingredients
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Additional ingredients to enhance the recipe
                </p>
              </div>
              <button
                type="button"
                onClick={() => addIngredient(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Plus size={18} /> Add Optional
              </button>
            </div>
            <div className="space-y-3">
              {optionalIngredients.map((ingredient, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "name",
                        e.target.value,
                        false
                      )
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Quantity"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "quantity",
                        e.target.value,
                        false
                      )
                    }
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={ingredient.unit}
                    onChange={(e) =>
                      handleIngredientChange(
                        index,
                        "unit",
                        e.target.value,
                        false
                      )
                    }
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none"
                  />
                  {optionalIngredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index, false)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove ingredient"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions Section */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Cooking Instructions *
              </h3>
              <button
                type="button"
                onClick={addInstruction}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Plus size={18} /> Add Step
              </button>
            </div>
            <div className="space-y-4">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                    {instruction.step_number}
                  </div>
                  <textarea
                    placeholder="Describe this cooking step..."
                    value={instruction.description}
                    onChange={(e) =>
                      handleInstructionChange(index, e.target.value)
                    }
                    rows={3}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
                  />
                  {instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove instruction"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard?tab=my-recipes")}
              disabled={isSaving}
              className="flex-1 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 bg-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadImageMutation.isPending
                ? "Uploading image..."
                : updateRecipeMutation.isPending
                ? "Updating recipe..."
                : "Update Recipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
