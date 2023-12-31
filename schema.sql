DROP TABLE IF EXISTS files;

CREATE TABLE files (
  id INTEGER PRIMARY KEY,
  url TEXT not NULL,
  animal TEXT not NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(url)
);
