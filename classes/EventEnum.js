/*
 Enum of input/output possible events.
 */

exports.input = {
  TALK: 'c',
  LEAVE: 'l',
  MOVE: 'm',

  knight: {
    ABILITY_START: 'as',
    ABILITY_END: 'ae',
    USE_ITEM_START: 'i',
    CHANGE_EQUIPPED: 'ce'
  },

  boss: {
    PUT_TRAP: 'p',
    ABILITY_START: 'bs',
    ABILITY_END: 'be'
  }
};

exports.output = {
  NEW_CHAT_MSG: 'c',
  CHAR_LOCATIONS: 'm',
  CHAR_HP: 'h',
  PLAYER_LEAVES: 'l',
  EFFECT: 'e',
  TRAP_TRIGGERED: 't',
  CHAR_CREATED: 'nc',
  USE_ITEM_END: 'ie',
  USE_ITEM_INTERRUPTED: "ii",
  SERVER: "s"
};