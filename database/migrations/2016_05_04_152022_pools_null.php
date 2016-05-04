<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class PoolsNull extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // dates nullable
		Schema::table('pools', function($table)
		{
			$table->date('open_date')->nullable()->change();
			$table->date('closing_date')->nullable()->change();
		});
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // nullable
		Schema::table('pools', function($table) {
			$table->date('open_date')->nonnullable()->change();
			$table->date('closing_date')->nonnullable()->change();
		});
    }
}
