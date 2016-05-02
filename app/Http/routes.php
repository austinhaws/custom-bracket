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

// Admin
Route::get('/admin', 'AdminController@index');