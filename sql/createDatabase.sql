-- -----------------------------------------------------
-- Schema bassetune
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `bassetune` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `bassetune` ;

-- -----------------------------------------------------
-- Table `bassetune`.`br_ability_slots`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`br_ability_slots` (
  `account_id` INT UNSIGNED NOT NULL,
  `slot_id` MEDIUMINT NOT NULL,
  `item_id` MEDIUMINT NOT NULL,
  PRIMARY KEY (`account_id`, `slot_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `bassetune`.`br_account`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`br_account` (
  `account_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(16) NOT NULL,
  `nickname` VARCHAR(16) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` CHAR(64) NOT NULL,
  `date_of_birth` DATETIME NOT NULL,
  `date_of_registration` DATETIME NOT NULL,
  `last_uuid` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`account_id`),
  UNIQUE INDEX `account_id_UNIQUE` (`account_id` ASC) VISIBLE,
  UNIQUE INDEX `username_UNIQUE` (`username` ASC) VISIBLE,
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `last_uuid_UNIQUE` (`last_uuid` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 6
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `bassetune`.`br_friends`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`br_friends` (
  `account_id` INT UNSIGNED NOT NULL,
  `friend_id` INT UNSIGNED NOT NULL,
  `accepted` TINYINT NOT NULL DEFAULT '0',
  PRIMARY KEY (`account_id`, `friend_id`),
  INDEX `account_id_idx` (`account_id` ASC) VISIBLE,
  INDEX `friend_id_idx` (`friend_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `bassetune`.`br_items`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`br_items` (
  `item_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(45) NULL DEFAULT NULL,
  `unlock_price` MEDIUMINT UNSIGNED NOT NULL,
  `required_level` MEDIUMINT UNSIGNED NOT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE INDEX `item_id_UNIQUE` (`item_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `bassetune`.`br_knight_slots`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`br_knight_slots` (
  `account_id` INT UNSIGNED NOT NULL,
  `slot_id` MEDIUMINT NOT NULL,
  `item_id` INT NULL DEFAULT NULL,
  `item_tag` TINYINT NULL DEFAULT NULL,
  PRIMARY KEY (`account_id`, `slot_id`),
  UNIQUE INDEX `slot_id_account_id_UNIQUE` (`account_id` ASC, `slot_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `bassetune`.`br_lord_slots`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`br_lord_slots` (
  `account_id` INT UNSIGNED NOT NULL,
  `dungeon_id` MEDIUMINT NOT NULL,
  `slot_id` MEDIUMINT NOT NULL,
  `item_id` MEDIUMINT NULL DEFAULT NULL,
  PRIMARY KEY (`account_id`, `dungeon_id`, `slot_id`),
  UNIQUE INDEX `account_id_dungeon_id_slot_id UNIQUE` (`account_id` ASC, `dungeon_id` ASC, `slot_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

-- -----------------------------------------------------
-- Table `bassetune`.`br_matches`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`br_matches` (
  `match_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `match_length` INT UNSIGNED NOT NULL,
  `knight_count` TINYINT UNSIGNED NOT NULL,
  `lord_count` TINYINT UNSIGNED NOT NULL,
  `p1_account_id` INT UNSIGNED NULL DEFAULT NULL,
  `p2_account_id` INT UNSIGNED NULL DEFAULT NULL,
  `p3_account_id` INT UNSIGNED NULL DEFAULT NULL,
  `p4_account_id` INT UNSIGNED NULL DEFAULT NULL,
  `isKnightWin` TINYINT UNSIGNED NOT NULL,
  `dungeonCount` TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (`match_id`),
  UNIQUE INDEX `match_id_UNIQUE` (`match_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `bassetune`.`br_player`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`br_player` (
  `account_id` INT UNSIGNED NOT NULL,
  `gold` INT UNSIGNED NOT NULL DEFAULT '1000',
  `lord_level` TINYINT UNSIGNED NOT NULL DEFAULT '1',
  `knight_level` TINYINT UNSIGNED NOT NULL DEFAULT '1',
  `lord_xp` INT UNSIGNED NOT NULL DEFAULT '0',
  `knight_xp` INT UNSIGNED NOT NULL DEFAULT '0',
  `match_wins` INT UNSIGNED NOT NULL DEFAULT '0',
  `match_losses` INT UNSIGNED NOT NULL DEFAULT '0',
  `knight_elo` INT UNSIGNED NULL DEFAULT NULL,
  `lord_elo` INT UNSIGNED NULL DEFAULT NULL,
  `unlocked_dungeons` TINYINT UNSIGNED NOT NULL DEFAULT '1',
  PRIMARY KEY (`account_id`),
  INDEX `playerToAccount_idx` (`account_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `bassetune`.`br_purchases`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`br_purchases` (
  `account_id` INT UNSIGNED NOT NULL,
  `item_id` SMALLINT UNSIGNED NOT NULL,
  `purchase_date` DATETIME NOT NULL,
  PRIMARY KEY (`account_id`, `item_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `bassetune`.`di_abilities`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`di_abilities` (
  `item_id` INT NOT NULL,
  `required_type` VARCHAR(20) NULL DEFAULT NULL,
  `aoe_size` DECIMAL(6,2) NULL DEFAULT NULL,
  `range` DECIMAL(6,2) NOT NULL DEFAULT '2.00',
  `cool_down` DECIMAL(6,2) NOT NULL,
  `cast_time` DECIMAL(6,2) NOT NULL,
  `type` VARCHAR(45) NOT NULL,
  `duration` DECIMAL(6,2) NULL DEFAULT NULL,
  `projectiles` INT NULL DEFAULT NULL,
  `piercing` INT NULL DEFAULT NULL,
  `projectile_speed` DECIMAL(6,2) NULL DEFAULT NULL,
  `range_damage_modifier` DECIMAL(6,2) NULL DEFAULT NULL,
  `damage_modifier` DECIMAL(6,2) NULL DEFAULT NULL,
  `damage` DECIMAL(6,2) NULL DEFAULT NULL,
  `armor` INT NULL DEFAULT NULL,
  `move_distance` INT NULL DEFAULT NULL,
  `ignore_armor` INT NULL DEFAULT NULL,
  `multiple_attacks` INT NULL DEFAULT NULL,
  `bleed_damage` INT NULL DEFAULT NULL,
  `stun` INT NULL DEFAULT NULL,
  `range_modifier` DECIMAL(6,2) NULL DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE INDEX `ability_id_UNIQUE` (`item_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `bassetune`.`di_armor`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`di_armor` (
  `item_id` INT NOT NULL,
  `block` INT NULL DEFAULT NULL,
  `speed_modifier` DECIMAL(6,2) NULL DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE INDEX `item_id_UNIQUE` (`item_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `bassetune`.`di_consumables`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`di_consumables` (
  `item_id` VARCHAR(45) NOT NULL,
  `consume_time` DECIMAL(6,2) NULL DEFAULT '0.00',
  `duration` DECIMAL(6,2) NULL DEFAULT NULL,
  `interrupted_by_stun` INT NULL DEFAULT '0',
  `interrupted_by_damage` INT NULL DEFAULT '0',
  `interrupted_by_ability_use` INT NULL DEFAULT '0',
  `interrupted_by_move` INT NULL DEFAULT '0',
  `purpose` VARCHAR(45) NULL DEFAULT NULL,
  `range` DECIMAL(6,2) NULL DEFAULT NULL,
  `value` INT NULL DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE INDEX `item_id_UNIQUE` (`item_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `bassetune`.`di_equipables`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`di_equipables` (
  `item_id` INT NOT NULL,
  `armor` INT NULL DEFAULT NULL,
  `damage` INT NULL DEFAULT NULL,
  `hp` INT NULL DEFAULT NULL,
  `range` INT NULL DEFAULT NULL,
  `speed` DECIMAL(6,2) NULL DEFAULT NULL,
  `type` VARCHAR(45) NULL DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE INDEX `item_id_UNIQUE` (`item_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


-- -----------------------------------------------------
-- Table `bassetune`.`di_weapons`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bassetune`.`di_weapons` (
  `item_id` INT NOT NULL AUTO_INCREMENT,
  `weapon_type` VARCHAR(45) NULL DEFAULT NULL,
  `damage` INT NOT NULL DEFAULT '0',
  PRIMARY KEY (`item_id`),
  UNIQUE INDEX `weapon_id_UNIQUE` (`item_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;