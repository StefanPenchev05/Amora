-- Migration: Create user-centric app features tables
-- Created: 2025-01-XX
-- Description: Events, Moods, Notes, Memories, Expenses tables for individual users

CREATE TABLE IF NOT EXISTS `events` (
  `id` char(36) PRIMARY KEY,
  `user_id` char(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` varchar(1000),
  `category` varchar(50) NOT NULL,
  `event_date` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_events_user` (`user_id`),
  INDEX `idx_events_user_date` (`user_id`, `event_date`),
  INDEX `idx_events_category` (`category`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `moods` (
  `id` char(36) PRIMARY KEY,
  `user_id` char(36) NOT NULL,
  `level` int NOT NULL CHECK (`level` BETWEEN 1 AND 5),
  `note` varchar(500),
  `mood_date` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_moods_user` (`user_id`),
  INDEX `idx_moods_user_date` (`user_id`, `mood_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `notes` (
  `id` char(36) PRIMARY KEY,
  `user_id` char(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` varchar(5000),
  `color` varchar(20) NOT NULL DEFAULT 'default',
  `is_pinned` boolean NOT NULL DEFAULT false,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_notes_user` (`user_id`),
  INDEX `idx_notes_user_pinned` (`user_id`, `is_pinned`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `memories` (
  `id` char(36) PRIMARY KEY,
  `user_id` char(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` varchar(1000),
  `category` varchar(50) NOT NULL,
  `photo_url` varchar(500),
  `memory_date` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_memories_user` (`user_id`),
  INDEX `idx_memories_user_category` (`user_id`, `category`),
  INDEX `idx_memories_user_date` (`user_id`, `memory_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `expenses` (
  `id` char(36) PRIMARY KEY,
  `user_id` char(36) NOT NULL,
  `amount` decimal(10, 2) NOT NULL,
  `description` varchar(200) NOT NULL,
  `category` varchar(50) NOT NULL,
  `paid_by` varchar(20) NOT NULL,
  `is_settled` boolean NOT NULL DEFAULT false,
  `expense_date` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_expenses_user` (`user_id`),
  INDEX `idx_expenses_user_date` (`user_id`, `expense_date`),
  INDEX `idx_expenses_user_settled` (`user_id`, `is_settled`),
  INDEX `idx_expenses_category` (`category`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
