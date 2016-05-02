<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

/*
 * a pool (table: pools) starts with 16 teams (table: pool_teams {name, user_id of })
 * 		the top 8 are shown in a "cloud" in random order
 * 		the rest are shown outside of the cloud in no order
 * 		players (table: users) use a pick (table: user_pool_picks) to select the teams they want to see in the tournament
 * 		# of votes for a team determines their rank when the bracket begins
 * 		has a closing date for when the pool will no longer be voteable
 * users can vote for their favorites in the pick pools
 * players can make suggestions to add to the bracket
 * 		a suggestion takes a pick
 * for every 2 teams in the pool, players get another pick: 16 teams at start, so 8 picks; 4 more teams added so now everyone gets 10 picks
 * 
 */

class CreatePickpoolsTables extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pools', function (Blueprint $table) {
            $table->increments('id');
			$table->string('name');
			$table->date('closing_date');
            $table->timestamps();
        });

        Schema::create('pool_entries', function (Blueprint $table) {
            $table->increments('id');
			$table->string('pool_id')->references('id')->on('pools');
			$table->string('name');
            $table->timestamps();
        });

		Schema::create('user_x_pool_team_entries', function(Blueprint $table) {
            $table->increments('id');
			$table->string('user_id')->references('id')->on('users');
			$table->string('pool_entry_id')->references('id')->on('pool_entries');
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
        Schema::drop('pools');
        Schema::drop('pool_entries');
        Schema::drop('user_x_pool_team_entries');
    }
}
