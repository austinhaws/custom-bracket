<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use App\Pool;
use App\Dao\PoolDao;
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

	public function pool($id)
	{
		return view('pool', ['poolId' => $id]);
	}

	private function compareNumeric($a, $b) {
		return $a > $b ? 1 : ($a < $b ? -1 : 0);
	}

	public function detail($id)
	{

		$teams = PoolDao::selectTeamsListForUserAndPool(Auth::user()->id, $id);
		usort($teams, function($a, $b) {
			$order = $this->compareNumeric($a->votes, $b->votes) * -1;
			if (!$order) {
				// keep order same for top rankers but sort later by sort order
				$order = strcmp($a->name, $b->name);
			}
			return $order;
		});

		$cloudCount = 8;

		if (count($teams) > $cloudCount) {
			// chunk out high and low teams and then do random sort
			$cloudTeams = array_slice($teams, 0, $cloudCount);
			$uncloudTeams = array_slice($teams, $cloudCount);
		} else {
			$cloudTeams = $teams;
			$uncloudTeams = [];
		}

		// resort lists
		usort($cloudTeams, function($a, $b) {
			return $this->compareNumeric($a->sortOrder, $b->sortOrder);
		});
		usort($uncloudTeams, function($a, $b) {
			return $this->compareNumeric($a->sortOrder, $b->sortOrder);
		});

		// how many total picks does the person get
		$picks = floor((count($cloudTeams) + count($uncloudTeams)) / 2);

		// how many has the user picked?
		$pickeds = 0;
		foreach ($cloudTeams as $team) {
			if ($team->picked) {
				$pickeds++;
			}
		}
		foreach ($uncloudTeams as $team) {
			if ($team->picked) {
				$pickeds++;
			}
		}

		return json_encode([
			'cloudTeams' => $cloudTeams,
			'uncloudTeams' => $uncloudTeams,
			'numberPicks' => $picks - $pickeds,
		]);
	}
	
	public function pickTeam($teamId) {
		$team = PoolDao::selectTeamById($teamId);

		$picksLeft = $this->picksLeftForPoolId($team->pool_id);

		// if there are enough picks left, pick this team
		if ($picksLeft) {
			PoolDao::insertUserPoolTeamEntry(Auth::user()->id, $teamId);
		}
	}

	public function enterTeam(Request $request) {
		// get poolId from post
		$poolId = $request->input('poolId');

		// get teamName from post
		$name = $request->input('name');

		// check that the logged in user has a pick left
		$picksLeft = $this->picksLeftForPoolId($poolId);

		$team = false;
		
		// add the team to the pool
		if ($picksLeft) {
			// create the team
			$teamId = PoolDao::insertPoolTeamEntry($poolId, $name);
			
			$team = PoolDao::selectTeamById($teamId);
			
			// pick the team
			PoolDao::insertUserPoolTeamEntry(Auth::user()->id, $teamId);
		}
		
		echo json_encode($team);
	}

	/**
	 *  how many picks does the current logged in user have for this pool?
	 * 
	 * @param $poolId int which pool
	 * @return int # of picks left for the pool
	 */
	private function picksLeftForPoolId($poolId) {
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
}
