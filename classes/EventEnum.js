/*
	Enum of input/output possible events.
*/

exports.input = {
	
	// general
	TALK: 			'c',
	LEAVE:			'e',
	MOVE: 			'm', // RT (knights, creatures, bosses...)

	knight: {
		USE_WEAPON:		'w',
		USE_ABILITY:	'a',
		USE_ITEM: 		'i',
	},
	
	boss: {
		TRIGGER_TRAP:	't',
		PUT_TRAP:		'p',
		SPAWN_CREATURE:	's'
	}
};

exports.output = {
	NEW_CHAT_MSG:		'm',
	CHAR_LOCATIONS:		'l', // RT
	CHAR_DIES:			'd',
	CHAR_INJURED:		'i',
	CHAR_HEALED:		'h',
	PLAYER_LEAVES: 		'e'
};
