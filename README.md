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

![Airpal UI](screenshots/demo.gif)

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

1. Build Airpal

    We'll be using [Gradle](https://www.gradle.org/) to build the back-end Java code
    and a [Node.js](http://nodejs.org/)-based build pipeline ([Browserify](http://browserify.org/)
    and [Gulp](http://gulpjs.com/)) to build the front-end Javascript code.

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

    Specify Presto version by `-Dairpal.prestoVersion`:

    ```
    ./gradlew -Dairpal.prestoVersion=0.145 clean shadowJar
    ```

1. Create a MySQL database for Airpal. We recommend you call it `airpal` and will assume that for future steps.

1. Create a `reference.yml` file to store your configuration options.

    Start by copying over the example configuration, `reference.example.yml`.

    ```
    cp reference.example.yml reference.yml
    ```
    Then edit it to specify your MySQL credentials, and your S3 credentials if
    using S3 as a storage layer (Airpal defaults to local file storage, for
    demonstration purposes).

1. Migrate your database.

    ```
    java -Duser.timezone=UTC \
         -cp build/libs/airpal-*-all.jar com.airbnb.airpal.AirpalApplication db migrate reference.yml
    ```

1. Run Airpal.

    ```
    java -server \
         -Duser.timezone=UTC \
         -cp build/libs/airpal-*-all.jar com.airbnb.airpal.AirpalApplication server reference.yml
    ```

1. Visit Airpal.
    Assuming you used the default settings in `reference.yml` you can
    now open http://localhost:8081 to use Airpal. Note that you might
    have to change the host, depending on where you deployed it.

*Note:* To override the configuration specified in `reference.yml`, you may
specify certain settings on the command line in [the traditional Dropwizard
fashion](https://dropwizard.github.io/dropwizard/manual/core.html#configuration),
like so:

```
java -Ddw.prestoCoordinator=http://presto-coordinator-url.com \
     -Ddw.s3AccessKey=$ACCESS_KEY \
     -Ddw.s3SecretKey=$SECRET_KEY \
     -Ddw.s3Bucket=airpal \
     -Ddw.dataSourceFactory.url=jdbc:mysql://127.0.0.1:3306/airpal \
     -Ddw.dataSourceFactory.user=airpal \
     -Ddw.dataSourceFactory.password=$YOUR_PASSWORD \
     -Duser.timezone=UTC \
     -cp build/libs/airpal-*-all.jar db migrate reference.yml
```


## Compatibility Chart

Airpal Version | Presto Versions Tested
---------------|-----------------------
0.1            | 0.77, 0.87, 0.145

## In the Wild
Organizations and projects using `airpal` can list themselves [here](INTHEWILD.md).

## Contributors

- Andy Kramolisch [@andykram](https://github.com/andykram)
- Harry Shoff [@hshoff](https://github.com/hshoff)
- Josh Perez [@goatslacker](https://github.com/goatslacker)
- Spike Brehm [@spikebrehm](https://github.com/spikebrehm)
- Stefan Vermaas [@stefanvermaas](https://github.com/stefanvermaas)
