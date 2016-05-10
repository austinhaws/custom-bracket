<?php

namespace App\Dao;

use DB;

class BracketDao
{
	public static function selectBrackets($where)
	{
		if ($where) {
			$brackets = DB::table('brackets')->where($where);
		} else {
			$brackets = DB::table('brackets');
		}
		return $brackets->get();
	}

	public static function saveBracket(&$bracket) {
		if ($bracket['id']) {
			DB::table('brackets')->where('id', $bracket['id'])->update($bracket);
		} else {
			$bracket['id'] = DB::table('brackets')->insertGetId($bracket);
		}
	}
	
	public static function selectBracketGames($bracketId, $round) {
		return DB::table('bracket_games')->where(['round' => $round, 'bracket_id' => $bracketId])->get();
	}

	public static function saveBracketGame(&$bracketGame) {
		if ($bracketGame['id']) {
			DB::table('bracket_games')->where('id', $bracketGame['id'])->update($bracketGame);
		} else {
			$bracketGame['id'] = DB::table('bracket_games')->insertGetId($bracketGame);
		}
	}
}
