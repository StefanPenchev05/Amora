-- Migration: Create calendar and events tables
-- Created: 2025-09-30  
-- Description: CalendarEvents, CalendarIntegrations tables

CREATE TABLE `CalendarEvents` (
  `id` uuid PRIMARY KEY NOT NULL,
  `relationship_id` uuid NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` varchar(255),
  `category` ENUM ('lecture', 'appointment', 'date', 'travel', 'celebration', 'health', 'chore', 'occupied', 'other') NOT NULL DEFAULT 'other',
  `start_at` timestamp NOT NULL,
  `end_at` timestamp NOT NULL,
  `all_day` boolean NOT NULL DEFAULT false,
  `timezone` varchar(255) NOT NULL DEFAULT 'UTC',
  `location` varchar(255),
  `color` varchar(255),
  `rrule` varchar(255) COMMENT 'RFC 5545 RRULE, e.g., FREQ=WEEKLY;BYDAY=MO;COUNT=12',
  `rrule_until` timestamp,
  `rrule_exdates` json COMMENT 'ISO dates excluded (list)',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),

  -- Calendar event constraints
  CHECK (`end_at` >= `start_at`),
  CHECK (`rrule_until` IS NULL OR `rrule_until` >= `start_at`)
);

CREATE TABLE `CalendarIntegrations` (
  `id` uuid PRIMARY KEY,
  `relationship_id` uuid NOT NULL,
  `user_id` uuid NOT NULL,
  `provider` varchar(255) NOT NULL,
  `external_calendar_id` varchar(255) NOT NULL,
  `sync_cursor` varchar(255),
  `active` boolean NOT NULL DEFAULT true,
  `connected_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now())
);

-- Add foreign keys
ALTER TABLE `CalendarEvents` ADD FOREIGN KEY (`relationship_id`) REFERENCES `Relationship` (`id`);
ALTER TABLE `CalendarIntegrations` ADD FOREIGN KEY (`relationship_id`) REFERENCES `Relationship` (`id`);
ALTER TABLE `CalendarIntegrations` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);

-- Add indexes for better performance
CREATE INDEX `idx_events_relationship_timerange` ON `CalendarEvents` (`relationship_id`, `start_at`, `end_at`);
CREATE INDEX `idx_events_relationship_category` ON `CalendarEvents` (`relationship_id`, `category`, `start_at`);
CREATE INDEX `idx_events_global_timerange` ON `CalendarEvents` (`start_at`, `end_at`);
CREATE INDEX `idx_integrations_relationship_provider` ON `CalendarIntegrations` (`relationship_id`, `provider`);
CREATE INDEX `idx_integrations_user_provider` ON `CalendarIntegrations` (`user_id`, `provider`);