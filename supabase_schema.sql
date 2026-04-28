-- WPSTS Management Database Schema for Supabase
-- Complete schema matching MongoDB models

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (if any)
-- ============================================
DROP TABLE IF EXISTS attendance_logs CASCADE;
DROP TABLE IF EXISTS attendance_monthly CASCADE;
DROP TABLE IF EXISTS routines CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS works CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- PROFILES TABLE (Users) - Complete Schema
-- ============================================
CREATE TABLE profiles (
    -- Auth fields
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'manager', 'admin', 'super_admin')),
    approved BOOLEAN DEFAULT false,
    firebase_uid TEXT UNIQUE,
    
    -- Photo
    photo_url TEXT,
    
    -- Personal Info
    first_name TEXT,
    last_name TEXT,
    name TEXT,
    nickname TEXT,
    age INTEGER,
    class TEXT CHECK (class IN ('M', 'N')),
    
    -- Address (personal)
    address_house TEXT,
    address_city TEXT,
    address_district TEXT,
    
    -- History - General
    work_age INTEGER DEFAULT 0,
    birth_date DATE,
    
    -- History - Place of Birth
    birth_place_house TEXT,
    birth_place_city TEXT,
    birth_place_district TEXT,
    
    -- History - Personal Details
    race TEXT,
    nationality TEXT,
    tribe TEXT,
    education TEXT,
    
    -- History - Class N (Ordinary/Basic)
    class_n_entry_date DATE,
    class_n_location_house TEXT,
    class_n_location_city TEXT,
    class_n_location_district TEXT,
    class_n_issuer_name TEXT,
    class_n_id_card TEXT,
    class_n_total_work_age INTEGER DEFAULT 0,
    
    -- History - Class M (Monk/Master)
    class_m_entry_date DATE,
    class_m_location_house TEXT,
    class_m_location_city TEXT,
    class_m_location_district TEXT,
    class_m_issuer_name TEXT,
    class_m_id_card TEXT,
    class_m_total_work_age INTEGER DEFAULT 0,
    
    -- Family - Father
    father_first_name TEXT,
    father_last_name TEXT,
    father_age INTEGER,
    father_place_birth_house TEXT,
    father_place_birth_city TEXT,
    father_place_birth_district TEXT,
    father_current_address_house TEXT,
    father_current_address_city TEXT,
    father_current_address_district TEXT,
    
    -- Family - Mother
    mother_first_name TEXT,
    mother_last_name TEXT,
    mother_age INTEGER,
    mother_place_birth_house TEXT,
    mother_place_birth_city TEXT,
    mother_place_birth_district TEXT,
    mother_current_address_house TEXT,
    mother_current_address_city TEXT,
    mother_current_address_district TEXT,
    
    -- Work Info
    skill_level INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Super admins can delete" ON profiles FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- ============================================
-- WORKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS works (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    date DATE,
    start_date DATE,
    start_time TEXT,
    end_time TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
    
    -- Selected participants (array of user IDs)
    participant_ids UUID[] DEFAULT '{}',
    
    -- References
    assignee_id UUID REFERENCES profiles(id),
    created_by UUID REFERENCES profiles(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read works" ON works FOR SELECT USING (true);
CREATE POLICY "Managers can insert works" ON works FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin', 'super_admin'))
);
CREATE POLICY "Managers can update works" ON works FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin', 'super_admin'))
);
CREATE POLICY "Managers can delete works" ON works FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin', 'super_admin'))
);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Manual', 'Forms', 'Policy', 'Reports', 'Others')),
    content TEXT,
    
    -- Document sections (for structured documents)
    sections JSONB DEFAULT '[]',
    
    -- Type: builtin = system document, custom = user created
    type TEXT DEFAULT 'builtin',
    size TEXT,
    file_url TEXT,
    
    created_by_id UUID REFERENCES profiles(id),
    created_by_name TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Admins can insert documents" ON documents FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can update documents" ON documents FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can delete documents" ON documents FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ============================================
-- ROUTINES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS routines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('main', 'sub')),
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read routines" ON routines FOR SELECT USING (true);
CREATE POLICY "Super admins can manage routines" ON routines FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- ============================================
-- ATTENDANCE MONTHLY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_monthly (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    month_key TEXT NOT NULL,
    routine TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    admin_records JSONB DEFAULT '{}',
    merged_records JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(routine, year, month)
);

ALTER TABLE attendance_monthly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read attendance" ON attendance_monthly FOR SELECT USING (true);
CREATE POLICY "Admins can manage attendance" ON attendance_monthly FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ============================================
-- ATTENDANCE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    routine TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    user_id UUID REFERENCES profiles(id),
    day INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    note TEXT,
    admin_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage attendance logs" ON attendance_logs FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_class ON profiles(class);
CREATE INDEX IF NOT EXISTS idx_profiles_work_age ON profiles(work_age);
CREATE INDEX IF NOT EXISTS idx_works_status ON works(status);
CREATE INDEX IF NOT EXISTS idx_works_date ON works(date);
CREATE INDEX IF NOT EXISTS idx_works_assignee ON works(assignee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_monthly_routine_year_month ON attendance_monthly(routine, year, month);
CREATE INDEX IF NOT EXISTS idx_attendance_logs_user_date ON attendance_logs(user_id, year, month);

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_works_updated_at BEFORE UPDATE ON works
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routines_updated_at BEFORE UPDATE ON routines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_monthly_updated_at BEFORE UPDATE ON attendance_monthly
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: Sample Routines
-- ============================================
INSERT INTO routines (id, name, description, type, "order") VALUES
    ('A', 'Morning Roll Call', 'Morning gathering and attendance', 'main', 1),
    ('B', 'Work Assignment', 'การจัดสรรงาน', 'main', 2),
    ('C', 'Skill Training', 'การฝึกอบรมทักษะ', 'main', 3),
    ('D', 'Health Check', 'ตรวจสุขภาพ', 'main', 4),
    ('E', 'Evening Meeting', 'ประชุมยามเย็น', 'main', 5),
    ('F', 'Extra Activity 1', 'กิจกรรมพิเศษ 1', 'sub', 6),
    ('G', 'Extra Activity 2', 'กิจกรรมพิเศษ 2', 'sub', 7)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VIEW: Get complete user profile (for frontend)
-- ============================================
CREATE OR REPLACE VIEW v_user_profiles AS
SELECT 
    id,
    email,
    role,
    approved,
    photo_url,
    first_name,
    last_name,
    name,
    nickname,
    age,
    class,
    skill_level,
    
    -- Personal Address (as JSON)
    jsonb_build_object(
        'house', address_house,
        'city', address_city,
        'district', address_district
    ) AS current_address,
    
    -- History (as JSON)
    jsonb_build_object(
        'workAge', work_age,
        'birthDate', birth_date,
        'placeOfBirth', jsonb_build_object(
            'house', birth_place_house,
            'city', birth_place_city,
            'district', birth_place_district
        ),
        'race', race,
        'nationality', nationality,
        'tribe', tribe,
        'education', education,
        'classN', jsonb_build_object(
            'entryDate', class_n_entry_date,
            'location', jsonb_build_object(
                'house', class_n_location_house,
                'city', class_n_location_city,
                'district', class_n_location_district
            ),
            'issuerName', class_n_issuer_name,
            'idCard', class_n_id_card,
            'totalWorkAge', class_n_total_work_age
        ),
        'classM', jsonb_build_object(
            'entryDate', class_m_entry_date,
            'location', jsonb_build_object(
                'house', class_m_location_house,
                'city', class_m_location_city,
                'district', class_m_location_district
            ),
            'issuerName', class_m_issuer_name,
            'idCard', class_m_id_card,
            'totalWorkAge', class_m_total_work_age
        )
    ) AS history,
    
    -- Family (as JSON)
    jsonb_build_object(
        'father', jsonb_build_object(
            'firstName', father_first_name,
            'lastName', father_last_name,
            'age', father_age,
            'placeOfBirth', jsonb_build_object(
                'house', father_place_birth_house,
                'city', father_place_birth_city,
                'district', father_place_birth_district
            ),
            'currentAddress', jsonb_build_object(
                'house', father_current_address_house,
                'city', father_current_address_city,
                'district', father_current_address_district
            )
        ),
        'mother', jsonb_build_object(
            'firstName', mother_first_name,
            'lastName', mother_last_name,
            'age', mother_age,
            'placeOfBirth', jsonb_build_object(
                'house', mother_place_birth_house,
                'city', mother_place_birth_city,
                'district', mother_place_birth_district
            ),
            'currentAddress', jsonb_build_object(
                'house', mother_current_address_house,
                'city', mother_current_address_city,
                'district', mother_current_address_district
            )
        )
    ) AS family,
    
    -- Work Info (as JSON)
    jsonb_build_object(
        'skillLevel', skill_level
    ) AS work_info,
    
    created_at,
    updated_at
FROM profiles;

-- ============================================
-- FUNCTION: Handle new user signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, role, approved)
    VALUES (NEW.id, NEW.email, 'user', false)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Create trigger in Supabase Dashboard → Database → Triggers
-- Or run: CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();