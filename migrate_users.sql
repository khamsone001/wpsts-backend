-- Import MongoDB users to Supabase
-- ใส่ข้อมูล users จาก MongoDB ลงใน Supabase

-- หมายเหตุ: 
-- 1. Supabase Auth จะสร้าง user แยกต่างหาก - ต้อง import ไปที่ auth.users ก่อน
-- 2. profiles table จะเก็บข้อมูลเพิ่มเติม

-- ตัวอย่างการ import ข้อมูล user แต่ละคน:

-- User 1: khamsone2200000@gmail.com (super_admin)
INSERT INTO profiles (
    id, -- ใช้ UUID ที่ generate จาก Supabase Auth
    email,
    password,
    role,
    approved,
    photo_url,
    first_name,
    last_name,
    name,
    nickname,
    age,
    class,
    address_house,
    address_city,
    address_district,
    work_age,
    birth_date,
    birth_place_house,
    birth_place_city,
    birth_place_district,
    race,
    nationality,
    tribe,
    education,
    skill_level,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(), -- หรือใช้ ID จริงจาก Supabase Auth
    'khamsone2200000@gmail.com',
    '$2b$10$X811hcEmX3XwDx1f1zq1EOmXm5OZAQ/oDNshRMEpJ4lNSlLnehYy2',
    'super_admin',
    true,
    'https://res.cloudinary.com/dmnkquwi3/image/upload/v1764414436/wpsts_profiles/r3xnshfdmhliznn91qgl.jpg',
    'ຄູບາ ສອນ',
    'ຍົດວິລະສັກ',
    'ຄູບາ ສອນ ຍົດວິລະສັກ',
    'ຄູບາສອນ',
    25,
    'M',
    'ດອນໜູນ',
    'ໄຊທານີ',
    'ນະຄອນຫໍວງວຽງຈັນ',
    5,
    '2000-03-02',
    'ກຸດແຄນ',
    'ອາດສະພອນ',
    'ສະຫວັນນະເຂດ',
    'ລາວ',
    'ລາວ',
    'ຜູ້ໄທ',
    'ປະລິນຍາຕີ',
    80,
    '2025-11-27 17:37:26',
    '2025-12-15 07:49:59'
);

-- User 2: AJkhamsouk@gmail.com (manager)
INSERT INTO profiles (
    email,
    password,
    role,
    approved,
    photo_url,
    first_name,
    last_name,
    name,
    nickname,
    age,
    class,
    work_age,
    skill_level,
    class_n_entry_date,
    class_m_entry_date,
    created_at,
    updated_at
) VALUES (
    'AJkhamsouk@gmail.com',
    '$2b$10$fQSVQq8xeM7u9V/KLc3Zi.ltIZ034w2ucW/4bY5YdjqajUvpHf9AS',
    'manager',
    true,
    'https://res.cloudinary.com/dmnkquwi3/image/upload/v1764491878/wpsts_profiles/nkoa8m6kecqheye8oab9.png',
    'ພຣະອາຈາຣຍ໌ ຄຳສຸກ',
    'ທອງຈຳປາ',
    'ພຣະອາຈາຣຍ໌ ຄຳສຸກ ທອງຈຳປາ',
    'ຍາທ່ານສຸກ',
    53,
    'M',
    30,
    100,
    '2025-11-30',
    '2025-11-30',
    '2025-11-28 01:49:01',
    '2025-12-19 03:50:45'
);

-- User 3: khran@gmail.com (user)
INSERT INTO profiles (
    email,
    password,
    role,
    approved,
    photo_url,
    first_name,
    last_name,
    name,
    nickname,
    age,
    class,
    work_age,
    skill_level,
    created_at,
    updated_at
) VALUES (
    'khran@gmail.com',
    '$2b$10$0OZLXMA/1A8mLsGrpI4tBuqXrATj3bSZfCmVcbws7QiFxwj3fc6Re',
    'user',
    true,
    'https://res.cloudinary.com/dmnkquwi3/image/upload/v1765777759/wpsts_profiles/zvw5w0mk59gc9gq3dtyo.jpg',
    'ຄູບາ ຄານ',
    'ດວງພະຈັນ',
    'ຄູບາ ຄານ ດວງພະຈັນ',
    'ຄູບາຄານ',
    27,
    'M',
    4,
    85,
    '2025-11-28 08:49:01',
    '2025-12-15 06:41:48'
);

-- เพิ่ม user ที่เหลือที่นี่...
-- format:
-- INSERT INTO profiles (email, password, role, approved, first_name, last_name, name, nickname, age, class, work_age, skill_level) VALUES (...);