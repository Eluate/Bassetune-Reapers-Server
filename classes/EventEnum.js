/*
 Enum of input/output possible events.
 */

exports.input = {
  TALK: 'c',
  LEAVE: 'l',
  MOVE: 'm',

  knight: {
    USE_ABILITY: 'a',
    USE_ITEM: 'i',
    CHANGE_EQUIPPED: 'ce'
  },

  boss: {
    PUT_TRAP: 'p',
    ABILITY_START: 'u',
    ABILITY_END: 'y'
  }
};

exports.output = {
  NEW_CHAT_MSG: 'c',
  CHAR_LOCATIONS: 'm',
  CHAR_HP: 'h',
  PLAYER_LEAVES: 'l',
  TRAP_TRIGGERED: 't',
  CHAR_CREATED: 'nc'
};