import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { useNavigate } from "react-router-dom"; 
const ReportsTable = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analyzingSession, setAnalyzingSession] = useState(null);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Fetch reports from the backend
  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:3000/reports");
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Analyze button
  const handleAnalyze = async (childName, sessionId) => {
    setAnalyzingSession(sessionId); // Show loader for the specific session
    try {
      const response = await fetch("http://127.0.0.1:3000/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, childName }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      setModalMessage(`Analysis for session ${sessionId} completed successfully!`);
      setShowModal(true);
      fetchReports(); // Refresh data
    } catch (error) {
      console.error("Error processing analysis:", error);
      setModalMessage(`Failed to process analysis for session ${sessionId}.`);
      setShowModal(true);
    } finally {
      setAnalyzingSession(null); // Remove loader
    }
  };

  // Handle View Reports button
  const handleViewReports = (childName, sessionId, gameScores) => {
    navigate('/child-report', {
      state: { childName, sessionId, gameScores }, // Pass the necessary state
    });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    
    <div className="container my-5">
      <h1 className="text-center mb-4 text-primary">Reports Table</h1>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="table-container" style={{ overflowX: "auto" }}>
          <table className="table table-bordered table-striped table-hover align-middle">
            <thead className="table-primary text-center">
              <tr>
                <th style={{ width: "5%" }}>S.No</th>
                <th style={{ width: "20%" }}>Child Name</th>
                <th style={{ width: "50%" }}>Session IDs</th>
                <th style={{ width: "25%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) =>
                report.sessions.map((session, sessionIndex) => (
                  <tr key={`${report.childname}-${session.sessionid}`}>
                    {sessionIndex === 0 && (
                      <>
                        <td
                          rowSpan={report.sessions.length}
                          className="text-center fw-bold"
                          style={{ verticalAlign: "middle" }}
                        >
                          {index + 1}
                        </td>
                        <td
                          rowSpan={report.sessions.length}
                          className="text-center fw-bold text-capitalize"
                          style={{ verticalAlign: "middle" }}
                        >
                          {report.childname}
                        </td>
                      </>
                    )}
                    <td className="text-center">{session.sessionid}</td>
                    <td className="text-center">
                      {session.isProcessed ? (
                        <button
                          className="btn btn-success btn-sm px-3"
                          onClick={() =>
                            handleViewReports(
                              report.childname,
                              session.sessionid,
                              session.scores
                            )
                          }
                        >
                          View Reports
                        </button>
                      ) : (
                        <button
                          className="btn btn-warning btn-sm px-3"
                          onClick={() =>
                            handleAnalyze(report.childname, session.sessionid)
                          }
                          disabled={analyzingSession === session.sessionid}
                        >
                          {analyzingSession === session.sessionid ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            "Analyze"
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Success/Error Message */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-primary">Message</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>{modalMessage}</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTable;
