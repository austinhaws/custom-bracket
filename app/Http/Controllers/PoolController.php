<?php

namespace App\Http\Controllers;

use App\Dao\PoolDao;
use App\Enums\Roles;
use App\Pool;
use Auth;
use Illuminate\Http\Request;

class PoolController extends Controller
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
		$pools = Pool::orderBy('name', 'asc')->get();

		return json_encode($pools);
	}

	public function ajaxLoad($poolId) {
		$pool = PoolDao::selectPools(['id' => $poolId])[0];
		$pool->teams = PoolDao::selectTeamsListForPool($poolId);
		return json_encode($pool);
	}

	public function pool($id)
	{
		return view('pool', ['poolId' => $id]);
	}

	private function compareNumeric($a, $b)
	{
		return $a > $b ? 1 : ($a < $b ? -1 : 0);
	}

	public function detail($id)
	{

		$teams = PoolDao::selectTeamsListForUserAndPool(Auth::user()->id, $id);
		usort($teams, function ($a, $b) {
			$order = $this->compareNumeric($a->votes, $b->votes) * -1;
			if (!$order) {
				$order = strcmp($a->name, $b->name);
			}
			return $order;
		});
		$pool = PoolDao::selectPools(['id' => $id])[0];
		return json_encode([
			'teams' => $teams,
			'pool' => $pool,
		]);
	}

	public function pickTeam($teamId)
	{
		// if nothing deleted, add the pick
		if (!PoolDao::deleteUserPollTeamEntry(Auth::user()->id, $teamId)) {
			PoolDao::insertUserPoolTeamEntry(Auth::user()->id, $teamId);
		}
	}

	public function enterTeam(Request $request)
	{
		// get poolId from post
		$poolId = $request->input('poolId');

		// get teamName from post
		$name = $request->input('name');

		$team = false;

		// create the team
		$teamId = PoolDao::insertPoolTeamEntry($poolId, $name);

		$team = PoolDao::selectTeamById($teamId);

		// pick the team
		PoolDao::insertUserPoolTeamEntry(Auth::user()->id, $teamId);

		echo json_encode($team);
	}

	/**
	 *  how many picks does the current logged in user have for this pool?
	 *
	 * @param $poolId int which pool
	 * @return int # of picks left for the pool
	 */
	private function picksLeftForPoolId($poolId)
	{
		// get how many picks this person has left for this pool
		$teams = PoolDao::selectTeamsListForUserAndPool(Auth::user()->id, $poolId);

		// how many total picks does the person get
		$picks = count($teams) / 2;

		// how many has the user picked?
		$pickeds = 0;
		foreach ($teams as $team) {
			if ($team->picked) {
				$pickeds++;
			}
		}

		return $picks - $pickeds;
	}

	public function poolAdd()
	{
		return $this->editPoolView(false);
	}

	public function poolEdit($id)
	{
		return $this->editPoolView($id);
	}

	private function editPoolView($poolId)
	{
		Roles::checkIsRole([Roles::ADMIN]);
		return view('pool-edit', ['poolId' => $poolId]);
	}

	public function savePools(Request $request)
	{
		$data = json_decode($request->input('pools'));
		foreach ($data as $pool) {
			$poolArray = (array) $pool;
			PoolDao::savePool($poolArray);
		}
		return json_encode(['success' => 'success']);
	}

	public function postPool($poolId, Request $request)
	{
		$pool = json_decode($request->input('pool'));
		if ($poolId == $pool->id) {
			$poolArray = (array) $pool;
			PoolDao::savePool($poolArray);
			echo json_encode(['success' => 'success']);
		}
	}

	public function poolSave(Request $request)
	{
		Roles::checkIsRole([Roles::ADMIN]);

		$pool = [
			'id' => $request->input('id'),
			'name' => $request->input('name'),
			'open_date' => $request->input('open_date'),
			'closing_date' => $request->input('close_date'),
		];
		PoolDao::savePool($pool);

		$teams = $request->input('teams');
		if ($teams) {
			foreach ($teams as $team) {
				if (!$team['id']) {
					PoolDao::insertPoolTeam(['pool_id' => $pool['id'], 'name' => $team['name']]);
				}
			}
		}

		return json_encode(['success' => 'success']);
	}
}
