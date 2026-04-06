<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Events\NewReportSubmitted;
use App\Events\ReportStatusUpdated;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role === 'admin') {
            return response()->json(Report::with('user')->latest()->get());
        }
        
        return response()->json($request->user()->reports()->with('user')->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $report = $request->user()->reports()->create($validated);
        $report->load('user');

        broadcast(new NewReportSubmitted($report));

        return response()->json($report, 201);
    }

    public function show(Report $report, Request $request)
    {
        if ($request->user()->id !== $report->user_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($report->load('user'));
    }

    public function update(Request $request, Report $report)
    {
        $user = $request->user();

        // Admin can update status
        if ($user->role === 'admin') {
            $validated = $request->validate([
                'status' => 'required|in:pending,diproses,selesai',
            ]);

            $report->update($validated);
            $report->load('user');

            broadcast(new ReportStatusUpdated($report));

            return response()->json($report);
        }

        // Patient can only edit their own report's description & location
        if ($user->id !== $report->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'description' => 'required|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $report->update($validated);
        $report->load('user');

        return response()->json($report);
    }

    public function destroy(Report $report, Request $request)
    {
        $user = $request->user();

        // Admin can delete any report
        if ($user->role === 'admin') {
            $report->delete();
            return response()->json(null, 204);
        }

        // Patient can only delete their own report
        if ($user->id !== $report->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $report->delete();
        return response()->json(null, 204);
    }
}
