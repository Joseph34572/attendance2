// app.js

// ——— AuthSystem ———
class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (!Object.keys(users).length) {
      localStorage.removeItem('currentUser');
      return;
    }
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      const { email } = JSON.parse(saved);
      if (users[email]) {
        this.currentUser = { email };
      } else {
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(email, pw) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email] && users[email].password === pw) {
      this.currentUser = { email };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      return true;
    }
    return false;
  }

  signup(email, pw) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email]) return false;
    users[email] = { password: pw, createdAt: new Date().toISOString() };
    localStorage.setItem('users', JSON.stringify(users));
    this.currentUser = { email };
    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    return true;
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUser = null;
  }
}
const Auth = new AuthSystem();


// ——— SheetManager ———
class SheetManager {
  constructor() {
    this.current = null;
  }

  _key() {
    return `sheets_${Auth.currentUser.email}`;
  }

  all() {
    return JSON.parse(localStorage.getItem(this._key()) || '[]');
  }

  save(arr) {
    localStorage.setItem(this._key(), JSON.stringify(arr));
  }

  create(name) {
    const sheet = {
      id: Date.now().toString(),
      name,
      owner: Auth.currentUser.email,
      createdAt: new Date().toISOString(),
      students: []
    };
    const arr = this.all();
    arr.push(sheet);
    this.save(arr);
    return sheet;
  }

  delete(id) {
    const arr = this.all().filter(s => s.id !== id);
    this.save(arr);
  }

  loadTo(containerSelector) {
    const arr = this.all();
    const container = document.querySelector(containerSelector);
    if (!arr.length) {
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:2rem">
          <h3>No attendance sheets yet</h3>
          <p>Create your first attendance sheet!</p>
        </div>`;
      return;
    }
    container.innerHTML = arr.map(s => `
      <div class="sheet-card">
        <div class="sheet-title">${s.name}</div>
        <div class="sheet-meta">
          Created: ${new Date(s.createdAt).toLocaleDateString()}<br>
          Students: ${s.students.length}
        </div>
        <div class="sheet-actions">
          <button class="btn-small btn-primary" onclick="goSheet('${s.id}')">View</button>
          <button class="btn-small btn-danger" onclick="delSheet('${s.id}')">Delete</button>
        </div>
      </div>`).join('');
  }

  get(id) {
    return this.all().find(s => s.id === id);
  }

  update(sheet) {
    const arr = this.all();
    const idx = arr.findIndex(s => s.id === sheet.id);
    if (idx > -1) {
      arr[idx] = sheet;
      this.save(arr);
    }
  }
}
const Sheet = new SheetManager();


// ——— NFCSystem ———
class NFCSystem {
  async scan() {
    if (!('NDEFReader' in window)) {
      throw new Error('NFC not supported on this device/browser.');
    }
    const reader = new NDEFReader();
    await reader.scan();
    return new Promise((resolve, reject) => {
      reader.onreading = ({ serialNumber }) => resolve(serialNumber);
      reader.onreadingerror = () => reject(new Error('Failed to read NFC card'));
    });
  }
}
const NFC = new NFCSystem();


// ——— ExportSystem ———
class ExportSystem {
  toExcel(sheet) {
    const data = [];
    const dates = new Set();

    sheet.students.forEach(st => {
      Object.keys(st.attendance || {}).forEach(d => dates.add(d));
    });
    const sorted = Array.from(dates).sort();

    data.push(['Name', 'NFC UID', ...sorted.map(d => new Date(d).toLocaleDateString())]);

    sheet.students.forEach(st => {
      data.push([
        st.name,
        st.uid,
        ...sorted.map(d => (st.attendance && st.attendance[d]) ? 'Present' : 'Absent')
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

    const fileName = `${sheet.name.replace(/[^a-z0-9]/gi,'_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
}
const Exporter = new ExportSystem();


// ——— Navigation Helpers ———
function goSheet(id) {
  location.href = `sheet.html?id=${id}`;
}

function delSheet(id) {
  if (confirm('Are you sure you want to delete this sheet?')) {
    Sheet.delete(id);
    Sheet.loadTo('#sheetsContainer');
  }
}
