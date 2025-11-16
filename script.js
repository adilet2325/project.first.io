const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyaUy65V8kisQRTFrp8Ets8TwUuv3pqbfjDmu_52NMVv8g0BbjnADOb902vxFByUoxd/exec";

// Простой список запрещённых слов (русские/казахские маты).
// Добавляй/редактируй слова в нижнем регистре без пробелов.
// ВНИМАНИЕ: список нужно расширять под ваши требования.
const BAD_WORDS = [
  "сука","бляд","блядь","пизд","хуй","еба","шала","сука","пидор","пiдор","котак","блять","шлюха","мал","қотақ"
  // добавь казахские нецензурные слова, если нужно
];

// ------------------------
// UI
// ------------------------
const joinBtn = document.getElementById('joinBtn');
const laterBtn = document.getElementById('laterBtn');
const joinForm = document.getElementById('joinForm');
const cancelBtn = document.getElementById('cancelBtn');
const formMessage = document.getElementById('formMessage');

joinBtn.addEventListener('click', () => {
  joinForm.classList.remove('hidden');
  formMessage.textContent = '';
});
laterBtn.addEventListener('click', () => {
  joinForm.classList.add('hidden');
  formMessage.style.color = '#333';
  formMessage.innerHTML = 'Жарайды 😊<br>Келесі жолы қосылсаңыз күтеміз!';
});
cancelBtn.addEventListener('click', () => {
  joinForm.classList.add('hidden');
  formMessage.textContent = '';
});

// sanitization: remove tags and trim
function sanitize(input){
  return input.replace(/<[^>]*>?/gm, '').trim();
}

// lower-case normalized for checking
function containsBadWord(text){
  if(!text) return false;
  const normalized = text.toLowerCase().replace(/[^a-zа-яёқңүғіәөё\s]/gi, ' ');
  for(const b of BAD_WORDS){
    // word boundary check
    const re = new RegExp('\\b' + b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b','i');
    if(re.test(normalized)) return true;
  }
  return false;
}

document.getElementById('joinForm').addEventListener('submit', async function(e){
  e.preventDefault();

  const fname = sanitize(document.getElementById('fname').value);
  const lname = sanitize(document.getElementById('lname').value);
  const grade = sanitize(document.getElementById('grade').value);
  const purpose = sanitize(document.getElementById('purpose').value);

  // базовая валидация
  if(!fname || !lname){
    formMessage.textContent = 'Аты және тегі толтырылуы тиіс.';
    return;
  }
  // profanity check client-side
  if(containsBadWord(fname) || containsBadWord(lname) || containsBadWord(grade) || containsBadWord(purpose)){
    formMessage.textContent = 'Формада орынсыз сөздер табылды. Қайта толтырыңыз.';
    return;
  }

  // prepare payload
  const payload = {
    fname, lname, grade, purpose, ts: new Date().toISOString()
  };

  try{
    formMessage.textContent = 'Жіберілуде...';
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if(res.ok && result && result.status === 'success'){
      formMessage.style.color = 'green';
      formMessage.textContent = 'Рақмет! Мәлімет сақталды.';
      // очистить форму
      document.getElementById('joinForm').reset();
      // можно скрыть форму
      joinForm.classList.add('hidden');
    } else {
      formMessage.style.color = '#b23';
      formMessage.textContent = result && result.message ? result.message : 'Қате: Мәлімет сақталмады. Кейінірек тағы көріңіз.';
    }
  } catch(err){
    console.error(err);
    formMessage.style.color = '#b23';
    formMessage.textContent = 'Сервермен байланыс мүмкін емес. URL дұрыс ба?';
  }
});