package com.airbnb.airpal.modules;

import com.airbnb.airlift.http.client.ForQueryInfoClient;
import com.airbnb.airpal.AirpalConfiguration;
import com.airbnb.airpal.api.output.PersistentJobOutputFactory;
import com.airbnb.airpal.api.output.builders.OutputBuilderFactory;
import com.airbnb.airpal.api.output.persistors.CSVPersistorFactory;
import com.airbnb.airpal.api.output.persistors.PersistorFactory;
import com.airbnb.airpal.core.AirpalUserFactory;
import com.airbnb.airpal.core.execution.ExecutionClient;
import com.airbnb.airpal.core.health.PrestoHealthCheck;
import com.airbnb.airpal.core.store.files.ExpiringFileStore;
import com.airbnb.airpal.core.store.history.JobHistoryStore;
import com.airbnb.airpal.core.store.history.JobHistoryStoreDAO;
import com.airbnb.airpal.core.store.jobs.ActiveJobsStore;
import com.airbnb.airpal.core.store.jobs.InMemoryActiveJobsStore;
import com.airbnb.airpal.core.store.queries.QueryStore;
import com.airbnb.airpal.core.store.queries.QueryStoreDAO;
import com.airbnb.airpal.core.store.usage.CachingUsageStore;
import com.airbnb.airpal.core.store.usage.SQLUsageStore;
import com.airbnb.airpal.core.store.usage.UsageStore;
import com.airbnb.airpal.presto.ClientSessionFactory;
import com.airbnb.airpal.presto.ForQueryRunner;
import com.airbnb.airpal.presto.QueryInfoClient;
import com.airbnb.airpal.presto.metadata.ColumnCache;
import com.airbnb.airpal.presto.metadata.PreviewTableCache;
import com.airbnb.airpal.presto.metadata.SchemaCache;
import com.airbnb.airpal.resources.ExecuteResource;
import com.airbnb.airpal.resources.FilesResource;
import com.airbnb.airpal.resources.HealthResource;
import com.airbnb.airpal.resources.PingResource;
import com.airbnb.airpal.resources.QueryResource;
import com.airbnb.airpal.resources.ResultsPreviewResource;
import com.airbnb.airpal.resources.S3FilesResource;
import com.airbnb.airpal.resources.SessionResource;
import com.airbnb.airpal.resources.TablesResource;
import com.airbnb.airpal.resources.sse.SSEEventSourceServlet;
import com.airbnb.airpal.sql.DbType;
import com.airbnb.airpal.sql.beans.TableRow;
import com.airbnb.airpal.sql.jdbi.QueryStoreMapper;
import com.airbnb.airpal.sql.jdbi.URIArgumentFactory;
import com.airbnb.airpal.sql.jdbi.UUIDArgumentFactory;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.auth.InstanceProfileCredentialsProvider;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.AmazonS3EncryptionClient;
import com.amazonaws.services.s3.model.EncryptionMaterialsProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Strings;
import com.google.common.eventbus.AsyncEventBus;
import com.google.common.eventbus.EventBus;
import com.google.inject.AbstractModule;
import com.google.inject.Provider;
import com.google.inject.Provides;
import com.google.inject.Scopes;
import com.google.inject.Singleton;
import com.google.inject.name.Names;
import io.airlift.units.DataSize;
import io.airlift.units.Duration;
import io.dropwizard.jdbi.DBIFactory;
import io.dropwizard.setup.Environment;
import lombok.extern.slf4j.Slf4j;
import okhttp3.OkHttpClient;
import org.apache.shiro.web.env.EnvironmentLoaderListener;
import org.skife.jdbi.v2.DBI;

import javax.annotation.Nullable;
import javax.inject.Named;
import java.net.URI;
import java.util.Collections;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import static com.airbnb.airpal.presto.QueryRunner.QueryRunnerFactory;
import static io.airlift.http.client.HttpClientBinder.httpClientBinder;
import static io.airlift.json.JsonCodec.jsonCodec;

@Slf4j
public class AirpalModule extends AbstractModule
{
    private final AirpalConfiguration config;
    private final Environment environment;

    public AirpalModule(AirpalConfiguration config, Environment environment)
    {
        this.config = config;
        this.environment = environment;
    }

    @Override
    protected void configure()
    {
        bind(TablesResource.class).in(Scopes.SINGLETON);
        bind(ExecuteResource.class).in(Scopes.SINGLETON);
        bind(QueryResource.class).in(Scopes.SINGLETON);
        bind(HealthResource.class).in(Scopes.SINGLETON);
        bind(PingResource.class).in(Scopes.SINGLETON);
        bind(SessionResource.class).in(Scopes.SINGLETON);
        bind(SSEEventSourceServlet.class).in(Scopes.SINGLETON);
        bind(FilesResource.class).in(Scopes.SINGLETON);
        bind(ResultsPreviewResource.class).in(Scopes.SINGLETON);
        bind(S3FilesResource.class).in(Scopes.SINGLETON);

        bind(OkHttpClient.class).annotatedWith(ForQueryInfoClient.class).toInstance(new OkHttpClient());
        bind(OkHttpClient.class).annotatedWith(ForQueryRunner.class).toInstance(new OkHttpClient());

        bind(EnvironmentLoaderListener.class).in(Scopes.SINGLETON);
        bind(String.class).annotatedWith(Names.named("createTableDestinationSchema")).toInstance(config.getCreateTableDestinationSchema());
        bind(String.class).annotatedWith(Names.named("s3Bucket")).toInstance(Strings.nullToEmpty(config.getS3Bucket()));

        bind(PrestoHealthCheck.class).in(Scopes.SINGLETON);
        bind(ExecutionClient.class).in(Scopes.SINGLETON);
        bind(PersistentJobOutputFactory.class).in(Scopes.SINGLETON);

        bind(JobHistoryStore.class).to(JobHistoryStoreDAO.class).in(Scopes.SINGLETON);
    }

    @Singleton
    @Provides
    public DbType provideDbType()
    {
        String driverClass = config.getDataSourceFactory().getDriverClass();
        if (driverClass.equalsIgnoreCase("com.mysql.jdbc.Driver")) {
            return DbType.MySQL;
        }
        else if (driverClass.equalsIgnoreCase("org.h2.Driver")) {
            return DbType.H2;
        }
        else {
            return DbType.Default;
        }
    }

    @Singleton
    @Provides
    public DBI provideDBI(ObjectMapper objectMapper)
            throws ClassNotFoundException
    {
        final DBIFactory factory = new DBIFactory();
        final DBI dbi = factory.build(environment, config.getDataSourceFactory(), provideDbType().name());
        dbi.registerMapper(new TableRow.TableRowMapper(objectMapper));
        dbi.registerMapper(new QueryStoreMapper(objectMapper));
        dbi.registerArgumentFactory(new UUIDArgumentFactory());
        dbi.registerArgumentFactory(new URIArgumentFactory());

        return dbi;
    }

    @Named("coordinator-uri")
    @Provides
    public URI providePrestoCoordinatorURI()
    {
        return config.getPrestoCoordinator();
    }

    @Singleton
    @Named("default-catalog")
    @Provides
    public String provideDefaultCatalog()
    {
        return config.getPrestoCatalog();
    }

    @Provides
    @Singleton
    public ClientSessionFactory provideClientSessionFactory(@Named("coordinator-uri") Provider<URI> uriProvider)
    {
        return new ClientSessionFactory(uriProvider,
                config.getPrestoUser(),
                config.getPrestoSource(),
                config.getPrestoCatalog(),
                config.getPrestoSchema(),
                config.isPrestoDebug(),
                null);
    }

    @Provides
    public QueryRunnerFactory provideQueryRunner(ClientSessionFactory sessionFactory,
            @ForQueryRunner OkHttpClient httpClient)
    {
        return new QueryRunnerFactory(sessionFactory, httpClient);
    }

    @Provides
    public QueryInfoClient provideQueryInfoClient(@ForQueryInfoClient OkHttpClient httpClient)
    {
        return new QueryInfoClient(httpClient);
    }

    @Singleton
    @Provides
    public SchemaCache provideSchemaCache(QueryRunnerFactory queryRunnerFactory,
            @Named("presto") ExecutorService executorService)
    {
        final SchemaCache cache = new SchemaCache(queryRunnerFactory, executorService);
        cache.populateCache(config.getPrestoCatalog());

        return cache;
    }

    @Singleton
    @Provides
    public ColumnCache provideColumnCache(QueryRunnerFactory queryRunnerFactory,
            @Named("presto") ExecutorService executorService)
    {
        return new ColumnCache(queryRunnerFactory,
                new Duration(5, TimeUnit.MINUTES),
                new Duration(60, TimeUnit.MINUTES),
                executorService);
    }

    @Singleton
    @Provides
    public PreviewTableCache providePreviewTableCache(QueryRunnerFactory queryRunnerFactory,
            @Named("presto") ExecutorService executorService)
    {
        return new PreviewTableCache(queryRunnerFactory,
                new Duration(20, TimeUnit.MINUTES),
                executorService,
                100);
    }

    @Singleton
    @Named("event-bus")
    @Provides
    public ExecutorService provideEventBusExecutorService()
    {
        return Executors.newCachedThreadPool(SchemaCache.daemonThreadsNamed("event-bus-%d"));
    }

    @Singleton
    @Named("presto")
    @Provides
    public ExecutorService provideCompleterExecutorService()
    {
        return Executors.newCachedThreadPool(SchemaCache.daemonThreadsNamed("presto-%d"));
    }

    @Singleton
    @Named("hive")
    @Provides
    public ScheduledExecutorService provideTableCacheUpdater()
    {
        return Executors.newSingleThreadScheduledExecutor();
    }

    @Singleton
    @Named("sse")
    @Provides
    public ExecutorService provideSSEExecutorService()
    {
        return Executors.newCachedThreadPool(SchemaCache.daemonThreadsNamed("sse-%d"));
    }

    @Singleton
    @Provides
    public EventBus provideEventBus(@Named("event-bus") ExecutorService executor)
    {
        return new AsyncEventBus(executor);
    }

    @Provides
    @Nullable
    public AWSCredentials provideAWSCredentials()
    {
        if ((config.getS3AccessKey() == null) || (config.getS3SecretKey() == null)) {
            return null;
        }
        else {
            return new BasicAWSCredentials(config.getS3AccessKey(),
                    config.getS3SecretKey());
        }
    }

    @Singleton
    @Provides
    @Nullable
    public AmazonS3 provideAmazonS3Client(@Nullable AWSCredentials awsCredentials, @Nullable EncryptionMaterialsProvider encryptionMaterialsProvider)
    {
        if (awsCredentials == null) {
            if (encryptionMaterialsProvider == null) {
                return new AmazonS3Client(new InstanceProfileCredentialsProvider());
            }
            else {
                return new AmazonS3EncryptionClient(new InstanceProfileCredentialsProvider(), encryptionMaterialsProvider);
            }
        }

        if (encryptionMaterialsProvider == null) {
            return new AmazonS3Client(awsCredentials);
        }
        else {
            return new AmazonS3EncryptionClient(awsCredentials, encryptionMaterialsProvider);
        }
    }

    @Nullable
    @Singleton
    @Provides
    private EncryptionMaterialsProvider provideEncryptionMaterialsProvider()
    {
        String empClassName = config.getS3EncryptionMaterialsProvider();
        if (empClassName != null) {
            try {
                Class<?> empClass = Class.forName(empClassName);
                Object instance = empClass.newInstance();
                if (instance instanceof EncryptionMaterialsProvider) {
                    return (EncryptionMaterialsProvider) instance;
                }
                else {
                    throw new IllegalArgumentException("Class " + empClassName + " must implement EncryptionMaterialsProvider");
                }
            }
            catch (Exception x) {
                throw new RuntimeException("Unable to initialize EncryptionMaterialsProvider class " + empClassName + ": " + x, x);
            }
        }

        return null;
    }

    @Singleton
    @Provides
    public UsageStore provideUsageCache(DBI dbi)
    {
        UsageStore delegate = new SQLUsageStore(config.getUsageWindow(), dbi, provideDbType());

        return new CachingUsageStore(delegate, io.dropwizard.util.Duration.minutes(6));
    }

    @Provides
    public QueryStore provideQueryStore(DBI dbi)
    {
        return dbi.onDemand(QueryStoreDAO.class);
    }

    @Provides
    @Singleton
    public AirpalUserFactory provideAirpalUserFactory()
    {
        return new AirpalUserFactory(config.getPrestoSchema(), org.joda.time.Duration.standardMinutes(15), "default");
    }

    @Provides
    @Singleton
    public ActiveJobsStore provideActiveJobsStore()
    {
        return new InMemoryActiveJobsStore();
    }

    @Provides
    @Singleton
    public ExpiringFileStore provideExpiringFileStore()
    {
        return new ExpiringFileStore(new DataSize(100, DataSize.Unit.MEGABYTE));
    }

    @Provides
    @Singleton
    public CSVPersistorFactory provideCSVPersistorFactory(ExpiringFileStore fileStore, AmazonS3 s3Client, @Named("s3Bucket") String s3Bucket)
    {
        return new CSVPersistorFactory(config.isUseS3(), s3Client, s3Bucket, fileStore, config.isCompressedOutput());
    }

    @Provides
    @Singleton
    public PersistorFactory providePersistorFactory(CSVPersistorFactory csvPersistorFactory)
    {
        return new PersistorFactory(csvPersistorFactory);
    }

    @Provides
    @Singleton
    public OutputBuilderFactory provideOutputBuilderFactory()
    {
        long maxFileSizeInBytes = Math.round(Math.floor(config.getMaxOutputSize().getValue(DataSize.Unit.BYTE)));
        return new OutputBuilderFactory(maxFileSizeInBytes, config.isCompressedOutput());
    }
}
