<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class GamePoolId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
		// add pool id to game
		Schema::table('bracket_games', function($table)
		{
			$table->integer('pool_id')->references('id')->on('pools');
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
			$table->dropColumn('pool_id');
		});
    }
}
