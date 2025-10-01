-- Migration: Create users and authentication tables
-- Created: 2025-09-30
-- Description: Users, Credentials, Profile, Sessions, Refresh_Tokens tables

CREATE TABLE `Users` (
  `id` uuid PRIMARY KEY,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `status` ENUM ('active', 'deactivated', 'suspended') NOT NULL DEFAULT 'active'
);

CREATE TABLE `Credentials` (
  `user_id` uuid PRIMARY KEY NOT NULL,
  `email` varchar(255) UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'It will be hashed',
  `username` varchar(255) UNIQUE NOT NULL,
  `email_verified` boolean NOT NULL DEFAULT false,
  `mfa_enabled` boolean NOT NULL DEFAULT false,
  `mfa_secret` varchar(255) DEFAULT null,
  `last_login_at` timestamp DEFAULT null
);

CREATE TABLE `Profile` (
  `user_id` uuid PRIMARY KEY NOT NULL,
  `first_name` varchar(255),
  `last_name` varchar(255),
  `gender` ENUM ('female', 'male', 'something_else', 'prefer_not_to_say') NOT NULL DEFAULT 'prefer_not_to_say',
  `date_of_birth` date,
  `bio` varchar(255),
  `display_name` varchar(255),
  `avatar_photo_id` varchar(255),
  `relationship` uuid,
  `locale` varchar(255) NOT NULL DEFAULT 'en',
  `timezone` varchar(255) NOT NULL DEFAULT 'UTC'
);

CREATE TABLE `Sessions` (
  `id` uuid PRIMARY KEY,
  `user_id` uuid NOT NULL,
  `user_agent` varchar(255),
  `ip_address` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `last_used_at` timestamp NOT NULL DEFAULT (now()),
  `revoked_at` timestamp,
  `token_version` int NOT NULL DEFAULT 0
);

CREATE TABLE `Refresh_Tokens` (
  `id` uuid PRIMARY KEY,
  `session_id` uuid NOT NULL,
  `jti` uuid UNIQUE NOT NULL,
  `family_id` uuid NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `rotated_at` timestamp,
  `revoked_at` timestamp,
  `reason` varchar(255)
);

ALTER TABLE `Credentials` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);
ALTER TABLE `Profile` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);
ALTER TABLE `Sessions` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);
ALTER TABLE `Refresh_Tokens` ADD FOREIGN KEY (`session_id`) REFERENCES `Sessions` (`id`);