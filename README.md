# airpal

## Requirements

* Java 7 or higher
* MySQL database
* [Presto](http://prestodb.io) cluster
* S3 bucket (to store CSVs)
* node.js 0.10.0 or higher (for the front-end build)
* Maven 3.1 or higher


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
     -cp target/airpal-*.jar db migrate reference.yml
```

1. Build Airpal

    We'll be using [Maven](http://maven.apache.org/) to build the back-end Java code,
    and [browserify](http://browserify.org/) (via [node.js](http://nodejs.org/)) to build
    the front-end Javascript code.
    
    Ensure you have `node` and `npm` installed. As mentioned above, node `0.10.0` or higher is
    required.

    If `node` and `npm` are available in your path you can simply run the following command to build:

    ```
    mvn clean package
    ```

    Otherwise, you will have to manually specify where these commands live, like so:

    ```
    mvn -Dnode=/some/path/to/node -Dnpm=/some/path/to/npm clean package
    ```
2. Create a MySQL database for airpal. We recommend you call it `airpal` and will assume that for future steps.

3. Migrate your database

    ```
    java -Duser.timezone=UTC \
         -cp target/airpal-*.jar db migrate reference.yml
    ```

4. Run Airpal

    ```
    java -server \
         -Duser.timezone=UTC \
         -cp target/airpal-*.jar server reference.yml
    ```
