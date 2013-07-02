/* Server port */
exports.port = 8080;

/* Buzzers config */
exports.devices = [
    [0x54c, 0x1000]  // older buzzers controller
    ,[0x54c, 0x0002] // new buzzers controller
];
