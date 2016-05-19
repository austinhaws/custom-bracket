<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class PoolEntryRank extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
		// add pool id to game
		Schema::table('pool_entries', function($table)
		{
			$table->integer('rank')->nullable();
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
		Schema::table('pool_entries', function($table) {
			$table->dropColumn('rank');
		});
    }
}
