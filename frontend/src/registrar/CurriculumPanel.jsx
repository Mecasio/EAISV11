import React, { useState, useEffect, useContext, useRef } from "react";
import { SettingsContext } from "../App";
import axios from "axios";
import { Box, Typography, Snackbar, Alert, Card, Paper, CardContent, TableContainer, Table, TableHead, TableCell, TableRow, TableBody, Switch } from "@mui/material";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";
import API_BASE_URL from "../apiConfig";
import { TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";



const CurriculumPanel = () => {
  const settings = useContext(SettingsContext);

  const [titleColor, setTitleColor] = useState("#000000");
  const [subtitleColor, setSubtitleColor] = useState("#555555");
  const [borderColor, setBorderColor] = useState("#000000");
  const [mainButtonColor, setMainButtonColor] = useState("#1976d2");
  const [subButtonColor, setSubButtonColor] = useState("#ffffff");   // ✅ NEW
  const [stepperColor, setStepperColor] = useState("#000000");       // ✅ NEW

  const [fetchedLogo, setFetchedLogo] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [shortTerm, setShortTerm] = useState("");
  const [campusAddress, setCampusAddress] = useState("");

  useEffect(() => {
    if (!settings) return;

    // 🎨 Colors
    if (settings.title_color) setTitleColor(settings.title_color);
    if (settings.subtitle_color) setSubtitleColor(settings.subtitle_color);
    if (settings.border_color) setBorderColor(settings.border_color);
    if (settings.main_button_color) setMainButtonColor(settings.main_button_color);
    if (settings.sub_button_color) setSubButtonColor(settings.sub_button_color);   // ✅ NEW
    if (settings.stepper_color) setStepperColor(settings.stepper_color);           // ✅ NEW

    // 🏫 Logo
    if (settings.logo_url) {
      setFetchedLogo(`${API_BASE_URL}${settings.logo_url}`);
    } else {
      setFetchedLogo(EaristLogo);
    }

    // 🏷️ School Information
    if (settings.company_name) setCompanyName(settings.company_name);
    if (settings.short_term) setShortTerm(settings.short_term);
    if (settings.campus_address) setCampusAddress(settings.campus_address);

  }, [settings]);

  const [curriculum, setCurriculum] = useState({ year_id: "", program_id: "" });
  const [yearList, setYearList] = useState([]);
  const [programList, setProgramList] = useState([]);
  const [curriculumList, setCurriculumList] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const pageId = 18;

  const [employeeID, setEmployeeID] = useState("");

  useEffect(() => {

    const storedUser = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const storedID = localStorage.getItem("person_id");
    const storedEmployeeID = localStorage.getItem("employee_id");

    if (storedUser && storedRole && storedID) {
      setUser(storedUser);
      setUserRole(storedRole);
      setUserID(storedID);
      setEmployeeID(storedEmployeeID);

      if (storedRole === "registrar") {
        checkAccess(storedEmployeeID);
      } else {
        window.location.href = "/login";
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  const checkAccess = async (employeeID) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/page_access/${employeeID}/${pageId}`);
      if (response.data && response.data.page_privilege === 1) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setHasAccess(false);
      if (error.response && error.response.data.message) {
        console.log(error.response.data.message);
      } else {
        console.log("An unexpected error occurred.");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYear();
    fetchProgram();
    fetchCurriculum();
  }, []);

  const fetchYear = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/year_table`);
      setYearList(res.data);
    } catch (err) {
      console.error(err);
    }
  };



  const fetchProgram = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_program`);
      setProgramList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCurriculum = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_curriculum`);
      setCurriculumList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurriculum((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCurriculum = async () => {
    if (!curriculum.year_id || !selectedCurriculum) {
      setSnackbar({
        open: true,
        message: "Please fill all fields",
        severity: "error",
      });
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/curriculum`, curriculum);
      setCurriculum({ year_id: "", program_id: "" });
      setSnackbar({
        open: true,
        message: "Curriculum successfully added!",
        severity: "success",
      });
      fetchCurriculum();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error adding curriculum!",
        severity: "error",
      });
    }
  };

  // ✅ Updated with instant UI response
  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 1 ? 0 : 1;

    // Instantly update UI
    setCurriculumList((prevList) =>
      prevList.map((item) =>
        item.curriculum_id === id ? { ...item, lock_status: newStatus } : item
      )
    );

    // Show instant feedback
    setSnackbar({
      open: true,
      message: `Curriculum #${id} is now ${newStatus === 1 ? "Active" : "Inactive"
        }`,
      severity: "info",
    });

    try {
      await axios.put(`${API_BASE_URL}/update_curriculum/${id}`, {
        lock_status: newStatus,
      });

      // Confirm success
      setSnackbar({
        open: true,
        message: `Curriculum #${id} successfully set to ${newStatus === 1 ? "Active" : "Inactive"
          }`,
        severity: "success",
      });
    } catch (err) {
      console.error("Error updating status:", err);

      // Revert UI if failed
      setCurriculumList((prevList) =>
        prevList.map((item) =>
          item.curriculum_id === id
            ? { ...item, lock_status: currentStatus }
            : item
        )
      );

      setSnackbar({
        open: true,
        message: "Failed to update curriculum status. Please try again.",
        severity: "error",
      });
    }
  };

  const [searchQuery, setSearchQuery] = useState("");

  const formatAcademicYear = (year) => {
    if (!year) return "";

    const startYear = parseInt(year, 10);
    if (isNaN(startYear)) return year;

    return `${startYear}-${startYear + 1}`;
  };

  const [selectedCurriculum, setSelectedCurriculum] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedAcademicProgram, setSelectedAcademicProgram] = useState("");


  const filteredCurriculumList = curriculumList.filter((item) => {
    // 🔎 SEARCH FILTER
    const words = searchQuery.trim().toLowerCase().split(" ").filter(Boolean);

    const matchesSearch = words.every((word) =>
      String(formatAcademicYear(item.year_description)).toLowerCase().includes(word) ||
      String(item.program_code ?? "").toLowerCase().includes(word) ||
      String(item.program_description ?? "").toLowerCase().includes(word) ||
      String(item.major ?? "").toLowerCase().includes(word)
    );

    if (!matchesSearch) return false;

    // 🏫 CAMPUS FILTER
    if (selectedCampus !== "" && Number(item.components) !== Number(selectedCampus)) {
      return false;
    }

    // 🎓 ACADEMIC PROGRAM FILTER
    if (
      selectedAcademicProgram !== "" &&
      Number(item.academic_program) !== Number(selectedAcademicProgram)
    ) {
      return false;
    }

    return true;
  });


  const formatSchoolYear = (yearDesc) => {
    if (!yearDesc) return "";
    const startYear = Number(yearDesc);
    if (isNaN(startYear)) return yearDesc; // safe fallback
    return `${startYear} - ${startYear + 1}`;
  };


  if (loading || hasAccess === null) {
    return <LoadingOverlay open={loading} message="Loading..." />;
  }

  if (!hasAccess) {
    return <Unauthorized />;
  }

  return (
    <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", paddingRight: 1, backgroundColor: "transparent", mt: 1, padding: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold", color: titleColor, fontSize: "36px", mb: 2 }}
        >
          CURRICULUM PANEL
        </Typography>

        <TextField
          variant="outlined"
          placeholder="Search Year / Program Code / Description / Major"
          size="small"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          sx={{
            width: 460,
            backgroundColor: "#fff",
            borderRadius: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "10px",
            },
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "gray" }} />,
          }}
        />
      </Box>

      <hr style={{ border: "1px solid #ccc", width: "100%" }} />
      <br />

      <TableContainer component={Paper} sx={{ width: '100%', border: `2px solid ${borderColor}`, mb: "40px" }}>
        <Table>
          <TableHead sx={{ backgroundColor: settings?.header_color || "#1976d2", }}>
            <TableRow>
              <TableCell sx={{ color: 'white', textAlign: "Center" }}>Curriculum Panel</TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>


      <Box sx={{ maxHeight: 750, overflowY: "auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",

          }}
        >
          {/* LEFT SECTION */}
          <div
            style={{
              flex: 1,
              padding: "20px",

              backgroundColor: "#fff",
              border: `2px solid ${borderColor}`,
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <Typography variant="h6" gutterBottom textAlign="center" style={{ color: subtitleColor, fontWeight: "bold" }} >
              Add Curriculum
            </Typography>
            {/* Curriculum Year */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontWeight: "bold" }}>Curriculum Year:</label>
              <select
                name="year_id"
                value={curriculum.year_id}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  marginTop: "4px"
                }}
              >
                <option value="">Choose Year</option>
                {yearList.map((year) => (
                  <option key={year.year_id} value={year.year_id}>
                    {formatAcademicYear(year.year_description)}
                  </option>
                ))}
              </select>
            </div>

            {/* Campus */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontWeight: "bold" }}>Select Campus:</label>
              <select
                value={selectedCampus}
                onChange={(e) => {
                  setSelectedCampus(e.target.value);
                  setSelectedAcademicProgram("");
                  setSelectedCurriculum("");
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  marginTop: "4px"
                }}
              >
                <option value="">Choose Campus</option>
                <option value="1">Manila</option>
                <option value="2">Cavite</option>
              </select>
            </div>

            {/* Academic Program */}
            <div style={{ marginBottom: "15px" }}>
              <label style={{ fontWeight: "bold" }}>Academic Program:</label>
              <select
                value={selectedAcademicProgram}
                disabled={!selectedCampus}
                onChange={(e) => {
                  setSelectedAcademicProgram(e.target.value);
                  setSelectedCurriculum("");
                }}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  marginTop: "4px",
                  backgroundColor: !selectedCampus ? "#f5f5f5" : "#fff"
                }}
              >
                <option value="">Select Program</option>
                <option value="0">Undergraduate</option>
                <option value="1">Graduate</option>
                <option value="2">Techvoc</option>
              </select>
            </div>

            {/* Curriculum */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: "bold" }}>Select Curriculum:</label>
              <select
                value={selectedCurriculum}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setSelectedCurriculum(selectedId);

                  const selectedObj = curriculumList.find(
                    (c) => String(c.curriculum_id) === String(selectedId)
                  );

                  if (selectedObj) {
                    setCurriculum((prev) => ({
                      ...prev,
                      program_id: selectedObj.program_id,
                    }));
                  }
                }}

                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  marginTop: "4px"
                }}
              >
                <option value="">None</option>
                {filteredCurriculumList.map((c) => (
                  <option key={c.curriculum_id} value={c.curriculum_id}>
                    {formatSchoolYear(c.year_description)}:{" "}
                    {`(${c.program_code}): ${c.program_description}${c.major ? ` (${c.major})` : ""} (${Number(c.components) === 1
                      ? "Manila Campus"
                      : Number(c.components) === 2
                        ? "Cavite Campus"
                        : "—"
                      })`}
                  </option>
                ))}
              </select>
            </div>

            {/* Insert Button */}
            <button
              onClick={handleAddCurriculum}
              style={{
                width: "100%",
                padding: "10px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Insert
            </button>

          </div>

          {/* RIGHT SECTION */}
          <Card sx={{ border: `2px solid ${borderColor}` }} elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom textAlign="center" style={{ color: subtitleColor, fontWeight: "bold" }} >
                Curriculum List
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{
                        backgroundColor: settings?.header_color || "#1976d2",
                        border: `2px solid ${borderColor}`, textAlign: "center",
                        color: "white",
                      }}>ID</TableCell>
                      <TableCell sx={{
                        backgroundColor: settings?.header_color || "#1976d2",
                        border: `2px solid ${borderColor}`, textAlign: "center",
                        color: "white",
                      }}>Year</TableCell>
                      <TableCell sx={{
                        backgroundColor: settings?.header_color || "#1976d2",
                        border: `2px solid ${borderColor}`, textAlign: "center",
                        color: "white",
                      }}>Program</TableCell>
                      <TableCell sx={{
                        backgroundColor: settings?.header_color || "#1976d2",
                        border: `2px solid ${borderColor}`, textAlign: "center",
                        color: "white",
                      }} align="center">Active</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredCurriculumList.map((item, index) => (
                      <TableRow
                        key={item.curriculum_id}
                        hover
                        sx={{ "&:last-child td": { borderBottom: 0 } }}
                      >
                        <TableCell sx={{ border: `2px solid ${borderColor}` }}> {index + 1}</TableCell>
                        <TableCell sx={{ border: `2px solid ${borderColor}` }}>
                          {formatAcademicYear(item.year_description)}
                        </TableCell >
                        <TableCell sx={{ border: `2px solid ${borderColor}` }}>
                          <Typography fontWeight={500}>
                            {formatSchoolYear(item.year_description)}:{" "}
                            {`(${item.program_code}): ${item.program_description} (${Number(item.components) === 1
                              ? "Manila Campus"
                              : Number(item.components) === 2
                                ? "Cavite Campus"
                                : "—"
                              })`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.major ? ` (${item.major})` : ""}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ border: `2px solid ${borderColor}` }} align="center">
                          <Switch
                            checked={item.lock_status === 1}
                            onChange={() =>
                              handleUpdateStatus(
                                item.curriculum_id,
                                item.lock_status
                              )
                            }
                            color="success"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

        </div>
      </Box>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CurriculumPanel;