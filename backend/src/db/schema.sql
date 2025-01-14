-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create health check function
CREATE OR REPLACE FUNCTION check_health()
RETURNS JSONB AS $$
BEGIN
    RETURN jsonb_build_object(
        'timestamp', NOW(),
        'status', 'healthy'
    );
END;
$$ LANGUAGE plpgsql;

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('single', 'double', 'suite', 'deluxe')),
    capacity INTEGER NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    amenities TEXT[] NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
    floor INTEGER NOT NULL,
    description TEXT,
    image_url TEXT,
    thumbnail_url TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    view_type VARCHAR(50),
    size_sqm DECIMAL(10,2),
    bed_type VARCHAR(50),
    bathroom_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create guests table
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{
        "room_type": [],
        "special_requests": [],
        "dietary_restrictions": []
    }',
    vip_status BOOLEAN DEFAULT FALSE,
    loyalty_points INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id),
    guest_id UUID NOT NULL REFERENCES guests(id),
    check_in TIMESTAMP WITH TIME ZONE NOT NULL,
    check_out TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'checked_in', 'checked_out', 'cancelled')),
    total_price DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    number_of_guests INTEGER NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    payment_method VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT check_dates CHECK (check_out > check_in)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at
    BEFORE UPDATE ON guests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(type);
CREATE INDEX idx_rooms_price ON rooms(price_per_night);
CREATE INDEX idx_reservations_dates ON reservations(check_in, check_out);
CREATE INDEX idx_reservations_room ON reservations(room_id);
CREATE INDEX idx_reservations_guest ON reservations(guest_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_name ON guests(last_name, first_name);

-- Create function to check room availability
CREATE OR REPLACE FUNCTION check_room_availability(
    room_id UUID,
    check_in_date TIMESTAMP WITH TIME ZONE,
    check_out_date TIMESTAMP WITH TIME ZONE
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM reservations r
        WHERE r.room_id = $1
            AND r.status NOT IN ('cancelled', 'checked_out')
            AND (
                (r.check_in <= $2 AND r.check_out > $2)
                OR (r.check_in < $3 AND r.check_out >= $3)
                OR ($2 <= r.check_in AND $3 >= r.check_out)
            )
    );
END;
$$ LANGUAGE plpgsql; 