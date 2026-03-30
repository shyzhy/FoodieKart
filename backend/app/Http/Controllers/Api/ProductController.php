<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'price' => 'required|numeric|min:0',
            'is_available' => 'boolean',
            'image' => 'nullable|image|max:10240', // 10MB
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = url('storage/' . $path);
        }

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'price' => 'sometimes|numeric|min:0',
            'is_available' => 'boolean',
            'image' => 'nullable|image|max:10240',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $validated['image_url'] = url('storage/' . $path);
            
            // Delete old image if exists
            if ($product->image_url && str_contains($product->image_url, url('storage/'))) {
                $oldPath = str_replace(url('storage/') . '/', '', $product->image_url);
                Storage::disk('public')->delete($oldPath);
            }
        }

        $product->update($validated);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        if ($product->image_url && str_contains($product->image_url, url('storage/'))) {
            $oldPath = str_replace(url('storage/') . '/', '', $product->image_url);
            Storage::disk('public')->delete($oldPath);
        }
        
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
}
