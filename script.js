const changeRandomOrder = (event) => {
  document.getElementById('select-num').style.display = event.checked ? 'block' : 'none';
}

const changeOrder = (event) => {
  document.getElementById('ordercnt').innerText = event.value;
}

const getEgo = (id) => {
  const list = [];
  for (let i = 0; i < 5; ++i) {
    const egoList = sinnerEgoList[id][i];
    if (egoList.length > 0) {
      const egoInfo = egoList[Math.floor(Math.random() * egoList.length)];
      list.push(egoInfo);
    } else {
      list.push(undefined);
    }
  }

  return list;
}

const sinnerOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const createDeck = () => {
  if (document.getElementById('randomcardbuilding').checked) createSelectableDeck();
  else createRandomDeck();
}

const selectedBuild = [];
let remainingSinners;

let selectIndex = 0;

const createSelectableDeck = () => {
  const modal = document.getElementById("modal");

  selectedBuild.length = 0;
  selectIndex = 0;
  remainingSinners = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  const html = document.documentElement;

  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth) {
    html.style.setProperty('--pico-scrollbar-width', `${scrollbarWidth}px`);
  }

  showSelections();

  html.classList.add('modal-is-open', 'modal-is-opening');

  setTimeout(() => {
    html.classList.remove('modal-is-opening');
  }, 400);
  modal.showModal();
  document.activeElement.blur();
}

const showSelections = () => {
  document.activeElement.blur();
  const title = document.getElementById('dialog-description');
  document.getElementById('reroll').removeAttribute('disabled');

  // Select order
  if (!document.getElementById('randomordercheck').checked) {
    title.innerText = `덱 빌드 짜기 - ${sinnerNames[selectIndex]}`;  
  } else if (document.getElementById('randomorder').value > selectIndex) {
    title.innerText = `덱 빌드 짜기 - 편성 순서 ${selectIndex + 1}번`;  
  } else {
    title.innerText = `덱 빌드 짜기 - 서포트 패시브`;
  }

  makeOptions();
}

const reroll = () => {
  document.getElementById('reroll').disabled = true;
  makeOptions();
}

const makeOptions = () => {
  const noOverlap = [...identities];
  for (let i = 0; i < 3; ++i) {
    const sinner = document.getElementById('randomordercheck').checked ? remainingSinners[Math.floor(Math.random() * remainingSinners.length)] : selectIndex;
    const egoList = document.getElementById('defaultego').checked ? [sinnerEgoList[sinner][0][0], undefined, undefined, undefined, undefined] : getEgo(sinner);
    const id = noOverlap[sinner][Math.floor(Math.random() * noOverlap[sinner].length)];
    noOverlap[sinner] = noOverlap[sinner].filter(e => e.no !== id.no);
    setOption(i, egoList, id, sinner);
  }
}

const options = [{}, {}, {}];

const setOption = (index, egos, id, sinnerId) => {
  document.getElementById('i' + index).innerText = id.name;
  
  document.getElementById('z' + index).innerText = egos[0] ? egos[0].name : '----';
  document.getElementById('t' + index).innerText = egos[1] ? egos[1].name : '----';
  document.getElementById('h' + index).innerText = egos[2] ? egos[2].name : '----';
  document.getElementById('w' + index).innerText = egos[3] ? egos[3].name : '----';
  document.getElementById('a' + index).innerText = egos[4] ? egos[4].name : '----';
  
  options[index] = { id, egos, sinnerId };
}

const selectOption = (index) => {
  const { egos: egoList, id, sinnerId } = options[index];

  selectedBuild.push({
    id: id.no,
    ego: egoList.map(e => e ? e.no : 0),
    order: document.getElementById('randomordercheck').checked && document.getElementById('randomorder').value > selectIndex  ? selectIndex + 1 : 0,
    name: id.name,
    sinnerId: sinnerId
  });

  remainingSinners.splice(remainingSinners.indexOf(sinnerId), 1);

  if (selectIndex >= 11) {
    let binary = '';

    selectedBuild.sort((a, b) => a.sinnerId - b.sinnerId);
    
    for (let i = 0; i < 12; i++) {
      const { id, ego, order } = selectedBuild[i];
      binary += makeSinnerBinary(id, ego, order);
    }
    binary += '00000000';

    closeModal();

    document.getElementById('hash').innerText = encryptToCode(binary);
    document.getElementById('result').style.display = 'block';

    return;
  }

  selectIndex++;

  showSelections();
}

const closeModal = () => {
  const modal = document.getElementById("modal");

  const html = document.documentElement;
  html.classList.add('modal-is-closing');
  setTimeout(() => {
    html.classList.remove('modal-is-closing', 'modal-is-open');
    html.style.removeProperty('--pico-scrollbar-width');
    modal.close();
  }, 400);
};

const createRandomDeck = () => {
  const isDefaultEgo = document.getElementById('defaultego').checked;
  const randomOrder = document.getElementById('randomordercheck').checked;
  const selection = document.getElementById('randomorder').value;

  if (randomOrder) sinnerOrder.sort(() => Math.random() - 0.5);

  let binary = '';
  for (let i = 0; i < 12; i++) {
    const id = Math.floor(Math.random() * identities[i].length) + 1;
    const order = sinnerOrder.indexOf(i + 1);

    binary += makeSinnerBinary(
      id,
      isDefaultEgo ? [1, 0, 0, 0, 0] : getEgo(i).map(ego => ego?.no ?? 0),
      randomOrder && order < selection ? order + 1 : 0
    );
  }

  binary += '00000000';

  document.getElementById('hash').innerText = encryptToCode(binary);
  document.getElementById('result').style.display = 'block';
}

const encryptToCode = (binary) => {
  let hash = '';

  for (let i = 0; i < binary.length; i += 8) {
    const ascii = String.fromCharCode(parseInt(binary.slice(i, i + 8), 2));
    hash += ascii;
  }

  const cs = pako.gzip(btoa(hash), { level: 9, mtime: 0 });
  return btoa(String.fromCharCode(...cs));
}

const makeSinnerBinary = (id, ego, order = 0) => {
  return `${
    id.toString(2).padStart(8, '0')
  }${
    order.toString(2).padStart(4, '0')
  }${
    ego.slice(0, 4).map(e => e.toString(2).padStart(7, '0')).join('')
  }${
    ego[4].toString(2).padStart(6, '0')
  }`;
}

const copyDeckNum = () => {
  const hash = document.getElementById('hash').innerText;
  navigator.clipboard.writeText(hash).then(() => {
    alert('덱 코드가 클립보드에 복사되었습니다.');
  }).catch(err => {
    console.error('클립보드 복사 실패:', err);
    alert('덱 코드 복사에 실패했습니다. 콘솔을 확인하세요.');
  });
}