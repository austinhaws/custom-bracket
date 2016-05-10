<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class BracketGame extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // create bracket game table
		Schema::create('bracket_games', function (Blueprint $table) {
			$table->increments('id');
			$table->integer('bracket_id')->references('id')->on('brackets');
			$table->integer('round');
			$table->integer('pool_entry_1_id')->nullable();
			$table->integer('pool_entry_1_score')->nullable();
			$table->double('pool_entry_2_id')->nullable();
			$table->double('pool_entry_2_score')->nullable();
			$table->integer('prev_bracket_game_1_id')->references('id')->on('bracket_games')->nullable();
			$table->integer('prev_bracket_game_2_id')->references('id')->on('bracket_games')->nullable();
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
		Schema::drop('bracket_games');
    }
}
