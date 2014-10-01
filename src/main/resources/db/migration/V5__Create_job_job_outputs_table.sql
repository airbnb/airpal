CREATE TABLE job_job_outputs (
  id INT NOT NULL AUTO_INCREMENT,
  job_id INT NOT NULL,
  job_output_id INT NOT NULL,

  PRIMARY KEY (id)
);

CREATE UNIQUE INDEX job_outputs_join_index
ON job_job_outputs (job_id, job_output_id);