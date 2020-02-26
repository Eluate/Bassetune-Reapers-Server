/*
  This should contain all ability information
*/

var Abilities = [
    // Ability list here in json format
    {
        "id": 1,
        "name": "Bacon Hitter",
        "required_level": "0",
        "required_type": "Sword",
        "aoe_size": 10,
        "range": 2,
        "description": "NULL",
        "buy_price": 1000,
        "sell_price": 1000,
        "cool_down": 0,
        "cast_time": 0,
        "type": "Offensive",
        "duration": 5,
        "projectiles": "2",
        "piercing": "1",
        "projectile_speed": "1.00",
        "range_damage_modifier": "1.00",
        "damage_modifier": "1.00",
        "damage": "0.00",
        "armor": "10",
        "move_distance": "0",
        "ignore_armor": "1",
        "multiple_attacks": "2",
        "bleed_damage": "5",
        "stun": "1",
        "range_modifier": "1"
    },
    {
        "id": 2,
        "name": "Test1",
        "required_level": "1",
        "required_type": "Axe",
        "aoe_size": 1,
        "range": 4,
        "description": "5",
        "buy_price": 6,
        "sell_price": 7,
        "cool_down": 0,
        "cast_time": 0,
        "type": "Defensive",
        "duration": 0,
        "projectiles": "NULL",
        "piercing": "NULL",
        "projectile_speed": "NULL",
        "range_damage_modifier": "NULL",
        "damage_modifier": "NULL",
        "damage": "NULL",
        "armor": "NULL",
        "move_distance": "NULL",
        "ignore_armor": "NULL",
        "multiple_attacks": "NULL",
        "bleed_damage": "NULL",
        "stun": "NULL",
        "range_modifier": "1"
    }
];

module.exports = Abilities;
