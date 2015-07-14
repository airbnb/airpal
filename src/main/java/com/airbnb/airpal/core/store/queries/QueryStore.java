package com.airbnb.airpal.core.store.queries;

import com.airbnb.airpal.api.queries.SavedQuery;
import com.airbnb.airpal.api.queries.UserSavedQuery;
import com.airbnb.airpal.core.AirpalUser;
import com.airbnb.airpal.presto.PartitionedTable;

import java.util.List;
import java.util.UUID;

public interface QueryStore
{
    List<SavedQuery> getSavedQueries(AirpalUser airpalUser);
    List<SavedQuery> getSavedQueries(AirpalUser airpalUser, List<PartitionedTable> tables);

    boolean saveQuery(UserSavedQuery query);

    boolean deleteSavedQuery(AirpalUser airpalUser, UUID queryUUID);

    SavedQuery getSavedQuery(UUID queryUUID);
}
