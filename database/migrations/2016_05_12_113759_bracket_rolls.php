<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class BracketRolls extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // new table for tracking rolls for a rank in a bracket
		Schema::create('bracket_rolls', function (Blueprint $table) {
			$table->increments('id');
			$table->integer('bracket_id')->references('id')->on('brackets');
			$table->integer('rank');
			$table->string('roll');
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
        // exist no more!
		Schema::drop('bracket_rolls');

	}
}
