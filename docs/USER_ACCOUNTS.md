# User Accounts

Airpal has the ability to restrict access to data based on the schema
and table it is in. These restrictions also support limiting access
to views, based on the view's fully qualified name.
This functionality is mostly provided by [Apache
Shiro](http://shiro.apache.org/), and is configured by specifying an INI
file in the Airpal configuration under [`shiro > iniConfigs`](https://github.com/airbnb/airpal/blob/master/reference.example.yml#L22).
The [Shiro docs](http://shiro.apache.org/reference.html) provide
information on configuring Shiro.

By default, Airpal is configured to use the provided
[allow all](https://github.com/airbnb/airpal/blob/master/src/main/resources/shiro_allow_all.ini)
configuration file. This configuration allows all users to have access
to all data available to Presto.

Airpal also ships with a provided config file with [statically
configured users](https://github.com/airbnb/airpal/blob/master/src/main/resources/shiro_static_users.ini).
This INI file establishes one user account with a static username and
password, and should not be used in a production setting. To enable this,
simply modify `reference.yml` to use `shiro_static_users.ini`.

Airpal can be configured to provide authentication and authorization via
any shiro supported realm or filter, however, the primary principle must
be an instance of one of the following:

* A class which implements [`com.airbnb.airpal.core.ToAirpalUser`](https://github.com/airbnb/airpal/blob/master/src/main/java/com/airbnb/airpal/core/ToAirpalUser.java)
* A class which is an [`com.airbnb.airpal.core.AirpalUser`](https://github.com/airbnb/airpal/blob/master/src/main/java/com/airbnb/airpal/core/AirpalUser.java)
* A string, denoting the user's name, in which case the user assumes
  default permissions and privileges

Internally, we have a custom realm and filter which will map a user from
our internal auth system to an `AirpalUser`.

Note that there are very likely better ways of making this more general,
and PRs are welcome.

