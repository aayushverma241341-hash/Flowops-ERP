const db = require('./config/db');
const { getDashboardStats } = require('./controllers/dashboardController');

const req = {};
const res = {
  json: (data) => {
    console.log("SUCCESS");
    process.exit(0);
  },
  status: (code) => {
    return {
      json: (data) => {
        console.error("FAILED WITH CODE:", code, data);
        process.exit(1);
      }
    };
  }
};

(async () => {
  await getDashboardStats(req, res);
})();
