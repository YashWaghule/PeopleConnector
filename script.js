/* ===== Smart Community Connect — vanilla JS, data stored in localStorage ===== */
const PREFIX = 'scc_';
const CATEGORIES = ['Water', 'Electricity', 'Security', 'Cleanliness', 'Maintenance', 'Parking', 'Other'];
const FB_CATEGORIES = ['General', 'Facilities', 'Security', 'Events', 'Management', 'Other'];
const STATUSES = ['Reported', 'In Progress', 'Resolved'];
const PROGRESS = { 'Reported': 33, 'In Progress': 66, 'Resolved': 100 };
const TITLES = { dashboard: 'Dashboard', announcements: 'Announcements', report: 'Report an Issue', tracking: 'Issue Tracking', polls: 'Polls & Opinions', activities: 'Community Activities', feedback: 'Feedback', management: 'Community Management' };
const $ = s => document.querySelector(s);
let data = {}; // all app state lives here: issues, polls, activities, announcements, feedback, votes, joined, registrations

/* ---------- Helpers ---------- */
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = d => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const dateOffset = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const empty = t => `<div class="empty">📭<p>${t}</p></div>`;
const options = (list, first) => (first ? `<option value="">${first}</option>` : '') + list.map(x => `<option>${x}</option>`).join('');

/* ---------- Loading & saving data ---------- */
function loadData(key, fallback) {
  try { const v = localStorage.getItem(PREFIX + key); return v ? JSON.parse(v) : fallback; }
  catch (e) { return fallback; }
}
function saveData(key) { localStorage.setItem(PREFIX + key, JSON.stringify(data[key])); }

function seedDemoData() {
  if (localStorage.getItem(PREFIX + 'seeded')) return; // never overwrite existing data
  data = {
    issues: [
      { id: 'ISS-1001', title: 'Water leakage in Block A', category: 'Water', location: 'Block A, Ground floor', priority: 'High', description: 'Main pipe is leaking near the stairwell and flooding the corridor.', date: dateOffset(-6), status: 'In Progress' },
      { id: 'ISS-1002', title: 'Street light not working', category: 'Electricity', location: 'Main gate road', priority: 'Medium', description: 'Two street lights near the main gate have been off for a week.', date: dateOffset(-5), status: 'Reported' },
      { id: 'ISS-1003', title: 'Garbage not collected', category: 'Cleanliness', location: 'Block C, Back lane', priority: 'High', description: 'Garbage has not been collected for three days and smells bad.', date: dateOffset(-9), status: 'Resolved' },
      { id: 'ISS-1004', title: 'Unauthorized vehicles parked', category: 'Parking', location: 'Visitor parking', priority: 'Low', description: 'Outside vehicles occupy visitor slots overnight.', date: dateOffset(-3), status: 'Reported' },
      { id: 'ISS-1005', title: 'CCTV camera faulty', category: 'Security', location: 'Block B entrance', priority: 'Medium', description: 'The entrance camera shows a blank screen since Monday.', date: dateOffset(-2), status: 'In Progress' },
      { id: 'ISS-1006', title: 'Lift making noise', category: 'Maintenance', location: 'Block D', priority: 'Medium', description: 'The lift makes a loud grinding sound between floors 3 and 4.', date: dateOffset(-12), status: 'Resolved' }
    ],
    polls: [
      { id: 1, question: 'Should the community organize a cleanliness drive?', active: true, options: [{ text: 'Yes, this month', votes: 24 }, { text: 'Yes, next month', votes: 11 }, { text: 'No', votes: 3 }] },
      { id: 2, question: 'Preferred timing for the next community meeting?', active: true, options: [{ text: 'Weekday evening', votes: 14 }, { text: 'Saturday morning', votes: 20 }, { text: 'Sunday evening', votes: 9 }] },
      { id: 3, question: 'Should more CCTV cameras be installed?', active: true, options: [{ text: 'Yes', votes: 31 }, { text: 'No', votes: 4 }, { text: 'Not sure', votes: 6 }] }
    ],
    activities: [
      { id: 1, name: 'Community Cleanliness Drive', date: dateOffset(5), time: '08:00 AM', location: 'Central Park', description: 'Join us to clean the park and surrounding lanes. Gloves and bags provided.', needed: 30, volunteers: 12 },
      { id: 2, name: 'Tree Plantation', date: dateOffset(9), time: '07:30 AM', location: 'Community Garden', description: 'Plant 100 saplings around the community boundary.', needed: 20, volunteers: 8 },
      { id: 3, name: 'Blood Donation Camp', date: dateOffset(14), time: '10:00 AM', location: 'Community Hall', description: 'Organized with the local hospital. Volunteers needed for registration and support.', needed: 10, volunteers: 6 },
      { id: 4, name: 'Sports Day', date: dateOffset(20), time: '04:00 PM', location: 'Sports Ground', description: 'Cricket, badminton and races for all age groups.', needed: 15, volunteers: 5 },
      { id: 5, name: 'Community Meeting', date: dateOffset(7), time: '06:30 PM', location: 'Community Hall', description: 'Monthly meeting to discuss maintenance budget and upcoming plans.', needed: 5, volunteers: 2 }
    ],
    announcements: [
      { id: 1, title: 'Water supply maintenance', description: 'Water supply will be interrupted on Saturday from 10 AM to 2 PM for tank cleaning.', date: dateOffset(-1), important: true },
      { id: 2, title: 'Security meeting', description: 'A meeting with the security agency is scheduled to review gate entry procedures.', date: dateOffset(-3), important: false },
      { id: 3, title: 'Festival celebration', description: 'Cultural evening with music and food stalls in the central courtyard. Everyone is invited!', date: dateOffset(-4), important: false },
      { id: 4, title: 'Maintenance payment reminder', description: 'Please pay this quarter\'s maintenance charges before the 10th to avoid late fees.', date: dateOffset(-2), important: true }
    ],
    feedback: [
      { id: 1, name: 'Anita Sharma', category: 'Facilities', rating: 4, message: 'The new garden benches are great. Please add more lighting.', date: dateOffset(-4) },
      { id: 2, name: 'Rahul Verma', category: 'Security', rating: 5, message: 'Guards are very responsive at night.', date: dateOffset(-7) }
    ],
    votes: {}, joined: [], registrations: []
  };
  Object.keys(data).forEach(saveData);
  localStorage.setItem(PREFIX + 'seeded', '1');
}

function loadAll() {
  ['issues', 'polls', 'activities', 'announcements', 'feedback', 'votes', 'joined', 'registrations']
    .forEach(k => data[k] = loadData(k, k === 'votes' ? {} : []));
}

/* ---------- Notifications & modal ---------- */
function showToast(msg, type) {
  const t = document.createElement('div');
  t.className = 'toast ' + (type || '');
  t.textContent = msg;
  $('#toasts').appendChild(t);
  setTimeout(() => t.remove(), 3500);
}
function openModal(html) { $('#modalBody').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }

/* ---------- Dashboard ---------- */
const announcementHTML = a => `<div class="item"><div class="row"><h4>${esc(a.title)}</h4>${a.important ? '<span class="badge high">Important</span>' : ''}</div><p>${esc(a.description)}</p><small>${fmt(a.date)}</small></div>`;

function renderDashboard() {
  const total = data.issues.length;
  const resolved = data.issues.filter(i => i.status === 'Resolved').length;
  const volunteers = data.activities.reduce((s, a) => s + a.volunteers, 0);
  const stats = [
    ['🛠', 'Total Issues', total], ['✅', 'Resolved Issues', resolved], ['⏳', 'Pending Issues', total - resolved],
    ['📊', 'Active Polls', data.polls.filter(p => p.active).length], ['🤝', 'Volunteers', volunteers], ['📅', 'Activities', data.activities.length]
  ];
  $('#stats').innerHTML = stats.map(([ic, label, v]) => `<div class="card stat"><span class="ico">${ic}</span><div><b>${v}</b><small>${label}</small></div></div>`).join('');
  $('#dashAnnouncements').innerHTML = renderAnnouncementsList(3);
  $('#dashIssues').innerHTML = data.issues.slice(0, 4).map(i => `<div class="item"><div class="row"><h4>${esc(i.title)}</h4><span class="badge s-${i.status.replace(' ', '')}">${i.status}</span></div><small>${i.id} · ${fmt(i.date)}</small></div>`).join('') || empty('No issues yet.');
  $('#dashActivities').innerHTML = [...data.activities].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4).map(a => `<div class="item"><div class="row"><h4>${esc(a.name)}</h4><span class="badge s-InProgress">${Math.max(a.needed - a.volunteers, 0)} spots left</span></div><small>📅 ${fmt(a.date)} · ${a.time} · 📍 ${esc(a.location)}</small></div>`).join('') || empty('No upcoming activities.');
}

/* ---------- Announcements ---------- */
function renderAnnouncementsList(limit) {
  const list = [...data.announcements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, limit || 99);
  return list.length ? list.map(announcementHTML).join('') : empty('No announcements.');
}
function renderAnnouncements() {
  const list = [...data.announcements].sort((a, b) => b.date.localeCompare(a.date));
  $('#announcementList').innerHTML = list.length ? list.map(a => `<div class="card">${announcementHTML(a)}</div>`).join('') : empty('No announcements.');
}

/* ---------- Issues: adding, filtering, rendering, status updates ---------- */
function addIssue(e) {
  e.preventDefault();
  const title = $('#iTitle').value.trim(), location = $('#iLocation').value.trim(), description = $('#iDesc').value.trim();
  if (title.length < 5 || !location || description.length < 10) return showToast('Please enter a title (5+ chars), location and description (10+ chars).', 'error');
  const num = Math.max(1000, ...data.issues.map(i => parseInt(i.id.slice(4)))) + 1;
  const issue = { id: 'ISS-' + num, title, category: $('#iCategory').value, location, priority: $('#iPriority').value, description, date: dateOffset(0), status: 'Reported' };
  data.issues.unshift(issue);
  saveData('issues');
  e.target.reset();
  renderAll();
  showToast(`Issue ${issue.id} reported successfully!`);
  showSection('tracking');
}

function updateIssueStatus(id, status) {
  const issue = data.issues.find(i => i.id === id);
  if (!issue) return;
  issue.status = status;
  saveData('issues');
  renderAll();
  showToast(`${id} marked as ${status}.`);
}

function getFilteredIssues() {
  const q = $('#search').value.trim().toLowerCase(), s = $('#fStatus').value, c = $('#fCategory').value, p = $('#fPriority').value;
  return data.issues.filter(i => (!s || i.status === s) && (!c || i.category === c) && (!p || i.priority === p) &&
    (!q || (i.id + i.title + i.location + i.description).toLowerCase().includes(q)));
}

function renderIssues() {
  const list = getFilteredIssues();
  $('#issueList').innerHTML = list.length ? list.map(i => `
    <div class="card">
      <div class="row"><small>${i.id}</small><span class="badge s-${i.status.replace(' ', '')}">${i.status}</span></div>
      <h4>${esc(i.title)}</h4><p>${esc(i.description)}</p>
      <div class="meta"><span>🏷 ${i.category}</span><span>📍 ${esc(i.location)}</span><span class="badge p-${i.priority}">${i.priority}</span><span>📅 ${fmt(i.date)}</span></div>
      <div class="bar"><i style="width:${PROGRESS[i.status]}%"></i></div><small>Progress: ${PROGRESS[i.status]}%</small>
    </div>`).join('') : empty('No issues match your filters.');
}

/* ---------- Polls ---------- */
function renderPolls() {
  $('#pollList').innerHTML = data.polls.map(p => {
    const voted = data.votes[p.id] !== undefined;
    const total = p.options.reduce((s, o) => s + o.votes, 0);
    const body = (voted || !p.active)
      ? p.options.map((o, idx) => { const pc = total ? Math.round(o.votes / total * 100) : 0; return `<div class="res ${data.votes[p.id] === idx ? 'mine' : ''}"><div class="row"><span>${esc(o.text)}</span><b>${pc}%</b></div><div class="bar"><i style="width:${pc}%"></i></div></div>`; }).join('') + `<small>${total} votes${voted ? ' · You voted ✔' : ''}</small>`
      : p.options.map((o, idx) => `<label class="opt"><input type="radio" name="poll${p.id}" value="${idx}"> ${esc(o.text)}</label>`).join('') + `<button class="btn" data-vote="${p.id}">Submit Vote</button>`;
    return `<div class="card"><div class="row"><h4>${esc(p.question)}</h4><span class="badge ${p.active ? 's-Resolved' : 's-Reported'}">${p.active ? 'Active' : 'Closed'}</span></div>${body}</div>`;
  }).join('') || empty('No polls available.');
}

function vote(pollId) {
  const poll = data.polls.find(p => p.id === pollId);
  if (!poll || !poll.active) return;
  if (data.votes[pollId] !== undefined) return showToast('You have already voted in this poll.', 'error');
  const choice = document.querySelector(`input[name="poll${pollId}"]:checked`);
  if (!choice) return showToast('Please select an option first.', 'error');
  poll.options[+choice.value].votes++;
  data.votes[pollId] = +choice.value; // remembers this browser's vote
  saveData('polls'); saveData('votes');
  renderAll();
  showToast('Thanks! Your vote has been recorded.');
}

function togglePoll(pollId) {
  const poll = data.polls.find(p => p.id === pollId);
  poll.active = !poll.active;
  saveData('polls'); renderAll();
}

/* ---------- Activities ---------- */
function renderActivities() {
  $('#activityList').innerHTML = data.activities.map(a => {
    const joined = data.joined.includes(a.id), full = a.volunteers >= a.needed;
    const pc = Math.min(100, Math.round(a.volunteers / a.needed * 100));
    return `<div class="card"><h4>${esc(a.name)}</h4><p>${esc(a.description)}</p>
      <div class="meta"><span>📅 ${fmt(a.date)}</span><span>🕒 ${a.time}</span><span>📍 ${esc(a.location)}</span></div>
      <div class="bar"><i style="width:${pc}%"></i></div><small>${a.volunteers} / ${a.needed} volunteers</small><br>
      <button class="btn" data-join="${a.id}" ${joined || full ? 'disabled' : ''}>${joined ? '✔ Joined' : full ? 'Full' : 'Volunteer / Join'}</button></div>`;
  }).join('') || empty('No activities scheduled.');
}

function openJoinModal(id) {
  const a = data.activities.find(x => x.id === id);
  openModal(`<h3>Join: ${esc(a.name)}</h3><form id="joinForm" data-id="${id}"><label>Your name<input id="joinName" required placeholder="Enter your name"></label><button class="btn" type="submit">Confirm</button></form>`);
  $('#joinName').focus();
}

function joinActivity(id, name) {
  const a = data.activities.find(x => x.id === id);
  if (!a || data.joined.includes(id) || a.volunteers >= a.needed) return;
  a.volunteers++;
  data.joined.push(id);
  data.registrations.push({ activityId: id, name, date: dateOffset(0) });
  ['activities', 'joined', 'registrations'].forEach(saveData);
  closeModal(); renderAll();
  showToast(`Thanks ${name}! You are registered for ${a.name}.`);
}

/* ---------- Feedback ---------- */
function submitFeedback(e) {
  e.preventDefault();
  const name = $('#fbName').value.trim(), message = $('#fbMessage').value.trim();
  if (!name || message.length < 10) return showToast('Please enter your name and a message (10+ chars).', 'error');
  data.feedback.unshift({ id: Date.now(), name, category: $('#fbCategory').value, rating: +$('#fbRating').value, message, date: dateOffset(0) });
  saveData('feedback');
  e.target.reset(); renderAll();
  showToast('Thank you! Your feedback has been submitted.');
}

/* ---------- Management view ---------- */
function renderManagement() {
  $('#mgmtIssues').innerHTML = data.issues.length ? `<div class="tablewrap"><table><thead><tr><th>ID</th><th>Title</th><th>Category</th><th>Priority</th><th>Status</th></tr></thead><tbody>${data.issues.map(i => `<tr>
    <td data-l="ID">${i.id}</td><td data-l="Title">${esc(i.title)}</td><td data-l="Category">${i.category}</td>
    <td data-l="Priority"><span class="badge p-${i.priority}">${i.priority}</span></td>
    <td data-l="Status"><select data-status="${i.id}">${STATUSES.map(s => `<option ${s === i.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></div>` : empty('No issues reported.');

  $('#mgmtPolls').innerHTML = data.polls.map(p => {
    const total = p.options.reduce((s, o) => s + o.votes, 0);
    return `<div class="item"><div class="row"><h4>${esc(p.question)}</h4><button class="btn ghost" data-toggle="${p.id}">${p.active ? 'Close' : 'Reopen'}</button></div>` +
      p.options.map(o => `<small>${esc(o.text)}: ${o.votes} (${total ? Math.round(o.votes / total * 100) : 0}%)</small><br>`).join('') + '</div>';
  }).join('');

  $('#mgmtVolunteers').innerHTML = data.activities.map(a => {
    const names = data.registrations.filter(r => r.activityId === a.id).map(r => esc(r.name)).join(', ');
    return `<div class="item"><h4>${esc(a.name)}</h4><small>${a.volunteers} / ${a.needed} volunteers${names ? ' · New sign-ups: ' + names : ''}</small></div>`;
  }).join('');

  $('#mgmtFeedback').innerHTML = data.feedback.map(f => `<div class="item"><div class="row"><h4>${esc(f.name)} <small>· ${f.category}</small></h4><span>${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}</span></div><p>${esc(f.message)}</p><small>${fmt(f.date)}</small></div>`).join('') || empty('No feedback yet.');
}

/* ---------- Navigation & view toggle ---------- */
function showSection(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === id));
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('active', b.dataset.section === id));
  $('#pageTitle').textContent = TITLES[id];
  document.body.classList.remove('menu-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function setView(mode) {
  document.body.classList.toggle('resident', mode === 'resident');
  $('#viewResident').classList.toggle('active', mode === 'resident');
  $('#viewManagement').classList.toggle('active', mode === 'management');
  if (mode === 'resident' && $('#management').classList.contains('active')) showSection('dashboard');
  else if (mode === 'management') { showSection('management'); showToast('Management view enabled (demo).'); }
}

function renderAll() {
  renderDashboard(); renderAnnouncements(); renderIssues(); renderPolls(); renderActivities(); renderManagement();
}

/* ---------- Initialisation & event listeners ---------- */
function init() {
  seedDemoData();
  loadAll();
  $('#iCategory').innerHTML = options(CATEGORIES);
  $('#fCategory').innerHTML = options(CATEGORIES, 'All Categories');
  $('#fStatus').innerHTML = options(STATUSES, 'All Status');
  $('#fbCategory').innerHTML = options(FB_CATEGORIES);

  $('#nav').addEventListener('click', e => { const b = e.target.closest('button'); if (b) showSection(b.dataset.section); });
  $('#menuBtn').addEventListener('click', () => document.body.classList.toggle('menu-open'));
  $('#viewResident').addEventListener('click', () => setView('resident'));
  $('#viewManagement').addEventListener('click', () => setView('management'));
  $('#issueForm').addEventListener('submit', addIssue);
  $('#feedbackForm').addEventListener('submit', submitFeedback);
  ['#search', '#fStatus', '#fCategory', '#fPriority'].forEach(s => $(s).addEventListener('input', renderIssues));

  $('#pollList').addEventListener('click', e => { const b = e.target.closest('[data-vote]'); if (b) vote(+b.dataset.vote); });
  $('#activityList').addEventListener('click', e => { const b = e.target.closest('[data-join]'); if (b && !b.disabled) openJoinModal(+b.dataset.join); });
  $('#mgmtIssues').addEventListener('change', e => { if (e.target.dataset.status) updateIssueStatus(e.target.dataset.status, e.target.value); });
  $('#mgmtPolls').addEventListener('click', e => { const b = e.target.closest('[data-toggle]'); if (b) togglePoll(+b.dataset.toggle); });
  $('#modalBody').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#joinName').value.trim();
    if (!name) return showToast('Please enter your name.', 'error');
    joinActivity(+e.target.dataset.id, name);
  });
  $('#modalClose').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
  $('#resetBtn').addEventListener('click', () => {
    if (!confirm('Reset all data back to the demo data?')) return;
    Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k));
    location.reload();
  });

  renderAll();
}
document.addEventListener('DOMContentLoaded', init);
