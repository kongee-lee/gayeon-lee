// 명세 ③: 추가 → 목록 맨 아래에 · 체크 → 줄이 그어지고 남은 개수 −1 · 삭제 → 목록에서 사라짐
// 완료 조건: 빈 칸은 추가 안 됨 · 체크하면 남은 개수가 바로 바뀜 · 새로고침해도 남음 · 휴대폰에서 쓸 수 있음

// 할 일 목록은 Supabase의 todos 표(id, text, done, created_at)에 저장한다. 공개 키만 쓴다.
const SUPABASE_URL = 'https://ojffgrqjofdyusjrvrof.supabase.co';
const SUPABASE_KEY = 'sb_publishable_73ew9yQJohMTGWpF6dylmg_9cvn9fpI';
const TABLE = `${SUPABASE_URL}/rest/v1/todos`;

let items = [];

// 표에 칸이 없는 분류·마감일·별표는 이 브라우저 안에 할 일 번호(id)별로 저장
const EXTRA_KEY = 'todo-extras';
let extras = JSON.parse(localStorage.getItem(EXTRA_KEY) || '{}');

// 완료한 할 일을 숨길지 (이것도 브라우저 안에 저장)
const HIDE_KEY = 'todo-hide-done';
let hideDone = localStorage.getItem(HIDE_KEY) === 'true';

function saveExtras() {
  localStorage.setItem(EXTRA_KEY, JSON.stringify(extras));
}

function rememberExtras(item) {
  extras[item.id] = { category: item.category, due: item.due, important: item.important };
  saveExtras();
}

// Supabase 표에 요청 보내기 (다른 사이트 라이브러리 없이 브라우저 기본 fetch로)
async function ask(method, query, body) {
  const response = await fetch(TABLE + query, {
    method: method,
    headers: {
      apikey: SUPABASE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${await response.text()}`);
  }
  return response.json();
}

function showError(error) {
  console.error(error);
  alert('Supabase에 저장하지 못했어요. 잠시 뒤 다시 해 주세요.');
}

// 처음 열 때: 표에서 목록 불러오기 (먼저 만든 것이 위로)
async function load() {
  try {
    const rows = await ask('GET', '?select=id,text,done,created_at&order=created_at.asc,id.asc');
    items = rows.map((row) => Object.assign({}, extras[row.id], row));
  } catch (error) {
    showError(error);
  }
  render();
}

// 추가: 표에 한 줄 넣고, 돌려받은 줄(id 포함)을 목록 맨 아래에
async function addItem(text, category, due) {
  try {
    const [row] = await ask('POST', '', { text: text });
    const item = Object.assign({ category: category, due: due, important: false }, row);
    rememberExtras(item);
    items.push(item);
  } catch (error) {
    showError(error);
  }
  render();
}

// 오늘 날짜를 마감일과 같은 모양(2026-10-26)으로
function today() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

function render() {
  const list = document.querySelector('#list');
  list.innerHTML = '';
  // 정렬: ① 중요 표시(★)한 할 일이 맨 위 ② 마감일이 가까운 순서 ③ 마감일 없는 것은 아래에, 추가한 순서대로
  const order = items.map((item, i) => i);
  order.sort((a, b) => {
    const A = items[a];
    const B = items[b];
    if (!!A.important !== !!B.important) return A.important ? -1 : 1;
    if (A.due && B.due && A.due !== B.due) return A.due < B.due ? -1 : 1;
    if (!!A.due !== !!B.due) return A.due ? -1 : 1;
    return a - b;
  });

  order.forEach((i) => {
    const item = items[i];
    if (hideDone && item.done) return;  // 숨기는 중이면 완료한 할 일은 건너뛴다

    const li = document.createElement('li');
    if (item.done) li.classList.add('done');

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = item.done;
    check.addEventListener('change', async () => {
      try {
        await ask('PATCH', `?id=eq.${item.id}`, { done: check.checked });
        item.done = check.checked;
      } catch (error) {
        showError(error);
      }
      render();
    });

    // 별표 버튼: 누르면 중요 표시(★), 다시 누르면 풀기(☆)
    const star = document.createElement('button');
    star.type = 'button';
    star.className = item.important ? 'star on' : 'star';
    star.textContent = item.important ? '★' : '☆';
    star.setAttribute('aria-label', item.important ? '중요 표시 풀기' : '중요 표시');
    star.addEventListener('click', () => {
      item.important = !item.important;
      rememberExtras(item);
      render();
    });

    const label = document.createElement('span');
    label.textContent = item.text;

    // 분류 표시 (분류가 없던 예전 할 일은 '기타')
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = item.category || '기타';

    // 마감일 표시: "10/30까지", 지났는데 체크 안 했으면 빨갛게 "10/30 지남"
    const due = document.createElement('span');
    due.className = 'due';
    if (item.due) {
      const [, month, day] = item.due.split('-');
      const date = `${Number(month)}/${Number(day)}`;
      if (!item.done && item.due < today()) {
        due.classList.add('late');
        due.textContent = `${date} 지남`;
      } else {
        due.textContent = `${date}까지`;
      }
    }

    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '삭제';
    del.addEventListener('click', async () => {
      try {
        await ask('DELETE', `?id=eq.${item.id}`);
        items.splice(items.indexOf(item), 1);
        delete extras[item.id];
        saveExtras();
      } catch (error) {
        showError(error);
      }
      render();
    });

    // 할 일 글 아래 줄에 분류와 마감일을 함께 놓기
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.append(tag, due);

    const body = document.createElement('div');
    body.className = 'body';
    body.append(label, meta);

    li.append(check, star, body, del);
    list.append(li);
  });
  // 남은 개수 = 체크하지 않은 것
  document.querySelector('#count').textContent = items.filter((item) => !item.done).length;

  // 숨기기 버튼 글자: 숨기는 중이면 숨긴 개수도 함께
  const doneCount = items.filter((item) => item.done).length;
  document.querySelector('#toggle-done').textContent = hideDone ? `완료 보이기 (${doneCount})` : '완료 숨기기';
}

// 다크 모드 ↔ 밝은 모드 (고른 모드도 브라우저 안에 저장)
const THEME_KEY = 'todo-theme';
const themeButton = document.querySelector('#theme');

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButton.textContent = theme === 'dark' ? '밝은 모드' : '다크 모드';
}

themeButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

applyTheme(localStorage.getItem(THEME_KEY) || 'light');

// 완료 숨기기 ↔ 완료 보이기
document.querySelector('#toggle-done').addEventListener('click', () => {
  hideDone = !hideDone;
  localStorage.setItem(HIDE_KEY, hideDone);
  render();
});

const button = document.querySelector('#add');
button.addEventListener('click', () => {
  const input = document.querySelector('#item');
  const text = input.value.trim();
  if (text === '') return;   // 빈 칸이면 멈춘다
  const dueInput = document.querySelector('#due');
  addItem(text, document.querySelector('#category').value, dueInput.value);  // 고른 분류·마감일과 함께 목록에 추가한다
  input.value = '';
  dueInput.value = '';
  input.focus();
});

// 입력칸에서 Enter를 눌러도 추가된다
document.querySelector('#item').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.isComposing) button.click();
});

// 화면을 여덟 번 누르면 사진 띄우기
// (버튼·입력칸·체크박스를 누른 것은 세지 않음. 평소에 쓰다가 갑자기 뜨지 않게)
const photoAddress = 'photo.png';
let clickCount = 0;

document.addEventListener('click', function (event) {
  if (event.target.closest('button, input')) {
    return;
  }
  clickCount = clickCount + 1;
  if (clickCount === 8) {
    clickCount = 0;
    showPhoto();
  }
});

function showPhoto() {
  const cover = document.createElement('div');
  cover.className = 'photo';

  const photo = document.createElement('img');
  photo.src = photoAddress;
  photo.alt = '사진';
  cover.append(photo);

  // 사진을 누르면 닫기 (이 누름은 여덟 번 세기에 넣지 않음)
  cover.addEventListener('click', function (event) {
    event.stopPropagation();
    cover.remove();
  });

  document.body.append(cover);
}

render();
load();
