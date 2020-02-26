/*
 Armor details
 */

var Armor = function () {
    this.equipped = Armor.ArmorTypes.Unarmored;

    this.armorRating = function () {
        switch (this.equipped) {
            case Armor.ArmorTypes.Unarmored:
                return 0;
                break;
            case Armor.ArmorTypes.Light_Armor:
                return 0.1;
                break;
            case Armor.ArmorTypes.Medium_Armor:
                return 0.25;
                break;
            case Armor.ArmorTypes.Heavy_Armor:
                return 0.5;
                break
        }
    };

    this.moveSpeed = function () {
        switch (this.equipped) {
            case Armor.ArmorTypes.Unarmored:
                return Armor.ArmorSpeeds.Very_Fast;
                break;
            case Armor.ArmorTypes.Light_Armor:
                return Armor.ArmorSpeeds.Fast;
                break;
            case Armor.ArmorTypes.Medium_Armor:
                return Armor.ArmorSpeeds.Medium;
                break;
            case Armor.ArmorTypes.Heavy_Armor:
                return Armor.ArmorSpeeds.Slow;
                break
        }
    };
};

Armor.ArmorTypes = {
    Unarmored: 0,
    Light_Armor: 1,
    Medium_Armor: 2,
    Heavy_Armor: 3
};

Armor.ArmorSpeeds = {
    Extremely_Fast: 5,
    Very_Fast: 3.333,
    Fast: 2.5,
    Medium: 2,
    Very_Slow: 1.42,
    Extremely_Slow: 1.25
};

module.exports = Armor;