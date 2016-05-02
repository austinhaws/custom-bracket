<?php
/**
 * Created by IntelliJ IDEA.
 * User: austinhaws
 * Date: 5/2/16
 * Time: 5:49 AM
 */

namespace app\Enums;

use Auth;
use App\Dao\UserDao;

abstract class Roles
{
	const ADMIN = 'Admin';

	/**
	 * check that the user is an admin and DIE if not
	 *
	 * @param $roles array of string - user must have all the passed in roles
	 */
	public static function checkIsRole($roles) {
		$userRoles = UserDao::selectUserRoles(Auth::user()->id);
		foreach ($roles as $role) {
			$found = false;
			foreach ($userRoles as $userRole) {
				if ($found = $userRole->role == $role) {
					break;
				}
			}
			if (!$found) {
				exit ('Not allowed');
			}
		}
	}

}