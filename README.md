# airpal

airpal is a web-based, query execution tool, leveraging Facebook's
[PrestoDB](http://prestodb.io) query engine. airpal gives you the
ability to run Presto queries and get the results as a CSV (so you can
download it or share it with friends), or have the results exported to a
new hive table. airpal gives users the ability to explore
available data by fuzzy matching on table names and then visualizing the
schema of any table. Even better, you can see other queries that use the
table, so you know what types of queries are ran against it.

* [Features](#features)
* [Requirements](#requirements)
* [Launching](#steps-to-launch)
* [Presto Compatibility Chart](#compatibility-chart)

## Features

* Optional [Access Control](docs/USER_ACCOUNTS.md)
* Syntax highlighting
* Results exported to a CSV for download or a hive table
* Query history for self and others
* Saved queries
* Table finder to search for appropriate tables
* Table explorer to visualize schema of table

## Requirements

* Java 7 or higher
* MySQL database
* [Presto](http://prestodb.io) 0.77 or higher
* S3 bucket (to store CSVs)
* Gradle 2.2 or higher


## Steps to launch

*Note* that below, we'll be using a less verbose syntax to execute airpal. This assumes
that all of the configuration settings are specified in your `.yml` configuration file,
and that it's called `reference.yml`.
If modifying `reference.yml` is undesirable, or you want to override certain settings on the command line,
you can easily specify them in [the traditional Dropwizard fashion](https://dropwizard.github.io/dropwizard/manual/core.html#configuration) like so:

```
java -Ddw.prestoCoordinator=http://presto-coordinator-url.com \
     -Ddw.s3AccessKey=$ACCESS_KEY \
     -Ddw.s3SecretKey=$SECRET_KEY \
     -Ddw.s3Bucket=airpal \
     -Ddw.metaStoreConfiguration.connectionUrl=jdbc:mysql://$METASTORE_HOST:3306/metastore \
     -Ddw.metaStoreConfiguration.password=$METASTORE_PASSWORD \
     -Ddw.metaStoreConfiguration.userName=$METASTORE_USER \
     -Ddw.dataSourceFactory.url=jdbc:mysql://127.0.0.1:3306/airpal \
     -Ddw.dataSourceFactory.user=airpal \
     -Ddw.dataSourceFactory.password=$YOUR_PASSWORD \
     -Duser.timezone=UTC \
     -cp build/libs/airpal-*-all.jar db migrate reference.yml
```

1. Build airpal

    We'll be using [Gradle](https://www.gradle.org/) to build the back-end Java code,
    and [browserify](http://browserify.org/) (via [Node.js](http://nodejs.org/)) to build
    the front-end Javascript code.

    If you have `node` and `npm` installed locally, and wish to use
    them, simply run:

    ```
    ./gradlew clean shadowJar -Dairpal.useLocalNode
    ```

    Otherwise, `node` and `npm` will be automatically downloaded for you
    by running:

    ```
    ./gradlew clean shadowJar
    ```

2. Create a MySQL database for airpal. We recommend you call it `airpal` and will assume that for future steps.

3. Migrate your database

    ```
    java -Duser.timezone=UTC \
         -cp build/libs/airpal-*-all.jar db migrate reference.yml
    ```

4. Run airpal

    ```
    java -server \
         -Duser.timezone=UTC \
         -cp build/libs/airpal-*-all.jar server reference.yml
    ```

5. Visit airpal
    Assuming you used the default settings in `reference.yml` you can
    now open http://localhost:8081 to use airpal. Note that you might
    have to change the host, depending on where you deployed it.

## Compatibility Chart

airpal Version | Presto Versions Tested
---------------|-----------------------
0.1            | 0.77, 0.87
