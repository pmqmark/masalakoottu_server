const cron = require("node-cron");
const { fetchPhonePeTokenFromAPI } = require("../services/pg.service");

const startRefreshPgTokenJob = () => {
    cron.schedule("*/50 * * * *", async () => {
        try {
            await fetchPhonePeTokenFromAPI();
        } catch (error) {
            console.error("Failed to refresh Phonepe token:", error.message)
        }
    })
}

module.exports = { startRefreshPgTokenJob }