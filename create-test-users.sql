-- Create test users for each role
DO $$
BEGIN
  -- Create manager user
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'manager@mssp.local') THEN
    INSERT INTO users (username, email, first_name, last_name, role, auth_provider, is_active, password)
    VALUES ('manager', 'manager@mssp.local', 'Manager', 'User', 'manager', 'local', true, 
            '$2b$10$npwGdgpxeekPykyAqbJmVOVrATjp0d.Qn1YbF5FMCXVN1z0gJNWGy'); -- Password: SecureTestPass123!
  END IF;

  -- Create engineer user
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'engineer@mssp.local') THEN
    INSERT INTO users (username, email, first_name, last_name, role, auth_provider, is_active, password)
    VALUES ('engineer', 'engineer@mssp.local', 'Engineer', 'User', 'engineer', 'local', true, 
            '$2b$10$npwGdgpxeekPykyAqbJmVOVrATjp0d.Qn1YbF5FMCXVN1z0gJNWGy'); -- Password: SecureTestPass123!
  END IF;

  -- Create regular user
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@mssp.local') THEN
    INSERT INTO users (username, email, first_name, last_name, role, auth_provider, is_active, password)
    VALUES ('user', 'user@mssp.local', 'Regular', 'User', 'user', 'local', true, 
            '$2b$10$npwGdgpxeekPykyAqbJmVOVrATjp0d.Qn1YbF5FMCXVN1z0gJNWGy'); -- Password: SecureTestPass123!
  END IF;
END $$;

-- Show all users
SELECT id, username, email, first_name, last_name, role, is_active 
FROM users 
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1
    WHEN 'manager' THEN 2
    WHEN 'engineer' THEN 3
    WHEN 'user' THEN 4
  END; 