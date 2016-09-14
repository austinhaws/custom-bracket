<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class BracketDoubleFirstRound extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
		Schema::table('brackets', function($table)
		{
			$table->date('first_round_date_day_1')->nullable();
			$table->date('first_round_date_day_2')->nullable();

			$table->dropColumn('first_round_date');
		});

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
		Schema::table('brackets', function($table) {
			$table->date('first_round_date')->nullable();

			$table->dropColumn('first_round_date_day_1');
			$table->dropColumn('first_round_date_day_2');
		});
    }
}
