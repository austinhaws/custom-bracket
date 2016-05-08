<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Brackets extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // brackets table
		Schema::create('brackets', function (Blueprint $table) {
			$table->increments('id');
			$table->string('name');
			$table->string('top_left_pool_id');
			$table->string('top_right_pool_id');
			$table->string('bottom_left_pool_id');
			$table->string('bottom_right_pool_id');
			$table->date('open_date')->nullable();
			$table->date('first_round_date')->nullable();
			$table->date('second_round_date')->nullable();
			$table->date('third_round_date')->nullable();
			$table->date('fourth_round_date')->nullable();
			$table->date('fifth_round_date')->nullable();
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
        // drop brackets
		Schema::drop('brackets');
    }
}
