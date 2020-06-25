const ReactionRole = require("reaction-role");
const reactionRole = new ReactionRole('Mzg3MjkzMTEzNDcyOTA5MzI0.Xa1r-w.3EIFY2BtdNSn-hvYv4-06bhqmzs');

let option1 = reactionRole.createOption("✅", "725778994477400174");
//let option2 = reactionRole.createOption("spotify:598532266515496970", "604212225493696512", "606046163564494859");
reactionRole.createMessage("725802691212738571", "725779561010167811", true, option1);

reactionRole.init();