-- Truncate existing data
TRUNCATE rooms, guests, reservations CASCADE;

-- Create a temporary table to store room UUIDs
CREATE TEMP TABLE room_ids (
  room_number text PRIMARY KEY,
  uuid uuid DEFAULT gen_random_uuid()
);

INSERT INTO room_ids (room_number) VALUES
('101'), ('102'), ('201'), ('202'), ('301'),
('302'), ('401'), ('402'), ('501'), ('502');

-- Insert 10 rooms with detailed information
INSERT INTO rooms (
  id, number, type, capacity, price_per_night, 
  amenities, status, floor, image_url, thumbnail_url,
  features, view_type, size_sqm, bed_type, bathroom_count,
  description
)
SELECT 
  ri.uuid,
  r.number,
  r.type,
  r.capacity,
  r.price_per_night,
  r.amenities,
  r.status,
  r.floor,
  r.image_url,
  r.thumbnail_url,
  r.features,
  r.view_type,
  r.size_sqm,
  r.bed_type,
  r.bathroom_count,
  r.description
FROM (VALUES
  (
    '101', 'single', 1, 100, 
    ARRAY['WiFi', 'TV', 'Air Conditioning'], 
    'available', 1, 
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=2070', 
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=500',
    ARRAY['Desk', 'Reading Light', 'Blackout Curtains', 'Safe'],
    'City View',
    25.5,
    'Single',
    1,
    'Cozy single room perfect for business travelers'
  ),
  (
    '102', 'double', 2, 150, 
    ARRAY['WiFi', 'TV', 'Mini Bar', 'Air Conditioning'], 
    'available', 1, 
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=2070', 
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=500',
    ARRAY['Work Area', 'Seating Area', 'Coffee Maker', 'Safe', 'USB Ports'],
    'Garden View',
    32.0,
    'Queen',
    1,
    'Comfortable double room with garden views'
  ),
  (
    '201', 'suite', 3, 250, 
    ARRAY['WiFi', 'TV', 'Mini Bar', 'Balcony', 'Air Conditioning'], 
    'available', 2, 
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=2074', 
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=500',
    ARRAY['Living Room', 'Dining Area', 'Kitchenette', 'Work Desk', 'Smart TV', 'Bluetooth Speaker'],
    'City View',
    45.0,
    'King',
    2,
    'Luxurious suite with separate living area'
  ),
  (
    '202', 'deluxe', 4, 300, 
    ARRAY['WiFi', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Air Conditioning'], 
    'available', 2, 
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=2070', 
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=500',
    ARRAY['Living Room', 'Dining Area', 'Full Kitchen', 'Office Space', 'Smart Home Controls', 'Sound System'],
    'Ocean View',
    60.0,
    'California King',
    2,
    'Spacious deluxe room with panoramic ocean views'
  ),
  (
    '301', 'single', 1, 120, 
    ARRAY['WiFi', 'TV', 'City View', 'Air Conditioning'], 
    'available', 3, 
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=2070', 
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=500',
    ARRAY['Ergonomic Chair', 'Desk Lamp', 'Mini Fridge', 'Safe'],
    'City View',
    28.0,
    'Single XL',
    1,
    'Modern single room with city views'
  ),
  (
    '302', 'double', 2, 170, 
    ARRAY['WiFi', 'TV', 'Mini Bar', 'City View', 'Air Conditioning'], 
    'available', 3, 
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=2074', 
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=500',
    ARRAY['Lounge Chair', 'Work Area', 'Coffee Station', 'Safe', 'USB Ports'],
    'City View',
    35.0,
    'Queen',
    1,
    'Elegant double room with stunning city views'
  ),
  (
    '401', 'suite', 3, 280, 
    ARRAY['WiFi', 'TV', 'Mini Bar', 'Balcony', 'City View', 'Air Conditioning'], 
    'available', 4, 
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=2070', 
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=500',
    ARRAY['Living Room', 'Dining Area', 'Kitchenette', 'Office Nook', 'Entertainment System'],
    'City View',
    50.0,
    'King',
    2,
    'Premium suite with spectacular city views'
  ),
  (
    '402', 'deluxe', 4, 350, 
    ARRAY['WiFi', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi', 'City View', 'Air Conditioning'], 
    'available', 4, 
    'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&q=80&w=2074', 
    'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&q=80&w=500',
    ARRAY['Living Room', 'Full Kitchen', 'Dining Room', 'Office', 'Smart TV', 'Sound System', 'Wine Fridge'],
    'Ocean View',
    65.0,
    'California King',
    2,
    'Luxurious deluxe room with premium amenities'
  ),
  (
    '501', 'suite', 3, 300, 
    ARRAY['WiFi', 'TV', 'Mini Bar', 'Balcony', 'Ocean View', 'Air Conditioning'], 
    'available', 5, 
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=2074', 
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=500',
    ARRAY['Living Room', 'Kitchenette', 'Dining Area', 'Work Space', 'Entertainment Center', 'Bluetooth Sound'],
    'Ocean View',
    55.0,
    'King',
    2,
    'Exclusive suite with breathtaking ocean views'
  ),
  (
    '502', 'deluxe', 4, 400, 
    ARRAY['WiFi', 'TV', 'Mini Bar', 'Balcony', 'Jacuzzi', 'Ocean View', 'Air Conditioning'], 
    'available', 5, 
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=2074', 
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=500',
    ARRAY['Living Room', 'Full Kitchen', 'Dining Room', 'Office', 'Smart Home System', 'Premium Sound System', 'Wine Cellar'],
    'Ocean View',
    75.0,
    'California King',
    2,
    'Premium deluxe room with luxury amenities and stunning views'
  )
) as r(
  number, type, capacity, price_per_night, 
  amenities, status, floor, image_url, thumbnail_url,
  features, view_type, size_sqm, bed_type, bathroom_count,
  description
)
JOIN room_ids ri ON ri.room_number = r.number;

-- Insert 50 guests with unique random names
WITH first_names AS (
  SELECT unnest(ARRAY[
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Isabella', 'Mason', 'Sophia', 'William',
    'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander',
    'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'David', 'Sofia', 'Joseph', 'Avery', 'Jackson',
    'Ella', 'Sebastian', 'Scarlett', 'Carter', 'Victoria', 'Owen', 'Madison', 'Wyatt', 'Luna', 'Gabriel',
    'Grace', 'Julian', 'Chloe', 'Leo', 'Penelope', 'Christopher', 'Layla', 'Joshua', 'Riley', 'Andrew'
  ]) AS first_name
),
last_names AS (
  SELECT unnest(ARRAY[
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
  ]) AS last_name
),
shuffled_names AS (
  SELECT 
    first_name,
    last_name,
    row_number() OVER (ORDER BY random()) as rn
  FROM 
    (SELECT first_name FROM first_names ORDER BY random()) f
    CROSS JOIN
    (SELECT last_name FROM last_names ORDER BY random()) l
  LIMIT 50
)
INSERT INTO guests (id, first_name, last_name, email, phone, address)
SELECT 
  gen_random_uuid() as id,
  first_name,
  last_name,
  lower(first_name) || '.' || lower(last_name) || '@email.com' as email,
  '+1' || (floor(random() * 900) + 100)::text || (floor(random() * 900) + 100)::text || (floor(random() * 9000) + 1000)::text as phone,
  floor(random() * 999 + 1)::text || ' ' || 
  (ARRAY['Main', 'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Birch', 'Willow', 'Cherry', 'Spruce'])[floor(random() * 10 + 1)] || ' ' ||
  (ARRAY['Street', 'Avenue', 'Road', 'Boulevard', 'Lane', 'Drive', 'Way', 'Court', 'Circle', 'Place'])[floor(random() * 10 + 1)] as address
FROM shuffled_names;

-- Insert 50 reservations with proper time spacing and logical statuses
WITH dates AS (
  SELECT generate_series(
    current_date - interval '30 days',
    current_date + interval '60 days',
    interval '1 day'
  ) as date
),
time_slots AS (
  SELECT unnest(ARRAY[8,9,10,11,12,13,14,15,16,17]) as hour
),
base_slots AS (
  SELECT 
    date,
    hour,
    date + (hour || ' hours')::interval as check_time
  FROM dates, time_slots
),
reservation_slots AS (
  SELECT 
    base_slots.*,
    (SELECT uuid FROM room_ids ORDER BY random() LIMIT 1) as room_id,
    (SELECT id FROM guests ORDER BY random() LIMIT 1) as guest_id,
    floor(random() * 4 + 1) as number_of_guests,
    CASE 
      -- Past reservations: either checked_out or cancelled
      WHEN check_time < current_timestamp THEN
        CASE WHEN random() < 0.9 THEN 'checked_out' ELSE 'cancelled' END
      -- Current day reservations that started: checked_in
      WHEN date = current_date AND hour <= extract(hour from current_timestamp) THEN
        'checked_in'
      -- Future reservations or current day not started: mostly confirmed, some cancelled
      ELSE
        CASE WHEN random() < 0.9 THEN 'confirmed' ELSE 'cancelled' END
    END as status
  FROM base_slots
),
final_slots AS (
  SELECT 
    *,
    CASE 
      WHEN check_time < current_timestamp THEN
        CASE WHEN status = 'cancelled' THEN 'refunded' ELSE 'paid' END
      ELSE
        CASE WHEN random() < 0.7 THEN 'paid' ELSE 'pending' END
    END as payment_status,
    row_number() over (ORDER BY date, hour) as rn
  FROM reservation_slots
  ORDER BY random()
  LIMIT 50
)
INSERT INTO reservations (
  id, room_id, guest_id, check_in, check_out,
  status, number_of_guests, total_price,
  payment_status, payment_method, special_requests
)
SELECT
  gen_random_uuid() as id,
  room_id,
  guest_id,
  date + (hour || ' hours')::interval as check_in,
  date + ((hour + 3) || ' hours')::interval as check_out,
  status,
  number_of_guests,
  (SELECT price_per_night FROM rooms WHERE id = room_id) * 1 as total_price,
  payment_status,
  'credit_card',
  CASE WHEN random() < 0.3 
    THEN (ARRAY['Early check-in requested', 'Late check-out requested', 'Extra towels needed', 'Room with view preferred', 'Quiet room preferred'])[floor(random() * 5 + 1)]
    ELSE NULL
  END
FROM final_slots;

-- Drop temporary table
DROP TABLE room_ids; 