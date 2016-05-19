<?php

namespace App\Dao;

use DB;

class PoolDao
{
	public static function selectTeamsListForPool($poolId)
	{
		return DB::Select('
			select
				pool_entries.pool_id pool_id,
				pool_entries.id id,
				pool_entries.name name,
				pool_entries.rank rank,
				(select count(*) from user_x_pool_team_entries uxpte where uxpte.pool_entry_id = pool_entries.id) votes
			from pool_entries
			left join user_x_pool_team_entries on user_x_pool_team_entries.pool_entry_id = pool_entries.id
			where pool_id = ?
			order by votes desc, lower(name) asc
			limit 16
		', [$poolId]);
	}

	public static function selectTeamsListForUserAndPool($userId, $poolId)
	{
		return DB::Select('
			select
				pool_entries.pool_id pool_id,
				pool_entries.id id,
				pool_entries.name name,
				case when user_x_pool_team_entries.user_id is null then 0 else 1 end picked,
				(select count(*) from user_x_pool_team_entries uxpte where uxpte.pool_entry_id = pool_entries.id) votes,
				rand() sortOrder
			from pool_entries
			left join user_x_pool_team_entries 
				on user_x_pool_team_entries.pool_entry_id = pool_entries.id 
				and user_x_pool_team_entries.user_id = ?
			where pool_id = ?
		', [$userId, $poolId]);
	}

	public static function selectTeamById($teamId) {
		return DB::Select('SELECT * FROM pool_entries WHERE id = ?', [$teamId])[0];
	}

	public static function insertUserPoolTeamEntry($userId, $teamId) {
		return DB::Insert('INSERT INTO user_x_pool_team_entries (user_id, pool_entry_id) VALUES (?, ?)', [$userId, $teamId]);
	}

	public static function insertPoolTeamEntry($poolId, $teamName) {
		return DB::table('pool_entries')->insertGetId(['pool_id' => $poolId, 'name' => $teamName]);
	}

	public static function savePool(&$pool) {
		if ($pool['id']) {
			DB::table('pools')->where('id', $pool['id'])->update($pool);
		} else {
			$pool['id'] = DB::table('pools')->insertGetId($pool);
		}
	}

	public static function insertPoolTeam($team) {
		DB::table('pool_entries')->insert($team);
	}
	
	public static function selectPools($where) {
		return DB::table('pools')->where($where)->get();
	}

	public static function savePoolEntry(&$poolEntry) {
		if ($poolEntry['id']) {
			DB::table('pool_entries')->where('id', $poolEntry['id'])->update($poolEntry);
		} else {
			$poolEntry['id'] = DB::table('pool_entries')->insertGetId($poolEntry);
		}
	}
}
