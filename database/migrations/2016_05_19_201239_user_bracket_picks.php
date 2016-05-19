<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UserBracketPicks extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
		// create bracket game table
		Schema::create('user_x_bracket_games', function (Blueprint $table) {
			$table->increments('id');
			$table->integer('user_id')->references('id')->on('users');
			$table->integer('bracket_game_id')->references('id')->on('bracket_games');
			$table->integer('pool_entry_1_id')->nullable();
			$table->double('pool_entry_2_id')->nullable();
			$table->double('pool_entry_winner_id')->nullable();
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		// destory bracket game
		Schema::drop('user_x_bracket_games');
    }
}
