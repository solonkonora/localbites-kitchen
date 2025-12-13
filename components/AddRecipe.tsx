"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Trash2, Plus, Upload, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { Category } from "@/types";

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
  is_main: boolean;
}

interface Instruction {
  step_number: number;
  description: string;
}

export default function AddRecipe() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_path: "",
    category_id: "1",
  });
  const [mainIngredients, setMainIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "", unit: "", is_main: true },
  ]);
  const [optionalIngredients, setOptionalIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "", unit: "", is_main: false },
  ]);
  const [instructions, setInstructions] = useState<Instruction[]>([
    { step_number: 1, description: "" },
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: apiClient.getCategories,
  });

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const response = await apiClient.uploadImage(formData);
      return response.imageUrl;
    },
  });

  // Create recipe mutation
  const createRecipeMutation = useMutation({
    mutationFn: async (data: {
      recipe: Omit<typeof formData, 'category_id'> & { category_id: number };
      ingredients: Ingredient[];
      instructions: Instruction[];
    }) => {
      // Create recipe
      const recipe = await apiClient.createRecipe(data.recipe);
      
      // Add ingredients
      await apiClient.createIngredients(recipe.id, data.ingredients);
      
      // Add instructions
      await apiClient.createInstructions(recipe.id, data.instructions);
      
      return recipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] });
      setSuccess("Recipe created successfully! 🎉");
      // Reset form
      setFormData({
        title: "",
        description: "",
        image_path: "",
        category_id: "1",
      });
      setMainIngredients([{ name: "", quantity: "", unit: "", is_main: true }]);
      setOptionalIngredients([{ name: "", quantity: "", unit: "", is_main: false }]);
      setInstructions([{ step_number: 1, description: "" }]);
      removeImage();
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    },
    onError: (err: Error) => {
      console.error("Error creating recipe:", err);
      setError(err.message || "Failed to create recipe. Please try again.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      // Create preview
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
    value: string,
    isMain: boolean
  ) => {
    if (isMain) {
      const updated = [...mainIngredients];
      updated[index][field] = value as never;
      setMainIngredients(updated);
    } else {
      const updated = [...optionalIngredients];
      updated[index][field] = value as never;
      setOptionalIngredients(updated);
    }
  };

  const addIngredient = (isMain: boolean) => {
    if (isMain) {
      setMainIngredients([...mainIngredients, { name: "", quantity: "", unit: "", is_main: true }]);
    } else {
      setOptionalIngredients([...optionalIngredients, { name: "", quantity: "", unit: "", is_main: false }]);
    }
  };

  const removeIngredient = (index: number, isMain: boolean) => {
    if (isMain) {
      if (mainIngredients.length > 1) {
        setMainIngredients(mainIngredients.filter((_, i) => i !== index));
      }
    } else {
      if (optionalIngredients.length > 1) {
        setOptionalIngredients(optionalIngredients.filter((_, i) => i !== index));
      }
    }
  };

  const handleInstructionChange = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index].description = value;
    setInstructions(updated);
  };

  const addInstruction = () => {
    setInstructions([
      ...instructions,
      { step_number: instructions.length + 1, description: "" },
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
      setError("Please add at least one main ingredient with name and quantity.");
      return;
    }

    // Validate optional ingredients (only include filled ones)
    const validOptionalIngredients = optionalIngredients.filter(
      (ing) => ing.name.trim() && ing.quantity.trim()
    );

    // Combine all valid ingredients
    const allValidIngredients = [...validMainIngredients, ...validOptionalIngredients];

    // Validate instructions
    const validInstructions = instructions.filter(
      (inst) => inst.description.trim()
    );
    if (validInstructions.length === 0) {
      setError("Please add at least one cooking instruction.");
      return;
    }

    try {
      // Upload image first if a file is selected
      let imageUrl = formData.image_path;
      if (imageFile) {
        imageUrl = await uploadImageMutation.mutateAsync(imageFile);
      }

      await createRecipeMutation.mutateAsync({
        recipe: {
          ...formData,
          image_path: imageUrl,
          category_id: parseInt(formData.category_id),
        },
        ingredients: allValidIngredients,
        instructions: validInstructions,
      });
    } catch (err) {
      console.error("Error in handleSubmit:", err);
    }
  };

  const isLoading = uploadImageMutation.isPending || createRecipeMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Add New Recipe</h2>
      
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
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
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
                  <span className="text-gray-700 font-medium">Click to upload image</span>
                  <span className="text-sm text-gray-500">(Max 5MB, JPG/PNG)</span>
                </div>
              </label>
            ) : (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-64 rounded-lg shadow-md"
                />
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
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
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
              <h3 className="text-xl font-semibold text-gray-900">Main Ingredients *</h3>
              <p className="text-sm text-gray-600 mt-1">Essential ingredients that define this recipe</p>
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
                  placeholder="Ingredient name (e.g., Tomatoes)"
                  value={ingredient.name}
                  onChange={(e) =>
                    handleIngredientChange(index, "name", e.target.value, true)
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                />
                <input
                  type="text"
                  placeholder="Quantity"
                  value={ingredient.quantity}
                  onChange={(e) =>
                    handleIngredientChange(index, "quantity", e.target.value, true)
                  }
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) =>
                    handleIngredientChange(index, "unit", e.target.value, true)
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
              <h3 className="text-xl font-semibold text-gray-900">Optional Ingredients</h3>
              <p className="text-sm text-gray-600 mt-1">Additional ingredients to enhance the recipe</p>
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
                  placeholder="Ingredient name (e.g., Parsley for garnish)"
                  value={ingredient.name}
                  onChange={(e) =>
                    handleIngredientChange(index, "name", e.target.value, false)
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Quantity"
                  value={ingredient.quantity}
                  onChange={(e) =>
                    handleIngredientChange(index, "quantity", e.target.value, false)
                  }
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) =>
                    handleIngredientChange(index, "unit", e.target.value, false)
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
            <h3 className="text-xl font-semibold text-gray-900">Cooking Instructions *</h3>
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
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadImageMutation.isPending
            ? "Uploading image..."
            : createRecipeMutation.isPending
            ? "Creating recipe..."
            : "Create Recipe"}
        </button>
      </form>
    </div>
  );
}
