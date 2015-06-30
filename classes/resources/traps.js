/*
  This should contain information on all types of traps
*/

var Traps = [
  // Trap list here in json format
  {
	"id": 1,
	"type":"spike",
	"description":"spikes from ground",
	"buy_price":0,
	"sell_price":0,
	"cool_down":0,
	"type":"Offensive",
	"damage":"1.00",
	"ignore_armor":"1",
	"multiple_attacks":"1",
	"bleed_damage":"3",
	"passable": "1",
	"breakable": "0"
  }
];

module.exports = Traps;
