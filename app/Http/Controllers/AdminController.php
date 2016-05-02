<?php

namespace App\Http\Controllers;

use App\Http\Requests;
use Illuminate\Http\Request;
use App\Enums\Roles;
use Auth;

// don't put all admin pages in here, just the actual admin home stuff
// pools and brackets and those pages go in their relevant controllers
class AdminController extends Controller
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
		Roles::checkIsRole([Roles::ADMIN]);
		
        return view('admin-home');
    }
}
