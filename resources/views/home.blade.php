@extends('layouts.app')

@section('content')

    <div class="container">
        <div class="row">
            <div class="col-md-10 col-md-offset-1">
                <div class="panel panel-default">
                    <div class="panel-heading h3">Conferences <span class="blurb">conference winners play in bracket championship</span></div>
                    <div class="panel-body">
                        <div id="poolsBox" class="inputTable"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <div class="row">
            <div class="col-md-10 col-md-offset-1">
                <div class="panel panel-default">
                    <div class="panel-heading h3">Bracket</div>
                    <div id="bracketsBox" class="inputTable"></div>
                </div>
            </div>
        </div>
    </div>

    <script type="text/babel" src="js/views/pools.js"></script>
@endsection
