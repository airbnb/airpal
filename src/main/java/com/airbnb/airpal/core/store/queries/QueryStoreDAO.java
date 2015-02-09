package com.airbnb.airpal.core.store.queries;

import com.airbnb.airpal.api.queries.SavedQuery;
import com.airbnb.airpal.api.queries.UserSavedQuery;
import com.airbnb.airpal.core.AirpalUser;
import com.airbnb.airpal.presto.PartitionedTable;
import com.hubspot.rosetta.jdbi.RosettaBinder;
import org.skife.jdbi.v2.sqlobject.Bind;
import org.skife.jdbi.v2.sqlobject.BindBean;
import org.skife.jdbi.v2.sqlobject.SqlQuery;
import org.skife.jdbi.v2.sqlobject.SqlUpdate;

import java.util.List;
import java.util.UUID;

public abstract class QueryStoreDAO implements QueryStore
{
    @SqlQuery("SELECT * FROM saved_queries WHERE user = :userName")
    @Override
    public abstract List<SavedQuery> getSavedQueries(@BindBean AirpalUser airpalUser);

    @Override
    public List<SavedQuery> getSavedQueries(AirpalUser airpalUser, List<PartitionedTable> tables)
    {
        return null;
    }

    @SqlUpdate(
            "INSERT INTO saved_queries (query, user, description, uuid, name) " +
                    "VALUES (:queryWithPlaceholders, :user, :description, :uuid, :name)")
    public abstract int _saveQuery(@RosettaBinder UserSavedQuery query);

    @Override
    public boolean saveQuery(UserSavedQuery query)
    {
        return _saveQuery(query) > 0;
    }

    @SqlUpdate("DELETE FROM saved_queries WHERE uuid = :queryUuid")
    public abstract int _deleteSavedQuery(AirpalUser airpalUser, @Bind("queryUuid") UUID queryUUID);

    @Override
    public boolean deleteSavedQuery(AirpalUser airpalUser, UUID queryUUID)
    {
        return _deleteSavedQuery(airpalUser, queryUUID) > 0;
    }

    @Override
    @SqlQuery("SELECT * FROM saved_queries WHERE uuid = :queryUuid")
    public abstract SavedQuery getSavedQuery(@Bind("queryUuid") UUID queryUUID);
}
