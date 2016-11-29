<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class BracketGameNoPoolId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
		Schema::table('bracket_games', function ($table) {
			$table->integer('pool_id')->references('id')->on('pools')->nullable()->change();
		});
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
		Schema::table('bracket_games', function ($table) {
			$table->integer('pool_id')->references('id')->on('pools')->change();
		});
    }
}
