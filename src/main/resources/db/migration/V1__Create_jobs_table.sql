CREATE TABLE jobs (
  id INT NOT NULL AUTO_INCREMENT,
  query TEXT NOT NULL,
  user VARCHAR(128) NOT NULL,
  uuid VARCHAR(128) NOT NULL,
  queryStats TEXT,
  state ENUM('QUEUED', 'PLANNING', 'STARTING', 'RUNNING', 'FINISHED_EXECUTION', 'FINISHED', 'CANCELED', 'FAILED') NOT NULL,
  /* Stored as JSON? */
  columns TEXT,
  query_finished DATETIME,
  query_started DATETIME,
  error TEXT,

  PRIMARY KEY (id)
);

CREATE INDEX user_jobs_time_index
  ON jobs (user, query_finished, query_started);

CREATE INDEX jobs_time_index
  ON jobs (query_finished, query_started);