<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Sheet – NFC Attendance</title>
  <link rel="stylesheet" href="style.css">
</head>
<body class="dashboard">

  <!-- Header -->
  <div class="header">
    <button class="btn-small btn-secondary" onclick="location.href='dashboard.html'">
      ← Dashboard
    </button>
    <div>
      <h1 id="sheetTitle">Attendance Sheet</h1>
      <p id="sheetMeta"></p>
    </div>
    <div>
      <button id="exportBtn" class="btn-small btn-success">📤 Export Excel</button>
      <button id="registerBtn" class="btn-small btn-primary">👤 Register Students</button>
      <button id="takeBtn"     class="btn-small btn-primary">✅ Take Attendance</button>
    </div>
  </div>

  <!-- Attendance Table -->
  <div id="attendanceTableContainer"></div>

  <!-- Libraries and App Code -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
  <script src="app.js"></script>
  <script>
    // 1) Read sheet ID from URL
    const params = new URLSearchParams(location.search);
    const sheetId = params.get('id');

    // 2) Redirect to login if no session
    if (!Auth.currentUser) {
      location.href = 'login.html';
    }

    // 3) Load the sheet object
    const sheet = Sheet.get(sheetId);
    if (!sheet) {
      // invalid ID? back to dashboard
      return location.href = 'dashboard.html';
    }

    // 4) Populate header
    document.getElementById('sheetTitle').textContent = sheet.name;
    document.getElementById('sheetMeta').textContent =
      `Created: ${new Date(sheet.createdAt).toLocaleDateString()} | Students: ${sheet.students.length}`;

    // 5) Render attendance table
    function renderAttendanceTable() {
      const container = document.getElementById('attendanceTableContainer');

      if (!sheet.students.length) {
        container.innerHTML = `
          <div style="text-align:center;padding:2rem;background:white;border-radius:10px">
            <h3>No students registered</h3>
            <p>Register students first to start taking attendance.</p>
          </div>`;
        return;
      }

      // gather all dates
      const dateSet = new Set();
      sheet.students.forEach(st => {
        Object.keys(st.attendance || {}).forEach(d => dateSet.add(d));
      });
      const dates = Array.from(dateSet).sort();

      // header row
      const header = `
        <tr>
          <th>Name</th>
          <th>NFC UID</th>
          ${dates.map(d => `<th>${new Date(d).toLocaleDateString()}</th>`).join('')}
        </tr>`;

      // body rows
      const body = sheet.students.map(st => `
        <tr>
          <td>${st.name}</td>
          <td>${st.uid}</td>
          ${dates.map(d => `
            <td class="attendance-mark">
              <span class="${st.attendance && st.attendance[d] ? 'present' : 'absent'}">
                ${st.attendance && st.attendance[d] ? '✅' : '❌'}
              </span>
            </td>`).join('')}
        </tr>
      `).join('');

      container.innerHTML = `
        <table class="attendance-table">
          <thead>${header}</thead>
          <tbody>${body}</tbody>
        </table>`;
    }

    renderAttendanceTable();

    // 6) Button handlers
    document.getElementById('exportBtn').addEventListener('click', () => {
      Exporter.toExcel(sheet);
    });

    document.getElementById('registerBtn').addEventListener('click', () => {
      location.href = `register.html?id=${sheetId}`;
    });

    document.getElementById('takeBtn').addEventListener('click', () => {
      location.href = `attendance.html?id=${sheetId}`;
    });
  </script>
</body>
</html>
