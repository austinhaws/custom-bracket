@extends('layouts.app')

@section('content')
welcome home admin
    <div class="container">
        <div class="row">
            <div class="col-md-10 col-md-offset-1">
                <div class="panel panel-default">
                    <div class="panel-heading">Pools</div>

                    <div class="panel-body">
                        <div id="poolsBox"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script type="text/babel" src="js/views/admin-home.js"></script>
@endsection
