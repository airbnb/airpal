# airpal

## Steps to launch

* Run an elasticsearch server
  * `brew install elasticsearch`
  * `elasticsearch -f -D es.config=/usr/local/opt/elasticsearch/config/elasticsearch.yml`
* Setup an S3 bucket and create an account with R/W ability
* If your elasticsearch configuration is different from the default, update `reference.yml`

Next:

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

To run:

```
java -server \
     -Ddw.prestoCoordinator=http://presto-coordinator-url.com \
     -Ddw.discoveryServer=http://127.0.0.1:3341 \
     -Ddw.s3AccessKey=$ACCESS_KEY \
     -Ddw.s3SecretKey=$SECRET_KEY \
     -Ddw.s3Bucket=airpal \
     -Ddw.metaStoreConfiguration.connectionUrl=jdbc:mysql://$METASTORE_HOST:3306/metastore \
     -Ddw.metaStoreConfiguration.password=$METASTORE_PASSWORD \
     -Ddw.metaStoreConfiguration.userName=$METASTORE_USER \
     -Duser.timezone=UTC \
     -jar target/airpal-1.0.2-SNAPSHOT.jar server reference.yml 
```

**Note:** I originally tried to just feed the server a reference to the discovery server, so that if the coordinator came and went, the UI would know which server to contact. Apparently, I failed to entirely grasp how to properly set it up, so I usually just use `dw.prestoCoordinator`. `dw.discoveryServer` should either be fixed or removed.
