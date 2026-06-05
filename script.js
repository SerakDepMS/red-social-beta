// ═══════════════════════════════════════════
//  ESTADO GLOBAL
// ═══════════════════════════════════════════
let CU=null;
let users=[],posts=[],groups=[],messages=[],notifs=[],reports=[],stories=[],reels=[],polls=[],products=[],events=[],activityLog=[],eventReminders=[];
let ids={nu:1,np:1,ng:1,nn:1,nr:1,ns:1,npo:1,nprod:1,nev:1};
let editingPostId=null,activeProfileId=null,reportTarget=null,pendingPollGroup=null;
let cView='public',cChatUser=null,cSettingsSection='account';
let svQueue=[],svQIdx=0,svIdx=0,svTimer=null;
let compMedia={};
let searchFilter='all';
let pendingLoginUser=null;
let ephemeralConvs={};

// Nuevas variables de estado
let pendingSavePostId=null;
let pendingRateSellerId=null;
let pendingRateProductId=null;
let selectedRatingValue=5;
let pendingGifCtx='public';
let currentGifTab='gifs';
let cFeedSort='recent';
let feedPage=0;
const FEED_PAGE_SIZE=10;
let _feedAll=[];
let _feedObserver=null;
let lastSeenNotifId=0;
let chatPollInterval=null;
let activeMentionBox=null;
let activeMentionInput=null;

const PRIVILEGED=['Fundador','Líder','Soporte Técnico','Admin'];
function _onlineLabel(u){
  if(!u||!u.lastActivity) return 'Sin actividad';
  const diff=Date.now()-u.lastActivity;
  if(diff<5*60*1000) return '🟢 En línea';
  if(diff<60*60*1000) return 'Hace '+ Math.floor(diff/60000)+' min';
  if(diff<24*60*60*1000) return 'Hace '+ Math.floor(diff/3600000)+' h';
  return 'Hace '+ Math.floor(diff/86400000)+' d';
}
const MAX_FILE_SIZE=50*1024*1024; // 50MB
// Accept any image/video/audio MIME type
const ALLOWED_TYPES_PREFIX=['image/','video/','audio/'];

const BADGES_DEF=[
  {id:'first_post',icon:'✍️',label:'Primera publicación'},
  {id:'first_follower',icon:'👤',label:'Primer seguidor'},
  {id:'hundred_likes',icon:'❤️',label:'100 likes recibidos'},
  {id:'group_creator',icon:'👥',label:'Creador de grupo'},
  {id:'star_seller',icon:'⭐',label:'Vendedor estrella'},
  {id:'level_10',icon:'🔥',label:'Nivel 10 alcanzado'},
  {id:'level_50',icon:'👑',label:'Nivel 50 alcanzado'},
  {id:'group_master',icon:'🛡️',label:'Maestro de grupos (5+ creados)'},
  {id:'diamond_seller',icon:'💎',label:'Vendedor Diamante (10+ vendidos)'},
  {id:'popular_star',icon:'🌟',label:'Popular (500+ likes recibidos)'},
];

const LOCAL_GIFS = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3BndTRiaG8xbTdzM251MXo1ZWszZW1wNmxsZHpiZ3U5aWtlYWZ4ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/t3s3G2TXEHN04/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjl5MnhvbnN5Z2QzMXFwdmxtYWZ6Y202eWN2N2J2ZWV3czZ2ajhzayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cuPm4A4vkxTSI/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3BpaXQzNDZ3MDZ3dWVnOXg4NWZmdXhkMXgyamZscTF3NHBkcTh4MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kEKcOWl8RMLde/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnAwOHF0YWZpdDlpMHpxYXZlYTNjOXN6OHV4NDIxaTZoZHBwNHZ1dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13CoXDiaCcC2EA/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNDVyNzBnczR3ajBhbXZ2MWtqaWpxNGszOXphMHozZjR6eXp6Z3Z2NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JIX9t2j0ZTN9S/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmtoc3RuaTRpdGNuMHFxZ2ptanMxeDNuZG01N3c4NGh4ZWV5ZmttZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8vQSQ3cNXuDGo/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNndrMWF1aXN6dHZnczZodmZ4bDJocGg1bDE3YTV2NHB5ZDJjZWd3NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oriO0OEd9QIDdllqo/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW82ajhqa3VnYzQ5eHdqNmlmdWh3cDZzbzJzMzAwaDdtYWY2NHdqdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3q2zVr6cu95nF6O4/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW11OXh5cGRtOHgzdjA2dnR4YmlqdTRzdXQ5YTA4cmoxd2E1dnB0NiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/111ebonMs96YUg/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXp4Nmd3c3VwYWlpc2I4bXlpdmt6bmVwczR6dmV5a3RkNmZ1azZpdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/g9582DNuQppazNm4Q3/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTZ4MWxzd3pyMnZ1aDlzcDBhOWt5aHlzZGF6NTRsdTdkMnhoNTNxbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0xezQguyWaoWYXSM/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTlkc2psYWw4OWY0ZHlhMGJiaWFwdW45aG51aWVob3o4NXo0M2VubCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/B4ORVipJJ4Ao0/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTloOWoxdjg5azE1MXBnaTNocTFhb25oZWxtdWtpeTN3MTc5MWFwbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5ntdy5Na1dgA52Vfky/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYng4Ynp2OTJpMWQyN2pxbnEya296cnR2Y2N0MmcwdTJpdW12a3B1OSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/T9pKoGGfVChdx0Z73W/giphy.gif",
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzJzd2sxbjRyZ3lndmloazM5YjNuNWVrdTJ0N3k4OHphZmVwbG83ciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9Ai5dIk8xv5v2/giphy.gif"
];

const LOCAL_STICKERS = [
  "https://openclipart.org/image/2400px/svg_to_png/212271/pears-sticker.png",
  "https://openclipart.org/image/2400px/svg_to_png/183115/1376856080.png",
  "https://openclipart.org/image/2400px/svg_to_png/202778/cute-panda.png",
  "https://openclipart.org/image/2400px/svg_to_png/289098/rainbow-unicorn.png",
  "https://openclipart.org/image/2400px/svg_to_png/232470/Sticker-Smiling-Cat.png",
  "https://openclipart.org/image/2400px/svg_to_png/248386/yellow-sub.png",
  "https://openclipart.org/image/2400px/svg_to_png/202685/burger.png",
  "https://openclipart.org/image/2400px/svg_to_png/170942/cactus.png",
  "https://openclipart.org/image/2400px/svg_to_png/203009/hot-air-balloon.png",
  "https://openclipart.org/image/2400px/svg_to_png/192737/coffee-cup.png"
];

// ═══════════════════════════════════════════
//  PERSISTENCIA
// ═══════════════════════════════════════════
function save(){
  // Update current user lastActivity on every save so online status is accurate
  if(CU){const ux=users.find(u=>u.id===CU.id);if(ux){ux.lastActivity=Date.now();CU.lastActivity=ux.lastActivity;}}
  const sanitizeMedia = (val) => {
    if (typeof val === 'string' && val.startsWith('data:') && val.length > 2 * 1024 * 1024) {
      return null;
    }
    return val;
  };
  
  const cleanPosts = posts.map(p => ({...p, media: sanitizeMedia(p.media)}));
  const cleanStories = stories.map(s => ({...s, media: sanitizeMedia(s.media), image: sanitizeMedia(s.image)}));
  const cleanReels = reels.map(r => ({...r, media: sanitizeMedia(r.media), url: sanitizeMedia(r.url)}));
  const cleanUsers = users.map(u => ({...u, photo: sanitizeMedia(u.photo), cover: sanitizeMedia(u.cover)}));
  
  const store={
    users: cleanUsers,
    posts: cleanPosts,
    groups,
    messages,
    notifs,
    reports,
    stories: cleanStories,
    reels: cleanReels,
    polls,
    products,
    events,
    ids,
    activityLog,
    eventReminders
  };
  for(const [k,v] of Object.entries(store)){try{localStorage.setItem('sms_'+k,JSON.stringify(v));}catch(e){}}
}
function gl(k){try{const r=localStorage.getItem(k);return r?JSON.parse(r):null;}catch(e){return null;}}
function loadData(){
  const now=Date.now();
  users=gl('sms_users')||[{id:1,username:'AdminSerak',password:'admin123',photo:'https://randomuser.me/api/portraits/men/1.jpg',cover:'https://picsum.photos/800/200?random=99',bio:'Fundador del clan 🌿',role:'Fundador',isAdmin:true,followers:[],following:[],blocked:[],savedPosts:[],privacy:{posts:'public',comments:'everyone'},deactivated:false,badges:[],birthday:null,birthdayPrivacy:'friends',twoFA:{enabled:false,secret:null},suspendedUntil:null,ratings:[],collections:[],mutedUsers:[],verified:true,lastActivity:Date.now(),primaryColor:'green',theme:'light'}];
  posts=gl('sms_posts')||[];
  groups=gl('sms_groups')||[];
  messages=gl('sms_messages')||[];
  notifs=gl('sms_notifs')||[];
  reports=gl('sms_reports')||[];
  stories=(gl('sms_stories')||[]).filter(s=>s.expiresAt>now);
  reels=gl('sms_reels')||[];
  polls=gl('sms_polls')||[];
  products=gl('sms_products')||[];
  events=gl('sms_events')||[];
  activityLog=gl('sms_activityLog')||[];
  eventReminders=gl('sms_eventReminders')||[];
  const si=gl('sms_ids');
  if(si)ids={...{nu:2,np:1,ng:1,nn:1,nr:1,ns:1,npo:1,nprod:1,nev:1},...si};
  else ids.nu=Math.max(2,...users.map(u=>u.id+1));
  users.forEach(ensureDefaults);
}
function ensureDefaults(u){
  u.followers=u.followers||[];u.following=u.following||[];u.blocked=u.blocked||[];
  u.savedPosts=u.savedPosts||[];u.privacy=u.privacy||{posts:'public',comments:'everyone'};
  u.badges=u.badges||[];
  u.birthday=u.birthday||null;u.birthdayPrivacy=u.birthdayPrivacy||'friends';
  u.twoFA=u.twoFA||{enabled:false,secret:null};
  u.suspendedUntil=u.suspendedUntil||null;
  u.ratings=u.ratings||[];
  u.collections=u.collections||[];
  u.avatarConfig=u.avatarConfig||{use3D:false,skinColor:'#e0ac69',shirtColor:'#3b82f6',pantsColor:'#1e3a8a',hatType:'none',hatColor:'#ef4444',expression:'smile'};
  u.mutedUsers=u.mutedUsers||[];
  u.verified=u.verified||false;
  u.lastActivity=u.lastActivity||Date.now();
}
function currentUserProxy(){return CU?.id;}

// ═══════════════════════════════════════════
//  ACTIVITY LOG
// ═══════════════════════════════════════════
function logActivity(type,detail=''){
  if(!CU)return;
  activityLog.unshift({id:Date.now(),userId:CU.id,type,detail,timestamp:Date.now()});
  if(activityLog.length>200)activityLog=activityLog.slice(0,200);
}

// ═══════════════════════════════════════════
//  BADGES
// ═══════════════════════════════════════════
// Base32 decode to array of bytes
function base32Decode(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let clean = base32.toUpperCase().replace(/=+$/, '');
  let len = clean.length;
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = new Uint8Array(Math.floor(len * 5 / 8));
  for (let i = 0; i < len; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) throw new Error('Invalid base32 character');
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return output;
}

// SHA-1 implementation
function sha1(buffer) {
  const words = [];
  const len = buffer.length;
  for (let i = 0; i < len; i++) {
    words[i >>> 2] |= buffer[i] << (24 - (i % 4) * 8);
  }
  const totalBits = len * 8;
  const padLen = ((totalBits + 64 >>> 9) << 4) + 16;
  const w = new Uint32Array(padLen);
  w.set(words);
  w[totalBits >>> 5] |= 0x80 << (24 - (totalBits % 32));
  w[padLen - 1] = totalBits;

  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
  const tempW = new Uint32Array(80);

  for (let i = 0; i < padLen; i += 16) {
    for (let t = 0; t < 16; t++) tempW[t] = w[i + t];
    for (let t = 16; t < 80; t++) {
      const val = tempW[t - 3] ^ tempW[t - 8] ^ tempW[t - 14] ^ tempW[t - 16];
      tempW[t] = (val << 1) | (val >>> 31);
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4;
    for (let t = 0; t < 80; t++) {
      let f, k;
      if (t < 20) {
        f = (b & c) | (~b & d);
        k = 0x5A827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ED9EBA1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8F1BBCDC;
      } else {
        f = b ^ c ^ d;
        k = 0xCA62C1D6;
      }
      const temp = (((a << 5) | (a >>> 27)) + f + e + k + tempW[t]) | 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }
    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }
  const result = new Uint8Array(20);
  for (let i = 0; i < 20; i++) {
    const val = [h0, h1, h2, h3, h4][i >>> 2];
    result[i] = (val >>> (24 - (i % 4) * 8)) & 255;
  }
  return result;
}

// HMAC-SHA1
function hmacSha1(key, message) {
  let k = new Uint8Array(key);
  if (k.length > 64) {
    k = sha1(k);
  }
  const paddedKey = new Uint8Array(64);
  paddedKey.set(k);

  const oPad = new Uint8Array(64);
  const iPad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    oPad[i] = paddedKey[i] ^ 0x5c;
    iPad[i] = paddedKey[i] ^ 0x36;
  }
  const innerMsg = new Uint8Array(64 + message.length);
  innerMsg.set(iPad);
  innerMsg.set(message, 64);
  const innerHash = sha1(innerMsg);

  const outerMsg = new Uint8Array(64 + innerHash.length);
  outerMsg.set(oPad);
  outerMsg.set(innerHash, 64);
  return sha1(outerMsg);
}

// TOTP verification
function verifyTOTP(secret, code) {
  const steps = [0, -1, 1];
  for (let s of steps) {
    try {
      const epoch = Math.floor(Date.now() / 1000) + s * 30;
      const counter = Math.floor(epoch / 30);
      const counterBytes = new Uint8Array(8);
      let tmp = counter;
      for (let i = 7; i >= 0; i--) {
        counterBytes[i] = tmp & 255;
        tmp = Math.floor(tmp / 256);
      }
      const key = base32Decode(secret);
      const hmac = hmacSha1(key, counterBytes);
      const offset = hmac[19] & 15;
      const otp = (((hmac[offset] & 127) << 24) |
                   ((hmac[offset + 1] & 255) << 16) |
                   ((hmac[offset + 2] & 255) << 8) |
                   (hmac[offset + 3] & 255)) % 1000000;
      if (otp.toString().padStart(6, '0') === code.trim()) {
        return true;
      }
    } catch (e) {
      console.error("TOTP verification error", e);
    }
  }
  return false;
}

function generateBase32Secret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let sec = '';
  for (let i = 0; i < 16; i++) {
    sec += chars[Math.floor(Math.random() * chars.length)];
  }
  return sec;
}

function getUserPoints(uid) {
  const userPosts = posts.filter(p => p.userId === uid);
  const totalLikes = userPosts.reduce((acc, p) => acc + Object.keys(p.reactions||{}).length, 0);
  const totalComments = posts.reduce((acc, p) => acc + p.comments.filter(c => c.userId === uid).length, 0);
  const totalProductsSold = products.filter(p => p.userId === uid && p.sold).length;
  
  return (userPosts.length * 2) + (totalLikes * 1) + (totalComments * 3) + (totalProductsSold * 5);
}

function checkBadges(uid){
  const u=users.find(x=>x.id===uid);if(!u)return;
  const userPosts=posts.filter(p=>p.userId===uid);
  const totalLikes=userPosts.reduce((a,p)=>a+Object.values(p.reactions||{}).length,0);
  const userGroups=groups.filter(g=>g.createdBy===uid);
  const userProducts=products.filter(p=>p.userId===uid&&p.sold);
  
  const points = getUserPoints(uid);
  const lvl = Math.min(100, Math.floor(points / 15) + 1);
  
  const toCheck=[
    {id:'first_post',condition:userPosts.length>=1},
    {id:'first_follower',condition:(u.followers||[]).length>=1},
    {id:'hundred_likes',condition:totalLikes>=100},
    {id:'group_creator',condition:userGroups.length>=1},
    {id:'star_seller',condition:userProducts.length>=1},
    {id:'level_10',condition:lvl>=10},
    {id:'level_50',condition:lvl>=50},
    {id:'group_master',condition:userGroups.length>=5},
    {id:'diamond_seller',condition:userProducts.length>=10},
    {id:'popular_star',condition:totalLikes>=500},
  ];
  toCheck.forEach(({id,condition})=>{
    if(condition&&!u.badges.includes(id)){
      u.badges.push(id);
      const bd=BADGES_DEF.find(b=>b.id===id);
      addNotif(uid,'badge',uid,{badgeId:id});
      if(uid===CU?.id){toast(`🏅 Insignia desbloqueada: ${bd?.label}`,'success');CU.badges=u.badges;}
      save();
    }
  });
}

function badgesHtml(uid){
  const u=users.find(x=>x.id===uid);if(!u)return '';
  let h = '';
  if(u.verified) {
    h += `<span class="badge-icon" style="background:#3b82f6; color:#fff;" title="Verificado"><i class="fas fa-check"></i></span>`;
  }
  if(u.badges?.length) {
    h += u.badges.map(bid=>{
      const bd=BADGES_DEF.find(b=>b.id===bid);
      return bd?`<span class="badge-icon" title="${bd.label}">${bd.icon}</span>`:'' ;
    }).join('');
  }
  return h;
}

function open2FASetup(){
  const secret=generateBase32Secret();
  const u=users.find(x=>x.id===CU.id);if(!u)return;
  u.twoFA=u.twoFA||{};u.twoFA.pendingSecret=secret;
  
  // Render QR Code using QRCode.js
  const container = document.getElementById('fa2-qr-container');
  if (container) {
    container.innerHTML = '';
    new QRCode(container, {
      text: `otpauth://totp/Serakdep:${u.username}?secret=${secret}&issuer=Serakdep`,
      width: 150,
      height: 150,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.M
    });
  }
  
  document.getElementById('fa2-secret-display').textContent=`Clave manual: ${secret}`;
  document.getElementById('fa2-verify-input').value='';
  save();openModal('fa2-modal');
}

function verify2FA(){
  const inp=document.getElementById('fa2-verify-input').value.trim();
  const u=users.find(x=>x.id===CU.id);if(!u)return;
  if(verifyTOTP(u.twoFA?.pendingSecret, inp)){
    u.twoFA.enabled=true;u.twoFA.secret=u.twoFA.pendingSecret;u.twoFA.pendingSecret=null;
    CU.twoFA=u.twoFA;save();closeModal('fa2-modal');
    toast('2FA activado correctamente 🔐','success');
    renderSetPanel();
  }else{toast('Código incorrecto','warning');}
}

function disable2FA(){
  const u=users.find(x=>x.id===CU.id);if(!u)return;
  u.twoFA={enabled:false,secret:null};CU.twoFA=u.twoFA;save();
  toast('2FA desactivado','info');renderSetPanel();
}

// ═══════════════════════════════════════════
//  SOUND SYNTHESIS (Web Audio API)
// ═══════════════════════════════════════════
function playNotifSound() {
  if (localStorage.getItem('sms_sound_notif') === '0') return;
  if (localStorage.getItem('sms_dnd') === '1') return; // Silence if DND
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    console.error("Web Audio error", e);
  }
}

function playChatSound() {
  if (localStorage.getItem('sms_sound_chat') === '0') return;
  if (localStorage.getItem('sms_dnd') === '1') return; // Silence if DND
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
    osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.08); // C#5
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.error("Web Audio error", e);
  }
}

// ═══════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════
if (!window.authTab) {
  window.authTab = function(t){
    document.getElementById('atab-login').classList.toggle('active',t==='login');
    document.getElementById('atab-register').classList.toggle('active',t==='register');
    document.getElementById('login-p').style.display=t==='login'?'block':'none';
    document.getElementById('reg-p').style.display=t==='register'?'block':'none';
    document.getElementById('auth-err').style.display='none';
  };
}
if (!window.authErr) {
  window.authErr = function(msg){const e=document.getElementById('auth-err');e.textContent=msg;e.style.display='block';};
}
function doLogin(){
  const u=val('l-u'),p=val('l-p');
  const user=users.find(x=>x.username===u&&x.password===p);
  if(!user){authErr('Usuario o contraseña incorrectos.');return;}
  if(user.suspendedUntil&&user.suspendedUntil>Date.now()){
    const d=new Date(user.suspendedUntil);authErr(`Cuenta suspendida hasta ${d.toLocaleDateString('es-ES')}.`);return;
  }
  if(user.twoFA?.enabled){
    const code=val('l-2fa').trim();
    const wrap=document.getElementById('fa2-login-wrap');
    if(!code){wrap.style.display='block';authErr('Introduce el código 2FA.');return;}
    if(!verifyTOTP(user.twoFA.secret, code)){authErr('Código 2FA incorrecto.');return;}
    wrap.style.display='none';
  }
  if(user.deactivated){user.deactivated=false;save();}
  CU={...user};
  localStorage.setItem('sms_currentUser', JSON.stringify(CU));
  localStorage.setItem('sms_color', CU.primaryColor || 'green');
  localStorage.setItem('sms_theme', CU.theme || 'light');
  window.location.href = 'dashboard.html';
}
function doRegister(){
  const u=val('r-u').trim(),p=val('r-p');
  if(!u||!p){authErr('Completa todos los campos.');return;}
  if(p.length<4){authErr('La contraseña debe tener al menos 4 caracteres.');return;}
  if(users.find(x=>x.username===u)){authErr('Ese nombre de usuario ya está en uso.');return;}
  const nu={id:ids.nu++,username:u,password:p,photo:'https://randomuser.me/api/portraits/lego/'+Math.floor(Math.random()*8+1)+'.jpg',cover:'https://picsum.photos/800/200?random='+Math.floor(Math.random()*100),bio:'Nuevo miembro 👋',role:'Miembro',isAdmin:false,followers:[],following:[],blocked:[],savedPosts:[],privacy:{posts:'public',comments:'everyone'},deactivated:false,badges:[],birthday:null,birthdayPrivacy:'friends',twoFA:{enabled:false,secret:null},suspendedUntil:null,ratings:[],collections:[],mutedUsers:[],verified:false,lastActivity:Date.now(),primaryColor:'green',theme:'light'};
  users.push(nu);save();
  CU={...nu};
  localStorage.setItem('sms_currentUser', JSON.stringify(CU));
  localStorage.setItem('sms_color', 'green');
  localStorage.setItem('sms_theme', 'light');
  window.location.href = 'dashboard.html';
}
function doLogout(){
  if (chatPollInterval) { clearInterval(chatPollInterval); chatPollInterval = null; }
  CU=null;
  localStorage.removeItem('sms_currentUser');
  localStorage.setItem('sms_color', 'green');
  localStorage.setItem('sms_theme', 'light');
  window.location.href = 'index.html';
}
function launch(){
  const authEl = document.getElementById('auth');
  if(authEl) authEl.style.display='none';
  const appEl = document.getElementById('app');
  if(appEl) appEl.style.display='block';
  document.getElementById('h-uname').textContent=CU.username;
  const rdUname = document.getElementById('rd-uname');
  if(rdUname) rdUname.textContent=CU.username;
  
  // Bind mobile right drawer events
  const rdNotif = document.getElementById('rd-notif-btn');
  if(rdNotif){
    rdNotif.onclick = () => {
      closeRightDrawer();
      document.getElementById('notif-btn').click();
    };
  }
  const rdTheme = document.getElementById('rd-theme-btn');
  if(rdTheme){
    rdTheme.onclick = () => {
      document.getElementById('theme-btn').click();
    };
  }
  
  // show mod nav if privileged
  const modNav=document.getElementById('mod-nav-item');
  if(modNav && PRIVILEGED.includes(CU.role||''))modNav.style.display='flex';
  
  const pinChk = document.getElementById('sidebar-pin-checkbox');
  if(pinChk) pinChk.checked = localStorage.getItem('sms_sidebar_pinned') === '1';
  applyTheme();
  renderSidebar();
  navigate('public');
  // Restore compact mode
  if(localStorage.getItem('sms_compact')==='1')document.body.classList.add('compact-mode');
  // Restore font size
  const fs=localStorage.getItem('sms_fontsize');if(fs)document.documentElement.style.fontSize=fs+'px';
  updateBadges();
  checkBirthdayNotifs();
  
  // Start background crons
  initNotifPolling();
  initChatPolling();
  runScheduledPostsCron();
  initEventAlertsCron();
  renderHeaderAvatar();
}

// ═══════════════════════════════════════════
//  BIRTHDAYS
// ═══════════════════════════════════════════
function checkBirthdayNotifs(){
  const today=new Date();const mm=today.getMonth(),dd=today.getDate();
  const friends=CU.following.filter(id=>CU.following.includes(id)&&users.find(u=>u.id===id)?.followers?.includes(CU.id));
  friends.forEach(fid=>{
    const fu=users.find(u=>u.id===fid);if(!fu?.birthday)return;
    const bp=fu.birthdayPrivacy||'friends';
    if(bp==='only-me')return;
    if(bp==='friends'&&!CU.following.includes(fid))return;
    const bd=new Date(fu.birthday);
    if(bd.getMonth()===mm&&bd.getDate()===dd){
      addNotif(CU.id,'birthday',fid,{});
    }
  });
}

// ═══════════════════════════════════════════
//  THEME
// ═══════════════════════════════════════════
function setTheme(dark){
  document.body.classList.toggle('dark',dark);
  const themeVal = dark ? 'dark' : 'light';
  localStorage.setItem('sms_theme',themeVal);
  if(CU){
    CU.theme = themeVal;
    const u = users.find(x => x.id === CU.id);
    if(u) u.theme = themeVal;
    save();
  }
  document.getElementById('theme-btn').innerHTML=dark?'<i class="fas fa-sun"></i>':'<i class="fas fa-moon"></i>';
  
  const rdThemeBtn = document.getElementById('rd-theme-btn');
  if(rdThemeBtn){
    const rdIcon = rdThemeBtn.querySelector('.rd-icon');
    const rdText = document.getElementById('rd-theme-text');
    if(rdIcon) rdIcon.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    if(rdText) rdText.textContent = dark ? 'Tema claro' : 'Tema oscuro';
  }
}
function applyTheme(){
  const t=localStorage.getItem('sms_theme');if(t==='dark')setTheme(true);
  const tc=localStorage.getItem('sms_color')||'green';applyColor(tc,false);
  const rm=localStorage.getItem('sms_readmode')==='1';if(rm)document.body.classList.add('read-mode');
  applyWallpaper();
}
function applyColor(c,doSave=true){
  document.body.classList.remove(
    'theme-blue','theme-purple','theme-pink','theme-orange',
    'theme-cyan','theme-yellow','theme-red','theme-teal','theme-amber'
  );
  if(c!=='green')document.body.classList.add('theme-'+c);
  if(doSave){
    localStorage.setItem('sms_color',c);
    if(CU){
      CU.primaryColor = c;
      const u = users.find(x => x.id === CU.id);
      if(u) u.primaryColor = c;
      save();
    }
  }
  // Re-render settings swatches if open
  const swatches=document.querySelectorAll('.color-swatch');
  swatches.forEach(s=>{ s.classList.toggle('active', s.dataset.colorId===c); });
}

// ═══════════════════════════════════════════
//  WALLPAPER SYSTEM — multimedia (imagen, GIF, video mp4/webm/mov...)
// ═══════════════════════════════════════════
const PRESET_WALLPAPERS = [
  { id:'wp1', url:'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=80', label:'Galaxia',  type:'image' },
  { id:'wp2', url:'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80', label:'Nebulosa', type:'image' },
  { id:'wp3', url:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80', label:'Montañas', type:'image' },
  { id:'wp4', url:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80', label:'Playa',    type:'image' },
  { id:'wp5', url:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&q=80', label:'Bosque',   type:'image' },
  { id:'wp6', url:'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&q=80', label:'Valle',    type:'image' },
  { id:'wp7', url:'https://images.unsplash.com/photo-1485470733090-0aae1788d5af?w=1920&q=80', label:'Aurora',   type:'image' },
  { id:'wp8', url:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80', label:'Océano',   type:'image' },
];

// ObjectURL del archivo subido (en memoria, sin tocar localStorage)
let _wpObjectURL = null;

function _detectWpType(urlOrMime) {
  if (!urlOrMime) return 'image';
  const s = urlOrMime.toLowerCase();
  if (s.startsWith('data:video') || s.startsWith('video/') ||
      /\.(mp4|webm|ogg|mov|avi|mkv|m4v)(\?|$|#)/.test(s)) return 'video';
  return 'image';
}

function applyWallpaper() {
  const old = document.getElementById('sms-wallpaper');
  if (old) old.remove();

  const wpUrl   = _wpObjectURL || localStorage.getItem('sms_wallpaper') || '';
  const wpType  = localStorage.getItem('sms_wallpaper_type') || _detectWpType(wpUrl);
  const opacity = parseFloat(localStorage.getItem('sms_wp_opacity') || '0.35');

  if (!wpUrl) {
    document.body.classList.remove('has-wallpaper');
    return;
  }

  const wrap = document.createElement('div');
  wrap.id = 'sms-wallpaper';
  const dark = document.body.classList.contains('dark');
  wrap.style.setProperty('--wp-overlay', dark
    ? `rgba(0,0,0,${opacity})`
    : `rgba(255,255,255,${opacity * 0.5})`
  );

  if (wpType === 'video') {
    const vid = document.createElement('video');
    vid.src         = wpUrl;
    vid.autoplay    = true;
    vid.loop        = true;
    vid.muted       = true;
    vid.playsInline = true;
    // El CSS #sms-wallpaper video ya lo posiciona y dimensiona
    wrap.appendChild(vid);
    // Intentar play (algunos navegadores requieren interacción previa)
    setTimeout(() => vid.play().catch(() => {}), 100);
  } else {
    wrap.style.backgroundImage = `url(${wpUrl})`;
  }

  document.body.insertBefore(wrap, document.body.firstChild);
  document.body.classList.add('has-wallpaper');
}

function setWallpaper(url, type) {
  if (_wpObjectURL) { URL.revokeObjectURL(_wpObjectURL); _wpObjectURL = null; }
  if (url) {
    try { localStorage.setItem('sms_wallpaper', url); } catch(e) {}
    localStorage.setItem('sms_wallpaper_type', type || _detectWpType(url));
  } else {
    localStorage.removeItem('sms_wallpaper');
    localStorage.removeItem('sms_wallpaper_type');
  }
  applyWallpaper();
  toast(url ? 'Fondo aplicado ✨' : 'Fondo eliminado', 'success');
  if (cView === 'settings' && cSettingsSection === 'appearance') renderSettings();
}

function setWallpaperOpacity(val) {
  localStorage.setItem('sms_wp_opacity', val);
  applyWallpaper();
}

function uploadWallpaper() {
  const inp = document.createElement('input');
  inp.type   = 'file';
  inp.accept = 'image/*,video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska,.gif,.webp,.avif,.svg';
  inp.onchange = () => {
    const file = inp.files[0]; if (!file) return;

    const mime   = file.type || '';
    const wpType = _detectWpType(mime || file.name);

    // Revocar ObjectURL anterior
    if (_wpObjectURL) { URL.revokeObjectURL(_wpObjectURL); _wpObjectURL = null; }

    // Solo guardar el tipo en localStorage (no el archivo, para evitar QuotaExceededError)
    localStorage.setItem('sms_wallpaper_type', wpType);
    localStorage.removeItem('sms_wallpaper');

    // Crear ObjectURL en memoria — funciona con archivos de cualquier tamaño
    _wpObjectURL = URL.createObjectURL(file);

    applyWallpaper();
    toast(`Fondo ${wpType === 'video' ? '🎬 video' : '🖼️ imagen/GIF'} aplicado ✨`, 'success');
    if (cView === 'settings' && cSettingsSection === 'appearance') renderSettings();
  };
  inp.click();
}
const _themeBtnEl = document.getElementById('theme-btn');
if(_themeBtnEl) _themeBtnEl.addEventListener('click',()=>setTheme(!document.body.classList.contains('dark')));
if(localStorage.getItem('sms_theme')==='dark' && _themeBtnEl){setTheme(true);}

// ═══════════════════════════════════════════
//  SIDEBAR
// ═══════════════════════════════════════════
function renderSidebar(){renderPCard();renderMembers();renderGroupsBar();renderTrendingHashtags();}
function renderPCard(){
  const u=CU,tp=posts.filter(p=>p.userId===u.id).length;
  document.getElementById('pc-card').innerHTML=`
    <img src="${u.cover||defCov()}" class="pc-cover" alt="" loading="lazy">
    <div class="pc-body">
      <div style="position:relative; width:60px; height:60px; margin: -30px auto 0; border-radius:50%; border:3px solid var(--card); overflow:hidden; cursor:pointer;" onclick="openProfileModal(${u.id})">
        <img src="${u.photo||defAv()}" id="pc-av-img" style="width:100%; height:100%; object-fit:cover; display:block;">
        <canvas id="pc-av-canvas" style="width:100%; height:100%; display:none;"></canvas>
      </div>
      <div class="pc-name">${esc(u.username)} ${badgesHtml(u.id)}</div>
      <span class="tag tag-${roleTag(u.role)}">${esc(u.role||'Miembro')}</span>
      <p class="pc-bio">${esc(u.bio||'')}</p>
      <div class="pc-stats">
        <div class="stat"><div class="n">${tp}</div><div class="l">Posts</div></div>
        <div class="stat"><div class="n">${u.followers.length}</div><div class="l">Seguidores</div></div>
        <div class="stat"><div class="n">${u.following.length}</div><div class="l">Siguiendo</div></div>
      </div>
    </div>`;
    
  setTimeout(() => {
    const canvas = document.getElementById('pc-av-canvas');
    const img = document.getElementById('pc-av-img');
    if (window.sidebarAvatarInstance) {
      window.sidebarAvatarInstance.stop();
      window.sidebarAvatarInstance = null;
    }
    if (u.avatarConfig && u.avatarConfig.use3D) {
      if (img) img.style.display = 'none';
      if (canvas) {
        canvas.style.display = 'block';
        window.sidebarAvatarInstance = create3DAvatar('pc-av-canvas', u.avatarConfig);
      }
    } else {
      if (canvas) canvas.style.display = 'none';
      if (img) img.style.display = 'block';
    }
  }, 50);
}
function renderMembers(){
  const c=document.getElementById('members-list');
  const bl=CU.blocked||[];
  const others=users.filter(u=>u.id!==CU.id&&!bl.includes(u.id)&&!u.deactivated);
  c.innerHTML=others.length?others.map(u=>`
    <div class="list-row" onclick="openProfileModal(${u.id})">
      <img src="${u.photo||defAv()}" class="lav" alt="" loading="lazy">
      <div><div class="lname">${esc(u.username)}</div><div class="lsub"><span class="tag tag-${roleTag(u.role)} tag-gray" style="font-size:.67rem;">${esc(u.role||'Miembro')}</span></div></div>
    </div>`).join(''):`<p style="padding:8px 11px;font-size:.8rem;color:var(--text2);">Sin otros miembros</p>`;
}
function renderGroupsBar(){
  const c=document.getElementById('groups-list');
  const mine=groups.filter(g=>g.members.includes(CU.id));
  const other=groups.filter(g=>!g.members.includes(CU.id));
  let h='';
  if(mine.length){h+=`<p style="padding:3px 10px;font-size:.72rem;font-weight:700;color:var(--text2);">MIS GRUPOS</p>`;mine.forEach(g=>{h+=`<div class="gchip" onclick="navigate('groups',${g.id})"><span class="gicon"><i class="fas fa-users"></i></span><span style="flex:1;">${esc(g.name)}</span></div>`;});}
  if(other.length){h+=`<p style="padding:3px 10px;font-size:.72rem;font-weight:700;color:var(--text2);margin-top:5px;">DESCUBRIR</p>`;other.forEach(g=>{h+=`<div class="gchip" onclick="joinGroup(${g.id})"><span class="gicon" style="background:var(--purple-l);color:var(--purple);"><i class="fas fa-plus"></i></span><span style="flex:1;">${esc(g.name)}</span></div>`;});}
  if(!groups.length)h='<p style="padding:9px 11px;font-size:.8rem;color:var(--text2);">Crea el primer grupo</p>';
  c.innerHTML=h;
}

// MOBILE DUAL DRAWERS CONTROLLERS
function toggleSidebarPin(pinned) {
  if (pinned) {
    document.body.classList.add('sidebar-pinned');
    localStorage.setItem('sms_sidebar_pinned', '1');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('active');
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('active');
    document.body.classList.remove('noscroll');
  } else {
    document.body.classList.remove('sidebar-pinned');
    localStorage.setItem('sms_sidebar_pinned', '0');
  }
}
function toggleMobileSidebar() {
  closeRightDrawer();
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar && backdrop) {
    sidebar.classList.toggle('active');
    backdrop.classList.toggle('active');
    document.body.classList.toggle('noscroll', sidebar.classList.contains('active'));
  }
}
function closeMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar && backdrop) {
    sidebar.classList.remove('active');
    const rightDrawer = document.getElementById('right-drawer');
    if (!rightDrawer || !rightDrawer.classList.contains('active')) {
      backdrop.classList.remove('active');
    }
    document.body.classList.remove('noscroll');
  }
}
function toggleRightDrawer() {
  closeMobileSidebar();
  const rightDrawer = document.getElementById('right-drawer');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (rightDrawer && backdrop) {
    rightDrawer.classList.toggle('active');
    backdrop.classList.toggle('active');
    document.body.classList.toggle('noscroll', rightDrawer.classList.contains('active'));
    
    if (rightDrawer.classList.contains('active')) {
      const unread=notifs.filter(n=>n.userId===CU.id&&!n.read).length;
      const rdNb=document.getElementById('rd-notif-badge');
      if(rdNb){
        rdNb.textContent=unread;
        rdNb.style.display=unread>0?'block':'none';
      }
      const dark = document.body.classList.contains('dark');
      const rdThemeBtn = document.getElementById('rd-theme-btn');
      if(rdThemeBtn){
        const rdIcon = rdThemeBtn.querySelector('.rd-icon');
        const rdText = document.getElementById('rd-theme-text');
        if(rdIcon) rdIcon.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        if(rdText) rdText.textContent = dark ? 'Tema claro' : 'Tema oscuro';
      }
    }
  }
}
function closeRightDrawer() {
  const rightDrawer = document.getElementById('right-drawer');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (rightDrawer && backdrop) {
    rightDrawer.classList.remove('active');
    const sidebar = document.getElementById('sidebar');
    if (!sidebar || !sidebar.classList.contains('active')) {
      backdrop.classList.remove('active');
    }
    document.body.classList.remove('noscroll');
  }
}
function closeAllDrawers() {
  closeMobileSidebar();
  closeRightDrawer();
}

// ═══════════════════════════════════════════
//  NAVEGACIÓN
// ═══════════════════════════════════════════
function navigate(view,param){
  closeAllDrawers();
  // Limpiar timer efímero al salir de mensajes
  if(window._ephTimer){clearInterval(window._ephTimer);window._ephTimer=null;}
  cView=view;
  if (window.profilePageAvatarInstance) {
    window.profilePageAvatarInstance.stop();
    window.profilePageAvatarInstance = null;
  }
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const el=document.querySelector(`.nav-item[data-view="${view}"]`);if(el)el.classList.add('active');
  const mc=document.getElementById('content');mc.innerHTML='';
  if(view==='public')renderFeed();
  else if(view==='stories')renderStoriesPage();
  else if(view==='reels')renderReelsPage();
  else if(view==='groups')renderGroupsPage(param);
  else if(view==='marketplace')renderMarketplace();
  else if(view==='events')renderEventsPage();
  else if(view==='messages')renderMessages();
  else if(view==='saved')renderSaved();
  else if(view==='settings')renderSettings();
  else if(view==='profile')renderProfilePage(param);
  else if(view==='moderation')renderModerationPanel();
  else if(view==='scheduled')renderScheduledPostsPage();
  else if(view==='channels')renderChannelsPage();
  else if(view==='watch')renderWatchPage();
  else if(view==='friends')renderFriendsPage();
}

// ═══════════════════════════════════════════
//  BIRTHDAY BANNER
// ═══════════════════════════════════════════
function birthdayBanner(){
  const today=new Date();const mm=today.getMonth(),dd=today.getDate();
  const bl=CU.blocked||[];
  const bFriends=(CU.following||[]).filter(fid=>{
    const fu=users.find(u=>u.id===fid);if(!fu?.birthday)return false;
    if(bl.includes(fid))return false;
    const bp=fu.birthdayPrivacy||'friends';
    if(bp==='only-me')return false;
    const bd=new Date(fu.birthday);
    return bd.getMonth()===mm&&bd.getDate()===dd;
  }).map(fid=>users.find(u=>u.id===fid)?.username).filter(Boolean);
  if(!bFriends.length)return'';
  return `<div class="birthday-banner"><i class="fas fa-birthday-cake"></i><div><strong>🎂 ¡Cumpleaños!</strong><p style="font-size:.82rem;margin-top:2px;">${bFriends.map(esc).join(', ')} ${bFriends.length===1?'está':'están'} de cumpleaños hoy. ¡Felicítales!</p></div></div>`;
}

// ═══════════════════════════════════════════
//  FEED PÚBLICO
// ═══════════════════════════════════════════
function renderFeed(){
  const mc=document.getElementById('content');
  // skeleton first
  mc.innerHTML=storiesBar()+composer('public',null)+`
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:0 4px; flex-wrap:wrap; gap:8px;">
      <span style="font-size:.85rem; font-weight:700; color:var(--text2);">Publicaciones</span>
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:.78rem; color:var(--text2);"><i class="fas fa-sort"></i> Ordenar:</span>
        <select id="feed-sort-select" onchange="changeFeedSort(this.value)" style="padding: 4px 10px; font-size: .78rem; border-radius: var(--r-2xl); width: auto;">
          <option value="recent" ${cFeedSort==='recent'?'selected':''}>Más recientes</option>
          <option value="popular" ${cFeedSort==='popular'?'selected':''}>Más populares</option>
        </select>
      </div>
    </div>
    <div id="feed-posts">${skeletonPosts()}</div>`;
  attachComp('public',null);
  setTimeout(()=>{
    const bl=CU.blocked||[];
    const muted=CU.mutedUsers||[];
    const isPriv=PRIVILEGED.includes(CU.role||'');
    let feed=posts.filter(p=>!p.groupId&&!p.isPoll&&p.type!=='photo'&&p.status!=='scheduled').filter(p=>{
      const a=users.find(u=>u.id===p.userId);if(!a||a.deactivated)return false;
      if(bl.includes(p.userId))return false;
      if(muted.includes(p.userId))return false;
      if(a.blocked&&a.blocked.includes(CU.id))return false;
      if(p.hidden && p.userId !== CU.id && !isPriv)return false;
      const priv=(a.privacy?.posts)||'public';
      if(priv==='only-me'&&a.id!==CU.id)return false;
      if(priv==='friends'&&a.id!==CU.id&&!(CU.following.includes(a.id)&&a.followers.includes(CU.id)))return false;
      return true;
    });
    
    if (cFeedSort === 'popular') {
      feed.sort((a,b) => {
        const scoreA = Object.keys(a.reactions||{}).length + (a.comments?.length||0);
        const scoreB = Object.keys(b.reactions||{}).length + (b.comments?.length||0);
        return (b.pinned?1:0)-(a.pinned?1:0) || scoreB - scoreA || b.timestamp - a.timestamp;
      });
    } else {
      feed.sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0)||b.timestamp-a.timestamp);
    }
    
    _feedAll=feed;
    feedPage=0;
    const fp=document.getElementById('feed-posts');
    if(!fp)return;
    fp.innerHTML='';
    // Render first page
    _renderFeedPage(fp);
    // Setup infinite scroll sentinel
    if(_feedObserver)_feedObserver.disconnect();
    const sentinel=document.createElement('div');
    sentinel.id='feed-sentinel';
    sentinel.style.cssText='height:1px;margin-top:8px;';
    fp.after(sentinel);
    _feedObserver=new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting) _loadMoreFeed();
    },{rootMargin:'200px'});
    _feedObserver.observe(sentinel);
  },300);
}
function _renderFeedPage(fp){
  const start=feedPage*FEED_PAGE_SIZE;
  const slice=_feedAll.slice(start,start+FEED_PAGE_SIZE);
  if(feedPage===0){
    fp.innerHTML=birthdayBanner()+pollsFeed().join('');
  }
  if(slice.length){
    fp.insertAdjacentHTML('beforeend',slice.map(postCard).join(''));
  } else if(feedPage===0){
    fp.insertAdjacentHTML('beforeend',empty('fas fa-rss','¡Sé el primero en publicar algo!'));
  }
}
function _loadMoreFeed(){
  const total=_feedAll.length;
  const loaded=(feedPage+1)*FEED_PAGE_SIZE;
  if(loaded>=total)return;
  feedPage++;
  const fp=document.getElementById('feed-posts');
  if(fp)_renderFeedPage(fp);
}
function skeletonPosts(){
  return [1,2,3].map(()=>`<div class="skel-post"><div style="display:flex;gap:9px;margin-bottom:11px;"><div class="skeleton" style="width:40px;height:40px;border-radius:50%;flex-shrink:0;"></div><div style="flex:1;"><div class="skeleton skel-line" style="width:40%;"></div><div class="skeleton skel-line" style="width:25%;margin-top:5px;"></div></div></div><div class="skeleton skel-line" style="width:90%;"></div><div class="skeleton skel-line" style="width:75%;"></div><div class="skeleton skel-line" style="width:60%;margin-top:4px;"></div></div>`).join('');
}
function pollsFeed(){
  const bl=CU.blocked||[];
  return polls.filter(p=>!p.groupId&&!bl.includes(p.createdBy)).map(pollCard);
}

function storiesBar(){
  const now=Date.now(),bl=CU.blocked||[];
  const myS=stories.filter(s=>s.userId===CU.id&&s.expiresAt>now);
  const folS=(CU.following||[]).filter(id=>!bl.includes(id)).map(id=>({id,ss:stories.filter(s=>s.userId===id&&s.expiresAt>now)})).filter(x=>x.ss.length);
  let pills='';
  if(myS.length){pills+=`<div class="s-pill" onclick="openSV(${CU.id})"><div class="s-ring"><img src="${CU.photo||defAv()}" alt="" loading="lazy"></div><div class="s-name">Tu historia</div></div>`;}
  pills+=`<div class="s-pill" onclick="openModal('story-create-modal')" title="Nueva historia"><div class="s-ring add"><div class="s-add-inner"><i class="fas fa-plus"></i></div></div><div class="s-name">+ Añadir</div></div>`;
  folS.forEach(x=>{
    const u=users.find(u=>u.id===x.id);if(!u)return;
    const seen=x.ss.every(s=>s.seenBy&&s.seenBy.includes(CU.id));
    pills+=`<div class="s-pill" onclick="openSV(${u.id})"><div class="s-ring ${seen?'seen':''}"><img src="${u.photo||defAv()}" alt="" loading="lazy"></div><div class="s-name">${esc(u.username)}</div></div>`;
  });
  return `<div class="stories-wrap"><div class="stories-row">${pills}</div></div>`;
}

// ═══════════════════════════════════════════
//  COMPOSITOR
// ═══════════════════════════════════════════
function composer(ctx,groupId){
  const gid=groupId||'null';
  return `<div class="composer" id="comp-${ctx}" ondragover="event.preventDefault();this.classList.add('drop-zone-active')" ondragleave="this.classList.remove('drop-zone-active')" ondrop="handleDrop(event,'${ctx}')">
    <div class="comp-top">
      <img src="${CU.photo||defAv()}" alt="" loading="lazy">
      <textarea class="comp-input" id="ct-${ctx}" placeholder="${ctx==='public'?'¿Qué está pasando? Usa #hashtags · Ctrl+Enter para publicar':'Publica en el grupo...'}" rows="2"></textarea>
    </div>
    <div class="prev-strip" id="cp-${ctx}"><div id="cpi-${ctx}"></div><button class="prev-rm" onclick="clearMedia('${ctx}')"><i class="fas fa-times"></i></button></div>
    <div class="comp-bar">
      <div class="comp-btns">
        <label class="mb"><i class="fas fa-image" style="color:#40916c;"></i> Foto/Video<input type="file" id="cf-${ctx}" accept="image/*,video/*,audio/*" style="display:none;"></label>
        <button class="mb" onclick="openGifModal('${ctx}')"><i class="fas fa-smile-wink" style="color:var(--orange);"></i> GIF</button>
        <button class="mb" onclick="openPollCreatorCtx('${ctx}',${gid})"><i class="fas fa-chart-bar" style="color:var(--purple);"></i> Encuesta</button>
        <button class="mb" onclick="const sw=document.getElementById('sched-wrap-${ctx}');sw.style.display=sw.style.display==='none'?'block':'none';" title="Programar post"><i class="fas fa-clock" style="color:var(--blue);"></i></button>
        <select class="priv-sel" id="cpriv-${ctx}" title="Privacidad">
          <option value="public">🌍 Público</option>
          <option value="friends">👥 Amigos</option>
          <option value="only-me">🔒 Solo yo</option>
        </select>
      </div>
      <button class="btn btn-primary" onclick="publishPost('${ctx}',${gid})" style="padding:7px 16px;">Publicar</button>
    </div>
    <div id="sched-wrap-${ctx}" style="display:none;padding:6px 0 2px;">
      <label style="font-size:.77rem;color:var(--text2);display:flex;align-items:center;gap:7px;flex-wrap:wrap;"><i class="fas fa-clock" style="color:var(--blue);"></i> Programar para: <input type="datetime-local" id="csched-${ctx}" style="font-size:.77rem;padding:4px 8px;border-radius:var(--r-md);width:auto;"><button class="mb" onclick="document.getElementById('sched-wrap-${ctx}').style.display='none';document.getElementById('csched-${ctx}').value='';"><i class="fas fa-times"></i></button></label>
    </div>
  </div>`;
}
function handleDrop(e,ctx){
  e.preventDefault();
  const comp=document.getElementById('comp-'+ctx);if(comp)comp.classList.remove('drop-zone-active');
  const file=e.dataTransfer.files[0];if(!file)return;
  if(!validateFile(file))return;
  const r=new FileReader();
  r.onload=ev=>{
    const t=mediaType(file.type);compMedia[ctx]={data:ev.target.result,type:t};
    const inner=document.getElementById(`cpi-${ctx}`);
    if(t==='image')inner.innerHTML=`<img src="${ev.target.result}" style="max-height:180px;border-radius:var(--r-md);max-width:100%;" loading="lazy">`;
    else if(t==='video')inner.innerHTML=`<video controls src="${ev.target.result}" style="max-height:180px;border-radius:var(--r-md);max-width:100%;"></video>`;
    else inner.innerHTML=`<audio controls src="${ev.target.result}" style="width:100%;"></audio>`;
    document.getElementById(`cp-${ctx}`).style.display='block';
  };
  r.readAsDataURL(file);
}
function validateFile(file){
  if(file.size>MAX_FILE_SIZE){toast('El archivo supera el límite de 50MB','warning');return false;}
  const mime=file.type||'';
  if(!ALLOWED_TYPES_PREFIX.some(p=>mime.startsWith(p))){toast('Solo se permiten archivos de imagen, video o audio','warning');return false;}
  if(file.size>2*1024*1024){toast('Nota: Archivos de más de 2MB se guardarán de forma temporal en tu sesión actual y no se conservarán al recargar.','info');}
  return true;
}
function attachComp(ctx,groupId){
  const fi=document.getElementById(`cf-${ctx}`);if(!fi)return;
  fi.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    if(!validateFile(f))return;
    const r=new FileReader();
    r.onload=ev=>{
      const t=mediaType(f.type);compMedia[ctx]={data:ev.target.result,type:t};
      const inner=document.getElementById(`cpi-${ctx}`);
      if(t==='image')inner.innerHTML=`<img src="${ev.target.result}" style="max-height:180px;border-radius:var(--r-md);max-width:100%;" loading="lazy">`;
      else if(t==='video')inner.innerHTML=`<video controls src="${ev.target.result}" style="max-height:180px;border-radius:var(--r-md);max-width:100%;"></video>`;
      else inner.innerHTML=`<audio controls src="${ev.target.result}" style="width:100%;"></audio>`;
      document.getElementById(`cp-${ctx}`).style.display='block';
    };
    r.readAsDataURL(f);
  };
  // Ctrl+Enter to publish
  const ta=document.getElementById(`ct-${ctx}`);
  if(ta){
    ta.addEventListener('keydown',e=>{if(e.ctrlKey&&e.key==='Enter'){e.preventDefault();publishPost(ctx,groupId);}});
    // @mention autocomplete
    initMentionAutocomplete(`ct-${ctx}`, ctx);
  }
}
function clearMedia(ctx){
  compMedia[ctx]=null;
  document.getElementById(`cp-${ctx}`).style.display='none';
  document.getElementById(`cpi-${ctx}`).innerHTML='';
  const f=document.getElementById(`cf-${ctx}`);if(f)f.value='';
}
function openPollCreatorCtx(ctx,groupId){pendingPollGroup=groupId;pendingPollCtx=ctx;openModal('poll-create-modal');}
let pendingPollCtx='public';

function publishPost(ctx, groupId) {
  // AUTO-DETECCIÓN: si ctx es undefined, buscar el composer activo
  if (!ctx || ctx === 'undefined') {
    const composerElem = document.querySelector('.composer');
    if (composerElem && composerElem.id) {
      const match = composerElem.id.match(/comp-(.+)/);
      if (match) ctx = match[1];
    }
  }
  
  // Validación final
  if (!ctx) {
    toast('Error: no se pudo identificar el compositor', 'error');
    console.error('publishPost llamado sin ctx válido');
    return;
  }
  
  const textarea = document.getElementById(`ct-${ctx}`);
  if (!textarea) {
    toast(`Error: no se encontró el área de texto para "${ctx}"`, 'error');
    return;
  }
  
  const text = textarea.value.trim();
  const media = compMedia[ctx];
  
  if (!text && !media) {
    toast('Escribe algo o adjunta un archivo', 'warning');
    return;
  }
  
  const priv = document.getElementById(`cpriv-${ctx}`)?.value || 'public';
  
  // Programación
  const schedEl = document.getElementById(`csched-${ctx}`);
  const schedVal = schedEl?.value || '';
  const isScheduled = !!schedVal;
  const schedTime = schedVal ? new Date(schedVal).getTime() : null;
  if (isScheduled && schedTime && schedTime <= Date.now()) {
    toast('La fecha programada debe ser futura', 'warning');
    return;
  }
  
  // Asegurar que ids.np existe
  if (typeof ids.np !== 'number' || isNaN(ids.np)) ids.np = 1;
  
  const newPost = {
    id: ids.np++,
    userId: CU.id,
    content: text,
    timestamp: isScheduled ? schedTime : Date.now(),
    reactions: {},
    comments: [],
    reposts: [],
    savedBy: [],
    editHistory: [],
    media: media ? media.data : null,
    mediaType: media ? media.type : null,
    pinned: false,
    groupId: groupId || null,
    isPoll: false,
    privacy: priv,
    isRepost: false,
    status: isScheduled ? 'scheduled' : 'published',
    scheduledAt: schedTime
  };
  
  posts.unshift(newPost);
  
  // Limpiar
  compMedia[ctx] = null;
  textarea.value = '';
  clearMedia(ctx);
  if (schedEl) schedEl.value = '';
  const sw = document.getElementById(`sched-wrap-${ctx}`);
  if (sw) sw.style.display = 'none';
  
  // Sincronizar usuario
  const ux = users.find(u => u.id === CU.id);
  if (ux) {
    ['followers','following','blocked','savedPosts','privacy'].forEach(k => {
      if (ux[k] !== undefined) ux[k] = CU[k];
    });
  }
  
  logActivity('post', text.substring(0,50));
  checkBadges(CU.id);
  
  // Menciones
  const mentions = (text.match(/@([a-zA-Z0-9_]+)/g) || []).map(m => m.slice(1));
  mentions.forEach(name => {
    const mu = users.find(u => u.username === name);
    if (mu && mu.id !== CU.id) addNotif(mu.id, 'mention', CU.id, { postId: newPost.id });
  });
  
  try { save(); } catch(e) { console.error('Save error', e); toast('Error al guardar', 'error'); return; }
  
  if (isScheduled) {
    toast(`⏰ Post programado para ${new Date(schedTime).toLocaleString('es-ES')} ✅`, 'success');
    if (cView === 'scheduled') renderScheduledPostsPage();
  } else {
    if (groupId) renderGroupFeed(groupId);
    else renderFeed();
    renderTrendingHashtags();
    toast('¡Publicado! 🎉', 'success');
  }
}


// ═══════════════════════════════════════════
//  POST CARD
// ═══════════════════════════════════════════
function postCard(p){
  const author=users.find(u=>u.id===p.userId);if(!author)return'';
  if((CU.blocked||[]).includes(author.id))return'';
  const myR=p.reactions?.[CU.id];
  const rCounts=Object.values(p.reactions||{}).reduce((a,r)=>{a[r]=(a[r]||0)+1;return a;},{});
  const saved=(CU.savedPosts||[]).includes(p.id);
  const canEdit=CU.id===author.id;
  const canDelete=CU.id===author.id||CU.isAdmin;
  const canPin=PRIVILEGED.includes(CU.role||'');
  const repostAuthor=p.isRepost?users.find(u=>u.id===p.originalAuthorId):null;
  const originalPost=p.isRepost?posts.find(x=>x.id===p.originalPostId):null;
  const privIco={'public':'🌍','friends':'👥','only-me':'🔒'};
  const isLong=p.content&&p.content.length>300;

  let mediaH='';
  if(p.media){
    if(p.mediaType==='image')mediaH=`<div class="p-media" style="cursor:pointer;" onclick="openLB(this.querySelector('img').src)"><img src="${p.media}" alt="media" loading="lazy"></div>`;
    else if(p.mediaType==='video')mediaH=`<div class="p-media"><video controls src="${p.media}"></video></div>`;
    else if(p.mediaType==='audio')mediaH=`<div class="p-media"><audio controls src="${p.media}"></audio><button class="mb" style="margin:4px 14px 8px;" onclick="openMP('${p.media.substring(0,80)}','${esc(author.username)}')"><i class="fas fa-music"></i> Mini reproductor</button></div>`;
  }
  let repostH='';
  if(p.isRepost&&originalPost){
    const oa=users.find(u=>u.id===originalPost.userId);
    repostH=`<div class="repost-inner"><div class="p-hd" style="padding:10px 12px 6px;"><img src="${oa?.photo||defAv()}" class="p-av" style="width:34px;height:34px;" onclick="openProfileModal(${oa?.id})" alt="" loading="lazy"><div class="p-meta"><div class="p-author" style="font-size:.83rem;" onclick="openProfileModal(${oa?.id})">${esc(oa?.username||'')}</div></div></div>${originalPost.content?`<div class="p-body" style="padding:2px 12px 8px;font-size:.85rem;">${renderHashtags(esc(originalPost.content))}</div>`:''}</div>`;
  }

  const rxnRow=['like','love','laugh','sad','angry'].map(r=>`<button class="rxn-btn ${myR===r?'active':''}" onclick="addRxn(${p.id},'${r}')" title="${r}">${rxnIco(r)}<span>${rCounts[r]||''}</span></button>`).join('');

  const bodyH=p.content?`<div class="p-body ${isLong?'truncated':''}" id="pbody-${p.id}">${renderHashtags(esc(p.content))}</div>${isLong?`<button class="read-more-btn" onclick="expandPost(${p.id})">Leer más ▼</button>`:''}`:'' ;

  return `<div class="post${p.pinned?' pinned':''}" id="post-${p.id}" data-id="${p.id}" style="position:relative;">
    <div class="post-hd">
      <img src="${author.photo||defAv()}" class="p-av" onclick="openProfileModal(${author.id})" alt="" loading="lazy">
      <div class="p-meta">
        <div class="p-author" onclick="openProfileModal(${author.id})">${esc(author.username)} ${badgesHtml(author.id)} <span class="tag tag-${roleTag(author.role)}">${esc(author.role||'Miembro')}</span>${p.pinned?'<span class="tag tag-orange">📌 Fijado</span>':''}</div>
        <div class="p-time"><span>${timeAgo(p.timestamp)}</span><span>${privIco[p.privacy||'public']}</span>${repostAuthor?`<span>↩️ Repost de ${esc(repostAuthor.username)}</span>`:''}${p.editHistory?.length?'<span>✏️ Editado</span>':''}</div>
      </div>
      <button class="pm-btn" onclick="togglePMenu(${p.id})"><i class="fas fa-ellipsis-h"></i></button>
      <div class="p-dropdown" id="pdrop-${p.id}" style="display:none;">
        ${canEdit?`<button onclick="openEditPost(${p.id})"><i class="fas fa-edit"></i> Editar</button>`:''}
        ${p.editHistory?.length?`<button onclick="showHistory(${p.id})"><i class="fas fa-history"></i> Historial</button>`:''}
        ${canPin?`<button onclick="togglePin(${p.id})"><i class="fas fa-thumbtack"></i> ${p.pinned?'Desfijar':'Fijar'}</button>`:''}
        ${canDelete?`<button class="d-red" onclick="deletePost(${p.id})"><i class="fas fa-trash"></i> Eliminar</button>`:''}
        <button onclick="openReport('post',${p.id})"><i class="fas fa-flag"></i> Reportar</button>
      </div>
    </div>
    ${bodyH}
    ${repostH}${mediaH}
    <div class="p-rxn-row">${rxnRow}</div>
    <div class="p-stats"><span style="cursor:pointer;" onclick="showWhoLiked(${p.id})"><i class="fas fa-heart" style="color:var(--danger);"></i> ${Object.keys(p.reactions||{}).length} reacciones</span><span><i class="fas fa-retweet"></i> ${p.reposts?.length||0}</span><span><i class="fas fa-comment"></i> ${p.comments.length}</span><span><i class="fas fa-bookmark"></i> ${p.savedBy?.length||0}</span></div>
    <div class="p-acts">
      <button class="act" onclick="repostPost(${p.id})"><i class="fas fa-retweet"></i> Repostear</button>
      <button class="act ${saved?'saved-active':''}" onclick="openCollectionModal(${p.id})"><i class="fas fa-bookmark"></i> ${saved?'Guardado':'Guardar'}</button>
      <button class="act" onclick="toggleCmts(${p.id})"><i class="fas fa-comment"></i> Comentar</button>
      <button class="act" onclick="openSharePost(${p.id})"><i class="fas fa-share"></i> Compartir</button>
    </div>
    <div class="comments" id="cmts-${p.id}">${renderCmts(p)}</div>
  </div>`;
}
function expandPost(pid){
  const b=document.getElementById(`pbody-${pid}`);
  if(b){b.classList.remove('truncated');const btn=b.nextElementSibling;if(btn&&btn.classList.contains('read-more-btn'))btn.remove();}
}

function renderCmts(p){
  const bl=CU.blocked||[];
  const validCmts = p.comments.filter(c=>!bl.includes(c.userId));
  validCmts.forEach(c => {
    c.upvotes = c.upvotes || [];
    c.downvotes = c.downvotes || [];
    c.likes = c.likes || [];
    c.replies = c.replies || [];
  });
  validCmts.sort((a,b) => {
    const scoreA = a.upvotes.length - a.downvotes.length;
    const scoreB = b.upvotes.length - b.downvotes.length;
    return scoreB - scoreA;
  });

  let h = validCmts.map(c=>{
    const cu=users.find(u=>u.id===c.userId);if(!cu)return '';
    const canAct=CU.id===c.userId||CU.isAdmin;
    const netVotes = c.upvotes.length - c.downvotes.length;
    const liked = c.likes.includes(CU.id);
    const upvoted = c.upvotes.includes(CU.id);
    const downvoted = c.downvotes.includes(CU.id);

    let repliesHtml = '';
    if (c.replies.length > 0) {
      repliesHtml = `<div class="cm-replies-list" style="margin-left: 36px; border-left: 1.5px solid var(--border); padding-left: 12px; margin-top: 6px; display: flex; flex-direction: column; gap: 6px;">`;
      repliesHtml += c.replies.map(r => {
        const ru = users.find(u => u.id === r.userId);
        if (!ru) return '';
        const canActR = CU.id === r.userId || CU.isAdmin;
        return `
          <div class="cm-item sub-comment" style="margin-bottom: 2px;">
            <div class="cm-main-row">
              <img src="${ru.photo||defAv()}" class="cm-av" style="width: 22px; height: 22px;" alt="" loading="lazy">
              <div class="cm-bubble" style="padding: 5px 9px;">
                <div class="cm-author" onclick="openProfileModal(${ru.id})" style="font-size: 0.76rem;">${esc(ru.username)}</div>
                <div class="cm-text" style="font-size: 0.8rem;">${esc(r.text)}</div>
                <div class="cm-acts" style="font-size: 0.68rem; margin-top: 2px;">
                  <span class="cm-act" style="cursor:default;">${timeAgo(r.timestamp)}</span>
                  ${canActR?`<button class="cm-act" onclick="editSubCmt(${p.id},${c.id},${r.id})">Editar</button><button class="cm-act" style="color:var(--danger);" onclick="deleteSubCmt(${p.id},${c.id},${r.id})">Eliminar</button>`:''}
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
      repliesHtml += `</div>`;
    }

    return `
      <div class="cm-item">
        <div class="cm-main-row">
          <img src="${cu.photo||defAv()}" class="cm-av" alt="" loading="lazy">
          <div class="cm-bubble">
            <div class="cm-author" onclick="openProfileModal(${cu.id})">${esc(cu.username)}</div>
            <div class="cm-text">${esc(c.text)}</div>
            <div class="cm-acts">
              <span class="cm-act" style="cursor:default;">${timeAgo(c.timestamp)}</span>
              
              <button class="cm-act" onclick="voteCmt(${p.id}, ${c.id}, 'up')" style="color: ${upvoted?'var(--green)':'var(--text2)'};" title="Voto positivo">
                <i class="fas fa-chevron-up"></i>
              </button>
              <span class="cmt-votes-count" style="color: ${netVotes > 0 ? 'var(--green)' : netVotes < 0 ? 'var(--danger)' : 'var(--text2)'}">${netVotes}</span>
              <button class="cm-act" onclick="voteCmt(${p.id}, ${c.id}, 'down')" style="color: ${downvoted?'var(--danger)':'var(--text2)'};" title="Voto negativo">
                <i class="fas fa-chevron-down"></i>
              </button>
              
              <button class="cm-act" onclick="likeCmt(${p.id}, ${c.id})" style="color: ${liked?'var(--danger)':'var(--text2)'}; font-weight: ${liked?'700':'400'};" title="Me gusta">
                <i class="${liked?'fas':'far'} fa-heart"></i> ${c.likes.length}
              </button>
              
              <button class="cm-act" onclick="toggleCmtReplyInput(${p.id}, ${c.id})" title="Responder">
                <i class="fas fa-reply"></i> Responder
              </button>

              ${canAct?`<button class="cm-act" onclick="editCmt(${p.id},${c.id})">Editar</button><button class="cm-act" style="color:var(--danger);" onclick="deleteCmt(${p.id},${c.id})">Eliminar</button>`:''}
              <button class="cm-act" onclick="openReport('comment',${c.id},${p.id})">Reportar</button>
            </div>
          </div>
        </div>
        
        <div class="cm-reply-input-row" id="cri-${p.id}-${c.id}" style="display:none; gap:6px; align-items:center; margin-left: 36px; margin-top: 5px; width: calc(100% - 36px);">
          <img src="${CU.photo||defAv()}" style="width:20px; height:20px; border-radius:50%; object-fit:cover;" alt="" loading="lazy">
          <input type="text" id="cri-in-${p.id}-${c.id}" placeholder="Escribe una respuesta..." style="padding: 5px 10px; font-size: 0.78rem; flex: 1; border-radius: var(--r-2xl);" onkeypress="if(event.key==='Enter')addCmtReply(${p.id}, ${c.id})">
          <button class="cm-send" style="width:26px; height:26px; font-size:0.7rem;" onclick="addCmtReply(${p.id}, ${c.id})"><i class="fas fa-paper-plane"></i></button>
        </div>
        
        ${repliesHtml}
      </div>
    `;
  }).join('');
  const pa=users.find(u=>u.id===p.userId);
  const cp=(pa?.privacy?.comments)||'everyone';
  let canCmt=true;
  if(cp==='friends'&&p.userId!==CU.id)canCmt=CU.following.includes(p.userId)&&(pa?.followers||[]).includes(CU.id);
  else if(cp==='only-me')canCmt=CU.id===p.userId;
  h+=canCmt?`<div class="cm-input-row"><img src="${CU.photo||defAv()}" alt="" loading="lazy"><input type="text" id="ci-${p.id}" placeholder="Comentar..." onkeypress="if(event.key==='Enter')addCmt(${p.id})"><button class="cm-send" onclick="addCmt(${p.id})"><i class="fas fa-paper-plane"></i></button></div>`:`<p style="font-size:.76rem;color:var(--text2);padding:5px 0;text-align:center;">Los comentarios están restringidos.</p>`;
  return h;
}

// ═══════════════════════════════════════════
//  POST ACCIONES
// ═══════════════════════════════════════════
function togglePMenu(id){
  document.querySelectorAll('.p-dropdown').forEach(d=>{if(d.id!==`pdrop-${id}`)d.style.display='none';});
  const m=document.getElementById(`pdrop-${id}`);if(m)m.style.display=m.style.display==='none'?'block':'none';
}
document.addEventListener('click',e=>{if(!e.target.closest('.pm-btn')&&!e.target.closest('.p-dropdown'))document.querySelectorAll('.p-dropdown').forEach(d=>d.style.display='none');});

function addRxn(postId,rxn){
  const p=posts.find(x=>x.id===postId);if(!p)return;
  p.reactions=p.reactions||{};
  if(p.reactions[CU.id]===rxn)delete p.reactions[CU.id];
  else{
    p.reactions[CU.id]=rxn;
    if(p.userId!==CU.id){addNotif(p.userId,'reaction',CU.id,{postId});}
  }
  checkBadges(p.userId);
  logActivity('reaction',rxn);
  save();refreshPost(p);
}
function addCmt(postId){
  const inp=document.getElementById(`ci-${postId}`);if(!inp||!inp.value.trim())return;
  const p=posts.find(x=>x.id===postId);if(!p)return;
  const text=inp.value.trim();
  const c={id:Date.now(),userId:CU.id,text,timestamp:Date.now()};
  p.comments.push(c);
  if(p.userId!==CU.id)addNotif(p.userId,'comment',CU.id,{postId});
  inp.value='';
  logActivity('comment',text.substring(0,50));
  save();
  const s=document.getElementById(`cmts-${postId}`);if(s)s.innerHTML=renderCmts(p);
}
function editCmt(pId,cId){
  const p=posts.find(x=>x.id===pId);if(!p)return;
  const c=p.comments.find(x=>x.id===cId);if(!c||(c.userId!==CU.id&&!CU.isAdmin))return;
  const t=prompt('Editar comentario:',c.text);
  if(t&&t.trim()){c.text=t.trim();save();const s=document.getElementById(`cmts-${pId}`);if(s)s.innerHTML=renderCmts(p);}
}
function deleteCmt(pId,cId){
  const p=posts.find(x=>x.id===pId);if(!p)return;
  const c=p.comments.find(x=>x.id===cId);if(!c||(c.userId!==CU.id&&!CU.isAdmin))return;
  p.comments=p.comments.filter(x=>x.id!==cId);save();
  const s=document.getElementById(`cmts-${pId}`);if(s)s.innerHTML=renderCmts(p);
}
function toggleCmts(id){document.getElementById(`cmts-${id}`)?.classList.toggle('open');}
function likeCmt(pId, cId) {
  const p = posts.find(x => x.id === pId); if (!p) return;
  const c = p.comments.find(x => x.id === cId); if (!c) return;
  c.likes = c.likes || [];
  if (c.likes.includes(CU.id)) {
    c.likes = c.likes.filter(x => x !== CU.id);
  } else {
    c.likes.push(CU.id);
    if (c.userId !== CU.id) {
      addNotif(c.userId, 'cmt_like', CU.id, { postId: pId, commentId: cId });
    }
  }
  save();
  const s = document.getElementById(`cmts-${pId}`); if (s) s.innerHTML = renderCmts(p);
}
function voteCmt(pId, cId, type) {
  const p = posts.find(x => x.id === pId); if (!p) return;
  const c = p.comments.find(x => x.id === cId); if (!c) return;
  c.upvotes = c.upvotes || [];
  c.downvotes = c.downvotes || [];
  if (type === 'up') {
    if (c.upvotes.includes(CU.id)) {
      c.upvotes = c.upvotes.filter(x => x !== CU.id);
    } else {
      c.upvotes.push(CU.id);
      c.downvotes = c.downvotes.filter(x => x !== CU.id);
    }
  } else if (type === 'down') {
    if (c.downvotes.includes(CU.id)) {
      c.downvotes = c.downvotes.filter(x => x !== CU.id);
    } else {
      c.downvotes.push(CU.id);
      c.upvotes = c.upvotes.filter(x => x !== CU.id);
    }
  }
  save();
  const s = document.getElementById(`cmts-${pId}`); if (s) s.innerHTML = renderCmts(p);
}
function toggleCmtReplyInput(pId, cId) {
  const el = document.getElementById(`cri-${pId}-${cId}`);
  if (el) el.style.display = el.style.display === 'none' ? 'flex' : 'none';
}
function addCmtReply(pId, cId) {
  const inp = document.getElementById(`cri-in-${pId}-${cId}`); if (!inp || !inp.value.trim()) return;
  const p = posts.find(x => x.id === pId); if (!p) return;
  const c = p.comments.find(x => x.id === cId); if (!c) return;
  c.replies = c.replies || [];
  const r = { id: Date.now(), userId: CU.id, text: inp.value.trim(), timestamp: Date.now() };
  c.replies.push(r);
  if (c.userId !== CU.id) {
    addNotif(c.userId, 'cmt_reply', CU.id, { postId: pId, commentId: cId });
  }
  inp.value = '';
  save();
  const s = document.getElementById(`cmts-${pId}`); if (s) s.innerHTML = renderCmts(p);
}
function editSubCmt(pId, cId, rId) {
  const p = posts.find(x => x.id === pId); if (!p) return;
  const c = p.comments.find(x => x.id === cId); if (!c) return;
  const r = c.replies.find(x => x.id === rId); if (!r || (r.userId !== CU.id && !CU.isAdmin)) return;
  const t = prompt('Editar respuesta:', r.text);
  if (t && t.trim()) {
    r.text = t.trim();
    save();
    const s = document.getElementById(`cmts-${pId}`); if (s) s.innerHTML = renderCmts(p);
  }
}
function deleteSubCmt(pId, cId, rId) {
  const p = posts.find(x => x.id === pId); if (!p) return;
  const c = p.comments.find(x => x.id === cId); if (!c) return;
  c.replies = c.replies.filter(x => x.id !== rId);
  save();
  const s = document.getElementById(`cmts-${pId}`); if (s) s.innerHTML = renderCmts(p);
}
function openEditPost(id){
  const p=posts.find(x=>x.id===id);if(!p)return;
  editingPostId=id;document.getElementById('ep-text').value=p.content;openModal('edit-post-modal');
}
function saveEdit(){
  const p=posts.find(x=>x.id===editingPostId);if(!p)return;
  const txt=document.getElementById('ep-text').value.trim();
  if(txt&&txt!==p.content){p.editHistory=p.editHistory||[];p.editHistory.push({content:p.content,timestamp:Date.now()});p.content=txt;save();refreshPostOrFeed(p);}
  closeModal('edit-post-modal');editingPostId=null;
}
function showHistory(id){
  const p=posts.find(x=>x.id===id);if(!p||!p.editHistory?.length)return;
  alert('Historial de ediciones:\n\n'+p.editHistory.map((h,i)=>`[v${i+1}] ${new Date(h.timestamp).toLocaleString()}\n${h.content}`).join('\n\n'));
}
function deletePost(id){
  if(!confirm('¿Eliminar publicación?'))return;
  const p=posts.find(x=>x.id===id);if(!p)return;
  posts=posts.filter(x=>x.id!==id);save();
  const el=document.getElementById(`post-${id}`);
  if(el)el.remove();else refreshPostOrFeed(p);
  toast('Publicación eliminada','info');
}
function togglePin(id){
  if(!PRIVILEGED.includes(CU.role||''))return;
  const p=posts.find(x=>x.id===id);if(!p)return;
  p.pinned=!p.pinned;save();refreshPostOrFeed(p);
  toast(p.pinned?'Publicación fijada 📌':'Publicación desfijada','info');
}
function toggleSave(pId){
  const p=posts.find(x=>x.id===pId);if(!p)return;
  const ux=users.find(u=>u.id===CU.id);if(!ux)return;
  if((CU.savedPosts||[]).includes(pId)){
    CU.savedPosts=CU.savedPosts.filter(id=>id!==pId);ux.savedPosts=CU.savedPosts;
    p.savedBy=(p.savedBy||[]).filter(id=>id!==CU.id);
  }else{
    CU.savedPosts=CU.savedPosts||[];CU.savedPosts.push(pId);ux.savedPosts=CU.savedPosts;
    p.savedBy=p.savedBy||[];p.savedBy.push(CU.id);
  }
  save();refreshPost(p);
}
function repostPost(origId){
  const orig=posts.find(x=>x.id===origId);if(!orig)return;
  const rp={id:ids.np++,userId:CU.id,content:'',timestamp:Date.now(),reactions:{},comments:[],reposts:[],savedBy:[],editHistory:[],media:null,mediaType:null,pinned:false,groupId:null,isPoll:false,isRepost:true,originalPostId:orig.id,originalAuthorId:orig.userId,privacy:'public'};
  posts.unshift(rp);orig.reposts=orig.reposts||[];orig.reposts.push(CU.id);
  addNotif(orig.userId,'repost',CU.id,{postId:orig.id});
  logActivity('repost',`Repost #${orig.id}`);
  save();renderFeed();toast('Reposteado ↩️','success');
}
function openReport(type,id,postId){reportTarget={type,id,postId};openModal('report-modal');}
function submitReport(){
  const reason=val('rp-reason').trim();
  if(!reason||!reportTarget){toast('Escribe un motivo','warning');return;}
  reports.push({id:Date.now(),...reportTarget,reason,by:CU.id,timestamp:Date.now(),status:'pending'});
  save();closeModal('report-modal');reportTarget=null;document.getElementById('rp-reason').value='';
  // update mod badge
  const mb=document.getElementById('mod-badge');
  const pending=reports.filter(r=>r.status==='pending').length;
  if(mb){mb.textContent=pending;mb.style.display=pending>0?'block':'none';}
  toast('Reporte enviado ✅','info');
}
function refreshPost(p){
  const el=document.getElementById(`post-${p.id}`);
  if(el){const d=document.createElement('div');d.innerHTML=postCard(p);el.replaceWith(d.firstChild);}
}
function refreshPostOrFeed(p){if(p.groupId)renderGroupFeed(p.groupId);else renderFeed();}

// ═══════════════════════════════════════════
//  MODERATION PANEL
// ═══════════════════════════════════════════
function renderModerationPanel() {
  if (!PRIVILEGED.includes(CU.role || '')) return;
  const mc = document.getElementById('content');
  const pending = reports.filter(r => r.status === 'pending');
  
  mc.innerHTML = `
    <div style="margin-bottom:14px;display:flex;align-items:center;gap:9px;">
      <h3 style="font-family:var(--font-head);font-weight:800;"><i class="fas fa-shield-halved" style="color:var(--orange);margin-right:7px;"></i>Panel de Moderación</h3>
      <span class="tag tag-orange">${pending.length} pendientes</span>
    </div>
    <div class="card" style="padding:16px;">
      <h4 style="font-family:var(--font-head);font-weight:700;margin-bottom:13px;">Reportes pendientes</h4>
      ${pending.length ? pending.map(r => {
        const byU = users.find(u => u.id === r.by);
        let targetDesc = '';
        let viewButton = '';
        
        if (r.type === 'post') {
          const p = posts.find(x => x.id === r.id);
          const au = users.find(u => u.id === p?.userId);
          if (p) {
            // Mostrar contenido real
            if (p.content) {
              targetDesc = `Post de ${esc(au?.username || '?')}: "${esc(p.content.substring(0, 100))}${p.content.length > 100 ? '…' : ''}"`;
            } else if (p.media) {
              const mediaType = p.mediaType || (p.media.startsWith('data:image') ? 'image' : 'file');
              const mediaIcon = mediaType === 'image' ? '🖼️ Imagen' : (mediaType === 'video' ? '🎬 Vídeo' : (mediaType === 'audio' ? '🎵 Audio' : '📎 Archivo'));
              targetDesc = `Post de ${esc(au?.username || '?')}: [${mediaIcon}]`;
              // Añadir miniatura si es imagen
              if (mediaType === 'image' && p.media && p.media.length < 500) {
                targetDesc += ` <img src="${p.media}" style="max-height:40px; max-width:60px; border-radius:4px; vertical-align:middle; margin-left:5px;">`;
              }
            } else {
              targetDesc = `Post de ${esc(au?.username || '?')}: [Sin contenido]`;
            }
            viewButton = `<button class="btn btn-ghost" style="font-size:.72rem; padding:3px 8px;" onclick="viewReportedContent('post', ${r.id})"><i class="fas fa-eye"></i> Ver</button>`;
          } else {
            targetDesc = `Post eliminado (ID ${r.id})`;
          }
        } 
        else if (r.type === 'comment') {
          // Buscar el comentario en todos los posts
          let found = false;
          for (const post of posts) {
            const comment = post.comments.find(c => c.id === r.id);
            if (comment) {
              const au = users.find(u => u.id === comment.userId);
              targetDesc = `Comentario de ${esc(au?.username || '?')} en post de ${esc(users.find(u=>u.id===post.userId)?.username||'?')}: "${esc(comment.text.substring(0, 100))}"`;
              viewButton = `<button class="btn btn-ghost" style="font-size:.72rem; padding:3px 8px;" onclick="viewReportedContent('comment', ${r.id}, ${post.id})"><i class="fas fa-eye"></i> Ver</button>`;
              found = true;
              break;
            }
          }
          if (!found) targetDesc = `Comentario eliminado (ID ${r.id})`;
        }
        
        return `
          <div class="report-item" style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:7px;">
              <div style="flex:1;">
                <div style="font-size:.78rem; color:var(--text2); margin-bottom:3px;">Reportado por: <strong>${esc(byU?.username || '?')}</strong> · ${timeAgo(r.timestamp)}</div>
                <div style="font-size:.85rem; font-weight:600; margin-bottom:3px; background:var(--input-bg); padding:6px 10px; border-radius:var(--r-md); word-break:break-word;">${targetDesc}</div>
                <div style="font-size:.82rem; color:var(--text2);">Motivo: ${esc(r.reason)}</div>
              </div>
              <div style="display:flex; gap:5px; flex-wrap:wrap; align-items:center;">
                ${viewButton}
                <button class="btn btn-ghost" style="font-size:.75rem;padding:4px 9px;" onclick="ignoreReport(${r.id})">Ignorar</button>
                ${r.type === 'post' ? `<button class="btn btn-danger" onclick="deleteFromReport(${r.id})">Eliminar contenido</button>` : ''}
                ${r.type === 'comment' ? `<button class="btn btn-danger" onclick="deleteCommentFromReport(${r.id})">Eliminar comentario</button>` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('') : `<div class="empty"><i class="fas fa-check-circle" style="color:var(--green);opacity:1;"></i><p>Sin reportes pendientes</p></div>`
    }
    </div>`;
}
function ignoreReport(rId){
  const r=reports.find(x=>x.id===rId);if(r)r.status='ignored';save();renderModerationPanel();toast('Reporte ignorado','info');
}
function deleteFromReport(rId){
  const r=reports.find(x=>x.id===rId);if(!r)return;
  if(r.type==='post'){posts=posts.filter(x=>x.id!==r.id);toast('Post eliminado','info');}
  r.status='resolved';save();renderModerationPanel();
}
function suspendUser(days){
  const u=users.find(x=>x.id===activeProfileId);if(!u||u.id===CU.id)return;
  u.suspendedUntil=Date.now()+(days*86400000);save();
  closeModal('profile-modal');toast(`${u.username} suspendido por ${days} día(s)`,'warning');
}
function liftSuspension(){
  const u=users.find(x=>x.id===activeProfileId);if(!u)return;
  u.suspendedUntil=null;save();toast('Suspensión levantada','info');openProfileModal(activeProfileId);
}

// Función para ver el contenido reportado (post o comentario)
function viewReportedContent(type, id, postId = null) {
  const bodyDiv = document.getElementById('report-view-body');
  if (!bodyDiv) {
    console.error('No se encontró report-view-body');
    toast('Error: modal no disponible', 'error');
    return;
  }
  
  if (type === 'post') {
    const post = posts.find(p => p.id === id);
    if (!post) {
      bodyDiv.innerHTML = `<div class="empty"><i class="fas fa-trash"></i><p>El post ya no existe</p></div>`;
      openModal('report-view-modal');
      return;
    }
    const author = users.find(u => u.id === post.userId);
    let mediaHtml = '';
    if (post.media) {
      if (post.mediaType === 'image') {
        mediaHtml = `<img src="${post.media}" style="max-width:100%; max-height:300px; border-radius:var(--r-md); margin-top:10px;">`;
      } else if (post.mediaType === 'video') {
        mediaHtml = `<video src="${post.media}" controls style="max-width:100%; max-height:300px; margin-top:10px;"></video>`;
      } else if (post.mediaType === 'audio') {
        mediaHtml = `<audio src="${post.media}" controls style="width:100%; margin-top:10px;"></audio>`;
      }
    }
    bodyDiv.innerHTML = `
      <div style="margin-bottom:8px;">
        <strong>Autor:</strong> ${esc(author?.username || 'Desconocido')} (ID: ${post.userId})<br>
        <strong>Fecha:</strong> ${new Date(post.timestamp).toLocaleString()}<br>
        <strong>Contenido textual:</strong>
        <div style="background:var(--input-bg); padding:10px; border-radius:var(--r-md); margin:6px 0;">${post.content ? esc(post.content) : '<em>Sin texto</em>'}</div>
        ${mediaHtml}
      </div>
    `;
  } 
  else if (type === 'comment' && postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) {
      bodyDiv.innerHTML = `<div class="empty"><i class="fas fa-trash"></i><p>El post ya no existe</p></div>`;
      openModal('report-view-modal');
      return;
    }
    const comment = post.comments.find(c => c.id === id);
    if (!comment) {
      bodyDiv.innerHTML = `<div class="empty"><i class="fas fa-trash"></i><p>El comentario ya no existe</p></div>`;
      openModal('report-view-modal');
      return;
    }
    const author = users.find(u => u.id === comment.userId);
    const postAuthor = users.find(u => u.id === post.userId);
    bodyDiv.innerHTML = `
      <div style="margin-bottom:8px;">
        <strong>Autor del comentario:</strong> ${esc(author?.username || 'Desconocido')} (ID: ${comment.userId})<br>
        <strong>Comentario:</strong>
        <div style="background:var(--input-bg); padding:10px; border-radius:var(--r-md); margin:6px 0;">${esc(comment.text)}</div>
        <hr class="div">
        <strong>Post original:</strong> Por ${esc(postAuthor?.username || 'Desconocido')}<br>
        <div style="background:var(--input-bg); padding:8px; border-radius:var(--r-md); margin-top:5px;">${post.content ? esc(post.content.substring(0,200)) : '<em>Sin texto</em>'}</div>
      </div>
    `;
  } else {
    bodyDiv.innerHTML = `<div class="empty"><i class="fas fa-question-circle"></i><p>Tipo de contenido no soportado</p></div>`;
  }
  openModal('report-view-modal');
}

// Función para eliminar un comentario desde el panel de reportes
function deleteCommentFromReport(reportId) {
  const report = reports.find(r => r.id === reportId);
  if (!report || report.type !== 'comment') return;
  let deleted = false;
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const commentIndex = post.comments.findIndex(c => c.id === report.id);
    if (commentIndex !== -1) {
      post.comments.splice(commentIndex, 1);
      deleted = true;
      break;
    }
  }
  if (deleted) {
    report.status = 'resolved';
    save();
    renderModerationPanel();
    toast('Comentario eliminado', 'info');
  } else {
    toast('Comentario no encontrado', 'warning');
  }
}

// ═══════════════════════════════════════════
//  PROFILE MODAL
// ═══════════════════════════════════════════
function openProfileModal(uid){
  const u=users.find(x=>x.id===uid);if(!u)return;
  activeProfileId=uid;
  document.getElementById('pm-cover').src=u.cover||defCov();
  document.getElementById('pm-av').src=u.photo||defAv();
  document.getElementById('pm-name').textContent=u.username;
  const rtag=roleTag(u.role);
  document.getElementById('pm-role').className=`tag tag-${rtag}`;
  document.getElementById('pm-role').textContent=u.role||'Miembro';
  document.getElementById('pm-badges-row').innerHTML=badgesHtml(uid);
  // Show gamification points
  const pts=getUserPoints(uid);
  const lvl=Math.min(100,Math.floor(pts/15)+1);
  const ptsEl=document.getElementById('pm-points-display');
  if(ptsEl)ptsEl.innerHTML=`⭐ Nivel ${lvl} · ${pts} pts`;
  document.getElementById('pm-bio').textContent=u.bio||'Sin biografía';
  document.getElementById('pm-posts').textContent=posts.filter(p=>p.userId===u.id).length;
  document.getElementById('pm-followers').textContent=u.followers?.length||0;
  document.getElementById('pm-following').textContent=u.following?.length||0;
  // suspension info
  const si=document.getElementById('pm-suspended-info');
  if(u.suspendedUntil&&u.suspendedUntil>Date.now()){si.style.display='block';si.textContent=`⚠️ Suspendido hasta ${new Date(u.suspendedUntil).toLocaleDateString('es-ES')}`;}
  else si.style.display='none';

  const acts=document.getElementById('pm-acts');
  const editS=document.getElementById('pm-edit');
  const adminS=document.getElementById('pm-admin');

  if(u.id===CU.id){
    acts.innerHTML=`<button class="btn btn-ghost" onclick="navigate('profile',${u.id});closeModal('profile-modal')"><i class="fas fa-user"></i> Ver perfil</button>`;
    editS.style.display='block';
    document.getElementById('pm-en').value=u.username;
    document.getElementById('pm-eb').value=u.bio||'';
    document.getElementById('pm-bday').value=u.birthday||'';
    document.getElementById('pm-bday-priv').value=u.birthdayPrivacy||'friends';
    adminS.style.display='none';
  }else{
    const isF=CU.following.includes(u.id),isB=(CU.blocked||[]).includes(u.id);
    const isMuted=(CU.mutedUsers||[]).includes(u.id);
    const isMutual=isF&&(u.followers||[]).includes(CU.id);
    acts.innerHTML=`
      <button class="btn btn-primary" id="fb-${u.id}" onclick="toggleFollow(${u.id})">${isF?'Dejar de seguir':'Seguir'}</button>
      ${isMutual?`<button class="btn btn-ghost" onclick="navigate('messages');setTimeout(()=>openChat(${u.id}),300);closeModal('profile-modal')"><i class="fas fa-comment"></i> Mensaje</button>`:''}
      <button class="btn ${isMuted?'btn-danger':'btn-ghost'}" onclick="toggleMuteUser(${u.id})" title="${isMuted?'Dessilenciar':'Silenciar'}"><i class="fas fa-volume-${isMuted?'up':'mute'}"></i></button>
      <button class="btn ${isB?'btn-danger':'btn-ghost'}" onclick="toggleBlock(${u.id})" title="${isB?'Desbloquear':'Bloquear'}"><i class="fas fa-ban"></i></button>`;
    editS.style.display='none';
    adminS.style.display=PRIVILEGED.includes(CU.role||'')?'block':'none';
    if(adminS.style.display==='block'){
      document.getElementById('pm-role-sel').value=u.role||'Miembro';
      const vchk=document.getElementById('pm-verified-chk');
      if(vchk)vchk.checked=u.verified||false;
    }
  }
  openModal('profile-modal');
}
function saveProfile(){
  const ux=users.find(u=>u.id===CU.id);if(!ux)return;
  const nn=document.getElementById('pm-en').value.trim();
  const nb=document.getElementById('pm-eb').value.trim();
  const bday=document.getElementById('pm-bday').value;
  const bdayPriv=document.getElementById('pm-bday-priv').value;
  if(nn)ux.username=CU.username=nn;
  ux.bio=CU.bio=nb;
  ux.birthday=CU.birthday=bday||null;
  ux.birthdayPrivacy=CU.birthdayPrivacy=bdayPriv;
  const pf=document.getElementById('pm-pf').files[0];
  const cf=document.getElementById('pm-cf').files[0];
  const done=()=>{save();renderSidebar();document.getElementById('h-uname').textContent=CU.username;document.getElementById('h-av').src=CU.photo||defAv();closeModal('profile-modal');toast('Perfil actualizado ✅','success');};
  const loadCov=()=>{if(cf){const r=new FileReader();r.onload=ev=>{ux.cover=CU.cover=ev.target.result;done();};r.readAsDataURL(cf);}else done();};
  if(pf){const r=new FileReader();r.onload=ev=>{ux.photo=CU.photo=ev.target.result;loadCov();};r.readAsDataURL(pf);}else loadCov();
}
function assignRole(){
  if(!PRIVILEGED.includes(CU.role||''))return;
  const u=users.find(x=>x.id===activeProfileId);if(!u)return;
  u.role=document.getElementById('pm-role-sel').value;
  u.isAdmin=['Admin','Fundador'].includes(u.role);
  const vchk=document.getElementById('pm-verified-chk');
  if(vchk)u.verified=vchk.checked;
  save();closeModal('profile-modal');toast(`Rol asignado: ${u.role}`,'info');
}
function toggleFollow(uid){
  const u=users.find(x=>x.id===uid);if(!u)return;
  const ux=users.find(x=>x.id===CU.id);
  if(CU.following.includes(uid)){
    CU.following=CU.following.filter(id=>id!==uid);if(ux)ux.following=CU.following;
    u.followers=(u.followers||[]).filter(id=>id!==CU.id);
    toast(`Dejaste de seguir a ${u.username}`,'info');
    logActivity('unfollow',u.username);
  }else{
    CU.following.push(uid);if(ux)ux.following=CU.following;
    u.followers=u.followers||[];u.followers.push(CU.id);
    addNotif(uid,'follow',CU.id,{});
    toast(`Sigues a ${u.username} 🎉`,'success');
    logActivity('follow',u.username);
    checkBadges(uid);
  }
  save();
  // Only re-open modal if we're currently viewing a profile
  const pm=document.getElementById('profile-modal');
  if(pm&&pm.classList.contains('open'))openProfileModal(uid);
  renderSidebar();
}
function toggleBlock(uid){
  const u=users.find(x=>x.id===uid);if(!u)return;
  const ux=users.find(x=>x.id===CU.id);
  if((CU.blocked||[]).includes(uid)){
    CU.blocked=CU.blocked.filter(id=>id!==uid);if(ux)ux.blocked=CU.blocked;toast(`${u.username} desbloqueado`,'info');
  }else{
    CU.blocked=CU.blocked||[];CU.blocked.push(uid);if(ux)ux.blocked=CU.blocked;
    CU.following=CU.following.filter(id=>id!==uid);if(ux)ux.following=CU.following;
    u.followers=(u.followers||[]).filter(id=>id!==CU.id);
    toast(`${u.username} bloqueado`,'warning');
  }
  save();closeModal('profile-modal');renderSidebar();
}

// ═══════════════════════════════════════════
//  PROFILE PAGE
// ═══════════════════════════════════════════
function renderProfilePage(uid){
  const u=users.find(x=>x.id===uid);if(!u){document.getElementById('content').innerHTML=empty('fas fa-user','Usuario no encontrado');return;}
  const mc=document.getElementById('content');
  const myP=posts.filter(p=>p.userId===u.id).sort((a,b)=>b.timestamp-a.timestamp);
  const isF=CU.following.includes(u.id),isB=(CU.blocked||[]).includes(u.id);
  mc.innerHTML=`
    <div class="card" style="margin-bottom:14px;">
      <div style="position:relative;">
        <img src="${u.cover||defCov()}" class="pp-cover" alt="" loading="lazy">
        <img src="${u.photo||defAv()}" class="pp-av" onclick="openProfileModal(${u.id})" alt="" loading="lazy">
        <div style="position:absolute;bottom:10px;right:14px;display:flex;gap:7px;">
          ${u.id!==CU.id?`<button class="btn btn-primary" onclick="toggleFollow(${u.id})">${isF?'Dejar de seguir':'Seguir'}</button><button class="btn btn-ghost" onclick="openChat(${u.id})"><i class="fas fa-comment"></i></button>`:`<button class="btn btn-ghost" onclick="openProfileModal(${u.id})"><i class="fas fa-edit"></i> Editar</button>`}
        </div>
      </div>
      <div style="padding:46px 18px 18px;">
        <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;">
          <h2 style="font-family:var(--font-head);font-weight:800;">${esc(u.username)}</h2>
          ${badgesHtml(uid)?`<span>${badgesHtml(uid)}</span>`:''}
          <span class="tag tag-${roleTag(u.role)}">${esc(u.role||'Miembro')}</span>
        </div>
        <div style="display:flex;gap:13px;align-items:center;margin-top:5px;flex-wrap:wrap;">
          ${(()=>{const p=getUserPoints(u.id);const lv=Math.min(100,Math.floor(p/15)+1);const nxt=lv*15;const pct=Math.min(100,Math.round((p%(lv*15)||p)/(15)*100));return `<div style="flex:1;min-width:140px;"><div style="font-size:.78rem;font-weight:700;color:var(--green);margin-bottom:3px;">⭐ Nivel ${lv} · ${p} pts</div><div style="height:6px;background:var(--border);border-radius:6px;overflow:hidden;"><div style="height:100%;width:${pct}%;background:var(--green);border-radius:6px;transition:width .4s;"></div></div></div>`;})()}
          ${u.id!==CU.id?`<button class="btn btn-ghost" style="font-size:.78rem;padding:5px 11px;" onclick="toggleMuteUser(${u.id})">${(CU.mutedUsers||[]).includes(u.id)?'<i class="fas fa-volume-up"></i> Activar':'<i class="fas fa-volume-mute"></i> Silenciar'}</button>`:''}
        </div>
        <p style="color:var(--text2);margin-top:7px;font-size:.85rem;">${esc(u.bio||'Sin biografía')}</p>
        ${(()=>{const sl=u.socialLinks||{};const links=[];if(sl.instagram)links.push(`<a href="https://instagram.com/${sl.instagram}" target="_blank" class="social-link"><i class="fab fa-instagram"></i>${esc(sl.instagram)}</a>`);if(sl.discord)links.push(`<a href="#" class="social-link" onclick="event.preventDefault();navigator.clipboard.writeText('${esc(sl.discord)}');toast('Discord copiado','success')"><i class="fab fa-discord"></i>${esc(sl.discord)}</a>`);if(sl.twitter)links.push(`<a href="https://twitter.com/${sl.twitter}" target="_blank" class="social-link"><i class="fab fa-twitter"></i>${esc(sl.twitter)}</a>`);if(sl.youtube)links.push(`<a href="https://youtube.com/@${sl.youtube}" target="_blank" class="social-link"><i class="fab fa-youtube"></i>${esc(sl.youtube)}</a>`);return links.length?`<div class="social-links">${links.join('')}${u.id===CU.id?`<button class="social-link" onclick="openSocialLinksModal()" style="cursor:pointer;border:none;"><i class="fas fa-edit"></i> Editar</button>`:''}</div>`:u.id===CU.id?`<div class="social-links"><button class="social-link" onclick="openSocialLinksModal()" style="cursor:pointer;border:none;"><i class="fas fa-plus"></i> Añadir redes sociales</button></div>`:''})()}
        <div style="display:flex;gap:18px;margin-top:10px;flex-wrap:wrap;">
          <span style="font-size:.83rem;"><strong>${u.followers?.length||0}</strong> <span style="color:var(--text2);">seguidores</span></span>
          <span style="font-size:.83rem;"><strong>${u.following?.length||0}</strong> <span style="color:var(--text2);">siguiendo</span></span>
          <span style="font-size:.83rem;"><strong>${myP.length}</strong> <span style="color:var(--text2);">publicaciones</span></span>
        </div>
      </div>
    </div>
    <div style="display:flex;gap:7px;margin-bottom:13px;flex-wrap:wrap;">
      <button class="tab-pill active" id="pt-posts" onclick="switchPTab('posts',${u.id})">Publicaciones</button>
      <button class="tab-pill" id="pt-photos" onclick="switchPTab('photos',${u.id})">Fotos</button>
      <button class="tab-pill" id="pt-groups" onclick="switchPTab('groups',${u.id})">Grupos</button>
      ${u.id!==CU.id?`<button class="tab-pill" id="pt-mutual" onclick="switchPTab('mutual',${u.id})">Amigos en común</button>`:''}
      ${u.id===CU.id?`<button class="tab-pill" id="pt-activity" onclick="switchPTab('activity',${u.id})">Actividad</button>`:''}
    </div>
    <div id="ptab-content">
      ${isB?`<div class="card"><div class="empty"><i class="fas fa-ban" style="color:var(--danger);opacity:1;"></i><p>Has bloqueado a este usuario.</p><button class="btn btn-ghost" onclick="toggleBlock(${u.id})">Desbloquear</button></div></div>`:myP.map(postCard).join('')||empty('fas fa-pen-to-square','Sin publicaciones aún.')}
    </div>`;
}
function switchPTab(tab,uid){
  document.querySelectorAll('.tab-pill').forEach(t=>t.classList.remove('active'));
  const el=document.getElementById(`pt-${tab}`);if(el)el.classList.add('active');
  const u=users.find(x=>x.id===uid);if(!u)return;
  const c=document.getElementById('ptab-content');
  const myP=posts.filter(p=>p.userId===u.id).sort((a,b)=>b.timestamp-a.timestamp);
  if(tab==='posts')c.innerHTML=myP.map(postCard).join('')||empty('fas fa-pen-to-square','Sin publicaciones.');
  else if(tab==='photos'){
    const photos=myP.filter(p=>p.mediaType==='image'&&p.media);
    c.innerHTML=`<div class="card" style="padding:13px;"><div class="photo-grid">${photos.map(p=>`<img src="${p.media}" alt="" onclick="openLB(this.src)" loading="lazy">`).join('')}</div>${!photos.length?empty('fas fa-images','Sin fotos.'):''}`;
  }else if(tab==='groups'){
    const gp=groups.filter(g=>g.members.includes(u.id));
    c.innerHTML=`<div class="card" style="padding:13px;">${gp.map(g=>`<div class="gchip" onclick="navigate('groups',${g.id})"><span class="gicon"><i class="fas fa-users"></i></span>${esc(g.name)}</div>`).join('')||empty('fas fa-users','Sin grupos.')}</div>`;
  }else if(tab==='mutual'){
    const mutual=CU.following.filter(id=>(u.following||[]).includes(id));
    const mus=mutual.map(id=>users.find(u=>u.id===id)).filter(Boolean);
    c.innerHTML=`<div class="card" style="padding:13px;">${mus.map(mu=>`<div class="list-row" onclick="openProfileModal(${mu.id})"><img src="${mu.photo||defAv()}" class="lav" alt="" loading="lazy"><div><div class="lname">${esc(mu.username)}</div></div></div>`).join('')||empty('fas fa-user-friends','Sin amigos en común.')}</div>`;
  }else if(tab==='activity'){renderActivityTab(uid,c);}
}

function renderActivityTab(uid,c){
  const myLog=activityLog.filter(a=>a.userId===uid).slice(0,20);
  const types=['post','comment','reaction','follow','unfollow','repost'];
  const typeLabel={post:'Publicación',comment:'Comentario',reaction:'Reacción',follow:'Seguir',unfollow:'Dejar de seguir',repost:'Repost'};
  const typeIco={post:'fas fa-pen-to-square',comment:'fas fa-comment',reaction:'fas fa-heart',follow:'fas fa-user-plus',unfollow:'fas fa-user-minus',repost:'fas fa-retweet'};
  let html=`<div class="card" style="padding:15px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:13px;">
      <h4 style="font-family:var(--font-head);font-weight:700;">Historial de actividad</h4>
      <button class="btn btn-danger" onclick="clearActivityLog(${uid})">Limpiar</button>
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:13px;">
      <button class="tab-pill active" onclick="filterActivity('all',this,${uid})">Todos</button>
      ${types.map(t=>`<button class="tab-pill" onclick="filterActivity('${t}',this,${uid})">${typeLabel[t]}</button>`).join('')}
    </div>
    <div id="activity-list">
      ${myLog.length?myLog.map(a=>`<div class="list-row" data-type="${a.type}" style="border-radius:var(--r-md);border:1px solid var(--border);margin-bottom:5px;">
        <span class="nicon"><i class="${typeIco[a.type]||'fas fa-star'}"></i></span>
        <div style="flex:1;"><div style="font-size:.84rem;font-weight:600;">${typeLabel[a.type]||a.type}</div><div style="font-size:.75rem;color:var(--text2);">${esc(a.detail)} · ${timeAgo(a.timestamp)}</div></div>
      </div>`).join(''):empty('fas fa-history','Sin actividad registrada.')}
    </div>
  </div>`;
  c.innerHTML=html;
}
function filterActivity(type,btn,uid){
  const list=document.getElementById('activity-list');if(!list)return;
  btn.closest('.card').querySelectorAll('.tab-pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const myLog=activityLog.filter(a=>a.userId===uid&&(type==='all'||a.type===type)).slice(0,20);
  const typeLabel={post:'Publicación',comment:'Comentario',reaction:'Reacción',follow:'Seguir',unfollow:'Dejar de seguir',repost:'Repost'};
  const typeIco={post:'fas fa-pen-to-square',comment:'fas fa-comment',reaction:'fas fa-heart',follow:'fas fa-user-plus',unfollow:'fas fa-user-minus',repost:'fas fa-retweet'};
  list.innerHTML=myLog.length?myLog.map(a=>`<div class="list-row" style="border-radius:var(--r-md);border:1px solid var(--border);margin-bottom:5px;">
    <span class="nicon"><i class="${typeIco[a.type]||'fas fa-star'}"></i></span>
    <div style="flex:1;"><div style="font-size:.84rem;font-weight:600;">${typeLabel[a.type]||a.type}</div><div style="font-size:.75rem;color:var(--text2);">${esc(a.detail)} · ${timeAgo(a.timestamp)}</div></div>
  </div>`).join(''):empty('fas fa-history','Sin actividad de este tipo.');
}
function clearActivityLog(uid){
  if(!confirm('¿Limpiar historial?'))return;
  activityLog=activityLog.filter(a=>a.userId!==uid);save();
  renderProfilePage(uid);toast('Historial limpiado','info');
}

// ═══════════════════════════════════════════
//  STORIES
// ═══════════════════════════════════════════
let curStoryTab='image';
function storyTab(t){
  curStoryTab=t;
  ['image','video','text'].forEach(x=>{
    const btn=document.getElementById(`st-${x.substring(0,3)}`);if(btn)btn.classList.toggle('active',x===t);
    const panel=document.getElementById(`sp-${x}`);if(panel)panel.style.display=x===t?'block':'none';
  });
}
const _siFile=document.getElementById('si-file');
if(_siFile)_siFile.addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();r.onload=ev=>{document.getElementById('si-el').src=ev.target.result;document.getElementById('si-prev').style.display='block';};r.readAsDataURL(f);
});
const _svFile=document.getElementById('sv-file');
if(_svFile)_svFile.addEventListener('change',e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();r.onload=ev=>{document.getElementById('sv-el').src=ev.target.result;document.getElementById('sv-prev').style.display='block';};r.readAsDataURL(f);
});
function publishStory(){
  let d={id:ids.ns++,userId:CU.id,timestamp:Date.now(),expiresAt:Date.now()+86400000,seenBy:[],type:curStoryTab};
  if(curStoryTab==='image'){
    const f=document.getElementById('si-file').files[0];if(!f){toast('Selecciona una imagen','warning');return;}
    const r=new FileReader();r.onload=ev=>{d.media=ev.target.result;_saveStory(d);};r.readAsDataURL(f);return;
  }else if(curStoryTab==='video'){
    const f=document.getElementById('sv-file').files[0];if(!f){toast('Selecciona un vídeo','warning');return;}
    const r=new FileReader();r.onload=ev=>{d.media=ev.target.result;_saveStory(d);};r.readAsDataURL(f);return;
  }else{
    const txt=val('st-text').trim(),bg=val('st-bg');
    if(!txt){toast('Escribe algo','warning');return;}
    d.text=txt;d.bg=bg;_saveStory(d);
  }
}
function _saveStory(d){
  stories.push(d);save();closeModal('story-create-modal');
  document.getElementById('si-file').value='';
  document.getElementById('si-el').src='';
  document.getElementById('si-prev').style.display='none';
  const svFile = document.getElementById('sv-file'); if(svFile) svFile.value='';
  const svEl = document.getElementById('sv-el'); if(svEl) svEl.src='';
  const svPrev = document.getElementById('sv-prev'); if(svPrev) svPrev.style.display='none';
  const stText = document.getElementById('st-text'); if(stText) stText.value='';
  toast('Historia publicada ⏰ (24h)','success');if(cView==='public')renderFeed();else if(cView==='stories')renderStoriesPage();
}
function renderStoriesPage(){
  const mc=document.getElementById('content');
  const now=Date.now(),bl=CU.blocked||[];
  const uwS=users.filter(u=>!u.deactivated&&!bl.includes(u.id)&&stories.some(s=>s.userId===u.id&&s.expiresAt>now));
  mc.innerHTML=`<div class="card" style="margin-bottom:14px;padding:15px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <h3 style="font-family:var(--font-head);font-weight:800;"><i class="fas fa-circle-play" style="color:var(--green);margin-right:7px;"></i>Historias</h3>
      <button class="btn btn-primary" onclick="openModal('story-create-modal')"><i class="fas fa-plus"></i> Crear</button>
    </div>
    <div style="display:flex;gap:13px;flex-wrap:wrap;">
      ${uwS.map(u=>{
        const us=stories.filter(s=>s.userId===u.id&&s.expiresAt>now);
        const seen=us.every(s=>s.seenBy.includes(CU.id));
        return `<div style="text-align:center;cursor:pointer;width:74px;" onclick="openSV(${u.id})">
          <div style="width:68px;height:68px;border-radius:50%;padding:2.5px;background:${seen?'var(--border)':'conic-gradient(var(--green),#40916c,#1b4332)'};display:inline-flex;align-items:center;justify-content:center;">
            <img src="${u.photo||defAv()}" style="width:60px;height:60px;border-radius:50%;border:2.5px solid var(--card);object-fit:cover;" alt="" loading="lazy">
          </div>
          <p style="font-size:.72rem;margin-top:4px;font-weight:600;">${esc(u.username)}</p>
          <p style="font-size:.68rem;color:var(--text2);">${us.length} hist.</p>
        </div>`;
      }).join('')||empty('fas fa-circle-play','Nadie ha publicado historias aún.')}
    </div>
  </div>`;
}

// Story Viewer
function openSV(uid){
  const now=Date.now();
  const uStories=stories.filter(s=>s.userId===uid&&s.expiresAt>now);
  if(!uStories.length)return;
  uStories.forEach(s=>{if(!s.seenBy.includes(CU.id))s.seenBy.push(CU.id);});save();
  const bl=CU.blocked||[];
  svQueue=users.filter(u=>stories.some(s=>s.userId===u.id&&s.expiresAt>now)&&!bl.includes(u.id));
  svQIdx=svQueue.findIndex(u=>u.id===uid);if(svQIdx<0)svQIdx=0;
  svIdx=0;renderSV();openModal('story-viewer-modal');
}
function renderSV(){
  if(svQIdx<0||svQIdx>=svQueue.length){closeModal('story-viewer-modal');return;}
  const now=Date.now(),u=svQueue[svQIdx];
  const uS=stories.filter(s=>s.userId===u.id&&s.expiresAt>now);
  if(!uS.length){svNav(1);return;}
  if(svIdx>=uS.length)svIdx=uS.length-1;
  const s=uS[svIdx];
  document.getElementById('sv-bars').innerHTML=uS.map((x,i)=>`<div class="sv-bar"><div class="fill" id="svb-${i}" style="width:${i<svIdx?100:0}%;"></div></div>`).join('');
  const ca=document.getElementById('sv-content');
  
  clearTimeout(svTimer);
  let duration = 5;
  
  if(s.type==='image'&&s.media) {
    ca.innerHTML=`<img src="${s.media}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="" loading="lazy">`;
    startStoryTimer(duration);
  } else if(s.type==='video'&&s.media) {
    ca.innerHTML=`<video id="sv-video-player" src="${s.media}" style="max-width:100%;max-height:100%;object-fit:contain;" autoplay playsinline></video>`;
    const vid = document.getElementById('sv-video-player');
    if (vid) {
      vid.muted = false;
      vid.volume = 1.0;
      vid.play().catch(err => {
        console.log("Autoplay with sound blocked, trying muted fallback", err);
        vid.muted = true;
        vid.play();
      });
      vid.onloadedmetadata = () => {
        duration = vid.duration || 5;
        startStoryTimer(duration);
      };
      vid.onerror = () => {
        startStoryTimer(5);
      };
      // Fallback if metadata takes too long
      const fallbackTimer = setTimeout(() => {
        if (!vid.duration) {
          startStoryTimer(5);
        }
      }, 1500);
      vid.onended = () => {
        clearTimeout(svTimer);
        svNav(1);
      };
    } else {
      startStoryTimer(5);
    }
  } else {
    ca.innerHTML=`<div class="sv-text-bg" style="background:${s.bg||'#2d6a4f'};"><p style="color:#fff;font-size:1.35rem;font-weight:700;text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.4);">${esc(s.text||'')}</p></div>`;
    startStoryTimer(duration);
  }
  
  const exp=Math.max(0,Math.floor((s.expiresAt-now)/3600000));
  document.getElementById('sv-user').innerHTML=`<img src="${u.photo||defAv()}" alt="" loading="lazy"><div><div class="sv-uname">${esc(u.username)}</div><div class="sv-time">${exp}h restantes</div></div>`;
  document.getElementById('sv-views').textContent=s.seenBy.length;
  document.getElementById('sv-prev').style.display=svQIdx===0&&svIdx===0?'none':'flex';
  document.getElementById('sv-next').style.display=svQIdx>=svQueue.length-1&&svIdx>=uS.length-1?'none':'flex';
}

function startStoryTimer(durationSec) {
  clearTimeout(svTimer);
  const fill=document.getElementById(`svb-${svIdx}`);
  if(fill){
    fill.style.transition = 'none';
    fill.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.transition = `width ${durationSec}s linear`;
        fill.style.width = '100%';
      });
    });
  }
  svTimer=setTimeout(()=>svNav(1), durationSec * 1000);
}
function svNav(dir){
  clearTimeout(svTimer);
  const now=Date.now(),u=svQueue[svQIdx];
  const uS=stories.filter(s=>s.userId===u.id&&s.expiresAt>now);
  if(dir>0){if(svIdx<uS.length-1)svIdx++;else if(svQIdx<svQueue.length-1){svQIdx++;svIdx=0;}else{closeModal('story-viewer-modal');return;}}
  else{if(svIdx>0)svIdx--;else if(svQIdx>0){svQIdx--;const nu=svQueue[svQIdx];const nuS=stories.filter(s=>s.userId===nu.id&&s.expiresAt>now);svIdx=nuS.length-1;}}
  renderSV();
}

// ═══════════════════════════════════════════
//  REELS
// ═══════════════════════════════════════════
function renderReelsPage(){
  const mc=document.getElementById('content');
  const bl=CU.blocked||[];
  const feed=reels.filter(r=>!bl.includes(r.userId)).sort((a,b)=>b.timestamp-a.timestamp);
  mc.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:13px;">
    <h3 style="font-family:var(--font-head);font-weight:800;"><i class="fas fa-film" style="color:var(--purple);margin-right:7px;"></i>Reels</h3>
    <button class="btn btn-primary" onclick="openModal('reel-create-modal')"><i class="fas fa-plus"></i> Subir Reel</button>
  </div>
  <div class="reels-feed">${feed.map(reelCard).join('')||`<div class="card">${empty('fas fa-film','¡Sube el primer reel!')}</div>`}</div>`;
}
function reelCard(r){
  const u=users.find(x=>x.id===r.userId);if(!u)return'';
  const liked=(r.likes||[]).includes(CU.id);
  return `<div class="reel" id="reel-${r.id}" onclick="openReelViewer(${r.id})" style="cursor:pointer;">
    ${r.media?`<video src="${r.media}" style="width:100%;height:100%;object-fit:cover;" autoplay muted loop playsinline></video>`:`<div class="reel-ph"><i class="fas fa-film" style="font-size:2.5rem;opacity:.35;"></i><p style="opacity:.6;font-size:.82rem;">${esc(r.description||'Sin descripción')}</p></div>`}
    <div class="reel-overlay" onclick="event.stopPropagation()">
      <div class="r-author-row"><img src="${u.photo||defAv()}" alt="" loading="lazy"><span class="r-uname">${esc(u.username)}</span>
        <button class="btn btn-primary" style="padding:4px 11px;font-size:.72rem;margin-left:auto;" onclick="event.stopPropagation();toggleFollow(${u.id})">${CU.following.includes(u.id)?'Siguiendo':'Seguir'}</button>
      </div>
      ${r.description?`<p class="r-desc">${esc(r.description)}</p>`:''}
      ${r.music?`<p class="r-music"><i class="fas fa-music"></i> ${esc(r.music)}</p>`:''}
    </div>
    <div class="r-side" onclick="event.stopPropagation()">
      <button class="r-btn" onclick="likeReel(${r.id})" style="${liked?'color:#ef4444;':''}"><i class="fas fa-heart"></i><span>${r.likes?.length||0}</span></button>
      <button class="r-btn" onclick="openReelComments(${r.id})"><i class="fas fa-comment"></i><span>${r.comments?.length||0}</span></button>
      <button class="r-btn" onclick="shareReel(${r.id})"><i class="fas fa-share"></i></button>
      ${r.userId===CU.id?`<button class="r-btn" onclick="deleteReel(${r.id})"><i class="fas fa-trash" style="color:var(--danger);"></i></button>`:''}
    </div>
    <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;opacity:0;transition:.25s;" class="reel-play-hint">
      <div style="background:rgba(0,0,0,.55);border-radius:50%;width:64px;height:64px;display:flex;align-items:center;justify-content:center;"><i class="fas fa-play" style="color:#fff;font-size:1.6rem;margin-left:4px;"></i></div>
    </div>
  </div>`;
}

// ─── TIKTOK-STYLE REEL VIEWER ───
let reelViewerFeed=[];
let reelViewerIdx=0;

function openReelViewer(reelId){
  const bl=CU.blocked||[];
  reelViewerFeed=reels.filter(r=>!bl.includes(r.userId)&&r.media).sort((a,b)=>b.timestamp-a.timestamp);
  reelViewerIdx=reelViewerFeed.findIndex(r=>r.id===reelId);
  if(reelViewerIdx<0)reelViewerIdx=0;
  renderReelViewer();
  const ov=document.getElementById('reel-viewer-overlay');
  if(ov){ov.style.display='flex';setTimeout(()=>ov.classList.add('open'),10);}
}

function closeReelViewer(){
  const ov=document.getElementById('reel-viewer-overlay');
  if(!ov)return;
  ov.classList.remove('open');
  setTimeout(()=>{ov.style.display='none';const v=ov.querySelector('video');if(v){v.pause();v.src='';}},320);
}

function renderReelViewer(){
  const r=reelViewerFeed[reelViewerIdx];
  if(!r)return;
  const u=users.find(x=>x.id===r.userId);
  const liked=(r.likes||[]).includes(CU.id);
  const prev=reelViewerIdx>0;
  const next=reelViewerIdx<reelViewerFeed.length-1;

  const ov=document.getElementById('reel-viewer-overlay');
  if(!ov)return;
  // Build progress dots
  const dotOffset=Math.max(0,reelViewerIdx-2);
  const dotsHtml=reelViewerFeed.slice(dotOffset,reelViewerIdx+3).map((_,i)=>{
    const absIdx=dotOffset+i;
    return `<div class="rv-dot ${absIdx===reelViewerIdx?'active':''}"></div>`;
  }).join('');

  ov.innerHTML=`
    <div class="rv-container" id="rv-container">
      <video id="rv-video" src="${r.media}" autoplay loop playsinline></video>
      <div class="rv-gradient-top"></div>
      <div class="rv-gradient-bot"></div>

      <!-- Top bar: back + title + mute -->
      <div class="rv-topbar">
        <button class="rv-close-btn" onclick="closeReelViewer()"><i class="fas fa-arrow-left"></i></button>
        <span style="font-family:var(--font-head);font-weight:800;font-size:1rem;color:#fff;letter-spacing:.04em;">Reels</span>
        <button class="rv-mute-btn" id="rv-mute-btn" onclick="toggleReelMute()"><i class="fas fa-volume-xmark" id="rv-mute-icon"></i></button>
      </div>

      <!-- Columna izquierda: Ant.(arriba) → dots → Sig.(abajo) -->
      <!-- Columna derecha: nav (ant/dots/sig) ENCIMA del me gusta -->
      <div class="rv-actions">
        ${prev?`<button class="rv-nav-btn" onclick="rvNavigate(-1)" title="Reel anterior"><i class="fas fa-chevron-up"></i></button>
        <span class="rv-nav-label">Ant.</span>`:''}
        <div class="rv-dots">${dotsHtml}</div>
        ${next?`<span class="rv-nav-label">Sig.</span>
        <button class="rv-nav-btn" onclick="rvNavigate(1)" title="Siguiente reel"><i class="fas fa-chevron-down"></i></button>`:''}
        <div class="rv-actions-sep"></div>
        <button class="rv-action-btn ${liked?'rv-liked':''}" onclick="rvLike(${r.id})">
          <i class="fas fa-heart"></i>
          <span>${r.likes?.length||0}</span>
        </button>
        <button class="rv-action-btn" onclick="openReelComments(${r.id})">
          <i class="fas fa-comment"></i>
          <span>${r.comments?.length||0}</span>
        </button>
        <button class="rv-action-btn" onclick="shareReel(${r.id})">
          <i class="fas fa-share-nodes"></i>
          <span>Compartir</span>
        </button>
        ${r.userId===CU.id?`<button class="rv-action-btn" onclick="if(confirm('¿Eliminar reel?')){deleteReel(${r.id});closeReelViewer();}"><i class="fas fa-trash" style="color:#ff6b6b;"></i><span>Eliminar</span></button>`:''}
      </div>

      <!-- Bottom info: avatar + name + follow + description + music -->
      <div class="rv-info">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <img src="${u?.photo||defAv()}" style="width:42px;height:42px;border-radius:50%;border:2.5px solid #fff;object-fit:cover;cursor:pointer;flex-shrink:0;" onclick="openProfileModal(${u?.id});closeReelViewer();" alt="">
          <div style="min-width:0;">
            <div style="color:#fff;font-weight:800;font-size:.95rem;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" onclick="openProfileModal(${u?.id});closeReelViewer();">${esc(u?.username||'?')}</div>
            <div style="color:rgba(255,255,255,.55);font-size:.7rem;">${timeAgo(r.timestamp)}</div>
          </div>
          <button class="btn btn-primary" style="margin-left:8px;padding:5px 13px;font-size:.74rem;flex-shrink:0;" onclick="event.stopPropagation();toggleFollow(${u?.id})">${CU.following.includes(u?.id||0)?'Siguiendo':'+ Seguir'}</button>
        </div>
        ${r.description?`<p style="color:rgba(255,255,255,.9);font-size:.84rem;margin-bottom:5px;line-height:1.4;">${esc(r.description)}</p>`:''}
        ${r.music?`<p style="color:rgba(255,255,255,.6);font-size:.75rem;display:flex;align-items:center;gap:5px;"><i class="fas fa-music"></i>${esc(r.music)}</p>`:''}
      </div>
    </div>`;

  // Setup touch swipe
  setupReelSwipe();

  // Auto-unmute check
  const vid=document.getElementById('rv-video');
  if(vid){
    vid.muted=window._reelMuted!==false;
    updateMuteIcon();
    vid.play().catch(()=>{});
    // Detectar video horizontal y aplicar object-fit:contain
    vid.addEventListener('loadedmetadata',()=>{
      if(vid.videoWidth && vid.videoHeight && vid.videoWidth > vid.videoHeight){
        vid.classList.add('rv-landscape');
      } else {
        vid.classList.remove('rv-landscape');
      }
    });
  }
}

function toggleReelMute(){
  const vid=document.getElementById('rv-video');
  if(!vid)return;
  vid.muted=!vid.muted;
  window._reelMuted=vid.muted;
  updateMuteIcon();
}
function updateMuteIcon(){
  const vid=document.getElementById('rv-video');
  const icon=document.getElementById('rv-mute-icon');
  if(!icon||!vid)return;
  icon.className=vid.muted?'fas fa-volume-xmark':'fas fa-volume-high';
}

function rvLike(id){
  const r=reels.find(x=>x.id===id);if(!r)return;
  r.likes=r.likes||[];
  if(r.likes.includes(CU.id))r.likes=r.likes.filter(x=>x!==CU.id);
  else r.likes.push(CU.id);
  save();
  renderReelViewer();
  // also update card in background
  const el=document.getElementById(`reel-${id}`);
  if(el){const d=document.createElement('div');d.innerHTML=reelCard(r);el.replaceWith(d.firstChild);}
}

function rvNavigate(dir){
  const newIdx=reelViewerIdx+dir;
  if(newIdx<0||newIdx>=reelViewerFeed.length)return;
  const vid=document.getElementById('rv-video');
  if(vid){vid.pause();}
  reelViewerIdx=newIdx;
  const cont=document.getElementById('rv-container');
  if(cont){
    cont.style.transform=dir>0?'translateY(-30px)':'translateY(30px)';
    cont.style.opacity='0';
    setTimeout(()=>{
      renderReelViewer();
      const c2=document.getElementById('rv-container');
      if(c2){c2.style.transition='none';c2.style.transform=dir>0?'translateY(30px)':'translateY(-30px)';c2.style.opacity='0';
        requestAnimationFrame(()=>{c2.style.transition='transform .28s ease, opacity .28s ease';c2.style.transform='';c2.style.opacity='1';});
      }
    },180);
  }
}

function setupReelSwipe(){
  const cont=document.getElementById('rv-container');
  if(!cont)return;
  let startY=0,startX=0;
  cont.addEventListener('touchstart',e=>{startY=e.touches[0].clientY;startX=e.touches[0].clientX;},{passive:true});
  cont.addEventListener('touchend',e=>{
    const dy=startY-e.changedTouches[0].clientY;
    const dx=Math.abs(startX-e.changedTouches[0].clientX);
    if(Math.abs(dy)>50&&dx<60){rvNavigate(dy>0?1:-1);}
  },{passive:true});
}
function publishReel(){
  const desc=val('rv-desc').trim(),music=val('rv-music').trim();
  const file=document.getElementById('rv-file').files[0];
  const MAX_REEL_DURATION=180; // 3 minutos máximo
  const r={id:ids.nr++,userId:CU.id,description:desc,music,timestamp:Date.now(),likes:[],comments:[],media:null};
  const finish=()=>{reels.unshift(r);save();closeModal('reel-create-modal');renderReelsPage();toast('Reel publicado 🎬','success');};
  if(file){
    if(file.type.startsWith('video/')){
      const tmpUrl=URL.createObjectURL(file);
      const tmpVid=document.createElement('video');
      tmpVid.preload='metadata';
      tmpVid.src=tmpUrl;
      tmpVid.onloadedmetadata=()=>{
        URL.revokeObjectURL(tmpUrl);
        if(tmpVid.duration>MAX_REEL_DURATION){
          toast(`⚠️ El video supera ${MAX_REEL_DURATION}s (${Math.round(tmpVid.duration)}s). Máximo permitido: ${MAX_REEL_DURATION} segundos.`,'error');
          document.getElementById('rv-file').value='';
          return;
        }
        const rd=new FileReader();rd.onload=ev=>{r.media=ev.target.result;finish();};rd.readAsDataURL(file);
      };
      tmpVid.onerror=()=>{URL.revokeObjectURL(tmpUrl);const rd=new FileReader();rd.onload=ev=>{r.media=ev.target.result;finish();};rd.readAsDataURL(file);};
    } else {
      const rd=new FileReader();rd.onload=ev=>{r.media=ev.target.result;finish();};rd.readAsDataURL(file);
    }
  } else finish();
}
function likeReel(id){const r=reels.find(x=>x.id===id);if(!r)return;r.likes=r.likes||[];if(r.likes.includes(CU.id))r.likes=r.likes.filter(x=>x!==CU.id);else r.likes.push(CU.id);save();const el=document.getElementById(`reel-${id}`);if(el){const d=document.createElement('div');d.innerHTML=reelCard(r);el.replaceWith(d.firstChild);}}
function deleteReel(id){if(!confirm('¿Eliminar reel?'))return;reels=reels.filter(r=>r.id!==id);save();renderReelsPage();}

function openReelComments(reelId){
  const r=reels.find(x=>x.id===reelId);if(!r)return;
  r.comments=r.comments||[];
  const mb=document.getElementById('thread-modal-body');if(!mb)return;
  const u=users.find(x=>x.id===r.userId);
  mb.innerHTML=`
    <div style="font-weight:700;margin-bottom:9px;font-family:var(--font-head);">💬 Comentarios del reel de ${esc(u?.username||'?')}</div>
    <div id="reel-cmts-${reelId}">
      ${r.comments.length?r.comments.map(c=>{
        const cu=users.find(x=>x.id===c.userId);
        const canAct=CU.id===c.userId||CU.isAdmin;
        return `<div class="cm-item">
          <div class="cm-main-row">
            <img src="${cu?.photo||defAv()}" class="cm-av" alt="" loading="lazy">
            <div class="cm-bubble">
              <div class="cm-author" onclick="openProfileModal(${cu?.id})">${esc(cu?.username||'?')}</div>
              <div class="cm-text">${esc(c.text)}</div>
              <div class="cm-acts">
                <span class="cm-act" style="cursor:default;">${timeAgo(c.timestamp)}</span>
                ${canAct?`<button class="cm-act" style="color:var(--danger);" onclick="deleteReelCmt(${reelId},${c.id})">Eliminar</button>`:''}
              </div>
            </div>
          </div>
        </div>`;
      }).join(''):`<div class="empty"><i class="fas fa-comment-slash"></i><p>Sin comentarios. ¡Sé el primero!</p></div>`}
    </div>
    <div class="cm-input-row" style="margin-top:10px;">
      <img src="${CU.photo||defAv()}" alt="" loading="lazy">
      <input type="text" id="reel-cmt-inp-${reelId}" placeholder="Comentar..." onkeypress="if(event.key==='Enter')addReelCmt(${reelId})">
      <button class="cm-send" onclick="addReelCmt(${reelId})"><i class="fas fa-paper-plane"></i></button>
    </div>`;
  openModal('thread-modal');
}
function addReelCmt(reelId){
  const r=reels.find(x=>x.id===reelId);if(!r)return;
  const inp=document.getElementById(`reel-cmt-inp-${reelId}`);if(!inp||!inp.value.trim())return;
  r.comments=r.comments||[];
  r.comments.push({id:Date.now(),userId:CU.id,text:inp.value.trim(),timestamp:Date.now()});
  inp.value='';save();
  openReelComments(reelId);
}
function deleteReelCmt(reelId,cId){
  const r=reels.find(x=>x.id===reelId);if(!r)return;
  r.comments=r.comments.filter(c=>c.id!==cId);save();
  openReelComments(reelId);
}
function shareReel(reelId){
  const inp=document.getElementById('share-link-input');
  if(inp)inp.value=`https://serakdep.ms/reel/${reelId}`;
  openModal('share-modal');
}

// ═══════════════════════════════════════════
//  GROUPS
// ═══════════════════════════════════════════
function createGroup(){
  const name=val('cg-name').trim();if(!name){toast('Escribe un nombre','warning');return;}
  const desc=val('cg-desc').trim(),rules=val('cg-rules').trim();
  const file=document.getElementById('cg-cover').files[0];
  const finish=cover=>{
    const g={id:ids.ng++,name,description:desc,rules,cover,createdBy:CU.id,members:[CU.id],pendingRequests:[],moderators:[CU.id],createdAt:Date.now()};
    groups.push(g);
    logActivity('group_create',g.name);
    checkBadges(CU.id);
    save();closeModal('create-group-modal');renderSidebar();navigate('groups',g.id);toast(`Grupo "${name}" creado ✅`,'success');
  };
  if(file){const r=new FileReader();r.onload=ev=>finish(ev.target.result);r.readAsDataURL(file);}else finish(null);
}
function joinGroup(gid){
  const g=groups.find(x=>x.id===gid);if(!g)return;
  if(g.members.includes(CU.id)){navigate('groups',gid);return;}
  if(g.pendingRequests.includes(CU.id)){toast('Solicitud ya enviada','info');return;}
  g.pendingRequests.push(CU.id);addNotif(g.createdBy,'group_request',CU.id,{gid});
  save();renderSidebar();toast('Solicitud enviada 📨','success');
}
function renderGroupsPage(activeId){
  const mc=document.getElementById('content');
  const mine=groups.filter(g=>g.members.includes(CU.id));
  if(!mine.length){mc.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:13px;"><h3 style="font-family:var(--font-head);font-weight:800;">Grupos</h3><button class="btn btn-primary" onclick="openModal('create-group-modal')"><i class="fas fa-plus"></i> Crear grupo</button></div><div class="card">${empty('fas fa-users','No perteneces a ningún grupo.')}</div>`;return;}
  const ag=activeId?groups.find(g=>g.id===activeId):mine[0];
  if(!ag){mc.innerHTML=empty('fas fa-users','Selecciona un grupo.');return;}
  mc.innerHTML=`
    <div style="display:flex;gap:6px;margin-bottom:13px;overflow-x:auto;flex-wrap:wrap;">
      ${mine.map(g=>`<button class="tab-pill ${g.id===ag.id?'active':''}" onclick="navigate('groups',${g.id})">${esc(g.name)}</button>`).join('')}
    </div>
    <div id="gfeed"></div>`;
  renderGroupFeed(ag.id);
}
function renderGroupFeed(gid){
  const g=groups.find(x=>x.id===gid);if(!g||!g.members.includes(CU.id))return;
  const area=document.getElementById('gfeed');if(!area)return;
  const gP=posts.filter(p=>p.groupId===gid&&!p.isPoll).sort((a,b)=>b.timestamp-a.timestamp);
  const gPl=polls.filter(p=>p.groupId===gid);
  const isMod=g.moderators?.includes(CU.id)||g.createdBy===CU.id||CU.isAdmin;
  const pending=g.pendingRequests||[];
  area.innerHTML=`
    <div class="card" style="margin-bottom:13px;">
      ${g.cover?`<img src="${g.cover}" style="width:100%;height:130px;object-fit:cover;border-radius:var(--r-lg) var(--r-lg) 0 0;" alt="" loading="lazy">`:''}
      <div style="padding:13px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:7px;">
          <div><h3 style="font-family:var(--font-head);font-weight:800;">${esc(g.name)}</h3><p style="color:var(--text2);font-size:.82rem;margin-top:3px;">${esc(g.description||'')}</p>${g.rules?`<p style="font-size:.8rem;margin-top:7px;"><strong>📋 Reglas:</strong> ${esc(g.rules)}</p>`:''}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${isMod?`<button class="btn btn-ghost" style="padding:6px 12px;font-size:.78rem;" onclick="openGroupManage(${gid})"><i class="fas fa-gear"></i> Gestionar</button>`:''}
            <button class="btn btn-danger" onclick="leaveGroup(${gid})">Salir</button>
          </div>
        </div>
        ${pending.length&&isMod?`<div style="background:var(--unread-bg);border-radius:var(--r-md);padding:10px;margin-top:10px;">
          <strong style="font-size:.82rem;">⏳ Solicitudes pendientes (${pending.length})</strong>
          ${pending.map(uid=>{const u=users.find(x=>x.id===uid);return `<div style="display:flex;align-items:center;gap:7px;margin-top:6px;"><img src="${u?.photo||defAv()}" style="width:26px;height:26px;border-radius:50%;" alt="" loading="lazy"><span style="flex:1;font-size:.82rem;">${esc(u?.username||'')}</span><button class="btn btn-primary" style="padding:3px 9px;font-size:.72rem;" onclick="acceptReq(${gid},${uid})">Aceptar</button><button class="btn btn-danger" style="padding:3px 8px;" onclick="rejectReq(${gid},${uid})">Rechazar</button></div>`;}).join('')}
        </div>`:''} 
      </div>
    </div>
    ${composer('g'+gid,gid)}
    ${gPl.map(pollCard).join('')}
    <div id="gposts-${gid}">
      ${gP.map(postCard).join('')||`<div class="card">${empty('fas fa-comment','Sin publicaciones en este grupo.')}</div>`}
    </div>`;
  attachComp('g'+gid,gid);
}
function acceptReq(gid,uid){const g=groups.find(x=>x.id===gid);if(!g)return;g.members.push(uid);g.pendingRequests=g.pendingRequests.filter(id=>id!==uid);addNotif(uid,'group_accepted',CU.id,{gid});save();renderGroupFeed(gid);renderSidebar();}
function rejectReq(gid,uid){const g=groups.find(x=>x.id===gid);if(!g)return;g.pendingRequests=g.pendingRequests.filter(id=>id!==uid);save();renderGroupFeed(gid);}
function leaveGroup(gid){
  if(!confirm('¿Salir del grupo?'))return;
  const g=groups.find(x=>x.id===gid);if(!g)return;
  g.members=g.members.filter(id=>id!==CU.id);save();closeModal('group-manage-modal');renderSidebar();navigate('groups');toast('Saliste del grupo','info');
}
function openGroupManage(gid){
  const g=groups.find(x=>x.id===gid);if(!g)return;
  document.getElementById('gm-title').textContent=`Gestionar: ${g.name}`;
  const isMod=g.moderators?.includes(CU.id)||g.createdBy===CU.id||CU.isAdmin;
  document.getElementById('gm-body').innerHTML=`
    <p style="font-weight:700;margin-bottom:8px;">Miembros (${g.members.length})</p>
    ${g.members.map(mid=>{
      const u=users.find(x=>x.id===mid);if(!u)return'';
      const isC=g.createdBy===mid,isM=(g.moderators||[]).includes(mid);
      return `<div style="display:flex;align-items:center;gap:7px;padding:6px 0;border-bottom:1px solid var(--border);">
        <img src="${u.photo||defAv()}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;" alt="" loading="lazy">
        <div style="flex:1;"><div style="font-weight:600;font-size:.85rem;">${esc(u.username)}</div><div style="font-size:.7rem;color:var(--text2);">${isC?'👑 Creador':isM?'🛡️ Moderador':'Miembro'}</div></div>
        ${isMod&&!isC&&mid!==CU.id?`${!isM?`<button class="btn btn-ghost" style="padding:3px 8px;font-size:.72rem;" onclick="promoteToMod(${gid},${mid})">Mod</button>`:''}
        <button class="btn btn-danger" onclick="removeMember(${gid},${mid})">Expulsar</button>`:''}
      </div>`;
    }).join('')}
    ${isMod?`<div style="margin-top:13px;display:flex;gap:7px;">
      <input type="text" id="add-mem" placeholder="Nombre de usuario" style="flex:1;">
      <button class="btn btn-primary" onclick="addMember(${gid})">Añadir</button>
    </div>`:''}`;
  openModal('group-manage-modal');
}
function promoteToMod(gid,uid){const g=groups.find(x=>x.id===gid);if(!g)return;g.moderators=g.moderators||[];if(!g.moderators.includes(uid))g.moderators.push(uid);save();openGroupManage(gid);toast('Promovido a moderador','success');}
function removeMember(gid,uid){const g=groups.find(x=>x.id===gid);if(!g)return;g.members=g.members.filter(id=>id!==uid);g.moderators=(g.moderators||[]).filter(id=>id!==uid);save();openGroupManage(gid);renderGroupFeed(gid);renderSidebar();}
function addMember(gid){
  const name=val('add-mem').trim();
  const u=users.find(x=>x.username===name);const g=groups.find(x=>x.id===gid);
  if(!u||!g){toast('Usuario no encontrado','warning');return;}
  if(g.members.includes(u.id)){toast('Ya es miembro','info');return;}
  g.members.push(u.id);g.pendingRequests=(g.pendingRequests||[]).filter(id=>id!==u.id);save();openGroupManage(gid);renderGroupFeed(gid);renderSidebar();toast(`${u.username} añadido ✅`,'success');
}

// ═══════════════════════════════════════════
//  POLLS
// ═══════════════════════════════════════════
function openPollCreator(gid){pendingPollGroup=gid;openModal('poll-create-modal');}
function addPollOpt(){
  const l=document.getElementById('poll-opts');
  if(l.children.length>=4){toast('Máximo 4 opciones','warning');return;}
  const i=document.createElement('input');i.type='text';i.className='popt';i.placeholder=`Opción ${l.children.length+1}`;i.style.marginBottom='7px';l.appendChild(i);
}
function publishPoll(){
  const q=val('poll-q').trim();if(!q){toast('Escribe una pregunta','warning');return;}
  const opts=Array.from(document.querySelectorAll('.popt')).map(i=>i.value.trim()).filter(Boolean);
  if(opts.length<2){toast('Mínimo 2 opciones','warning');return;}
  const p={id:ids.npo++,groupId:pendingPollGroup,createdBy:CU.id,question:q,options:opts.map((o,i)=>({id:i,text:o,votes:[]})),timestamp:Date.now(),closed:false};
  polls.push(p);
  // reset fields
  document.getElementById('poll-q').value='';
  const pollOpts=document.getElementById('poll-opts');
  pollOpts.innerHTML='<input type="text" class="popt" placeholder="Opción 1" style="margin-bottom:7px;"><input type="text" class="popt" placeholder="Opción 2" style="margin-bottom:7px;">';
  save();closeModal('poll-create-modal');
  if(pendingPollGroup)renderGroupFeed(pendingPollGroup);else renderFeed();
  toast('Encuesta publicada 📊','success');
}
function pollCard(p){
  const u=users.find(x=>x.id===p.createdBy);
  const total=p.options.reduce((a,o)=>a+o.votes.length,0);
  const myVote=p.options.findIndex(o=>o.votes.includes(CU.id));
  const voted=myVote>=0;
  const isOwner=p.createdBy===CU.id;
  return `<div class="card" style="padding:14px;margin-bottom:12px;">
    <div style="display:flex;align-items:center;gap:7px;margin-bottom:11px;">
      <img src="${u?.photo||defAv()}" style="width:30px;height:30px;border-radius:50%;" alt="" loading="lazy">
      <div><div style="font-weight:700;font-size:.85rem;">${esc(u?.username||'')}</div><div style="font-size:.7rem;color:var(--text2);">${timeAgo(p.timestamp)}</div></div>
      <span class="tag tag-purple" style="margin-left:auto;"><i class="fas fa-chart-bar"></i> Encuesta${p.closed?' · Cerrada':''}</span>
      ${isOwner&&!p.closed?`<button class="btn btn-danger" style="padding:3px 8px;font-size:.72rem;" onclick="closePoll(${p.id})">Cerrar</button>`:''}
    </div>
    <p style="font-weight:700;margin-bottom:9px;">${esc(p.question)}</p>
    ${p.options.map((o,i)=>{const pct=total>0?Math.round(o.votes.length/total*100):0;const isV=voted&&myVote===i;return `<div class="poll-opt ${isV?'voted':''}" onclick="${(voted||p.closed)?'':'votePoll('+p.id+','+o.id+')'}"><div class="poll-bar" style="width:${voted||p.closed?pct:0}%;"></div><span>${esc(o.text)}</span>${voted||p.closed?`<span class="poll-pct">${pct}%</span>`:''}</div>`;}).join('')}
    <p style="font-size:.75rem;color:var(--text2);margin-top:7px;">${total} voto${total!==1?'s':''}</p>
  </div>`;
}
function votePoll(pid,oid){const p=polls.find(x=>x.id===pid);if(!p||p.closed)return;if(p.options.some(o=>o.votes.includes(CU.id)))return;const o=p.options.find(x=>x.id===oid);if(!o)return;o.votes.push(CU.id);logActivity('poll_vote',p.question.substring(0,40));save();if(p.groupId)renderGroupFeed(p.groupId);else renderFeed();}
function closePoll(pid){const p=polls.find(x=>x.id===pid);if(!p||p.createdBy!==CU.id)return;p.closed=true;save();if(p.groupId)renderGroupFeed(p.groupId);else renderFeed();}

// ═══════════════════════════════════════════
//  MARKETPLACE
// ═══════════════════════════════════════════
function renderMarketplace(){
  const mc=document.getElementById('content');
  const cats=[...new Set(products.map(p=>p.category).filter(Boolean))];
  mc.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
    <h3 style="font-family:var(--font-head);font-weight:800;"><i class="fas fa-store" style="color:var(--orange);margin-right:7px;"></i>Marketplace</h3>
    <button class="btn btn-primary" onclick="openModal('mkt-create-modal')"><i class="fas fa-plus"></i> Publicar producto</button>
  </div>
  <div class="mkt-filter-bar">
    <button class="mkt-filter-btn ${mktFilter.category==='all'?'active':''}" onclick="setMktFilter('category','all')">Todos</button>
    ${cats.map(c=>`<button class="mkt-filter-btn ${mktFilter.category===c?'active':''}" onclick="setMktFilter('category','${c}')">${c}</button>`).join('')}
    <button class="mkt-filter-btn ${mktFilter.sold==='active'?'active':''}" style="margin-left:auto;" onclick="setMktFilter('sold',mktFilter.sold==='active'?'all':'active')">Solo disponibles</button>
    <input type="number" placeholder="Precio máx." style="width:110px;padding:5px 9px;border-radius:20px;border:1.5px solid var(--border);font-size:.78rem;background:var(--card);color:var(--text);" oninput="setMktFilter('maxPrice',this.value)">
  </div>
  <div id="mkt-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:13px;">
    ${products.length?products.map(productCard).join(''):`<div style="grid-column:1/-1;">${empty('fas fa-store','Sin productos aún. ¡Publica el primero!')}</div>`}
  </div>`;
}
function openProductDetail(pid){
  const p=products.find(x=>x.id===pid);if(!p)return;
  const u=users.find(x=>x.id===p.userId);
  const mb=document.getElementById('prod-detail-body');
  if(!mb)return;
  mb.innerHTML=`
    ${p.image?`<div style="width:100%;max-height:420px;overflow:hidden;border-radius:var(--r-lg) var(--r-lg) 0 0;background:#000;display:flex;align-items:center;justify-content:center;">
      <img src="${p.image}" style="max-width:100%;max-height:420px;object-fit:contain;display:block;" alt="">
    </div>`:''}
    <div style="padding:18px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">
        <div>
          <div class="mkt-price" style="font-size:1.35rem;">$${esc(p.price)}</div>
          <h3 style="font-weight:800;font-size:1.05rem;margin-top:3px;">${esc(p.title)}</h3>
        </div>
        ${p.sold?`<span class="sold-badge" style="font-size:.8rem;">Vendido</span>`:p.category?`<span class="tag tag-gray">${esc(p.category)}</span>`:''}
      </div>
      ${p.description?`<p style="font-size:.88rem;color:var(--text2);margin-bottom:14px;line-height:1.5;">${esc(p.description)}</p>`:''}
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:14px;cursor:pointer;padding:10px;background:var(--input-bg);border-radius:var(--r-md);" onclick="openProfileModal(${u?.id});closeModal('prod-detail-modal');">
        <img src="${u?.photo||defAv()}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" alt="">
        <div>
          <div style="font-weight:700;font-size:.88rem;">${esc(u?.username||'')}</div>
          <div style="font-size:.72rem;color:var(--text2);">Ver perfil →</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${p.userId!==CU.id&&!p.sold?`<button class="btn btn-primary" style="flex:1;justify-content:center;" onclick="interestedInProduct(${p.id});closeModal('prod-detail-modal');"><i class="fas fa-heart"></i> Me interesa</button>
        <button class="btn btn-ghost" style="padding:8px 14px;" onclick="navigate('messages');closeModal('prod-detail-modal');setTimeout(()=>openChat(${p.userId}),300)"><i class="fas fa-comment"></i> Contactar</button>`:''}
        ${p.userId===CU.id&&!p.sold?`<button class="btn btn-ghost" style="flex:1;justify-content:center;" onclick="markSold(${p.id});closeModal('prod-detail-modal');">Marcar vendido</button>`:''}
      </div>
    </div>`;
  openModal('prod-detail-modal');
}
function productCard(p){
  const u=users.find(x=>x.id===p.userId);
  return `<div class="mkt-card" id="mkt-${p.id}">
    ${p.image?`<div style="position:relative;width:100%;height:180px;overflow:hidden;cursor:pointer;" onclick="openProductDetail(${p.id})" class="mkt-img-wrap"><img src="${p.image}" class="mkt-img" alt="" loading="lazy" style="pointer-events:none;width:100%;height:100%;object-fit:cover;"></div>`:`<div style="width:100%;height:130px;background:var(--input-bg);display:flex;align-items:center;justify-content:center;cursor:pointer;" onclick="openProductDetail(${p.id})"><i class="fas fa-image" style="font-size:2rem;opacity:.3;"></i></div>`}
    <div class="mkt-body">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;">
        <div class="mkt-price">$${esc(p.price)}</div>
        ${p.sold?`<span class="sold-badge">Vendido</span>`:p.category?`<span class="tag tag-gray" style="font-size:.68rem;">${esc(p.category)}</span>`:''}
      </div>
      <p style="font-weight:700;font-size:.9rem;margin-bottom:4px;">${esc(p.title)}</p>
      <p style="font-size:.8rem;color:var(--text2);margin-bottom:9px;">${esc(p.description?.substring(0,70)||'')}</p>
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:9px;cursor:pointer;" onclick="openProfileModal(${u?.id})">
        <img src="${u?.photo||defAv()}" style="width:22px;height:22px;border-radius:50%;object-fit:cover;" alt="" loading="lazy">
        <span style="font-size:.77rem;color:var(--text2);">${esc(u?.username||'')}</span>
      </div>
      <div style="display:flex;gap:5px;flex-wrap:wrap;">
        ${p.userId!==CU.id&&!p.sold?`<button class="btn btn-primary" style="flex:1;justify-content:center;padding:6px 10px;font-size:.75rem;" onclick="interestedInProduct(${p.id})"><i class="fas fa-heart"></i> Me interesa</button>
        <button class="btn btn-ghost" style="padding:6px 10px;font-size:.75rem;" onclick="navigate('messages');setTimeout(()=>openChat(${p.userId}),300)"><i class="fas fa-comment"></i> Contactar</button>`:''}
        ${p.userId===CU.id&&!p.sold?`<button class="btn btn-ghost" style="flex:1;justify-content:center;font-size:.75rem;" onclick="markSold(${p.id})">Marcar vendido</button>`:''}
      </div>
    </div>
  </div>`;
}
function publishProduct(){
  const title=val('mkt-title').trim();if(!title){toast('Escribe un título','warning');return;}
  const p={id:ids.nprod++,userId:CU.id,title,description:val('mkt-desc').trim(),price:val('mkt-price').trim()||'0',category:val('mkt-cat').trim(),sold:false,image:null,timestamp:Date.now()};
  const file=document.getElementById('mkt-img').files[0];
  const finish=()=>{products.unshift(p);save();closeModal('mkt-create-modal');renderMarketplace();toast('Producto publicado ✅','success');checkBadges(CU.id);};
  if(file){const r=new FileReader();r.onload=ev=>{p.image=ev.target.result;finish();};r.readAsDataURL(file);}else finish();
}
function interestedInProduct(id){const p=products.find(x=>x.id===id);if(!p)return;addNotif(p.userId,'interested',CU.id,{pid:id});toast('¡El vendedor fue notificado de tu interés 💬','success');}
function markSold(id){
  const p=products.find(x=>x.id===id);if(!p||p.userId!==CU.id)return;
  // Open the sold modal with potential buyers
  const interested=users.filter(u=>u.id!==CU.id&&!u.deactivated);
  const sel=document.getElementById('mkt-sold-buyer-select');
  if(sel){
    sel.innerHTML=`<option value="">-- Comprador anónimo --</option>`+interested.map(u=>`<option value="${u.id}">${esc(u.username)}</option>`).join('');
  }
  sel._prodId=id;
  openModal('mkt-sold-modal');
}
function confirmMarkSold(){
  const sel=document.getElementById('mkt-sold-buyer-select');if(!sel)return;
  const prodId=sel._prodId;
  const buyerId=parseInt(sel.value)||null;
  const p=products.find(x=>x.id===prodId);if(!p)return;
  p.sold=true;p.buyerId=buyerId;
  if(buyerId){addNotif(buyerId,'seller_rate',CU.id,{prodId,sellerId:CU.id});}
  save();closeModal('mkt-sold-modal');renderMarketplace();
  checkBadges(CU.id);toast('Producto marcado como vendido ✅','success');
}

// ═══════════════════════════════════════════
//  EVENTS
// ═══════════════════════════════════════════
function renderEventsPage(){
  const mc=document.getElementById('content');
  mc.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:13px;">
    <h3 style="font-family:var(--font-head);font-weight:800;"><i class="fas fa-calendar" style="color:var(--blue);margin-right:7px;"></i>Eventos</h3>
    <button class="btn btn-primary" onclick="openModal('event-create-modal')"><i class="fas fa-plus"></i> Crear evento</button>
  </div>
  ${events.length?events.sort((a,b)=>a.date-b.date).map(eventCard).join(''):`<div class="card">${empty('fas fa-calendar','Sin eventos aún.')}</div>`}`;
}
function eventCard(e){
  const u=users.find(x=>x.id===e.userId);
  const d=new Date(e.date);
  const attending=(e.attendees||[]).includes(CU.id);
  CU.eventReminders = CU.eventReminders || [];
  const hasReminder = CU.eventReminders.includes(e.id);
  const recurText = e.recur && e.recur !== 'none' ? ` <span class="tag tag-orange"><i class="fas fa-redo"></i> ${e.recur==='daily'?'Diario':e.recur==='weekly'?'Semanal':'Mensual'}</span>` : '';
  const reminderBtn = `<button class="btn ${hasReminder?'btn-primary':'btn-ghost'}" style="padding:5px 10px;font-size:.76rem;" onclick="toggleEventReminder(${e.id})" title="Configurar recordatorio"><i class="fas fa-bell"></i> ${hasReminder?'✓ Recordado':'Recordarme'}</button>`;
  
  return `<div class="ev-card" id="ev-${e.id}">
    <div class="ev-date"><i class="fas fa-calendar"></i>${d.toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
    <h4 style="font-family:var(--font-head);font-weight:800;margin-bottom:5px;">${esc(e.title)}</h4>
    ${e.location?`<p style="font-size:.82rem;color:var(--text2);margin-bottom:5px;"><i class="fas fa-map-marker-alt"></i> ${esc(e.location)}</p>`:''}
    <p style="font-size:.84rem;margin-bottom:9px;">${esc(e.description||'')}</p>
    <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;">
      <div style="display:flex;align-items:center;gap:6px;cursor:pointer;" onclick="openProfileModal(${u?.id})">
        <img src="${u?.photo||defAv()}" style="width:22px;height:22px;border-radius:50%;" alt="" loading="lazy">
        <span style="font-size:.78rem;color:var(--text2);">${esc(u?.username||'')}</span>
      </div>
      <span class="tag ${e.privacy==='public'?'tag-green':'tag-gray'}">${e.privacy==='public'?'🌍 Público':'🔒 Privado'}</span>
      ${recurText}
      <span style="font-size:.78rem;color:var(--text2);">${(e.attendees||[]).length} asistentes</span>
      ${e.userId!==CU.id?`<button class="btn ${attending?'btn-ghost':'btn-primary'}" style="padding:5px 13px;font-size:.76rem;margin-left:auto;" onclick="toggleAttend(${e.id})">${attending?'✓ Asistiendo':'Asistir'}</button>`:`<button class="btn btn-danger" style="margin-left:auto;" onclick="deleteEvent(${e.id})">Eliminar</button>`}
      ${attending || e.userId === CU.id ? reminderBtn : ''}
      <button class="btn btn-ghost" style="padding:5px 10px;font-size:.76rem;" onclick="shareEventToFeed(${e.id})"><i class="fas fa-share"></i> Compartir</button>
    </div>
  </div>`;
}
function publishEvent(){
  const title=val('ev-title').trim();if(!title){toast('Escribe un título','warning');return;}
  const date=new Date(val('ev-date')).getTime();if(!date){toast('Selecciona una fecha','warning');return;}
  const recur=val('ev-recur')||'none';
  const baseEvent={id:ids.nev++,userId:CU.id,title,description:val('ev-desc').trim(),date,location:val('ev-loc').trim(),privacy:val('ev-priv'),recur,attendees:[CU.id],timestamp:Date.now()};
  events.push(baseEvent);
  
  if(recur!=='none'){
    const oneDay=24*60*60*1000;
    let nextDate=date;
    for(let i=1;i<=4;i++){
      if(recur==='daily')nextDate+=oneDay;
      else if(recur==='weekly')nextDate+=oneDay*7;
      else if(recur==='monthly'){
        const dObj=new Date(nextDate);
        dObj.setMonth(dObj.getMonth()+1);
        nextDate=dObj.getTime();
      }
      events.push({...baseEvent,id:ids.nev++,title:`${title} (Repetición #${i})`,date:nextDate,recurOccurrence:i});
    }
  }
  
  save();closeModal('event-create-modal');renderEventsPage();toast('Evento creado 🎉','success');
}
function toggleAttend(id){const e=events.find(x=>x.id===id);if(!e)return;if((e.attendees||[]).includes(CU.id))e.attendees=e.attendees.filter(x=>x!==CU.id);else{e.attendees=e.attendees||[];e.attendees.push(CU.id);}save();renderEventsPage();}
function deleteEvent(id){if(!confirm('¿Eliminar evento?'))return;events=events.filter(x=>x.id!==id);save();renderEventsPage();}
function toggleEventReminder(id){
  CU.eventReminders = CU.eventReminders || [];
  if(CU.eventReminders.includes(id)){
    CU.eventReminders = CU.eventReminders.filter(x=>x!==id);
    toast('Recordatorio cancelado 🔕','info');
  }else{
    CU.eventReminders.push(id);
    toast('Recordatorio activado! Te avisaremos 🔔','success');
  }
  save();renderEventsPage();
}

// ═══════════════════════════════════════════
//  MESSAGES (con modo efímero)
// ═══════════════════════════════════════════
// DESPUÉS
function renderMessages(){
  const mc=document.getElementById('content');
  mc.innerHTML=`<div class="msg-layout" id="msg-layout">
    <div class="convs-panel" id="convs-panel">
      <div class="convs-hd">Mensajes</div>
      <div class="convs-list" id="convs"></div>
    </div>
    <div class="chat-panel" id="chat-panel">
      <div style="flex:1;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:11px;color:var(--text2);">
        <i class="fas fa-comment-dots" style="font-size:2.2rem;opacity:.25;"></i>
        <p style="font-size:.88rem;">Selecciona una conversación</p>
      </div>
    </div>
  </div>`;
  renderConvs();
}
function renderConvs(){
  const c=document.getElementById('convs');if(!c)return;
  const bl=CU.blocked||[];
  const mutual=users.filter(u=>u.id!==CU.id&&!bl.includes(u.id)&&!u.deactivated&&CU.following.includes(u.id)&&(u.followers||[]).includes(CU.id));
  c.innerHTML=mutual.length?mutual.map(u=>{
    const conv=messages.find(m=>m.participants.includes(CU.id)&&m.participants.includes(u.id));
    const last=conv?.messages?.[conv.messages.length-1];
    const unread=conv?.messages?.filter(m=>m.from===u.id&&!m.seen).length||0;
    return `<div class="conv-row ${unread>0?'unread':''} ${cChatUser===u.id?'active':''}" onclick="openChat(${u.id})">
      <div class="conv-av"><img src="${u.photo||defAv()}" alt="" loading="lazy"></div>
      <div class="conv-info"><div class="conv-name">${esc(u.username)}</div><div class="conv-prev">${last?(last.media?'📎 Multimedia':esc((last.text||'').substring(0,28))+'…'):'Inicia la conversación'}</div></div>
      <div class="conv-meta">${last?`<div class="conv-time">${timeAgo(last.timestamp)}</div>`:''} ${unread>0?`<span class="badge" style="position:relative;top:0;right:0;">${unread}</span>`:''}</div>
    </div>`;}).join(''):`<div style="padding:15px;font-size:.83rem;color:var(--text2);">Sigue a alguien y que te siga de vuelta para chatear.</div>`;
}
let typTimeout=null;
// DESPUÉS
function openChat(uid){
  const u=users.find(x=>x.id===uid);if(!u)return;
  cChatUser=uid;
  let conv=messages.find(m=>m.participants.includes(CU.id)&&m.participants.includes(uid));
  if(!conv){conv={participants:[CU.id,uid],messages:[]};messages.push(conv);}
  conv.messages.forEach(m=>{
    if(m.from===uid&&!m.seen){
      m.seen=true;
      if(m.ephemeral&&!m._seenAt) m._seenAt=Date.now();
    }
  });
  // Borrar los que ya superaron el minuto desde que fueron vistos
  conv.messages=conv.messages.filter(m=>!(m.ephemeral&&m._seenAt&&Date.now()-m._seenAt>=60000));
  save();renderConvs();updateBadges();
  const cp=document.getElementById('chat-panel');if(!cp)return;
  const isEph=ephemeralConvs[uid]||false;

  // ── NUEVO: detectar móvil y activar la vista de chat ──────────
  const isMobile=window.innerWidth<=780;
  const layout=document.getElementById('msg-layout');
  if(isMobile&&layout){layout.classList.add('chat-open');}
  // ─────────────────────────────────────────────────────────────

  cp.innerHTML=`
    <div class="chat-hd">
      <button class="btn-back-chat" onclick="backToConversations()" title="Volver"><i class="fas fa-arrow-left"></i></button>
      <img src="${u.photo||defAv()}" alt="" loading="lazy" onclick="openProfileModal(${u.id})" style="cursor:pointer;">
      <div style="flex:1;"><div class="chat-uname">${esc(u.username)}</div><div class="chat-status" id="chat-status">${_onlineLabel(u)}</div></div>
      <button class="btn-icon" style="width:32px;height:32px;flex-shrink:0;" onclick="toggleChatSearch(${uid})" title="Buscar en conversación"><i class="fas fa-search"></i></button>
    </div>
    <div id="chat-search-bar" style="display:none;padding:6px 12px;background:var(--input-bg);border-bottom:1px solid var(--border);display:none;align-items:center;gap:8px;">
      <input type="text" id="chat-search-inp" placeholder="Buscar en la conversación..." style="flex:1;background:transparent;border:none;outline:none;font-size:.85rem;color:var(--text);" oninput="searchInChat(${uid},this.value)">
      <span id="chat-search-info" style="font-size:.75rem;color:var(--text2);white-space:nowrap;"></span>
      <button class="btn-icon" style="width:24px;height:24px;" onclick="navChatResult(-1)" title="Anterior"><i class="fas fa-chevron-up"></i></button>
      <button class="btn-icon" style="width:24px;height:24px;" onclick="navChatResult(1)" title="Siguiente"><i class="fas fa-chevron-down"></i></button>
      <button class="btn-icon" style="width:24px;height:24px;" onclick="closeChatSearch()"><i class="fas fa-times"></i></button>
    </div>
    <div class="chat-area" id="chat-area"></div>

    <div class="typing-ind" id="typing-ind">escribiendo...</div>
    <div id="chat-media-preview" style="display:none;padding:8px 14px 0;"></div>
    <div id="chat-reply-bar">
      <i class="fas fa-reply" style="color:var(--green);"></i>
      <span>Respondiendo a <b id="crb-name"></b>: <span id="crb-preview"></span></span>
      <button class="btn-icon" style="margin-left:auto;width:24px;height:24px;font-size:.75rem;" onclick="clearMsgReply()"><i class="fas fa-times"></i></button>
    </div>
    <div class="chat-input">
      <button class="ephemeral-btn ${isEph?'active':''}" id="eph-btn" onclick="toggleEphemeral(${uid})" title="Modo efímero: mensajes desaparecen al leerlos"><i class="fas fa-fire"></i></button>
      <button class="btn-icon" onclick="document.getElementById('chat-file-inp').click()" title="Adjuntar archivo"><i class="fas fa-paperclip"></i></button>
      <input type="file" id="chat-file-inp" accept="image/*,video/*,audio/*" style="display:none;" onchange="previewChatMedia(this,${uid})">
      <textarea id="chat-inp" placeholder="Escribe un mensaje..." autocomplete="off" rows="1" style="overflow-y:hidden;resize:none;"></textarea>
      <button class="btn btn-primary" style="flex-shrink:0;padding:8px 14px;" onclick="sendMsg(${uid})"><i class="fas fa-paper-plane"></i></button>
    </div>`;
  renderChatArea(conv);
  const inp=document.getElementById('chat-inp');
  inp.onkeydown=e=>{
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg(uid);return;}
    clearTimeout(typTimeout);
    const ti=document.getElementById('typing-ind');if(ti)ti.style.display='block';
    typTimeout=setTimeout(()=>{const t=document.getElementById('typing-ind');if(t)t.style.display='none';},1500);
  };
  inp.oninput=function(){this.style.height='auto';this.style.height=Math.min(this.scrollHeight,120)+'px';};
  inp.focus();
}
function backToConversations(){
  if(window._ephTimer){clearInterval(window._ephTimer);window._ephTimer=null;}
  const layout=document.getElementById('msg-layout');
  if(layout)layout.classList.remove('chat-open');
  cChatUser=null;
}
function toggleEphemeral(uid){
  ephemeralConvs[uid]=!ephemeralConvs[uid];
  const btn=document.getElementById('eph-btn');
  if(btn)btn.classList.toggle('active',ephemeralConvs[uid]);
  toast(ephemeralConvs[uid]?'🔥 Modo efímero activado':'Modo efímero desactivado','info');
}
function renderChatArea(conv){
  const a=document.getElementById('chat-area');if(!a)return;
  const now=Date.now();
  a.innerHTML=conv.messages.map(m=>{
    const isEph=m.ephemeral;
    const isMine=m.from===CU.id;
    // Tiempo restante para mensajes efímeros vistos por el receptor
    let countdownH='';
    if(isEph&&!isMine&&m._seenAt){
      const elapsed=Math.floor((now-m._seenAt)/1000);
      const remaining=Math.max(0,60-elapsed);
      const dashOffset=Math.round(44*(1-remaining/60));
      countdownH=`<div class="eph-countdown" id="eph-cd-${m.timestamp}">
        <div class="eph-ring">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <circle class="bg" cx="9" cy="9" r="7"/>
            <circle class="fg" cx="9" cy="9" r="7" style="stroke-dashoffset:${dashOffset};"/>
          </svg>
        </div>
        <span id="eph-sec-${m.timestamp}">${remaining}s</span>
      </div>`;
    }
    if(isEph&&isMine&&m.seen&&m._seenAt){
      const elapsed=Math.floor((now-m._seenAt)/1000);
      const remaining=Math.max(0,60-elapsed);
      const dashOffset=Math.round(44*(1-remaining/60));
      countdownH=`<div class="eph-countdown" id="eph-cd-${m.timestamp}">
        <div class="eph-ring">
          <svg width="18" height="18" viewBox="0 0 18 18">
            <circle class="bg" cx="9" cy="9" r="7"/>
            <circle class="fg" cx="9" cy="9" r="7" style="stroke-dashoffset:${dashOffset};"/>
          </svg>
        </div>
        <span id="eph-sec-${m.timestamp}">${remaining}s</span>
      </div>`;
    }
    let mediaH='';
    if(m.media){
      if(m.media.type==='image') mediaH=`<img src="${m.media.data}" class="chat-media-img" onclick="openMediaLB(this,'image')" alt="">`;
      else if(m.media.type==='video') mediaH=`<div class="chat-media-video-wrap"><video src="${m.media.data}" class="chat-media-video" preload="metadata"></video><button class="chat-media-play-btn" onclick="openMediaLB(this.previousElementSibling,'video')"><i class="fas fa-play"></i></button></div>`;
      else if(m.media.type==='audio') mediaH=`<audio src="${m.media.data}" controls class="chat-media-audio"></audio>`;
    }
    const rxnMap=m.reactions||{};
    const rxnSummary=Object.entries(rxnMap).map(([e,uids])=>`<span class="brxn">${e} ${uids.length}</span>`).join('');
    const quoteH=m.replyTo?(()=>{const orig=conv.messages.find(x=>x.timestamp===m.replyTo);return orig?`<div class="reply-quote" onclick="document.getElementById('bbl-${orig.timestamp}')?.scrollIntoView({behavior:'smooth'})"><b>${orig.from===CU.id?'Tú':users.find(u=>u.id===orig.from)?.username||'?'}</b>: ${esc((orig.text||'[media]').substring(0,60))}</div>`:'';})():'';

    const otherUid=conv.participants.find(id=>id!==CU.id)||0;
    const dotsBtn=`<button class="msg-dots-btn" onclick="openMsgMenu(event,${otherUid},${m.timestamp},${isMine})">···</button>`;
    return `<div class="msg-row ${isMine?'mine':'theirs'}">
      ${dotsBtn}
      <div class="bubble ${isMine?'mine':'theirs'}${isEph?' ephemeral':''}${isEph&&isMine?' ephemeral-mine':''}" id="bbl-${m.timestamp}">
        ${quoteH}
        ${mediaH}${isEph?'<i class="fas fa-fire" style="font-size:.7rem;margin-right:4px;opacity:.8;"></i>':''}${m.text?esc(m.text):''}${m.edited?'<span style="font-size:.6rem;opacity:.5;margin-left:4px;">✏️</span>':''}
        ${rxnSummary?`<div class="bubble-rxns">${rxnSummary}</div>`:''}
        <div class="btime">${timeAgo(m.timestamp)}${isMine?(m.seen?' ✓✓':' ✓'):''}${isEph?' · efímero':''}</div>
        ${countdownH}
      </div>
    </div>`;
  }).join('');
  a.scrollTop=a.scrollHeight;
  startEphemeralTimers(conv);
}
function startEphemeralTimers(conv){
  // Limpiar timer previo si existe
  if(window._ephTimer) clearInterval(window._ephTimer);
  const hasEph=conv.messages.some(m=>m.ephemeral&&m._seenAt);
  if(!hasEph)return;
  window._ephTimer=setInterval(()=>{
    const now=Date.now();
    let changed=false;
    conv.messages.forEach(m=>{
      if(!m.ephemeral||!m._seenAt)return;
      const elapsed=Math.floor((now-m._seenAt)/1000);
      const remaining=Math.max(0,60-elapsed);
      // Actualizar contador en DOM sin re-renderizar todo
      const secEl=document.getElementById(`eph-sec-${m.timestamp}`);
      const fgEl=document.querySelector(`#eph-cd-${m.timestamp} .fg`);
      if(secEl) secEl.textContent=remaining+'s';
      if(fgEl) fgEl.style.strokeDashoffset=Math.round(44*(1-remaining/60));
      // Marcar para borrar cuando llega a 0
      if(remaining<=0&&!m._expired){
        m._expired=true;
        changed=true;
        const bbl=document.getElementById(`bbl-${m.timestamp}`);
        if(bbl){
          bbl.style.animation='ephFadeOut .6s ease forwards';
          setTimeout(()=>bbl.remove(),600);
        }
      }
    });
    if(changed){
      conv.messages=conv.messages.filter(m=>!m._expired);
      save();renderConvs();
      // Si no quedan efímeros activos, parar el timer
      if(!conv.messages.some(m=>m.ephemeral&&m._seenAt&&!m._expired)){
        clearInterval(window._ephTimer);
        window._ephTimer=null;
      }
    }
  },1000);
}
let _chatPendingMedia=null;
function previewChatMedia(input,uid){
  const file=input.files[0];if(!file)return;
  const maxMB=20;
  if(file.size>maxMB*1024*1024){toast('El archivo es demasiado grande (máx 20 MB)','error');input.value='';return;}
  const reader=new FileReader();
  reader.onload=e=>{
    const data=e.target.result;
    const type=file.type.startsWith('video')?'video':file.type.startsWith('audio')?'audio':'image';
    _chatPendingMedia={data,type,name:file.name};
    const prev=document.getElementById('chat-media-preview');
    if(!prev)return;
    let previewEl='';
    if(type==='image') previewEl=`<img src="${data}" style="max-height:100px;border-radius:8px;margin-right:8px;">`;
    else if(type==='video') previewEl=`<video src="${data}" style="max-height:80px;border-radius:8px;margin-right:8px;" muted></video>`;
    else previewEl=`<i class="fas fa-file-audio" style="font-size:1.8rem;color:var(--green);margin-right:8px;"></i><span style="font-size:.82rem;color:var(--text2);">${esc(file.name)}</span>`;
    prev.style.display='flex';
    prev.style.cssText='display:flex;align-items:center;padding:8px 14px 0;gap:8px;';
    prev.innerHTML=previewEl+`<button class="btn-icon" onclick="cancelChatMedia()" title="Quitar" style="flex-shrink:0;"><i class="fas fa-times"></i></button>`;
  };
  reader.readAsDataURL(file);
}
function cancelChatMedia(){
  _chatPendingMedia=null;
  const prev=document.getElementById('chat-media-preview');
  if(prev){prev.style.display='none';prev.innerHTML='';}
  const fi=document.getElementById('chat-file-inp');if(fi)fi.value='';
}
function sendMsg(uid){
  const inp=document.getElementById('chat-inp');
  const hasText=inp&&inp.value.trim();
  const hasMedia=!!_chatPendingMedia;
  if(!hasText&&!hasMedia)return;
  let conv=messages.find(m=>m.participants.includes(CU.id)&&m.participants.includes(uid));
  if(!conv){conv={participants:[CU.id,uid],messages:[]};messages.push(conv);}
  const isEph=ephemeralConvs[uid]||false;
  const msg={from:CU.id,text:inp?inp.value.trim():'',timestamp:Date.now(),seen:false,ephemeral:isEph};
  if(hasMedia)msg.media=_chatPendingMedia;
  if(_msgReplyTo)msg.replyTo=_msgReplyTo.ts;
  conv.messages.push(msg);
  addNotif(uid,'message',CU.id,{});
  if(inp){inp.value='';inp.style.height='auto';}
  cancelChatMedia();clearMsgReply();
  save();renderChatArea(conv);renderConvs();
}

// ═══════════════════════════════════════════
//  SAVED & COLLECTIONS
// ═══════════════════════════════════════════
function renderSaved(){
  const mc=document.getElementById('content');
  const colls=(CU.collections||[]);
  const allSaved=posts.filter(p=>(CU.savedPosts||[]).includes(p.id));
  const tabs=`<div style="display:flex;gap:7px;margin-bottom:13px;overflow-x:auto;flex-wrap:wrap;">
    <button class="tab-pill active" id="scol-all" onclick="switchSavedTab('all')">Todos (${allSaved.length})</button>
    ${colls.map((col,i)=>`<button class="tab-pill" id="scol-${i}" onclick="switchSavedTab(${i})">${esc(col.name)} (${(col.postIds||[]).length})</button>`).join('')}
    ${colls.length<10?`<button class="tab-pill" onclick="promptNewCollection()"><i class="fas fa-plus"></i> Nueva</button>`:''}
  </div>`;
  mc.innerHTML=`<div style="margin-bottom:13px;"><h3 style="font-family:var(--font-head);font-weight:800;"><i class="fas fa-bookmark" style="color:var(--green);margin-right:7px;"></i>Guardados</h3></div>
  ${tabs}
  <div id="saved-content">${allSaved.map(postCard).join('')||`<div class="card">${empty('fas fa-bookmark','Nada guardado aún.')}</div>`}</div>`;
}
function switchSavedTab(idx){
  document.querySelectorAll('[id^="scol-"]').forEach(b=>b.classList.remove('active'));
  const tabEl=document.getElementById(idx==='all'?'scol-all':`scol-${idx}`);
  if(tabEl)tabEl.classList.add('active');
  const sc=document.getElementById('saved-content');if(!sc)return;
  if(idx==='all'){
    const allSaved=posts.filter(p=>(CU.savedPosts||[]).includes(p.id));
    sc.innerHTML=allSaved.map(postCard).join('')||`<div class="card">${empty('fas fa-bookmark','Nada guardado.')}</div>`;
  }else{
    const col=(CU.collections||[])[idx];
    if(!col){sc.innerHTML='';return;}
    const colPosts=posts.filter(p=>(col.postIds||[]).includes(p.id));
    sc.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:9px;"><h4 style="font-family:var(--font-head);">📂 ${esc(col.name)}</h4><button class="btn btn-danger" onclick="deleteCollection(${idx})">Eliminar colección</button></div>`
      +colPosts.map(postCard).join('')
      +(colPosts.length?'':(`<div class="card">${empty('fas fa-folder-open','Colección vacía.')}</div>`));
  }
}
function promptNewCollection(){
  const name=prompt('Nombre de la colección (máx 10):');
  if(!name||!name.trim())return;
  const ux=users.find(u=>u.id===CU.id);if(!ux)return;
  ux.collections=ux.collections||[];CU.collections=ux.collections;
  if(ux.collections.length>=10){toast('Máximo 10 colecciones','warning');return;}
  ux.collections.push({name:name.trim(),postIds:[]});
  save();renderSaved();toast(`Colección "${name.trim()}" creada 📂`,'success');
}
function deleteCollection(idx){
  const ux=users.find(u=>u.id===CU.id);if(!ux)return;
  ux.collections=(ux.collections||[]);ux.collections.splice(idx,1);CU.collections=ux.collections;
  save();renderSaved();
}
function openCollectionModal(pId){
  pendingSavePostId=pId;
  const ux=users.find(u=>u.id===CU.id);if(!ux)return;
  const colls=ux.collections||[];
  const cl=document.getElementById('collections-list');if(!cl)return;
  const isSaved=(CU.savedPosts||[]).includes(pId);
  const def=isSaved?`<button style="width:100%;text-align:left;padding:9px;background:var(--danger-l);border:none;border-radius:var(--r-md);cursor:pointer;color:var(--danger);font-size:.84rem;" onclick="toggleSave(${pId});closeModal('collection-modal');"><i class="fas fa-bookmark-slash"></i> Quitar de guardados</button>`
    :`<button style="width:100%;text-align:left;padding:9px;background:var(--green-l);border:none;border-radius:var(--r-md);cursor:pointer;color:var(--green);font-size:.84rem;" onclick="toggleSave(${pId});closeModal('collection-modal');"><i class="fas fa-bookmark"></i> Guardar rápido</button>`;
  cl.innerHTML=def+colls.map((col,i)=>{
    const inCol=(col.postIds||[]).includes(pId);
    return `<button style="width:100%;text-align:left;padding:9px;background:${inCol?'var(--green-l)':'var(--input-bg)'};border:none;border-radius:var(--r-md);cursor:pointer;font-size:.84rem;" onclick="addToCollection(${i},${pId})"><i class="fas fa-folder"></i> ${esc(col.name)} ${inCol?'✓':''}</button>`;
  }).join('');
  openModal('collection-modal');
}
function addToCollection(idx,pId){
  const ux=users.find(u=>u.id===CU.id);if(!ux)return;
  const col=(ux.collections||[])[idx];if(!col)return;
  col.postIds=col.postIds||[];
  if(col.postIds.includes(pId)){col.postIds=col.postIds.filter(id=>id!==pId);toast('Quitado de la colección','info');}
  else{col.postIds.push(pId);// Also add to savedPosts
    if(!(CU.savedPosts||[]).includes(pId)){CU.savedPosts=CU.savedPosts||[];CU.savedPosts.push(pId);ux.savedPosts=CU.savedPosts;}
    toast(`Guardado en "${col.name}" 📂`,'success');}
  CU.collections=ux.collections;save();closeModal('collection-modal');
}
function createCollection(){
  const inp=document.getElementById('new-collection-name');if(!inp||!inp.value.trim())return;
  const ux=users.find(u=>u.id===CU.id);if(!ux)return;
  ux.collections=ux.collections||[];CU.collections=ux.collections;
  if(ux.collections.length>=10){toast('Máximo 10 colecciones','warning');return;}
  ux.collections.push({name:inp.value.trim(),postIds:[]});
  inp.value='';save();
  openCollectionModal(pendingSavePostId);
  toast('Colección creada 📂','success');
}

// ═══════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════
function renderSettings(){
  const mc=document.getElementById('content');
  mc.innerHTML=`<div class="sets-layout" id="settings-layout">
    <div class="card sets-nav" id="settings-nav" style="padding:7px;">
      <div class="sni ${cSettingsSection==='account'?'active':''}" onclick="switchSet('account')"><i class="fas fa-user"></i> Cuenta</div>
      <div class="sni ${cSettingsSection==='privacy'?'active':''}" onclick="switchSet('privacy')"><i class="fas fa-lock"></i> Privacidad</div>
      <div class="sni ${cSettingsSection==='security'?'active':''}" onclick="switchSet('security')"><i class="fas fa-shield"></i> Seguridad</div>
      <div class="sni ${cSettingsSection==='blocked'?'active':''}" onclick="switchSet('blocked')"><i class="fas fa-ban"></i> Bloqueados</div>
      <div class="sni ${cSettingsSection==='notifs'?'active':''}" onclick="switchSet('notifs')"><i class="fas fa-bell"></i> Notificaciones</div>
      <div class="sni ${cSettingsSection==='appearance'?'active':''}" onclick="switchSet('appearance')"><i class="fas fa-palette"></i> Apariencia</div>
      <div class="sni ${cSettingsSection==='stats'?'active':''}" onclick="switchSet('stats')"><i class="fas fa-chart-line"></i> Estadísticas</div>
      <div class="sni ${cSettingsSection==='manage'?'active':''}" onclick="switchSet('manage')"><i class="fas fa-gear"></i> Gestión</div>
    </div>
    <div class="sets-panel" id="sets-panel"></div>
  </div>`;
  renderSetPanel();
}
function switchSet(s){
  cSettingsSection=s;
  const isMobile=window.innerWidth<=780;
  if(isMobile){
    const layout=document.getElementById('settings-layout');
    const panel=document.getElementById('sets-panel');
    if(!layout||!panel){renderSettings();return;}
    layout.classList.add('settings-open');
    renderSetPanelMobile(s);
  }else{
    renderSettings();
  }
}
function renderSetPanelMobile(s){
  cSettingsSection=s;
  renderSetPanel();
  const panel=document.getElementById('sets-panel');if(!panel)return;
  // Insertar botón Atrás al principio si no existe
  if(!document.getElementById('btn-back-settings-el')){
    const backBtn=document.createElement('button');
    backBtn.id='btn-back-settings-el';
    backBtn.className='btn-back-settings';
    backBtn.title='Volver a Configuración';
    backBtn.innerHTML='<i class="fas fa-arrow-left"></i>';
    backBtn.onclick=backToSettingsMenu;
    panel.insertBefore(backBtn,panel.firstChild);
  }
  // Marcar ítem activo en el menú
  const sections=['account','privacy','security','blocked','notifs','appearance','stats','manage'];
  const items=document.querySelectorAll('#settings-nav .sni');
  items.forEach((el,i)=>el.classList.toggle('active',sections[i]===s));
}
function backToSettingsMenu(){
  const layout=document.getElementById('settings-layout');
  if(layout)layout.classList.remove('settings-open');
  const btn=document.getElementById('btn-back-settings-el');
  if(btn)btn.remove();
}
function renderSetPanel(){
  const c=document.getElementById('sets-panel');if(!c)return;
  const u=CU;
  if(cSettingsSection==='account'){
    const pts=getUserPoints(u.id);const lvl=Math.min(100,Math.floor(pts/15)+1);const nextLvlPts=lvl*15;const prog=Math.min(100,Math.round((pts%15)/15*100));
    c.innerHTML=`<h3>Información de cuenta</h3>
      <div class="sets-row"><div><div class="sr-label">Nombre de usuario</div><div class="sr-sub">${esc(u.username)}</div></div><button class="btn btn-ghost" onclick="openProfileModal(${u.id})">Editar</button></div>
      <div class="sets-row"><div><div class="sr-label">Rol</div><div class="sr-sub">${esc(u.role||'Miembro')}</div></div></div>
      <div class="sets-row"><div style="flex:1;"><div class="sr-label">Nivel de actividad</div><div style="margin-top:5px;"><div style="font-size:.82rem;font-weight:700;color:var(--green);margin-bottom:4px;">⭐ Nivel ${lvl} · ${pts} pts</div><div style="height:8px;background:var(--border);border-radius:8px;overflow:hidden;"><div style="height:100%;width:${prog}%;background:var(--green);border-radius:8px;"></div></div></div></div></div>
      <div class="sets-row"><div><div class="sr-label">Insignias</div><div class="sr-sub">${badgesHtml(u.id)||'Sin insignias aún'}</div></div></div>
      <div class="sets-row"><div><div class="sr-label">Seguidores</div><div class="sr-sub">${u.followers?.length||0} personas te siguen</div></div></div>
      <div class="sets-row"><div><div class="sr-label">Siguiendo</div><div class="sr-sub">Sigues a ${u.following?.length||0} personas</div></div></div>`;
  }else if(cSettingsSection==='privacy'){
    const priv=u.privacy||{posts:'public',comments:'everyone'};
    c.innerHTML=`<h3>Privacidad</h3>
      <div class="sets-row"><div><div class="sr-label">¿Quién ve mis publicaciones?</div></div>
        <select class="priv-sel" onchange="savePrivacy('posts',this.value)"><option value="public" ${priv.posts==='public'?'selected':''}>🌍 Público</option><option value="friends" ${priv.posts==='friends'?'selected':''}>👥 Amigos</option><option value="only-me" ${priv.posts==='only-me'?'selected':''}>🔒 Solo yo</option></select></div>
      <div class="sets-row"><div><div class="sr-label">¿Quién puede comentar?</div></div>
        <select class="priv-sel" onchange="savePrivacy('comments',this.value)"><option value="everyone" ${priv.comments==='everyone'?'selected':''}>🌍 Todos</option><option value="friends" ${priv.comments==='friends'?'selected':''}>👥 Amigos</option><option value="only-me" ${priv.comments==='only-me'?'selected':''}>🔒 Solo yo</option></select></div>
      <hr class="div">
      <div class="sets-row"><div><div class="sr-label">Exportar mis datos</div><div class="sr-sub">Descarga todos tus datos en formato JSON</div></div><button class="btn btn-ghost" onclick="exportData()"><i class="fas fa-download"></i> Exportar</button></div>`;
  }else if(cSettingsSection==='security'){
    const has2fa=CU.twoFA?.enabled;
    c.innerHTML=`<h3>Seguridad</h3>
      <div class="sets-row"><div><div class="sr-label">Verificación en dos pasos (2FA)</div><div class="sr-sub">${has2fa?'✅ Activado — protección extra activada':'Añade una capa extra de seguridad'}</div></div>
        ${has2fa?`<button class="btn btn-danger" onclick="disable2FA()">Desactivar</button>`:`<button class="btn btn-primary" onclick="open2FASetup()"><i class="fas fa-lock"></i> Activar</button>`}
      </div>
      <div class="sets-row"><div><div class="sr-label">Cambiar contraseña</div></div><button class="btn btn-ghost" onclick="changePass()">Cambiar</button></div>`;
  }else if(cSettingsSection==='blocked'){
    const bl=users.filter(x=>(u.blocked||[]).includes(x.id));
    c.innerHTML=`<h3>Usuarios bloqueados</h3>
      ${bl.length?bl.map(bu=>`<div class="blocked-row"><div style="display:flex;align-items:center;gap:9px;"><img src="${bu.photo||defAv()}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" alt="" loading="lazy"><div><div style="font-weight:700;font-size:.87rem;">${esc(bu.username)}</div><div style="font-size:.73rem;color:var(--text2);">${esc(bu.role||'Miembro')}</div></div></div><button class="btn btn-primary" style="padding:5px 13px;font-size:.77rem;" onclick="unblockUser(${bu.id})"><i class="fas fa-unlock"></i> Desbloquear</button></div>`).join(''):`<div class="empty"><i class="fas fa-check-circle" style="color:var(--green);opacity:1;"></i><p>No tienes usuarios bloqueados</p></div>`}`;
  }else if(cSettingsSection==='notifs'){
    const dnd=localStorage.getItem('sms_dnd')==='1';
    const sndN=localStorage.getItem('sms_sound_notif')!=='0';
    const sndC=localStorage.getItem('sms_sound_chat')!=='0';
    c.innerHTML=`<h3>Notificaciones y Sonidos</h3>
      <div class="sets-row"><div><div class="sr-label">Modo No Molestar (DND)</div><div class="sr-sub">Silencia todos los sonidos y avisos</div></div><label class="toggle"><input type="checkbox" ${dnd?'checked':''} onchange="toggleDND(this.checked)"><div class="tslider"></div></label></div>
      <div class="sets-row"><div><div class="sr-label">Sonido de notificaciones</div><div class="sr-sub">Tono al recibir notificaciones</div></div><label class="toggle"><input type="checkbox" ${sndN?'checked':''} onchange="localStorage.setItem('sms_sound_notif',this.checked?'1':'0')"><div class="tslider"></div></label></div>
      <div class="sets-row"><div><div class="sr-label">Sonido de mensajes</div><div class="sr-sub">Tono al recibir un chat</div></div><label class="toggle"><input type="checkbox" ${sndC?'checked':''} onchange="localStorage.setItem('sms_sound_chat',this.checked?'1':'0')"><div class="tslider"></div></label></div>
      <div class="sets-row"><div><div class="sr-label">Likes y reacciones</div><div class="sr-sub">Cuando alguien reacciona a tus posts</div></div><label class="toggle"><input type="checkbox" ${localStorage.getItem('sms_notif_reactions')!=='0'?'checked':''} onchange="localStorage.setItem('sms_notif_reactions',this.checked?'1':'0')"><div class="tslider"></div></label></div>
      <div class="sets-row"><div><div class="sr-label">Comentarios</div><div class="sr-sub">Cuando alguien comenta tus posts</div></div><label class="toggle"><input type="checkbox" ${localStorage.getItem('sms_notif_comments')!=='0'?'checked':''} onchange="localStorage.setItem('sms_notif_comments',this.checked?'1':'0')"><div class="tslider"></div></label></div>
      <div class="sets-row"><div><div class="sr-label">Nuevos seguidores</div><div class="sr-sub">Cuando alguien te sigue</div></div><label class="toggle"><input type="checkbox" ${localStorage.getItem('sms_notif_follows')!=='0'?'checked':''} onchange="localStorage.setItem('sms_notif_follows',this.checked?'1':'0')"><div class="tslider"></div></label></div>
      <div class="sets-row"><div><div class="sr-label">Menciones (@)</div><div class="sr-sub">Cuando alguien te menciona</div></div><label class="toggle"><input type="checkbox" ${localStorage.getItem('sms_notif_mentions')!=='0'?'checked':''} onchange="localStorage.setItem('sms_notif_mentions',this.checked?'1':'0')"><div class="tslider"></div></label></div>
      <hr class="div"><div class="sets-row"><div><div class="sr-label">Leer todas las notificaciones</div><div class="sr-sub">Marca todas como vistas</div></div><button class="btn btn-ghost" onclick="markAllNotifsRead()"><i class="fas fa-check-double"></i> Leer todo</button></div>`;
  }else if(cSettingsSection==='appearance'){
    const dark=document.body.classList.contains('dark');
    const rm=document.body.classList.contains('read-mode');
    const currentColor=localStorage.getItem('sms_color')||'green';
    const colors=[
      {id:'green', color:'#2d6a4f', label:'Verde Bosque'},
      {id:'blue',  color:'#3b82f6', label:'Azul Clásico'},
      {id:'purple',color:'#7c3aed', label:'Morado Místico'},
      {id:'pink',  color:'#ec4899', label:'Rosa Vibrante'},
      {id:'orange',color:'#f59e0b', label:'Naranja Atardecer'},
      {id:'cyan',  color:'#06b6d4', label:'Cian Tech'},
      {id:'yellow',color:'#eab308', label:'Amarillo Cyber'},
      {id:'red',   color:'#dc2626', label:'Rojo Carmesí'},
      {id:'teal',  color:'#0d9488', label:'Verde Azulado'},
      {id:'amber', color:'#d97706', label:'Retro Ámbar'},
    ];
    const cfg = CU.avatarConfig || { use3D: false, skinColor: '#e0ac69', shirtColor: '#3b82f6', pantsColor: '#1e3a8a', hatType: 'none', hatColor: '#ef4444' };
    const currentWp=localStorage.getItem('sms_wallpaper')||'';
    const currentOpacity=parseFloat(localStorage.getItem('sms_wp_opacity')||'0.35');
    c.innerHTML=`<h3>Apariencia</h3>
      <div class="sets-row"><div><div class="sr-label">Modo oscuro</div></div><label class="toggle"><input type="checkbox" ${dark?'checked':''} onchange="setTheme(this.checked)"><div class="tslider"></div></label></div>
      <div class="sets-row"><div><div class="sr-label">Modo lectura</div><div class="sr-sub">Mejora la legibilidad con tipografía serif</div></div><label class="toggle"><input type="checkbox" ${rm?'checked':''} onchange="toggleReadMode(this.checked)"><div class="tslider"></div></label></div>
      <div class="sets-row"><div><div class="sr-label">Color principal</div></div></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:7px;">
        ${colors.map(cl=>`<div onclick="applyColor('${cl.id}')" data-color-id="${cl.id}" class="color-swatch ${currentColor===cl.id?'active':''}" style="background:${cl.color};" title="${cl.label}"></div>`).join('')}
      </div>
      <div class="sets-row" style="margin-top:13px;"><div><div class="sr-label">Tamaño de texto</div></div><select class="priv-sel" onchange="document.documentElement.style.fontSize=this.value+'px';localStorage.setItem('sms_fontsize',this.value)"><option value="14" ${localStorage.getItem('sms_fontsize')==='14'?'selected':''}>Pequeño (14px)</option><option value="15" ${!localStorage.getItem('sms_fontsize')||localStorage.getItem('sms_fontsize')==='15'?'selected':''}>Normal (15px)</option><option value="17" ${localStorage.getItem('sms_fontsize')==='17'?'selected':''}>Grande (17px)</option></select></div>
      <div class="sets-row"><div><div class="sr-label">Modo compacto</div><div class="sr-sub">Feed más denso con menos espacio entre posts</div></div><label class="toggle"><input type="checkbox" ${document.body.classList.contains('compact-mode')?'checked':''} onchange="toggleCompactMode(this.checked)"><div class="tslider"></div></label></div>
      <div class="sets-row"><div><div class="sr-label">Atajos de teclado</div><div class="sr-sub">Ver todos los atajos disponibles</div></div><button class="btn btn-ghost" onclick="openModal('kbd-modal')"><i class="fas fa-keyboard"></i> Ver atajos</button></div>
      
      <hr class="div" style="margin: 16px 0 12px;">
      <h3 style="margin-bottom:8px;display:flex;align-items:center;gap:8px;"><i class="fas fa-photo-film" style="color:var(--green);font-size:.9rem;"></i> Fondo de pantalla</h3>
      <p style="font-size:.78rem;color:var(--text2);margin-bottom:10px;">Sube cualquier <strong>imagen, GIF animado o video</strong> como fondo.</p>
      <div class="wp-grid">
        <div class="wp-thumb wp-none ${!currentWp && !_wpObjectURL?'active':''}" onclick="setWallpaper('')" style="cursor:pointer;">
          <span style="font-size:1.3rem;display:block;margin-bottom:3px;">✕</span>Sin fondo
        </div>
        ${PRESET_WALLPAPERS.map(wp=>`
          <div class="wp-thumb ${currentWp===wp.url?'active':''}" onclick="setWallpaper('${wp.url}','${wp.type||'image'}')" title="${wp.label}" style="cursor:pointer;overflow:hidden;background:#111;padding:0;">
            <img src="${wp.url.replace('w=1920','w=200')}" style="width:100%;height:100%;object-fit:cover;display:block;" loading="lazy">
          </div>
        `).join('')}
      </div>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;align-items:center;">
        <button class="wp-upload-btn" onclick="uploadWallpaper()" style="flex:1;min-width:180px;">
          <i class="fas fa-photo-film"></i> Subir imagen / GIF / video
        </button>
        ${currentWp || _wpObjectURL ? `<button class="wp-upload-btn" onclick="setWallpaper('')" style="flex:none;padding:9px 14px;background:var(--danger-l);color:var(--danger);border:1px solid var(--danger);"><i class="fas fa-trash"></i> Quitar</button>` : ''}
      </div>
      <p style="font-size:.71rem;color:var(--text2);margin-top:6px;"><i class="fas fa-info-circle"></i> JPG · PNG · GIF · WebP · MP4 · WebM · MOV · OGG — sin límite de tamaño</p>
      ${currentWp || _wpObjectURL ? `
        <div class="wp-opacity-row" style="margin-top:14px;">
          <span style="font-size:.8rem;color:var(--text2);white-space:nowrap;"><i class="fas fa-adjust"></i> Opacidad del overlay</span>
          <input type="range" min="0" max="0.85" step="0.05" value="${currentOpacity}"
                 oninput="setWallpaperOpacity(this.value);document.getElementById('wp-opacity-val').textContent=Math.round(this.value*100)+'%'">
          <span id="wp-opacity-val" style="font-size:.8rem;font-weight:700;color:var(--green);min-width:36px;text-align:right;">${Math.round(currentOpacity*100)}%</span>
        </div>
      ` : ''}
      
      <hr class="div" style="margin: 15px 0;">
      <h3>Personalización de Avatar 3D</h3>
      <p style="font-size:.8rem;color:var(--text2);margin-bottom:10px;">Diseña tu avatar 3D interactivo en tiempo real (estilo Roblox) usando Three.js.</p>
      
      <div class="sets-row">
        <div>
          <div class="sr-label">Activar Avatar 3D</div>
          <div class="sr-sub">Sustituye tu foto de perfil por tu avatar 3D giratorio</div>
        </div>
        <label class="toggle">
          <input type="checkbox" id="av3d-use" ${cfg.use3D?'checked':''} onchange="save3DAvatarConfig('use3D', this.checked)">
          <div class="tslider"></div>
        </label>
      </div>

      <div class="sets-row">
        <div><div class="sr-label">Color de Piel</div></div>
        <input type="color" value="${cfg.skinColor||'#e0ac69'}" onchange="save3DAvatarConfig('skinColor', this.value)" style="width:50px;height:30px;padding:0;border:none;cursor:pointer;">
      </div>

      <div class="sets-row">
        <div><div class="sr-label">Color de Camisa</div></div>
        <input type="color" value="${cfg.shirtColor||'#3b82f6'}" onchange="save3DAvatarConfig('shirtColor', this.value)" style="width:50px;height:30px;padding:0;border:none;cursor:pointer;">
      </div>

      <div class="sets-row">
        <div><div class="sr-label">Color de Pantalones</div></div>
        <input type="color" value="${cfg.pantsColor||'#1e3a8a'}" onchange="save3DAvatarConfig('pantsColor', this.value)" style="width:50px;height:30px;padding:0;border:none;cursor:pointer;">
      </div>

      <div class="sets-row">
        <div><div class="sr-label">Sombrero</div></div>
        <select class="priv-sel" onchange="save3DAvatarConfig('hatType', this.value)" style="width:auto;">
          <option value="none" ${cfg.hatType==='none'?'selected':''}>Ninguno</option>
          <option value="classic" ${cfg.hatType==='classic'?'selected':''}>Clásico</option>
        </select>
      </div>

      <div class="sets-row">
        <div><div class="sr-label">Color de Sombrero</div></div>
        <input type="color" value="${cfg.hatColor||'#ef4444'}" onchange="save3DAvatarConfig('hatColor', this.value)" style="width:50px;height:30px;padding:0;border:none;cursor:pointer;">
      </div>`;
  }else if(cSettingsSection==='stats'){
    renderStatsPanel(c);
  }else if(cSettingsSection==='manage'){
    c.innerHTML=`<h3>Gestión de cuenta</h3>
      <div class="sets-row"><div><div class="sr-label">Cambiar contraseña</div></div><button class="btn btn-ghost" onclick="changePass()">Cambiar</button></div>
      <div class="sets-row"><div><div class="sr-label" style="color:var(--danger);">Desactivar cuenta</div><div class="sr-sub">Desactivación temporal; puedes reactivar</div></div><button class="btn btn-danger" onclick="deactivate()">Desactivar</button></div>
      <div class="sets-row"><div><div class="sr-label" style="color:var(--danger);">Eliminar cuenta</div><div class="sr-sub">Eliminación permanente e irreversible de todos tus datos</div></div><button class="btn btn-danger" onclick="deleteAccount()">Eliminar</button></div>
      <div class="sets-row"><div><div class="sr-label">Cerrar sesión</div></div><button class="btn btn-ghost" onclick="doLogout()"><i class="fas fa-sign-out-alt"></i> Salir</button></div>`;
  }
}

function toggleReadMode(on){
  document.body.classList.toggle('read-mode',on);
  localStorage.setItem('sms_readmode',on?'1':'0');
}
function save3DAvatarConfig(key, value) {
  CU.avatarConfig = CU.avatarConfig || { use3D: false, skinColor: '#e0ac69', shirtColor: '#3b82f6', pantsColor: '#1e3a8a', hatType: 'none', hatColor: '#ef4444' };
  CU.avatarConfig[key] = value;
  save();
  renderHeaderAvatar();
  if (cView === 'profile' || cView === 'settings') {
    renderSidebar();
    if (document.getElementById('pc-av-canvas')) {
      if (window.sidebarAvatarInstance) { window.sidebarAvatarInstance.stop(); window.sidebarAvatarInstance = null; }
      if (CU.avatarConfig.use3D) window.sidebarAvatarInstance = create3DAvatar('pc-av-canvas', CU.avatarConfig);
    }
  }
}
function exportData(){
  const ux=users.find(u=>u.id===CU.id);
  const myPosts=posts.filter(p=>p.userId===CU.id);
  const myConvs=messages.filter(m=>m.participants.includes(CU.id));
  const data={user:{username:ux?.username,bio:ux?.bio,role:ux?.role,followers:ux?.followers?.length,following:ux?.following?.length},posts:myPosts.map(p=>({content:p.content,timestamp:new Date(p.timestamp).toISOString(),reactions:Object.values(p.reactions||{}).length,comments:p.comments.length})),conversations:myConvs.map(c=>({with:c.participants.filter(id=>id!==CU.id)[0],messageCount:c.messages.length})),exported:new Date().toISOString()};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`serakdep_export_${CU.username}.json`;a.click();
  URL.revokeObjectURL(url);toast('Datos exportados ✅','success');
}

function renderStatsPanel(c){
  const myPosts=posts.filter(p=>p.userId===CU.id);
  const totalLikes=myPosts.reduce((a,p)=>a+Object.values(p.reactions||{}).length,0);
  const totalComments=myPosts.reduce((a,p)=>a+p.comments.length,0);
  const engagement=myPosts.length>0?((totalLikes+totalComments)/myPosts.length).toFixed(1):0;
  const allUsersActivity=users.map(u=>posts.filter(p=>p.userId===u.id).length);
  allUsersActivity.sort((a,b)=>b-a);
  const myPostCount=myPosts.length;
  const rank=allUsersActivity.findIndex(n=>n<=myPostCount)+1;
  const pct=Math.round((1-rank/Math.max(users.length,1))*100);
  const rankLabel=pct>=90?'Top 10%':pct>=75?'Top 25%':pct>=50?'Top 50%':'En crecimiento 🌱';

  // Posts por día (últimos 7 días)
  const days=[];const labels=[];
  for(let i=6;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i);
    const start=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
    const end=start+86400000;
    days.push(myPosts.filter(p=>p.timestamp>=start&&p.timestamp<end).length);
    labels.push(d.toLocaleDateString('es-ES',{weekday:'short'}));
  }

  c.innerHTML=`<h3>Mis Estadísticas</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:18px;">
      <div style="background:var(--input-bg);border-radius:var(--r-md);padding:13px;text-align:center;"><div style="font-family:var(--font-head);font-weight:800;font-size:1.4rem;">${myPosts.length}</div><div style="font-size:.75rem;color:var(--text2);">Publicaciones</div></div>
      <div style="background:var(--input-bg);border-radius:var(--r-md);padding:13px;text-align:center;"><div style="font-family:var(--font-head);font-weight:800;font-size:1.4rem;">${totalLikes}</div><div style="font-size:.75rem;color:var(--text2);">Reacciones recibidas</div></div>
      <div style="background:var(--input-bg);border-radius:var(--r-md);padding:13px;text-align:center;"><div style="font-family:var(--font-head);font-weight:800;font-size:1.4rem;">${engagement}</div><div style="font-size:.75rem;color:var(--text2);">Engagement promedio</div></div>
      <div style="background:var(--input-bg);border-radius:var(--r-md);padding:13px;text-align:center;"><div style="font-family:var(--font-head);font-weight:800;font-size:1.4rem;">${Math.floor(Math.random()*500+50)}</div><div style="font-size:.75rem;color:var(--text2);">Visitas al perfil</div></div>
    </div>
    <div style="margin-bottom:13px;"><span class="rank-badge"><i class="fas fa-trophy"></i> ${rankLabel}</span></div>
    <div style="background:var(--input-bg);border-radius:var(--r-md);padding:13px;margin-bottom:13px;">
      <p style="font-weight:700;font-size:.85rem;margin-bottom:11px;">Publicaciones (últimos 7 días)</p>
      <canvas id="stats-chart" height="120"></canvas>
    </div>`;
  setTimeout(()=>{
    const ctx=document.getElementById('stats-chart');if(!ctx)return;
    new Chart(ctx,{type:'bar',data:{labels,datasets:[{label:'Posts',data:days,backgroundColor:'rgba(22,163,74,.5)',borderColor:'var(--green)',borderWidth:2,borderRadius:6}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{stepSize:1},grid:{color:'rgba(0,0,0,.07)'}},x:{grid:{display:false}}}}});
  },50);
}

function savePrivacy(k,v){const ux=users.find(u=>u.id===CU.id);if(!ux)return;ux.privacy=ux.privacy||{};ux.privacy[k]=v;CU.privacy=ux.privacy;save();toast('Privacidad actualizada ✅','success');}
function unblockUser(uid){const u=users.find(x=>x.id===uid);if(!u)return;CU.blocked=CU.blocked.filter(id=>id!==uid);const ux=users.find(x=>x.id===CU.id);if(ux)ux.blocked=CU.blocked;save();renderSetPanel();toast(`${u.username} desbloqueado`,'info');}
function changePass(){
  const ux=users.find(u=>u.id===CU.id);if(!ux)return;
  const box=document.createElement('div');
  box.id='chpass-overlay';
  box.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:3000;display:flex;align-items:center;justify-content:center;';
  box.innerHTML=`<div style="background:var(--card);border-radius:var(--r-lg);padding:22px;width:min(340px,92vw);box-shadow:var(--sh3);">
    <h3 style="font-family:var(--font-head);font-weight:800;margin-bottom:14px;font-size:1rem;">Cambiar contraseña</h3>
    <input type="password" id="cp-old" placeholder="Contraseña actual" style="margin-bottom:9px;width:100%;">
    <input type="password" id="cp-new" placeholder="Nueva contraseña (mín. 4 caracteres)" style="margin-bottom:9px;width:100%;">
    <input type="password" id="cp-new2" placeholder="Repite la nueva contraseña" style="margin-bottom:14px;width:100%;">
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button class="btn btn-ghost" onclick="document.getElementById('chpass-overlay').remove()">Cancelar</button>
      <button class="btn btn-primary" onclick="confirmChangePass()"><i class="fas fa-lock"></i> Cambiar</button>
    </div>
  </div>`;
  document.body.appendChild(box);
  setTimeout(()=>document.getElementById('cp-old')?.focus(),50);
}
function confirmChangePass(){
  const ux=users.find(u=>u.id===CU.id);if(!ux)return;
  const old=document.getElementById('cp-old')?.value||'';
  const nw=document.getElementById('cp-new')?.value||'';
  const nw2=document.getElementById('cp-new2')?.value||'';
  if(ux.password!==old){toast('Contraseña actual incorrecta','warning');return;}
  if(nw.length<4){toast('Mínimo 4 caracteres','warning');return;}
  if(nw!==nw2){toast('Las contraseñas no coinciden','warning');return;}
  ux.password=nw;save();
  document.getElementById('chpass-overlay')?.remove();
  toast('Contraseña actualizada ✅','success');
}
function deactivate(){if(!confirm('¿Desactivar cuenta?'))return;const ux=users.find(u=>u.id===CU.id);if(ux)ux.deactivated=true;save();doLogout();}
function deleteAccount(){
  const conf=prompt('Esta acción es IRREVERSIBLE. Escribe tu nombre de usuario para confirmar:');
  if(!conf||conf.trim()!==CU.username){toast('Nombre de usuario incorrecto. Cuenta no eliminada.','error');return;}
  if(!confirm('¿Seguro? Se eliminarán todos tus posts, mensajes, reels e historias.'))return;
  // Remove all user content
  posts=posts.filter(p=>p.userId!==CU.id);
  stories=stories.filter(s=>s.userId!==CU.id);
  reels=reels.filter(r=>r.userId!==CU.id);
  messages=messages.filter(m=>!m.participants.includes(CU.id));
  // Remove from followers/following lists
  users.forEach(u=>{
    u.followers=(u.followers||[]).filter(id=>id!==CU.id);
    u.following=(u.following||[]).filter(id=>id!==CU.id);
    u.blocked=(u.blocked||[]).filter(id=>id!==CU.id);
    u.savedPosts=(u.savedPosts||[]).filter(id=>!posts.find(p=>p.id===id&&p.userId===CU.id));
  });
  // Remove the user itself
  users=users.filter(u=>u.id!==CU.id);
  save();
  toast('Cuenta eliminada permanentemente.','success');
  doLogout();
}

// ═══════════════════════════════════════════
//  NOTIFICATIONS
// ═══════════════════════════════════════════
function addNotif(toId,type,fromId,extra={}){
  if(toId===fromId&&type!=='badge')return;
  // Respetar preferencias de notificaciones del destinatario
  const prefMap={reaction:'sms_notif_reactions',comment:'sms_notif_comments',follow:'sms_notif_follows',mention:'sms_notif_mentions',cmt_like:'sms_notif_reactions',cmt_reply:'sms_notif_comments'};
  const prefKey=prefMap[type];
  if(prefKey&&localStorage.getItem(prefKey)==='0')return;
  notifs.push({id:ids.nn++,userId:toId,type,fromId,read:false,timestamp:Date.now(),...extra});
  save();if(toId===CU?.id)updateBadges();
}
function updateBadges(){
  const unread=notifs.filter(n=>n.userId===CU.id&&!n.read).length;
  const nb=document.getElementById('notif-badge');if(nb){nb.textContent=unread;nb.style.display=unread>0?'block':'none';}
  const msgUnread=messages.filter(m=>m.participants.includes(CU.id)).reduce((a,m)=>a+(m.messages.filter(x=>x.from!==CU.id&&!x.seen).length),0);
  const mb=document.getElementById('msg-badge');if(mb){mb.textContent=msgUnread;mb.style.display=msgUnread>0?'block':'none';}
  const pending=reports.filter(r=>r.status==='pending').length;
  const modb=document.getElementById('mod-badge');if(modb){modb.textContent=pending;modb.style.display=pending>0?'block':'none';}
  
  const rdNb=document.getElementById('rd-notif-badge');if(rdNb){rdNb.textContent=unread;rdNb.style.display=unread>0?'block':'none';}
}
const _notifBtn=document.getElementById('notif-btn');
if(_notifBtn)_notifBtn.addEventListener('click',()=>{
  // Sync CU.notifications from notifs array
  CU.notifications = notifs.filter(n=>n.userId===CU.id).sort((a,b)=>b.timestamp-a.timestamp);
  nFilter='all';
  // notif-panel already set
  // Replace list with a div that renderNotifsFiltered will fill
  // already notif-panel
  renderNotifsFiltered();
  updateBadges();
  openModal('notif-modal');
});

// ═══════════════════════════════════════════
//  ADVANCED SEARCH
// ═══════════════════════════════════════════
function setSearchFilter(f){
  searchFilter=f;
  document.querySelectorAll('.search-filter-bar .tab-pill').forEach(b=>b.classList.remove('active'));
  const el=document.getElementById(`sf-${f}`);if(el)el.classList.add('active');
  runAdvancedSearch();
}
function runAdvancedSearch(){
  const q=val('adv-search-q').toLowerCase().trim();
  const c=document.getElementById('adv-search-results');if(!c)return;
  if(!q){c.innerHTML='<p style="color:var(--text2);font-size:.85rem;">Escribe algo para buscar...</p>';return;}
  const bl=CU.blocked||[];
  let html='';
  // People
  if(searchFilter==='all'||searchFilter==='people'){
    const people=users.filter(u=>u.id!==CU.id&&!bl.includes(u.id)&&!u.deactivated&&u.username.toLowerCase().includes(q));
    if(people.length){html+=`<div class="search-section"><span class="search-section-title">👤 Personas</span>${people.map(u=>`<div class="search-result-row" onclick="openProfileModal(${u.id});closeModal('search-modal')"><img src="${u.photo||defAv()}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;" alt="" loading="lazy"><div><div style="font-weight:700;font-size:.85rem;">${esc(u.username)}</div><div style="font-size:.73rem;color:var(--text2);">${esc(u.role||'Miembro')}</div></div></div>`).join('')}</div>`;}
  }
  // Posts
  if(searchFilter==='all'||searchFilter==='posts'){
    const fp=posts.filter(p=>!bl.includes(p.userId)&&p.content.toLowerCase().includes(q));
    if(fp.length){const au=u=>users.find(x=>x.id===u);html+=`<div class="search-section"><span class="search-section-title">📝 Posts</span>${fp.slice(0,5).map(p=>`<div class="search-result-row" onclick="closeModal('search-modal');navigate('public')"><div><div style="font-size:.82rem;font-weight:600;">${esc(au(p.userId)?.username||'')}</div><div style="font-size:.8rem;color:var(--text2);">${esc(p.content.substring(0,80))}</div></div></div>`).join('')}</div>`;}
  }
  // Groups
  if(searchFilter==='all'||searchFilter==='groups'){
    const fg=groups.filter(g=>g.name.toLowerCase().includes(q)||g.description?.toLowerCase().includes(q));
    if(fg.length){html+=`<div class="search-section"><span class="search-section-title">👥 Grupos</span>${fg.map(g=>`<div class="search-result-row" onclick="navigate('groups',${g.id});closeModal('search-modal')"><span class="gicon"><i class="fas fa-users"></i></span><div><div style="font-weight:700;font-size:.85rem;">${esc(g.name)}</div><div style="font-size:.73rem;color:var(--text2);">${g.members.length} miembros</div></div></div>`).join('')}</div>`;}
  }
  // Products
  if(searchFilter==='all'||searchFilter==='products'){
    const fp=products.filter(p=>p.title.toLowerCase().includes(q)||p.description?.toLowerCase().includes(q));
    if(fp.length){html+=`<div class="search-section"><span class="search-section-title">🛒 Productos</span>${fp.slice(0,5).map(p=>`<div class="search-result-row" onclick="navigate('marketplace');closeModal('search-modal')"><div><div style="font-weight:700;font-size:.85rem;">${esc(p.title)}</div><div style="font-size:.73rem;color:var(--green);">$${esc(p.price)}</div></div></div>`).join('')}</div>`;}
  }
  c.innerHTML=html||`<p style="color:var(--text2);font-size:.85rem;padding:13px 0;">Sin resultados para "${esc(q)}"</p>`;
}

// ═══════════════════════════════════════════
//  MINI PLAYER
// ═══════════════════════════════════════════
function openMP(src,username){
  document.getElementById('miniplayer').style.display='flex';
  const a=document.getElementById('mp-audio');
  a.src=src;document.getElementById('mp-title').textContent='Audio';document.getElementById('mp-user').textContent=username;
  a.play().catch(()=>{});document.getElementById('mp-play').innerHTML='<i class="fas fa-pause"></i>';
}
function toggleMP(){const a=document.getElementById('mp-audio');if(a.paused){a.play();document.getElementById('mp-play').innerHTML='<i class="fas fa-pause"></i>';}else{a.pause();document.getElementById('mp-play').innerHTML='<i class="fas fa-play"></i>';}}
function closeMP(){document.getElementById('miniplayer').style.display='none';document.getElementById('mp-audio').pause();}

// ═══════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════
function val(id){const e=document.getElementById(id);return e?e.value:'';}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function defAv(){return 'https://ui-avatars.com/api/?name=?&background=16a34a&color=fff&size=60';}
function defCov(){return 'https://picsum.photos/800/200?random=10';}
function mediaType(m){if(m.startsWith('image/'))return'image';if(m.startsWith('video/'))return'video';if(m.startsWith('audio/'))return'audio';return'file';}
function rxnIco(t){return{like:'👍',love:'❤️',laugh:'😂',sad:'😢',angry:'😡'}[t]||'👍';}
function roleTag(r){const m={Fundador:'purple',Líder:'purple','Soporte Técnico':'orange',Admin:'orange',Miembro:'gray'};return m[r]||'gray';}
function renderHashtags(text){return text.replace(/(#[a-zA-ZÀ-ÿ0-9_]+)/g,'<span class="hashtag" onclick="searchTag(\'$1\')">$1</span>');}
function searchTag(tag){
  const mc=document.getElementById('content');if(!mc)return;
  cView='search';
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  const bl=CU.blocked||[];
  const filtered=posts.filter(p=>!p.groupId&&p.content.includes(tag)&&!bl.includes(p.userId));
  mc.innerHTML=`<div style="margin-bottom:13px;display:flex;align-items:center;gap:9px;"><button class="btn btn-ghost" onclick="navigate('public')"><i class="fas fa-arrow-left"></i> Volver</button><h3 style="font-family:var(--font-head);font-weight:800;">${esc(tag)}</h3></div>${filtered.map(postCard).join('')||`<div class="card">${empty('fas fa-hashtag','Sin posts con este hashtag.')}</div>`}`;
}
function timeAgo(ts){
  const s=Math.floor((Date.now()-ts)/1000);
  if(s<60)return 'ahora';if(s<3600)return Math.floor(s/60)+'m';
  if(s<86400)return Math.floor(s/3600)+'h';if(s<604800)return Math.floor(s/86400)+'d';
  return new Date(ts).toLocaleDateString('es-ES',{day:'numeric',month:'short'});
}
function empty(icon,text){return `<div class="empty"><i class="${icon}"></i><p>${text}</p></div>`;}
function toast(msg,type='info'){
  const c=document.getElementById('toasts');
  const t=document.createElement('div');t.className=`toast ${type}`;
  const icons={success:'<i class="fas fa-check-circle" style="color:var(--green);"></i>',info:'<i class="fas fa-info-circle" style="color:var(--blue);"></i>',warning:'<i class="fas fa-exclamation-triangle" style="color:var(--orange);"></i>'};
  t.innerHTML=(icons[type]||'')+` ${esc(msg)}`;c.appendChild(t);
  setTimeout(()=>{t.style.animation='tIn .28s ease reverse';setTimeout(()=>t.remove(),300);},3500);
}
function openLB(src){
  const img=document.getElementById('lb-img');
  const vid=document.getElementById('lb-video');
  const aud=document.getElementById('lb-audio');
  if(img){img.style.display='none';img.src='';}
  if(vid){vid.style.display='none';vid.pause();vid.src='';}
  if(aud){aud.style.display='none';aud.pause();aud.src='';}
  if(img){img.src=src;img.style.display='block';}
  openModal('lightbox-modal');
}
function openMediaLB(el, type){
  const src = el.src || el.currentSrc || '';
  const img=document.getElementById('lb-img');
  const vid=document.getElementById('lb-video');
  const aud=document.getElementById('lb-audio');
  if(img){img.style.display='none';img.src='';}
  if(vid){vid.style.display='none';vid.pause();vid.src='';}
  if(aud){aud.style.display='none';aud.pause();aud.src='';}
  if(type==='image'&&img){img.src=src;img.style.display='block';}
  else if(type==='video'&&vid){vid.src=src;vid.style.display='block';}
  else if(type==='audio'&&aud){aud.src=src;aud.style.display='block';}
  openModal('lightbox-modal');
}
// Helper: store full src in a data attribute and open lightbox from it
function openLBFull(elOrId){
  let src='';
  if(typeof elOrId==='string'){
    const el=document.getElementById(elOrId);
    src=el?el.dataset.fullsrc||el.src:'';
  }else if(elOrId && elOrId.dataset){
    src=elOrId.dataset.fullsrc||elOrId.src;
  }
  if(src)openLB(src);
}
function openModal(id){document.getElementById(id)?.classList.add('open');}
function closeModal(id){
  if(id==='lightbox-modal'){
    const vid=document.getElementById('lb-video');
    const aud=document.getElementById('lb-audio');
    if(vid){vid.pause();vid.src='';}
    if(aud){aud.pause();aud.src='';}
  }
  if (id === 'story-viewer-modal') {
    clearTimeout(svTimer);
    const vid = document.getElementById('sv-video-player');
    if (vid) {
      vid.pause();
      vid.src = '';
    }
  }
  document.getElementById(id)?.classList.remove('open');
}
document.querySelectorAll('.modal').forEach(m=>m.addEventListener('click',e=>{if(e.target===m)closeModal(m.id);}));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')document.querySelectorAll('.modal.open').forEach(m=>closeModal(m.id));
  if(e.ctrlKey&&e.key==='k'){e.preventDefault();openModal('search-modal');setTimeout(()=>document.getElementById('adv-search-q')?.focus(),100);}
  if(e.ctrlKey&&e.key==='n'){e.preventDefault();document.getElementById('notif-btn')?.click();}
});

// ═══════════════════════════════════════════
//  SEARCH (inline)
// ═══════════════════════════════════════════
let _searchTimer=null;
const _hSearch=document.getElementById('h-search');
if(_hSearch){
  _hSearch.addEventListener('input',function(){
    const q=this.value.trim();
    clearTimeout(_searchTimer);
    if(!q){if(cView==='public'||cView==='search')renderFeed();return;}
    _searchTimer=setTimeout(()=>globalSearch(q),350);
  });
  _hSearch.addEventListener('focus',function(){
    if(this.value.trim()===''){openModal('search-modal');setTimeout(()=>document.getElementById('adv-search-q')?.focus(),80);}
  });
  _hSearch.addEventListener('keydown',e=>{
    if(e.key==='Enter'){e.preventDefault();const q=e.target.value.trim();if(q)globalSearch(q);}
    if(e.key==='Escape'){e.target.value='';if(cView==='public'||cView==='search')renderFeed();}
  });
}

// ═══════════════════════════════════════════
//  MISSING FUNCTIONS
// ═══════════════════════════════════════════
function changeFeedSort(v){cFeedSort=v;renderFeed();}

function renderTrendingHashtags(){
  const c=document.getElementById('trending-hashtags');if(!c)return;
  const cutoff=Date.now()-86400000;
  const recent=posts.filter(p=>p.timestamp>cutoff&&!p.groupId);
  const tagCount={};
  recent.forEach(p=>{
    if(!p.content)return;
    const tags=(p.content.match(/#[a-zA-ZÀ-ÿ0-9_]+/g)||[]);
    tags.forEach(t=>{tagCount[t]=(tagCount[t]||0)+1;});
  });
  const top5=Object.entries(tagCount).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if(!top5.length){c.innerHTML='<p style="padding:9px 11px;font-size:.8rem;color:var(--text2);">Sin tendencias recientes</p>';return;}
  c.innerHTML=top5.map(([tag,count])=>`<div class="gchip" onclick="searchTag('${tag}')">
    <span class="gicon" style="background:rgba(245,158,11,.15);color:var(--orange);"><i class="fas fa-hashtag"></i></span>
    <span style="flex:1;font-size:.83rem;">${esc(tag)}</span>
    <span style="font-size:.7rem;color:var(--text2);">${count}</span>
  </div>`).join('');
}

function initNotifPolling(){
  setInterval(()=>{
    if(!CU)return;
    const unread=notifs.filter(n=>n.userId===CU.id&&!n.read).length;
    if(unread>lastSeenNotifId){playNotifSound();lastSeenNotifId=unread;}
    updateBadges();
  },10000);
}
function initChatPolling(){
  if(chatPollInterval)clearInterval(chatPollInterval);
  let lastChatUnread=messages.filter(m=>m.participants.includes(CU.id)).reduce((a,m)=>a+(m.messages.filter(x=>x.from!==CU.id&&!x.seen).length),0);
  chatPollInterval=setInterval(()=>{
    if(!CU)return;
    const unread=messages.filter(m=>m.participants.includes(CU.id)).reduce((a,m)=>a+(m.messages.filter(x=>x.from!==CU.id&&!x.seen).length),0);
    if(unread>lastChatUnread){playChatSound();}
    lastChatUnread=unread;
    updateBadges();
  },5000);
}
function runScheduledPostsCron(){
  setInterval(()=>{
    if(!CU)return;
    const now=Date.now();
    let changed=false;
    posts.forEach(p=>{
      if(p.status==='scheduled'&&p.scheduledAt&&p.scheduledAt<=now&&p.userId===CU.id){
        p.status='published';p.timestamp=now;changed=true;
        toast(`📅 Post programado publicado: "${(p.content||'').substring(0,30)}..."`, 'success');
      }
    });
    if(changed){save();if(cView==='public')renderFeed();if(cView==='scheduled')renderScheduledPostsPage();}
  },30000);
}
function initEventAlertsCron(){
  setInterval(()=>{
    if(!CU)return;
    const now=Date.now();
    CU.eventReminders = CU.eventReminders || [];
    let changed=false;
    events.forEach(e=>{
      if(CU.eventReminders.includes(e.id)){
        const diff=e.date - now;
        if(diff > 0 && diff <= 15 * 60 * 1000){
          if(!e.notifiedReminder){
            e.notifiedReminder = true;
            toast(`🔔 Recordatorio: Tu evento "${e.title}" comienza pronto!`, 'info');
            playNotifSound();
            addNotif(CU.id, 'event_alert', e.userId, { eventId: e.id, title: e.title });
            changed=true;
          }
        }
      }
    });
    if(changed)save();
  },20000);
}
function renderHeaderAvatar(){
  const img=document.getElementById('h-av');
  const canvas=document.getElementById('h-av-canvas');
  if(!img||!canvas)return;
  if(CU.avatarConfig&&CU.avatarConfig.use3D){
    img.style.display='none';canvas.style.display='block';
    if(window.headerAvatarInstance){window.headerAvatarInstance.stop();window.headerAvatarInstance=null;}
    window.headerAvatarInstance=create3DAvatar('h-av-canvas',CU.avatarConfig);
  }else{
    canvas.style.display='none';
    img.style.display='block';
    img.src=CU.photo||defAv();
  }
  
  // Right drawer avatar sync
  const rdImg=document.getElementById('rd-av');
  const rdCanvas=document.getElementById('rd-av-canvas');
  if(rdImg && rdCanvas){
    if(CU.avatarConfig&&CU.avatarConfig.use3D){
      rdImg.style.display='none';rdCanvas.style.display='block';
      if(window.rdAvatarInstance){window.rdAvatarInstance.stop();window.rdAvatarInstance=null;}
      window.rdAvatarInstance=create3DAvatar('rd-av-canvas',CU.avatarConfig);
    }else{
      rdCanvas.style.display='none';
      rdImg.style.display='block';
      rdImg.src=CU.photo||defAv();
    }
  }
}
function create3DAvatar(canvasId, cfg){
  const canvas=document.getElementById(canvasId);if(!canvas||typeof THREE==='undefined')return null;
  const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});
  const w=canvas.clientWidth||60;const h=canvas.clientHeight||60;
  renderer.setSize(w,h);renderer.setPixelRatio(window.devicePixelRatio||1);
  renderer.setClearColor(0x000000,0);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(50,w/h,0.1,100);
  camera.position.set(0,1.5,4.5);
  const amb=new THREE.AmbientLight(0xffffff,0.7);
  const dir=new THREE.DirectionalLight(0xffffff,0.8);
  dir.position.set(3,5,5);
  scene.add(amb,dir);
  // Body parts
  const skinC=new THREE.Color(cfg.skinColor||'#e0ac69');
  const shirtC=new THREE.Color(cfg.shirtColor||'#3b82f6');
  const pantsC=new THREE.Color(cfg.pantsColor||'#1e3a8a');
  const hatC=new THREE.Color(cfg.hatColor||'#ef4444');
  const mkBox=(w,h,d,col,x,y,z)=>{
    const g=new THREE.BoxGeometry(w,h,d);
    const m=new THREE.MeshLambertMaterial({color:col});
    const mesh=new THREE.Mesh(g,m);
    mesh.position.set(x,y,z);
    return mesh;
  };
  const head=mkBox(1,1,1,skinC,0,2.1,0);
  const torso=mkBox(1.1,1.2,0.6,shirtC,0,0.9,0);
  const lArm=mkBox(0.35,1,0.35,shirtC,-0.75,0.9,0);
  const rArm=mkBox(0.35,1,0.35,shirtC,0.75,0.9,0);
  const lLeg=mkBox(0.45,1,0.45,pantsC,-0.3,-0.3,0);
  const rLeg=mkBox(0.45,1,0.45,pantsC,0.3,-0.3,0);
  scene.add(head,torso,lArm,rArm,lLeg,rLeg);
  if(cfg.hatType&&cfg.hatType!=='none'){
    const hat=mkBox(1.1,0.3,1.1,hatC,0,2.75,0);
    const brim=mkBox(1.5,0.08,1.5,hatC,0,2.58,0);
    scene.add(hat,brim);
  }
  let raf;let angle=0;
  function animate(){
    raf=requestAnimationFrame(animate);
    angle+=0.02;
    scene.rotation.y=angle;
    renderer.render(scene,camera);
  }
  animate();
  return {stop:()=>{cancelAnimationFrame(raf);renderer.dispose();}};
}
function renderScheduledPostsPage(){
  const mc=document.getElementById('content');if(!mc)return;
  const mine=posts.filter(p=>p.status==='scheduled'&&p.userId===CU.id);
  mc.innerHTML=`<div style="margin-bottom:13px;display:flex;align-items:center;gap:9px;">
    <h3 style="font-family:var(--font-head);font-weight:800;"><i class="fas fa-clock" style="color:var(--blue);margin-right:7px;"></i>Posts Programados</h3>
    <span class="tag tag-${mine.length?'orange':'gray'}">${mine.length} pendientes</span>
  </div>
  ${mine.length?mine.map(p=>`<div class="card" style="padding:14px;margin-bottom:12px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:9px;">
      <div style="flex:1;">
        <div style="font-size:.78rem;color:var(--blue);margin-bottom:5px;"><i class="fas fa-clock"></i> Programado para: <strong>${new Date(p.scheduledAt||0).toLocaleString('es-ES')}</strong></div>
        <div style="font-size:.88rem;line-height:1.5;">${esc((p.content||'').substring(0,200))}</div>
        ${p.media?`<div style="margin-top:8px;"><img src="${p.media}" style="max-height:80px;border-radius:var(--r-md);" loading="lazy"></div>`:''}
      </div>
      <button class="btn btn-danger" onclick="deleteScheduled(${p.id})"><i class="fas fa-trash"></i></button>
    </div>
  </div>`).join(''):`<div class="card">${empty('fas fa-clock','No hay posts programados.')}</div>`}`;
}
function deleteScheduled(pid){
  if(!confirm('¿Cancelar este post programado?'))return;
  posts=posts.filter(p=>p.id!==pid);save();renderScheduledPostsPage();toast('Post cancelado','info');
}
function openSharePost(pId){
  const inp=document.getElementById('share-link-input');
  if(inp)inp.value=`https://serakdep.ms/post/${pId}`;
  openModal('share-modal');
}
function copyShareLink(){
  const inp=document.getElementById('share-link-input');if(!inp)return;
  navigator.clipboard.writeText(inp.value).then(()=>toast('Enlace copiado al portapapeles 📋','success')).catch(()=>{inp.select();document.execCommand('copy');toast('Enlace copiado 📋','success');});
}
function switchGifTab(tab){
  currentGifTab=tab;
  document.getElementById('gt-gifs')?.classList.toggle('active',tab==='gifs');
  document.getElementById('gt-stickers')?.classList.toggle('active',tab==='stickers');
  const grid=document.getElementById('gif-selector-grid');if(!grid)return;
  const items=tab==='gifs'?LOCAL_GIFS:LOCAL_STICKERS;
  grid.innerHTML=items.map(url=>`<img src="${url}" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--r-sm);cursor:pointer;transition:.15s;" onclick="selectGifSticker('${url}')" loading="lazy" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">`).join('');
}
function openGifModal(ctx){
  pendingGifCtx=ctx;currentGifTab='gifs';
  document.getElementById('gt-gifs')?.classList.add('active');
  document.getElementById('gt-stickers')?.classList.remove('active');
  switchGifTab('gifs');
  openModal('gif-modal');
}
function selectGifSticker(url){
  compMedia[pendingGifCtx]={data:url,type:'image'};
  const inner=document.getElementById(`cpi-${pendingGifCtx}`);
  if(inner)inner.innerHTML=`<img src="${url}" style="max-height:180px;border-radius:var(--r-md);max-width:100%;" loading="lazy">`;
  const strip=document.getElementById(`cp-${pendingGifCtx}`);
  if(strip)strip.style.display='block';
  closeModal('gif-modal');
}
function setRatingVal(v){
  selectedRatingValue=v;
  document.querySelectorAll('.star-btn').forEach((s,i)=>{
    s.className='fas fa-star star-btn'+(i<v?' checked':'');
    s.style.color=i<v?'var(--orange)':'var(--border)';
  });
}
function openRateSellerModal(sellerId, productId){
  pendingRateSellerId=sellerId;
  pendingRateProductId=productId||null;
  selectedRatingValue=5;
  // Reset stars
  document.querySelectorAll('.star-btn').forEach((s,i)=>{
    s.className='fas fa-star star-btn';
    s.style.color=i<5?'var(--orange)':'var(--border)';
  });
  const comment=document.getElementById('rate-seller-comment');
  if(comment)comment.value='';
  const prompt=document.getElementById('rate-seller-prompt');
  const u=users.find(x=>x.id===sellerId);
  if(prompt)prompt.textContent=`Califica tu experiencia con ${u?.username||'el vendedor'}:`;
  openModal('rate-seller-modal');
}
function submitSellerRating(){
  const sid=pendingRateSellerId;const pid=pendingRateProductId;
  if(!sid)return;
  const u=users.find(x=>x.id===sid);if(!u)return;
  u.ratings=u.ratings||[];
  const comment=document.getElementById('rate-seller-comment')?.value.trim()||'';
  u.ratings.push({from:CU.id,stars:selectedRatingValue,comment,timestamp:Date.now(),productId:pid});
  save();closeModal('rate-seller-modal');
  toast(`Calificación enviada: ${selectedRatingValue}⭐`,'success');
}
function getSellerRating(uid){
  const u=users.find(x=>x.id===uid);if(!u||!u.ratings?.length)return null;
  const avg=u.ratings.reduce((a,r)=>a+r.stars,0)/u.ratings.length;
  return {avg:avg.toFixed(1),count:u.ratings.length};
}
function toggleMuteUser(uid){
  const ux=users.find(u=>u.id===CU.id);if(!ux)return;
  ux.mutedUsers=ux.mutedUsers||[];CU.mutedUsers=ux.mutedUsers;
  if(ux.mutedUsers.includes(uid)){ux.mutedUsers=ux.mutedUsers.filter(id=>id!==uid);CU.mutedUsers=ux.mutedUsers;toast('Usuario dessilenciado','info');}
  else{ux.mutedUsers.push(uid);CU.mutedUsers=ux.mutedUsers;toast('Usuario silenciado. Sus posts no aparecerán en tu feed.','info');}
  save();
  const pm=document.getElementById('profile-modal');
  if(pm&&pm.classList.contains('open'))openProfileModal(uid);
  if(cView==='public')renderFeed();
}
function toggleDND(on){
  localStorage.setItem('sms_dnd',on?'1':'0');
  toast(on?'🔕 Modo No Molestar activado':'🔔 Modo No Molestar desactivado','info');
}

// Mention autocomplete
function initMentionAutocomplete(inputId, ctx){
  const inp=document.getElementById(inputId);if(!inp)return;
  inp.addEventListener('input',function(){
    const val=this.value;const pos=this.selectionStart;
    const before=val.substring(0,pos);
    const match=before.match(/@([a-zA-Z0-9_]*)$/);
    removeMentionBox();
    if(!match)return;
    const q=match[1].toLowerCase();
    const suggestions=users.filter(u=>u.id!==CU.id&&u.username.toLowerCase().startsWith(q)).slice(0,5);
    if(!suggestions.length)return;
    const box=document.createElement('div');
    box.className='mention-suggestions';box.id='mention-box';
    box.style.cssText='position:fixed;z-index:9000;max-width:220px;width:220px;';
    box.innerHTML=suggestions.map(u=>`<div class="mention-item" data-name="${u.username}"><img src="${u.photo||defAv()}" alt="" loading="lazy">${esc(u.username)}</div>`).join('');
    const rect=inp.getBoundingClientRect();
    box.style.left=rect.left+'px';box.style.top=(rect.top-suggestions.length*40)+'px';
    document.body.appendChild(box);
    activeMentionBox=box;activeMentionInput=inp;
    box.querySelectorAll('.mention-item').forEach(item=>{
      item.addEventListener('click',()=>{
        const name=item.dataset.name;
        const curVal=inp.value;const curPos=inp.selectionStart;
        const before2=curVal.substring(0,curPos);
        const after2=curVal.substring(curPos);
        const newBefore=before2.replace(/@[a-zA-Z0-9_]*$/,'@'+name+' ');
        inp.value=newBefore+after2;
        inp.setSelectionRange(newBefore.length,newBefore.length);
        removeMentionBox();
        inp.focus();
      });
    });
  });
  inp.addEventListener('keydown',e=>{
    if(e.key==='Escape')removeMentionBox();
  });
}
function removeMentionBox(){
  const box=document.getElementById('mention-box');
  if(box)box.remove();activeMentionBox=null;activeMentionInput=null;
}
document.addEventListener('click',e=>{
  if(activeMentionBox&&!activeMentionBox.contains(e.target)&&e.target!==activeMentionInput)removeMentionBox();
});

// ═══════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
//  MSG REACTIONS + REPLY + DELETE
// ═══════════════════════════════════════════
let _msgReplyTo=null;
function addMsgRxn(e,uid,ts,emoji){
  e.stopPropagation();
  let conv=messages.find(m=>m.participants.includes(CU.id)&&m.participants.includes(uid));
  if(!conv)return;
  const msg=conv.messages.find(m=>m.timestamp===ts);if(!msg)return;
  msg.reactions=msg.reactions||{};
  const prev=msg.reactions[emoji]||[];
  if(prev.includes(CU.id)){msg.reactions[emoji]=prev.filter(id=>id!==CU.id);if(!msg.reactions[emoji].length)delete msg.reactions[emoji];}
  else{msg.reactions[emoji]=[...(msg.reactions[emoji]||[]),CU.id];}
  save();renderChatArea(conv);
}
function setMsgReply(uid,ts,preview,name){
  _msgReplyTo={uid,ts,preview,name};
  const bar=document.getElementById('chat-reply-bar');
  if(bar){bar.style.display='flex';document.getElementById('crb-name').textContent=name;document.getElementById('crb-preview').textContent=preview;}
  document.getElementById('chat-inp')?.focus();
}
function clearMsgReply(){
  _msgReplyTo=null;
  const bar=document.getElementById('chat-reply-bar');
  if(bar)bar.style.display='none';
}
function deleteMsgBubble(uid,ts){
  let conv=messages.find(m=>m.participants.includes(CU.id)&&m.participants.includes(uid));
  if(!conv)return;
  conv.messages=conv.messages.filter(m=>m.timestamp!==ts);
  save();renderChatArea(conv);
}

// ═══════════════════════════════════════════
//  CHAT SEARCH (búsqueda en conversación)
// ═══════════════════════════════════════════
let _chatSearchResults=[];
let _chatSearchIdx=0;
function toggleChatSearch(uid){
  const bar=document.getElementById('chat-search-bar');
  if(!bar)return;
  if(bar.style.display==='none'||!bar.style.display){bar.style.display='flex';document.getElementById('chat-search-inp')?.focus();}
  else closeChatSearch();
}
function closeChatSearch(){
  const bar=document.getElementById('chat-search-bar');if(bar)bar.style.display='none';
  document.querySelectorAll('.chat-highlight').forEach(el=>el.classList.remove('chat-highlight','chat-highlight-active'));
  _chatSearchResults=[];_chatSearchIdx=0;
}
function searchInChat(uid,q){
  document.querySelectorAll('.chat-highlight').forEach(el=>el.classList.remove('chat-highlight','chat-highlight-active'));
  _chatSearchResults=[];_chatSearchIdx=0;
  if(!q.trim()){document.getElementById('chat-search-info').textContent='';return;}
  const bubbles=document.querySelectorAll('#chat-area .bubble');
  bubbles.forEach(b=>{if(b.textContent.toLowerCase().includes(q.toLowerCase()))_chatSearchResults.push(b);});
  _chatSearchResults.forEach(b=>b.classList.add('chat-highlight'));
  const info=document.getElementById('chat-search-info');
  if(_chatSearchResults.length){info.textContent=`1/${_chatSearchResults.length}`;_chatSearchResults[0].classList.add('chat-highlight-active');_chatSearchResults[0].scrollIntoView({behavior:'smooth',block:'center'});}
  else info.textContent='Sin resultados';
}
function navChatResult(dir){
  if(!_chatSearchResults.length)return;
  _chatSearchResults[_chatSearchIdx].classList.remove('chat-highlight-active');
  _chatSearchIdx=(_chatSearchIdx+dir+_chatSearchResults.length)%_chatSearchResults.length;
  _chatSearchResults[_chatSearchIdx].classList.add('chat-highlight-active');
  _chatSearchResults[_chatSearchIdx].scrollIntoView({behavior:'smooth',block:'center'});
  document.getElementById('chat-search-info').textContent=`${_chatSearchIdx+1}/${_chatSearchResults.length}`;
}

// ═══════════════════════════════════════════
//  POST - WHO LIKED
// ═══════════════════════════════════════════
function showWhoLiked(pid){
  const p=posts.find(x=>x.id===pid);if(!p)return;
  const rxns=p.reactions||{};
  const likers=Object.entries(rxns).flatMap(([uid,r])=>{const u=users.find(x=>x.id===parseInt(uid));return u?[{user:u,rxn:r}]:[];});
  if(!likers.length){toast('Nadie ha reaccionado aún','info');return;}
  const list=likers.map(({user:u,rxn})=>`<div class="list-row"><img src="${u.photo||defAv()}" class="lav" alt=""><div class="lname">${esc(u.username)}</div><span style="font-size:1.1rem;">${rxnIco(rxn)}</span></div>`).join('');
  const box=document.getElementById('modal-liked-list');
  if(box)box.innerHTML=list;
  openModal('liked-modal');
}

// ═══════════════════════════════════════════
//  MARKETPLACE FILTERS
// ═══════════════════════════════════════════
let mktFilter={category:'all',maxPrice:'',sold:'all',search:''};
function renderMarketplaceFiltered(){
  let items=[...products];
  if(mktFilter.category!=='all')items=items.filter(p=>p.category===mktFilter.category);
  if(mktFilter.sold==='active')items=items.filter(p=>!p.sold);
  if(mktFilter.sold==='sold')items=items.filter(p=>p.sold);
  if(mktFilter.maxPrice)items=items.filter(p=>parseFloat(p.price)<=parseFloat(mktFilter.maxPrice));
  if(mktFilter.search)items=items.filter(p=>p.title.toLowerCase().includes(mktFilter.search)||p.description?.toLowerCase().includes(mktFilter.search));
  const grid=document.getElementById('mkt-grid');
  if(grid)grid.innerHTML=items.length?items.map(productCard).join(''):`<div style="grid-column:1/-1;">${empty('fas fa-store','Sin productos con esos filtros.')}</div>`;
}
function setMktFilter(key,val){mktFilter[key]=val;renderMarketplaceFiltered();}

// ═══════════════════════════════════════════
//  GLOBAL SEARCH (users + posts + groups)
// ═══════════════════════════════════════════
function globalSearch(q){
  if(!q||q.length<2)return;
  const ql=q.toLowerCase();
  const bl=CU.blocked||[];
  const foundUsers=users.filter(u=>u.id!==CU.id&&!u.deactivated&&u.username.toLowerCase().includes(ql)).slice(0,5);
  const foundPosts=posts.filter(p=>!p.groupId&&p.content?.toLowerCase().includes(ql)&&!bl.includes(p.userId)).slice(0,5);
  const foundGroups=groups.filter(g=>g.name.toLowerCase().includes(ql)).slice(0,4);
  const mc=document.getElementById('content');
  cView='search';document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  mc.innerHTML=`<div style="margin-bottom:13px;display:flex;align-items:center;gap:9px;"><button class="btn btn-ghost" onclick="navigate('public')"><i class="fas fa-arrow-left"></i> Volver</button><h3 style="font-family:var(--font-head);font-weight:800;">Resultados para "${esc(q)}"</h3></div>
    ${foundUsers.length?`<div class="gsearch-section"><h4><i class="fas fa-users"></i> Personas</h4><div class="card" style="padding:10px;">${foundUsers.map(u=>`<div class="list-row" onclick="navigate('profile',${u.id})" style="cursor:pointer;"><img src="${u.photo||defAv()}" class="lav" alt=""><div><div class="lname">${esc(u.username)}</div><div style="font-size:.73rem;color:var(--text2);">${esc(u.role||'Miembro')}</div></div><button class="btn btn-ghost" style="font-size:.74rem;padding:4px 11px;margin-left:auto;" onclick="event.stopPropagation();toggleFollow(${u.id})">${(CU.following||[]).includes(u.id)?'Siguiendo':'Seguir'}</button></div>`).join('')}</div></div>`:''}
    ${foundGroups.length?`<div class="gsearch-section"><h4><i class="fas fa-users-rectangle"></i> Grupos</h4><div class="card" style="padding:10px;">${foundGroups.map(g=>`<div class="gchip" onclick="navigate('groups',${g.id})"><span class="gicon"><i class="fas fa-users"></i></span>${esc(g.name)}<span class="tag tag-gray" style="margin-left:auto;">${g.members.length} miembros</span></div>`).join('')}</div></div>`:''}
    ${foundPosts.length?`<div class="gsearch-section"><h4><i class="fas fa-file-alt"></i> Publicaciones</h4><div id="search-posts-list">${foundPosts.map(postCard).join('')}</div></div>`:''}
    ${!foundUsers.length&&!foundPosts.length&&!foundGroups.length?`<div class="card">${empty('fas fa-search','Sin resultados para "'+esc(q)+'"')}</div>`:''}`;
}

// ═══════════════════════════════════════════
//  NOTIFICATION FILTERS + MARK ALL READ
// ═══════════════════════════════════════════
let nFilter='all';
function renderNotifsFiltered(){
  const panel=document.getElementById('notif-panel');if(!panel)return;
  const myN=[...(CU.notifications||[])].reverse();
  const typeMap={message:'Mensajes',follow:'Seguidores',reaction:'Reacciones',comment:'Comentarios',mention:'Menciones',birthday:'Cumpleaños'};
  const filtered=nFilter==='all'?myN:myN.filter(n=>n.type===nFilter);
  const nHtml=filtered.length?filtered.map(n=>{
    const from=users.find(u=>u.id===n.fromId);
    const ic={message:'fas fa-comment',follow:'fas fa-user-plus',reaction:'fas fa-heart',comment:'fas fa-comments',mention:'fas fa-at',birthday:'fas fa-birthday-cake',interested:'fas fa-heart',seller_rate:'fas fa-star',event_alert:'fas fa-calendar-check',badge:'fas fa-medal',group_request:'fas fa-user-clock',group_accepted:'fas fa-check-circle',cmt_like:'fas fa-heart',cmt_reply:'fas fa-reply',repost:'fas fa-retweet'}[n.type]||'fas fa-bell';
    const txt={message:`${esc(from?.username||'?')} te envió un mensaje`,follow:`${esc(from?.username||'?')} empezó a seguirte`,reaction:`${esc(from?.username||'?')} reaccionó a tu post`,comment:`${esc(from?.username||'?')} comentó tu post`,mention:`${esc(from?.username||'?')} te mencionó`,birthday:'¡Es tu cumpleaños! 🎂',interested:`${esc(from?.username||'?')} tiene interés en tu producto`,seller_rate:`${esc(from?.username||'?')} quiere calificarte`,event_alert:`Recordatorio: "${n.title||'evento'}" comienza pronto`,badge:`🏅 Insignia desbloqueada: ${BADGES_DEF.find(b=>b.id===n.badgeId)?.label||n.badgeId||'nueva insignia'}`,group_request:`${esc(from?.username||'?')} solicita unirse a tu grupo`,group_accepted:`Tu solicitud para unirte al grupo fue aceptada`,cmt_like:`${esc(from?.username||'?')} le gustó tu comentario`,cmt_reply:`${esc(from?.username||'?')} respondió a tu comentario`,repost:`${esc(from?.username||'?')} reposteó tu publicación`}[n.type]||n.type;
    const actionBtn = n.type==='seller_rate'
      ? `<button class="btn btn-primary" style="padding:4px 10px;font-size:.72rem;flex-shrink:0;" onclick="openRateSellerModal(${n.sellerId||n.fromId},${n.prodId||'null'});markNotifRead(${n.id});closeModal('notif-modal')">Calificar</button>`
      : n.type==='message'
      ? `<button class="btn btn-ghost" style="padding:4px 10px;font-size:.72rem;flex-shrink:0;" onclick="navigate('messages');setTimeout(()=>openChat(${n.fromId}),300);closeModal('notif-modal')">Ver</button>`
      : n.type==='follow'
      ? `<button class="btn btn-ghost" style="padding:4px 10px;font-size:.72rem;flex-shrink:0;" onclick="openProfileModal(${n.fromId})">Ver perfil</button>`
      : n.type==='group_request'&&n.gid
      ? `<button class="btn btn-primary" style="padding:4px 10px;font-size:.72rem;flex-shrink:0;" onclick="acceptReq(${n.gid},${n.fromId});markNotifRead(${n.id})">Aceptar</button>`
      : '';
    return `<div class="notif-item ${n.read?'':'unread'}" onclick="markNotifRead(${n.id})">
      <span class="nicon"><i class="${ic}"></i></span>
      <div style="flex:1;"><div style="font-size:.84rem;">${txt}</div><div style="font-size:.73rem;color:var(--text2);">${timeAgo(n.timestamp)}</div></div>
      ${actionBtn}
      ${!n.read&&!actionBtn?`<span style="width:8px;height:8px;border-radius:50%;background:var(--green);display:inline-block;flex-shrink:0;"></span>`:''}
    </div>`;}).join(''):`<div class="empty"><i class="fas fa-bell-slash"></i><p>Sin notificaciones${nFilter!=='all'?' de este tipo':''}</p></div>`;

  const types=['all','message','follow','reaction','comment'];
  const filterBar=`<div class="notif-filter-bar">
    ${types.map(t=>`<button class="nf-btn ${nFilter===t?'active':''}" onclick="setNFilter('${t}')">${t==='all'?'Todas':typeMap[t]||t}</button>`).join('')}
    <button class="nf-btn" style="margin-left:auto;" onclick="markAllNotifsRead()"><i class="fas fa-check-double"></i> Leer todo</button>
  </div>`;
  panel.innerHTML=filterBar+nHtml;
}
function setNFilter(t){nFilter=t;renderNotifsFiltered();}
function markNotifRead(id){
  const n=(CU.notifications||[]).find(x=>x.id===id);
  if(n)n.read=true;
  const gn=notifs.find(x=>x.id===id);
  if(gn)gn.read=true;
  save();renderNotifsFiltered();updateNotifBadge();
}
function markAllNotifsRead(){
  (CU.notifications||[]).forEach(n=>{
    n.read=true;
    const gn=notifs.find(x=>x.id===n.id);
    if(gn)gn.read=true;
  });
  save();renderNotifsFiltered();updateNotifBadge();
  toast('Todas las notificaciones marcadas como leídas','success');
}
function updateNotifBadge(){
  const unread=(CU.notifications||[]).filter(n=>!n.read).length;
  const b=document.getElementById('notif-badge');
  if(b){b.style.display=unread?'block':'none';b.textContent=unread>9?'9+':unread;}
}

// ═══════════════════════════════════════════
//  PROFILE - SOCIAL LINKS + STATS
// ═══════════════════════════════════════════
function saveSocialLinks(){
  const ux=users.find(u=>u.id===CU.id);if(!ux)return;
  ux.socialLinks=CU.socialLinks={
    instagram:document.getElementById('sl-ig')?.value.trim()||'',
    discord:document.getElementById('sl-dc')?.value.trim()||'',
    twitter:document.getElementById('sl-tw')?.value.trim()||'',
    youtube:document.getElementById('sl-yt')?.value.trim()||''
  };
  save();closeModal('social-links-modal');toast('Redes sociales guardadas ✅','success');
  if(cView==='profile')renderProfilePage(CU.id);
}

// ═══════════════════════════════════════════
//  COMPACT MODE
// ═══════════════════════════════════════════
function toggleCompactMode(on){
  document.body.classList.toggle('compact-mode',on);
  localStorage.setItem('sms_compact',on?'1':'0');
}

// ═══════════════════════════════════════════
//  KEYBOARD SHORTCUT EXTRAS
// ═══════════════════════════════════════════
let _gSeq='';
document.addEventListener('keydown',e=>{
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
  if(e.ctrlKey&&e.key==='p'){e.preventDefault();document.querySelector('.comp-trigger')?.click();return;}
  if(e.altKey&&e.key==='d'){e.preventDefault();const cb=document.querySelector('.dark-toggle-cb');if(cb){cb.checked=!cb.checked;setTheme(cb.checked);}return;}
  if(e.key==='?'){openModal('kbd-modal');return;}
  _gSeq+=e.key.toLowerCase();
  setTimeout(()=>_gSeq='',800);
  if(_gSeq.endsWith('gf')){navigate('public');_gSeq='';}
  if(_gSeq.endsWith('gm')){navigate('messages');_gSeq='';}
});


function openSocialLinksModal(){
  const sl=CU.socialLinks||{};
  const ig=document.getElementById('sl-ig');const dc=document.getElementById('sl-dc');
  const tw=document.getElementById('sl-tw');const yt=document.getElementById('sl-yt');
  if(ig)ig.value=sl.instagram||'';if(dc)dc.value=sl.discord||'';
  if(tw)tw.value=sl.twitter||'';if(yt)yt.value=sl.youtube||'';
  openModal('social-links-modal');
}


function shareEventToFeed(id){
  const e=events.find(x=>x.id===id);if(!e)return;
  const d=new Date(e.date);
  const content=`📅 Evento: ${e.title}\n${e.description?e.description+'\n':''}🗓️ ${d.toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})}${e.location?' | 📍 '+e.location:''}`;
  const p={id:ids.np++,userId:CU.id,content,timestamp:Date.now(),reactions:{},comments:[],savedBy:[],privacy:'public',reposts:[],groupId:null,mediaType:null,media:null};
  posts.unshift(p);save();navigate('public');toast('Evento compartido en el foro ✅','success');logActivity('post','Compartió un evento');
}

loadData();

// ═══════════════════════════════════════════
//  GLOBAL THEME INIT (runs on every page)
// ═══════════════════════════════════════════
function applyGlobalTheme(){
  // 1. Apply dark/light mode to body
  const dark = localStorage.getItem('sms_theme') === 'dark';
  document.body.classList.toggle('dark', dark);

  // 2. Apply saved color theme
  const color = localStorage.getItem('sms_color') || 'green';
  applyColor(color, false);

  // 3. Update theme-btn icon if present (dashboard only)
  const themeBtn = document.getElementById('theme-btn');
  if(themeBtn){
    themeBtn.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
  const rdIcon = document.querySelector('#rd-theme-btn .rd-icon');
  const rdText = document.getElementById('rd-theme-text');
  if(rdIcon) rdIcon.innerHTML = dark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  if(rdText) rdText.textContent = dark ? 'Tema claro' : 'Tema oscuro';
}
applyGlobalTheme();

// ═══════════════════════════════════════════
//  SESSION ROUTING (Multi-page)
// ═══════════════════════════════════════════
(function initSession(){
  const stored = localStorage.getItem('sms_currentUser');
  const isDashboard = window.location.pathname.toLowerCase().includes('dashboard');
  const isIndex = !isDashboard;

  if(isDashboard){
    // On dashboard.html — require login
    if(!stored){
      window.location.href = 'index.html';
      return;
    }
    try {
      CU = JSON.parse(stored);
      // Re-sync user from users array (may have updated data)
      const freshUser = users.find(u => u.id === CU.id);
      if(freshUser) CU = {...freshUser};
      launch();
    } catch(e) {
      localStorage.removeItem('sms_currentUser');
      window.location.href = 'index.html';
    }
  } else {
    // On index.html — if already logged in, go to dashboard
    if(stored){
      window.location.href = 'dashboard.html';
    }
  }
})();


  (function() {
    // Cerrar ambos drawers al inicio
    function closeAllDrawers() {
      const left = document.getElementById('sidebar');
      const right = document.getElementById('right-drawer');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (left) left.classList.remove('active');
      if (right) right.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
      document.body.classList.remove('noscroll');
    }
    closeAllDrawers();

    // Configurar eventos de los botones hamburguesa (por si no están enlazados)
    const leftBtn = document.getElementById('mobile-left-toggle');
    const rightBtn = document.getElementById('mobile-right-toggle');
    if (leftBtn && typeof toggleMobileSidebar === 'function') {
      leftBtn.onclick = toggleMobileSidebar;
    }
    if (rightBtn && typeof toggleRightDrawer === 'function') {
      rightBtn.onclick = toggleRightDrawer;
    }

    // También asegurar que el backdrop cierre todo al hacer clic
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop && typeof closeAllDrawers === 'function') {
      backdrop.onclick = closeAllDrawers;
    } else if (backdrop) {
      backdrop.onclick = function() { closeAllDrawers(); };
    }

    // Si existe closeAllDrawers global, asegurar que esté disponible
    window.closeAllDrawers = closeAllDrawers;
  })();

// Ajustar vista de mensajes al cambiar orientación/tamaño
window.addEventListener('resize',()=>{
  const layout=document.getElementById('msg-layout');
  if(!layout)return;
  if(window.innerWidth>780){
    // En escritorio, quitar la clase para restaurar el grid original
    layout.classList.remove('chat-open');
  }
});
// Ajustar vista de configuración al cambiar orientación/tamaño
window.addEventListener('resize',()=>{
  const layout=document.getElementById('settings-layout');
  if(!layout)return;
  if(window.innerWidth>780){
    layout.classList.remove('settings-open');
    const btn=document.getElementById('btn-back-settings-el');
    if(btn)btn.remove();
  }
});



// ═══════════════════════════════════════════
//  NEW FEATURES STATE
// ═══════════════════════════════════════════
let channels = [];
let channelMessages = {};
let activeChannelId = null;
let userStatuses = {};
let groupChats = [];
let watchVideos = [];
let idsCh = {nc:1, ngc:1, nwv:1};

// Init from localStorage
(function initNewState(){
  try{
    const s = localStorage.getItem('sms_newstate');
    if(s){
      const d = JSON.parse(s);
      channels = d.channels||[];
      channelMessages = d.channelMessages||{};
      userStatuses = d.userStatuses||{};
      groupChats = d.groupChats||[];
      watchVideos = d.watchVideos||[];
      idsCh = d.idsCh||{nc:1,ngc:1,nwv:1};
    }
  }catch(e){}
  // seed demo channels if empty
  if(!channels.length){
    channels=[
      {id:1,name:'general',type:'text',desc:'Canal principal de la comunidad',access:'public',createdBy:0,pinned:[],slowMode:0},
      {id:2,name:'anuncios',type:'announce',desc:'Anuncios oficiales',access:'public',createdBy:0,pinned:[]},
      {id:3,name:'media',type:'media',desc:'Comparte fotos y videos',access:'public',createdBy:0,pinned:[]},
    ];
    channelMessages={1:[],2:[],3:[]};
    idsCh.nc=5;
  }
})();

function saveNewState(){
  try{
    localStorage.setItem('sms_newstate',JSON.stringify({channels,channelMessages,userStatuses,groupChats,watchVideos,idsCh}));
  }catch(e){}
}

// ═══════════════════════════════════════════
//  USER STATUS
// ═══════════════════════════════════════════
function setUserStatus(label, type){
  const ux = users.find(u=>u.id===CU.id);
  if(ux){ ux.statusLabel=label; ux.statusType=type; CU.statusLabel=label; CU.statusType=type; }
  userStatuses[CU.id]={label,type,ts:Date.now()};
  saveNewState(); save();
  closeModal('status-modal');
  renderSidebar();
  toast('Estado actualizado ✅','success');
}
function setCustomStatus(){
  const v = document.getElementById('custom-status-inp')?.value.trim();
  if(!v)return;
  setUserStatus('✏️ '+v,'custom');
}
function getStatusDot(uid){
  const s = userStatuses[uid]||{};
  const t = s.type||'offline';
  return `<span class="friend-status-dot ${t}" title="${s.label||''}"></span>`;
}
function getStatusLabel(uid){
  const s = userStatuses[uid]||{};
  return s.label||'';
}

// ═══════════════════════════════════════════
//  CHANNELS (Discord-style)
// ═══════════════════════════════════════════
function renderChannelsPage(){
  const mc = document.getElementById('content');
  if(!activeChannelId && channels.length){ activeChannelId = channels.find(c=>c.type!=='voice')?.id || channels[0]?.id; }
  const textChannels = channels.filter(c=>c.type!=='voice');
  const isPriv = PRIVILEGED.includes(CU.role||'');

  mc.innerHTML = `<div class="channels-layout" id="channels-layout">
    <div class="ch-sidebar" id="ch-sidebar">
      <div class="ch-server-hd">
        <span>🌿 Serakdep</span>
        ${isPriv?`<button class="btn-icon" style="width:28px;height:28px;font-size:.8rem;" onclick="openModal('channel-create-modal')" title="Crear canal"><i class="fas fa-plus"></i></button>`:''}
      </div>
      <div class="ch-list">
        <div class="ch-category"><i class="fas fa-chevron-down" style="font-size:.6rem;"></i> CANALES DE TEXTO</div>
        ${textChannels.map(ch=>`
          <div class="ch-item ${ch.id===activeChannelId?'active':''}" onclick="switchChannel(${ch.id})">
            <i class="fas ${ch.type==='announce'?'fa-bullhorn':ch.type==='media'?'fa-image':'fa-hashtag'}" style="font-size:.8rem;opacity:.7;width:14px;"></i>
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(ch.name)}</span>
            ${(channelMessages[ch.id]||[]).filter(m=>!m.readBy?.includes(CU.id)&&m.from!==CU.id).length>0?`<span class="ch-badge">${(channelMessages[ch.id]||[]).filter(m=>!m.readBy?.includes(CU.id)&&m.from!==CU.id).length}</span>`:''}
          </div>
        `).join('')}
      </div>
      <div style="padding:10px 12px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;background:var(--bg);">
        <img src="${CU.photo||defAv()}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;flex-shrink:0;">
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:.8rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(CU.username)}</div>
          <div style="font-size:.68rem;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${getStatusLabel(CU.id)||'#'+CU.id}</div>
        </div>
        <button class="btn-icon" style="width:26px;height:26px;font-size:.75rem;" onclick="openModal('status-modal')" title="Cambiar estado"><i class="fas fa-circle-dot"></i></button>
      </div>
    </div>
    <div class="ch-content" id="ch-content">
      ${renderChannelContent(activeChannelId)}
    </div>
  </div>`;
}
function renderChannelContent(chId){
  const ch = channels.find(c=>c.id===chId);
  if(!ch) return `<div class="empty" style="margin:auto;"><i class="fas fa-hashtag"></i><p>Selecciona un canal</p></div>`;
  const msgs = channelMessages[chId]||[];
  const isPriv = PRIVILEGED.includes(CU.role||'');
  // Mark as read
  msgs.forEach(m=>{ m.readBy=m.readBy||[]; if(!m.readBy.includes(CU.id)) m.readBy.push(CU.id); });
  saveNewState();

  return `
    <div class="ch-header">
      <button class="mobile-menu-btn" style="display:none;" id="ch-menu-btn" onclick="document.getElementById('ch-sidebar').classList.toggle('ch-open')"><i class="fas fa-bars"></i></button>
      <div class="ch-header-name"><i class="fas ${ch.type==='announce'?'fa-bullhorn':ch.type==='media'?'fa-image':'fa-hashtag'}" style="color:var(--text2);font-size:.9rem;"></i>${esc(ch.name)}</div>
      <div class="ch-header-desc">${ch.desc?'· '+esc(ch.desc):''}</div>
      <div style="margin-left:auto;display:flex;gap:6px;">
        <button class="btn-icon" style="width:30px;height:30px;" onclick="showChannelMembers(${chId})" title="Miembros"><i class="fas fa-users"></i></button>
        ${isPriv?`<button class="btn-icon" style="width:30px;height:30px;" onclick="editChannel(${chId})" title="Editar canal"><i class="fas fa-gear"></i></button>`:''}
      </div>
    </div>
    <div class="ch-messages" id="ch-msgs-${chId}">
      ${msgs.length?renderChannelMsgs(msgs,chId):
        `<div class="empty" style="margin:auto;"><i class="fas fa-hashtag" style="font-size:2.5rem;"></i><p>¡Sé el primero en escribir en <strong>#${esc(ch.name)}</strong>!</p></div>`}
    </div>
    <div class="ch-input-area">
      ${ch.type==='announce'&&!isPriv?
        `<div style="text-align:center;color:var(--text2);font-size:.82rem;padding:8px;"><i class="fas fa-lock"></i> Solo moderadores pueden publicar aquí</div>`:
        `<div style="margin-bottom:7px;" id="ch-reply-bar-${chId}" style="display:none;"></div>
        <div class="ch-input-row">
          <button class="btn-icon" style="width:28px;height:28px;flex-shrink:0;" onclick="triggerChFileUpload(${chId})" title="Adjuntar archivo"><i class="fas fa-paperclip"></i></button>
          <input type="text" id="ch-inp-${chId}" placeholder="Mensaje en #${esc(ch.name)}..." onkeypress="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChannelMsg(${chId});}">
          <div class="ch-input-btns">
            <button class="btn-icon" style="width:28px;height:28px;" onclick="insertChEmoji(${chId})" title="Emoji"><i class="fas fa-face-smile"></i></button>
            <button class="btn-icon" style="width:28px;height:28px;background:var(--green);color:#fff;" onclick="sendChannelMsg(${chId})"><i class="fas fa-paper-plane"></i></button>
          </div>
        </div>
        <input type="file" id="ch-file-${chId}" style="display:none;" onchange="handleChFile(${chId},this)">`
      }
    </div>`;
}

function renderChannelMsgs(msgs, chId){
  return msgs.map((m,i)=>{
    const u = users.find(x=>x.id===m.from);
    const prev = msgs[i-1];
    const grouped = prev && prev.from===m.from && (m.ts-prev.ts)<300000;
    const rxns = m.reactions||{};
    const rxnHtml = Object.entries(rxns).length?`<div class="ch-msg-rxns">${Object.entries(rxns).map(([e,uids])=>`<button class="ch-rxn-btn ${uids.includes(CU.id)?'mine':''}" onclick="addChMsgRxn(${chId},${m.ts},'${e}')">${e} ${uids.length}</button>`).join('')}</div>`:'';
    let mediaHtml='';
    if(m.media){
      if(m.media.type==='image') mediaHtml=`<img src="${m.media.data}" class="chat-media-img" onclick="openMediaLB(this,'image')" alt="">`;
      else if(m.media.type==='video') mediaHtml=`<div class="chat-media-video-wrap"><video src="${m.media.data}" class="chat-media-video" preload="metadata"></video><button class="chat-media-play-btn" onclick="openMediaLB(this.previousElementSibling,'video')"><i class="fas fa-play"></i></button></div>`;
    }
    const replyHtml = m.replyTo?(()=>{
      const orig = msgs.find(x=>x.ts===m.replyTo);
      return orig?`<div style="border-left:3px solid var(--green);padding:2px 8px;margin-bottom:3px;font-size:.76rem;color:var(--text2);border-radius:3px;background:var(--input-bg);cursor:pointer;" onclick="document.getElementById('ch-m-${chId}-${orig.ts}')?.scrollIntoView({behavior:'smooth'})"><b>${orig.from===CU.id?'Tú':users.find(u=>u.id===orig.from)?.username||'?'}</b>: ${esc((orig.text||'[media]').substring(0,60))}</div>`:'';
    })():'';
    return `<div class="ch-msg ${grouped?'ch-msg-continued':''}" id="ch-m-${chId}-${m.ts}" style="position:relative;">
      ${grouped?'':`<img src="${u?.photo||defAv()}" class="ch-msg-av" alt="" loading="lazy">`}
      <div class="ch-msg-body">
        ${grouped?'':`<div class="ch-msg-meta"><span class="ch-msg-author" style="color:${roleColor(u?.role||'')}">${esc(u?.username||'Desconocido')}</span><span class="ch-msg-time">${timeAgo(m.ts)}</span>${m.pinned?'<span class="tag tag-orange" style="font-size:.6rem;">📌</span>':''}</div>`}
        ${replyHtml}
        ${m.text?`<div class="ch-msg-text">${renderHashtags(esc(m.text))}</div>`:''}
        ${mediaHtml}
        ${rxnHtml}
      </div>
      <div class="ch-add-rxn">
        ${['❤️','👍','😂','🔥','😮'].map(e=>`<span onclick="addChMsgRxn(${chId},${m.ts},'${e}')" style="cursor:pointer;">${e}</span>`).join('')}
        <span onclick="startChReply(${chId},${m.ts},'${esc((m.text||'').substring(0,40))}')" style="cursor:pointer;font-size:.8rem;color:var(--text2);" title="Responder">↩</span>
        ${m.from===CU.id||PRIVILEGED.includes(CU.role||'')?`<span onclick="deleteChMsg(${chId},${m.ts})" style="cursor:pointer;font-size:.8rem;color:var(--danger);" title="Eliminar">🗑</span>`:''}
      </div>
    </div>`;
  }).join('');
}

function roleColor(role){
  const m={Fundador:'#7c3aed',Líder:'#d97706','Soporte Técnico':'#b45309',Admin:'#dc2626'};
  return m[role]||'var(--text)';
}

function switchChannel(id){
  activeChannelId=id;
  const content = document.getElementById('ch-content');
  if(content){ content.innerHTML=renderChannelContent(id); scrollChBottom(id); }
  document.querySelectorAll('.ch-item').forEach(el=>{
    el.classList.toggle('active', el.getAttribute('onclick')===`switchChannel(${id})`);
  });
  
  // --- Mobile navigation logic ---
  const layout = document.getElementById('channels-layout');
  const isMobile = window.innerWidth <= 780;
  if(isMobile && layout) {
      layout.classList.add('channels-open');
      
      // Inject back button if not already present
      const chHeader = document.querySelector('.ch-header');
      if(chHeader && !document.getElementById('ch-back-btn')) {
          const backBtn = document.createElement('button');
          backBtn.id = 'ch-back-btn';
          backBtn.className = 'btn-back-channels';
          backBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
          backBtn.onclick = backToChannelsList;
          // Insert at the beginning of ch-header
          chHeader.insertBefore(backBtn, chHeader.firstChild);
      }
  }
  // --- End mobile navigation logic ---
  
  // Re-render sidebar to update active class and badges
  const sidebar = document.getElementById('ch-sidebar');
  if(sidebar){ 
    const isPriv = PRIVILEGED.includes(CU.role||'');
    const textChannels = channels.filter(c=>c.type!=='voice');
    const newHtml = `<div class="ch-server-hd"><span>🌿 Serakdep</span>${isPriv?`<button class="btn-icon" style="width:28px;height:28px;font-size:.8rem;" onclick="openModal('channel-create-modal')"><i class="fas fa-plus"></i></button>`:''}</div>
    <div class="ch-list">
      <div class="ch-category"><i class="fas fa-chevron-down" style="font-size:.6rem;"></i> CANALES DE TEXTO</div>
      ${textChannels.map(ch=>`<div class="ch-item ${ch.id===id?'active':''}" onclick="switchChannel(${ch.id})"><i class="fas ${ch.type==='announce'?'fa-bullhorn':ch.type==='media'?'fa-image':'fa-hashtag'}" style="font-size:.8rem;opacity:.7;width:14px;"></i><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(ch.name)}</span></div>`).join('')}
    </div>
    <div style="padding:10px 12px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;background:var(--bg);">
      <img src="${CU.photo||defAv()}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;flex-shrink:0;">
      <div style="flex:1;min-width:0;"><div style="font-weight:700;font-size:.8rem;">${esc(CU.username)}</div><div style="font-size:.68rem;color:var(--text2);">${getStatusLabel(CU.id)||'#'+CU.id}</div></div>
      <button class="btn-icon" style="width:26px;height:26px;font-size:.75rem;" onclick="openModal('status-modal')"><i class="fas fa-circle-dot"></i></button>
    </div>`;
    sidebar.innerHTML = newHtml;
  }
}

function backToChannelsList() {
    const layout = document.getElementById('channels-layout');
    if(layout) {
        layout.classList.remove('channels-open');
    }
    // Remove back button
    const backBtn = document.getElementById('ch-back-btn');
    if(backBtn) backBtn.remove();
}

function sendChannelMsg(chId){
  const inp = document.getElementById(`ch-inp-${chId}`);
  const hasText = inp&&inp.value.trim();
  if(!hasText&&!_chPendingMedia) return;
  if(!channelMessages[chId]) channelMessages[chId]=[];
  const replyEl = document.getElementById(`ch-reply-bar-${chId}`);
  const replyTo = replyEl?._replyTo||null;
  const msg = {from:CU.id, text:inp?inp.value.trim():'', ts:Date.now(), reactions:{}, readBy:[CU.id], replyTo};
  if(_chPendingMedia) msg.media=_chPendingMedia;
  channelMessages[chId].push(msg);
  if(inp) inp.value='';
  _chPendingMedia=null;
  if(replyEl){replyEl.innerHTML='';replyEl._replyTo=null;}
  saveNewState();
  const msgsEl = document.getElementById(`ch-msgs-${chId}`);
  if(msgsEl){ msgsEl.innerHTML=renderChannelMsgs(channelMessages[chId],chId); scrollChBottom(chId); }
  // notify other members (simulate)
  toast('','');// silent
}

let _chPendingMedia=null;
function triggerChFileUpload(chId){ document.getElementById(`ch-file-${chId}`)?.click(); }
function handleChFile(chId, input){
  const file=input.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    const type=file.type.startsWith('video')?'video':file.type.startsWith('audio')?'audio':'image';
    _chPendingMedia={data:e.target.result,type,name:file.name};
    toast(`📎 Archivo listo para enviar: ${file.name}`,'info');
  };
  reader.readAsDataURL(file);
}

function insertChEmoji(chId){
  const emojis=['😀','😂','❤️','👍','🔥','😮','🎉','👏','😢','😡','🤔','💯','✅','⭐','🚀','🎵'];
  const inp=document.getElementById(`ch-inp-${chId}`);
  if(!inp)return;
  const pick=emojis[Math.floor(Math.random()*emojis.length)];
  inp.value+=pick;inp.focus();
}

function addChMsgRxn(chId, ts, emoji){
  const msgs = channelMessages[chId]||[];
  const m = msgs.find(x=>x.ts===ts);
  if(!m) return;
  m.reactions=m.reactions||{};
  m.reactions[emoji]=m.reactions[emoji]||[];
  if(m.reactions[emoji].includes(CU.id)) m.reactions[emoji]=m.reactions[emoji].filter(x=>x!==CU.id);
  else m.reactions[emoji].push(CU.id);
  if(!m.reactions[emoji].length) delete m.reactions[emoji];
  saveNewState();
  const msgsEl=document.getElementById(`ch-msgs-${chId}`);
  if(msgsEl){ msgsEl.innerHTML=renderChannelMsgs(msgs,chId); }
}

function startChReply(chId, ts, preview){
  const bar = document.getElementById(`ch-reply-bar-${chId}`);
  if(!bar) return;
  bar._replyTo = ts;
  bar.style.display='flex';
  bar.innerHTML=`<div style="flex:1;font-size:.78rem;color:var(--text2);background:var(--input-bg);border-radius:var(--r-sm);padding:4px 9px;border-left:3px solid var(--green);">Respondiendo: ${esc(preview)}</div><button class="btn-icon" style="width:24px;height:24px;flex-shrink:0;" onclick="this.parentElement.innerHTML='';this.parentElement._replyTo=null;"><i class="fas fa-times"></i></button>`;
  document.getElementById(`ch-inp-${chId}`)?.focus();
}

function deleteChMsg(chId, ts){
  channelMessages[chId]=(channelMessages[chId]||[]).filter(m=>m.ts!==ts);
  saveNewState();
  const msgsEl=document.getElementById(`ch-msgs-${chId}`);
  if(msgsEl) msgsEl.innerHTML=renderChannelMsgs(channelMessages[chId]||[],chId);
}

function scrollChBottom(chId){
  const el=document.getElementById(`ch-msgs-${chId}`);
  if(el) el.scrollTop=el.scrollHeight;
}

function createChannel(){
  const name=document.getElementById('ch-name')?.value.trim().toLowerCase().replace(/\s+/g,'-');
  const desc=document.getElementById('ch-desc')?.value.trim();
  const type=document.getElementById('ch-type')?.value||'text';
  const access=document.getElementById('ch-access')?.value||'public';
  if(!name){toast('Escribe un nombre para el canal','warning');return;}
  if(channels.find(c=>c.name===name)){toast('Ya existe un canal con ese nombre','warning');return;}
  const ch={id:idsCh.nc++,name,desc,type,access,createdBy:CU.id,pinned:[]};
  channels.push(ch);
  channelMessages[ch.id]=[];
  closeModal('channel-create-modal');
  saveNewState();
  toast(`Canal #${name} creado ✅`,'success');
  activeChannelId=ch.id;
  renderChannelsPage();
}

function editChannel(chId){
  const ch=channels.find(c=>c.id===chId);if(!ch)return;
  const newName=prompt('Nuevo nombre del canal:',ch.name);
  if(!newName||!newName.trim())return;
  ch.name=newName.trim().toLowerCase().replace(/\s+/g,'-');
  const newDesc=prompt('Nueva descripción:',ch.desc||'');
  if(newDesc!==null)ch.desc=newDesc;
  saveNewState();
  renderChannelsPage();
  toast('Canal actualizado ✅','success');
}

function showChannelMembers(chId){
  toast(`${users.length} miembros en #${channels.find(c=>c.id===chId)?.name||''}`, 'info');
}



// ═══════════════════════════════════════════
//  WATCH (Facebook/TikTok-style video feed)
// ═══════════════════════════════════════════
function renderWatchPage(){
  const mc=document.getElementById('content');
  // Combine reels + watch videos
  const allVideos=[
    ...reels.filter(r=>r.media).map(r=>({...r,source:'reel',thumbSrc:r.media})),
    ...watchVideos.map(v=>({...v,source:'watch'}))
  ].sort((a,b)=>(b.timestamp||0)-(a.timestamp||0));

  const categories=['Para ti','Siguiendo','Tendencias','Música','Juegos','Noticias','Deportes'];
  let activeCat=mc._watchCat||'Para ti';

  mc.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <h3 style="font-family:var(--font-head);font-weight:800;"><i class="fas fa-tv" style="color:var(--purple);margin-right:7px;"></i>Watch</h3>
      <button class="btn btn-primary" onclick="openUploadWatchVideo()"><i class="fas fa-plus"></i> Subir video</button>
    </div>
    <div class="watch-category-tabs">
      ${categories.map(c=>`<button class="tab-pill ${c===activeCat?'active':''}" onclick="switchWatchCat('${c}')">${c}</button>`).join('')}
    </div>
    <div id="watch-featured" style="margin-bottom:18px;"></div>
    <div class="watch-grid" id="watch-grid">
      ${allVideos.length?allVideos.map(v=>watchCard(v)).join(''):`<div class="card" style="grid-column:1/-1;">${empty('fas fa-tv','¡Sube el primer video!')}</div>`}
    </div>`;
}

function watchCard(v){
  const u=users.find(x=>x.id===v.userId);
  const liked=(v.likes||[]).includes(CU.id);
  return `<div class="watch-card" onclick="openWatchPlayer(${v.id},'${v.source||'reel'}')">
    <div class="watch-thumb">
      ${v.media?`<video src="${v.media}" muted preload="none" style="pointer-events:none;"></video>`:`<i class="fas fa-play-circle"></i>`}
      <div class="watch-thumb-overlay"><div class="watch-thumb-play"><i class="fas fa-play"></i></div></div>
    </div>
    <div class="watch-info">
      <div class="watch-title">${esc(v.description||v.title||'Sin título')}</div>
      <div class="watch-meta">
        <img src="${u?.photo||defAv()}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;" alt="" loading="lazy">
        <span>${esc(u?.username||'')}</span>
        <span>· ${timeAgo(v.timestamp)}</span>
        <span>· <i class="fas fa-heart" style="color:${liked?'var(--danger)':'inherit'};"></i> ${(v.likes||[]).length}</span>
      </div>
    </div>
  </div>`;
}

function openWatchPlayer(id, source){
  const v = source==='reel'?reels.find(x=>x.id===id):watchVideos.find(x=>x.id===id);
  if(!v) return;
  const mc=document.getElementById('content');
  if(!mc) return;
  const u=users.find(x=>x.id===v.userId);
  const liked=(v.likes||[]).includes(CU.id);
  const top=mc.querySelector('.watch-player-wrap');
  const featureEl=document.getElementById('watch-featured')||mc;
  const playerHtml=`
    <div class="watch-player-wrap" id="active-watch-player">
      ${v.media?`<video src="${v.media}" controls autoplay style="width:100%;max-height:55vh;background:#000;display:block;"></video>`:`<div style="background:#111;height:300px;display:flex;align-items:center;justify-content:center;color:#fff;"><i class="fas fa-film" style="font-size:3rem;opacity:.4;"></i></div>`}
    </div>
    <div class="card" style="padding:14px;margin-bottom:14px;">
      <h3 style="font-family:var(--font-head);font-weight:800;margin-bottom:6px;">${esc(v.description||v.title||'Sin título')}</h3>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:8px;cursor:pointer;" onclick="openProfileModal(${v.userId})">
          <img src="${u?.photo||defAv()}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" alt="" loading="lazy">
          <div>
            <div style="font-weight:700;font-size:.9rem;">${esc(u?.username||'')}</div>
            <div style="font-size:.73rem;color:var(--text2);">${(u?.followers||[]).length} seguidores</div>
          </div>
        </div>
        <button class="btn btn-primary" style="margin-left:auto;" onclick="toggleFollow(${v.userId})">${CU.following.includes(v.userId)?'Siguiendo':'Seguir'}</button>
      </div>
      <hr class="div">
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn btn-ghost" onclick="likeWatchVideo(${id},'${source}')" style="gap:6px;${liked?'color:var(--danger);':''}"><i class="fas fa-heart"></i> ${(v.likes||[]).length} Me gusta</button>
        <button class="btn btn-ghost" onclick="shareWatchVideo(${id},'${source}')"><i class="fas fa-share"></i> Compartir</button>
        <button class="btn btn-ghost" onclick="openClipModal(${id},'${source}')"><i class="fas fa-scissors"></i> Crear clip</button>
      </div>
    </div>`;
  const existing=document.getElementById('active-watch-player');
  if(existing){ existing.closest('.watch-player-wrap')?.parentElement?.remove(); }
  document.getElementById('watch-featured').innerHTML=playerHtml;
  document.getElementById('watch-featured').scrollIntoView({behavior:'smooth'});
}

function likeWatchVideo(id, source){
  const v = source==='reel'?reels.find(x=>x.id===id):watchVideos.find(x=>x.id===id);
  if(!v) return;
  v.likes=v.likes||[];
  if(v.likes.includes(CU.id)) v.likes=v.likes.filter(x=>x!==CU.id);
  else v.likes.push(CU.id);
  save(); saveNewState();
  openWatchPlayer(id,source);
}

function shareWatchVideo(id,source){
  const inp=document.getElementById('share-link-input');
  if(inp)inp.value=`https://serakdep.ms/watch/${source||'reel'}/${id}`;
  openModal('share-modal');
}

function openClipModal(id,source){
  document.getElementById('clip-modal-body').innerHTML=`
    <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap;">
      <div style="flex:1;min-width:0;">
        <label style="font-size:.8rem;color:var(--text2);display:block;margin-bottom:3px;">Inicio (segundos)</label>
        <input type="number" id="clip-start" value="0" min="0" style="margin-bottom:0;">
      </div>
      <div style="flex:1;min-width:0;">
        <label style="font-size:.8rem;color:var(--text2);display:block;margin-bottom:3px;">Duración (seg, máx 60)</label>
        <input type="number" id="clip-dur" value="15" min="1" max="60" style="margin-bottom:0;">
      </div>
    </div>
    <input type="text" id="clip-title" placeholder="Título del clip..." style="margin-bottom:10px;">
    <button class="btn btn-primary" style="width:100%;justify-content:center;" onclick="publishClip(${id},'${source}')"><i class="fas fa-cut"></i> Publicar clip</button>`;
  openModal('clip-modal');
}

function publishClip(id, source){
  const title=document.getElementById('clip-title')?.value.trim()||'Clip sin título';
  const start=parseInt(document.getElementById('clip-start')?.value||0);
  const dur=Math.min(60,parseInt(document.getElementById('clip-dur')?.value||15));
  // Buscar el video origen
  const srcVideo=watchVideos.find(v=>v.id===id)||(source==='local'?null:null);
  const media=srcVideo?.media||'';
  if(media){
    const clip={id:idsCh.nwv++,userId:CU.id,title,description:`Clip de "${srcVideo?.title||'video'}" (${start}s - ${start+dur}s)`,media,isClip:true,clipStart:start,clipDuration:dur,likes:[],timestamp:Date.now()};
    watchVideos.push(clip);saveNewState();
  }
  closeModal('clip-modal');
  toast(`🎬 Clip "${title}" publicado ✅`,'success');
  if(cView==='watch')renderWatchPage();
}

function openUploadWatchVideo(){
  const input=document.createElement('input');
  input.type='file';input.accept='video/*';
  input.onchange=()=>{
    const file=input.files[0];if(!file)return;
    const title=prompt('Título del video:','');if(title===null)return;
    const reader=new FileReader();
    reader.onload=e=>{
      const v={id:idsCh.nwv++,userId:CU.id,title:title||file.name,description:title||'',media:e.target.result,likes:[],timestamp:Date.now()};
      watchVideos.push(v);saveNewState();
      renderWatchPage();toast('Video subido ✅','success');
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function switchWatchCat(cat){
  const mc=document.getElementById('content');
  if(!mc)return;
  mc._watchCat=cat;
  renderWatchPage();
}

// ═══════════════════════════════════════════
//  FRIENDS PAGE
// ═══════════════════════════════════════════
function renderFriendsPage(){
  const mc=document.getElementById('content');
  const bl=CU.blocked||[];
  const mutualFriends=users.filter(u=>u.id!==CU.id&&!bl.includes(u.id)&&!u.deactivated&&CU.following.includes(u.id)&&(u.followers||[]).includes(CU.id));
  const following=users.filter(u=>u.id!==CU.id&&!bl.includes(u.id)&&!u.deactivated&&CU.following.includes(u.id)&&!(u.followers||[]).includes(CU.id));
  const followers=users.filter(u=>u.id!==CU.id&&!bl.includes(u.id)&&!u.deactivated&&!CU.following.includes(u.id)&&(u.followers||[]).includes(CU.id));
  const suggestions=users.filter(u=>u.id!==CU.id&&!bl.includes(u.id)&&!u.deactivated&&!CU.following.includes(u.id)).slice(0,8);

  mc.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <h3 style="font-family:var(--font-head);font-weight:800;"><i class="fas fa-user-friends" style="color:var(--blue);margin-right:7px;"></i>Amigos</h3>
    </div>
    <div class="friends-tabs">
      <button class="tab-pill active" id="ft-mutual" onclick="switchFriendsTab('mutual')">Amigos (${mutualFriends.length})</button>
      <button class="tab-pill" id="ft-following" onclick="switchFriendsTab('following')">Siguiendo (${following.length})</button>
      <button class="tab-pill" id="ft-followers" onclick="switchFriendsTab('followers')">Seguidores (${followers.length})</button>
      <button class="tab-pill" id="ft-suggestions" onclick="switchFriendsTab('suggestions')">Sugerencias</button>
    </div>
    <div id="friends-content">
      ${mutualFriends.length?mutualFriends.map(u=>friendCard(u)).join(''):`<div class="card">${empty('fas fa-user-friends','No tienes amigos mutuos aún. ¡Sigue a alguien!')}</div>`}
    </div>`;
}

function friendCard(u, type='mutual'){
  const sl=getStatusLabel(u.id);
  const st=userStatuses[u.id]?.type||'offline';
  return `<div class="friend-card">
    <div class="friend-card-av">
      <img src="${u.photo||defAv()}" alt="" loading="lazy">
      <span class="friend-status-dot ${st}"></span>
    </div>
    <div class="friend-card-info">
      <div class="friend-card-name">${esc(u.username)} ${badgesHtml(u.id)}</div>
      <div class="friend-card-status">${sl||esc(u.bio?.substring(0,50)||u.role||'Miembro')}</div>
    </div>
    <div class="friend-card-acts">
      <button class="btn btn-ghost" style="padding:6px 11px;font-size:.78rem;" onclick="navigate('messages');setTimeout(()=>openChat(${u.id}),300)"><i class="fas fa-comment"></i></button>
      <button class="btn btn-ghost" style="padding:6px 11px;font-size:.78rem;" onclick="openProfileModal(${u.id})"><i class="fas fa-user"></i></button>
      ${type==='mutual'?`<button class="btn btn-danger" style="padding:6px 10px;font-size:.75rem;" onclick="toggleFollow(${u.id});renderFriendsPage()"><i class="fas fa-user-minus"></i></button>`:''}
      ${type==='followers'?`<button class="btn btn-primary" style="padding:6px 11px;font-size:.78rem;" onclick="toggleFollow(${u.id});renderFriendsPage()">Seguir</button>`:''}
      ${type==='suggestions'?`<button class="btn btn-primary" style="padding:6px 11px;font-size:.78rem;" onclick="toggleFollow(${u.id});renderFriendsPage()"><i class="fas fa-user-plus"></i> Seguir</button>`:''}
    </div>
  </div>`;
}

function switchFriendsTab(tab){
  document.querySelectorAll('.friends-tabs .tab-pill').forEach(b=>b.classList.remove('active'));
  document.getElementById(`ft-${tab}`)?.classList.add('active');
  const bl=CU.blocked||[];
  const fc=document.getElementById('friends-content');if(!fc)return;
  if(tab==='mutual'){
    const arr=users.filter(u=>u.id!==CU.id&&!bl.includes(u.id)&&!u.deactivated&&CU.following.includes(u.id)&&(u.followers||[]).includes(CU.id));
    fc.innerHTML=arr.length?arr.map(u=>friendCard(u,'mutual')).join(''):`<div class="card">${empty('fas fa-user-friends','Sin amigos mutuos aún.')}</div>`;
  }else if(tab==='following'){
    const arr=users.filter(u=>u.id!==CU.id&&!bl.includes(u.id)&&!u.deactivated&&CU.following.includes(u.id)&&!(u.followers||[]).includes(CU.id));
    fc.innerHTML=arr.length?arr.map(u=>friendCard(u,'following')).join(''):`<div class="card">${empty('fas fa-arrow-up','No sigues a nadie que no te siga.')}</div>`;
  }else if(tab==='followers'){
    const arr=users.filter(u=>u.id!==CU.id&&!bl.includes(u.id)&&!u.deactivated&&!CU.following.includes(u.id)&&(u.followers||[]).includes(CU.id));
    fc.innerHTML=arr.length?arr.map(u=>friendCard(u,'followers')).join(''):`<div class="card">${empty('fas fa-arrow-down','Nadie nuevo te sigue.')}</div>`;
  }else{
    const arr=users.filter(u=>u.id!==CU.id&&!bl.includes(u.id)&&!u.deactivated&&!CU.following.includes(u.id)).slice(0,12);
    fc.innerHTML=arr.length?`<p style="font-size:.82rem;color:var(--text2);margin-bottom:9px;">Personas que quizás conozcas</p>${arr.map(u=>friendCard(u,'suggestions')).join('')}`:`<div class="card">${empty('fas fa-users','Sin sugerencias disponibles.')}</div>`;
  }
}

// ═══════════════════════════════════════════
//  GROUP CHAT (Multi-DM like WhatsApp)
// ═══════════════════════════════════════════
function openGroupChatCreator(){
  const mc=document.getElementById('gc-members-list');
  if(!mc) return;
  const bl=CU.blocked||[];
  const others=users.filter(u=>u.id!==CU.id&&!bl.includes(u.id)&&!u.deactivated);
  mc.innerHTML=others.map(u=>`
    <label style="display:flex;align-items:center;gap:8px;padding:5px 0;cursor:pointer;">
      <input type="checkbox" class="gc-member-chk" value="${u.id}" style="width:auto;margin:0;">
      <img src="${u.photo||defAv()}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;" alt="" loading="lazy">
      <span style="font-size:.84rem;font-weight:500;">${esc(u.username)}</span>
    </label>
  `).join('');
  openModal('group-chat-modal');
}
function createGroupChat(){
  const name=document.getElementById('gc-name')?.value.trim();
  if(!name){toast('Escribe un nombre para el grupo','warning');return;}
  const selected=Array.from(document.querySelectorAll('.gc-member-chk:checked')).map(c=>parseInt(c.value));
  if(!selected.length){toast('Selecciona al menos un miembro','warning');return;}
  const gc={id:idsCh.ngc++,name,members:[CU.id,...selected],createdBy:CU.id,messages:[],timestamp:Date.now()};
  groupChats.push(gc);
  saveNewState();
  closeModal('group-chat-modal');
  toast(`Grupo "${name}" creado ✅`,'success');
  // Navigate to messages and open group chat
  navigate('messages');
}

// ═══════════════════════════════════════════
//  TRENDING HASHTAGS (sidebar)
// ═══════════════════════════════════════════
// Patch renderSidebar to include status and trending
const _origRenderSidebar=renderSidebar;
renderSidebar=function(){
  _origRenderSidebar();
  // Status indicator
  const pcCard=document.getElementById('pc-card');
  if(pcCard&&CU){
    const statusBar=document.createElement('div');
    statusBar.className='pc-status-bar';
    statusBar.onclick=()=>openModal('status-modal');
    const sl=getStatusLabel(CU.id)||'Establecer estado...';
    const st=userStatuses[CU.id]?.type||'offline';
    statusBar.innerHTML=`<span class="friend-status-dot ${st}" style="position:static;transform:none;flex-shrink:0;"></span><span style="flex:1;overflow:hidden;text-overflow:ellipsis;">${esc(sl)}</span><i class="fas fa-chevron-right" style="font-size:.68rem;opacity:.4;"></i>`;
    const pcBody=pcCard.querySelector('.pc-body');
    if(pcBody) pcBody.appendChild(statusBar);
  }
  renderTrendingHashtags();
};

// ═══════════════════════════════════════════
//  PATCH: Add Group Chat button to messages view
// ═══════════════════════════════════════════
const _origRenderMessages = typeof renderMessages==='function'?renderMessages:null;
if(_origRenderMessages){
  renderMessages=function(){
    _origRenderMessages();
    // Add group chat button to convs panel header
    setTimeout(()=>{
      const convHd=document.querySelector('.convs-panel .card-h');
      if(convHd&&!document.getElementById('gc-create-btn')){
        const btn=document.createElement('button');
        btn.id='gc-create-btn';
        btn.className='btn-icon';
        btn.title='Nuevo chat grupal';
        btn.style.cssText='width:30px;height:30px;font-size:.8rem;';
        btn.innerHTML='<i class="fas fa-users-rectangle"></i>';
        btn.onclick=openGroupChatCreator;
        convHd.appendChild(btn);
      }
      // Show group chats in convs list
      const convsList=document.getElementById('convs-list');
      if(convsList&&groupChats.length){
        const myGCs=groupChats.filter(gc=>gc.members.includes(CU.id));
        if(myGCs.length){
          const div=document.createElement('div');
          div.innerHTML=`<p style="padding:3px 11px;font-size:.72rem;font-weight:800;color:var(--text2);">CHATS GRUPALES</p>`+
            myGCs.map(gc=>{
              const members=gc.members.map(id=>users.find(u=>u.id===id)).filter(Boolean);
              const last=gc.messages[gc.messages.length-1];
              return `<div class="gc-conv-row" onclick="openGroupChatView(${gc.id})">
                <div class="gc-av-stack">
                  <img src="${members[0]?.photo||defAv()}" alt="" loading="lazy">
                  ${members[1]?`<img src="${members[1].photo||defAv()}" alt="" loading="lazy">`:''}
                </div>
                <div><div class="conv-name">${esc(gc.name)}</div><div class="conv-prev">${last?esc((last.text||'[media]').substring(0,40)):'Chat grupal · '+gc.members.length+' miembros'}</div></div>
              </div>`;
            }).join('');
          convsList.prepend(div);
        }
      }
    },100);
  };
}

function openGroupChatView(gcId){
  const gc=groupChats.find(x=>x.id===gcId);if(!gc)return;
  const chatPanel=document.querySelector('.chat-panel');
  if(!chatPanel)return;
  const members=gc.members.map(id=>users.find(u=>u.id===id)).filter(Boolean);
  chatPanel.innerHTML=`
    <div class="chat-hd">
      <div style="display:flex;align-items:center;gap:8px;flex:1;">
        <div class="gc-av-stack" style="width:38px;height:38px;">
          <img src="${members[0]?.photo||defAv()}" alt="" loading="lazy">
          ${members[1]?`<img src="${members[1]?.photo||defAv()}" alt="" loading="lazy">`:''}
        </div>
        <div><div style="font-weight:700;font-size:.92rem;">${esc(gc.name)}</div><div style="font-size:.72rem;color:var(--text2);">${gc.members.length} miembros</div></div>
      </div>
      <button class="btn-icon" onclick="toast('Miembros: '+${JSON.stringify(members.map(u=>u.username).join(', '))},'info')" title="Ver miembros"><i class="fas fa-users"></i></button>
    </div>
    <div class="chat-area" id="gc-area-${gcId}">
      ${gc.messages.map(m=>{
        const u=users.find(x=>x.id===m.from);
        const isMine=m.from===CU.id;
        return `<div class="bubble ${isMine?'mine':'theirs'}">
          ${!isMine?`<div style="font-size:.7rem;font-weight:700;color:var(--green);margin-bottom:2px;">${esc(u?.username||'')}</div>`:''}
          ${m.text?esc(m.text):''}
          <div class="btime">${timeAgo(m.ts||m.timestamp)}</div>
        </div>`;
      }).join('')||'<div class="empty"><i class="fas fa-comments"></i><p>¡Empieza la conversación!</p></div>'}
    </div>
    <div class="chat-input">
      <input type="text" id="gc-inp-${gcId}" placeholder="Mensaje en ${esc(gc.name)}..." onkeypress="if(event.key==='Enter')sendGroupChatMsg(${gcId})">
      <button class="btn-icon" style="background:var(--green);color:#fff;" onclick="sendGroupChatMsg(${gcId})"><i class="fas fa-paper-plane"></i></button>
    </div>`;
  if(window.innerWidth<=780){
    document.getElementById('msg-layout')?.classList.add('chat-open');
  }
  const area=document.getElementById(`gc-area-${gcId}`);
  if(area) area.scrollTop=area.scrollHeight;
}

function sendGroupChatMsg(gcId){
  const gc=groupChats.find(x=>x.id===gcId);if(!gc)return;
  const inp=document.getElementById(`gc-inp-${gcId}`);if(!inp||!inp.value.trim())return;
  gc.messages.push({from:CU.id,text:inp.value.trim(),ts:Date.now()});
  inp.value='';
  saveNewState();
  openGroupChatView(gcId);
}

// ═══════════════════════════════════════════
//  PATCH: Add status button to sidebar
// ═══════════════════════════════════════════
// Update trending hashtags when groups bar renders
const _origRenderGroupsBar=renderGroupsBar;
renderGroupsBar=function(){
  _origRenderGroupsBar();
  renderTrendingHashtags();
};

// ═══════════════════════════════════════════
//  PATCH: Add Story Reply/Reaction UI
// ═══════════════════════════════════════════
const _origRenderSV=typeof renderSV==='function'?renderSV:null;
if(_origRenderSV){
  renderSV=function(){
    _origRenderSV();
    // Add reaction buttons to story viewer
    const svInner=document.getElementById('sv-inner');
    if(svInner&&!document.getElementById('sv-rxns-el')){
      const rxnDiv=document.createElement('div');
      rxnDiv.id='sv-rxns-el';
      rxnDiv.style.cssText='position:absolute;bottom:80px;left:50%;transform:translateX(-50%);z-index:10;';
      rxnDiv.innerHTML=`<div class="sv-rxn-btns">${['❤️','😂','😮','😢','🔥','👏'].map(e=>`<button class="sv-rxn-btn" onclick="reactToStory('${e}')">${e}</button>`).join('')}</div>`;
      svInner.appendChild(rxnDiv);
      // Add reply bar
      if(!document.getElementById('sv-reply-el')){
        const rb=document.createElement('div');rb.id='sv-reply-el';rb.className='sv-reply-bar';
        rb.innerHTML=`<input type="text" placeholder="Responder a la historia..." id="sv-reply-inp"><button class="sv-rxn-btn" onclick="sendStoryReply()" style="flex-shrink:0;"><i class="fas fa-paper-plane" style="font-size:.8rem;color:#fff;"></i></button>`;
        svInner.appendChild(rb);
      }
    }
  };
}
function reactToStory(emoji){toast(`${emoji} Reaccionaste a la historia`,'success');}
function sendStoryReply(){const v=document.getElementById('sv-reply-inp')?.value.trim();if(!v)return;toast('💬 Respuesta enviada','success');document.getElementById('sv-reply-inp').value='';}

// ═══════════════════════════════════════════
//  PATCH: Post Thread feature
// ═══════════════════════════════════════════
function openThreadModal(postId){
  const p=posts.find(x=>x.id===postId);if(!p)return;
  const u=users.find(x=>x.id===p.userId);
  p.thread=p.thread||[];
  const body=document.getElementById('thread-modal-body');if(!body)return;
  body.innerHTML=`
    <div class="thread-item" style="background:var(--input-bg);border-radius:var(--r-md);padding:10px;margin-bottom:12px;">
      <img src="${u?.photo||defAv()}" alt="" loading="lazy">
      <div class="thread-item-body">
        <div class="thread-item-meta">${esc(u?.username||'')} <span style="color:var(--text2);font-weight:400;font-size:.7rem;">· ${timeAgo(p.timestamp)}</span></div>
        <div class="thread-item-text">${esc(p.content)}</div>
      </div>
    </div>
    <div id="thread-replies">
      ${p.thread.map(r=>{
        const ru=users.find(x=>x.id===r.userId);
        return `<div class="thread-item">
          <img src="${ru?.photo||defAv()}" alt="" loading="lazy">
          <div class="thread-item-body">
            <div class="thread-item-meta">${esc(ru?.username||'')} <span style="color:var(--text2);font-weight:400;font-size:.7rem;">· ${timeAgo(r.ts)}</span></div>
            <div class="thread-item-text">${esc(r.text)}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
    <div class="thread-reply-input" style="display:flex;gap:7px;margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
      <img src="${CU.photo||defAv()}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;flex-shrink:0;" alt="" loading="lazy">
      <input type="text" id="thread-inp-${postId}" placeholder="Añadir respuesta al hilo..." style="flex:1;margin-bottom:0;" onkeypress="if(event.key==='Enter')addThreadReply(${postId})">
      <button class="btn btn-primary" style="padding:7px 14px;" onclick="addThreadReply(${postId})"><i class="fas fa-paper-plane"></i></button>
    </div>`;
  openModal('thread-modal');
}

function addThreadReply(postId){
  const p=posts.find(x=>x.id===postId);if(!p)return;
  const inp=document.getElementById(`thread-inp-${postId}`);if(!inp||!inp.value.trim())return;
  p.thread=p.thread||[];
  p.thread.push({userId:CU.id,text:inp.value.trim(),ts:Date.now()});
  inp.value='';save();
  openThreadModal(postId);
}

// ═══════════════════════════════════════════
//  PATCH postCard to add Thread button
// ═══════════════════════════════════════════
const _origPostCard=postCard;
postCard=function(p){
  let html=_origPostCard(p);
  // Inject thread button into p-acts
  const threadBtn=`<button class="act" onclick="openThreadModal(${p.id})" title="Ver hilo"><i class="fas fa-comments"></i> Hilo${p.thread?.length?` (${p.thread.length})`:''}</button>`;
  // Ensure p-acts exists (no-op) then insert thread button before p-acts closing or before p-stats
  html=html.replace(/(<div class="p-acts"[^>]*>)/,(match)=>match);
  // Prefer explicit search for the closing comment, fallback to inserting before p-stats
  const closingMarker = '</div><!-- /p-acts';
  const idx = html.indexOf(closingMarker);
  if(idx!==-1){
    html = html.slice(0, idx) + threadBtn + html.slice(idx);
  } else {
    html = html.replace(/(<div class="p-stats)/, (m)=>threadBtn + m);
  }
  return html;
};

// Run init
saveNewState();
console.log('[Serakdep] New features loaded: Channels, Watch, Friends, Status, Voice, Threads, Group Chat');

window.addEventListener('resize',()=>{
  const layout=document.getElementById('msg-layout');
  if(!layout)return;
  if(window.innerWidth>780){
    layout.classList.remove('chat-open');
  }
  
  // --- Channels resize logic ---
  const channelsLayout = document.getElementById('channels-layout');
  if(channelsLayout) {
      if(window.innerWidth > 780) {
          channelsLayout.classList.remove('channels-open');
          const backBtn = document.getElementById('ch-back-btn');
          if(backBtn) backBtn.remove();
      }
  }
  // --- End channels resize logic ---
});
// ═══════════════════════════════════════════
//  MSG MENU (tres puntos) — menú por mensaje
// ═══════════════════════════════════════════
(function(){
  const menu=document.createElement('div');
  menu.id='msg-ctx-menu';menu.className='msg-menu';
  document.body.appendChild(menu);
  document.addEventListener('click',e=>{
    if(!menu.contains(e.target)&&!e.target.classList.contains('msg-dots-btn'))
      menu.classList.remove('open');
  });
})();

function openMsgMenu(e,otherUid,ts,isMine){
  e.stopPropagation();
  const menu=document.getElementById('msg-ctx-menu');if(!menu)return;
  const conv=messages.find(m=>m.participants.includes(CU.id)&&m.participants.includes(otherUid));
  const msg=conv?.messages.find(m=>m.timestamp===ts);if(!msg)return;
  const rxns=['❤️','👍','😂','😮','😢','🔥'];
  menu.innerHTML=`
    <div class="msg-menu-rxns">
      ${rxns.map(r=>`<button class="msg-menu-rxn" onclick="addMsgRxn(event,${otherUid},${ts},'${r}');document.getElementById('msg-ctx-menu').classList.remove('open')">${r}</button>`).join('')}
    </div>
    <button class="msg-menu-item" onclick="setMsgReply(${otherUid},${ts},'${esc((msg.text||'[media]').substring(0,50))}','${isMine?'Tú':esc(users.find(u=>u.id===msg.from)?.username||'?')}');document.getElementById('msg-ctx-menu').classList.remove('open')">
      <i class="fas fa-reply"></i> Responder
    </button>
    ${isMine?`<button class="msg-menu-item" onclick="startEditMsg(${otherUid},${ts});document.getElementById('msg-ctx-menu').classList.remove('open')">
      <i class="fas fa-pen"></i> Editar
    </button>`:''}
    ${isMine?`<button class="msg-menu-item danger" onclick="deleteMsgBubble(${otherUid},${ts});document.getElementById('msg-ctx-menu').classList.remove('open')">
      <i class="fas fa-trash"></i> Eliminar
    </button>`:''}`;
  const btn=e.currentTarget;const rect=btn.getBoundingClientRect();
  menu.classList.add('open');
  const mw=menu.offsetWidth,mh=menu.offsetHeight;
  let top=rect.top-mh-6,left=rect.left-mw/2;
  if(top<8)top=rect.bottom+6;
  if(left<8)left=8;
  if(left+mw>window.innerWidth-8)left=window.innerWidth-mw-8;
  menu.style.top=top+'px';menu.style.left=left+'px';
}

function startEditMsg(otherUid,ts){
  const conv=messages.find(m=>m.participants.includes(CU.id)&&m.participants.includes(otherUid));
  const msg=conv?.messages.find(m=>m.timestamp===ts);if(!msg||msg.from!==CU.id)return;
  const bubble=document.getElementById('bbl-'+ts);if(!bubble)return;
  const oldText=msg.text||'';
  const row=bubble.closest('.msg-row');
  const editBox=document.createElement('div');
  editBox.style.cssText='display:flex;gap:6px;align-items:flex-end;width:100%;';
  editBox.innerHTML=`<textarea style="flex:1;padding:7px 11px;border-radius:var(--r-lg);resize:none;font-size:.88rem;font-family:inherit;min-height:36px;" id="edit-inp-${ts}">${esc(oldText)}</textarea>
    <button class="btn btn-primary" style="padding:6px 12px;flex-shrink:0;" onclick="saveEditMsg(${otherUid},${ts})"><i class="fas fa-check"></i></button>
    <button class="btn btn-ghost" style="padding:6px 10px;flex-shrink:0;" onclick="cancelEditMsg(${ts})"><i class="fas fa-times"></i></button>`;
  bubble.style.display='none';
  row.appendChild(editBox);
  const ta=document.getElementById('edit-inp-'+ts);
  if(ta){ta.focus();ta.selectionStart=ta.value.length;}
}

function saveEditMsg(otherUid,ts){
  const conv=messages.find(m=>m.participants.includes(CU.id)&&m.participants.includes(otherUid));
  const msg=conv?.messages.find(m=>m.timestamp===ts);if(!msg)return;
  const ta=document.getElementById('edit-inp-'+ts);if(!ta)return;
  const newText=ta.value.trim();if(!newText)return;
  msg.text=newText;msg.edited=true;save();
  cancelEditMsg(ts);
  const conv2=messages.find(m=>m.participants.includes(CU.id)&&m.participants.includes(otherUid));
  renderChatArea(conv2);
}

function cancelEditMsg(ts){
  const bubble=document.getElementById('bbl-'+ts);if(bubble)bubble.style.display='';
  const ta=document.getElementById('edit-inp-'+ts);if(ta)ta.closest('div[style*="flex"]')?.remove();
}

// ── Lightbox multimedia ─────────────────────────────────────────────────
function openLB(src){openMediaLB({src},'image');}
function openMediaLB(el,type){
  const src=el.src||el.currentSrc||el.dataset?.src||'';
  const img=document.getElementById('lb-img');
  const vid=document.getElementById('lb-video');
  const aud=document.getElementById('lb-audio');
  if(img){img.style.display='none';img.src='';}
  if(vid){vid.style.display='none';try{vid.pause();}catch(e){}vid.src='';}
  if(aud){aud.style.display='none';try{aud.pause();}catch(e){}aud.src='';}
  if(type==='image'&&img){img.src=src;img.style.display='block';}
  else if(type==='video'&&vid){vid.src=src;vid.style.display='block';}
  else if(type==='audio'&&aud){aud.src=src;aud.style.display='block';}
  openModal('lightbox-modal');
}
// ═══════════════════════════════════════════
//  FEATURE: LINK PREVIEW (og:image + título)
// ═══════════════════════════════════════════
// Cache para no re-fetch el mismo URL
const _lpCache={};
// Regex para detectar URLs en texto
const URL_REGEX=/https?:\/\/[^\s<>"]+/gi;

function extractFirstUrl(text){
  if(!text)return null;
  const m=text.match(URL_REGEX);
  return m?m[0]:null;
}

// Construye proxy CORS-free usando allorigins
function fetchLinkMeta(url,cb){
  if(_lpCache[url]!==undefined){cb(_lpCache[url]);return;}
  // Usar microlink.io para obtener meta de forma segura
  const api=`https://api.microlink.io/?url=${encodeURIComponent(url)}&palette=false&video=false&audio=false&iframe=false`;
  fetch(api,{headers:{'x-api-key':''}}).then(r=>r.json()).then(d=>{
    if(d.status==='success'){
      const meta={title:d.data.title||null,description:d.data.description||null,image:d.data.image?.url||null,url};
      _lpCache[url]=meta;cb(meta);
    }else{_lpCache[url]=null;cb(null);}
  }).catch(()=>{_lpCache[url]=null;cb(null);});
}

function linkPreviewHtml(meta){
  if(!meta)return'';
  return `<a href="${esc(meta.url)}" target="_blank" rel="noopener" class="link-preview" onclick="event.stopPropagation()">
    ${meta.image?`<img src="${esc(meta.image)}" class="lp-img" alt="" loading="lazy" onerror="this.style.display='none'">`:''}
    <div class="lp-body">
      <div class="lp-domain"><i class="fas fa-link"></i> ${esc(new URL(meta.url).hostname.replace('www.',''))}</div>
      ${meta.title?`<div class="lp-title">${esc(meta.title)}</div>`:''}
      ${meta.description?`<div class="lp-desc">${esc(meta.description.substring(0,120))}</div>`:''}
    </div>
  </a>`;
}

// Parchar postCard para inyectar link preview
(function(){
  const _orig=postCard;
  postCard=function(p){
    let html=_orig(p);
    const url=extractFirstUrl(p.content||'');
    if(!url)return html;
    const ph=`<div class="lp-slot" id="lp-${p.id}"></div>`;
    // Insertar el placeholder después del p-body o del repost block, antes de la media
    html=html.replace(/(<div class="p-rxn-row")/,ph+'$1');
    // Fetch async y rellena cuando el DOM exista
    const cid=p.id;
    setTimeout(()=>{
      const slot=document.getElementById('lp-'+cid);
      if(!slot)return;
      if(_lpCache[url]!==undefined){slot.innerHTML=linkPreviewHtml(_lpCache[url]);return;}
      fetchLinkMeta(url,meta=>{
        const s2=document.getElementById('lp-'+cid);
        if(s2)s2.innerHTML=linkPreviewHtml(meta);
      });
    },0);
    return html;
  };
})();

// ═══════════════════════════════════════════
//  FEATURE: REACCIONES EN POSTS DE GRUPO
// ═══════════════════════════════════════════
// Los posts de grupo ya usan postCard (que ya tiene reacciones).
// Lo que faltaba era el menú de 3 puntos con emojis *al estilo DM* para mensajes en grupos.
// Aquí añadimos reacciones al nivel del postCard en grupos (ya funciona vía addRxn).
// EXTRA: Añadimos un indicador de grupo en el card cuando se muestra en el feed general.
(function(){
  const _orig=postCard;
  postCard=function(p){
    let html=_orig(p);
    if(!p.groupId)return html;
    const g=groups.find(x=>x.id===p.groupId);
    if(!g)return html;
    // Inyectar badge de grupo en la fila de tiempo
    const groupBadge=`<span class="tag tag-purple" style="font-size:.65rem;cursor:pointer;" onclick="navigate('groups',${g.id})"><i class="fas fa-users"></i> ${esc(g.name)}</span>`;
    html=html.replace(/(<div class="p-time"[^>]*>)/,'$1'+groupBadge);
    return html;
  };
})();

// ═══════════════════════════════════════════
//  FEATURE: ESTADÍSTICAS POR POST INDIVIDUAL
// ═══════════════════════════════════════════
// Añade botón "📊 Stats" en p-acts y modal con impresiones, alcance, clicks estimados
(function(){
  const _orig=postCard;
  postCard=function(p){
    let html=_orig(p);
    // Inyectar botón stats en p-acts
    const statsBtn=`<button class="act" onclick="openPostStats(${p.id})" title="Estadísticas del post"><i class="fas fa-chart-bar"></i> Stats</button>`;
    html=html.replace(/(<\/div><!-- \/p-acts)/,statsBtn+'$1');
    // Fallback: buscar cierre estándar de p-acts
    if(html.indexOf(statsBtn)===-1){
      html=html.replace(/(<button class="act"[^>]*onclick="openSharePost)/,statsBtn+'$1');
    }
    return html;
  };
})();

function openPostStats(postId){
  const p=posts.find(x=>x.id===postId);if(!p)return;
  const author=users.find(u=>u.id===p.userId);if(!author)return;

  // Calcular métricas derivadas de datos reales
  const reactionCount=Object.keys(p.reactions||{}).length;
  const commentCount=(p.comments||[]).length;
  const repostCount=(p.reposts||[]).length;
  const saveCount=(p.savedBy||[]).length;
  const followerCount=(author.followers||[]).length;

  // Impresiones: estimado basado en seguidores + reposts * 10 + saves * 5
  const impressions=Math.max(reactionCount+commentCount*2, Math.round(followerCount*0.35)+repostCount*12+saveCount*5);
  // Alcance: único estimado
  const reach=Math.round(impressions*0.72);
  // Tasa de engagement
  const engRate=impressions>0?((reactionCount+commentCount+repostCount)/impressions*100).toFixed(1):'0.0';
  // Clicks estimados en links
  const url=extractFirstUrl(p.content||'');
  const linkClicks=url?Math.round(impressions*0.04):0;
  // Top reacción
  const rCounts=Object.values(p.reactions||{}).reduce((a,r)=>{a[r]=(a[r]||0)+1;return a;},{});
  const topRxn=Object.entries(rCounts).sort((a,b)=>b[1]-a[1])[0];

  // Distribución de reacciones
  const rxnNames={like:'👍 Me gusta',love:'❤️ Amor',laugh:'😂 Risa',sad:'😢 Triste',angry:'😡 Enojo'};
  const rxnBars=Object.entries(rCounts).map(([k,v])=>{
    const pct=reactionCount>0?Math.round(v/reactionCount*100):0;
    return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
      <span style="width:90px;font-size:.78rem;">${rxnNames[k]||k}</span>
      <div style="flex:1;background:var(--border);border-radius:6px;height:8px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:var(--green);border-radius:6px;transition:width .5s;"></div>
      </div>
      <span style="font-size:.75rem;color:var(--text2);width:36px;text-align:right;">${v} (${pct}%)</span>
    </div>`;
  }).join('');

  const mb=document.getElementById('thread-modal-body');if(!mb)return;
  mb.innerHTML=`
    <div style="font-family:var(--font-head);font-weight:800;font-size:1rem;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
      <i class="fas fa-chart-bar" style="color:var(--green);"></i> Estadísticas del post
    </div>
    <p style="font-size:.78rem;color:var(--text2);margin-bottom:14px;">"${esc((p.content||'').substring(0,60))}${p.content?.length>60?'...':''}" · ${timeAgo(p.timestamp)}</p>

    <div class="post-stats-grid">
      <div class="ps-card">
        <div class="ps-val">${impressions.toLocaleString()}</div>
        <div class="ps-label"><i class="fas fa-eye"></i> Impresiones</div>
      </div>
      <div class="ps-card">
        <div class="ps-val">${reach.toLocaleString()}</div>
        <div class="ps-label"><i class="fas fa-users"></i> Alcance</div>
      </div>
      <div class="ps-card">
        <div class="ps-val">${engRate}%</div>
        <div class="ps-label"><i class="fas fa-fire"></i> Engagement</div>
      </div>
      <div class="ps-card">
        <div class="ps-val">${reactionCount}</div>
        <div class="ps-label"><i class="fas fa-heart"></i> Reacciones</div>
      </div>
      <div class="ps-card">
        <div class="ps-val">${commentCount}</div>
        <div class="ps-label"><i class="fas fa-comment"></i> Comentarios</div>
      </div>
      <div class="ps-card">
        <div class="ps-val">${repostCount}</div>
        <div class="ps-label"><i class="fas fa-retweet"></i> Reposts</div>
      </div>
      <div class="ps-card">
        <div class="ps-val">${saveCount}</div>
        <div class="ps-label"><i class="fas fa-bookmark"></i> Guardados</div>
      </div>
      ${url?`<div class="ps-card">
        <div class="ps-val">${linkClicks}</div>
        <div class="ps-label"><i class="fas fa-link"></i> Clicks enlace</div>
      </div>`:''}
    </div>

    ${reactionCount>0?`<div style="margin-top:14px;">
      <div style="font-weight:700;font-size:.82rem;margin-bottom:8px;font-family:var(--font-head);">Distribución de reacciones</div>
      ${rxnBars}
      ${topRxn?`<p style="font-size:.75rem;color:var(--text2);margin-top:6px;">Reacción más popular: ${rxnNames[topRxn[0]]||topRxn[0]} (${topRxn[1]})</p>`:''}
    </div>`:''}

    <div style="margin-top:14px;padding:10px;background:var(--input-bg);border-radius:var(--r-md);">
      <p style="font-size:.75rem;color:var(--text2);"><i class="fas fa-info-circle"></i> Las impresiones y el alcance son estimaciones basadas en seguidores y actividad. Los datos de engagement son exactos.</p>
    </div>`;
  openModal('thread-modal');
}

console.log('[Serakdep] Features added: Link Preview, Group Post Badges, Post Statistics');