-- Migration: Create notes and mood tracking tables
-- Created: 2025-09-30
-- Description: CoupleNote, MoodCheck tables

CREATE TABLE `CoupleNote` (
  `id` uuid PRIMARY KEY,
  `relationship_id` uuid NOT NULL,
  `author_user_id` uuid NOT NULL,
  `title` varchar(255),
  `pinned` boolean NOT NULL DEFAULT false,
  `color` varchar(255) COMMENT 'UI accent hex (optional)',
  `last_edited_by` uuid,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `MoodCheck` (
  `id` uuid PRIMARY KEY,
  `relationship_id` uuid NOT NULL,
  `user_id` uuid NOT NULL,
  `score` int NOT NULL COMMENT '1-5 range (1=very low, 5=very high). Add CHECK constraint in SQL',
  `note` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT (now()),

  -- Mood constraints
  CHECK (`score` >= 1 AND `score` <= 5)
);

-- Add foreign keys
ALTER TABLE `CoupleNote` ADD FOREIGN KEY (`relationship_id`) REFERENCES `Relationship` (`id`);
ALTER TABLE `CoupleNote` ADD FOREIGN KEY (`author_user_id`) REFERENCES `Users` (`id`);
ALTER TABLE `CoupleNote` ADD FOREIGN KEY (`last_edited_by`) REFERENCES `Users` (`id`);

ALTER TABLE `MoodCheck` ADD FOREIGN KEY (`relationship_id`) REFERENCES `Relationship` (`id`);
ALTER TABLE `MoodCheck` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);

-- Add indexes for better performance
CREATE INDEX `idx_notes_relationship_pinned` ON `CoupleNote` (`relationship_id`, `pinned`);
CREATE INDEX `idx_notes_relationship_updated` ON `CoupleNote` (`relationship_id`, `updated_at`);
CREATE INDEX `idx_notes_relationship` ON `CoupleNote` (`relationship_id`);

CREATE INDEX `idx_mood_relationship_time` ON `MoodCheck` (`relationship_id`, `created_at`);
CREATE INDEX `idx_mood_user_time` ON `MoodCheck` (`user_id`, `created_at`);
CREATE INDEX `idx_mood_user_relationship` ON `MoodCheck` (`relationship_id`, `user_id`, `created_at`);
CREATE INDEX `idx_mood_global_time` ON `MoodCheck` (`created_at`);