CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    pfp TEXT,
    status TEXT DEFAULT 'offline',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    refresh_token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS room_messages (
    id UUID PRIMARY KEY,
    room_id UUID REFERENCES rooms(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dms (
    id UUID PRIMARY KEY,
    user1 UUID REFERENCES users(id),
    user2 UUID REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS dm_messages (
    id UUID PRIMARY KEY,
    dm_id UUID REFERENCES dms(id),
    sender UUID REFERENCES users(id),
    content TEXT NOT NULL,
    edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    friend_id UUID REFERENCES users(id),
    status TEXT NOT NULL, -- pending, accepted, blocked
    created_at TIMESTAMP DEFAULT NOW()
);
