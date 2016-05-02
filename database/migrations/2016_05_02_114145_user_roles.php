<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UserRoles extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // create user roles table
		Schema::create('user_roles', function($table) {
			$table->increments('id');
			$table->integer('user_id');
			$table->string('role');
		});
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // drop user roles tables
		Schema::drop('user_roles');
    }
}
