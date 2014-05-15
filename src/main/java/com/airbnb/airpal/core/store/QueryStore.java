package com.airbnb.airpal.core.store;

import com.airbnb.airpal.api.queries.FeaturedQuery;
import com.airbnb.airpal.api.queries.SavedQuery;
import com.airbnb.airpal.api.queries.UserSavedQuery;
import com.airbnb.airpal.presto.PartitionedTable;
import com.airbnb.airpal.core.AirpalUser;

import java.util.List;
import java.util.UUID;

public interface QueryStore
{
    public List<SavedQuery> getSavedQueries(AirpalUser airpalUser);
    public List<SavedQuery> getSavedQueries(AirpalUser airpalUser, List<PartitionedTable> tables);

    public List<FeaturedQuery> getFeaturedQueries();
    public List<FeaturedQuery> getFeaturedQueries(List<PartitionedTable> tables);

    public boolean saveFeaturedQuery(FeaturedQuery query);
    public boolean saveQuery(UserSavedQuery query);

    public boolean deleteSavedQuery(AirpalUser airpalUser, UUID queryUUID);
    public boolean deleteFeaturedQuery(AirpalUser airpalUser, UUID queryUUID);

    public SavedQuery getSavedQuery(UUID queryUUID);
    public FeaturedQuery getFeaturedQuery(UUID queryUUID);
}
