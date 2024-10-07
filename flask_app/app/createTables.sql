PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Data;
Drop TABLE IF EXISTS Notification;

CREATE TABLE User (
    userID INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT
);

CREATE TABLE Data (
    name TEXT,
    lat TEXT NOT NULL,
    long TEXT NOT NULL,
    cloudCoverage INTEGER,
    startDate TEXT,
    endDate TEXT,
    email TEXT,
    PRIMARY KEY (name, email)
);

CREATE TABLE Notification (
    notifID INTEGER PRIMARY KEY AUTOINCREMENT,
    dataID INTEGER NOT NULL,
    timeNotify TEXT NOT NULL,
    hasNotified INTEGER,
    timeNextPass TEXT,
    type TEXT,
    FOREIGN KEY (dataID) REFERENCES Data(dataID) ON DELETE CASCADE
);
