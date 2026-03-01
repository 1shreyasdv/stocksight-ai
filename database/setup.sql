-- ============================================================
-- SETUP.SQL — Run this in MySQL Workbench to create database
--
-- HOW TO USE:
-- 1. Open MySQL Workbench
-- 2. Click the SQL+ button (new query tab)
-- 3. Copy paste ALL of this file
-- 4. Press Ctrl+Shift+Enter to run everything
-- ============================================================

-- Create the database
CREATE DATABASE IF NOT EXISTS stocksight;

-- Switch to using this database
USE stocksight;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    email            VARCHAR(255) UNIQUE NOT NULL,
    hashed_password  VARCHAR(255) NOT NULL,
    full_name        VARCHAR(255),
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist Table
CREATE TABLE IF NOT EXISTS watchlist (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    user_id   INT NOT NULL,
    ticker    VARCHAR(10) NOT NULL,
    added_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Portfolio Positions Table
CREATE TABLE IF NOT EXISTS portfolio_positions (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT NOT NULL,
    ticker         VARCHAR(10) NOT NULL,
    quantity       DECIMAL(12,4) NOT NULL,
    avg_buy_price  DECIMAL(12,4) NOT NULL,
    buy_date       VARCHAR(20) NOT NULL,
    notes          TEXT,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Prediction Cache Table
CREATE TABLE IF NOT EXISTS prediction_cache (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    ticker           VARCHAR(10) NOT NULL,
    model_name       VARCHAR(50) NOT NULL,
    prediction_json  LONGTEXT NOT NULL,
    accuracy_metrics TEXT,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at       DATETIME NOT NULL
);

-- Sentiment Cache Table
CREATE TABLE IF NOT EXISTS sentiment_cache (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    ticker          VARCHAR(10) NOT NULL,
    sentiment_data  LONGTEXT NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at      DATETIME NOT NULL
);

-- Confirm it worked
SELECT 'Database and tables created successfully!' AS message;
SHOW TABLES;