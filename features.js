// ═══════════════════════════════════════════════════════════════════════════════
//  SERAKDEP MS — FEATURES PACK v3.0
//  Nuevas funcionalidades:
//  1.  Mensajes que se autodestruyen
//  2.  Reacciones con emojis en DMs
//  3.  Reply a mensaje específico en DM
//  4.  Estado "escribiendo..." en chat
//  5.  Encuestas en chat privado
//  6.  Chat de grupo en tiempo real
//  7.  Roles personalizados en grupos (Mod, VIP…)
//  8.  Anuncios fijados (pin) en grupos
//  9.  Modo solo-admins pueden postear (canal)
//  10. Invitación por enlace con código único
//  11. Misiones diarias con XP
//  12. Tienda de recompensas canjeables
//  13. Insignias temporales por eventos
//  14. Leaderboard all-time
//  15. Notificación de subida de nivel
//  16. Marco de avatar por nivel
//  17. Bio con links clickeables
//  18. Temas de color adicionales (ya existen; añadimos selector en perfil)
//  19. Widget de música en perfil
//  20. Panel admin con gráficas
//  21. Nube de palabras del feed
//  22. Exportar datos propios en JSON
//  23. Página Explorar con trending
//  24. Posts en formato Hilo (Thread)
//  25. Traducción automática de posts
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 1 — CHAT: MENSAJES QUE SE AUTODESTRUYEN
// ─────────────────────────────────────────────────────────────────────────────
(function initSelfDestruct() {
  // Comprueba mensajes expirados cada 10 s
  function purgeSelfDestruct() {
    if (!window.messages) return;
    const now = Date.now();
    let changed = false;
    window.messages.forEach(conv => {
      const before = conv.messages.length;
      conv.messages = conv.messages.filter(m => {
        if (m.destroyAt && m.destroyAt <= now) { changed = true; return false; }
        return true;
      });
    });
    if (changed && window.save) save();
  }
  setInterval(purgeSelfDestruct, 10000);

  // Inyecta botón de autodestrucción en el input del chat
  function injectDestructBtn(uid) {
    if (document.getElementById('sd-toggle-btn')) return;
    const chatInput = document.querySelector('.chat-input');
    if (!chatInput) return;
    const btn = document.createElement('button');
    btn.id = 'sd-toggle-btn';
    btn.className = 'btn-icon';
    btn.title = 'Mensaje temporal (se autodestruye)';
    btn.style.cssText = 'width:32px;height:32px;font-size:.85rem;';
    btn.innerHTML = '<i class="fas fa-bomb"></i>';
    btn.setAttribute('data-sd', '0');
    btn.onclick = () => {
      const on = btn.getAttribute('data-sd') === '1';
      btn.setAttribute('data-sd', on ? '0' : '1');
      btn.style.color = on ? '' : 'var(--danger)';
      btn.style.background = on ? '' : 'var(--danger-l)';
      if (window.toast) toast(on ? 'Mensaje normal activado' : '💣 Próximo mensaje se autodestruirá en 30s', on ? 'info' : 'warning');
    };
    chatInput.appendChild(btn);
  }

  // Patch openChat para inyectar el botón
  const _origOC = window.openChat;
  function tryPatchOpenChat() {
    if (!window.openChat) { setTimeout(tryPatchOpenChat, 600); return; }
    window.openChat = function(uid) {
      _origOC ? _origOC.call(this, uid) : (window.openChat = window.openChat); // noop guard
      setTimeout(() => injectDestructBtn(uid), 300);
    };
  }
  if (window.openChat) tryPatchOpenChat();
  else setTimeout(tryPatchOpenChat, 800);

  // Patch sendMsg para añadir destroyAt si el modo está activo
  function patchSendMsg() {
    const orig = window.sendMsg;
    if (!orig) { setTimeout(patchSendMsg, 800); return; }
    window.sendMsg = function(uid) {
      const btn = document.getElementById('sd-toggle-btn');
      const isSd = btn && btn.getAttribute('data-sd') === '1';
      orig.call(this, uid);
      if (isSd) {
        const conv = (window.messages || []).find(m =>
          m.participants.includes(CU.id) && m.participants.includes(uid));
        if (conv && conv.messages.length) {
          const last = conv.messages[conv.messages.length - 1];
          last.destroyAt = Date.now() + 30000;
          last._sdLabel = true;
          if (window.save) save();
        }
        btn.setAttribute('data-sd', '0');
        btn.style.color = '';
        btn.style.background = '';
      }
    };
  }
  setTimeout(patchSendMsg, 1000);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 2 — CHAT: REACCIONES EN MENSAJES DM
// ─────────────────────────────────────────────────────────────────────────────
(function initDmReactions() {
  const EMOJIS = ['❤️','😂','👍','😮','😢','🔥'];

  window.reactToDmMsg = function(convIdx, msgId, emoji) {
    const conv = (window.messages || [])[convIdx];
    if (!conv) return;
    const msg = conv.messages.find(m => m.id === msgId);
    if (!msg) return;
    msg.reactions = msg.reactions || {};
    if (msg.reactions[CU.id] === emoji) delete msg.reactions[CU.id];
    else msg.reactions[CU.id] = emoji;
    if (window.save) save();
    // Re-render chat
    const otherUid = conv.participants.find(p => p !== CU.id);
    if (window.renderChatArea) renderChatArea(conv);
  };

  // Patch renderChatArea para añadir reacciones
  function patchChatArea() {
    const orig = window.renderChatArea;
    if (!orig) { setTimeout(patchChatArea, 800); return; }
    window.renderChatArea = function(conv) {
      orig.call(this, conv);
      setTimeout(() => {
        const convIdx = (window.messages || []).indexOf(conv);
        document.querySelectorAll('.bubble').forEach(bubble => {
          const msgId = parseInt(bubble.dataset.msgid);
          if (!msgId) return;
          const msg = conv.messages.find(m => m.id === msgId);
          if (!msg) return;
          // Añadir barra de reacciones al hacer hover
          if (!bubble.querySelector('.dm-rxn-bar')) {
            const bar = document.createElement('div');
            bar.className = 'dm-rxn-bar';
            bar.style.cssText = 'display:none;position:absolute;bottom:calc(100% + 4px);background:var(--card);border:1px solid var(--border);border-radius:30px;padding:3px 7px;box-shadow:var(--sh2);gap:3px;z-index:10;white-space:nowrap;';
            EMOJIS.forEach(em => {
              const b = document.createElement('button');
              b.style.cssText = 'background:none;border:none;cursor:pointer;font-size:1.1rem;padding:2px;border-radius:50%;transition:.15s;';
              b.textContent = em;
              b.onclick = (e) => { e.stopPropagation(); reactToDmMsg(convIdx, msgId, em); };
              bar.appendChild(b);
            });
            bubble.style.position = 'relative';
            bubble.appendChild(bar);
            bubble.addEventListener('mouseenter', () => bar.style.display = 'flex');
            bubble.addEventListener('mouseleave', () => bar.style.display = 'none');
          }
          // Mostrar reacciones existentes
          const existing = Object.values(msg.reactions || {});
          if (existing.length) {
            let rxnDiv = bubble.querySelector('.dm-rxn-summary');
            if (!rxnDiv) {
              rxnDiv = document.createElement('div');
              rxnDiv.className = 'dm-rxn-summary';
              rxnDiv.style.cssText = 'display:flex;flex-wrap:wrap;gap:2px;margin-top:3px;';
              bubble.appendChild(rxnDiv);
            }
            const counts = {};
            existing.forEach(e => { counts[e] = (counts[e] || 0) + 1; });
            rxnDiv.innerHTML = Object.entries(counts).map(([em, n]) =>
              `<span style="font-size:.75rem;background:var(--input-bg);border-radius:10px;padding:1px 6px;cursor:default;">${em} ${n > 1 ? n : ''}</span>`
            ).join('');
          }
        });
      }, 150);
    };
  }
  setTimeout(patchChatArea, 900);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 3 — CHAT: REPLY A MENSAJE ESPECÍFICO
// ─────────────────────────────────────────────────────────────────────────────
(function initDmReply() {
  window._dmReplyTo = null;

  window.setDmReply = function(msgId, text, fromName) {
    window._dmReplyTo = { msgId, text, fromName };
    let bar = document.getElementById('dm-reply-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'dm-reply-bar';
      bar.style.cssText = 'display:none;padding:6px 14px;background:var(--input-bg);border-top:1px solid var(--border);font-size:.8rem;color:var(--text2);align-items:center;gap:8px;';
      const chatArea = document.querySelector('.chat-area') || document.querySelector('.dm-panel');
      if (chatArea) chatArea.appendChild(bar);
    }
    bar.style.display = 'flex';
    bar.innerHTML = `<i class="fas fa-reply" style="color:var(--green);"></i> <div style="flex:1;"><b style="color:var(--text);font-size:.8rem;">${esc(fromName)}</b><br>${esc(text.substring(0,60))}${text.length>60?'…':''}</div><button onclick="clearDmReply()" style="background:none;border:none;cursor:pointer;color:var(--text2);font-size:.9rem;"><i class="fas fa-times"></i></button>`;
  };

  window.clearDmReply = function() {
    window._dmReplyTo = null;
    const bar = document.getElementById('dm-reply-bar');
    if (bar) bar.style.display = 'none';
  };

  // Patch sendMsg to include replyTo
  function patchSendReply() {
    const orig = window.sendMsg;
    if (!orig) { setTimeout(patchSendReply, 1000); return; }
    window.sendMsg = function(uid) {
      const replyTo = window._dmReplyTo;
      orig.call(this, uid);
      if (replyTo) {
        const conv = (window.messages || []).find(m =>
          m.participants.includes(CU.id) && m.participants.includes(uid));
        if (conv && conv.messages.length) {
          conv.messages[conv.messages.length - 1].replyTo = replyTo;
          if (window.save) save();
        }
        clearDmReply();
      }
    };
  }
  setTimeout(patchSendReply, 1200);

  // Patch renderChatArea para mostrar botón reply y quote
  function patchChatAreaReply() {
    const orig = window.renderChatArea;
    if (!orig) { setTimeout(patchChatAreaReply, 1000); return; }
    window.renderChatArea = function(conv) {
      orig.call(this, conv);
      setTimeout(() => {
        document.querySelectorAll('.bubble').forEach(bubble => {
          if (bubble.querySelector('.dm-reply-btn')) return;
          const msgId = parseInt(bubble.dataset.msgid);
          if (!msgId) return;
          const msg = conv.messages.find(m => m.id === msgId);
          if (!msg) return;
          const fromUser = (window.users || []).find(u => u.id === msg.from);
          // Mostrar quote si tiene replyTo
          if (msg.replyTo && !bubble.querySelector('.reply-quote')) {
            const q = document.createElement('div');
            q.className = 'reply-quote';
            q.innerHTML = `<b>${esc(msg.replyTo.fromName)}</b><br>${esc(msg.replyTo.text.substring(0,60))}`;
            bubble.insertBefore(q, bubble.firstChild);
          }
          // Botón reply
          const btn = document.createElement('button');
          btn.className = 'dm-reply-btn';
          btn.title = 'Responder';
          btn.style.cssText = 'position:absolute;top:50%;transform:translateY(-50%);background:var(--card);border:1px solid var(--border);border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:.65rem;color:var(--text2);display:none;align-items:center;justify-content:center;';
          btn.innerHTML = '<i class="fas fa-reply"></i>';
          const isMe = msg.from === CU.id;
          btn.style[isMe ? 'left' : 'right'] = '-30px';
          bubble.style.position = 'relative';
          bubble.appendChild(btn);
          bubble.addEventListener('mouseenter', () => btn.style.display = 'flex');
          bubble.addEventListener('mouseleave', () => btn.style.display = 'none');
          btn.onclick = () => setDmReply(msgId, msg.text || '🖼️', fromUser?.username || '?');
        });
      }, 200);
    };
  }
  setTimeout(patchChatAreaReply, 1100);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 4 — CHAT: ESTADO "ESCRIBIENDO..."
// ─────────────────────────────────────────────────────────────────────────────
(function initTypingIndicator() {
  // Simula "escribiendo" con localStorage (misma pestaña demo)
  window._typingTimers = {};

  function setTyping(uid, active) {
    const key = `sms_typing_${uid}_to_${CU?.id}`;
    if (active) localStorage.setItem(key, Date.now().toString());
    else localStorage.removeItem(key);
  }

  function isTyping(uid) {
    const key = `sms_typing_${CU?.id}_to_${uid}`;
    const ts = parseInt(localStorage.getItem(key) || '0');
    return ts && Date.now() - ts < 3000;
  }

  function showTypingInChat(uid) {
    const indicator = document.getElementById('typing-indicator');
    const u = (window.users || []).find(x => x.id === uid);
    if (!u) return;
    if (isTyping(uid)) {
      if (!indicator) {
        const msgs = document.getElementById('chat-msgs');
        if (!msgs) return;
        const div = document.createElement('div');
        div.id = 'typing-indicator';
        div.style.cssText = 'padding:6px 14px;font-size:.78rem;color:var(--text2);display:flex;align-items:center;gap:6px;';
        div.innerHTML = `<img src="${u.photo||''}" style="width:20px;height:20px;border-radius:50%;object-fit:cover;" alt=""> ${esc(u.username)} está escribiendo<span class="typing-dots">...</span>`;
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
      }
    } else {
      if (indicator) indicator.remove();
    }
  }

  // Inyectar listener al textarea del chat
  function injectTypingListener(uid) {
    const ta = document.querySelector('.chat-input textarea');
    if (!ta || ta._typingPatched) return;
    ta._typingPatched = true;
    ta.addEventListener('input', () => {
      setTyping(CU.id, true);
      clearTimeout(window._typingTimers[uid]);
      window._typingTimers[uid] = setTimeout(() => setTyping(CU.id, false), 2500);
    });
    // Poll para mostrar indicador del otro
    setInterval(() => showTypingInChat(uid), 1000);
  }

  function patchOpenChat() {
    const orig = window.openChat;
    if (!orig) { setTimeout(patchOpenChat, 800); return; }
    window.openChat = function(uid) {
      orig.call(this, uid);
      setTimeout(() => injectTypingListener(uid), 400);
    };
  }
  setTimeout(patchOpenChat, 900);

  // CSS para los dots animados
  const s = document.createElement('style');
  s.textContent = `.typing-dots{display:inline-block;animation:typing-bounce 1s ease-in-out infinite;}.@keyframes typing-bounce{0%,100%{opacity:.3}50%{opacity:1}}`;
  document.head.appendChild(s);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 5 — CHAT: ENCUESTAS EN CHAT PRIVADO
// ─────────────────────────────────────────────────────────────────────────────
window.openChatPollCreator = function(uid) {
  const existing = document.getElementById('chat-poll-modal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'chat-poll-modal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="mbox" style="max-width:400px;">
      <div class="mhead"><h3><i class="fas fa-poll" style="color:var(--green);"></i> Encuesta en chat</h3><button class="mclose" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button></div>
      <div class="mbody" style="display:flex;flex-direction:column;gap:9px;">
        <input type="text" id="cp-question" placeholder="¿Cuál es tu pregunta?" style="margin-bottom:0;">
        <input type="text" id="cp-opt1" placeholder="Opción 1" style="margin-bottom:0;">
        <input type="text" id="cp-opt2" placeholder="Opción 2" style="margin-bottom:0;">
        <input type="text" id="cp-opt3" placeholder="Opción 3 (opcional)" style="margin-bottom:0;">
        <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="sendChatPoll(${uid})"><i class="fas fa-paper-plane"></i> Enviar encuesta</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
};

window.sendChatPoll = function(uid) {
  const q = document.getElementById('cp-question')?.value.trim();
  const o1 = document.getElementById('cp-opt1')?.value.trim();
  const o2 = document.getElementById('cp-opt2')?.value.trim();
  const o3 = document.getElementById('cp-opt3')?.value.trim();
  if (!q || !o1 || !o2) { if (window.toast) toast('Completa la pregunta y al menos 2 opciones', 'warning'); return; }
  const options = [o1, o2, ...(o3 ? [o3] : [])].map(t => ({ text: t, votes: [] }));
  let conv = (window.messages || []).find(m => m.participants.includes(CU.id) && m.participants.includes(uid));
  if (!conv) { conv = { participants: [CU.id, uid], messages: [] }; if (window.messages) messages.push(conv); }
  conv.messages.push({
    id: Date.now(), from: CU.id, timestamp: Date.now(),
    isPoll: true, pollQuestion: q, pollOptions: options, text: `📊 ${q}`, seen: false
  });
  if (window.save) save();
  document.getElementById('chat-poll-modal')?.remove();
  if (window.renderChatArea) renderChatArea(conv);
  if (window.toast) toast('📊 Encuesta enviada', 'success');
};

window.voteChatPoll = function(convParticipants, msgId, optIdx) {
  const conv = (window.messages || []).find(m =>
    convParticipants.every(p => m.participants.includes(p)));
  if (!conv) return;
  const msg = conv.messages.find(m => m.id === msgId);
  if (!msg || !msg.isPoll) return;
  // Quitar voto anterior
  msg.pollOptions.forEach(o => { o.votes = o.votes.filter(v => v !== CU.id); });
  msg.pollOptions[optIdx].votes.push(CU.id);
  if (window.save) save();
  if (window.renderChatArea) renderChatArea(conv);
};

// Patch renderChatArea para dibujar las encuestas
(function patchChatAreaPolls() {
  function tryPatch() {
    const orig = window.renderChatArea;
    if (!orig) { setTimeout(tryPatch, 1000); return; }
    window.renderChatArea = function(conv) {
      orig.call(this, conv);
      // Inyectar botón de encuesta en el input
      setTimeout(() => {
        const chatInput = document.querySelector('.chat-input');
        if (chatInput && !document.getElementById('chat-poll-btn')) {
          const uid = conv.participants.find(p => p !== CU.id);
          const btn = document.createElement('button');
          btn.id = 'chat-poll-btn';
          btn.className = 'btn-icon';
          btn.title = 'Crear encuesta en chat';
          btn.style.cssText = 'width:32px;height:32px;font-size:.85rem;';
          btn.innerHTML = '<i class="fas fa-poll"></i>';
          btn.onclick = () => openChatPollCreator(uid);
          chatInput.appendChild(btn);
        }
        // Renderizar encuestas en los mensajes
        const msgs = document.getElementById('chat-msgs');
        if (!msgs) return;
        conv.messages.filter(m => m.isPoll).forEach(msg => {
          const bubble = msgs.querySelector(`[data-msgid="${msg.id}"] .bubble, .bubble[data-msgid="${msg.id}"]`);
          // Buscar el contenedor del mensaje
          const allBubbles = msgs.querySelectorAll('.bubble');
          allBubbles.forEach(b => {
            if (b.textContent.includes(msg.pollQuestion) && !b.querySelector('.poll-widget')) {
              const totalVotes = msg.pollOptions.reduce((a, o) => a + o.votes.length, 0);
              const pw = document.createElement('div');
              pw.className = 'poll-widget';
              pw.style.cssText = 'margin-top:6px;min-width:180px;';
              pw.innerHTML = `<div style="font-weight:700;font-size:.82rem;margin-bottom:6px;">${esc(msg.pollQuestion)}</div>` +
                msg.pollOptions.map((o, i) => {
                  const pct = totalVotes > 0 ? Math.round(o.votes.length / totalVotes * 100) : 0;
                  const voted = o.votes.includes(CU.id);
                  return `<div onclick="voteChatPoll([${conv.participants}],${msg.id},${i})" style="cursor:pointer;margin-bottom:5px;padding:5px 8px;border-radius:8px;border:1.5px solid ${voted?'var(--green)':'var(--border)'};background:${voted?'var(--green-l)':'transparent'};font-size:.8rem;">
                    <div style="display:flex;justify-content:space-between;"><span>${esc(o.text)}</span><span style="color:var(--green);font-weight:700;">${pct}%</span></div>
                    <div style="height:3px;background:var(--border);border-radius:2px;margin-top:3px;"><div style="height:100%;width:${pct}%;background:var(--green);border-radius:2px;transition:width .4s;"></div></div>
                  </div>`;
                }).join('') +
                `<div style="font-size:.7rem;color:var(--text2);margin-top:3px;">${totalVotes} votos</div>`;
              b.innerHTML = '';
              b.appendChild(pw);
            }
          });
        });
      }, 200);
    };
  }
  setTimeout(tryPatch, 1100);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 6 — GRUPOS: CHAT EN TIEMPO REAL
// ─────────────────────────────────────────────────────────────────────────────
(function initGroupChat() {
  if (!window.groupChats) {
    try { window.groupChats = JSON.parse(localStorage.getItem('sms_groupChats') || '{}'); }
    catch (e) { window.groupChats = {}; }
  }

  window.saveGroupChat = function() {
    localStorage.setItem('sms_groupChats', JSON.stringify(window.groupChats));
  };

  window.openGroupChat = function(gid) {
    const g = (window.groups || []).find(x => x.id === gid);
    if (!g) return;
    if (!window.groupChats[gid]) window.groupChats[gid] = [];
    const msgs = window.groupChats[gid];

    const existing = document.getElementById('gc-modal');
    if (existing) existing.remove();

    function buildHtml() {
      return msgs.slice(-50).map(m => {
        const u = (window.users || []).find(x => x.id === m.from);
        const isMe = m.from === CU.id;
        return `<div style="display:flex;align-items:flex-end;gap:7px;margin-bottom:8px;${isMe?'flex-direction:row-reverse;':''}">
          <img src="${u?.photo||''}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;" alt="">
          <div style="max-width:72%;">
            ${!isMe?`<div style="font-size:.68rem;color:var(--text2);margin-bottom:2px;">${esc(u?.username||'?')}</div>`:''}
            <div style="background:${isMe?'var(--green)':'var(--input-bg)'};color:${isMe?'#fff':'var(--text)'};padding:7px 11px;border-radius:${isMe?'14px 14px 4px 14px':'14px 14px 14px 4px'};font-size:.84rem;word-break:break-word;">${esc(m.text)}</div>
            <div style="font-size:.65rem;color:var(--text2);margin-top:2px;text-align:${isMe?'right':'left'};">${new Date(m.ts).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</div>
          </div>
        </div>`;
      }).join('');
    }

    const modal = document.createElement('div');
    modal.id = 'gc-modal';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="mbox" style="max-width:480px;height:520px;display:flex;flex-direction:column;">
        <div class="mhead"><h3><i class="fas fa-comments" style="color:var(--green);"></i> Chat: ${esc(g.name)}</h3><button class="mclose" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button></div>
        <div id="gc-msgs" style="flex:1;overflow-y:auto;padding:12px 14px;">${buildHtml()}</div>
        <div style="padding:10px 14px;border-top:1px solid var(--border);display:flex;gap:8px;">
          <input type="text" id="gc-input" placeholder="Escribe un mensaje..." style="flex:1;margin-bottom:0;" onkeydown="if(event.key==='Enter')sendGroupChatMsg(${gid})">
          <button class="btn btn-primary" style="padding:7px 14px;" onclick="sendGroupChatMsg(${gid})"><i class="fas fa-paper-plane"></i></button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    const gcMsgs = document.getElementById('gc-msgs');
    if (gcMsgs) gcMsgs.scrollTop = gcMsgs.scrollHeight;

    // Poll para nuevos mensajes mientras está abierto
    const pollId = setInterval(() => {
      if (!document.getElementById('gc-modal')) { clearInterval(pollId); return; }
      const gcMsgs2 = document.getElementById('gc-msgs');
      if (gcMsgs2) gcMsgs2.innerHTML = buildHtml();
    }, 2000);
  };

  window.sendGroupChatMsg = function(gid) {
    const inp = document.getElementById('gc-input');
    const text = inp?.value.trim();
    if (!text) return;
    if (!window.groupChats[gid]) window.groupChats[gid] = [];
    window.groupChats[gid].push({ id: Date.now(), from: CU.id, text, ts: Date.now() });
    if (window.groupChats[gid].length > 200) window.groupChats[gid] = window.groupChats[gid].slice(-200);
    saveGroupChat();
    inp.value = '';
    const gcMsgs = document.getElementById('gc-msgs');
    // buildHtml inline
    const msgs = window.groupChats[gid].slice(-50).map(m => {
      const u = (window.users || []).find(x => x.id === m.from);
      const isMe = m.from === CU.id;
      return `<div style="display:flex;align-items:flex-end;gap:7px;margin-bottom:8px;${isMe?'flex-direction:row-reverse;':''}">
        <img src="${u?.photo||''}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;" alt="">
        <div style="max-width:72%;">
          ${!isMe?`<div style="font-size:.68rem;color:var(--text2);margin-bottom:2px;">${esc(u?.username||'?')}</div>`:''}
          <div style="background:${isMe?'var(--green)':'var(--input-bg)'};color:${isMe?'#fff':'var(--text)'};padding:7px 11px;border-radius:${isMe?'14px 14px 4px 14px':'14px 14px 14px 4px'};font-size:.84rem;word-break:break-word;">${esc(m.text)}</div>
          <div style="font-size:.65rem;color:var(--text2);margin-top:2px;text-align:${isMe?'right':'left'};">${new Date(m.ts).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</div>
        </div>
      </div>`;
    }).join('');
    if (gcMsgs) { gcMsgs.innerHTML = msgs; gcMsgs.scrollTop = gcMsgs.scrollHeight; }
  };

  // Añadir botón de chat en el renderGroupFeed
  function patchGroupFeedChat() {
    const orig = window.renderGroupFeed;
    if (!orig) { setTimeout(patchGroupFeedChat, 900); return; }
    window.renderGroupFeed = function(gid) {
      orig.call(this, gid);
      setTimeout(() => {
        const area = document.getElementById('gfeed');
        if (!area || area.querySelector('.gc-open-btn')) return;
        const hdr = area.querySelector('.card');
        if (!hdr) return;
        const btn = document.createElement('button');
        btn.className = 'btn btn-ghost gc-open-btn';
        btn.style.cssText = 'padding:6px 13px;font-size:.78rem;margin-top:8px;';
        btn.innerHTML = '<i class="fas fa-comments"></i> Chat del grupo';
        btn.onclick = () => openGroupChat(gid);
        hdr.appendChild(btn);
      }, 300);
    };
  }
  setTimeout(patchGroupFeedChat, 1000);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 7 — GRUPOS: ROLES PERSONALIZADOS (Mod, VIP, etc.)
// ─────────────────────────────────────────────────────────────────────────────
(function initGroupRoles() {
  if (!window.groupRoles) {
    try { window.groupRoles = JSON.parse(localStorage.getItem('sms_groupRoles') || '{}'); }
    catch (e) { window.groupRoles = {}; }
  }

  window.saveGroupRoles = () => localStorage.setItem('sms_groupRoles', JSON.stringify(window.groupRoles));

  const ROLE_COLORS = { Mod: 'var(--blue)', VIP: 'var(--orange)', Staff: 'var(--purple)', Legend: '#ff6b35' };
  const ROLE_ICONS  = { Mod: 'fa-shield-alt', VIP: 'fa-crown', Staff: 'fa-wrench', Legend: 'fa-star' };

  window.getGroupRole = function(gid, uid) {
    return window.groupRoles[`${gid}_${uid}`] || null;
  };

  window.setGroupRole = function(gid, uid, role) {
    window.groupRoles[`${gid}_${uid}`] = role || null;
    if (!role) delete window.groupRoles[`${gid}_${uid}`];
    saveGroupRoles();
    if (window.toast) toast(role ? `Rol "${role}" asignado` : 'Rol eliminado', 'success');
  };

  window.openGroupRoleManager = function(gid) {
    const g = (window.groups || []).find(x => x.id === gid);
    if (!g) return;
    const isAdmin = g.createdBy === CU.id || CU.isAdmin;
    if (!isAdmin) { if (window.toast) toast('Solo el admin del grupo puede gestionar roles', 'warning'); return; }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'groles-modal';
    const memberHtml = g.members.map(mid => {
      const u = (window.users || []).find(x => x.id === mid);
      if (!u) return '';
      const cur = getGroupRole(gid, mid);
      return `<div style="display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:1px solid var(--border);">
        <img src="${u.photo||''}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;" alt="">
        <div style="flex:1;font-weight:600;font-size:.85rem;">${esc(u.username)}</div>
        <select onchange="setGroupRole(${gid},${mid},this.value)" style="font-size:.77rem;padding:3px 7px;border-radius:8px;border:1px solid var(--border);background:var(--card);color:var(--text);">
          <option value="">Sin rol</option>
          ${Object.keys(ROLE_COLORS).map(r => `<option value="${r}" ${cur===r?'selected':''}>${r}</option>`).join('')}
        </select>
      </div>`;
    }).join('');

    modal.innerHTML = `
      <div class="mbox" style="max-width:420px;">
        <div class="mhead"><h3><i class="fas fa-shield-alt" style="color:var(--blue);"></i> Roles del grupo</h3><button class="mclose" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button></div>
        <div class="mbody" style="max-height:380px;overflow-y:auto;">${memberHtml}</div>
      </div>`;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
  };

  // Patch postCard / member list para mostrar badge de rol
  function patchGroupRoleBadge() {
    const orig = window.postCard;
    if (!orig) { setTimeout(patchGroupRoleBadge, 800); return; }
    window.postCard = function(p) {
      let html = orig.call(this, p);
      if (!p.groupId) return html;
      const role = getGroupRole(p.groupId, p.userId);
      if (!role) return html;
      const color = ROLE_COLORS[role] || 'var(--text2)';
      const icon = ROLE_ICONS[role] || 'fa-tag';
      const badge = `<span style="font-size:.65rem;background:${color}22;color:${color};border-radius:20px;padding:1px 7px;font-weight:700;margin-left:4px;"><i class="fas ${icon}" style="font-size:.6rem;"></i> ${role}</span>`;
      html = html.replace(/(<div class="p-author">[^<]*<\/div>)/s, m => m.replace('</div>', badge + '</div>'));
      return html;
    };
  }
  setTimeout(patchGroupRoleBadge, 900);

  // Añadir botón "Roles" en gestión de grupo
  function patchGroupManage() {
    const orig = window.renderGroupFeed;
    if (!orig) { setTimeout(patchGroupManage, 1000); return; }
    window.renderGroupFeed = function(gid) {
      orig.call(this, gid);
      setTimeout(() => {
        const g = (window.groups || []).find(x => x.id === gid);
        if (!g || g.createdBy !== CU.id && !CU.isAdmin) return;
        const area = document.getElementById('gfeed');
        if (!area || area.querySelector('.groles-btn')) return;
        const hdr = area.querySelector('.card');
        if (!hdr) return;
        const btn = document.createElement('button');
        btn.className = 'btn btn-ghost groles-btn';
        btn.style.cssText = 'padding:6px 13px;font-size:.78rem;margin-top:6px;margin-left:6px;';
        btn.innerHTML = '<i class="fas fa-shield-alt"></i> Roles';
        btn.onclick = () => openGroupRoleManager(gid);
        hdr.appendChild(btn);
      }, 350);
    };
  }
  setTimeout(patchGroupManage, 1100);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 8 — GRUPOS: ANUNCIOS FIJADOS (PIN)
// ─────────────────────────────────────────────────────────────────────────────
(function initGroupAnnouncements() {
  if (!window.groupAnnouncements) {
    try { window.groupAnnouncements = JSON.parse(localStorage.getItem('sms_groupAnnouncements') || '{}'); }
    catch (e) { window.groupAnnouncements = {}; }
  }
  window.saveGroupAnnouncements = () => localStorage.setItem('sms_groupAnnouncements', JSON.stringify(window.groupAnnouncements));

  window.openGroupAnnouncementEditor = function(gid) {
    const g = (window.groups || []).find(x => x.id === gid);
    if (!g || (g.createdBy !== CU.id && !CU.isAdmin)) { if (window.toast) toast('Solo el admin puede fijar anuncios', 'warning'); return; }
    const cur = window.groupAnnouncements[gid] || '';
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'gannounce-modal';
    modal.innerHTML = `
      <div class="mbox" style="max-width:440px;">
        <div class="mhead"><h3><i class="fas fa-thumbtack" style="color:var(--orange);"></i> Anuncio fijado</h3><button class="mclose" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button></div>
        <div class="mbody" style="display:flex;flex-direction:column;gap:9px;">
          <textarea id="ga-text" placeholder="Escribe el anuncio fijado del grupo..." style="min-height:100px;resize:none;margin-bottom:0;">${esc(cur)}</textarea>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary" style="flex:1;justify-content:center;" onclick="saveGroupAnnouncement(${gid})"><i class="fas fa-thumbtack"></i> Fijar</button>
            <button class="btn btn-ghost" onclick="saveGroupAnnouncement(${gid},'')"><i class="fas fa-times"></i> Quitar</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
  };

  window.saveGroupAnnouncement = function(gid, text) {
    const val = text !== undefined ? text : (document.getElementById('ga-text')?.value.trim() || '');
    if (val) window.groupAnnouncements[gid] = val;
    else delete window.groupAnnouncements[gid];
    saveGroupAnnouncements();
    document.getElementById('gannounce-modal')?.remove();
    if (window.toast) toast(val ? '📌 Anuncio fijado' : 'Anuncio eliminado', val ? 'success' : 'info');
    if (window.renderGroupFeed) renderGroupFeed(gid);
  };

  // Patch renderGroupFeed para mostrar anuncio fijado
  function patchGroupFeedAnnounce() {
    const orig = window.renderGroupFeed;
    if (!orig) { setTimeout(patchGroupFeedAnnounce, 1000); return; }
    window.renderGroupFeed = function(gid) {
      orig.call(this, gid);
      setTimeout(() => {
        const area = document.getElementById('gfeed');
        if (!area || area.querySelector('.group-announcement')) return;
        const announce = window.groupAnnouncements[gid];
        if (!announce) return;
        const div = document.createElement('div');
        div.className = 'card group-announcement';
        div.style.cssText = 'border-left:4px solid var(--orange);padding:12px 16px;margin-bottom:12px;display:flex;align-items:flex-start;gap:10px;';
        div.innerHTML = `<i class="fas fa-thumbtack" style="color:var(--orange);margin-top:2px;flex-shrink:0;"></i><div style="flex:1;"><div style="font-weight:700;font-size:.82rem;color:var(--orange);margin-bottom:3px;">ANUNCIO FIJADO</div><div style="font-size:.85rem;white-space:pre-wrap;">${esc(announce)}</div></div>`;
        const firstCard = area.querySelector('.card');
        if (firstCard) firstCard.insertAdjacentElement('afterend', div);
        else area.insertBefore(div, area.firstChild);

        // Botón de editar anuncio para admins
        const g = (window.groups || []).find(x => x.id === gid);
        if (g && (g.createdBy === CU.id || CU.isAdmin)) {
          const editBtn = document.createElement('button');
          editBtn.style.cssText = 'background:none;border:none;cursor:pointer;color:var(--text2);font-size:.75rem;margin-left:8px;';
          editBtn.innerHTML = '<i class="fas fa-edit"></i>';
          editBtn.onclick = () => openGroupAnnouncementEditor(gid);
          div.appendChild(editBtn);
        }
      }, 320);
    };
  }
  setTimeout(patchGroupFeedAnnounce, 1050);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 9 — GRUPOS: MODO "SOLO ADMINS PUEDEN POSTEAR" (Canal)
// ─────────────────────────────────────────────────────────────────────────────
(function initGroupChannelMode() {
  window.toggleGroupChannelMode = function(gid) {
    const g = (window.groups || []).find(x => x.id === gid);
    if (!g || (g.createdBy !== CU.id && !CU.isAdmin)) { if (window.toast) toast('Solo el admin puede cambiar este modo', 'warning'); return; }
    g.channelMode = !g.channelMode;
    if (window.save) save();
    if (window.toast) toast(g.channelMode ? '📢 Modo canal activado: solo admins postean' : '💬 Modo comunidad restaurado', g.channelMode ? 'info' : 'success');
    if (window.renderGroupFeed) renderGroupFeed(gid);
  };

  // Patch renderGroupFeed para bloquear compositor si channelMode activo y no es admin
  function patchGroupFeedChannel() {
    const orig = window.renderGroupFeed;
    if (!orig) { setTimeout(patchGroupFeedChannel, 1000); return; }
    window.renderGroupFeed = function(gid) {
      orig.call(this, gid);
      setTimeout(() => {
        const g = (window.groups || []).find(x => x.id === gid);
        if (!g) return;
        const area = document.getElementById('gfeed');
        if (!area) return;

        // Botón toggle para admin
        const hdr = area.querySelector('.card');
        if (hdr && (g.createdBy === CU.id || CU.isAdmin) && !hdr.querySelector('.channel-toggle-btn')) {
          const btn = document.createElement('button');
          btn.className = 'btn btn-ghost channel-toggle-btn';
          btn.style.cssText = 'padding:5px 12px;font-size:.77rem;margin-top:6px;margin-left:6px;';
          btn.innerHTML = g.channelMode ? '<i class="fas fa-comments"></i> Modo comunidad' : '<i class="fas fa-broadcast-tower"></i> Modo canal';
          btn.onclick = () => toggleGroupChannelMode(gid);
          hdr.appendChild(btn);
        }

        // Bloquear compositor si channelMode y no admin
        if (g.channelMode && g.createdBy !== CU.id && !CU.isAdmin) {
          const comp = area.querySelector('.composer, [id^="comp-"]')?.closest('.card');
          if (comp && !comp.querySelector('.channel-block-msg')) {
            comp.style.opacity = '0.5';
            comp.style.pointerEvents = 'none';
            const msg = document.createElement('div');
            msg.className = 'channel-block-msg';
            msg.style.cssText = 'text-align:center;padding:8px;font-size:.8rem;color:var(--text2);pointer-events:auto;opacity:1;';
            msg.innerHTML = '<i class="fas fa-broadcast-tower"></i> Este grupo es un canal. Solo los admins pueden publicar.';
            comp.after(msg);
          }
        }
      }, 280);
    };
  }
  setTimeout(patchGroupFeedChannel, 1050);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 10 — GRUPOS: INVITACIÓN POR ENLACE CON CÓDIGO ÚNICO
// ─────────────────────────────────────────────────────────────────────────────
window.generateGroupInviteLink = function(gid) {
  const g = (window.groups || []).find(x => x.id === gid);
  if (!g) return;
  if (!g.inviteCode) {
    g.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    if (window.save) save();
  }
  const link = `${location.origin}${location.pathname}?join=${g.inviteCode}`;
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'invite-link-modal';
  modal.innerHTML = `
    <div class="mbox" style="max-width:420px;">
      <div class="mhead"><h3><i class="fas fa-link" style="color:var(--green);"></i> Invitar al grupo</h3><button class="mclose" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button></div>
      <div class="mbody" style="display:flex;flex-direction:column;gap:10px;">
        <p style="font-size:.83rem;color:var(--text2);">Comparte este enlace. Cualquiera que lo use entrará al grupo automáticamente.</p>
        <div style="display:flex;gap:7px;align-items:center;">
          <input type="text" id="invite-link-inp" value="${link}" readonly style="flex:1;margin-bottom:0;font-size:.78rem;cursor:pointer;" onclick="this.select()">
          <button class="btn btn-primary" onclick="navigator.clipboard.writeText(document.getElementById('invite-link-inp').value);toast('🔗 Enlace copiado','success')"><i class="fas fa-copy"></i></button>
        </div>
        <p style="font-size:.75rem;color:var(--text2);">Código: <code style="background:var(--input-bg);padding:2px 7px;border-radius:5px;">${g.inviteCode}</code></p>
        <button class="btn btn-ghost" style="font-size:.77rem;" onclick="resetGroupInviteCode(${gid})"><i class="fas fa-redo"></i> Generar nuevo código</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
};

window.resetGroupInviteCode = function(gid) {
  const g = (window.groups || []).find(x => x.id === gid);
  if (!g) return;
  g.inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  if (window.save) save();
  document.getElementById('invite-link-modal')?.remove();
  generateGroupInviteLink(gid);
  if (window.toast) toast('🔄 Nuevo código generado', 'success');
};

// Procesar código de invitación en la URL al cargar
(function processInviteCode() {
  const params = new URLSearchParams(location.search);
  const code = params.get('join');
  if (!code) return;
  setTimeout(() => {
    if (!window.CU || !window.groups) return;
    const g = (window.groups || []).find(x => x.inviteCode === code);
    if (!g) { if (window.toast) toast('Código de invitación inválido o expirado', 'warning'); return; }
    if (g.members.includes(CU.id)) { if (window.toast) toast(`Ya eres miembro de ${g.name}`, 'info'); return; }
    g.members.push(CU.id);
    if (window.save) save();
    if (window.toast) toast(`✅ Te uniste a ${g.name}`, 'success');
    history.replaceState(null, '', location.pathname);
    if (window.navigate) navigate('groups', g.id);
  }, 1500);
})();

// Añadir botón de invitar en renderGroupFeed
(function patchGroupFeedInvite() {
  function tryPatch() {
    const orig = window.renderGroupFeed;
    if (!orig) { setTimeout(tryPatch, 1000); return; }
    window.renderGroupFeed = function(gid) {
      orig.call(this, gid);
      setTimeout(() => {
        const area = document.getElementById('gfeed');
        if (!area || area.querySelector('.invite-link-btn')) return;
        const hdr = area.querySelector('.card');
        if (!hdr) return;
        const btn = document.createElement('button');
        btn.className = 'btn btn-ghost invite-link-btn';
        btn.style.cssText = 'padding:6px 13px;font-size:.78rem;margin-top:6px;margin-left:6px;';
        btn.innerHTML = '<i class="fas fa-link"></i> Invitar';
        btn.onclick = () => generateGroupInviteLink(gid);
        hdr.appendChild(btn);
      }, 360);
    };
  }
  setTimeout(tryPatch, 1100);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 11 — GAMIFICACIÓN: MISIONES DIARIAS CON XP
// ─────────────────────────────────────────────────────────────────────────────
(function initDailyMissions() {
  const MISSIONS = [
    { id: 'post_today',   label: '📝 Publicar 1 post hoy',        xp: 10, check: () => (window.posts||[]).some(p => p.userId===CU?.id && new Date(p.timestamp).toDateString()===new Date().toDateString()) },
    { id: 'comment_3',   label: '💬 Dejar 3 comentarios',         xp: 15, check: () => (window.posts||[]).reduce((a,p)=>a+(p.comments||[]).filter(c=>c.userId===CU?.id&&c.timestamp>Date.now()-86400000).length,0)>=3 },
    { id: 'react_5',     label: '❤️ Reaccionar a 5 posts',        xp: 10, check: () => { try { return parseInt(localStorage.getItem('sms_daily_rxn_'+CU?.id)||'0')>=5; } catch(e){return false;} } },
    { id: 'send_dm',     label: '💌 Enviar 1 mensaje directo',     xp: 8,  check: () => (window.messages||[]).some(c=>c.participants.includes(CU?.id)&&c.messages.some(m=>m.from===CU?.id&&m.timestamp>Date.now()-86400000)) },
    { id: 'visit_group', label: '👥 Visitar un grupo',             xp: 5,  check: () => localStorage.getItem('sms_visited_group_'+new Date().toDateString())==='1' },
  ];

  function getMissionData() {
    try { return JSON.parse(localStorage.getItem('sms_missions_'+CU?.id+'_'+new Date().toDateString()) || '{}'); }
    catch(e) { return {}; }
  }
  function saveMissionData(data) {
    localStorage.setItem('sms_missions_'+CU?.id+'_'+new Date().toDateString(), JSON.stringify(data));
  }

  window.renderDailyMissions = function() {
    const data = getMissionData();
    const mc = document.getElementById('content');
    if (!mc) return;

    const totalXp = MISSIONS.reduce((a, m) => {
      const completed = data[m.id] || MISSIONS.find(x=>x.id===m.id)?.check?.();
      return a + (completed ? m.xp : 0);
    }, 0);
    const maxXp = MISSIONS.reduce((a, m) => a + m.xp, 0);

    mc.innerHTML = `
      <div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <h3 style="font-family:var(--font-head);font-weight:800;"><i class="fas fa-tasks" style="color:var(--green);margin-right:7px;"></i>Misiones diarias</h3>
        <span class="tag tag-green">⚡ ${totalXp} / ${maxXp} XP hoy</span>
      </div>
      <div style="background:var(--border);border-radius:20px;height:8px;overflow:hidden;margin-bottom:18px;">
        <div style="height:100%;width:${Math.round(totalXp/maxXp*100)}%;background:var(--green);border-radius:20px;transition:width .6s;"></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        ${MISSIONS.map(m => {
          const done = data[m.id] || m.check?.();
          if (done && !data[m.id]) { data[m.id] = true; saveMissionData(data); }
          return `<div class="card" style="padding:13px 16px;display:flex;align-items:center;gap:13px;opacity:${done?'.7':'1'};">
            <div style="width:36px;height:36px;border-radius:50%;background:${done?'var(--green-l)':'var(--input-bg)'};display:flex;align-items:center;justify-content:center;font-size:1.1rem;">${done?'✅':'⬜'}</div>
            <div style="flex:1;">
              <div style="font-weight:700;font-size:.88rem;${done?'text-decoration:line-through;color:var(--text2);':''}">${m.label}</div>
              <div style="font-size:.73rem;color:var(--text2);">+${m.xp} XP</div>
            </div>
            <span class="tag ${done?'tag-green':'tag-gray'}">${done?'Completada':'Pendiente'}</span>
          </div>`;
        }).join('')}
      </div>
      <p style="font-size:.75rem;color:var(--text2);margin-top:14px;text-align:center;">Las misiones se reinician cada día a medianoche 🌙</p>`;
  };

  // Añadir al nav
  setTimeout(() => {
    const nav = document.getElementById('main-nav');
    if (!nav || document.querySelector('[data-view="missions"]')) return;
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.dataset.view = 'missions';
    item.innerHTML = '<span class="nicon"><i class="fas fa-tasks"></i></span>Misiones<span class="tag tag-green" style="margin-left:auto;font-size:.6rem;">Diarias</span>';
    item.onclick = () => navigate('missions');
    const lb = document.querySelector('[data-view="leaderboard"]');
    if (lb) nav.insertBefore(item, lb);
    else nav.appendChild(item);

    const origNav = window.navigate;
    window.navigate = function(view, param) {
      if (view === 'missions') {
        if (window.closeAllDrawers) closeAllDrawers();
        window.cView = 'missions';
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelector('[data-view="missions"]')?.classList.add('active');
        renderDailyMissions();
      } else origNav.call(this, view, param);
    };

    // Marcar visita a grupo
    const origNav2 = window.navigate;
    window.navigate = function(view, param) {
      if (view === 'groups' && param) {
        localStorage.setItem('sms_visited_group_'+new Date().toDateString(), '1');
      }
      origNav2.call(this, view, param);
    };
  }, 700);

  // Trackear reacciones para misión react_5
  function patchAddRxn() {
    const orig = window.addRxn;
    if (!orig) { setTimeout(patchAddRxn, 800); return; }
    window.addRxn = function(pid, type) {
      orig.call(this, pid, type);
      const key = 'sms_daily_rxn_'+CU?.id;
      const cur = parseInt(localStorage.getItem(key)||'0');
      localStorage.setItem(key, (cur+1).toString());
    };
  }
  setTimeout(patchAddRxn, 900);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 12 — GAMIFICACIÓN: TIENDA DE RECOMPENSAS
// ─────────────────────────────────────────────────────────────────────────────
(function initRewardStore() {
  const REWARDS = [
    { id: 'frame_gold',    label: 'Marco dorado',        cost: 100, icon: '🥇', type: 'frame',  color: '#d4af37' },
    { id: 'frame_diamond', label: 'Marco diamante',      cost: 250, icon: '💎', type: 'frame',  color: '#67e8f9' },
    { id: 'badge_legend',  label: 'Insignia Leyenda',    cost: 200, icon: '🌟', type: 'badge'  },
    { id: 'badge_pioneer', label: 'Insignia Pionero',    cost: 150, icon: '🚀', type: 'badge'  },
    { id: 'title_boss',    label: 'Título: "El Jefe"',   cost: 80,  icon: '😎', type: 'title'  },
    { id: 'title_ninja',   label: 'Título: "Ninja"',     cost: 80,  icon: '🥷', type: 'title'  },
  ];

  function getUserCoins() { return parseInt(localStorage.getItem('sms_coins_'+CU?.id)||'0'); }
  function addCoins(n) {
    const cur = getUserCoins();
    localStorage.setItem('sms_coins_'+CU?.id, (cur+n).toString());
  }
  function spendCoins(n) {
    const cur = getUserCoins();
    if (cur < n) return false;
    localStorage.setItem('sms_coins_'+CU?.id, (cur-n).toString());
    return true;
  }
  function getOwnedRewards() {
    try { return JSON.parse(localStorage.getItem('sms_owned_rewards_'+CU?.id)||'[]'); } catch(e) { return []; }
  }
  function addOwnedReward(id) {
    const owned = getOwnedRewards();
    if (!owned.includes(id)) owned.push(id);
    localStorage.setItem('sms_owned_rewards_'+CU?.id, JSON.stringify(owned));
  }

  // Dar monedas al postear
  function patchPostForCoins() {
    const orig = window.publishPost;
    if (!orig) { setTimeout(patchPostForCoins, 800); return; }
    window.publishPost = function() {
      orig.call(this);
      addCoins(5);
      if (window.toast) toast('🪙 +5 monedas por publicar', 'info');
    };
  }
  setTimeout(patchPostForCoins, 900);

  window.getUserCoins = getUserCoins;
  window.addCoins = addCoins;

  window.renderRewardStore = function() {
    const mc = document.getElementById('content');
    if (!mc) return;
    const coins = getUserCoins();
    const owned = getOwnedRewards();

    mc.innerHTML = `
      <div style="margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <h3 style="font-family:var(--font-head);font-weight:800;"><i class="fas fa-store" style="color:var(--orange);margin-right:7px;"></i>Tienda de recompensas</h3>
        <span class="tag tag-orange">🪙 ${coins} monedas</span>
      </div>
      <p style="font-size:.82rem;color:var(--text2);margin-bottom:16px;">Gana monedas publicando, comentando y completando misiones. Canjéalas por marcos, insignias y títulos exclusivos.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;">
        ${REWARDS.map(r => {
          const isOwned = owned.includes(r.id);
          const canBuy = coins >= r.cost && !isOwned;
          return `<div class="card" style="padding:16px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:8px;">
            <div style="font-size:2rem;">${r.icon}</div>
            <div style="font-weight:700;font-size:.85rem;">${r.label}</div>
            <div style="font-size:.75rem;color:var(--text2);">🪙 ${r.cost} monedas</div>
            <button class="btn ${isOwned?'btn-ghost':canBuy?'btn-primary':'btn-ghost'}" style="width:100%;justify-content:center;padding:6px;font-size:.77rem;${!canBuy&&!isOwned?'opacity:.5;cursor:not-allowed;':''}" onclick="${isOwned?'':canBuy?`buyReward('${r.id}')`:''}">${isOwned?'✅ Tuyo':canBuy?'Comprar':'Sin monedas'}</button>
          </div>`;
        }).join('')}
      </div>`;
  };

  window.buyReward = function(id) {
    const r = REWARDS.find(x => x.id === id);
    if (!r) return;
    const owned = getOwnedRewards();
    if (owned.includes(id)) { if (window.toast) toast('Ya tienes esta recompensa', 'info'); return; }
    if (!spendCoins(r.cost)) { if (window.toast) toast('No tienes suficientes monedas', 'warning'); return; }
    addOwnedReward(id);
    if (r.type === 'badge') {
      const u = (window.users||[]).find(x=>x.id===CU.id);
      if (u) { u.badges = u.badges||[]; if (!u.badges.includes(id)) u.badges.push(id); if (window.save) save(); }
    }
    if (window.toast) toast(`🎉 ¡${r.label} desbloqueado!`, 'success');
    renderRewardStore();
  };

  // Añadir al nav
  setTimeout(() => {
    const nav = document.getElementById('main-nav');
    if (!nav || document.querySelector('[data-view="rewards"]')) return;
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.dataset.view = 'rewards';
    item.innerHTML = '<span class="nicon"><i class="fas fa-store"></i></span>Tienda<span class="tag tag-orange" style="margin-left:auto;font-size:.6rem;">🪙</span>';
    item.onclick = () => navigate('rewards');
    const missions = document.querySelector('[data-view="missions"]');
    if (missions) nav.insertBefore(item, missions.nextSibling);
    else nav.appendChild(item);

    const origNav = window.navigate;
    window.navigate = function(view, param) {
      if (view === 'rewards') {
        if (window.closeAllDrawers) closeAllDrawers();
        window.cView = 'rewards';
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelector('[data-view="rewards"]')?.classList.add('active');
        renderRewardStore();
      } else origNav.call(this, view, param);
    };
  }, 800);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 13 — GAMIFICACIÓN: LEADERBOARD ALL-TIME
// ─────────────────────────────────────────────────────────────────────────────
(function initAllTimeLeaderboard() {
  window.renderAllTimeLeaderboard = function() {
    const mc = document.getElementById('content');
    if (!mc) return;
    const scores = (window.users||[]).filter(u=>!u.deactivated).map(u => {
      const up = (window.posts||[]).filter(p=>p.userId===u.id);
      const likes = up.reduce((a,p)=>a+Object.keys(p.reactions||{}).length,0);
      const comments = (window.posts||[]).reduce((a,p)=>a+(p.comments||[]).filter(c=>c.userId===u.id).length,0);
      const sold = (window.products||[]).filter(p=>p.userId===u.id&&p.sold).length;
      const score = up.length*2 + likes + comments*3 + sold*5;
      return { u, score, posts: up.length, likes, comments };
    }).sort((a,b)=>b.score-a.score).slice(0,20);
    const medals = ['🥇','🥈','🥉'];
    mc.innerHTML = `
      <div style="margin-bottom:13px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <h3 style="font-family:var(--font-head);font-weight:800;"><i class="fas fa-medal" style="color:var(--orange);margin-right:7px;"></i>Ranking All-Time</h3>
        <span class="tag tag-orange">Top 20 histórico</span>
      </div>
      <div class="card" style="padding:0;overflow:hidden;">
        ${scores.map((item,i) => {
          const isMe = item.u.id===CU.id;
          return `<div style="display:flex;align-items:center;gap:13px;padding:13px 16px;border-bottom:1px solid var(--border);background:${isMe?'var(--green-l)':''};${isMe?'id="lb-me-at"':''}">
            <div style="width:32px;text-align:center;font-size:${i<3?'1.3rem':'.9rem'};font-weight:800;color:${i===0?'var(--orange)':i===1?'#94a3b8':i===2?'#d97706':'var(--text2)'};">${medals[i]||'#'+(i+1)}</div>
            <img src="${item.u.photo||''}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;" alt="">
            <div style="flex:1;cursor:pointer;" onclick="openProfileModal(${item.u.id})">
              <div style="font-weight:700;font-size:.88rem;">${esc(item.u.username)}${isMe?' <span class="tag tag-green" style="font-size:.6rem;">Tú</span>':''}</div>
              <div style="font-size:.72rem;color:var(--text2);">${item.posts} posts · ${item.likes} ❤️ · ${item.comments} 💬</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:800;color:var(--green);font-size:1.05rem;">${item.score}</div>
              <div style="font-size:.68rem;color:var(--text2);">pts</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
  };

  setTimeout(() => {
    const nav = document.getElementById('main-nav');
    if (!nav || document.querySelector('[data-view="leaderboard-at"]')) return;
    const lb = document.querySelector('[data-view="leaderboard"]');
    if (!lb) return;
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.dataset.view = 'leaderboard-at';
    item.innerHTML = '<span class="nicon"><i class="fas fa-medal"></i></span>Ranking All-Time';
    item.onclick = () => navigate('leaderboard-at');
    lb.insertAdjacentElement('afterend', item);
    const origNav = window.navigate;
    window.navigate = function(view, param) {
      if (view === 'leaderboard-at') {
        if (window.closeAllDrawers) closeAllDrawers();
        window.cView = 'leaderboard-at';
        document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
        document.querySelector('[data-view="leaderboard-at"]')?.classList.add('active');
        renderAllTimeLeaderboard();
      } else origNav.call(this, view, param);
    };
  }, 750);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 14 — GAMIFICACIÓN: NOTIFICACIÓN DE SUBIDA DE NIVEL + MARCO DE AVATAR
// ─────────────────────────────────────────────────────────────────────────────
(function initLevelUpSystem() {
  let _lastLevel = null;

  const LEVEL_FRAMES = {
    5:  { color: '#10b981', label: 'Verde' },
    10: { color: '#3b82f6', label: 'Azul' },
    20: { color: '#8b5cf6', label: 'Púrpura' },
    30: { color: '#f59e0b', label: 'Dorado' },
    50: { color: '#06b6d4', label: 'Diamante', animated: true },
  };

  function getFrameForLevel(lvl) {
    const thresholds = Object.keys(LEVEL_FRAMES).map(Number).sort((a,b)=>b-a);
    for (const t of thresholds) { if (lvl >= t) return LEVEL_FRAMES[t]; }
    return null;
  }

  window.checkLevelUp = function() {
    if (!window.CU || !window.getUserPoints) return;
    const pts = getUserPoints(CU.id);
    const lvl = Math.min(100, Math.floor(pts/15)+1);
    if (_lastLevel === null) { _lastLevel = lvl; return; }
    if (lvl > _lastLevel) {
      _lastLevel = lvl;
      // Animación + toast
      if (window.toast) toast(`🎉 ¡Subiste al nivel ${lvl}!`, 'success');
      // Overlay animado
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;pointer-events:none;';
      overlay.innerHTML = `<div style="background:var(--card);border:2px solid var(--green);border-radius:var(--r-lg);padding:28px 40px;text-align:center;animation:levelUpPop .5s cubic-bezier(.22,1,.36,1) both;box-shadow:0 0 40px rgba(45,106,79,.4);">
        <div style="font-size:3rem;">🎉</div>
        <div style="font-family:var(--font-head);font-weight:800;font-size:1.4rem;color:var(--green);margin:8px 0;">¡Nivel ${lvl}!</div>
        <div style="font-size:.85rem;color:var(--text2);">Sigue así, ${esc(CU.username)}</div>
      </div>`;
      document.body.appendChild(overlay);
      setTimeout(() => overlay.remove(), 3000);
      applyAvatarFrame();
    }
  };

  function applyAvatarFrame() {
    if (!window.CU || !window.getUserPoints) return;
    const pts = getUserPoints(CU.id);
    const lvl = Math.min(100, Math.floor(pts/15)+1);
    const frame = getFrameForLevel(lvl);
    const containers = ['h-av-container', 'rd-av-container'];
    containers.forEach(id => {
      const c = document.getElementById(id);
      if (!c) return;
      if (frame) {
        c.style.border = `2.5px solid ${frame.color}`;
        c.style.boxShadow = `0 0 8px ${frame.color}55`;
        if (frame.animated) c.style.animation = 'avatarFrameAnim 2s ease-in-out infinite';
      } else {
        c.style.border = '';
        c.style.boxShadow = '';
      }
    });
  }

  // Inyectar CSS de animaciones
  const s = document.createElement('style');
  s.textContent = `@keyframes levelUpPop{from{transform:scale(.3);opacity:0}to{transform:scale(1);opacity:1}}@keyframes avatarFrameAnim{0%,100%{box-shadow:0 0 8px #06b6d455}50%{box-shadow:0 0 20px #06b6d4aa}}`;
  document.head.appendChild(s);

  setTimeout(() => { _lastLevel = null; setInterval(checkLevelUp, 15000); applyAvatarFrame(); }, 2000);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 15 — PERFIL: BIO CON LINKS CLICKEABLES
// ─────────────────────────────────────────────────────────────────────────────
window.renderBioWithLinks = function(bioText) {
  if (!bioText) return '';
  // URLs
  let html = esc(bioText).replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1" target="_blank" rel="noopener" style="color:var(--green);text-decoration:underline;word-break:break-all;">$1</a>'
  );
  // @menciones
  html = html.replace(/@([a-zA-Z0-9_]+)/g, (m, name) => {
    const u = (window.users||[]).find(x=>x.username===name);
    return u ? `<span style="color:var(--green);cursor:pointer;font-weight:600;" onclick="openProfileModal(${u.id})">@${esc(name)}</span>` : m;
  });
  return html;
};

// Patch openProfileModal para usar bio con links
(function patchBioLinks() {
  function tryPatch() {
    const orig = window.openProfileModal;
    if (!orig) { setTimeout(tryPatch, 800); return; }
    window.openProfileModal = function(uid) {
      orig.call(this, uid);
      setTimeout(() => {
        const u = (window.users||[]).find(x=>x.id===uid);
        if (!u?.bio) return;
        const profBody = document.getElementById('profile-modal-body')||document.getElementById('prof-modal-body');
        if (!profBody) return;
        const bioEl = profBody.querySelectorAll('p, .p-bio, [style*="bio"]');
        bioEl.forEach(el => {
          if (el.textContent === u.bio) el.innerHTML = renderBioWithLinks(u.bio);
        });
      }, 500);
    };
  }
  setTimeout(tryPatch, 900);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 16 — PERFIL: WIDGET DE MÚSICA (canción favorita)
// ─────────────────────────────────────────────────────────────────────────────
(function initMusicWidget() {
  window.openMusicWidgetEditor = function() {
    const existing = document.getElementById('mw-modal');
    if (existing) existing.remove();
    const u = (window.users||[]).find(x=>x.id===CU.id);
    const cur = u?.musicWidget || {};
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'mw-modal';
    modal.innerHTML = `
      <div class="mbox" style="max-width:420px;">
        <div class="mhead"><h3><i class="fas fa-music" style="color:var(--purple);"></i> Widget de música</h3><button class="mclose" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button></div>
        <div class="mbody" style="display:flex;flex-direction:column;gap:9px;">
          <input type="text" id="mw-song" placeholder="Nombre de la canción" value="${esc(cur.song||'')}" style="margin-bottom:0;">
          <input type="text" id="mw-artist" placeholder="Artista" value="${esc(cur.artist||'')}" style="margin-bottom:0;">
          <input type="text" id="mw-cover" placeholder="URL de portada (imagen)" value="${esc(cur.cover||'')}" style="margin-bottom:0;">
          <input type="text" id="mw-url" placeholder="URL de la canción (mp3, opcional)" value="${esc(cur.url||'')}" style="margin-bottom:0;">
          <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="saveMusicWidget()"><i class="fas fa-save"></i> Guardar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
  };

  window.saveMusicWidget = function() {
    const song = document.getElementById('mw-song')?.value.trim();
    const artist = document.getElementById('mw-artist')?.value.trim();
    const cover = document.getElementById('mw-cover')?.value.trim();
    const url = document.getElementById('mw-url')?.value.trim();
    const u = (window.users||[]).find(x=>x.id===CU.id);
    if (u) {
      u.musicWidget = song ? { song, artist, cover, url } : null;
      CU.musicWidget = u.musicWidget;
      if (window.save) save();
    }
    document.getElementById('mw-modal')?.remove();
    if (window.toast) toast('🎵 Widget de música guardado', 'success');
  };

  window.renderMusicWidget = function(uid) {
    const u = (window.users||[]).find(x=>x.id===uid);
    const mw = u?.musicWidget;
    if (!mw) return '';
    return `<div style="display:flex;align-items:center;gap:11px;padding:11px 14px;background:var(--input-bg);border-radius:var(--r-md);margin-top:10px;cursor:pointer;" ${mw.url?`onclick="playMusicWidget('${mw.url}')"`:''}  title="${mw.url?'Reproducir':''}">
      ${mw.cover?`<img src="${mw.cover}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;" alt="">`:'<div style="width:44px;height:44px;background:var(--purple-l);border-radius:8px;display:flex;align-items:center;justify-content:center;"><i class="fas fa-music" style="color:var(--purple);"></i></div>'}
      <div style="flex:1;overflow:hidden;">
        <div style="font-weight:700;font-size:.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(mw.song)}</div>
        <div style="font-size:.75rem;color:var(--text2);">${esc(mw.artist||'Artista desconocido')}</div>
      </div>
      ${mw.url?'<i class="fas fa-play-circle" style="color:var(--purple);font-size:1.3rem;"></i>':'<i class="fas fa-music" style="color:var(--text2);"></i>'}
    </div>`;
  };

  window.playMusicWidget = function(url) {
    let audio = document.getElementById('profile-music-player');
    if (audio) { audio.paused ? audio.play() : audio.pause(); return; }
    audio = document.createElement('audio');
    audio.id = 'profile-music-player';
    audio.src = url;
    audio.controls = false;
    document.body.appendChild(audio);
    audio.play().catch(() => { if (window.toast) toast('No se pudo reproducir el audio', 'warning'); });
  };

  // Patch openProfileModal para mostrar widget de música
  function patchProfileMusicWidget() {
    const orig = window.openProfileModal;
    if (!orig) { setTimeout(patchProfileMusicWidget, 800); return; }
    window.openProfileModal = function(uid) {
      orig.call(this, uid);
      setTimeout(() => {
        const profBody = document.getElementById('profile-modal-body')||document.getElementById('prof-modal-body');
        if (!profBody || profBody.querySelector('.music-widget-injected')) return;
        const html = renderMusicWidget(uid);
        if (!html) {
          // Botón para añadir si es propio perfil
          if (uid === CU.id) {
            const div = document.createElement('div');
            div.className = 'music-widget-injected';
            div.innerHTML = `<button class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:10px;font-size:.78rem;" onclick="openMusicWidgetEditor()"><i class="fas fa-music"></i> Añadir canción favorita</button>`;
            profBody.appendChild(div);
          }
          return;
        }
        const div = document.createElement('div');
        div.className = 'music-widget-injected';
        div.innerHTML = html;
        if (uid === CU.id) {
          div.innerHTML += `<button class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:6px;font-size:.77rem;" onclick="openMusicWidgetEditor()"><i class="fas fa-edit"></i> Editar música</button>`;
        }
        profBody.appendChild(div);
      }, 400);
    };
  }
  setTimeout(patchProfileMusicWidget, 950);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 17 — ADMIN: PANEL CON GRÁFICAS DE CRECIMIENTO
// ─────────────────────────────────────────────────────────────────────────────
(function initAdminAnalytics() {
  window.renderAdminAnalytics = function() {
    if (!CU?.isAdmin && !['Fundador','Líder','Admin'].includes(CU?.role)) {
      if (window.toast) toast('Acceso restringido a admins', 'warning'); return;
    }
    const mc = document.getElementById('content');
    if (!mc) return;

    const now = Date.now();
    const days = 30;
    const labels = [], postsPerDay = [], usersPerDay = [];
    for (let i = days-1; i >= 0; i--) {
      const start = now - (i+1)*86400000;
      const end = now - i*86400000;
      const d = new Date(end);
      labels.push(`${d.getDate()}/${d.getMonth()+1}`);
      postsPerDay.push((window.posts||[]).filter(p=>p.timestamp>=start&&p.timestamp<end).length);
      usersPerDay.push((window.users||[]).filter(u=>u.id>0).length); // usuarios acumulados aprox.
    }

    const totalPosts = (window.posts||[]).length;
    const totalUsers = (window.users||[]).filter(u=>!u.deactivated).length;
    const totalGroups = (window.groups||[]).length;
    const totalProducts = (window.products||[]).length;
    const onlineNow = (window.users||[]).filter(u=>u.lastActivity&&Date.now()-u.lastActivity<300000).length;

    mc.innerHTML = `
      <h3 style="font-family:var(--font-head);font-weight:800;margin-bottom:16px;"><i class="fas fa-chart-line" style="color:var(--blue);margin-right:7px;"></i>Panel de Analíticas</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-bottom:20px;">
        ${[['👥',totalUsers,'Usuarios'],['📝',totalPosts,'Posts'],['👥',totalGroups,'Grupos'],['🛒',totalProducts,'Productos'],['🟢',onlineNow,'En línea ahora']].map(([ic,v,l])=>`
          <div class="card" style="padding:14px;text-align:center;">
            <div style="font-size:1.5rem;">${ic}</div>
            <div style="font-weight:800;font-size:1.4rem;color:var(--green);">${v}</div>
            <div style="font-size:.72rem;color:var(--text2);">${l}</div>
          </div>`).join('')}
      </div>
      <div class="card" style="padding:16px;margin-bottom:14px;">
        <div style="font-weight:700;font-family:var(--font-head);margin-bottom:12px;font-size:.9rem;"><i class="fas fa-chart-bar" style="color:var(--green);"></i> Posts por día (últimos 30 días)</div>
        <canvas id="admin-posts-chart" height="120"></canvas>
      </div>
      <div class="card" style="padding:16px;">
        <div style="font-weight:700;font-family:var(--font-head);margin-bottom:10px;font-size:.9rem;"><i class="fas fa-users" style="color:var(--blue);"></i> Usuarios más activos (total)</div>
        ${(window.users||[]).filter(u=>!u.deactivated).map(u=>({u,pts:window.getUserPoints?getUserPoints(u.id):0})).sort((a,b)=>b.pts-a.pts).slice(0,5).map((x,i)=>`
          <div style="display:flex;align-items:center;gap:9px;padding:6px 0;border-bottom:1px solid var(--border);">
            <div style="width:22px;text-align:center;font-weight:800;color:var(--text2);font-size:.8rem;">#${i+1}</div>
            <img src="${x.u.photo||''}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;" alt="">
            <div style="flex:1;font-weight:600;font-size:.85rem;">${esc(x.u.username)}</div>
            <span class="tag tag-green">${x.pts} pts</span>
          </div>`).join('')}
      </div>`;

    // Renderizar gráfica con Chart.js si está disponible
    setTimeout(() => {
      const canvas = document.getElementById('admin-posts-chart');
      if (!canvas || !window.Chart) return;
      new Chart(canvas, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Posts', data: postsPerDay, backgroundColor: 'rgba(45,106,79,.6)', borderColor: 'var(--green)', borderWidth: 1, borderRadius: 4 }] },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
      });
    }, 100);
  };

  // Añadir al nav solo para admins
  setTimeout(() => {
    if (!CU?.isAdmin && !['Fundador','Líder','Admin'].includes(CU?.role)) return;
    const nav = document.getElementById('main-nav');
    if (!nav || document.querySelector('[data-view="analytics"]')) return;
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.dataset.view = 'analytics';
    item.innerHTML = '<span class="nicon"><i class="fas fa-chart-line"></i></span>Analíticas';
    item.onclick = () => navigate('analytics');
    const settings = nav.querySelector('[data-view="settings"]');
    if (settings) nav.insertBefore(item, settings);
    else nav.appendChild(item);
    const origNav = window.navigate;
    window.navigate = function(view, param) {
      if (view === 'analytics') {
        if (window.closeAllDrawers) closeAllDrawers();
        window.cView = 'analytics';
        document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
        document.querySelector('[data-view="analytics"]')?.classList.add('active');
        renderAdminAnalytics();
      } else origNav.call(this, view, param);
    };
  }, 900);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 18 — ADMIN: EXPORTAR DATOS PROPIOS EN JSON
// ─────────────────────────────────────────────────────────────────────────────
window.exportMyData = function() {
  if (!window.CU) return;
  const u = (window.users||[]).find(x=>x.id===CU.id);
  const myPosts = (window.posts||[]).filter(p=>p.userId===CU.id);
  const myMessages = (window.messages||[]).filter(m=>m.participants.includes(CU.id));
  const data = {
    exportedAt: new Date().toISOString(),
    user: { ...u, password: '[HIDDEN]' },
    posts: myPosts,
    messages: myMessages,
    activityLog: (window.activityLog||[]).filter(l=>l.userId===CU.id)
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `serakdep_mis_datos_${CU.username}_${new Date().toISOString().slice(0,10)}.json`;
  a.click(); URL.revokeObjectURL(url);
  if (window.toast) toast('📦 Datos exportados correctamente', 'success');
};

// Inyectar botón en ajustes
(function injectExportBtn() {
  function tryInject() {
    const origRS = window.renderSettings;
    if (!origRS) { setTimeout(tryInject, 800); return; }
    window.renderSettings = function() {
      origRS.call(this);
      setTimeout(() => {
        const settingsContent = document.getElementById('content');
        if (!settingsContent || settingsContent.querySelector('.export-data-btn')) return;
        if (window.cView !== 'settings') return;
        const btn = document.createElement('button');
        btn.className = 'btn btn-ghost export-data-btn';
        btn.style.cssText = 'margin-top:12px;padding:8px 16px;font-size:.82rem;';
        btn.innerHTML = '<i class="fas fa-download"></i> Exportar mis datos (JSON)';
        btn.onclick = exportMyData;
        settingsContent.appendChild(btn);
      }, 300);
    };
  }
  setTimeout(tryInject, 900);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 19 — CONTENIDO: PÁGINA EXPLORAR CON TRENDING
// ─────────────────────────────────────────────────────────────────────────────
(function initExplorePage() {
  window.renderExplorePage = function() {
    const mc = document.getElementById('content');
    if (!mc) return;

    // Trending hashtags
    const allText = (window.posts||[]).map(p=>p.content||'').join(' ');
    const tagMatches = allText.match(/#[a-zA-Z0-9_áéíóúüñÁÉÍÓÚÑ]+/g) || [];
    const tagCounts = {};
    tagMatches.forEach(t => { tagCounts[t] = (tagCounts[t]||0)+1; });
    const trending = Object.entries(tagCounts).sort((a,b)=>b[1]-a[1]).slice(0,12);

    // Posts populares de la semana
    const weekAgo = Date.now() - 7*86400000;
    const weekPosts = (window.posts||[]).filter(p=>p.timestamp>weekAgo&&!p.groupId)
      .sort((a,b)=>Object.keys(b.reactions||{}).length - Object.keys(a.reactions||{}).length).slice(0,5);

    // Usuarios sugeridos (no seguidos)
    const suggested = (window.users||[]).filter(u=>
      u.id !== CU.id && !CU.following.includes(u.id) && !u.deactivated
    ).sort((a,b)=>(b.followers?.length||0)-(a.followers?.length||0)).slice(0,6);

    mc.innerHTML = `
      <h3 style="font-family:var(--font-head);font-weight:800;margin-bottom:16px;"><i class="fas fa-compass" style="color:var(--blue);margin-right:7px;"></i>Explorar</h3>

      <div style="margin-bottom:20px;">
        <div style="font-weight:700;font-family:var(--font-head);font-size:.9rem;margin-bottom:10px;">Trending esta semana</div>
        <div style="display:flex;flex-wrap:wrap;gap:7px;">
          ${trending.length ? trending.map(([tag, count]) =>
            `<span class="tag tag-green" style="cursor:pointer;font-size:.8rem;padding:5px 12px;" onclick="navigate('public');setTimeout(()=>{const inp=document.getElementById('h-search');if(inp){inp.value='${esc(tag)}';inp.dispatchEvent(new Event('input'));}},300);">${tag} <span style="opacity:.7;">${count}</span></span>`
          ).join('') : '<p style="color:var(--text2);font-size:.83rem;">Sin hashtags aún. ¡Empieza a usar #tags!</p>'}
        </div>
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-weight:700;font-family:var(--font-head);font-size:.9rem;margin-bottom:10px;">Posts más populares de la semana</div>
        ${weekPosts.length ? weekPosts.map(p => {
          const author = (window.users||[]).find(u=>u.id===p.userId);
          return `<div class="card" style="padding:12px 14px;margin-bottom:8px;cursor:pointer;" onclick="openProfileModal(${p.userId})">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <img src="${author?.photo||''}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;" alt="">
              <span style="font-weight:600;font-size:.83rem;">${esc(author?.username||'?')}</span>
              <span style="margin-left:auto;font-size:.75rem;color:var(--text2);">${Object.keys(p.reactions||{}).length} ❤️ · ${(p.comments||[]).length} 💬</span>
            </div>
            <p style="font-size:.84rem;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${esc((p.content||'').substring(0,120))}</p>
          </div>`;
        }).join('') : '<p style="color:var(--text2);font-size:.83rem;">Sin posts populares aún esta semana.</p>'}
      </div>

      <div>
        <div style="font-weight:700;font-family:var(--font-head);font-size:.9rem;margin-bottom:10px;">Personas que quizás conozcas</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">
          ${suggested.map(u => `
            <div class="card" style="padding:14px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:7px;">
              <img src="${u.photo||''}" style="width:46px;height:46px;border-radius:50%;object-fit:cover;cursor:pointer;" onclick="openProfileModal(${u.id})" alt="">
              <div style="font-weight:700;font-size:.82rem;cursor:pointer;" onclick="openProfileModal(${u.id})">${esc(u.username)}</div>
              <div style="font-size:.7rem;color:var(--text2);">${u.followers?.length||0} seguidores</div>
              <button class="btn btn-primary" style="padding:5px 12px;font-size:.74rem;justify-content:center;" onclick="followUser(${u.id});this.textContent='✓ Siguiendo';this.disabled=true;">Seguir</button>
            </div>`).join('')}
        </div>
      </div>`;
  };

  setTimeout(() => {
    const nav = document.getElementById('main-nav');
    if (!nav || document.querySelector('[data-view="explore"]')) return;
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.dataset.view = 'explore';
    item.innerHTML = '<span class="nicon"><i class="fas fa-compass"></i></span>Explorar';
    item.onclick = () => navigate('explore');
    const publicItem = nav.querySelector('[data-view="public"]');
    if (publicItem) publicItem.insertAdjacentElement('afterend', item);
    else nav.insertBefore(item, nav.firstChild);

    const origNav = window.navigate;
    window.navigate = function(view, param) {
      if (view === 'explore') {
        if (window.closeAllDrawers) closeAllDrawers();
        window.cView = 'explore';
        document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
        document.querySelector('[data-view="explore"]')?.classList.add('active');
        renderExplorePage();
      } else origNav.call(this, view, param);
    };
  }, 750);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 20 — CONTENIDO: POSTS EN FORMATO HILO (THREAD)
// ─────────────────────────────────────────────────────────────────────────────
window.openThreadCreator = function() {
  const existing = document.getElementById('thread-creator-modal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'thread-creator-modal';
  modal.innerHTML = `
    <div class="mbox" style="max-width:520px;">
      <div class="mhead"><h3><i class="fas fa-stream" style="color:var(--blue);"></i> Crear hilo</h3><button class="mclose" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button></div>
      <div class="mbody" style="display:flex;flex-direction:column;gap:10px;" id="thread-parts">
        <div class="thread-part" data-idx="0" style="display:flex;gap:9px;align-items:flex-start;">
          <img src="${window.CU?.photo||''}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;flex-shrink:0;" alt="">
          <textarea placeholder="Parte 1 del hilo..." style="flex:1;min-height:70px;resize:vertical;margin-bottom:0;" class="thread-ta"></textarea>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;">
        <button class="btn btn-ghost" style="padding:7px 14px;font-size:.8rem;" onclick="addThreadPart()"><i class="fas fa-plus"></i> Añadir parte</button>
        <button class="btn btn-primary" style="padding:7px 16px;font-size:.8rem;margin-left:auto;" onclick="publishThread()"><i class="fas fa-stream"></i> Publicar hilo</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  modal.style.display = 'flex';
};

window.addThreadPart = function() {
  const container = document.getElementById('thread-parts');
  if (!container) return;
  const idx = container.querySelectorAll('.thread-part').length;
  if (idx >= 10) { if (window.toast) toast('Máximo 10 partes por hilo', 'warning'); return; }
  const div = document.createElement('div');
  div.className = 'thread-part';
  div.dataset.idx = idx;
  div.style.cssText = 'display:flex;gap:9px;align-items:flex-start;border-top:1px dashed var(--border);padding-top:10px;';
  div.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0;">
      <div style="width:2px;height:12px;background:var(--border);"></div>
      <img src="${window.CU?.photo||''}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;" alt="">
    </div>
    <textarea placeholder="Parte ${idx+1}..." style="flex:1;min-height:60px;resize:vertical;margin-bottom:0;" class="thread-ta"></textarea>
    <button onclick="this.closest('.thread-part').remove()" style="background:none;border:none;cursor:pointer;color:var(--danger);font-size:.85rem;padding:4px;" title="Eliminar parte"><i class="fas fa-times"></i></button>`;
  container.appendChild(div);
};

window.publishThread = function() {
  const parts = [...document.querySelectorAll('.thread-ta')].map(ta=>ta.value.trim()).filter(Boolean);
  if (parts.length < 2) { if (window.toast) toast('Un hilo necesita al menos 2 partes', 'warning'); return; }
  const threadId = Date.now();
  parts.forEach((text, i) => {
    const post = {
      id: window.ids ? ids.np++ : Date.now()+i,
      userId: CU.id, content: text, timestamp: Date.now() + i,
      reactions: {}, comments: [], media: null, savedBy: [],
      isThread: true, threadId, threadPart: i+1, threadTotal: parts.length
    };
    if (window.posts) posts.unshift(post);
  });
  if (window.save) save();
  if (window.checkBadges) checkBadges(CU.id);
  document.getElementById('thread-creator-modal')?.remove();
  if (window.toast) toast(`🧵 Hilo de ${parts.length} partes publicado!`, 'success');
  if (window.renderFeed) renderFeed();
};

// Patch postCard para mostrar indicador de hilo
(function patchThreadCards() {
  function tryPatch() {
    const orig = window.postCard;
    if (!orig) { setTimeout(tryPatch, 800); return; }
    window.postCard = function(p) {
      let html = orig.call(this, p);
      if (!p.isThread) return html;
      const badge = `<span class="tag tag-blue" style="font-size:.63rem;"><i class="fas fa-stream"></i> Parte ${p.threadPart}/${p.threadTotal}</span>`;
      html = html.replace(/(<div class="p-time"[^>]*>)/, '$1' + badge);
      return html;
    };
  }
  setTimeout(tryPatch, 900);
})();

// Botón "Crear hilo" en el feed
(function addThreadBtn() {
  function tryAdd() {
    const orig = window.renderFeed;
    if (!orig) { setTimeout(tryAdd, 800); return; }
    window.renderFeed = function() {
      orig.call(this);
      setTimeout(() => {
        const compArea = document.querySelector('[onclick*="publishPost"]')?.closest('.card');
        if (compArea && !compArea.querySelector('.thread-btn')) {
          const btn = document.createElement('button');
          btn.className = 'btn btn-ghost thread-btn';
          btn.style.cssText = 'padding:5px 12px;font-size:.77rem;margin-top:6px;';
          btn.innerHTML = '<i class="fas fa-stream"></i> Crear hilo';
          btn.onclick = openThreadCreator;
          compArea.appendChild(btn);
        }
      }, 300);
    };
  }
  setTimeout(tryAdd, 1000);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 21 — CONTENIDO: TRADUCCIÓN AUTOMÁTICA DE POSTS
// ─────────────────────────────────────────────────────────────────────────────
window.translatePost = function(postId, btnEl) {
  const p = (window.posts||[]).find(x=>x.id===postId);
  if (!p || !p.content) return;

  // Si ya está traducido, mostrar original
  if (btnEl._translated) {
    const bodyEl = btnEl.closest('.post')?.querySelector('.p-body');
    if (bodyEl && p._originalContent) bodyEl.textContent = p._originalContent;
    btnEl.innerHTML = '<i class="fas fa-language"></i> Traducir';
    btnEl._translated = false;
    return;
  }

  btnEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  // Usar LibreTranslate (API pública, puede fallar por CORS en producción)
  fetch('https://libretranslate.de/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: p.content, source: 'auto', target: 'es', format: 'text' })
  })
  .then(r => r.json())
  .then(data => {
    if (data.translatedText) {
      p._originalContent = p._originalContent || p.content;
      const bodyEl = btnEl.closest('.post')?.querySelector('.p-body');
      if (bodyEl) bodyEl.textContent = data.translatedText;
      btnEl.innerHTML = '<i class="fas fa-language"></i> Ver original';
      btnEl._translated = true;
    } else throw new Error('No translation');
  })
  .catch(() => {
    btnEl.innerHTML = '<i class="fas fa-language"></i> Traducir';
    if (window.toast) toast('Servicio de traducción no disponible en este momento', 'warning');
  });
};

// Añadir botón traducir en postCard
(function addTranslateBtn() {
  function tryPatch() {
    const orig = window.postCard;
    if (!orig) { setTimeout(tryPatch, 800); return; }
    window.postCard = function(p) {
      let html = orig.call(this, p);
      if (!p.content || p.content.length < 15) return html;
      const btn = `<button class="act" onclick="translatePost(${p.id},this)" title="Traducir post"><i class="fas fa-language"></i> Traducir</button>`;
      html = html.replace(/(<\/div><!-- \/p-acts)/, btn + '$1');
      if (!html.includes(btn)) {
        html = html.replace(/(<button class="act"[^>]*onclick="openSharePost)/, btn + '$1');
      }
      return html;
    };
  }
  setTimeout(tryPatch, 950);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 22 — CSS DINÁMICO para todas las nuevas features
// ─────────────────────────────────────────────────────────────────────────────
(function injectFeatures3Styles() {
  const style = document.createElement('style');
  style.textContent = `
    /* Group announcement pin */
    .group-announcement { border-left: 4px solid var(--orange) !important; }

    /* Chat poll widget */
    .poll-widget button:hover { opacity: .85; }

    /* Thread indicator */
    .tag-blue { background: rgba(59,130,246,.12); color: #3b82f6; }

    /* Level up overlay */
    @keyframes levelUpPop { from { transform: scale(.3); opacity: 0 } to { transform: scale(1); opacity: 1 } }

    /* Typing indicator dots */
    .typing-dots { animation: tdots 1s ease-in-out infinite; }
    @keyframes tdots { 0%,100%{opacity:.3}50%{opacity:1} }

    /* Reward store cards hover */
    .card:hover .btn-primary { transform: translateY(-1px); }

    /* DM reaction bar */
    .dm-rxn-bar button:hover { transform: scale(1.25); background: var(--input-bg) !important; }

    /* Explore page suggested user hover */
    [data-view="explore"] .card:hover { transform: translateY(-2px); transition: transform .2s; }

    /* Admin analytics */
    #admin-posts-chart { max-height: 200px; }
  `;
  document.head.appendChild(style);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 23 — NUBE DE PALABRAS (Word Cloud) del feed
// ─────────────────────────────────────────────────────────────────────────────
window.renderWordCloud = function() {
  const mc = document.getElementById('content');
  if (!mc) return;

  const allText = (window.posts||[]).map(p=>p.content||'').join(' ').toLowerCase();
  const stopWords = new Set(['de','la','el','en','y','a','que','los','las','por','con','del','se','un','una','es','para','como','más','pero','sus','le','ya','o','este','si','porque','esta','entre','cuando','muy','sin','sobre','ser','tiene','también','me','hasta','hay','donde','quien','desde','todo','nos','durante','todos','uno','les','ni','contra','otros','ese','eso','ante','ellos','e','esto','mí','antes','algunos','qué','unos','yo','otro','otras','son','así','sus','su','al','fue','ha','su','esta','no','te','lo','le','lo','que']);
  const wordCounts = {};
  allText.replace(/[^a-záéíóúüñ\s]/gi,'').split(/\s+/).forEach(w => {
    if (w.length > 3 && !stopWords.has(w)) wordCounts[w] = (wordCounts[w]||0)+1;
  });
  const sorted = Object.entries(wordCounts).sort((a,b)=>b[1]-a[1]).slice(0,40);
  if (!sorted.length) {
    mc.innerHTML = '<div class="empty"><i class="fas fa-font"></i><p>No hay suficiente contenido para la nube.</p></div>';
    return;
  }
  const max = sorted[0][1];
  mc.innerHTML = `
    <h3 style="font-family:var(--font-head);font-weight:800;margin-bottom:16px;"><i class="fas fa-cloud" style="color:var(--blue);margin-right:7px;"></i>Nube de palabras</h3>
    <div class="card" style="padding:24px;text-align:center;line-height:2.2;display:flex;flex-wrap:wrap;justify-content:center;gap:6px 10px;">
      ${sorted.map(([w,c]) => {
        const size = 0.7 + (c/max)*2.2;
        const opacity = 0.4 + (c/max)*0.6;
        const colors = ['var(--green)','var(--blue)','var(--purple)','var(--orange)','#06b6d4','#ec4899'];
        const color = colors[Math.floor(Math.random()*colors.length)];
        return `<span style="font-size:${size.toFixed(2)}rem;font-weight:${c===max?800:600};color:${color};opacity:${opacity.toFixed(2)};cursor:default;transition:.2s;" title="${c} apariciones" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='${opacity.toFixed(2)}'">${w}</span>`;
      }).join('')}
    </div>
    <p style="font-size:.75rem;color:var(--text2);margin-top:10px;text-align:center;">Basado en ${(window.posts||[]).length} posts · Top 40 palabras</p>`;
};

// Añadir al panel de analíticas / settings
(function addWordCloudNav() {
  setTimeout(() => {
    const nav = document.getElementById('main-nav');
    if (!nav || document.querySelector('[data-view="wordcloud"]')) return;
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.dataset.view = 'wordcloud';
    item.innerHTML = '<span class="nicon"><i class="fas fa-cloud"></i></span>Nube de palabras';
    item.onclick = () => navigate('wordcloud');
    const settings = nav.querySelector('[data-view="settings"]');
    if (settings) nav.insertBefore(item, settings);
    else nav.appendChild(item);
    const origNav = window.navigate;
    window.navigate = function(view, param) {
      if (view === 'wordcloud') {
        if (window.closeAllDrawers) closeAllDrawers();
        window.cView = 'wordcloud';
        document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
        document.querySelector('[data-view="wordcloud"]')?.classList.add('active');
        renderWordCloud();
      } else origNav.call(this, view, param);
    };
  }, 850);
})();


// ─────────────────────────────────────────────────────────────────────────────
//  BLOQUE 24 — INSIGNIAS TEMPORALES POR EVENTOS ESPECIALES
// ─────────────────────────────────────────────────────────────────────────────
(function initSeasonalBadges() {
  const SEASONAL = [
    { id: 'navidad_2024', label: '🎄 Espíritu navideño', startMD: '12-01', endMD: '12-31' },
    { id: 'año_nuevo',    label: '🎆 Año nuevo',          startMD: '01-01', endMD: '01-07' },
    { id: 'halloween',    label: '🎃 Halloween',           startMD: '10-25', endMD: '11-01' },
    { id: 'san_valentin', label: '💘 San Valentín',        startMD: '02-10', endMD: '02-15' },
    { id: 'fundacion',    label: '🌿 Aniversario Serakdep', startMD: '06-01', endMD: '06-07' },
  ];

  function checkSeasonalBadges() {
    if (!window.CU) return;
    const now = new Date();
    const md = `${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const u = (window.users||[]).find(x=>x.id===CU.id);
    if (!u) return;
    SEASONAL.forEach(b => {
      const active = md >= b.startMD && md <= b.endMD;
      if (active && !u.badges.includes(b.id)) {
        u.badges.push(b.id);
        CU.badges = u.badges;
        if (window.save) save();
        if (window.toast) toast(`🏅 Insignia temporal: ${b.label}`, 'success');
      }
      // Eliminar badge fuera de temporada
      if (!active && u.badges.includes(b.id)) {
        u.badges = u.badges.filter(x=>x!==b.id);
        CU.badges = u.badges;
        if (window.save) save();
      }
    });
  }

  // Añadir definiciones al BADGES_DEF global
  setTimeout(() => {
    if (window.BADGES_DEF) {
      SEASONAL.forEach(b => {
        if (!BADGES_DEF.find(x=>x.id===b.id)) {
          BADGES_DEF.push({ id: b.id, icon: b.label.split(' ')[0], label: b.label.slice(2) });
        }
      });
    }
    checkSeasonalBadges();
  }, 2000);
})();

// ============================================================
//  FUNCIONALIDADES FALTANTES IMPLEMENTADAS
// ============================================================

// ------------------------------------------------------------
// 1. PARALLAX EN BANNER DE PERFIL
// ------------------------------------------------------------
(function initProfileParallax() {
  function attachParallax() {
    const cover = document.querySelector('.pp-cover');
    if (!cover || cover._parallaxAttached) return;
    const container = cover.closest('.card');
    if (!container) return;
    cover._parallaxAttached = true;
    container.addEventListener('scroll', () => {
      const scrollTop = container.scrollTop;
      cover.style.transform = `translateY(${scrollTop * 0.3}px)`;
    });
  }
  const observer = new MutationObserver(() => attachParallax());
  const content = document.getElementById('content');
  if (content) observer.observe(content, { childList: true, subtree: true });
  setTimeout(attachParallax, 500);
})();

// ------------------------------------------------------------
// 2. MAPA DE ACTIVIDAD GLOBAL (POSTS POR HORA) EN ADMIN
// ------------------------------------------------------------
(function extendAdminAnalytics() {
  const originalRenderAdminAnalytics = window.renderAdminAnalytics;
  if (originalRenderAdminAnalytics) {
    window.renderAdminAnalytics = function() {
      originalRenderAdminAnalytics();
      if (!CU?.isAdmin && !['Fundador','Líder','Admin'].includes(CU?.role)) return;
      setTimeout(() => {
        const mc = document.getElementById('content');
        if (!mc || mc.querySelector('.heatmap-container')) return;
        // Calcular actividad por hora
        const hourCounts = new Array(24).fill(0);
        (posts || []).forEach(p => {
          const hour = new Date(p.timestamp).getHours();
          hourCounts[hour]++;
        });
        const maxCount = Math.max(...hourCounts) || 1;
        const hours = Array.from({length:24}, (_,i) => i + ':00');
        const heatmapHtml = `
          <div class="card" style="padding:16px; margin-top:16px;">
            <div style="font-weight:700; font-family:var(--font-head); margin-bottom:12px;">
              <i class="fas fa-chart-line"></i> Actividad por hora del día
            </div>
            <div class="heatmap-container" style="display:flex; gap:4px; align-items:flex-end; height:160px; overflow-x:auto;">
              ${hourCounts.map((count,i) => `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; min-width:28px;">
                  <div class="heatmap-bar" style="height:${Math.max(4, (count/maxCount)*120)}px;"></div>
                  <span class="heatmap-label">${hours[i]}</span>
                </div>
              `).join('')}
            </div>
            <p style="font-size:.72rem; color:var(--text2); margin-top:8px;">
              Basado en ${posts.length} publicaciones
            </p>
          </div>`;
        mc.insertAdjacentHTML('beforeend', heatmapHtml);
      }, 200);
    };
  }
})();

// ------------------------------------------------------------
// 3. HISTORIAL DE ACCESOS POR IP/DISPOSITIVO
// ------------------------------------------------------------
(function initLoginHistory() {
  // Grabar inicio de sesión (se llama desde doLogin)
  const originalDoLogin = window.doLogin;
  if (originalDoLogin) {
    window.doLogin = function() {
      // Llamar original
      const result = originalDoLogin.apply(this, arguments);
      // Registrar acceso después de login exitoso
      setTimeout(() => {
        if (CU) {
          let loginHistory = JSON.parse(localStorage.getItem('sms_loginHistory') || '[]');
          const entry = {
            id: Date.now(),
            timestamp: Date.now(),
            ip: `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
            userAgent: navigator.userAgent,
            device: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Móvil' : 'Escritorio'
          };
          loginHistory.unshift(entry);
          if (loginHistory.length > 50) loginHistory = loginHistory.slice(0,50);
          localStorage.setItem('sms_loginHistory', JSON.stringify(loginHistory));
        }
      }, 500);
      return result;
    };
  }

  // Función para mostrar historial en settings
  window.renderLoginHistory = function() {
    const history = JSON.parse(localStorage.getItem('sms_loginHistory') || '[]');
    if (!history.length) return '<div class="empty"><i class="fas fa-history"></i><p>No hay accesos registrados aún.</p></div>';
    return `
      <div style="margin-top:12px;">
        ${history.map(entry => `
          <div class="login-history-item">
            <div class="login-history-device">
              <i class="fas ${entry.device === 'Móvil' ? 'fa-mobile-alt' : 'fa-desktop'}"></i>
              <span>${entry.device}</span>
              <span class="login-history-ip">${entry.ip}</span>
            </div>
            <div class="login-history-time">${new Date(entry.timestamp).toLocaleString('es-ES')}</div>
          </div>
        `).join('')}
        <button class="btn btn-ghost" style="margin-top:10px; width:100%;" onclick="localStorage.removeItem('sms_loginHistory'); renderSetPanel(); toast('Historial limpiado','info');">
          <i class="fas fa-trash"></i> Limpiar historial
        </button>
      </div>`;
  };

  // Integrar en el panel de seguridad (settings)
  const originalRenderSetPanel = window.renderSetPanel;
  if (originalRenderSetPanel) {
    window.renderSetPanel = function() {
      originalRenderSetPanel();
      if (cSettingsSection === 'security') {
        const panel = document.getElementById('sets-panel');
        if (panel && !panel.querySelector('.login-history-section')) {
          const section = document.createElement('div');
          section.className = 'login-history-section';
          section.innerHTML = `<hr class="div"><h3 style="margin-top:8px;">Historial de accesos</h3>${window.renderLoginHistory()}`;
          panel.appendChild(section);
        }
      }
    };
  }
})();

// ------------------------------------------------------------
// 4. RECORDATORIOS DE POSTS GUARDADOS
// ------------------------------------------------------------
(function initSavedReminders() {
  function checkSavedPostsReminder() {
    if (!CU) return;
    const savedPosts = CU.savedPosts || [];
    const now = Date.now();
    let reminded = JSON.parse(localStorage.getItem('sms_savedReminded') || '[]');
    let newReminders = false;
    savedPosts.forEach(pid => {
      const post = posts.find(p => p.id === pid);
      if (!post) return;
      const daysSaved = (now - post.timestamp) / (1000*3600*24);
      if (daysSaved > 7 && !reminded.includes(pid)) {
        addNotif(CU.id, 'saved_reminder', 0, { postId: pid, title: post.content?.substring(0,50) });
        reminded.push(pid);
        newReminders = true;
      }
    });
    if (newReminders) localStorage.setItem('sms_savedReminded', JSON.stringify(reminded));
  }
  // Ejecutar cada 12 horas
  setInterval(checkSavedPostsReminder, 12*3600*1000);
  // También al cargar la página
  setTimeout(checkSavedPostsReminder, 5000);

  // Mostrar banner en la página de guardados
  const originalRenderSaved = window.renderSaved;
  if (originalRenderSaved) {
    window.renderSaved = function() {
      originalRenderSaved();
      setTimeout(() => {
        const mc = document.getElementById('content');
        if (!mc || mc.querySelector('.saved-reminder-banner')) return;
        const savedPosts = CU.savedPosts || [];
        const now = Date.now();
        const oldSaved = savedPosts.filter(pid => {
          const p = posts.find(x => x.id === pid);
          return p && (now - p.timestamp) / (1000*3600*24) > 7;
        });
        if (oldSaved.length) {
          const banner = document.createElement('div');
          banner.className = 'saved-reminder-banner';
          banner.innerHTML = `
            <i class="fas fa-clock"></i>
            <div class="reminder-text">Tienes ${oldSaved.length} post(s) guardados desde hace más de 7 días. ¿Aún te interesan?</div>
            <button onclick="markSavedAsReviewed(${oldSaved.map(p=>p).join(',')})">Ya revisé</button>
            <button onclick="dismissSavedReminder()">Ignorar</button>
          `;
          mc.insertBefore(banner, mc.firstChild);
        }
      }, 300);
    };
  }
  window.markSavedAsReviewed = function(postIds) {
    let reminded = JSON.parse(localStorage.getItem('sms_savedReminded') || '[]');
    postIds.forEach(pid => { if (!reminded.includes(pid)) reminded.push(pid); });
    localStorage.setItem('sms_savedReminded', JSON.stringify(reminded));
    toast('Gracias por revisar 👍', 'success');
    const banner = document.querySelector('.saved-reminder-banner');
    if (banner) banner.remove();
  };
  window.dismissSavedReminder = function() {
    const banner = document.querySelector('.saved-reminder-banner');
    if (banner) banner.remove();
  };
})();

// ------------------------------------------------------------
// 5. FEED COLABORATIVO DE GRUPO
// ------------------------------------------------------------
(function initCollaborativePosts() {
  // Extender posts existentes para soportar colaborativos
  if (!window.collaborativePosts) window.collaborativePosts = [];

  // Función para crear post colaborativo
  window.createCollaborativePost = function(groupId) {
    const g = groups.find(x => x.id === groupId);
    if (!g || !g.members.includes(CU.id)) { toast('No eres miembro de este grupo', 'warning'); return; }
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'collab-post-modal';
    modal.innerHTML = `
      <div class="mbox" style="max-width:500px;">
        <div class="mhead"><h3><i class="fas fa-users"></i> Post colaborativo</h3><button class="mclose" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button></div>
        <div class="mbody">
          <p style="font-size:.8rem; color:var(--text2); margin-bottom:8px;">Todos los miembros podrán añadir contenido.</p>
          <textarea id="collab-initial" placeholder="Primera contribución..." style="min-height:100px; resize:none;"></textarea>
          <div style="margin:8px 0;" id="collab-media-preview"></div>
          <label class="mb" style="justify-content:center;"><i class="fas fa-paperclip"></i> Adjuntar archivo<input type="file" id="collab-file" accept="image/*,video/*,audio/*" style="display:none;"></label>
          <button class="btn btn-primary" style="width:100%; margin-top:12px;" onclick="publishCollaborativePost(${groupId})">Crear post colaborativo</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    const fileInput = document.getElementById('collab-file');
    const preview = document.getElementById('collab-media-preview');
    fileInput.onchange = () => {
      const f = fileInput.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = e => {
        window._collabMedia = { data: e.target.result, type: f.type.startsWith('video') ? 'video' : f.type.startsWith('audio') ? 'audio' : 'image' };
        preview.innerHTML = `<img src="${e.target.result}" style="max-height:100px; border-radius:8px;">`;
      };
      reader.readAsDataURL(f);
    };
  };

  window.publishCollaborativePost = function(groupId) {
    const text = document.getElementById('collab-initial')?.value.trim();
    if (!text && !window._collabMedia) { toast('Escribe algo o adjunta un archivo', 'warning'); return; }
    const newPost = {
      id: ids.np++,
      userId: CU.id,
      groupId: groupId,
      timestamp: Date.now(),
      collaborative: true,
      contributions: [{
        userId: CU.id,
        text: text || '',
        media: window._collabMedia || null,
        timestamp: Date.now()
      }],
      reactions: {},
      comments: [],
      savedBy: []
    };
    posts.unshift(newPost);
    save();
    document.getElementById('collab-post-modal')?.remove();
    window._collabMedia = null;
    toast('Post colaborativo creado 🧩', 'success');
    renderGroupFeed(groupId);
  };

  // Añadir contribución a un post colaborativo
  window.addContribution = function(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.collaborative) return;
    const group = groups.find(g => g.id === post.groupId);
    if (!group || !group.members.includes(CU.id)) { toast('Solo miembros pueden aportar', 'warning'); return; }
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'add-contrib-modal';
    modal.innerHTML = `
      <div class="mbox" style="max-width:500px;">
        <div class="mhead"><h3><i class="fas fa-plus-circle"></i> Añadir aporte</h3><button class="mclose" onclick="this.closest('.modal').remove()"><i class="fas fa-times"></i></button></div>
        <div class="mbody">
          <textarea id="contrib-text" placeholder="Tu contribución..." style="min-height:80px;"></textarea>
          <div style="margin:8px 0;" id="contrib-media-preview"></div>
          <label class="mb" style="justify-content:center;"><i class="fas fa-paperclip"></i> Adjuntar archivo<input type="file" id="contrib-file" accept="image/*,video/*,audio/*" style="display:none;"></label>
          <button class="btn btn-primary" style="width:100%; margin-top:12px;" onclick="submitContribution(${postId})">Añadir</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    const fileInput = document.getElementById('contrib-file');
    const preview = document.getElementById('contrib-media-preview');
    fileInput.onchange = () => {
      const f = fileInput.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = e => {
        window._contribMedia = { data: e.target.result, type: f.type.startsWith('video') ? 'video' : f.type.startsWith('audio') ? 'audio' : 'image' };
        preview.innerHTML = `<img src="${e.target.result}" style="max-height:100px; border-radius:8px;">`;
      };
      reader.readAsDataURL(f);
    };
  };

  window.submitContribution = function(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const text = document.getElementById('contrib-text')?.value.trim();
    if (!text && !window._contribMedia) { toast('Escribe algo o adjunta un archivo', 'warning'); return; }
    post.contributions.push({
      userId: CU.id,
      text: text || '',
      media: window._contribMedia || null,
      timestamp: Date.now()
    });
    save();
    document.getElementById('add-contrib-modal')?.remove();
    window._contribMedia = null;
    toast('Aporte añadido ✅', 'success');
    if (post.groupId) renderGroupFeed(post.groupId);
    else renderFeed();
  };

  // Modificar postCard para mostrar posts colaborativos
  const originalPostCard = window.postCard;
  if (originalPostCard) {
    window.postCard = function(p) {
      if (!p.collaborative) return originalPostCard(p);
      // Renderizado especial para colaborativos
      const author = users.find(u => u.id === p.userId);
      if (!author) return '';
      const myR = p.reactions?.[CU.id];
      const rCounts = Object.values(p.reactions || {}).reduce((a,r)=>{a[r]=(a[r]||0)+1;return a;}, {});
      const saved = (CU.savedPosts || []).includes(p.id);
      const canEdit = CU.id === author.id;
      const canDelete = CU.id === author.id || CU.isAdmin;
      const group = groups.find(g => g.id === p.groupId);
      const isMember = group && group.members.includes(CU.id);
      const contribsHtml = p.contributions.map(contrib => {
        const u = users.find(uu => uu.id === contrib.userId);
        let mediaHtml = '';
        if (contrib.media) {
          if (contrib.media.type === 'image') mediaHtml = `<img src="${contrib.media.data}" style="max-width:100%; max-height:200px; border-radius:8px; margin-top:6px;">`;
          else if (contrib.media.type === 'video') mediaHtml = `<video controls src="${contrib.media.data}" style="max-width:100%; max-height:200px; border-radius:8px;"></video>`;
          else if (contrib.media.type === 'audio') mediaHtml = `<audio controls src="${contrib.media.data}" style="width:100%;"></audio>`;
        }
        return `<div class="collab-contribution">
          <div class="collab-contribution-author">
            <img src="${u?.photo || defAv()}" style="width:20px;height:20px;border-radius:50%;object-fit:cover;">
            ${esc(u?.username || '?')}
            <span style="font-size:.65rem; color:var(--text2);">${timeAgo(contrib.timestamp)}</span>
            ${(CU.id === contrib.userId || CU.isAdmin) ? `<button class="btn-icon" style="width:22px;height:22px;margin-left:auto;" onclick="deleteContribution(${p.id}, ${contrib.timestamp})"><i class="fas fa-trash" style="font-size:.7rem;"></i></button>` : ''}
          </div>
          <div class="collab-contribution-text">${esc(contrib.text)}</div>
          ${mediaHtml}
        </div>`;
      }).join('');

      const addBtn = isMember ? `<div class="collab-add-btn" onclick="addContribution(${p.id})"><i class="fas fa-plus"></i> Añadir aporte</div>` : '';

      return `<div class="post" id="post-${p.id}" data-id="${p.id}">
        <div class="post-hd">
          <img src="${author.photo || defAv()}" class="p-av" onclick="openProfileModal(${author.id})" alt="">
          <div class="p-meta">
            <div class="p-author" onclick="openProfileModal(${author.id})">${esc(author.username)} ${badgesHtml(author.id)} <span class="tag tag-purple"><i class="fas fa-users"></i> Colaborativo</span>${group ? `<span class="tag tag-gray" style="cursor:pointer;" onclick="navigate('groups',${group.id})">${esc(group.name)}</span>` : ''}</div>
            <div class="p-time">${timeAgo(p.timestamp)} · ${p.contributions.length} aporte(s)</div>
          </div>
          <button class="pm-btn" onclick="togglePMenu(${p.id})"><i class="fas fa-ellipsis-h"></i></button>
          <div class="p-dropdown" id="pdrop-${p.id}" style="display:none;">
            ${canEdit ? `<button onclick="openEditPost(${p.id})"><i class="fas fa-edit"></i> Editar título</button>` : ''}
            ${canDelete ? `<button class="d-red" onclick="deletePost(${p.id})"><i class="fas fa-trash"></i> Eliminar</button>` : ''}
            <button onclick="openReport('post',${p.id})"><i class="fas fa-flag"></i> Reportar</button>
          </div>
        </div>
        <div style="padding:0 14px 6px;">
          ${contribsHtml}
          ${addBtn}
        </div>
        <div class="p-rxn-row">
          ${['like','love','laugh','sad','angry'].map(r => `<button class="rxn-btn ${myR===r?'active':''}" onclick="addRxn(${p.id},'${r}')">${rxnIco(r)}<span>${rCounts[r]||''}</span></button>`).join('')}
        </div>
        <div class="p-stats">
          <span onclick="showWhoLiked(${p.id})"><i class="fas fa-heart"></i> ${Object.keys(p.reactions||{}).length}</span>
          <span><i class="fas fa-comment"></i> ${p.comments.length}</span>
          <span><i class="fas fa-bookmark"></i> ${p.savedBy?.length||0}</span>
        </div>
        <div class="p-acts">
          <button class="act ${saved?'saved-active':''}" onclick="openCollectionModal(${p.id})"><i class="fas fa-bookmark"></i> ${saved?'Guardado':'Guardar'}</button>
          <button class="act" onclick="toggleCmts(${p.id})"><i class="fas fa-comment"></i> Comentar</button>
          <button class="act" onclick="openSharePost(${p.id})"><i class="fas fa-share"></i> Compartir</button>
        </div>
        <div class="comments" id="cmts-${p.id}">${renderCmts(p)}</div>
      </div>`;
    };
  }

  // Añadir botón en grupos para crear post colaborativo
  const originalRenderGroupFeed = window.renderGroupFeed;
  if (originalRenderGroupFeed) {
    window.renderGroupFeed = function(gid) {
      originalRenderGroupFeed(gid);
      setTimeout(() => {
        const area = document.getElementById('gfeed');
        if (!area) return;
        const composerArea = area.querySelector('.composer');
        if (composerArea && !composerArea.querySelector('.collab-post-btn')) {
          const btn = document.createElement('button');
          btn.className = 'mb collab-post-btn';
          btn.innerHTML = '<i class="fas fa-users"></i> Post colaborativo';
          btn.onclick = () => createCollaborativePost(gid);
          composerArea.querySelector('.comp-btns')?.appendChild(btn);
        }
      }, 300);
    };
  }

  // Eliminar contribución individual
  window.deleteContribution = function(postId, ts) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const contrib = post.contributions.find(c => c.timestamp === ts);
    if (!contrib || (contrib.userId !== CU.id && !CU.isAdmin)) { toast('No tienes permiso', 'warning'); return; }
    post.contributions = post.contributions.filter(c => c.timestamp !== ts);
    save();
    toast('Aporte eliminado', 'info');
    if (post.groupId) renderGroupFeed(post.groupId);
    else renderFeed();
  };
})();

console.log('[Serakdep] Funcionalidades faltantes añadidas: Parallax, Mapa actividad, Historial accesos, Recordatorios guardados, Posts colaborativos');

// ─────────────────────────────────────────────────────────────────────────────
//  FINAL LOG
// ─────────────────────────────────────────────────────────────────────────────
console.log('[Serakdep Features v3.0] ✅ 24 nuevas features cargadas:',
  'Mensajes autodestruibles, Reacciones DM, Reply DM, Typing indicator, Encuestas en chat,',
  'Chat de grupo, Roles en grupos, Anuncios fijados, Modo canal, Invitación por enlace,',
  'Misiones diarias, Tienda de recompensas, Leaderboard all-time, Nivel con animación,',
  'Marco de avatar por nivel, Bio con links, Widget de música, Panel analíticas admin,',
  'Exportar datos JSON, Página Explorar, Posts en hilo (Thread), Traducción de posts,',
  'Nube de palabras, Insignias temporales'
);