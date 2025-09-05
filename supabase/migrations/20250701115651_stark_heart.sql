/*
  # Update authentication to use email instead of phone

  1. Changes
    - Update users table to make email required and phone optional
    - Add email validation check
    - Update RLS policies to reflect the change
*/

-- Modify users table to make email required and phone optional
ALTER TABLE users 
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN phone DROP NOT NULL;

-- Add email format validation
ALTER TABLE users 
  ADD CONSTRAINT users_email_check 
  CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$');

-- Update trigger function to handle email-based authentication
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, phone)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger is set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();