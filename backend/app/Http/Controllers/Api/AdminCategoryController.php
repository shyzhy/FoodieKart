<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Setting;
use Illuminate\Http\Request;

class AdminCategoryController extends Controller
{
    // Rename a category across all products and update settings master list
    public function rename(Request $request)
    {
        $validated = $request->validate([
            'old_name' => 'required|string',
            'new_name' => 'required|string',
        ]);

        $oldName = $validated['old_name'];
        $newName = $validated['new_name'];

        // 1. Bulk update existing products
        Product::where('category', $oldName)->update(['category' => $newName]);

        // 2. Update the master settings list securely
        $setting = Setting::firstOrCreate(['key' => 'categories'], ['value' => 'Main Course,Appetizer,Dessert,Beverages,Specialty,Side Dish']);
        $categoriesArray = explode(',', $setting->value);
        
        $index = array_search($oldName, $categoriesArray);
        if ($index !== false) {
            $categoriesArray[$index] = $newName;
            $setting->value = implode(',', array_unique($categoriesArray));
            $setting->save();
        }

        return response()->json(['message' => 'Category globally renamed', 'categories' => $setting->value]);
    }

    // Delete a category completely
    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
        ]);

        $name = $validated['name'];

        // 1. Re-assign orphaned products to 'Uncategorized'
        Product::where('category', $name)->update(['category' => 'Uncategorized']);

        // 2. Remove from master settings list
        $setting = Setting::firstOrCreate(['key' => 'categories'], ['value' => 'Main Course,Appetizer,Dessert,Beverages,Specialty,Side Dish']);
        $categoriesArray = explode(',', $setting->value);
        
        $categoriesArray = array_filter($categoriesArray, function($cat) use ($name) {
            return trim($cat) !== trim($name);
        });

        $setting->value = implode(',', array_unique($categoriesArray));
        $setting->save();

        return response()->json(['message' => 'Category deleted', 'categories' => $setting->value]);
    }
}
