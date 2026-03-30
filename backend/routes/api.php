<?php

use Illuminate\Support\Facades\Route;

// Public routes - no auth needed
Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);

// Public endpoints
Route::get('/products', [\App\Http\Controllers\Api\ProductController::class, 'index']);
Route::get('/settings', [\App\Http\Controllers\Api\SettingController::class, 'index']);

// Protected routes - authenticated users
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('/user', [\App\Http\Controllers\Api\AuthController::class, 'me']);
    Route::post('/user/profile', [\App\Http\Controllers\Api\ProfileController::class, 'update']);

    // Customer routes
    Route::post('/orders', [\App\Http\Controllers\Api\OrderController::class, 'store']);
    Route::get('/orders', [\App\Http\Controllers\Api\OrderController::class, 'index']);
    Route::patch('/orders/{order}/cancel', [\App\Http\Controllers\Api\OrderController::class, 'cancel']);

    // Admin routes
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/orders', [\App\Http\Controllers\Api\OrderController::class, 'adminIndex']);
        Route::patch('/orders/{order}', [\App\Http\Controllers\Api\OrderController::class, 'updateStatus']);

        Route::post('/products', [\App\Http\Controllers\Api\ProductController::class, 'store']);
        Route::put('/products/{product}', [\App\Http\Controllers\Api\ProductController::class, 'update']);
        Route::delete('/products/{product}', [\App\Http\Controllers\Api\ProductController::class, 'destroy']);
        
        Route::put('/settings', [\App\Http\Controllers\Api\SettingController::class, 'update']);
        
        // Category Management
        Route::put('/categories/rename', [\App\Http\Controllers\Api\AdminCategoryController::class, 'rename']);
        Route::delete('/categories/remove', [\App\Http\Controllers\Api\AdminCategoryController::class, 'destroy']);
    });
});
