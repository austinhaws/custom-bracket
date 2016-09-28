@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-md-10 col-md-offset-1">
                <div class="panel panel-default">
                    <div class="panel-heading">Conferences</div>
                    <div class="panel-body">
                        <div id="poolsBox"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-10 col-md-offset-1">
                <div class="panel panel-default">
                    <div class="panel-heading">Bracket</div>
                    <div class="panel-body">
                        <div id="bracketBox"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script type="text/babel" src="js/views/admin-home.js"></script>
@endsection
