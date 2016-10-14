<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

// TODO: use controller classes instead of route definitions here
// TODO: use RESTful calls for ajax data

// -- starting routes -- //
// base route
//Route::get('/', ['middleware' => 'auth', function () {
//    return view('home');
//}]);

Route::get('/', ['middleware' => 'auth', function() {
	return view('home');
}]);

// after authentication
Route::get('/home', function () {
    return view('home');
});

// -- Custom Routes -- //

Route::get('/pools', function (Request $request) {
	// go to list of pools
});

Route::get('/pool', function (Request $request) {
	// go to a specific pool
});


Route::auth();

Route::get('/home', 'HomeController@index');

Route::get('/pool/list', 'PoolController@ajaxList');
Route::get('/pool/{id}', 'PoolController@pool');
Route::get('/pool/detail/{id}', 'PoolController@detail');
Route::get('/pool/pick/{id}', 'PoolController@pickTeam');
Route::post('/pool/enterTeam', 'PoolController@enterTeam');

Route::get('/bracket/list', 'BracketController@ajaxList');

// load the bracket picker view for the user to pick on
Route::get('bracket/{id}', 'BracketController@bracketPicks');

// since switched to a single bracket paradigm, this goes to the current user's bracket
Route::get('/view/bracket', 'BracketController@playerBracketView');

// make a bracket pick
Route::post('/bracket/pick', 'BracketController@bracketPick');

// view scores of everyone in a bracket
Route::get('/bracket/scores/{id}', 'BracketController@bracketScores');

// Admin
Route::get('/admin', 'AdminController@index');
Route::get('/admin/pool/add', 'PoolController@poolAdd');
Route::post('/admin/pool/save', 'PoolController@poolSave');
Route::post('/admin/pool/savePools', 'PoolController@savePools');
Route::get('/admin/pool/{id}', 'PoolController@poolEdit');
Route::post('/admin/pool/load/{id}', 'PoolController@ajaxLoad');

Route::get('/admin/bracket/add', 'BracketController@bracketAdd');
Route::post('/admin/bracket/save', 'BracketController@bracketSave');
Route::get('/admin/bracket/{id}', 'BracketController@bracketEdit');
Route::get('/admin/bracket/score/{id}/{round}', 'BracketController@bracketScore');
Route::post('/admin/bracket/score/save', 'BracketController@bracketScoreSave');

// RESTful
// Pool
Route::post('/pools/{id}', 'PoolController@postPool');

// Bracket
Route::get('/bracket', 'BracketController@dataPlayerBracket');

// Bracket Pick
Route::post('/bracket/pick/{gameId}/{team1Id}/{team2Id}/{teamId}', 'BracketController@bracketPickSave');
