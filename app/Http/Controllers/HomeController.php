<?php

namespace App\Http\Controllers;

use App\Dao\BracketDao;
use App\Http\Requests;

class HomeController extends Controller
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
    public function index()
    {
        return view('home', ['brackets' => json_encode(BracketDao::selectBrackets(false))]);
    }
}
