"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, X, Check, Search, ChefHat } from "lucide-react";
import axios from "axios";
import * as XLSX from 'xlsx';

export default function RecipesManagement({ storeId }) {
  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState("all");
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [formData, setFormData] = useState({
    menuItemId: "",
    menuItemName: "",
    ingredients: [],
    yieldQuantity: 1,
    yieldUnit: "serving",
    instructions: "",
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchRecipes();
    fetchMenuItems();
    fetchInventoryItems();
  }, [storeId]);

  const fetchRecipes = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/inventory/recipes/${storeId}`);
      if (response.data.success) {
        setRecipes(response.data.recipes);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  const fetchMenuItems = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/menu/items/${storeId}`);
      if (response.data.success) {
        setMenuItems(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const fetchInventoryItems = async () => {
    if (!storeId) return;
    try {
      const response = await axios.get(`${API_URL}/api/inventory/items/${storeId}`);
      if (response.data.success) {
        setInventoryItems(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching inventory items:", error);
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { itemId: "", itemName: "", quantity: 0, unit: "kg", cost: 0 }
      ]
    });
  };

  const updateIngredient = (index, field, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index][field] = value;
    
    if (field === "itemId") {
      const selectedItem = inventoryItems.find(item => item._id === value);
      if (selectedItem) {
        updatedIngredients[index].itemName = selectedItem.name;
        updatedIngredients[index].cost = selectedItem.price;
      }
    }
    
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const removeIngredient = (index) => {
    const updatedIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const calculateTotalCost = () => {
    return formData.ingredients.reduce((total, ing) => total + (ing.quantity * ing.cost), 0);
  };

  const createRecipe = async () => {
    if (!formData.menuItemId || formData.ingredients.length === 0) {
      alert("Please select a menu item and add at least one ingredient");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/inventory/recipes`, {
        storeId,
        ...formData,
      });

      if (response.data.success) {
        await fetchRecipes();
        closeModal();
      }
    } catch (error) {
      console.error("Error creating recipe:", error);
      alert(error.response?.data?.message || "Failed to create recipe");
    }
  };

  const deleteRecipe = async (recipeId) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;

    try {
      const response = await axios.delete(`${API_URL}/api/inventory/recipes/${recipeId}`);

      if (response.data.success) {
        await fetchRecipes();
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert(error.response?.data?.message || "Failed to delete recipe");
    }
  };

  const openModal = (recipe = null) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setFormData({
        menuItemId: recipe.menuItemId,
        menuItemName: recipe.menuItemName,
        ingredients: recipe.ingredients,
        yieldQuantity: recipe.yieldQuantity,
        yieldUnit: recipe.yieldUnit,
        instructions: recipe.instructions || "",
      });
    } else {
      setEditingRecipe(null);
      setFormData({
        menuItemId: "",
        menuItemName: "",
        ingredients: [],
        yieldQuantity: 1,
        yieldUnit: "serving",
        instructions: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecipe(null);
  };

    const generateSummaryData = () => {
    if (filteredRecipes.length === 0) {
      alert("No recipes found for the selected filter");
      return null;
    }

    const ingredientMap = new Map();

    filteredRecipes.forEach(recipe => {
      (recipe.ingredients || []).forEach(ing => {
        const key = `${ing.itemName}__${ing.unit}`;
        const amount = ing.quantity * ing.cost;
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key);
          existing.quantity += ing.quantity;
          existing.amount += amount;
        } else {
          ingredientMap.set(key, {
            name: ing.itemName,
            unit: ing.unit,
            quantity: ing.quantity,
            amount,
          });
        }
      });
    });

    const ingredientRows = [...ingredientMap.values()];
    const totalIngredientCost = ingredientRows.reduce((s, i) => s + i.amount, 0);
    const totalRecipeCost = filteredRecipes.reduce((s, r) => s + (r.totalCost || 0), 0);
    const filterLabel = selectedMenuItem === "all"
      ? "All Menu Items"
      : menuItems.find(m => m._id === selectedMenuItem)?.name || "Selected Item";
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    return {
      filterLabel,
      filteredRecipes,
      ingredientRows,
      totalIngredientCost,
      totalRecipeCost,
      dateStr,
      timeStr,
    };
  };

  const handleGenerateReport = () => {
    const data = generateSummaryData();
    if (data) {
      setSummaryData(data);
      setShowSummaryModal(true);
    }
  };

  const handlePrintReport = () => {
    if (!summaryData) return;
    const { filterLabel, filteredRecipes, ingredientRows, totalIngredientCost, totalRecipeCost, dateStr, timeStr } = summaryData;

    const recipeRows = filteredRecipes.map(r => `
      <tr>
        <td style="padding: 4px 0;">${r.menuItemName}</td>
        <td style="text-align: center; padding: 4px 0;">${r.yieldQuantity} ${r.yieldUnit}(s)</td>
        <td style="text-align: right; padding: 4px 0;">₹${(r.totalCost || 0).toLocaleString("en-IN")}</td>
      </tr>
    `).join("");

    const ingredientTableRows = ingredientRows.map(i => `
      <tr>
        <td style="padding: 3px 0;">${i.name}</td>
        <td style="text-align: center; padding: 3px 0;">${i.quantity} ${i.unit}</td>
        <td style="text-align: right; padding: 3px 0;">₹${i.amount.toLocaleString("en-IN")}</td>
      </tr>
    `).join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recipe Cost Summary</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', Courier, monospace; padding: 28px 32px; font-size: 13px; color: #111; }
            .center { text-align: center; }
            h1 { font-size: 18px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
            .sub { font-size: 12px; color: #444; margin: 2px 0; }
            .divider-solid { border: none; border-top: 1.5px solid #111; margin: 10px 0; }
            .divider-dash { border: none; border-top: 1px dashed #aaa; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { font-size: 11px; text-transform: uppercase; text-align: left; border-bottom: 1px solid #ccc; padding: 4px 0; }
            .grand td { font-size: 15px; font-weight: bold; padding-top: 8px; }
            .grand td:last-child { text-align: right; }
          </style>
        </head>
        <body>
          <div class="center">
            <h1>Recipe Cost Summary</h1>
            <p class="sub">Filter: ${filterLabel}</p>
            <p class="sub">Printed: ${dateStr} at ${timeStr}</p>
          </div>
          <hr class="divider-dash">
          <p class="sub" style="font-weight:bold; text-transform:uppercase;">Recipes</p>
          <table>
            <thead><tr><th>Menu Item</th><th>Yield</th><th style="text-align:right;">Cost</th></tr></thead>
            <tbody>${recipeRows}</tbody>
          </table>
          <hr class="divider-dash">
          <p class="sub" style="font-weight:bold; text-transform:uppercase;">Ingredient Breakdown</p>
          <table>
            <thead><tr><th>Ingredient</th><th>Qty</th><th style="text-align:right;">Cost</th></tr></thead>
            <tbody>${ingredientTableRows}</tbody>
          </table>
          <hr class="divider-solid">
          <table>
            <tr class="grand"><td>Total Ingredient Cost</td><td style="text-align:right;">₹${totalIngredientCost.toLocaleString("en-IN")}</td></tr>
            <tr class="grand"><td>Total Recipe Cost</td><td style="text-align:right;">₹${totalRecipeCost.toLocaleString("en-IN")}</td></tr>
          </table>
        </body>
      </html>
    `;

    const win = window.open("", "_blank", "width=600,height=800");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  const handleExportToExcel = () => {
    if (!summaryData) return;
    const { filterLabel, filteredRecipes, ingredientRows, totalIngredientCost, totalRecipeCost } = summaryData;

    const excelData = [];
    excelData.push(['Recipe Cost Summary']);
    excelData.push([filterLabel]);
    excelData.push([]);
    excelData.push(['Recipes']);
    excelData.push(['Menu Item', 'Yield', 'Cost (₹)']);
    filteredRecipes.forEach(r => {
      excelData.push([r.menuItemName, `${r.yieldQuantity} ${r.yieldUnit}(s)`, r.totalCost || 0]);
    });
    excelData.push([]);
    excelData.push(['Ingredient Breakdown']);
    excelData.push(['Ingredient', 'Quantity', 'Amount (₹)']);
    ingredientRows.forEach(i => {
      excelData.push([i.name, `${i.quantity} ${i.unit}`, i.amount]);
    });
    excelData.push([]);
    excelData.push(['Total Ingredient Cost', totalIngredientCost]);
    excelData.push(['Total Recipe Cost', totalRecipeCost]);

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Recipe Summary');
    XLSX.writeFile(wb, `recipe_cost_summary_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredRecipes = selectedMenuItem === "all" 
    ? recipes 
    : recipes.filter(r => r.menuItemId === selectedMenuItem);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Recipe Management</h1>
            <p className="text-gray-500 text-sm mt-1">Define ingredients and quantities for each menu item</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={filteredRecipes.length === 0}
              className="bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🖨️ Print Summary
            </button>
            <button
              onClick={() => openModal()}
              className="bg-[#a3e635] text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#bef264] transition flex items-center gap-2"
            >
              <Plus size={16} />
              Create Recipe
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex gap-3">
            <select
              value={selectedMenuItem}
              onChange={(e) => setSelectedMenuItem(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
            >
              <option value="all">All Menu Items</option>
              {menuItems.map(item => (
                <option key={item._id} value={item._id}>{item.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRecipes.map((recipe) => (
            <motion.div
              key={recipe._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{recipe.menuItemName}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Yield: {recipe.yieldQuantity} {recipe.yieldUnit}(s)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteRecipe(recipe._id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ingredients</p>
                <div className="space-y-2">
                  {recipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{ing.itemName}</span>
                      <span className="font-medium text-gray-800">
                        {ing.quantity} {ing.unit} × ₹{ing.cost}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 mt-3 pt-3">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Total Cost per {recipe.yieldUnit}</span>
                    <span className="text-green-600">₹{recipe.totalCost}</span>
                  </div>
                </div>
                {recipe.instructions && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">Instructions:</p>
                    <p className="text-sm text-gray-700 mt-1">{recipe.instructions}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add/Edit Recipe Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingRecipe ? "Edit Recipe" : "Create New Recipe"}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Define ingredients for your menu item</p>
                </div>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Menu Item *</label>
                  <select
                    value={formData.menuItemId}
                    onChange={(e) => {
                      const selected = menuItems.find(item => item._id === e.target.value);
                      setFormData({
                        ...formData,
                        menuItemId: e.target.value,
                        menuItemName: selected?.name || "",
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                  >
                    <option value="">Select Menu Item</option>
                    {menuItems.map(item => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yield Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.yieldQuantity}
                      onChange={(e) => setFormData({ ...formData, yieldQuantity: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yield Unit</label>
                    <select
                      value={formData.yieldUnit}
                      onChange={(e) => setFormData({ ...formData, yieldUnit: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                    >
                      <option value="serving">Serving</option>
                      <option value="plate">Plate</option>
                      <option value="bowl">Bowl</option>
                      <option value="piece">Piece</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">Ingredients</label>
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="text-[#a3e635] hover:text-[#bef264] text-sm font-medium"
                    >
                      + Add Ingredient
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.ingredients.map((ing, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <select
                            value={ing.itemId}
                            onChange={(e) => updateIngredient(idx, "itemId", e.target.value)}
                            className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                          >
                            <option value="">Select Item</option>
                            {inventoryItems.map(item => (
                              <option key={item._id} value={item._id}>{item.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            step="0.1"
                            placeholder="Quantity"
                            value={ing.quantity}
                            onChange={(e) => updateIngredient(idx, "quantity", parseFloat(e.target.value))}
                            className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                          />
                        </div>
                        <div className="col-span-2">
                          <select
                            value={ing.unit}
                            onChange={(e) => updateIngredient(idx, "unit", e.target.value)}
                            className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                          >
                            <option value="kg">kg</option>
                            <option value="g">g</option>
                            <option value="ltr">ltr</option>
                            <option value="ml">ml</option>
                            <option value="piece">piece</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <button
                            onClick={() => removeIngredient(idx)}
                            className="w-full p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {formData.ingredients.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No ingredients added yet. Click "Add Ingredient" to start.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions (Optional)</label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#a3e635]"
                    placeholder="Cooking instructions..."
                  />
                </div>

                {formData.ingredients.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-900">Cost Analysis</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-600">Total Ingredient Cost</span>
                      <span className="text-sm font-semibold text-green-600">₹{calculateTotalCost()}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-600">Cost per {formData.yieldUnit}</span>
                      <span className="text-sm font-semibold text-green-600">
                        ₹{formData.yieldQuantity > 0 ? (calculateTotalCost() / formData.yieldQuantity).toFixed(2) : 0}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 flex gap-3">
                <button
                  onClick={createRecipe}
                  disabled={!formData.menuItemId || formData.ingredients.length === 0}
                  className="flex-1 bg-[#a3e635] text-gray-900 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#bef264] transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check size={16} />
                  Create Recipe
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
            {/* Summary Preview Modal */}
      <AnimatePresence>
        {showSummaryModal && summaryData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowSummaryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Recipe Cost Summary</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{summaryData.filterLabel}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleExportToExcel} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">📊 Export Excel</button>
                  <button onClick={handlePrintReport} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">🖨️ Print</button>
                  <button onClick={() => setShowSummaryModal(false)} className="text-gray-400 hover:text-gray-600 px-2"><X size={20} /></button>
                </div>
              </div>
              <div className="p-6">
                <table className="min-w-full mb-6">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left text-xs font-bold text-gray-400 uppercase py-2">Menu Item</th>
                      <th className="text-center text-xs font-bold text-gray-400 uppercase py-2">Yield</th>
                      <th className="text-right text-xs font-bold text-gray-400 uppercase py-2">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.filteredRecipes.map(r => (
                      <tr key={r._id} className="border-b border-gray-50">
                        <td className="py-2 text-sm">{r.menuItemName}</td>
                        <td className="py-2 text-sm text-center">{r.yieldQuantity} {r.yieldUnit}(s)</td>
                        <td className="py-2 text-sm text-right font-medium">₹{(r.totalCost || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Ingredient Cost</span>
                      <span className="font-semibold">₹{summaryData.totalIngredientCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold">
                      <span>Total Recipe Cost</span>
                      <span className="text-green-600">₹{summaryData.totalRecipeCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </>
  );
}