-- Migration: Create wall posts and media tables
-- Created: 2025-09-30
-- Description: WallPost, WallPostMedia, WallPostMention, WallReaction, WallComment tables  

CREATE TABLE `WallPost` (
  `id` uuid PRIMARY KEY,
  `relationship_id` uuid NOT NULL,
  `author_user_id` uuid NOT NULL,
  `status` ENUM ('published', 'archived', 'deleted') NOT NULL DEFAULT 'published',
  `title` varchar(255),
  `body` text,
  `memory_date` date COMMENT 'When the memory happened (backdating)',
  `location_name` varchar(255),
  `latitude` numeric(9,6),
  `longitude` numeric(9,6),
  `visibility` ENUM ('private', 'friends', 'public') NOT NULL DEFAULT 'private',
  `pinned` boolean NOT NULL DEFAULT false,
  `allow_comments` boolean NOT NULL DEFAULT true,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `comments_count` int NOT NULL DEFAULT 0,
  `reactions_count` int NOT NULL DEFAULT 0,

  -- Post constraints
  CHECK (`comments_count` >= 0),
  CHECK (`reactions_count` >= 0),
  CHECK (`latitude` IS NULL OR (`latitude` >= -90 AND `latitude` <= 90)),
  CHECK (`longitude` IS NULL OR (`longitude` >= -180 AND `longitude` <= 180))
);

CREATE TABLE `WallPostMedia` (
  `id` uuid PRIMARY KEY,
  `post_id` uuid NOT NULL,
  `kind` ENUM ('image', 'video', 'audio', 'file') NOT NULL DEFAULT 'image',
  `storage_key` varchar(255) NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `width` int COMMENT 'Must be > 0 if not null',
  `height` int COMMENT 'Must be > 0 if not null',
  `duration_sec` int COMMENT 'Must be >= 0 if not null',
  `position` int NOT NULL DEFAULT 0 COMMENT 'Must be >= 0',
  `created_at` timestamp NOT NULL DEFAULT (now()),

  -- Media constraints
  CHECK (`width` IS NULL OR `width` > 0),
  CHECK (`height` IS NULL OR `height` > 0),
  CHECK (`duration_sec` IS NULL OR `duration_sec` >= 0),
  CHECK (`position` >= 0)
);

CREATE TABLE `WallPostMention` (
  `id` uuid PRIMARY KEY,
  `post_id` uuid NOT NULL,
  `mentioned_user_id` uuid NOT NULL
);

CREATE TABLE `WallReaction` (
  `post_id` uuid NOT NULL,
  `user_id` uuid NOT NULL,
  `type` ENUM ('like', 'love', 'laugh', 'sad') NOT NULL DEFAULT 'like',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`post_id`, `user_id`)
);

CREATE TABLE `WallComment` (
  `id` uuid PRIMARY KEY,
  `post_id` uuid NOT NULL,
  `author_user_id` uuid NOT NULL,
  `parent_id` uuid,
  `body` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()),
  `deleted_at` timestamp
);

-- Add foreign keys
ALTER TABLE `WallPost` ADD FOREIGN KEY (`relationship_id`) REFERENCES `Relationship` (`id`);
ALTER TABLE `WallPost` ADD FOREIGN KEY (`author_user_id`) REFERENCES `Users` (`id`);

ALTER TABLE `WallPostMedia` ADD FOREIGN KEY (`post_id`) REFERENCES `WallPost` (`id`) ON DELETE CASCADE;

ALTER TABLE `WallPostMention` ADD FOREIGN KEY (`post_id`) REFERENCES `WallPost` (`id`) ON DELETE CASCADE;
ALTER TABLE `WallPostMention` ADD FOREIGN KEY (`mentioned_user_id`) REFERENCES `Users` (`id`);

ALTER TABLE `WallReaction` ADD FOREIGN KEY (`post_id`) REFERENCES `WallPost` (`id`) ON DELETE CASCADE;
ALTER TABLE `WallReaction` ADD FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`);

ALTER TABLE `WallComment` ADD FOREIGN KEY (`post_id`) REFERENCES `WallPost` (`id`) ON DELETE CASCADE;
ALTER TABLE `WallComment` ADD FOREIGN KEY (`author_user_id`) REFERENCES `Users` (`id`);
ALTER TABLE `WallComment` ADD FOREIGN KEY (`parent_id`) REFERENCES `WallComment` (`id`);

-- Add indexes for better performance
CREATE INDEX `idx_posts_relationship_status` ON `WallPost` (`relationship_id`, `status`, `created_at`);
CREATE INDEX `idx_posts_relationship_pinned` ON `WallPost` (`relationship_id`, `pinned`, `created_at`);
CREATE INDEX `idx_posts_relationship_memory` ON `WallPost` (`relationship_id`, `memory_date`);
CREATE INDEX `idx_posts_author` ON `WallPost` (`author_user_id`, `created_at`);

CREATE INDEX `idx_media_post_position` ON `WallPostMedia` (`post_id`, `position`);

CREATE INDEX `idx_mentions_post_user` ON `WallPostMention` (`post_id`, `mentioned_user_id`);

CREATE INDEX `idx_reactions_post_type` ON `WallReaction` (`post_id`, `type`);

CREATE INDEX `idx_comments_post_created` ON `WallComment` (`post_id`, `created_at`);
CREATE INDEX `idx_comments_parent` ON `WallComment` (`parent_id`);
