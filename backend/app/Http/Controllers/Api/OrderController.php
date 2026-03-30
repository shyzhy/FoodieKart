<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    // Customer: Get their own orders
    public function index(Request $request)
    {
        $orders = $request->user()->orders()->with('items.product')->latest()->get();
        return response()->json($orders);
    }

    // Admin: Get all orders across the system
    public function adminIndex()
    {
        $orders = Order::with(['user', 'items.product'])->oldest()->get();
        return response()->json($orders);
    }

    // Customer: Create a new order
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,product_id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $totalAmount = 0;
            $orderItemsData = [];

            // Calculate total and prepare items using DB state
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                if (!$product->is_available) {
                    throw new \Exception("Product '{$product->name}' is currently unavailable.");
                }

                $subtotal = $product->price * $item['quantity'];
                $totalAmount += $subtotal;

                $orderItemsData[] = [
                    'product_id' => $product->product_id,
                    'quantity' => $item['quantity'],
                    'subtotal' => $subtotal,
                ];
            }

            // Create Order
            $order = Order::create([
                'user_id' => $request->user()->user_id,
                'total_amount' => $totalAmount,
                'status' => 'Pending',
            ]);

            // Create Order Items
            $order->items()->createMany($orderItemsData);

            DB::commit();

            return response()->json($order->load('items.product'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => $e->getMessage()], 400);
        }
    }

    // Admin: Update order status
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending,Preparing,Ready,Completed,Cancelled',
        ]);

        $order->update(['status' => $validated['status']]);

        return response()->json($order);
    }

    // Customer: Cancel an order if it is still Pending
    public function cancel(Request $request, Order $order)
    {
        // Ensure user owns the order
        if ($request->user()->user_id !== $order->user_id) {
            abort(403, 'Unauthorized action.');
        }

        // Only Pending orders can be cancelled by the user
        if ($order->status !== 'Pending') {
            return response()->json(['message' => 'Only pending orders can be cancelled.'], 400);
        }

        $order->update(['status' => 'Cancelled']);

        return response()->json($order);
    }
}
