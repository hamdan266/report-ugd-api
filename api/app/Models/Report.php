<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    /** @use HasFactory<\Database\Factories\ReportFactory> */
    use HasFactory;

    protected $fillable = ['user_id', 'description', 'latitude', 'longitude', 'status'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
