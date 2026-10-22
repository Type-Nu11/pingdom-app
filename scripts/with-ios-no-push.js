const { withEntitlementsPlist, withInfoPlist } = require('expo/config-plugins');

// Register before notification plugins so these mods run after their changes.
module.exports = function withIosNoPush(config) {
  config = withEntitlementsPlist(config, (config) => {
    delete config.modResults['aps-environment'];
    return config;
  });

  return withInfoPlist(config, (config) => {
    if (Array.isArray(config.modResults.UIBackgroundModes)) {
      const modes = config.modResults.UIBackgroundModes.filter(
        (mode) => mode !== 'remote-notification',
      );
      if (modes.length) {
        config.modResults.UIBackgroundModes = modes;
      } else {
        delete config.modResults.UIBackgroundModes;
      }
    }
    return config;
  });
};
