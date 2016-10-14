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

	private static function cleanDate($date) {
		return (!$date || $date == '0000-00-00') ? null : $date;
	}

	public static function saveBracket(&$bracket) {
		$dates = [
			'open_date',
			'second_round_date',
			'third_round_date',
			'fourth_round_date',
			'fifth_round_date',
			'sixth_round_date',
			'first_round_date_day_1',
			'first_round_date_day_2',
		];
		foreach ($dates as $date) {
			$bracket[$date] = BracketDao::cleanDate($bracket[$date]);
		}
		if ($bracket['id']) {
			DB::table('brackets')->where('id', $bracket['id'])->update($bracket);
		} else {
			$bracket['id'] = DB::table('brackets')->insertGetId($bracket);
		}
	}
	
	public static function selectBracketGames($bracketId, $round) {
		$where = ['bracket_id' => $bracketId];
		if ($round) {
			$where['round'] = $round;
		}
		return DB::table('bracket_games')->where($where)->get();
	}

	public static function saveBracketGame(&$bracketGame) {
		if ($bracketGame['id']) {
			DB::table('bracket_games')->where('id', $bracketGame['id'])->update($bracketGame);
		} else {
			$bracketGame['id'] = DB::table('bracket_games')->insertGetId($bracketGame);
		}
	}

	public static function updateBracketGame($data, $where)
	{
		DB::table('bracket_games')->where($where)->update($data);
	}

	public static function rankRollsForBracketId($bracketId) {
		return DB::table('bracket_rolls')->where(['bracket_id' => $bracketId])->get();
	}

	public static function saveBracketRolls($bracketId, &$rolls) {
		DB::table('bracket_rolls')->where(['bracket_id' => $bracketId])->delete();

		foreach ($rolls as $key => $DONTCARE) {
			$roll =& $rolls[$key];
			$roll['bracket_id'] = $bracketId;
			$roll['id'] = DB::table('bracket_rolls')->insertGetId($roll);
		}
	}

	public static function saveUserBracketGame($data) {
		$bracketGame = DB::table('user_x_bracket_games')->where(['user_id' => $data['user_id'], 'bracket_game_id' => $data['bracket_game_id']])->get();
		if ($bracketGame && count($bracketGame)) {
			DB::table('user_x_bracket_games')->where(['id' => $bracketGame[0]->id])->update($data);
		} else {
			DB::table('user_x_bracket_games')->insert($data);
		}
	}

	public static function selectBracketGame($where) {
		return DB::table('bracket_games')->where($where)->get();
	}

	public static function selectUserBracketGames($where) {
		return DB::table('user_x_bracket_games')->where($where)->get();
	}

	public static function selectUserBracketGamesByBracketId($bracketId) {
		return DB::Select('
			select *
			from user_x_bracket_games 
			where bracket_game_id IN (
				SELECT id FROM bracket_games WHERE bracket_id = ?
			)
		', [$bracketId]);
	}

	public static function selectLockedRounds($bracketId) {
		return DB::Select('
			select 
				case when open_date < now() then 1 else 0 end openDatePassed,
				case when first_round_date_day_1 < now() then 1 else 0 end firstRoundDate1Passed,
				case when second_round_date_day_2 < now() then 1 else 0 end secondRoundDate2Passed,
				case when third_round_date < now() then 1 else 0 end thirdRoundDatePassed,
				case when fourth_round_date < now() then 1 else 0 end fourthRoundDatePassed,
				case when fifth_round_date < now() then 1 else 0 end fifthRoundDatePassed,
				case when sixth_round_date < now() then 1 else 0 end sixthRoundDatePassed
			from brackets
			WHERE id = ?
		', [$bracketId]);
	}

	public static function deleteUserBracketGames($where) {
		return DB::table('user_x_bracket_games')->where($where)->delete();
	}

	public static function insertUserBracketGame($userId, $gameId, $team1Id, $team2Id, $winningTeamId) {
		$game = [
			'user_id' => $userId,
			'bracket_game_id' => $gameId,
			'pool_entry_winner_id' => $winningTeamId,
			'pool_entry_1_id' => $team1Id,
			'pool_entry_2_id' => $team2Id,
		];
		$game['id'] = DB::table('user_x_bracket_games')->insertGetId($game);
		return $game;

	}
}
