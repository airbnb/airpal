CREATE TABLE tables (
  id SERIAL,
  connector_id VARCHAR(32) NOT NULL,
  schema_ VARCHAR(64) NOT NULL,
  table_ VARCHAR(128) NOT NULL,
  columns TEXT,

  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX tables_fqn_index
  ON tables (connector_id, schema_, table_);
