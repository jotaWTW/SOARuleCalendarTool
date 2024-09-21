import React, { useEffect, useState } from "react";
import { getSOARules } from "./utils/soaRules";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";
import moment from "moment-timezone";
import "./App.css";

function App() {
  const initialSoaListUTC = ["2024-09-09 12:29:30.2960503"];
  const initialSelectedDate = new Date();
  const initialMockToday = new Date();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [soaListUTC, setSoaListUTC] = useState(["2024-09-09 12:29:30.2960503"]);
  const [newSoaDate, setNewSoaDate] = useState("");
  const [result, setResult] = useState(null);
  const [mockToday, setMockToday] = useState(new Date());
  const [payload, setPayload] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleAddSoaDate = () => {
    if (newSoaDate) {
      setSoaListUTC([...soaListUTC, newSoaDate]);
      setNewSoaDate("");
    }
  };

  const handleDeleteSoaDate = (indexToDelete) => {
    const updatedSoaList = soaListUTC.filter(
      (_, index) => index !== indexToDelete
    );
    setSoaListUTC(updatedSoaList);
  };

  const handleEvaluateRules = () => {
    const isPostEnrollException = false;
    const isIFPException = false;
    const isOnChangeMonthEvent = false;

    const soaListUTCConverted = soaListUTC.map((date) =>
      new Date(date).toISOString()
    );

    const payloadData = {
      soaListUTC: soaListUTCConverted,
      selectedDate: selectedDate.toISOString(),
      isPostEnrollException,
      isIFPException,
      isOnChangeMonthEvent,
      mockToday: mockToday.toISOString(),
    };

    // Display the payload
    setPayload(payloadData);

    // Call getSOARules with the actual data
    const result = getSOARules(
      soaListUTCConverted,
      selectedDate,
      isPostEnrollException,
      isIFPException,
      isOnChangeMonthEvent,
      mockToday
    );

    setResult(result);

    setMockToday(result.minDate);
  };

  const handleSetTodayDynamically = (date) => {
    const newToday = moment(date).tz("America/Denver").toDate();
    setMockToday(newToday);
  };

  const getLocalFormattedDateTime = (date) => {
    return new Intl.DateTimeFormat(navigator.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }).format(date);
  };

  const formatDateToLocal = (utcDate) => {
    return getLocalFormattedDateTime(new Date(utcDate));
  };

  const handleReset = () => {
    // Reset all state variables to their initial values
    setSelectedDate(initialSelectedDate);
    setSoaListUTC(initialSoaListUTC);
    setMockToday(initialMockToday);
    setNewSoaDate("");
    setResult(null);
    setPayload(null);
  };

  const emulateGetMemberSoaDates = () => {
    const selectedMembersSOAsUTCFormat = selectedMembersWithUpdatedSOA
    .filter(member => member.recordedAtTimeUtc)
    .map(member => new Date(member.recordedAtTimeUtc).toISOString()); // Keep it in UTC ISO format

    const soaRule = getSOARules(
      selectedMembersSOAsUTCFormat, // SOA Dates in UTC
      stateContext.selectedDate, // Selected date from state
      hasAtLeastOneDateIntoException, // Logic to check for exceptions
      isIFPException(stateContext.selectedProductType) // IFP exception logic
    );

    const todayOrFirstUTC = soaRule.minDate; // This is in UTC already
    const minSOAPlus30Days = new Date(todayOrFirstUTC);
    minSOAPlus30Days.setUTCDate(minSOAPlus30Days.getUTCDate() + 30); // Add 30 days in UTC

  }


  return (
    <div className="container">
      <div className=".left-column">
        <h1>SOA Rule Simulator</h1>

        <div className="simulator">
          {/* Calendar Section */}
          <div className="calendar-section">
            <h2>Select a Date</h2>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              minDate={mockToday} // Setting minDate to dynamically set "Today"
              tileClassName={({ date }) =>
                date.toDateString() === selectedDate.toDateString()
                  ? "highlight-selected"
                  : null
              }
            />
          </div>

          {/* SOA List Section */}
          <div className="soa-list-section">
            <h2>SOA List UTC</h2>
            <ul className="soa-list">
              {soaListUTC.map((date, index) => (
                <li key={index} className="soa-list-item">
                  {formatDateToLocal(date)}
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteSoaDate(index)}
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
            <div className="add-soa">
              <Datetime
                value={newSoaDate}
                onChange={(date) =>
                  setNewSoaDate(moment(date).tz("America/Denver").format())
                }
                // utc={true}
              />
              <button className="add-btn" onClick={handleAddSoaDate}>
                Add SOA Date
              </button>
            </div>
          </div>

          {/* Set Today Dynamically Section */}
          <div className="set-today-section">
            <h2>Set Today's Date Dynamically</h2>
            <p>Current "Today" is: {getLocalFormattedDateTime(mockToday)}</p>
            <Datetime
              value={mockToday}
              onChange={(date) => handleSetTodayDynamically(date)}
              // utc={true}
            />
          </div>
        </div>

        {/* Evaluate Button */}
        <div className="evaluate-section">
          <button className="evaluate-btn" onClick={handleEvaluateRules}>
            Evaluate SOA Rules
          </button>
        </div>

        {/* Reset Button */}
        <div className="reset-section">
          <button className="reset-btn" onClick={handleReset}>
            Reset All
          </button>
        </div>
      </div>
      <div className=".right-column">
        {/* Payload and Result Sections */}
        <div className="results-wrapper">
          {/* Payload Section */}
          {payload && (
            <div className="payload-section">
              <h2>Payload Sent to getSOARules</h2>
              <pre>{JSON.stringify(payload, null, 2)}</pre>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <div className="result-section">
              <h2>Evaluation Result</h2>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
