const reports = require('../models/report');

// Controller to handle fetching reports
async function handleReport(req, res) {
    try {
        // Fetch all fields if isProcessed is true; otherwise, fetch only required fields
        const report = await reports.find({}, 'childname sessionid isProcessed images scores');

        // If no reports found, return a 404 response
        if (!report || report.length === 0) {
            return res.status(404).json({ error: "No reports found." });
        }

        // Group the data by childname
        const groupedReports = report.reduce((acc, curr) => {
            const { childname, sessionid, isProcessed, images ,scores} = curr;

            // Initialize group if it doesn't exist
            if (!acc[childname]) {
                acc[childname] = { childname, sessions: [] };
            }

            // Push session data
            acc[childname].sessions.push(
                isProcessed
                    ? { sessionid, isProcessed, images , scores } // Include all details if processed
                    : { sessionid, isProcessed ,scores} // Include limited details if not processed
            );
            return acc;
        }, {});

        // Send the grouped data as an array to the front-end
        res.status(200).json(Object.values(groupedReports));
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    handleReport,
};
