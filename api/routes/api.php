<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Profile
    Route::post('/profile', [App\Http\Controllers\UserController::class, 'updateProfile']);
    
    // Admin CRUD routes & Reports
    Route::apiResource('users', \App\Http\Controllers\UserController::class);
    Route::apiResource('reports', ReportController::class);
});
