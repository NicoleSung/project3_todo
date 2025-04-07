-- Users table
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    user_key TEXT NOT NULL,
    default_view TEXT DEFAULT 'day',
    notifications_enabled BOOLEAN DEFAULT 1
);

-- User tasks
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    task_title TEXT NOT NULL,
    task_details TEXT NOT NULL,
    priority_lev INTEGER NOT NULL,
    est_hour INTEGER NOT NULL,
    est_min INTEGER NOT NULL,
    due_dates DATE NOT NULL,
    notification_yes BOOLEAN DEFAULT 0,
    scheduled_time TEXT DEFAULT NULL,
    end_time TEXT DEFAULT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
);


-- INSERT INTO user table
INSERT INTO user (username, user_key)
VALUES (
    'admin',
    'scrypt:32768:8:1$HKBhqnc0Lcdr7fwo$412cb274429101ea5ec6b32c138df0efabca27b1ebad8239d1b911f413a04897cdca4d44b152a5b67037a12ec243e2e33db5676a64085ec0de1793bd6b9e7db7'
);

