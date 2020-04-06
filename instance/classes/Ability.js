/*
 Class for the abilities and weapon usage
 */
var Vec2 = require("./Vector2");
var Event = require('./EventEnum');
var SAT = require("sat");
var Effects = require('./Effect');

var Melee = ["axe, sword, dagger, knife, twohandedsword"]; // Add more later
var Ranged = ["bow"]; // Add more later

var Ability = function (abilityInfo) {
    // Set ability info
    this.id = abilityInfo.item_id;
    this.reqType = abilityInfo.required_type;
    this.aoeSize = abilityInfo.aoe_size;
    this.range = abilityInfo.range;
    this.coolDown = abilityInfo.cool_down;
    this.castTime = abilityInfo.cast_time;
    this.type = abilityInfo.type;
    this.numProjectiles = abilityInfo.projectiles;
    this.skewer = abilityInfo.skewer;
    this.damage = abilityInfo.damage;
    this.armor = abilityInfo.armor;
    this.damageModifier = abilityInfo.damage_modifier;
    this.projSpeed = abilityInfo.projectile_speed;
    this.piercing = abilityInfo.piercing;
    this.moveDistance = abilityInfo.move_distance;
    this.numAttacks = abilityInfo.multiple_attacks;
    this.ignoreArmor = abilityInfo.ignore_armor;
    this.bleed = abilityInfo.bleed;
    this.burn = abilityInfo.burn;
    this.stun = abilityInfo.stun;
    this.stagger = abilityInfo.stagger;
    this.halfStagger = abilityInfo.half_stagger;
    this.acid = abilityInfo.acid;
    this.freeze = abilityInfo.freeze;
    this.poison = abilityInfo.poison;

    // The current cooldown
    this.curCoolDown = 0;
};

Ability.prototype.UseKnightAbility = function (data) {
    // Assign variables from data
    var ability = this,
        character = data.character,
        location = data.location,
        characters = data.characters,
        roomID = data.game_uuid,
        target = data.target,
        io = data.io;

    // Select mainhand or offhand weapon
    var weapon = null;
    if (data.weapon == 1) {
        weapon = character.knight.inventory.weapons[1];
    } else {
        weapon = character.knight.inventory.weapons[0];
    }
    if (weapon == null) {
        return;
    }

    // Retrieve weapon data
    weapon = Ability.GetWeaponInfo(weapon[0]);
    if (!weapon) return;

    // Skip if already channelling same ability and weapon
    if (character.channelling == ability) return;

    // Check if weapon matches the required weapon
    if ((weapon.type == "melee" && !Melee.some(function (weaponElement) {
        return weaponElement == weapon.type;
    })) && (weapon.type == "ranged" && !Ranged.some(function (weaponElement) {
        return weaponElement == weapon.type;
    })) && ability.reqType != weapon.type && ability.reqType != null) {
        return;
    }
    // Check is cooldown has finished
    if (new Date().getTime() - ability.curCoolDown < ability.coolDown * 1000) {
        return;
    }
    // Emit the use of the ability
    Ability.EmitKnightUse(character.id, ability.id, target, roomID, io);
    character.channelling = ability;
    // Wait until the cast time is up
    setTimeout(function () {
        // Return if stunned or overridden
        if (character.stunned()) return;
        if (character.channelling != ability) return;
        var Effect = new Effects(data);
        // For offence, target is a position
        if (ability.type == Ability.AbilityType.OFFENSIVE) {
            // The location of the character who cast
            var prevPosition = character.position;
            // Set target as direction
            target = Vec2.sub(target, prevPosition);
            var direction = Vec2.normalise(target);
            // Multiple projectiles (ranged = 999)
            if (ability.range == 999) {
                // Projectile array
                var projectiles = [];
                for (var i = 0; i < ability.numProjectiles; i++) {
                    if (i > ability.numProjectiles / 2) {
                        projectiles.push(Vec2.add(Vec2.setLength({
                            x: direction.x + (i / 5),
                            y: direction.y + (i / 5)
                        }, ability.range + character.rangeModifier), prevPosition));
                    } else if (i < ability.numProjectiles / 2) {
                        projectiles.push(Vec2.add(Vec2.setLength({
                            x: direction.x - (i / 5),
                            y: direction.y - (i / 5)
                        }, ability.range + character.rangeModifier), prevPosition));
                    } else {
                        projectiles.push(Vec2.add(Vec2.setLength(direction, ability.range), prevPosition));
                    }
                }
                // If projectile number is not specified (or 0) create a single straight projectile
                if (!ability.numProjectiles) {
                    projectiles.push(Vec2.add(Vec2.setLength(direction, ability.range), prevPosition));
                }
                // Check for target hits
                projectiles.forEach(function (projectile) {
                    var hitTargets = [];
                    var collisionPoints = [];

                    var p1 = {x: projectile.x + (direction.x * 0.5), y: projectile.y + (direction.y * 0.5)};
                    var p2 = {x: projectile.x - (direction.x * 0.5), y: projectile.y - (direction.y * 0.5)};
                    var t1 = {x: prevPosition.x + (direction.x * 0.5), y: prevPosition.y + (direction.y * 0.5)};
                    var t2 = {x: prevPosition.x - (direction.x * 0.5), y: prevPosition.y - (direction.y * 0.5)};

                    var polygon = new SAT.Polygon(new SAT.Vector(), [new SAT.Vector(p1.x, p1.y), new SAT.Vector(p2.x, p2.y),
                        new SAT.Vector(t2.x, t2.y), new SAT.Vector(t1.x, t1.y)]);

                    for (var i = 0; i < location.map.grid.length; i++) {
                        for (var j = 0; j < location.map.grid[0].length; j++) {
                            if (location.map.grid[i][j] == 0) continue;

                            var wall = {
                                x: i,
                                y: j,
                                r: 0.5
                            };

                            var circle = new SAT.Circle(new SAT.Vector(wall.x, wall.y), wall.r);

                            if (SAT.testPolygonCircle(polygon, circle)) {
                                // Collision occurred
                                collisionPoints.push(wall);
                            }
                        }
                    }

                    for (var i = 0; i < location.characters.length; i++) {
                        var characterPosition = location.characters[i].position;
                        var circle = new SAT.Circle(new SAT.Vector(characterPosition.x, characterPosition.y), 0.7);
                        if (SAT.testPolygonCircle(polygon, circle)) {
                            // Collision occurred
                            hitTargets.push(location.characters[i]);
                        }
                    }

                    // Remove dead characters from selection
                    for (i = 0; i < hitTargets.length; i++) {
                        if (hitTargets[i].dead()) {
                            hitTargets.splice(i, 1);
                            i -= 1;
                        }
                    }

                    // Remove allied characters from selection
                    for (i = 0; i < hitTargets.length; i++) {
                        if (hitTargets[i].type == "knight") {
                            hitTargets.splice(i, 1);
                            i -= 1;
                        }
                    }

                    // Check whether target hit wall or target first
                    for (var j = 0; j < collisionPoints.length; j++) {
                        for (var i = 0; i < hitTargets.length; i++) {
                            if (Vec2.rawDistanceTo({
                                x: collisionPoints[j].x,
                                y: collisionPoints[j].y
                            }, prevPosition) < Vec2.rawDistanceTo(hitTargets[i].position, prevPosition)) {
                                hitTargets.splice(i, 1);
                                i -= 1;
                            }
                        }
                    }

                    // Only use one hitTarget if its not piercing
                    if (!ability.piercing && hitTargets.length > 0) {
                        var closestCharacter = null;
                        var closestDistance = Infinity;
                        // Linear search for closest enemy
                        for (i = 0; i < hitTargets.length; i++) {
                            var distance = Vec2.rawDistanceTo(prevPosition, hitTargets[i].position);
                            if (distance < closestDistance) {
                                closestDistance = distance;
                                closestCharacter = hitTargets[i];
                            }
                        }
                        // Only one target
                        hitTargets = [closestCharacter];
                    }

                    Ability.AttackCharacter(character, hitTargets, ability, weapon, Effect);
                });
                // Reset channelled so that same ability/weapon combo can be used again
                character.channelling = false;
            } else {
                var angleLineCount = -1;
                var angle = ability.aoeSize / 2;
                var targetsHitAlready = [];

                var interval = setInterval(function () {
                    // Return if stunned or overridden
                    if (character.stunned() || character.channelling != ability) {
                        clearInterval(interval);
                        return;
                    }
                    // Increase angle by 10 degrees each time until aoeSize reached
                    angleLineCount += 1;
                    var point = Vec2.circleArcProjection(prevPosition, target, ability.range + character.rangeModifier, angle - (angleLineCount * 10));
                    var hitTargets = [];
                    var collisionPoints = [];
                    // Find HitTargets
                    for (var j = 0; j < location.characters.length; j++) {
                        var newCharacter = location.characters[j];
                        // Broad Phase
                        if (character == newCharacter || Vec2.distanceTo(prevPosition, newCharacter.position) > ability.range + character.rangeModifier) {
                            continue;
                        }
                        // Narrow Phase
                        if (Vec2.lineToCircleCollision({
                            x: newCharacter.position.x,
                            y: newCharacter.position.y,
                            r: 0.5
                        }, prevPosition, point)) {
                            if (!targetsHitAlready.some(function (targetHitAlready) {
                                return targetHitAlready == newCharacter;
                            })) {
                                hitTargets.push(newCharacter);
                            }
                        }
                    }
                    // Find CollisionPoints
                    for (var i = 0; i < location.map.grid.length; i++) {
                        for (var j = 0; j < location.map.grid[0].length; j++) {
                            if (location.map.grid[i][j] == 0) continue;
                            // Broad Phase
                            if (Vec2.distanceTo(prevPosition, {x: i, y: j}) > ability.range + character.rangeModifier) {
                                continue;
                            }
                            // Narrow Phase
                            var wall = {
                                x: i,
                                y: j,
                                r: 0.5
                            };
                            if (Vec2.lineToCircleCollision(wall, prevPosition, point)) {
                                // Collision occurred
                                collisionPoints.push(wall);
                            }
                        }
                    }

                    // Remove dead characters from selection
                    for (var i = 0; i < hitTargets.length; i++) {
                        if (hitTargets[i].dead()) {
                            hitTargets.splice(i, 1);
                            i -= 1;
                        }
                    }

                    // Remove allied characters from selection
                    for (var i = 0; i < hitTargets.length; i++) {
                        if (hitTargets[i].type == "knight") {
                            hitTargets.splice(i, 1);
                            i -= 1;
                        }
                    }

                    // Check whether target hit wall or target first
                    for (var j = 0; j < collisionPoints.length; j++) {
                        for (var i = 0; i < hitTargets.length; i++) {
                            if (Vec2.rawDistanceTo({
                                x: collisionPoints[j].x1 + 0.5,
                                y: collisionPoints[j].y1 + 0.5
                            }, prevPosition) < Vec2.rawDistanceTo(hitTargets[i].position, prevPosition)) {
                                hitTargets.splice(i, 1);
                                i -= 1;
                            }
                        }
                    }

                    // Push any characters which have been attacked to the already attacked array
                    for (var i = 0; i < hitTargets.length; i++) {
                        targetsHitAlready.push(hitTargets[i]);
                    }

                    Ability.AttackCharacter(character, hitTargets, ability, weapon, Effect);
                    if (angleLineCount * 10 >= angle * 2) {
                        // Clear interval when finished
                        clearInterval(interval);
                        // Reset channelled so that same ability/weapon combo can be used again
                        character.channelling = false;
                    }
                }, 100);
            }
        }
        // For defence, target is the position and/or another knight
        else if (ability.type == Ability.AbilityType.DEFENSIVE) {
            /*
            // Increase armor
            if (ability.hasOwnProperty("armor")) {
                // Add to blocking power
                target.blockArmor += ability.armor;
                // Remove armor after duration finishes
                setTimeout(function () {
                    target.blockArmor -= ability.armor;
                }, this.duration * 1000);
            }
            // Dodge
            if (ability.hasOwnProperty("moveDistance") && target.hasOwnProperty("x") && target.hasOwnProperty("y")) {
                var characterLocation = character.position;
                var newLocation = characterLocation.add(Vec2.setLength({
                    x: target.x,
                    y: target.y
                }, ability.moveDistance));
                // Update new location
                character.position = newLocation;
            }
            */
        }
        // Set the new cooldown
        ability.curCoolDown = new Date().getTime();
    }, ability.castTime * 1000);
    Ability.EmitKnightFinish(character.id, ability.id, roomID, io);
};

Ability.AttackCharacter = function (character, hitTargets, ability, weapon, Effect) {
    // Apply offensive loop for hit targets
    for (var i = 0; i < hitTargets.length; i++) {
        var hitCharacter = hitTargets[i];
        // Damage
        if (ability.hasOwnProperty("damage")) {
            var totalDamage = ability.damage + (weapon.damage * ability.damageModifier);
            // Check if ability should ignore armor
            if (!ability.ignoreArmor) {
                totalDamage -= hitCharacter.blockArmor;
            }
            // Damage taken by must be at least 1 and most 18000
            hitCharacter.hp -= Math.max(1, Math.min(totalDamage, 18000));
        }
        // Bleed
        if (ability.hasOwnProperty("bleed") && ability.bleed > 0) {
            Effect.Bleed(hitCharacter);
        }
        // Stun
        if (ability.hasOwnProperty("stun") && ability.stun > 0) {
            Effect.Stun(hitCharacter);
        }
        // Stagger
        if (ability.hasOwnProperty("stagger") && ability.stagger > 0) {
            Effect.Stagger(hitCharacter);
        }
        // Half-Stagger
        if (ability.hasOwnProperty("halfStagger") && ability.halfStagger > 0) {
            Effect.Half_Stagger(hitCharacter);
        }
        // Burn
        if (ability.hasOwnProperty("burn") && ability.burn > 0) {
            Effect.Burn(hitCharacter);
        }
        // Acid
        if (ability.hasOwnProperty("acid") && ability.acid > 0) {
            Effect.Acid(hitCharacter);
        }
        // Freeze
        if (ability.hasOwnProperty("freeze") && ability.freeze > 0) {
            Effect.Freeze(hitCharacter);
        }
        // Poison
        if (ability.hasOwnProperty("poison") && ability.poison > 0) {
            Effect.Poison(hitCharacter);
        }
    }
};

Ability.AbilityType = {
    OFFENSIVE: "offensive",
    DEFENSIVE: "defensive"
};

Ability.GetWeaponInfo = function (entityID) {
    var weapons = require('./resources/weapons');

    var weapon = null;
    for (var n = 0; n < weapons.length; n++) {
        if (weapons[n].item_id == entityID) {
            weapon = weapons[n];
        }
    }

    if (weapon !== null)
    return {
        type: weapon.weapon_type,
        damage: weapon.damage
    };
};

Ability.Effect = function (abilityID, characterID, positive, type, roomID, io) {
    io.to(roomID).emit(Event.output.EFFECT, {"a": abilityID, "c": characterID, "t": type});
};

Ability.EffectTypes = {
    IncreasedRange: "I_Range",
    DecreasedRange: "D_Range",
    Regeneration: "Regen",
    Bleed: "Bleed",
    Stun: "Stun"
};

Ability.AttackSpeeds = {
    ExtremelyFast: 100,
    VeryFast: 300,
    Fast: 600,
    Medium: 1000,
    Slow: 2000,
    VerySlow: 3000,
    ExtremelySlow: 5000
};

Ability.EmitKnightUse = function (characterID, abilityID, target, roomID, io) {
    io.to(roomID).emit(Event.input.knight.ABILITY_START, {"i": characterID, "a": abilityID, "t": target});
};

Ability.EmitKnightFinish = function (characterID, abilityID, roomID, io) {
    io.to(roomID).emit(Event.input.knight.ABILITY_END, {"i": characterID, "a": abilityID});
};

Ability.EmitBossUse = function (characterID, abilityID, roomID, io) {
    io.to(roomID).emit(Event.input.boss.ABILITY_START, {"i": characterID, "a": abilityID});
};

Ability.EmitBossFinish = function (characterID, abilityID, roomID, io) {
    io.to(roomID).emit(Event.input.boss.ABILITY_END, {"i": characterID, "a": abilityID});
};

module.exports = Ability;