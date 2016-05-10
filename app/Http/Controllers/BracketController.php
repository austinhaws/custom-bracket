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
		return view('bracket-edit', [
			'bracket' => json_encode($bracket),
			'pools' => json_encode(Pool::orderBy('name', 'asc')->get()),
		]);
	}

	public function bracketSave(Request $request)
	{
		Roles::checkIsRole([Roles::ADMIN]);

		$bracket = [
			'id' => $request->input('id'),
			'name' => $request->input('name'),
			'open_date' => $request->input('open_date'),
			'first_round_date' => $request->input('first_round_date'),
			'second_round_date' => $request->input('second_round_date'),
			'third_round_date' => $request->input('third_round_date'),
			'fourth_round_date' => $request->input('fourth_round_date'),
			'fifth_round_date' => $request->input('fifth_round_date'),
			'sixth_round_date' => $request->input('sixth_round_date'),
			'top_left_pool_id' => $request->input('top_left_pool_id'),
			'top_right_pool_id' => $request->input('top_right_pool_id'),
			'bottom_left_pool_id' => $request->input('bottom_left_pool_id'),
			'bottom_right_pool_id' => $request->input('bottom_right_pool_id'),
		];
		BracketDao::saveBracket($bracket);

		return json_encode($bracket);
	}

	private function newGame($bracketId, $round, $team1Id, $team2Id, $prevGameId1, $prevGameId2) {
		$game = [
			'id' => false,
			'round' => $round,
			'bracket_id' => $bracketId,
			'pool_entry_1_id' => $team1Id,
			'pool_entry_1_score' => null,
			'pool_entry_2_id' => $team2Id,
			'pool_entry_2_score' => null,
			'prev_bracket_game_1_id' => $prevGameId1,
			'prev_bracket_game_2_id' => $prevGameId2,
		];
		BracketDao::saveBracketGame($game);
		return $game;
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
			foreach ($pools as $key => $stupid) {
				$pool =& $pools[$key];
				// get teams sorted by #votes/name
				if (count($pool['teams']) < 16) {
					dd(['Not enough teams for the pool to start the bracket. add more teams and try again', $pool, $pool['teams']]);
				}
				usort($pool['teams'], function ($a, $b) {
					return $a->votes < $b->votes ? -1 : ($a->votes > $b->votes ? 1 : strcmp($a->name, $b->name));
				});

				// create games from the ranks
				$pool['games'][1] = [
					$this->newGame($bracketId, 1, $pool['teams'][0]->id, $pool['teams'][15]->id, null, null),
					$this->newGame($bracketId, 1, $pool['teams'][1]->id, $pool['teams'][14]->id, null, null),
					$this->newGame($bracketId, 1, $pool['teams'][2]->id, $pool['teams'][13]->id, null, null),
					$this->newGame($bracketId, 1, $pool['teams'][3]->id, $pool['teams'][12]->id, null, null),
					$this->newGame($bracketId, 1, $pool['teams'][4]->id, $pool['teams'][11]->id, null, null),
					$this->newGame($bracketId, 1, $pool['teams'][5]->id, $pool['teams'][10]->id, null, null),
					$this->newGame($bracketId, 1, $pool['teams'][6]->id, $pool['teams'][9]->id, null, null),
					$this->newGame($bracketId, 1, $pool['teams'][7]->id, $pool['teams'][8]->id, null, null),
				];
				$pool['games'][2] = [
					$this->newGame($bracketId, 2, null, null, $pool['games'][1][0]['id'], $pool['games'][1][1]['id']),
					$this->newGame($bracketId, 2, null, null, $pool['games'][1][2]['id'], $pool['games'][1][3]['id']),
					$this->newGame($bracketId, 2, null, null, $pool['games'][1][4]['id'], $pool['games'][1][5]['id']),
					$this->newGame($bracketId, 2, null, null, $pool['games'][1][6]['id'], $pool['games'][1][7]['id']),
				];
				$pool['games'][3] = [
					$this->newGame($bracketId, 3, null, null, $pool['games'][2][0]['id'], $pool['games'][2][1]['id']),
					$this->newGame($bracketId, 3, null, null, $pool['games'][2][2]['id'], $pool['games'][2][3]['id']),
				];
				$pool['games'][4] = [
					$this->newGame($bracketId, 4, null, null, $pool['games'][3][0]['id'], $pool['games'][3][1]['id']),
				];
			}

			// pools have their games created, create final 4, championship games
			$finalFour = [
				$this->newGame($bracketId, 5, null, null, $pools[0]['games'][4][0]['id'], $pools[1]['games'][4][0]['id']),
				$this->newGame($bracketId, 5, null, null, $pools[2]['games'][4][0]['id'], $pools[3]['games'][4][0]['id']),
			];

			$championship = [
				$this->newGame($bracketId, 6, null, null, $finalFour[0]['id'], $finalFour[1]['id']),
			];

			// clear out data for json encode
			unset($pools[0]['games']);
			unset($pools[1]['games']);
			unset($pools[2]['games']);
			unset($pools[3]['games']);

			$games = BracketDao::selectBracketGames($bracketId, $round);
		}

		// games are now loaded so send them on to the view
		return view('bracket-round', [
			'bracket' => json_encode($bracket),
			'round' => $round,
			'games' => json_encode($games),
			'pools' => json_encode($pools),
		]);
	}

}
