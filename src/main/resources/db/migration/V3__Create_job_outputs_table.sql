CREATE TABLE job_outputs (
  id SERIAL,
  type VARCHAR(255) NOT NULL,
  description VARCHAR(255),
  location TEXT NOT NULL,
  job_id INT NOT NULL,

  PRIMARY KEY (id)
);

CREATE INDEX job_output_index
ON job_outputs (job_id);
