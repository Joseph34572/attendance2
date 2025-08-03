// — Shared app.js for all pages —

// --- AuthSystem ---
class AuthSystem {
  constructor() {
    this.currentUser = null;
    this.init();
  }
  init() {
    const users = JSON.parse(localStorage.getItem('users')||'{}');
    if (!Object.keys(users).length) {
      localStorage.removeItem('currentUser');
      return;
    }
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      const { email } = JSON.parse(saved);
      if (users[email]) {
        this.currentUser = { email };
      } else localStorage.removeItem('currentUser');
    }
  }
  login(email, pw) {
    const u = JSON.parse(localStorage.getItem('users')||'{}');
    if (u[email] && u[email].password === pw) {
      this.currentUser = { email };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      return true;
    }
    return false;
  }
  signup(email, pw) {
    const u = JSON.parse(localStorage.getItem('users')||'{}');
    if (u[email]) return false;
    u[email] = { password: pw, createdAt: new Date().toISOString() };
    localStorage.setItem('users', JSON.stringify(u));
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

// --- SheetManager ---
class SheetManager {
  constructor() { this.current = null; }
  _key() { return `sheets_${Auth.currentUser.email}`; }
  all()     { return JSON.parse(localStorage.getItem(this._key())||'[]'); }
  save(s)   { localStorage.setItem(this._key(), JSON.stringify(s)); }
  create(name) {
    const s = { id:Date.now().toString(), name, owner:Auth.currentUser.email,
      createdAt:new Date().toISOString(), students:[] };
    const arr = this.all(); arr.push(s); this.save(arr);
    return s;
  }
  delete(id) {
    const arr = this.all().filter(x=>x.id!==id);
    this.save(arr);
  }
  loadTo(container) {
    const arr = this.all(), c = document.querySelector(container);
    if (!arr.length) return c.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:2rem">
      <h3>No attendance sheets yet</h3><p>Create your first attendance sheet!</p></div>`;
    c.innerHTML = arr.map(s=>`
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
      </div>
    `).join('');
  }
  get(id) {
    return this.all().find(x=>x.id===id);
  }
  update(sheet) {
    const arr = this.all(), i = arr.findIndex(x=>x.id===sheet.id);
    if (i>-1) { arr[i] = sheet; this.save(arr); }
  }
}
const Sheet = new SheetManager();

// --- NFCSystem ---
class NFCSystem {
  async scan() {
    if (!('NDEFReader' in window)) {
      return new Promise(r => setTimeout(()=>r(
        'DEMO'+Math.random().toString(36).substr(2,8).toUpperCase()
      ),2000));
    }
    return new Promise((res, rej)=>{
      const rdr = new NDEFReader();
      rdr.scan().then(()=>{
        rdr.addEventListener('reading', ({serialNumber})=>res(serialNumber));
        rdr.addEventListener('readingerror', ()=>rej(new Error('Scan error')));
      }).catch(e=>rej(e));
    });
  }
}
const NFC = new NFCSystem();

// --- ExportSystem ---
class ExportSystem {
  async toExcel(sheet) {
    const data=[], dates=new Set();
    sheet.students.forEach(st=>
      Object.keys(st.attendance||{}).forEach(d=>dates.add(d))
    );
    const sorted = Array.from(dates).sort();
    data.push(['Name','NFC UID',...sorted.map(d=>new Date(d).toLocaleDateString())]);
    sheet.students.forEach(st=>{
      data.push([
        st.name, st.uid,
        ...sorted.map(d=>st.attendance[d]?'Present':'Absent')
      ]);
    });
    const ws = XLSX.utils.aoa_to_sheet(data),
          wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'Attendance');
    XLSX.writeFile(wb,
      `${sheet.name.replace(/[^a-z0-9]/gi,'_')}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  }
}
const Exporter = new ExportSystem();

// --- Helpers for page navigation ---
function goSheet(id) { location.href=`sheet.html?id=${id}`; }
function delSheet(id){ if(confirm('Sure?')){ Sheet.delete(id); Sheet.loadTo('#sheetsContainer'); } }
