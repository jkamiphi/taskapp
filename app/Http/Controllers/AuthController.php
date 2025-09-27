<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $validatedData = $request->validated();
        $validatedData['nickname'] = $this->generateNickname($validatedData['first_name'], $validatedData['last_name']);

        User::create([
            'nickname' => $validatedData['nickname'],
            'first_name' => $validatedData['first_name'],
            'last_name' => $validatedData['last_name'],
            'email' => $validatedData['email'],
            'password' => bcrypt($validatedData['password']),
        ]);

        return response()->json(['message' => 'User registered successfully'], 201);
    }

    public function login(LoginRequest $request)
    {
        $cred = $request->validated();

        $user = User::where('email', $cred['email'])->first();
        if (!$user || !Hash::check($cred['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('api')->plainTextToken;
        return response()->json(['token' => $token], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    private function generateNickname($firstName, $lastName)
    {
        $baseNickname = strtolower($firstName . '.' . $lastName);
        $nickname = $baseNickname;
        $counter = 1;
        while (\App\Models\User::where('nickname', $nickname)->exists()) {
            $nickname = $baseNickname . $counter;
            $counter++;
        }
        return $nickname;
    }
}
