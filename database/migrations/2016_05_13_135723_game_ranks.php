<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class GameRanks extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // add rank to game for each team
		Schema::table('bracket_games', function($table)
		{
			$table->string('pool_entry_1_rank')->nullable();
			$table->string('pool_entry_2_rank')->nullable();
		});
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // remove rank columns from game
		Schema::table('bracket_games', function($table) {
			$table->dropColumn('pool_entry_1_rank');
			$table->dropColumn('pool_entry_2_rank');
		});
    }
}
