CREATE TABLE jobs (
  id SERIAL,
  query MEDIUMTEXT NOT NULL,
  user VARCHAR(127) NOT NULL,
  uuid VARCHAR(127) NOT NULL,
  queryStats TEXT,
  state ENUM('QUEUED', 'PLANNING', 'STARTING', 'RUNNING', 'FINISHED_EXECUTION', 'FINISHED', 'CANCELED', 'FAILED') NOT NULL,
  /* Stored as JSON? */
  columns TEXT,
  query_finished DATETIME NOT NULL,
  query_started DATETIME NOT NULL,
  error TEXT,

  PRIMARY KEY (id)
);

CREATE INDEX user_jobs_time_index
  ON jobs (user, query_finished, query_started);

CREATE INDEX jobs_time_index
  ON jobs (query_finished, query_started);
