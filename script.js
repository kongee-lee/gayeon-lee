// 명세 ③: 추가 → 목록 맨 아래에 · 체크 → 줄이 그어지고 남은 개수 −1 · 삭제 → 목록에서 사라짐
// 완료 조건: 빈 칸은 추가 안 됨 · 체크하면 남은 개수가 바로 바뀜 · 새로고침해도 남음 · 휴대폰에서 쓸 수 있음

const KEY = 'todo-items';  // 이 브라우저 안(로컬 스토리지)에 저장할 이름
// 저장된 게 없으면(처음 열었을 때) 기본 목록 세 줄로 시작
let items = JSON.parse(localStorage.getItem(KEY)) || [
  { text: '지뱀 밥주기', done: false },
  { text: '물 마시기', done: false },
  { text: '스트레칭하기', done: false },
];

function save() {
  localStorage.setItem(KEY, JSON.stringify(items));
}

function addItem(text) {
  items.push({ text: text, done: false });  // 목록 맨 아래에
  save();
  render();
}

function render() {
  const list = document.querySelector('#list');
  list.innerHTML = '';
  items.forEach((item, i) => {
    const li = document.createElement('li');
    if (item.done) li.classList.add('done');

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = item.done;
    check.addEventListener('change', () => {
      items[i].done = check.checked;
      save();
      render();
    });

    const label = document.createElement('span');
    label.textContent = item.text;

    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '삭제';
    del.addEventListener('click', () => {
      items.splice(i, 1);
      save();
      render();
    });

    li.append(check, label, del);
    list.append(li);
  });
  // 남은 개수 = 체크하지 않은 것
  document.querySelector('#count').textContent = items.filter((item) => !item.done).length;
}

const button = document.querySelector('#add');
button.addEventListener('click', () => {
  const input = document.querySelector('#item');
  const text = input.value.trim();
  if (text === '') return;   // 빈 칸이면 멈춘다
  addItem(text);             // 목록에 추가한다
  input.value = '';
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
