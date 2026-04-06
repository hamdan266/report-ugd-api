<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable();
            $table->string('username')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
        });

        // Update role enum options for MySQL
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'pasien', 'user') DEFAULT 'pasien'");
        \Illuminate\Support\Facades\DB::table('users')->where('role', 'user')->update(['role' => 'pasien']);
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'pasien') DEFAULT 'pasien'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rollback enum
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'pasien', 'user') DEFAULT 'user'");
        \Illuminate\Support\Facades\DB::table('users')->where('role', 'pasien')->update(['role' => 'user']);
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'user') DEFAULT 'user'");

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['avatar', 'username', 'phone', 'address']);
        });
    }
};
