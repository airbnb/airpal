CREATE TABLE job_tables (
  id INT NOT NULL AUTO_INCREMENT,
  job_id INT NOT NULL,
  table_id INT NOT NULL,

  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX job_tables_join_index
  ON job_tables (job_id, table_id);