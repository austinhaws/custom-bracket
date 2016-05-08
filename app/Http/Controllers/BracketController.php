<?php

namespace App\Http\Controllers;

use App\Dao\BracketDao;
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
			'top_left_pool_id' => $request->input('top_left_pool_id'),
			'top_right_pool_id' => $request->input('top_right_pool_id'),
			'bottom_left_pool_id' => $request->input('bottom_left_pool_id'),
			'bottom_right_pool_id' => $request->input('bottom_right_pool_id'),
		];
		BracketDao::saveBracket($bracket);

		return json_encode(['success' => 'success']);
	}

	public function bracketScore($id, $round) {
		//var_dump([$id, $round]);
		// get all games for the round
	}

}
