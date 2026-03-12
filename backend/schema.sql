CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--
-- USERS
--
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    pfp TEXT,
    status TEXT DEFAULT 'offline'
);

--
-- ROOMS
--
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

--
-- ROOM MESSAGES
--
CREATE TABLE IF NOT EXISTS room_messages (
    id UUID PRIMARY KEY,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

--
-- DIRECT MESSAGES
--
CREATE TABLE IF NOT EXISTS dms (
    id UUID PRIMARY KEY,
    user1 UUID REFERENCES users(id),
    user2 UUID REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS dm_messages (
    id UUID PRIMARY KEY,
    dm_id UUID REFERENCES dms(id) ON DELETE CASCADE,
    sender UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

--
-- FRIENDS
--
CREATE TABLE IF NOT EXISTS friends (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    friend_id UUID REFERENCES users(id),
    status TEXT NOT NULL
);
