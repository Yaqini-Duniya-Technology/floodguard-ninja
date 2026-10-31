BEGIN;
CREATE TABLE IF NOT EXISTS report_coordinates (
 report_id TEXT PRIMARY KEY REFERENCES reports(id) ON DELETE CASCADE,
 latitude DOUBLE PRECISION NOT NULL CHECK(latitude BETWEEN -90 AND 90),
 longitude DOUBLE PRECISION NOT NULL CHECK(longitude BETWEEN -180 AND 180),
 source TEXT NOT NULL CHECK(source IN ('gps','manual')),
 accuracy_m DOUBLE PRECISION CHECK(accuracy_m >= 0),
 consent_at TEXT NOT NULL
);
ALTER TABLE report_coordinates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON report_coordinates FROM PUBLIC, anon, authenticated;
COMMIT;
