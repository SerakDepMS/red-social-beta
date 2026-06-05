// ═══════════════════════════════════════════════════════════════
//  SERAKDEP MS — FEATURES PACK v2.0
//  Todas las nuevas funcionalidades agrupadas
// ═══════════════════════════════════════════════════════════════

// ── 1. NOTIFICACIONES PUSH EN TIEMPO REAL (Toast al mencionar/reaccionar) ──
(function initRealtimeNotifs() {
  let lastNotifCount = 0;

  function checkNewNotifs() {
    if (!window.CU) return;
    const myNotifs = (window.notifs || []).filter(n => n.userId === CU.id);
    const unread = myNotifs.filter(n => !n.read);
    const dnd = localStorage.getItem('sms_dnd') === '1';
    if (dnd) return;

    unread.forEach(n => {
      if (n._toastShown) return;
      n._toastShown = true;

      let msg = '';
      const actor = (window.users || []).find(u => u.id === n.actorId);
      const name = actor ? actor.username : 'Alguien';

      if (n.type === 'reaction' || n.type === 'like') msg = `❤️ ${name} reaccionó a tu post`;
      else if (n.type === 'comment') msg = `💬 ${name} comentó en tu post`;
      else if (n.type === 'mention') msg = `📢 ${name} te mencionó`;
      else if (n.type === 'follow') msg = `👤 ${name} te empezó a seguir`;
      else if (n.type === 'badge') msg = `🏅 ¡Nueva insignia desbloqueada!`;
      else if (n.type === 'birthday') {
        const bUser = (window.users || []).find(u => u.id === n.actorId);
        msg = `🎂 ¡Hoy es el cumpleaños de ${bUser?.username || 'alguien'}!`;
      }

      if (msg) showPushToast(msg, n);
    });
  }

  function showPushToast(msg, notif) {
    const c = document.getElementById('toasts');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast push-notif-toast success';
    t.style.cssText = 'cursor:pointer;max-width:320px;';
    t.innerHTML = `<i class="fas fa-bell" style="color:var(--green);"></i> <span style="flex:1;">${msg}</span>`;
    t.onclick = () => { document.getElementById('notif-btn')?.click(); t.remove(); };
    c.appendChild(t);
    if (window.playNotifSound) window.playNotifSound();
    setTimeout(() => { t.style.animation = 'tIn .28s ease reverse'; setTimeout(() => t.remove(), 300); }, 5000);
  }

  setInterval(checkNewNotifs, 4000);
})();

// ── 2. CHAT DE VOZ SIMULADO (Web Audio API) ──
window.voiceRecorder = null;
window.voiceChunks = [];
window.voiceRecordingUid = null;

function startVoiceRecord(uid) {
  if (!navigator.mediaDevices) { toast('Tu navegador no soporta grabación de voz', 'warning'); return; }
  navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
    voiceRecordingUid = uid;
    voiceChunks = [];
    voiceRecorder = new MediaRecorder(stream);
    voiceRecorder.ondataavailable = e => voiceChunks.push(e.data);
    voiceRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(voiceChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onload = ev => sendVoiceMsg(uid, ev.target.result, Math.round(blob.size / 1000));
      reader.readAsDataURL(blob);
    };
    voiceRecorder.start();
    // Update button UI
    const btn = document.getElementById('voice-rec-btn');
    if (btn) {
      btn.classList.add('recording');
      btn.innerHTML = '<i class="fas fa-stop"></i>';
      btn.title = 'Detener grabación';
    }
    toast('🎙️ Grabando...', 'info');
  }).catch(() => toast('No se pudo acceder al micrófono', 'warning'));
}

function stopVoiceRecord() {
  if (voiceRecorder && voiceRecorder.state !== 'inactive') {
    voiceRecorder.stop();
    const btn = document.getElementById('voice-rec-btn');
    if (btn) {
      btn.classList.remove('recording');
      btn.innerHTML = '<i class="fas fa-microphone"></i>';
      btn.title = 'Enviar nota de voz';
    }
  }
}

function toggleVoiceRecord(uid) {
  if (voiceRecorder && voiceRecorder.state === 'recording') stopVoiceRecord();
  else startVoiceRecord(uid);
}

function sendVoiceMsg(uid, audioData, kbSize) {
  let conv = (window.messages || []).find(m => m.participants.includes(CU.id) && m.participants.includes(uid));
  if (!conv) { conv = { participants: [CU.id, uid], messages: [] }; messages.push(conv); }
  const duration = Math.max(1, Math.round(kbSize / 4));
  const msg = {
    id: Date.now(),
    from: CU.id,
    timestamp: Date.now(),
    isVoice: true,
    voiceData: audioData,
    voiceDuration: duration,
    text: `🎙️ Nota de voz (${duration}s)`,
    seen: false
  };
  conv.messages.push(msg);
  if (window.save) save();
  renderChatArea(conv);
  toast('🎙️ Nota de voz enviada', 'success');
}

// Monkey-patch del chat para añadir botón de voz
(function patchChatInput() {
  const origOpenChat = window.openChat;
  if (!origOpenChat) { setTimeout(patchChatInput, 800); return; }
  window.openChat = function(uid) {
    origOpenChat.call(this, uid);
    setTimeout(() => {
      const chatInput = document.querySelector('.chat-input');
      if (chatInput && !document.getElementById('voice-rec-btn')) {
        const btn = document.createElement('button');
        btn.id = 'voice-rec-btn';
        btn.className = 'btn-icon voice-record-btn';
        btn.title = 'Enviar nota de voz';
        btn.innerHTML = '<i class="fas fa-microphone"></i>';
        btn.onclick = () => toggleVoiceRecord(uid);
        chatInput.insertBefore(btn, chatInput.querySelector('textarea'));
      }
    }, 200);
  };
})();

// ── 3. MODO NO MOLESTAR (DND) con badge en avatar ──
function toggleDND(active) {
  localStorage.setItem('sms_dnd', active ? '1' : '0');
  updateDNDBadge();
  toast(active ? '🔕 Modo No Molestar activado' : '🔔 Notificaciones reactivadas', active ? 'warning' : 'success');
  if (cView === 'settings') renderSettings();
}

function updateDNDBadge() {
  const isDnd = localStorage.getItem('sms_dnd') === '1';
  const avContainer = document.getElementById('h-av-container');
  let badge = document.getElementById('dnd-badge');
  if (isDnd) {
    if (!badge && avContainer) {
      badge = document.createElement('div');
      badge.id = 'dnd-badge';
      badge.style.cssText = 'position:absolute;bottom:0;right:0;width:10px;height:10px;background:#ef4444;border-radius:50%;border:2px solid var(--card);z-index:2;';
      badge.title = 'No Molestar activo';
      avContainer.appendChild(badge);
    }
  } else {
    if (badge) badge.remove();
  }
}

setTimeout(updateDNDBadge, 1000);

// ── 4. STORIES CON MÚSICA DE FONDO ──
function openStoryCreateWithMusic() {
  const orig = document.getElementById('story-create-modal');
  if (!orig) { openModal('story-create-modal'); return; }
  // Añadir campo de música si no existe
  if (!document.getElementById('story-music-input')) {
    const body = orig.querySelector('.mbody') || orig.querySelector('[id$="-body"]');
    if (body) {
      const musicField = document.createElement('div');
      musicField.innerHTML = `
        <div style="margin-top:10px;">
          <label style="font-size:.8rem;color:var(--text2);display:block;margin-bottom:5px;"><i class="fas fa-music"></i> Música de fondo (URL de audio)</label>
          <input type="text" id="story-music-input" placeholder="https://... mp3/ogg o deja vacío" style="margin-bottom:0;">
        </div>`;
      body.appendChild(musicField);
    }
  }
  openModal('story-create-modal');
}

// Patch del story viewer para reproducir música
(function patchStoryViewer() {
  const origOpenSV = window.openSV;
  if (!origOpenSV) { setTimeout(patchStoryViewer, 800); return; }
  window.openSV = function(uid) {
    origOpenSV.call(this, uid);
    setTimeout(() => {
      const storyNow = (window.stories || []).filter(s => s.userId === uid && s.expiresAt > Date.now());
      if (!storyNow.length) return;
      const s = storyNow[0];
      if (s.bgMusic) {
        let audio = document.getElementById('story-bg-music');
        if (!audio) {
          audio = document.createElement('audio');
          audio.id = 'story-bg-music';
          audio.loop = true;
          audio.volume = 0.4;
          document.body.appendChild(audio);
        }
        audio.src = s.bgMusic;
        audio.play().catch(() => {});
      }
    }, 300);
  };
})();

// Patch de publishStory para guardar la música
(function patchPublishStory() {
  const origPublish = window.publishStory;
  if (!origPublish) { setTimeout(patchPublishStory, 800); return; }
  window.publishStory = function() {
    const musicInput = document.getElementById('story-music-input');
    const bgMusic = musicInput ? musicInput.value.trim() : '';
    origPublish.call(this);
    // Patch la última story añadida
    if (bgMusic && window.stories && stories.length) {
      stories[0].bgMusic = bgMusic;
      if (window.save) save();
    }
  };
})();

// ── 5. SALAS DE DEBATE EN GRUPOS ──
function openDebateCreator(gid) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'debate-create-modal';
  modal.innerHTML = `
    <div class="mbox" style="max-width:440px;">
      <div class="mhead"><h3><i class="fas fa-balance-scale"></i> Crear debate</h3><button class="mclose" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button></div>
      <div class="mbody" style="display:flex;flex-direction:column;gap:10px;">
        <input type="text" id="debate-title" placeholder="Pregunta del debate (ej: ¿PC o consola?)" style="margin-bottom:0;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <input type="text" id="debate-side-a" placeholder="🟦 Lado A" style="margin-bottom:0;">
          <input type="text" id="debate-side-b" placeholder="🟥 Lado B" style="margin-bottom:0;">
        </div>
        <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="publishDebate(${gid})"><i class="fas fa-fire"></i> Lanzar debate</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
}

function publishDebate(gid) {
  const title = document.getElementById('debate-title')?.value.trim();
  const sideA = document.getElementById('debate-side-a')?.value.trim() || 'Lado A';
  const sideB = document.getElementById('debate-side-b')?.value.trim() || 'Lado B';
  if (!title) { toast('Escribe una pregunta', 'warning'); return; }

  if (!window.debates) window.debates = [];
  const debate = {
    id: Date.now(),
    gid,
    title,
    sideA,
    sideB,
    votesA: [],
    votesB: [],
    userId: CU.id,
    timestamp: Date.now()
  };
  window.debates.push(debate);
  localStorage.setItem('sms_debates', JSON.stringify(window.debates));
  document.getElementById('debate-create-modal')?.remove();
  toast('⚖️ Debate lanzado!', 'success');
  renderGroupFeed(gid);
}

function loadDebates() {
  try { window.debates = JSON.parse(localStorage.getItem('sms_debates') || '[]'); } catch (e) { window.debates = []; }
}
loadDebates();

function debateCard(d) {
  const totalVotes = d.votesA.length + d.votesB.length;
  const pctA = totalVotes > 0 ? Math.round(d.votesA.length / totalVotes * 100) : 50;
  const pctB = 100 - pctA;
  const votedA = d.votesA.includes(CU.id);
  const votedB = d.votesB.includes(CU.id);
  const author = (window.users || []).find(u => u.id === d.userId);
  return `<div class="card debate-card" style="margin-bottom:12px;padding:16px;">
    <div style="display:flex;align-items:center;gap:7px;margin-bottom:10px;">
      <i class="fas fa-balance-scale" style="color:var(--purple);font-size:1.1rem;"></i>
      <div style="flex:1;">
        <div style="font-weight:800;font-family:var(--font-head);font-size:.95rem;">${esc(d.title)}</div>
        <div style="font-size:.72rem;color:var(--text2);">por ${esc(author?.username||'?')} · ${timeAgo(d.timestamp)}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
      <button class="debate-side-btn ${votedA?'active-a':''}" onclick="voteDebate(${d.id},'A')" style="padding:12px 8px;border-radius:var(--r-md);border:2px solid ${votedA?'#3b82f6':'var(--border)'};background:${votedA?'rgba(59,130,246,.1)':'var(--input-bg)'};cursor:pointer;font-weight:700;transition:.2s;">
        🟦 ${esc(d.sideA)}<br><span style="font-size:.75rem;color:var(--text2);">${d.votesA.length} votos</span>
      </button>
      <button class="debate-side-btn ${votedB?'active-b':''}" onclick="voteDebate(${d.id},'B')" style="padding:12px 8px;border-radius:var(--r-md);border:2px solid ${votedB?'#ef4444':'var(--border)'};background:${votedB?'rgba(239,68,68,.1)':'var(--input-bg)'};cursor:pointer;font-weight:700;transition:.2s;">
        🟥 ${esc(d.sideB)}<br><span style="font-size:.75rem;color:var(--text2);">${d.votesB.length} votos</span>
      </button>
    </div>
    <div style="background:var(--border);border-radius:20px;height:8px;overflow:hidden;">
      <div style="height:100%;width:${pctA}%;background:linear-gradient(90deg,#3b82f6,#60a5fa);transition:width .5s;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:.72rem;color:var(--text2);margin-top:4px;"><span>${pctA}%</span><span>${totalVotes} votos totales</span><span>${pctB}%</span></div>
  </div>`;
}

function voteDebate(id, side) {
  const d = (window.debates || []).find(x => x.id === id);
  if (!d) return;
  d.votesA = d.votesA.filter(x => x !== CU.id);
  d.votesB = d.votesB.filter(x => x !== CU.id);
  if (side === 'A') d.votesA.push(CU.id);
  else d.votesB.push(CU.id);
  localStorage.setItem('sms_debates', JSON.stringify(window.debates));
  renderGroupFeed(d.gid);
  toast(side === 'A' ? `🟦 Votaste por ${d.sideA}` : `🟥 Votaste por ${d.sideB}`, 'success');
}

// Patch renderGroupFeed para incluir debates
(function patchGroupFeed() {
  const origRGF = window.renderGroupFeed;
  if (!origRGF) { setTimeout(patchGroupFeed, 800); return; }
  window.renderGroupFeed = function(gid) {
    origRGF.call(this, gid);
    setTimeout(() => {
      const area = document.getElementById('gfeed');
      if (!area) return;
      const gDebates = (window.debates || []).filter(d => d.gid === gid);
      if (!gDebates.length) return;
      const debatesHtml = `<div id="gfeed-debates">${gDebates.map(debateCard).join('')}</div>`;
      const firstChild = area.firstChild;
      if (firstChild) {
        const debatesDiv = document.createElement('div');
        debatesDiv.innerHTML = debatesHtml;
        area.insertBefore(debatesDiv, firstChild.nextSibling?.nextSibling || firstChild.nextSibling);
      }

      // Add "Crear debate" button to group header
      const manageBtn = area.querySelector('[onclick^="openGroupManage"]');
      if (manageBtn && !area.querySelector('.debate-create-btn')) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-ghost debate-create-btn';
        btn.style.cssText = 'padding:6px 12px;font-size:.78rem;';
        btn.innerHTML = '<i class="fas fa-balance-scale"></i> Debate';
        btn.onclick = () => openDebateCreator(gid);
        manageBtn.parentElement.appendChild(btn);
      }
    }, 150);
  };
})();

// ── 6. RETOS DE GRUPO ──
function loadChallenges() {
  try { window.challenges = JSON.parse(localStorage.getItem('sms_challenges') || '[]'); } catch (e) { window.challenges = []; }
}
loadChallenges();

function openChallengeCreator(gid) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'challenge-modal';
  const deadline = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 16);
  modal.innerHTML = `
    <div class="mbox" style="max-width:440px;">
      <div class="mhead"><h3><i class="fas fa-trophy"></i> Lanzar reto</h3><button class="mclose" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button></div>
      <div class="mbody" style="display:flex;flex-direction:column;gap:10px;">
        <input type="text" id="challenge-title" placeholder="¿Cuál es el reto?" style="margin-bottom:0;">
        <textarea id="challenge-desc" placeholder="Descripción detallada del reto..." style="min-height:70px;resize:none;margin-bottom:0;"></textarea>
        <input type="datetime-local" id="challenge-deadline" value="${deadline}" style="margin-bottom:0;">
        <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="publishChallenge(${gid})"><i class="fas fa-trophy"></i> Lanzar reto</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
}

function publishChallenge(gid) {
  const title = document.getElementById('challenge-title')?.value.trim();
  const desc = document.getElementById('challenge-desc')?.value.trim();
  const deadline = new Date(document.getElementById('challenge-deadline')?.value).getTime();
  if (!title) { toast('Escribe el reto', 'warning'); return; }
  if (!window.challenges) window.challenges = [];
  const ch = { id: Date.now(), gid, title, desc, deadline, userId: CU.id, timestamp: Date.now(), submissions: [] };
  window.challenges.push(ch);
  localStorage.setItem('sms_challenges', JSON.stringify(window.challenges));
  document.getElementById('challenge-modal')?.remove();
  toast('🏆 Reto lanzado!', 'success');
  renderGroupFeed(gid);
}

function challengeCard(ch) {
  const author = (window.users || []).find(u => u.id === ch.userId);
  const dl = new Date(ch.deadline);
  const expired = ch.deadline < Date.now();
  return `<div class="card challenge-card" style="margin-bottom:12px;padding:16px;border-left:4px solid var(--orange);">
    <div style="display:flex;align-items:flex-start;gap:9px;">
      <span style="font-size:1.5rem;">🏆</span>
      <div style="flex:1;">
        <div style="font-weight:800;font-family:var(--font-head);">${esc(ch.title)}</div>
        ${ch.desc ? `<p style="font-size:.82rem;color:var(--text2);margin-top:3px;">${esc(ch.desc)}</p>` : ''}
        <div style="display:flex;align-items:center;gap:8px;margin-top:7px;flex-wrap:wrap;">
          <span class="tag ${expired?'tag-red':'tag-orange'}"><i class="fas fa-clock"></i> ${expired?'Terminado':'Hasta'} ${dl.toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</span>
          <span style="font-size:.75rem;color:var(--text2);">${ch.submissions.length} participantes</span>
          <span style="font-size:.75rem;color:var(--text2);">por ${esc(author?.username||'?')}</span>
        </div>
        ${!expired ? `<button class="btn btn-ghost" style="margin-top:8px;padding:5px 12px;font-size:.77rem;" onclick="submitChallenge(${ch.id})"><i class="fas fa-upload"></i> Participar</button>` : ''}
      </div>
    </div>
  </div>`;
}

function submitChallenge(chId) {
  const ch = (window.challenges || []).find(x => x.id === chId);
  if (!ch) return;
  if (ch.submissions.includes(CU.id)) { toast('Ya participaste en este reto', 'info'); return; }
  ch.submissions.push(CU.id);
  localStorage.setItem('sms_challenges', JSON.stringify(window.challenges));
  toast('✅ ¡Participación registrada! Sube tu intento como post en el grupo.', 'success');
  renderGroupFeed(ch.gid);
}

// ── 7. PERFIL DE GRUPO MEJORADO CON ESTADÍSTICAS ──
function renderGroupStats(gid) {
  const g = (window.groups || []).find(x => x.id === gid);
  if (!g) return;
  const gPosts = (window.posts || []).filter(p => p.groupId === gid);
  const topPost = gPosts.sort((a, b) => Object.keys(b.reactions || {}).length - Object.keys(a.reactions || {}).length)[0];
  
  // Miembro más activo del mes
  const monthAgo = Date.now() - 30 * 24 * 3600 * 1000;
  const monthPosts = gPosts.filter(p => p.timestamp > monthAgo);
  const memberActivity = {};
  monthPosts.forEach(p => { memberActivity[p.userId] = (memberActivity[p.userId] || 0) + 1; });
  g.members.forEach(mid => {
    const cmts = (window.posts || []).filter(p => p.groupId === gid).reduce((a, p) => a + (p.comments || []).filter(c => c.userId === mid).length, 0);
    memberActivity[mid] = (memberActivity[mid] || 0) + cmts;
  });
  const topMemberId = Object.entries(memberActivity).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topMember = topMemberId ? (window.users || []).find(u => u.id === parseInt(topMemberId)) : null;

  // Actividad por día de la semana
  const dayActivity = [0, 0, 0, 0, 0, 0, 0];
  gPosts.filter(p => p.timestamp > Date.now() - 28 * 24 * 3600 * 1000).forEach(p => {
    dayActivity[new Date(p.timestamp).getDay()]++;
  });
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const maxDay = Math.max(...dayActivity, 1);

  return `<div class="card group-stats-card" style="padding:16px;margin-bottom:13px;">
    <div style="font-weight:800;font-family:var(--font-head);margin-bottom:13px;display:flex;align-items:center;gap:8px;">
      <i class="fas fa-chart-bar" style="color:var(--green);"></i> Estadísticas del grupo
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:13px;">
      <div class="psm-card"><strong>${g.members.length}</strong><span>Miembros</span></div>
      <div class="psm-card"><strong>${gPosts.length}</strong><span>Posts totales</span></div>
      <div class="psm-card"><strong>${monthPosts.length}</strong><span>Posts este mes</span></div>
    </div>
    ${topMember ? `<div style="padding:9px;background:var(--input-bg);border-radius:var(--r-md);display:flex;align-items:center;gap:9px;margin-bottom:10px;">
      <img src="${topMember.photo||defAv()}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;" alt="">
      <div style="flex:1;"><div style="font-weight:700;font-size:.83rem;">🌟 Miembro más activo del mes</div><div style="font-size:.78rem;color:var(--green);">${esc(topMember.username)}</div></div>
    </div>` : ''}
    ${topPost ? `<div style="padding:9px;background:var(--input-bg);border-radius:var(--r-md);margin-bottom:10px;cursor:pointer;" onclick="document.getElementById('post-${topPost.id}')?.scrollIntoView({behavior:'smooth'})">
      <div style="font-weight:700;font-size:.82rem;">🔥 Post más popular</div>
      <div style="font-size:.78rem;color:var(--text2);margin-top:3px;">"${esc((topPost.content||'').substring(0,60))}..." · ${Object.keys(topPost.reactions||{}).length} reacciones</div>
    </div>` : ''}
    <div style="font-weight:700;font-size:.8rem;margin-bottom:7px;font-family:var(--font-head);">Actividad semanal (últimas 4 semanas)</div>
    <div style="display:flex;align-items:flex-end;gap:4px;height:50px;">
      ${dayActivity.map((v, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;">
        <div style="flex:1;width:100%;background:var(--green);border-radius:4px 4px 0 0;opacity:${0.3 + 0.7*v/maxDay};height:${Math.round(v/maxDay*100)}%;min-height:${v>0?'4px':'0'};transition:.3s;"></div>
        <span style="font-size:.58rem;color:var(--text2);">${dayNames[i]}</span>
      </div>`).join('')}
    </div>
  </div>`;
}

// ── 8. MENCIONES EN COMENTARIOS ──
(function patchCommentMentions() {
  const origRenderCmts = window.renderCmts;
  if (!origRenderCmts) { setTimeout(patchCommentMentions, 800); return; }
  window.renderCmts = function(p) {
    let html = origRenderCmts.call(this, p);
    // Add mention support to comment input
    return html;
  };
})();

function detectCommentMentions(text, postId) {
  const mentions = (text.match(/@([a-zA-Z0-9_]+)/g) || []).map(m => m.slice(1));
  mentions.forEach(name => {
    const mu = (window.users || []).find(u => u.username === name);
    if (mu && mu.id !== CU.id) {
      if (window.addNotif) addNotif(mu.id, 'mention', CU.id, { postId });
    }
  });
}

// Patch addComment to detect mentions
(function patchAddComment() {
  const origAddCmt = window.addCmt;
  if (!origAddCmt) { setTimeout(patchAddComment, 800); return; }
  window.addCmt = function(pid) {
    const inp = document.getElementById('ci-' + pid);
    if (inp) detectCommentMentions(inp.value || '', pid);
    return origAddCmt.call(this, pid);
  };
})();

// ── 9. MARKETPLACE: OFERTAS Y DESCUENTOS ──
function openProductWithDiscount() {
  const modal = document.getElementById('mkt-create-modal');
  if (!modal) { openModal('mkt-create-modal'); return; }
  if (!document.getElementById('mkt-original-price')) {
    const body = modal.querySelector('.mbody') || modal.querySelector('[id$="-body"]');
    if (body) {
      const priceInput = body.querySelector('#mkt-price');
      if (priceInput && priceInput.parentElement) {
        const discountDiv = document.createElement('div');
        discountDiv.innerHTML = `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;">
            <div><label style="font-size:.75rem;color:var(--text2);">Precio original (tachado)</label><input type="text" id="mkt-original-price" placeholder="0.00" style="margin-bottom:0;margin-top:3px;"></div>
            <div><label style="font-size:.75rem;color:var(--text2);">¿Oferta? Badge 🔥</label><label class="toggle" style="margin-top:8px;display:block;"><input type="checkbox" id="mkt-is-offer"><div class="tslider"></div></label></div>
          </div>`;
        priceInput.parentElement.after(discountDiv);
      }
    }
  }
  openModal('mkt-create-modal');
}

// Patch publishProduct to save discount info
(function patchPublishProduct() {
  const origPP = window.publishProduct;
  if (!origPP) { setTimeout(patchPublishProduct, 800); return; }
  window.publishProduct = function() {
    const origPriceFld = document.getElementById('mkt-original-price');
    const isOffer = document.getElementById('mkt-is-offer');
    origPP.call(this);
    // Patch the last product
    if (window.products && products.length) {
      products[0].originalPrice = origPriceFld?.value.trim() || null;
      products[0].isOffer = isOffer?.checked || false;
      if (window.save) save();
    }
  };
})();

// Patch productCard to show discount badge
(function patchProductCard() {
  const origPC = window.productCard;
  if (!origPC) { setTimeout(patchProductCard, 800); return; }
  window.productCard = function(p) {
    let html = origPC.call(this, p);
    if (p.isOffer) {
      html = html.replace('class="mkt-card"', 'class="mkt-card offer-card"');
    }
    if (p.originalPrice && p.price !== p.originalPrice) {
      html = html.replace(`<div class="mkt-price">$${esc(p.price)}</div>`,
        `<div style="display:flex;align-items:center;gap:6px;">
          <div class="mkt-price">$${esc(p.price)}</div>
          <span style="text-decoration:line-through;color:var(--text2);font-size:.82rem;">$${esc(p.originalPrice)}</span>
          ${p.isOffer ? '<span class="tag tag-orange" style="font-size:.65rem;font-weight:800;">🔥 Oferta</span>' : ''}
        </div>`);
    }
    return html;
  };
})();

// ── 10. HISTORIAL DE COMPRAS EN PERFIL ──
function renderPurchaseHistory(uid) {
  const bought = (window.products || []).filter(p => p.buyerId === uid);
  const sold = (window.products || []).filter(p => p.userId === uid && p.sold);
  return `<div style="margin-top:13px;">
    <div style="font-weight:800;font-family:var(--font-head);margin-bottom:10px;font-size:.9rem;">🛒 Historial de transacciones</div>
    ${bought.length + sold.length === 0 ? `<p style="color:var(--text2);font-size:.83rem;">Sin transacciones aún.</p>` : ''}
    ${bought.length ? `<div style="margin-bottom:10px;">
      <div style="font-weight:700;font-size:.8rem;color:var(--text2);margin-bottom:6px;">COMPRAS</div>
      ${bought.map(p => {
        const seller = (window.users || []).find(u => u.id === p.userId);
        return `<div style="display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid var(--border);">
          ${p.image ? `<img src="${p.image}" style="width:36px;height:36px;border-radius:var(--r-sm);object-fit:cover;" alt="">` : '<div style="width:36px;height:36px;background:var(--input-bg);border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;"><i class="fas fa-box" style="opacity:.4;"></i></div>'}
          <div style="flex:1;"><div style="font-weight:700;font-size:.85rem;">${esc(p.title)}</div><div style="font-size:.73rem;color:var(--text2);">Vendedor: ${esc(seller?.username||'?')}</div></div>
          <div style="font-weight:700;color:var(--green);">$${esc(p.price)}</div>
        </div>`;
      }).join('')}
    </div>` : ''}
    ${sold.length ? `<div>
      <div style="font-weight:700;font-size:.8rem;color:var(--text2);margin-bottom:6px;">VENTAS</div>
      ${sold.map(p => {
        const buyer = (window.users || []).find(u => u.id === p.buyerId);
        return `<div style="display:flex;align-items:center;gap:9px;padding:7px 0;border-bottom:1px solid var(--border);">
          ${p.image ? `<img src="${p.image}" style="width:36px;height:36px;border-radius:var(--r-sm);object-fit:cover;" alt="">` : '<div style="width:36px;height:36px;background:var(--input-bg);border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;"><i class="fas fa-box" style="opacity:.4;"></i></div>'}
          <div style="flex:1;"><div style="font-weight:700;font-size:.85rem;">${esc(p.title)}</div><div style="font-size:.73rem;color:var(--text2);">Comprador: ${esc(buyer?.username||'Anónimo')}</div></div>
          <div style="font-weight:700;color:var(--blue);">$${esc(p.price)}</div>
        </div>`;
      }).join('')}
    </div>` : ''}
  </div>`;
}

// ── 11. VALORACIONES CON TEXTO EN MARKETPLACE ──
function openRatingModal(sellerId, productId) {
  const seller = (window.users || []).find(u => u.id === sellerId);
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'rating-text-modal';
  modal.innerHTML = `
    <div class="mbox" style="max-width:420px;">
      <div class="mhead"><h3><i class="fas fa-star" style="color:var(--orange);"></i> Valorar vendedor</h3><button class="mclose" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button></div>
      <div class="mbody" style="display:flex;flex-direction:column;gap:10px;">
        <div style="display:flex;align-items:center;gap:9px;padding:10px;background:var(--input-bg);border-radius:var(--r-md);">
          <img src="${seller?.photo||defAv()}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" alt="">
          <div style="font-weight:700;">${esc(seller?.username||'?')}</div>
        </div>
        <div style="text-align:center;">
          <div style="font-size:.85rem;color:var(--text2);margin-bottom:7px;">¿Cómo fue tu experiencia?</div>
          <div id="rating-stars-row" style="display:flex;justify-content:center;gap:5px;font-size:1.8rem;">
            ${[1,2,3,4,5].map(i=>`<span class="star-btn" data-val="${i}" onclick="setStarRating(${i})" style="cursor:pointer;opacity:.4;transition:.15s;">★</span>`).join('')}
          </div>
          <div id="rating-val-display" style="font-size:.8rem;color:var(--text2);margin-top:4px;">Sin valorar</div>
        </div>
        <textarea id="rating-text-inp" placeholder="Escribe tu reseña (opcional)..." style="min-height:80px;resize:none;margin-bottom:0;"></textarea>
        <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="submitTextRating(${sellerId},${productId})"><i class="fas fa-paper-plane"></i> Enviar valoración</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
  window._pendingStarRating = 0;
}

function setStarRating(val) {
  window._pendingStarRating = val;
  const stars = document.querySelectorAll('.star-btn');
  stars.forEach((s, i) => { s.style.opacity = i < val ? '1' : '0.3'; s.style.color = i < val ? 'var(--orange)' : ''; });
  const labels = ['', 'Malo 😞', 'Regular 😐', 'Bueno 👍', 'Muy bueno 😊', 'Excelente ⭐'];
  const display = document.getElementById('rating-val-display');
  if (display) display.textContent = labels[val] || '';
}

function submitTextRating(sellerId, productId) {
  if (!window._pendingStarRating) { toast('Selecciona una puntuación', 'warning'); return; }
  const text = document.getElementById('rating-text-inp')?.value.trim() || '';
  const seller = (window.users || []).find(u => u.id === sellerId);
  if (seller) {
    seller.ratings = seller.ratings || [];
    seller.ratings.push({
      from: CU.id,
      stars: window._pendingStarRating,
      text,
      productId,
      timestamp: Date.now()
    });
    if (window.save) save();
  }
  document.getElementById('rating-text-modal')?.remove();
  toast(`⭐ Valoración de ${window._pendingStarRating} estrellas enviada`, 'success');
}

// ── 12. LEADERBOARD SEMANAL ──
function renderLeaderboard() {
  const mc = document.getElementById('content');
  if (!mc) return;

  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const mondayStart = (() => {
    const d = new Date(); d.setHours(0,0,0,0);
    const day = d.getDay(); const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff); return d.getTime();
  })();

  const scores = (window.users || []).filter(u => !u.deactivated).map(u => {
    const weekPosts = (window.posts || []).filter(p => p.userId === u.id && p.timestamp > mondayStart);
    const weekLikes = weekPosts.reduce((a, p) => a + Object.keys(p.reactions || {}).length, 0);
    const weekComments = (window.posts || []).reduce((a, p) =>
      a + (p.comments || []).filter(c => c.userId === u.id && c.timestamp > mondayStart).length, 0);
    const score = weekPosts.length * 2 + weekLikes + weekComments * 3;
    return { u, score, weekPosts: weekPosts.length, weekLikes, weekComments };
  }).sort((a, b) => b.score - a.score).slice(0, 10);

  const nextMonday = new Date(mondayStart + 7 * 24 * 3600 * 1000);
  const medals = ['🥇', '🥈', '🥉'];

  mc.innerHTML = `
    <div style="margin-bottom:13px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
      <h3 style="font-family:var(--font-head);font-weight:800;"><i class="fas fa-trophy" style="color:var(--orange);margin-right:7px;"></i>Leaderboard Semanal</h3>
      <span class="tag tag-orange">🔄 Reinicia el ${nextMonday.toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'short'})}</span>
    </div>
    <div class="card" style="padding:0;overflow:hidden;">
      ${scores.length ? scores.map((item, i) => {
        const isMe = item.u.id === CU.id;
        return `<div style="display:flex;align-items:center;gap:13px;padding:13px 16px;border-bottom:1px solid var(--border);background:${isMe ? 'var(--green-l)' : ''};transition:.15s;" ${isMe ? 'id="lb-me"' : ''}>
          <div style="width:32px;text-align:center;font-size:${i<3?'1.3rem':'.9rem'};font-weight:800;color:${i===0?'var(--orange)':i===1?'#94a3b8':i===2?'#d97706':'var(--text2)'};">${medals[i] || '#'+(i+1)}</div>
          <img src="${item.u.photo||defAv()}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:${isMe?'2px solid var(--green)':'none'};" alt="" loading="lazy">
          <div style="flex:1;" onclick="openProfileModal(${item.u.id});navigate('profile',${item.u.id});" style="cursor:pointer;">
            <div style="font-weight:700;font-size:.88rem;">${esc(item.u.username)} ${isMe?'<span class="tag tag-green" style="font-size:.6rem;">Tú</span>':''}</div>
            <div style="font-size:.72rem;color:var(--text2);">${item.weekPosts} posts · ${item.weekLikes} ❤️ · ${item.weekComments} 💬</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800;color:var(--green);font-size:1.05rem;">${item.score}</div>
            <div style="font-size:.68rem;color:var(--text2);">pts</div>
          </div>
        </div>`;
      }).join('') : `<div class="empty"><i class="fas fa-trophy"></i><p>Sin actividad esta semana. ¡Sé el primero!</p></div>`}
    </div>`;
}

// Añadir Leaderboard al nav
(function addLeaderboardNav() {
  setTimeout(() => {
    const nav = document.getElementById('main-nav');
    if (!nav || document.querySelector('[data-view="leaderboard"]')) return;
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.dataset.view = 'leaderboard';
    item.onclick = () => navigate('leaderboard');
    item.innerHTML = '<span class="nicon"><i class="fas fa-trophy"></i></span>Leaderboard<span class="tag tag-orange" style="margin-left:auto;font-size:.6rem;">Semanal</span>';
    const settingsItem = nav.querySelector('[data-view="settings"]');
    if (settingsItem) nav.insertBefore(item, settingsItem);
    else nav.appendChild(item);

    // Patch navigate
    const origNav = window.navigate;
    window.navigate = function(view, param) {
      if (view === 'leaderboard') {
        closeAllDrawers && closeAllDrawers();
        cView = 'leaderboard';
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const el = document.querySelector('[data-view="leaderboard"]');
        if (el) el.classList.add('active');
        renderLeaderboard();
      } else {
        origNav.call(this, view, param);
      }
    };
  }, 600);
})();

// ── 13. RACHA DE ACTIVIDAD ──
function updateStreak() {
  if (!window.CU) return;
  const streakData = JSON.parse(localStorage.getItem('sms_streak_' + CU.id) || '{"days":0,"lastDate":null}');
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const userPosts = (window.posts || []).filter(p => p.userId === CU.id);
  const postedToday = userPosts.some(p => new Date(p.timestamp).toDateString() === today);

  if (postedToday) {
    if (streakData.lastDate === today) {
      // ya contado
    } else if (streakData.lastDate === yesterday) {
      streakData.days++;
      streakData.lastDate = today;
    } else if (!streakData.lastDate) {
      streakData.days = 1;
      streakData.lastDate = today;
    } else {
      streakData.days = 1;
      streakData.lastDate = today;
    }
    localStorage.setItem('sms_streak_' + CU.id, JSON.stringify(streakData));
  }
  return streakData.days;
}

function getStreakHtml(uid) {
  const streakData = JSON.parse(localStorage.getItem('sms_streak_' + uid) || '{"days":0}');
  if (!streakData.days) return '';
  return `<span class="streak-badge" style="display:inline-flex;align-items:center;gap:4px;background:rgba(245,158,11,.12);color:var(--orange);border-radius:20px;padding:2px 9px;font-size:.75rem;font-weight:700;" title="${streakData.days} días consecutivos publicando">🔥 ${streakData.days} día${streakData.days > 1 ? 's' : ''} de racha</span>`;
}

setTimeout(() => { updateStreak(); }, 1000);

// ── 14. MAPA DE CALOR DE ACTIVIDAD (GitHub-style) ──
function renderActivityHeatmap(uid) {
  const userPosts = (window.posts || []).filter(p => p.userId === uid);
  const userComments = (window.posts || []).reduce((a, p) => a.concat((p.comments || []).filter(c => c.userId === uid)), []);

  const today = new Date();
  const days = 365;
  const dayMs = 86400000;
  const startDate = new Date(today.getTime() - days * dayMs);

  const activityMap = {};
  userPosts.forEach(p => {
    const d = new Date(p.timestamp).toDateString();
    activityMap[d] = (activityMap[d] || 0) + 2;
  });
  userComments.forEach(c => {
    const d = new Date(c.timestamp).toDateString();
    activityMap[d] = (activityMap[d] || 0) + 1;
  });

  const maxVal = Math.max(...Object.values(activityMap), 1);
  const weeks = [];
  let week = [];

  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate.getTime() + i * dayMs);
    const key = d.toDateString();
    const val = activityMap[key] || 0;
    const intensity = val === 0 ? 0 : Math.ceil(val / maxVal * 4);
    week.push({ d, val, intensity });
    if (d.getDay() === 6 || i === days) {
      weeks.push([...week]);
      week = [];
    }
  }

  const colors = ['var(--border)', 'rgba(45,106,79,.2)', 'rgba(45,106,79,.45)', 'rgba(45,106,79,.7)', 'var(--green)'];
  const weekHtml = weeks.map(w => `<div style="display:flex;flex-direction:column;gap:2px;">${w.map(day =>
    `<div title="${day.d.toLocaleDateString('es-ES',{day:'numeric',month:'short'})}: ${day.val} actividades" style="width:11px;height:11px;border-radius:2px;background:${colors[day.intensity]};transition:.15s;cursor:default;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"></div>`
  ).join('')}</div>`).join('');

  const totalActivity = Object.values(activityMap).reduce((a, v) => a + v, 0);

  return `<div style="margin-top:14px;">
    <div style="font-weight:800;font-family:var(--font-head);font-size:.87rem;margin-bottom:9px;display:flex;align-items:center;justify-content:space-between;">
      <span>📊 Mapa de actividad</span>
      <span style="font-size:.72rem;font-weight:400;color:var(--text2);">${totalActivity} actividades este año</span>
    </div>
    <div style="overflow-x:auto;padding-bottom:5px;">
      <div style="display:flex;gap:2px;min-width:max-content;">
        ${weekHtml}
      </div>
      <div style="display:flex;align-items:center;gap:5px;margin-top:6px;font-size:.7rem;color:var(--text2);">
        <span>Menos</span>
        ${colors.map(c=>`<div style="width:11px;height:11px;border-radius:2px;background:${c};"></div>`).join('')}
        <span>Más</span>
      </div>
    </div>
  </div>`;
}

// ── 15. BÚSQUEDA GLOBAL MEJORADA con filtros ──
(function patchGlobalSearch() {
  const origRunSearch = window.runSearch;
  if (!origRunSearch) { setTimeout(patchGlobalSearch, 800); return; }

  window.runSearch = function(q) {
    const container = document.getElementById('search-results');
    if (!container) return origRunSearch.call(this, q);

    // Add date filter UI if not present
    const searchModal = document.getElementById('search-modal');
    if (searchModal && !document.getElementById('search-date-filter')) {
      const filterBar = searchModal.querySelector('.nf-btn')?.parentElement;
      if (filterBar) {
        const dateFilter = document.createElement('select');
        dateFilter.id = 'search-date-filter';
        dateFilter.style.cssText = 'padding:3px 8px;font-size:.75rem;border-radius:20px;border:1px solid var(--border);background:var(--card);color:var(--text);margin-left:auto;';
        dateFilter.innerHTML = `
          <option value="all">Cualquier fecha</option>
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>`;
        dateFilter.onchange = () => runSearch(document.getElementById('search-inp')?.value || '');
        filterBar.appendChild(dateFilter);
      }
    }

    const dateFilter = document.getElementById('search-date-filter')?.value || 'all';
    const now = Date.now();
    const cutoff = dateFilter === 'today' ? now - 86400000 :
                   dateFilter === 'week' ? now - 7*86400000 :
                   dateFilter === 'month' ? now - 30*86400000 : 0;

    origRunSearch.call(this, q);

    // Filter results by date if needed
    if (cutoff > 0 && container) {
      setTimeout(() => {
        // Re-apply but filtered — visual note only (can't re-render easily without duplicating)
        const note = document.createElement('p');
        note.style.cssText = 'font-size:.72rem;color:var(--text2);padding:5px 2px;';
        note.textContent = `Filtrado: ${dateFilter === 'today' ? 'hoy' : dateFilter === 'week' ? 'esta semana' : 'este mes'}`;
        container.prepend(note);
      }, 50);
    }
  };
})();

// ── 16. VISTA EN CUADRÍCULA DEL FEED ──
let feedGridMode = localStorage.getItem('sms_feed_grid') === '1';

function toggleFeedGrid() {
  feedGridMode = !feedGridMode;
  localStorage.setItem('sms_feed_grid', feedGridMode ? '1' : '0');
  const fp = document.getElementById('feed-posts');
  const btn = document.getElementById('feed-grid-btn');
  if (fp) {
    fp.classList.toggle('feed-grid-view', feedGridMode);
  }
  if (btn) {
    btn.innerHTML = feedGridMode ? '<i class="fas fa-list"></i>' : '<i class="fas fa-th"></i>';
    btn.title = feedGridMode ? 'Vista lista' : 'Vista cuadrícula';
  }
}

// Patch renderFeed to add grid toggle button
(function patchRenderFeed() {
  const origRenderFeed = window.renderFeed;
  if (!origRenderFeed) { setTimeout(patchRenderFeed, 800); return; }
  window.renderFeed = function() {
    origRenderFeed.call(this);
    setTimeout(() => {
      const sortArea = document.querySelector('#feed-posts')?.previousElementSibling;
      if (sortArea && !document.getElementById('feed-grid-btn')) {
        const btn = document.createElement('button');
        btn.id = 'feed-grid-btn';
        btn.className = 'btn-icon';
        btn.style.cssText = 'width:32px;height:32px;flex-shrink:0;';
        btn.innerHTML = feedGridMode ? '<i class="fas fa-list"></i>' : '<i class="fas fa-th"></i>';
        btn.title = feedGridMode ? 'Vista lista' : 'Vista cuadrícula';
        btn.onclick = toggleFeedGrid;
        const sortRow = document.querySelector('[style*="display:flex"][style*="justify-content:space-between"]');
        if (sortRow) sortRow.querySelector('div')?.appendChild(btn);
      }
      const fp = document.getElementById('feed-posts');
      if (fp && feedGridMode) fp.classList.add('feed-grid-view');
    }, 350);
  };
})();

// ── 17. SLIDESHOW DE FOTOS (Modo presentación) ──
function openSlideshow(images) {
  if (!images || !images.length) return;
  let idx = 0;
  let autoTimer = null;

  const overlay = document.createElement('div');
  overlay.id = 'slideshow-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;';

  function render() {
    overlay.innerHTML = `
      <div style="position:absolute;top:16px;right:16px;display:flex;gap:8px;z-index:2;">
        <button onclick="clearInterval(window._slideshowTimer);window._slideshowTimer=setInterval(()=>slideshowNext(),3000);this.textContent='⏸ Pausa'" id="ss-play" style="background:rgba(255,255,255,.15);border:none;color:#fff;padding:7px 14px;border-radius:20px;cursor:pointer;font-size:.82rem;">▶ Auto</button>
        <button onclick="document.getElementById('slideshow-overlay').remove();clearInterval(window._slideshowTimer);" style="background:rgba(255,255,255,.15);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1rem;">✕</button>
      </div>
      <div style="position:absolute;top:16px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.7);font-size:.82rem;">${idx+1} / ${images.length}</div>
      <img src="${images[idx]}" style="max-width:90vw;max-height:80vh;object-fit:contain;border-radius:8px;transition:opacity .3s;" id="ss-img" alt="">
      <div style="display:flex;gap:6px;margin-top:13px;">
        ${images.map((_, i) => `<div onclick="window._slideshowGoto(${i})" style="width:${i===idx?24:8}px;height:8px;border-radius:4px;background:${i===idx?'#fff':'rgba(255,255,255,.4)'};cursor:pointer;transition:.3s;"></div>`).join('')}
      </div>
      <div style="display:flex;gap:20px;margin-top:16px;">
        <button onclick="window._slideshowPrev()" style="background:rgba(255,255,255,.15);border:none;color:#fff;width:44px;height:44px;border-radius:50%;cursor:pointer;font-size:1.3rem;">‹</button>
        <button onclick="window._slideshowNext()" style="background:rgba(255,255,255,.15);border:none;color:#fff;width:44px;height:44px;border-radius:50%;cursor:pointer;font-size:1.3rem;">›</button>
      </div>`;
  }

  window._slideshowNext = () => { idx = (idx + 1) % images.length; render(); };
  window._slideshowPrev = () => { idx = (idx - 1 + images.length) % images.length; render(); };
  window._slideshowGoto = (i) => { idx = i; render(); };

  document.body.appendChild(overlay);
  render();

  // Keyboard nav
  overlay._keyHandler = (e) => {
    if (e.key === 'ArrowRight') window._slideshowNext();
    if (e.key === 'ArrowLeft') window._slideshowPrev();
    if (e.key === 'Escape') { overlay.remove(); clearInterval(window._slideshowTimer); document.removeEventListener('keydown', overlay._keyHandler); }
  };
  document.addEventListener('keydown', overlay._keyHandler);
}

// ── 18. POST PROGRAMADO CON PREVIEW ──
function showScheduledPreview() {
  const content = document.getElementById('comp-txt-public')?.value || document.getElementById('comp-txt-null')?.value || '';
  const schedTime = document.getElementById('comp-sched')?.value;

  if (!content.trim()) { toast('Escribe algo para previsualizar', 'warning'); return; }

  const previewModal = document.createElement('div');
  previewModal.className = 'modal';
  previewModal.innerHTML = `
    <div class="mbox" style="max-width:540px;">
      <div class="mhead"><h3><i class="fas fa-eye"></i> Preview del post programado</h3><button class="mclose" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button></div>
      <div style="padding:14px;">
        ${schedTime ? `<div style="background:var(--orange);color:#fff;border-radius:var(--r-md);padding:8px 13px;font-size:.83rem;margin-bottom:12px;">⏰ Se publicará el ${new Date(schedTime).toLocaleString('es-ES')}</div>` : ''}
        <div class="post" style="animation:none;margin-bottom:0;">
          <div class="post-hd">
            <img src="${CU?.photo||defAv()}" class="p-av" alt="">
            <div class="p-meta">
              <div class="p-author">${esc(CU?.username||'')} <span class="tag tag-gray">${esc(CU?.role||'Miembro')}</span></div>
              <div class="p-time"><span>Ahora</span><span>🌍</span></div>
            </div>
          </div>
          <div class="p-body" style="white-space:pre-wrap;">${renderHashtags(esc(content))}</div>
        </div>
        <p style="font-size:.75rem;color:var(--text2);margin-top:10px;">Así es exactamente como se verá tu post cuando se publique.</p>
      </div>
    </div>`;
  document.body.appendChild(previewModal);
  previewModal.style.display = 'flex';
}

// Patch del composer para añadir el botón de preview
(function patchComposer() {
  const origComposer = window.composer;
  if (!origComposer) { setTimeout(patchComposer, 800); return; }
  window.composer = function(ctx, gid) {
    let html = origComposer.call(this, ctx, gid);
    // Añadir botón de preview junto al botón de programar
    html = html.replace('</div><!-- /comp-extra', `<button class="btn btn-ghost" style="padding:5px 11px;font-size:.77rem;" onclick="showScheduledPreview()"><i class="fas fa-eye"></i> Preview</button></div><!-- /comp-extra`);
    return html;
  };
})();

// ── CSS DINÁMICO para las nuevas features ──
(function injectFeatureStyles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Voice record button */
    .voice-record-btn { background: var(--input-bg) !important; }
    .voice-record-btn.recording { background: var(--danger-l) !important; color: var(--danger) !important; animation: pulse-rec .8s ease infinite; }
    @keyframes pulse-rec { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }

    /* Feed grid view */
    .feed-grid-view { display: grid !important; grid-template-columns: repeat(auto-fill, minmax(270px, 1fr)); gap: 12px !important; }
    .feed-grid-view .post { margin-bottom: 0 !important; }
    .feed-grid-view .post .p-body { max-height: 80px; overflow: hidden; }
    .feed-grid-view .post .comments { display: none; }

    /* Offer card glow */
    .offer-card { box-shadow: 0 0 0 2px var(--orange) !important; }

    /* Debate card */
    .debate-card { border-left: 3px solid var(--purple) !important; }

    /* Challenge card */
    .challenge-card { background: linear-gradient(135deg, var(--card), rgba(245,158,11,.05)) !important; }

    /* Push notif toast */
    .push-notif-toast { max-width: 320px !important; padding-right: 8px !important; }
    .push-notif-toast:hover { transform: translateY(-2px); }

    /* Group stats card */
    .group-stats-card { border: 1px solid var(--border); }

    /* Streak badge pulse */
    .streak-badge { animation: streak-glow 2s ease-in-out infinite; }
    @keyframes streak-glow { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 8px rgba(245,158,11,.4)} }
  `;
  document.head.appendChild(style);
})();

// ── Patch openProfileModal to inject purchase history & heatmap & streak ──
(function patchProfileModal() {
  const origOPM = window.openProfileModal;
  if (!origOPM) { setTimeout(patchProfileModal, 900); return; }
  window.openProfileModal = function(uid) {
    origOPM.call(this, uid);
    setTimeout(() => {
      const profBody = document.getElementById('profile-modal-body') || document.getElementById('prof-modal-body');
      if (!profBody) return;

      // Streak
      const streakHtml = getStreakHtml(uid);
      if (streakHtml && !profBody.querySelector('.streak-badge')) {
        const nameEl = profBody.querySelector('.pm-name, .pc-name, [style*="font-weight:800"]');
        if (nameEl) nameEl.insertAdjacentHTML('afterend', `<div style="margin-top:5px;">${streakHtml}</div>`);
      }

      // Heatmap
      if (!profBody.querySelector('[style*="Mapa de actividad"]')) {
        const statsSection = profBody.querySelector('.profile-stats-mini, .psm-card');
        if (statsSection) {
          const parent = statsSection.closest('[style]') || statsSection.parentElement;
          if (parent) parent.insertAdjacentHTML('afterend', renderActivityHeatmap(uid));
        }
      }

      // Purchase History (own profile tab or profile page)
      if (uid === CU.id && !profBody.querySelector('[style*="Historial de transacciones"]')) {
        profBody.insertAdjacentHTML('beforeend', renderPurchaseHistory(uid));
      }
    }, 350);
  };
})();

// ── Patch renderGroupFeed to include challenges and stats ──
(function patchGroupFeedForChallenges() {
  const origRGF2 = window.renderGroupFeed;
  if (!origRGF2) { setTimeout(patchGroupFeedForChallenges, 1000); return; }
  window.renderGroupFeed = function(gid) {
    origRGF2.call(this, gid);
    setTimeout(() => {
      const area = document.getElementById('gfeed');
      if (!area) return;

      // Inject group stats after the header card
      const headerCard = area.querySelector('.card');
      if (headerCard && !area.querySelector('.group-stats-card')) {
        headerCard.insertAdjacentHTML('afterend', renderGroupStats(gid));
      }

      // Inject challenges
      const gChallenges = (window.challenges || []).filter(d => d.gid === gid);
      if (gChallenges.length && !area.querySelector('.challenge-card')) {
        const statsCard = area.querySelector('.group-stats-card');
        const insertAfter = statsCard || area.querySelector('.card');
        if (insertAfter) {
          const div = document.createElement('div');
          div.innerHTML = gChallenges.map(challengeCard).join('');
          insertAfter.after(div);
        }
      }

      // Add "Crear reto" button
      const manageBtnParent = area.querySelector('[onclick^="openGroupManage"]')?.parentElement;
      if (manageBtnParent && !manageBtnParent.querySelector('.challenge-create-btn')) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-ghost challenge-create-btn';
        btn.style.cssText = 'padding:6px 12px;font-size:.78rem;';
        btn.innerHTML = '<i class="fas fa-trophy"></i> Reto';
        btn.onclick = () => openChallengeCreator(gid);
        manageBtnParent.appendChild(btn);
      }
    }, 250);
  };
})();

// ── Profile page also shows heatmap ──
(function patchProfilePage() {
  const origRPP = window.renderProfilePage;
  if (!origRPP) { setTimeout(patchProfilePage, 900); return; }
  window.renderProfilePage = function(uid) {
    origRPP.call(this, uid);
    setTimeout(() => {
      const mc = document.getElementById('content');
      if (!mc) return;
      // Streak
      const streakHtml = getStreakHtml(uid);
      const nameEl = mc.querySelector('[style*="font-weight:800"]');
      if (streakHtml && nameEl && !mc.querySelector('.streak-badge')) {
        nameEl.insertAdjacentHTML('afterend', `<div style="margin:5px 0;">${streakHtml}</div>`);
      }
      // Heatmap
      if (!mc.querySelector('[style*="Mapa de actividad"]')) {
        const statsRow = mc.querySelector('.profile-stats-mini');
        if (statsRow) statsRow.insertAdjacentHTML('afterend', renderActivityHeatmap(uid));
      }
      // Purchase history (only own profile)
      if (uid === CU.id && !mc.querySelector('[style*="Historial de transacciones"]')) {
        const card = mc.querySelector('.card:last-of-type');
        if (card) card.insertAdjacentHTML('afterend', `<div class="card" style="padding:16px;margin-top:12px;">${renderPurchaseHistory(uid)}</div>`);
      }
    }, 400);
  };
})();

console.log('[Serakdep Features v2.0] ✅ Todas las features cargadas:',
  'Push notifs, Voice chat, DND badge, Stories music, Debates, Retos, Group stats,',
  'Comment mentions, Marketplace discounts, Purchase history, Text ratings,',
  'Leaderboard, Activity streak, Heatmap, Search filters, Grid feed, Slideshow, Post preview'
);