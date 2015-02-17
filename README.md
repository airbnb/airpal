# Airpal

Airpal is a web-based, query execution tool which leverages Facebook's [PrestoDB](http://prestodb.io)
to make authoring queries and retrieving results simple for users.
Airpal provides the ability to find tables, see metadata, browse sample rows,
write and edit queries, then submit queries all in a web interface. Once
queries are running, users can track query progress and when finished,
get the results back through the browser as a CSV (download it or share it
with friends). The results of a query can be used to generate a new Hive table
for subsequent analysis, and Airpal maintains a searchable history of all
queries run within the tool.

* [Features](#features)
* [Requirements](#requirements)
* [Launching](#steps-to-launch)
* [Presto Compatibility Chart](#compatibility-chart)

## Features

* Optional [Access Control](docs/USER_ACCOUNTS.md)
* Syntax highlighting
* Results exported to a CSV for download or a Hive table
* Query history for self and others
* Saved queries
* Table finder to search for appropriate tables
* Table explorer to visualize schema of table and first 1000 rows

## Requirements

* Java 7 or higher
* MySQL database
* [Presto](http://prestodb.io) 0.77 or higher
* S3 bucket (to store CSVs)
* Gradle 2.2 or higher


## Steps to launch

*Note* that below, we'll be using a less verbose syntax to execute Airpal. This assumes
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

1. Build Airpal

    We'll be using [Gradle](https://www.gradle.org/) to build the back-end Java code,
    and [Browserify](http://browserify.org/) and [Gulp](http://gulpjs.com/)&mdash;[Node.js](http://nodejs.org/)
    tools&mdash;to build the front-end Javascript code.

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

2. Create a MySQL database for Airpal. We recommend you call it `airpal` and will assume that for future steps.

3. Migrate your database.

    ```
    java -Duser.timezone=UTC \
         -cp build/libs/airpal-*-all.jar db migrate reference.yml
    ```

4. Run Airpal.

    ```
    java -server \
         -Duser.timezone=UTC \
         -cp build/libs/airpal-*-all.jar server reference.yml
    ```

5. Visit Airpal.
    Assuming you used the default settings in `reference.yml` you can
    now open http://localhost:8081 to use Airpal. Note that you might
    have to change the host, depending on where you deployed it.

## Compatibility Chart

Airpal Version | Presto Versions Tested
---------------|-----------------------
0.1            | 0.77, 0.87
