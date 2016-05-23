<?php

namespace App\Http\Controllers;

use App\Dao\BracketDao;
use App\Dao\PoolDao;
use App\Http\Requests;
use Auth;
use App\Enums\Roles;
use Illuminate\Http\Request;
use App\Bracket;
use App\Pool;

class BracketController extends Controller
{
	/**
	 * Create a new controller instance.
	 *
	 * @return void
	 */
	public function __construct()
	{
		$this->middleware('auth');
	}

	/**
	 * Show the application dashboard.
	 *
	 * @return \Illuminate\Http\Response
	 */
	public function ajaxList()
	{
		$brackets = BracketDao::selectBrackets(false);

		return json_encode($brackets);
	}

	public function bracketAdd()
	{
		return $this->editBracketView([
			'id' => '',
			'name' => '',
			'closing_date' => '',
			'open_date' => '',
			'top_left_pool_id' => null,
			'top_right_pool_id' => null,
			'bottom_left_pool_id' => null,
			'bottom_right_pool_id' => null,
		]);
	}

	public function bracketEdit($id)
	{
		$bracket = Bracket::where('id', $id)->first();
		return $this->editBracketView($bracket);
	}

	private function editBracketView($bracket)
	{
		Roles::checkIsRole([Roles::ADMIN]);

		// test for no id and then for null rolls
		if ($bracket['id']) {
			$rolls = BracketDao::rankRollsForBracketId($bracket['id']);
			if (!$rolls) {
				$rolls = false;
			}
		} else {
			$rolls = false;
		}
		
		if (!$rolls || !count($rolls)) {
			$rolls = [
				['rank' => 1, 'roll' => '1d20 + 5d6'],
				['rank' => 2, 'roll' => '1d20 + 5d6'],
				['rank' => 3, 'roll' => '1d20 + 4d6'],
				['rank' => 4, 'roll' => '1d20 + 4d6'],
				['rank' => 5, 'roll' => '1d20 + 3d6'],
				['rank' => 6, 'roll' => '1d20 + 3d6'],
				['rank' => 7, 'roll' => '1d20 + 2d6'],
				['rank' => 8, 'roll' => '1d20 + 2d6'],
				['rank' => 9, 'roll' => '1d20 + 2d6'],
				['rank' => 10, 'roll' => '1d20 + 2d6'],
				['rank' => 11, 'roll' => '1d20 + 2d6'],
				['rank' => 12, 'roll' => '1d20 + 2d6'],
				['rank' => 13, 'roll' => '1d20 + 1d6'],
				['rank' => 14, 'roll' => '1d20 + 1d6'],
				['rank' => 15, 'roll' => '1d20 + 0'],
				['rank' => 16, 'roll' => '1d20 + 0'],
			];
		}
		return view('bracket-edit', [
			'bracket' => json_encode($bracket),
			'pools' => json_encode(Pool::orderBy('name', 'asc')->get()),
			'rolls' => json_encode($rolls)
		]);
	}

	public function bracketSave(Request $request)
	{
		Roles::checkIsRole([Roles::ADMIN]);

		$bracket = $request->input('bracket');
		BracketDao::saveBracket($bracket);

		$rolls = $request->input('rolls');
		BracketDao::saveBracketRolls($bracket['id'], $rolls);

		return json_encode($bracket);
	}

	private function newGame($bracketId, $round, $team1Id, $team2Id, $prevGameId1, $prevGameId2, $rank1, $rank2, $poolId) {
		$game = [
			'id' => false,
			'round' => $round,
			'bracket_id' => $bracketId,
			'pool_entry_1_id' => $team1Id,
			'pool_entry_1_score' => null,
			'pool_entry_1_rank' => $rank1,
			'pool_entry_2_id' => $team2Id,
			'pool_entry_2_score' => null,
			'pool_entry_2_rank' => $rank2,
			'prev_bracket_game_1_id' => $prevGameId1,
			'prev_bracket_game_2_id' => $prevGameId2,
			'pool_id' => $poolId,
		];
		BracketDao::saveBracketGame($game);
		return $game;
	}
	
	private function createBracketGames($bracketId) {

		$bracket = BracketDao::selectBrackets(['id' => $bracketId])[0];

		$pools = [
			['id' => $bracket->top_left_pool_id, 'games' => [], 'teams' => PoolDao::selectTeamsListForPool($bracket->top_left_pool_id)],
			['id' => $bracket->bottom_left_pool_id, 'games' => [], 'teams' => PoolDao::selectTeamsListForPool($bracket->bottom_left_pool_id)],
			['id' => $bracket->top_right_pool_id, 'games' => [], 'teams' => PoolDao::selectTeamsListForPool($bracket->top_right_pool_id)],
			['id' => $bracket->bottom_right_pool_id, 'games' => [], 'teams' => PoolDao::selectTeamsListForPool($bracket->bottom_right_pool_id)],
		];


		foreach ($pools as $key => $stupid) {
			$pool =& $pools[$key];
			// get teams sorted by #votes/name
			if (count($pool['teams']) < 16) {
				dd(['Not enough teams for the pool to start the bracket. add more teams and try again', $pool, $pool['teams']]);
			}
			usort($pool['teams'], function ($a, $b) {
				return $a->votes < $b->votes ? -1 : ($a->votes > $b->votes ? 1 : strcmp($a->name, $b->name));
			});
			
			$rank = 1;
			foreach ($pool['teams'] as $key => $dontuse) {
				$pool['teams'][$key]->rank = $rank++;
				$temp = ['id' => $pool['teams'][$key]->id, 'rank' => $pool['teams'][$key]->rank];
				PoolDao::savePoolEntry($temp);
			}

			// create games from the ranks
			$pool['games'][1] = [
				$this->newGame($bracketId, 1, $pool['teams'][0]->id, $pool['teams'][15]->id, null, null, 1, 16, $pool['id']),
				$this->newGame($bracketId, 1, $pool['teams'][7]->id, $pool['teams'][8]->id, null, null, 8, 9, $pool['id']),
				$this->newGame($bracketId, 1, $pool['teams'][4]->id, $pool['teams'][11]->id, null, null, 5, 12, $pool['id']),
				$this->newGame($bracketId, 1, $pool['teams'][3]->id, $pool['teams'][12]->id, null, null, 4, 13, $pool['id']),
				$this->newGame($bracketId, 1, $pool['teams'][5]->id, $pool['teams'][10]->id, null, null, 6, 11, $pool['id']),
				$this->newGame($bracketId, 1, $pool['teams'][2]->id, $pool['teams'][13]->id, null, null, 3, 14, $pool['id']),
				$this->newGame($bracketId, 1, $pool['teams'][6]->id, $pool['teams'][9]->id, null, null, 7, 10, $pool['id']),
				$this->newGame($bracketId, 1, $pool['teams'][1]->id, $pool['teams'][14]->id, null, null, 2, 15, $pool['id']),
			];
			$pool['games'][2] = [
				$this->newGame($bracketId, 2, null, null, $pool['games'][1][0]['id'], $pool['games'][1][1]['id'], null, null, $pool['id']),
				$this->newGame($bracketId, 2, null, null, $pool['games'][1][2]['id'], $pool['games'][1][3]['id'], null, null, $pool['id']),
				$this->newGame($bracketId, 2, null, null, $pool['games'][1][4]['id'], $pool['games'][1][5]['id'], null, null, $pool['id']),
				$this->newGame($bracketId, 2, null, null, $pool['games'][1][6]['id'], $pool['games'][1][7]['id'], null, null, $pool['id']),
			];
			$pool['games'][3] = [
				$this->newGame($bracketId, 3, null, null, $pool['games'][2][0]['id'], $pool['games'][2][1]['id'], null, null, $pool['id']),
				$this->newGame($bracketId, 3, null, null, $pool['games'][2][2]['id'], $pool['games'][2][3]['id'], null, null, $pool['id']),
			];
			$pool['games'][4] = [
				$this->newGame($bracketId, 4, null, null, $pool['games'][3][0]['id'], $pool['games'][3][1]['id'], null, null, $pool['id']),
			];
		}

		// pools have their games created, create final 4, championship games
		$finalFour = [
			$this->newGame($bracketId, 5, null, null, $pools[0]['games'][4][0]['id'], $pools[1]['games'][4][0]['id'], null, null, $pool['id']),
			$this->newGame($bracketId, 5, null, null, $pools[2]['games'][4][0]['id'], $pools[3]['games'][4][0]['id'], null, null, $pool['id']),
		];

		$championship = [
			$this->newGame($bracketId, 6, null, null, $finalFour[0]['id'], $finalFour[1]['id'], null, null, $pool['id']),
		];
	}

	public function bracketScore($bracketId, $round) {
		Roles::checkIsRole([Roles::ADMIN]);

		$bracket = BracketDao::selectBrackets(['id' => $bracketId])[0];

		// load games for the round for the bracket
		$games = BracketDao::selectBracketGames($bracketId, $round);

		$pools = [
			['id' => $bracket->top_left_pool_id, 'games' => [], 'teams' => PoolDao::selectTeamsListForPool($bracket->top_left_pool_id)],
			['id' => $bracket->bottom_left_pool_id, 'games' => [], 'teams' => PoolDao::selectTeamsListForPool($bracket->bottom_left_pool_id)],
			['id' => $bracket->top_right_pool_id, 'games' => [], 'teams' => PoolDao::selectTeamsListForPool($bracket->top_right_pool_id)],
			['id' => $bracket->bottom_right_pool_id, 'games' => [], 'teams' => PoolDao::selectTeamsListForPool($bracket->bottom_right_pool_id)],
		];
		
		// if there are no current games, create them from the previous games
		if (!$games) {
			$this->createBracketGames($bracketId);
			$games = BracketDao::selectBracketGames($bracketId, $round);
		}

		// games are now loaded so send them on to the view
		$rolls = BracketDao::rankRollsForBracketId($bracketId);
		return view('bracket-round', [
			'bracket' => json_encode($bracket),
			'round' => $round,
			'games' => json_encode($games),
			'pools' => json_encode($pools),
			'rolls' => json_encode($rolls),
		]);
	}

	public function bracketScoreSave(Request $request) {
		Roles::checkIsRole([Roles::ADMIN]);

		$games = $request->input('games');

		foreach ($games as $game) {
			BracketDao::saveBracketGame($game);

			if ($game['pool_entry_1_score'] && $game['pool_entry_2_score']) {
				if (intval($game['pool_entry_1_score']) > intval($game['pool_entry_2_score'])) {
					$winnerId = $game['pool_entry_1_id'];
					$rank = $game['pool_entry_1_rank'];
				} else {
					$winnerId = $game['pool_entry_2_id'];
					$rank = $game['pool_entry_2_rank'];

				}

				BracketDao::updateBracketGame(['pool_entry_1_id' => $winnerId, 'pool_entry_1_score' => null, 'pool_entry_1_rank' => $rank], ['prev_bracket_game_1_id' => $game['id']]);
				BracketDao::updateBracketGame(['pool_entry_2_id' => $winnerId, 'pool_entry_2_score' => null, 'pool_entry_2_rank' => $rank], ['prev_bracket_game_2_id' => $game['id']]);
			}
		}
		echo json_encode(['success' => 'success']);
	}

	/**
	 * show a bracket and let the user make picks on it
	 *
	 * @param $bracketId int the id of the bracket for which to make picks
	 * @return object view
	 */
	public function bracketPicks($bracketId) {
		// load bracket
		$bracket = BracketDao::selectBrackets(['id' => $bracketId])[0];

		// load games for the round for the bracket
		$games = BracketDao::selectBracketGames($bracketId, false);

		// if there are no current games, create them from the previous games
		if (!$games) {
			$this->createBracketGames($bracketId);
			$games = BracketDao::selectBracketGames($bracketId, false);
		}

		// get pools' teams
		$teams = [
			'top_left' => $this->sortTeamsByBracketRank(PoolDao::selectTeamsListForPool($bracket->top_left_pool_id)),
			'bottom_left' => $this->sortTeamsByBracketRank(PoolDao::selectTeamsListForPool($bracket->bottom_left_pool_id)),
			'top_right' => $this->sortTeamsByBracketRank(PoolDao::selectTeamsListForPool($bracket->top_right_pool_id)),
			'bottom_right' => $this->sortTeamsByBracketRank(PoolDao::selectTeamsListForPool($bracket->bottom_right_pool_id)),
		];

		// load pools
		$pools = [
			'top_left' => PoolDao::selectPools(['id' => $bracket->top_left_pool_id])[0],
			'bottom_left' => PoolDao::selectPools(['id' => $bracket->bottom_left_pool_id])[0],
			'top_right' => PoolDao::selectPools(['id' => $bracket->top_right_pool_id])[0],
			'bottom_right' => PoolDao::selectPools(['id' => $bracket->bottom_right_pool_id])[0],
		];

		// what has the user picked so far?
		$picks = BracketDao::selectUserBracketGames(['user_id' => Auth::user()->id]);
		
		$lockedRounds = BracketDao::selectLockedRounds($bracket->id)[0];
		return view('bracket-pick', [
			'bracket' => json_encode($bracket),
			'games' => json_encode($games),
			'pools' => json_encode($pools),
			'teams' => json_encode($teams),
			'picks' => json_encode($picks),
			'lockedRounds' => json_encode($lockedRounds),
		]);
	}

	private function sortTeamsByBracketRank($teams) {
		global $rankSort;
		$rankSort = [
			1 => 1,
			16 => 2,
			8 => 3,
			9 => 4,
			5 => 5,
			12 => 6,
			4 => 7,
			13 => 8,
			6 => 9,
			11 => 10,
			3 => 11,
			14 => 12,
			7 => 13,
			10 => 14,
			2 => 15,
			15 => 16,
		];
		usort($teams, function($a, $b) {
			global $rankSort;
			$rank1 = $rankSort[$a->rank];
			$rank2 = $rankSort[$b->rank];
			return $rank1 > $rank2 ? 1 : ($rank1 < $rank2 ? -1 : 0);
		});
		return $teams;
	}
	
	public function bracketPick(Request $request) {
		$bracketGameId = $request->input('bracketGameId');

		// save the pick
		$data = [
			'user_id' => Auth::user()->id,
			'bracket_game_id' => $bracketGameId,
			'pool_entry_winner_id' => $request->input('poolEntryWinnerId'),
		];
	
		// first round picks get the 1st round's initial teams
		$bracketGame = BracketDao::selectBracketGame(['id' => $bracketGameId])[0];
		if ($bracketGame->round == 1) {
			$data['pool_entry_1_id'] = $bracketGame->pool_entry_1_id;
			$data['pool_entry_2_id'] = $bracketGame->pool_entry_2_id;
		}
		
		BracketDao::saveUserBracketGame($data);

		// get future game and set it's pool_entry_X_id for the winner
		// prev bracket game 1 id
		$prevBracketGame = BracketDao::selectBracketGame(['prev_bracket_game_1_id' => $bracketGameId]);
		if ($prevBracketGame && count($prevBracketGame)) {
			BracketDao::saveUserBracketGame([
				'user_id' => Auth::user()->id,
				'bracket_game_id' => $prevBracketGame[0]->id,
				'pool_entry_1_id' => $request->input('poolEntryWinnerId'),
			]);
		}
		
		// prev bracket game 2 id
		$prevBracketGame = BracketDao::selectBracketGame(['prev_bracket_game_2_id' => $bracketGameId]);
		if ($prevBracketGame && count($prevBracketGame)) {
			BracketDao::saveUserBracketGame([
				'user_id' => Auth::user()->id,
				'bracket_game_id' => $prevBracketGame[0]->id,
				'pool_entry_2_id' => $request->input('poolEntryWinnerId'),
			]);
		}

		// return all the picks for the user since one pick can effect the others
		echo json_encode(BracketDao::selectUserBracketGames(['user_id' => Auth::user()->id]));
	}	
}
