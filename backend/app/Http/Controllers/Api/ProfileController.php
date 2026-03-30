<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->user_id, 'user_id')],
            'password' => 'nullable|min:6',
            'avatar' => 'nullable|image|max:10240', // 10MB max
        ]);

        $user->email = $validated['email'];

        // Update password if provided
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        // Handle Avatar Upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if it exists
            if ($user->avatar_url) {
                $oldPath = str_replace(url('storage/'), '', $user->avatar_url);
                Storage::disk('public')->delete($oldPath);
            }

            // Store new avatar
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar_url = url('storage/' . $path);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }
}
