-- Removed all pre-saved contracts to start with clean database
-- Only keeping user records for testing email validation
INSERT INTO users (email, name, trusted) VALUES
  ('metanexus@gmail.com', 'Metanexus', TRUE),
  ('freelancer@gmail.com', 'John Freelancer', TRUE),
  ('client@gmail.com', 'Jane Client', TRUE),
  ('jahnetkiminza@gmail.com', 'Jahnet Kiminza', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Create trust scores for users
INSERT INTO trust_scores (user_id, score)
SELECT id, 0.85 FROM users
ON CONFLICT (user_id) DO NOTHING;
