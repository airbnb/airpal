<#-- @ftlvariable name="" type="com.airbnb.airpal.service.LoginView" -->

<html>
<head>
    <title>Airpal Login</title>
</head>
<body>
    <div style="width: 30%; margin: 20px auto;">
        <form name="login" action="" method="POST">
            <fieldset>
                <div class="form-group">
                    <input class="form-control" placeholder="Username or Email" name="username" type="text">
                </div>
                <div class="form-group">
                    <input class="form-control" placeholder="Password" name="password" type="password" value="">
                </div>
                <div class="checkbox">
                    <label>
                        <input name="rememberMe" type="checkbox" value="true" checked="checked"> Remember Me
                    </label>
                </div>
                <input class="btn btn-lg btn-success btn-block" type="submit" value="Login">
            </fieldset>
        </form>
    </div>
</body>
</html>