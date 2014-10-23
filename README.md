# airpal

## Requirements

* Java 7 or higher
* MySQL database
* [Presto](http://prestodb.io) cluster
* S3 bucket

## Steps to launch

1. Build Airpal

    Ensure you have `node` and `npm` installed. Node `0.10.0` or greater is
    required.

    If `node` and `npm` are available in your path:

    ```
    mvn clean package
    ```

    Otherwise, you can specify where they are like so:

    ```
    mvn -Dnode=/some/path/to/node -Dnpm=/some/path/to/npm clean package
    ```

2. Migrate your database

    ```
    java -Ddw.prestoCoordinator=http://presto-coordinator-url.com \
     -Ddw.s3AccessKey=$ACCESS_KEY \
     -Ddw.s3SecretKey=$SECRET_KEY \
     -Ddw.s3Bucket=airpal \
     -Ddw.metaStoreConfiguration.connectionUrl=jdbc:mysql://$METASTORE_HOST:3306/metastore \
     -Ddw.metaStoreConfiguration.password=$METASTORE_PASSWORD \
     -Ddw.metaStoreConfiguration.userName=$METASTORE_USER \
     -Duser.timezone=UTC \
     -cp target/airpal-*.jar db migrate reference.yml
    ```

3. Run Airpal

    ```
    java -server \
         -Ddw.prestoCoordinator=http://presto-coordinator-url.com \
         -Ddw.s3AccessKey=$ACCESS_KEY \
         -Ddw.s3SecretKey=$SECRET_KEY \
         -Ddw.s3Bucket=airpal \
         -Ddw.metaStoreConfiguration.connectionUrl=jdbc:mysql://$METASTORE_HOST:3306/metastore \
         -Ddw.metaStoreConfiguration.password=$METASTORE_PASSWORD \
         -Ddw.metaStoreConfiguration.userName=$METASTORE_USER \
         -Duser.timezone=UTC \
         -cp target/airpal-*.jar
    ```
