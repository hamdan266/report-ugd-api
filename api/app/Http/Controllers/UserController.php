<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json(User::all());
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'username' => 'nullable|string|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'role' => ['required', Rule::in(['admin', 'pasien'])],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'username' => $validated['username'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return response()->json($user, 201);
    }

    public function show(Request $request, User $user)
    {
        if ($request->user()->role !== 'admin' && $request->user()->id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        if ($request->user()->role !== 'admin' && $request->user()->id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'username' => ['nullable', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'password' => 'nullable|string|min:8',
            'role' => ['sometimes', 'required', Rule::in(['admin', 'pasien'])],
        ]);

        // Prevent non-admins from changing their role
        if ($request->user()->role !== 'admin' && isset($validated['role'])) {
            unset($validated['role']);
        }

        $dataToUpdate = $validated;
        
        if (isset($validated['password'])) {
            $dataToUpdate['password'] = Hash::make($validated['password']);
        } else {
            unset($dataToUpdate['password']);
        }

        $user->update($dataToUpdate);

        return response()->json($user);
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        if ($user->avatar) {
            Storage::disk('public')->delete(str_replace('storage/', '', $user->avatar));
        }

        $user->delete();
        return response()->json(null, 204);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'username' => ['nullable', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'password' => 'nullable|string|min:8',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $dataToUpdate = $validated;

        if (isset($validated['password'])) {
            $dataToUpdate['password'] = Hash::make($validated['password']);
        } else {
            unset($dataToUpdate['password']);
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                // Remove old avatar
                Storage::disk('public')->delete(str_replace('storage/', '', $user->avatar));
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $dataToUpdate['avatar'] = 'storage/' . $path;
        }

        $user->update($dataToUpdate);

        return response()->json($user);
    }
}
