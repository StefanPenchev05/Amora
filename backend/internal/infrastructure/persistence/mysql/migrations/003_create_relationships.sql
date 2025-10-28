-- Migration: Create relationship tables  
-- Created: 2025-09-30
-- Description: RelationshipInvites, Relationship tables

CREATE TABLE `RelationshipInvites` (
  `id` uuid PRIMARY KEY NOT NULL,
  `inviter_id` uuid NOT NULL,
  `invitee_id` uuid NOT NULL,
  `status` ENUM ('sent', 'accepted', 'declined', 'expired') NOT NULL DEFAULT 'sent',
  `message` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `responded_at` timestamp
);

CREATE TABLE `Relationship` (
  `id` uuid PRIMARY KEY NOT NULL,
  `partner_a_id` uuid NOT NULL COMMENT 'Enforce a != b and a < b in SQL',
  `partner_b_id` uuid NOT NULL COMMENT 'Enforce a != b and a < b in SQL',
  `status` ENUM ('active', 'paused', 'ended') NOT NULL DEFAULT 'active',
  `visibility` ENUM ('private', 'friends', 'public') NOT NULL DEFAULT 'private',
  `title` varchar(255),
  `slug` varchar(255) UNIQUE COMMENT 'Pretty URL (optional)',
  `started_at` timestamp NOT NULL DEFAULT (now()),
  `anniversary_at` date,
  `ended_at` timestamp,
  `avatar_photo_id` uuid,
  `banner_photo_id` uuid,
  `created_by` uuid,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `last_activity_at` timestamp,
  `posts_count` int NOT NULL DEFAULT 0 COMMENT 'Must be >= 0',
  `notes_count` int NOT NULL DEFAULT 0 COMMENT 'Must be >= 0',
  `photos_count` int NOT NULL DEFAULT 0 COMMENT 'Must be >= 0',
  `deleted_at` timestamp,

  -- Relationship constraints
  CHECK (`partner_a_id` != `partner_b_id`),
  CHECK (`partner_a_id` < `partner_b_id`),
  CHECK (`ended_at` IS NULL OR `ended_at` >= `started_at`),
  CHECK (`posts_count` >= 0),
  CHECK (`notes_count` >= 0),
  CHECK (`photos_count` >= 0)
);

ALTER TABLE `RelationshipInvites` ADD FOREIGN KEY (`inviter_id`) REFERENCES `Users` (`id`);
ALTER TABLE `RelationshipInvites` ADD FOREIGN KEY (`invitee_id`) REFERENCES `Users` (`id`);
ALTER TABLE `Relationship` ADD FOREIGN KEY (`partner_a_id`) REFERENCES `Users` (`id`);
ALTER TABLE `Relationship` ADD FOREIGN KEY (`partner_b_id`) REFERENCES `Users` (`id`);