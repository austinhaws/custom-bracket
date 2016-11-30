<?php

namespace App\Http\Controllers;

use App\Dao\BracketDao;
use App\Dao\PoolDao;
use App\Dao\UserDao;
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
		$bracket = &$brackets[0];
		$bracket->pools = PoolDao::selectPools(false);
		$bracket->rolls = BracketDao::rankRollsForBracketId($bracket->id);

		return json_encode($bracket);
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

	// can pass in rolls, bracket and also have rolls be an array in bracket
	public function bracketSave(Request $request)
	{
		Roles::checkIsRole([Roles::ADMIN]);

		$bracket = $request->input('bracket');
		if (isset($bracket['rolls'])) {
			$rolls = $bracket['rolls'];
			unset($bracket['rolls']);
		} else {
			$rolls = $request->input('rolls');
		}

		if ($bracket) {
			BracketDao::saveBracket($bracket);
		}

		if ($rolls) {
			BracketDao::saveBracketRolls($bracket ? $bracket['id'] : $rolls[0]['bracket_id'], $rolls);
		}

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
	 * go to the bracket view page for a player
	 */
	public function playerBracketView() {
		// data is ajaxed so no need to do anything but go to a page
		return view('player-bracket-pick');
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
		$userId = Auth::user()->id;
		$picks = BracketDao::selectUserBracketGames(['user_id' => $userId]);

		$lockedRounds = BracketDao::selectLockedRounds($bracket->id)[0];
		list($scores, $possibles) = $this->scoreBracketPicks($games, $picks);
		return view('bracket-pick', [
			'bracket' => json_encode($bracket),
			'games' => json_encode($games),
			'pools' => json_encode($pools),
			'teams' => json_encode($teams),
			'score' => isset($scores[$userId]) ? $scores[$userId] : 0,
			'possible' => isset($scores[$userId]) ? $scores[$userId] + $possibles[$userId] : 0,
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

	/**
	 * show scores of players in a bracket
	 *
	 * @param $bracketId int the bracket to show
	 * @return \Illuminate\Contracts\View\Factory|\Illuminate\View\View
	 */
	public function bracketScores($bracketId) {
		// get the bracket
		$bracket = BracketDao::selectBrackets(['id' => $bracketId])[0];

		// load games for the round for the bracket
		$games = BracketDao::selectBracketGames($bracketId, false);

		// get picks for all the users of this bracket
		$userPicks = BracketDao::selectUserBracketGamesByBracketId($bracketId);

		// score all the picks
		list($scores, $possibles) = $this->scoreBracketPicks($games, $userPicks);

		// for security, probably should only show users that have brackets...
		$users = UserDao::selectUsers();

		// load pools for showing real bracket
		$pools = [
			[
				'id' => $bracket->top_left_pool_id,
				'teams' => PoolDao::selectTeamsListForPool($bracket->top_left_pool_id),
				'pool' => PoolDao::selectPools(['id' => $bracket->top_left_pool_id])[0]
			],
			[
				'id' => $bracket->bottom_left_pool_id,
				'teams' => PoolDao::selectTeamsListForPool($bracket->bottom_left_pool_id),
				'pool' => PoolDao::selectPools(['id' => $bracket->bottom_left_pool_id])[0]
			],
			[
				'id' => $bracket->top_right_pool_id,
				'teams' => PoolDao::selectTeamsListForPool($bracket->top_right_pool_id),
				'pool' => PoolDao::selectPools(['id' => $bracket->top_right_pool_id])[0]
			],
			[
				'id' => $bracket->bottom_right_pool_id,
				'teams' => PoolDao::selectTeamsListForPool($bracket->bottom_right_pool_id),
				'pool' => PoolDao::selectPools(['id' => $bracket->bottom_right_pool_id])[0]
			],
		];
		
		return view('bracket-scores', [
			'data' => json_encode([
				'bracket' => $bracket,
				'games' => $games,
				'pools' => $pools,
				'scores' => $scores,
				'possibles' => $possibles,
				'users' => $users,
			])
		]);
	}

	/**
	 * how many points does this bracket have?
	 *
	 * @param $games array the played games
	 * @param $picks array the users' picks
	 * @return int their current score
	 */
	private function scoreBracketPicks($games, &$picks) {
		// map games to their data for quick lookup
		$gameWinners = [];

		// user id => score
		$scores = [];
		$possibles = [];

		// which teams lost in which rounds to know if future picks of that same team are bad
		$loserIdsByRound = [
			1 => [],
			2 => [],
			3 => [],
			4 => [],
			5 => [],
			6 => [],
		];

		// teamId => rank
		$ranks = [];

		// load game information about winners
		foreach ($games as $game) {
			// remember ranks of teams (winning teams overwrite themselves several times /shrug)
			$ranks[$game->pool_entry_1_id] = $game->pool_entry_1_rank;
			$ranks[$game->pool_entry_2_id] = $game->pool_entry_2_rank;

			if ($game->pool_entry_1_score > $game->pool_entry_2_score) {
				$winnerId = $game->pool_entry_1_id;
				$loserId = $game->pool_entry_2_id;
				$upset = $game->pool_entry_1_rank < $game->pool_entry_2_rank;
			} else if ($game->pool_entry_1_score < $game->pool_entry_2_score) {
				$winnerId = $game->pool_entry_2_id;
				$upset = $game->pool_entry_2_rank > $game->pool_entry_1_rank;
				$loserId = $game->pool_entry_1_id;
			} else {
				$loserId = false;
				$winnerId = false;
				$upset = false;
			}
			if ($winnerId) {
				$loserIdsByRound[$game->round][] = $loserId;
			}
			$gameWinners[$game->id] = [
				'winnerId' => $winnerId,
				'round' => $game->round,
				'upset' => $upset,
			];
		}

		// score each pick
		foreach ($picks as $pick) {
			if (!isset($scores[$pick->user_id])) {
				$scores[$pick->user_id] = 0;
				$possibles[$pick->user_id] = 0;
			}
			$gameWinner = $gameWinners[$pick->bracket_game_id];
			$pick->upset = false;

			// check if game has a winner yet (maybe this round isn't played yet)
			if ($gameWinner['winnerId']) {
				// there is a winner! did they pick right?
				if ($gameWinner['winnerId'] == $pick->pool_entry_winner_id) {
					$scores[$pick->user_id] += $this->pickScore($gameWinner['round'], $gameWinner['upset']);
					$pick->upset = $gameWinner['upset'];
					$pick->correct = 'Y';
				} else {
					// they didn't pick right... LOSER!
					$pick->correct = 'N';
				}
			} else {
				// this game has not yet been played, so see if the team they picked won the previous round
				$loserFound = false;
				for ($round = $gameWinner['round']; $round >= 1; $round--) {
					if (array_search($pick->pool_entry_winner_id, $loserIdsByRound[$round]) !== false) {
						$loserFound = true;
						break;
					}
				}
				// if loser was found in a previous round then this pick is impossible so mark them as bad
				if ($loserFound) {
					$pick->correct = 'N';
				} else {
					// rank of their opponent... just use their pick opponent
					$rankPickWinner = $ranks[$pick->pool_entry_winner_id];
					$rankPickLoser = $ranks[$pick->pool_entry_winner_id == $pick->pool_entry_1_id ? $pick->pool_entry_2_id : $pick->pool_entry_1_id];
					$possibles[$pick->user_id] += $this->pickScore($gameWinner['round'], $rankPickWinner < $rankPickLoser);
					$pick->correct = '?';
				}
			}
		}
		return [$scores, $possibles];
	}

	/**
	 * how many points is a round game worth?
	 *
	 * @param $round int which round
	 * @param $upset boolean was this an upset?
	 * @return int total points
	 */
	private function pickScore($round, $upset) {
		switch ($round) {
			case 1:
				$points = 1;
				break;
			case 2:
				$points = 2;
				break;
			case 3:
				$points = 4;
				break;
			case 4:
				$points = 8;
				break;
			case 5:
				$points = 16;
				break;
			case 6:
				$points = 32;
				break;
			default:
				// hey, something bad happened you should be aware of
				$points = -1000;
				break;
		}
		return $points + ($upset ? $points : 0);
	}

	public function dataPlayerBracket() {
		// current logged in user
		$userId = Auth::user()->id;

		// bracket for dates of rounds
		$bracket = BracketDao::selectBrackets([])[0];

		// get user's picks
		$userBracketGames = BracketDao::selectUserBracketGames(['user_id' => $userId]);

		// get the games played
		$bracketGames = BracketDao::selectBracketGames($bracket->id, false);

		// get pools names/ids for the bracket
		$pools = PoolDao::selectPools([]);

		// teams for the pool
		foreach ($pools as $key => $DONTUSE) {
			$pools[$key]->entries = PoolDao::selectTeamsListForPool($pools[$key]->id, true);
		}

		echo json_encode([
			'bracket' => $bracket,
			'picks' => $userBracketGames,
			'pools' => $pools,
			'games' => $bracketGames,
		]);
	}

	public function bracketPickSave($gameId, $team1Id, $team2Id, $winningTeamId) {
		function fixNextGame($previousGameId, $chosenTeamId, $userId, $previousWinningGameId) {
			// get the next game and determine if from the 1st game or the 2nd game
			$fromOne = true;
			$game = BracketDao::selectBracketGame(['prev_bracket_game_1_id' => $previousGameId]);
			if (!$game) {
				$game = BracketDao::selectBracketGame(['prev_bracket_game_2_id' => $previousGameId]);
				$fromOne = false;
			}

			// if game found, update it with new previous team (if not found then don't do anything)
			if ($game) {
				$game = $game[0];
				// find pick for this game; create if missing
				$pick = BracketDao::selectUserBracketGames(['user_id' => $userId, 'bracket_game_id' => $game->id]);
				if ($pick) {
					$pick = $pick[0];
					// - set its team1 OR team2 to this' winningid
					if ($fromOne) {
						$pick->pool_entry_1_id = $chosenTeamId;
					} else {
						$pick->pool_entry_2_id = $chosenTeamId;
					}
					// - if its winningid is the new picked winner, update to picked team and recurse
					if ($previousWinningGameId && $pick->pool_entry_winner_id == $previousWinningGameId) {
						// - set to new team winner
						$pick->pool_entry_winner_id = $chosenTeamId;

						// - recurse
						fixNextGame($pick->bracket_game_id, $chosenTeamId, $userId, $previousWinningGameId);
					}
					BracketDao::saveUserBracketGame((array) $pick);

				} else {
					// game not found so enter a new record
					BracketDao::insertUserBracketGame($userId, $game->id, $fromOne ? $chosenTeamId : null, $fromOne ? null : $chosenTeamId, null);
				}
			}
		}

		$userId = Auth::user()->id;

		// just delete and re-add
		$game = BracketDao::selectUserBracketGames(['user_id' => $userId, 'bracket_game_id' => $gameId]);
		$previousWinningGameId = false;
		if ($game) {
			$game = $game[0];
			$previousWinningGameId = $game->pool_entry_winner_id;
		}
		if (!$team1Id) {
			$team1Id = 0;
		}
		if (!$team2Id) {
			$team2Id = 0;
		}
		BracketDao::deleteUserBracketGames(['bracket_game_id' => $gameId, 'user_id' => $userId]);
		BracketDao::insertUserBracketGame($userId, $gameId, $team1Id, $team2Id, $winningTeamId);
		fixNextGame($gameId, $winningTeamId, $userId, $previousWinningGameId);

		echo json_encode(['result' => 'game saved']);
	}

	public function enterScores() {
		function compilePool($pool, $games) {
			$result = [
				'pool' => $pool,
				'teams' => PoolDao::selectTeamsListForPool($pool->id),
			];

			// separate in to rounds
			$result['games'] = [1 => [], 2 => [], 3 => [], 4 => []];
			foreach ($games as $game) {
				if ($game->pool_id == $pool->id) {
					$result['games'][$game->round][] = $game->id;
				}
			}

			return $result;
		}

		function compileFinals($games) {
			$result['games'] = [5 => [], 6 => []];
			foreach ($games as $game) {
				if ($game->round >= 5) {
					$result['games'][$game->round][] = $game->id;
				}
			}
			return $result;
		}

		// get the bracket
		$bracket = BracketDao::selectBrackets([])[0];

		// get pools for the four conferences
		$pools = PoolDao::selectPools(false);
		$gamesById = $this->bracketGamesById($bracket->id);

		$output = ['bracket' => $bracket];
		foreach ($pools as $pool) {
			$output[$pool->id] = compilePool($pool, $gamesById);
		}

		$output['finals'] = compileFinals($gamesById);
		$output['games'] = $gamesById;
		$rolls = BracketDao::rankRollsForBracketId($bracket->id);
		$rollsByRank = [];
		foreach ($rolls as $roll) {
			$rollsByRank[$roll->rank] = $roll->roll;
		}

		$output['rolls'] = $rollsByRank;

		// load the page passing it the bracket id, it will ajax for the rest of the data
		return view('enter-game-scores', ['data' => json_encode($output)]);
	}

	// get a brackets games and convert to key/value of gameid => game
	private function bracketGamesById($bracketId) {
		$games = BracketDao::selectBracketGames($bracketId, false);
		$gamesById = [];
		foreach ($games as $game) {
			$gamesById[$game->id] = $game;
		}
		return $gamesById;
	}

	function saveGameScores(Request $request) {
		// client side is in charge of pushing changes through dependent games and will send all games here; man this screams MONGO games container
		$games = $request->input('games');
		foreach ($games as $game) {
			BracketDao::updateBracketGame([
					'pool_entry_1_id' => $game['pool_entry_1_id'],
					'pool_entry_1_rank' => $game['pool_entry_1_rank'],
					'pool_entry_1_score' => $game['pool_entry_1_score'],
					'pool_entry_2_id' => $game['pool_entry_2_id'],
					'pool_entry_2_rank' => $game['pool_entry_2_rank'],
					'pool_entry_2_score' => $game['pool_entry_2_score']
				],
				['id' => $game['id']]
			);
		}

		return json_encode(['success' => 'success']);
	}

	function saveGameScore(Request $request) {
		$gameId = $request->input('gameId');
		$score = $request->input('score');
		$teamId = $request->input('teamId');
		BracketDao::updateBracketGame(['pool_entry_1_score' => $score], ['id' => $gameId, 'pool_entry_1_id' => $teamId]);
		BracketDao::updateBracketGame(['pool_entry_2_score' => $score], ['id' => $gameId, 'pool_entry_2_id' => $teamId]);

		// select the game, and send back
		$game = BracketDao::selectBracketGame(['id' => $gameId])[0];
		if ($game->pool_entry_1_score && $game->pool_entry_2_score) {
			// this doesn't handle chaining of score entries, and assumes that you don't go back and change scores once set
			if ($game->pool_entry_1_score > $game->pool_entry_2_score) {
				// tell the next game entry 1 won
				BracketDao::updateBracketGame(['pool_entry_1_id' => $game->pool_entry_1_id], ['prev_bracket_game_1_id' => $game->id]);
				BracketDao::updateBracketGame(['pool_entry_2_id' => $game->pool_entry_1_id], ['prev_bracket_game_2_id' => $game->id]);
			} else {
				// tell the next game entry 2 won
				BracketDao::updateBracketGame(['pool_entry_1_id' => $game->pool_entry_2_id], ['prev_bracket_game_1_id' => $game->id]);
				BracketDao::updateBracketGame(['pool_entry_2_id' => $game->pool_entry_2_id], ['prev_bracket_game_2_id' => $game->id]);
			}
		}

		$games = [$game];

		$newGame = BracketDao::selectBracketGame(['prev_bracket_game_1_id' => $game->id]);
		if (count($newGame)) {
			$games[] = $newGame[0];
		}

		$newGame = BracketDao::selectBracketGame(['prev_bracket_game_2_id' => $game->id]);
		if (count($newGame)) {
			$games[] = $newGame[0];
		}

		return json_encode($games);
	}
}
