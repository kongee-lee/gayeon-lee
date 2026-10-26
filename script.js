// 화면에서 쓸 부분 찾기
const item = document.getElementById('item');
const addButton = document.getElementById('add');
const list = document.getElementById('list');
const count = document.getElementById('count');

// 남은 개수 = 체크하지 않은 줄의 수
function updateCount() {
  count.textContent = list.querySelectorAll('li:not(.done)').length;
}

// 목록 한 줄 만들기: 체크박스 + 할 일 글 + 삭제 버튼
function makeItem(text) {
  const li = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = '삭제';

  li.append(checkbox, ' ' + text + ' ', deleteButton);
  return li;
}

// 추가 버튼: 입력칸의 글을 목록 맨 아래에 넣고, 입력칸 비우기
addButton.addEventListener('click', function () {
  const text = item.value.trim();
  if (text === '') {
    return; // 비어 있으면 아무 일도 안 함
  }
  list.append(makeItem(text));
  item.value = '';
  updateCount();
});

// 체크박스: 누르면 줄 긋기, 다시 누르면 원래대로
list.addEventListener('change', function (event) {
  if (event.target.type === 'checkbox') {
    event.target.parentElement.classList.toggle('done', event.target.checked);
    updateCount();
  }
});

// 삭제 버튼: 그 줄 지우기
list.addEventListener('click', function (event) {
  if (event.target.tagName === 'BUTTON') {
    event.target.parentElement.remove();
    updateCount();
  }
});

// 화면을 여덟 번 누르면 사진 띄우기
// (버튼·입력칸·체크박스를 누른 것은 세지 않음. 평소에 쓰다가 갑자기 뜨지 않게)
const photoAddress = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSj53ptg_Uf4oIPKrnw3khJ_30kT5ORipGhuyBUJcMEOA&s=10';
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

updateCount();
