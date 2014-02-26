<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>Starter Template for Bootstrap</title>

    <link href="{{ asset('css/styles.css') }}" rel="stylesheet">

    <!--[if lt IE 9]>
      <script src="js/global/html5shiv.js"></script>
      <script src="js/global/respond.min.js"></script>
    <![endif]-->
  </head>

  <body>

    @yield('topbar')

    <div class="container">
      @yield('content')
    </div>

    @yield('footer')

    <script src="{{ asset('js/global/jquery-2.1.0.min.js') }}"></script>
    <script src="{{ asset('js/global/underscore-min.js') }}"></script>
    <script src="{{ asset('js/global/backbone-min.js') }}"></script>
    <script src="{{ asset('js/global/bootstrap.min.js') }}"></script>

    @yield('scripts')

  </body>
</html>
