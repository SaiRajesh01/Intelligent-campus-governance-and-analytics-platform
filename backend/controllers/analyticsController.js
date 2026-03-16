const { getAnalytics } = require("../services/analyticsService");

exports.analyticsSummary = async (req, res) => {

  try {

    const data = await getAnalytics();

    res.json(data);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
}