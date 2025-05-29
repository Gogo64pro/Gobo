const fs = require('fs')
const path = require('path')
const CONFIG = {
    TARGET_GUILD_ID: '1254738977538310247',
    BOT_CHANNEL_ID: '1376299832934793277',
    KILL_MODE_FILE: path.join(__dirname, 'killmode.json')
};
module.exports = {
    get: () => {
        try {
            return JSON.parse(fs.readFileSync(CONFIG.KILL_MODE_FILE, 'utf8')).enabled || false;
        } catch {
            return false;
        }
    },
    set: (enabled) => {
        fs.writeFileSync(CONFIG.KILL_MODE_FILE, JSON.stringify({ enabled }));
    }
}