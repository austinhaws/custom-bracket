<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class PoolOpenDate extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // add open date to pool
		Schema::table('pools', function($table) {
			$table->date('open_date');
		});
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // remove open date from pool
		Schema::table('pools', function($table) {
			$table->dropColumn('open_date');
		});
    }
}
