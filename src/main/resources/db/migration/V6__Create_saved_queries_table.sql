CREATE TABLE saved_queries (
  id SERIAL,
  query TEXT NOT NULL,
  user VARCHAR(128) NOT NULL,
  description TEXT,
  uuid VARCHAR(128),
  name VARCHAR(256),

  PRIMARY KEY(id)
);

CREATE INDEX saved_queries_user_index
  ON saved_queries (user);
