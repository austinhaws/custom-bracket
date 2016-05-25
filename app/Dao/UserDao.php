<?php

namespace App\Dao;

use DB;

class UserDao
{
	public static function selectUserRoles($userId)
	{
		return DB::table('user_roles')->where('user_id', $userId)->get();
	}
	
	public static function selectUsers() {
		return DB::table("users")->get();
	}
}
