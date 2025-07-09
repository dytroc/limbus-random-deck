const changeRandomOrder = (event) => {
  document.getElementById('select-num').style.display = event.checked ? 'block' : 'none';
}

const changeOrder = (event) => {
  document.getElementById('ordercnt').innerText = event.value;
}

const idCount = [
  13, // 이상
  12, // 파우스트
  11, // 돈키호테
  11, // 료슈
  12, // 뫼르소
  12, // 홍루
  12, // 히스클리프
  12, // 이스마엘
  12, // 로쟈
  13, // 싱클레어
  12, // 오티스
  12, // 그레고르
];

const ego = [
  [[1,6]/* Z */,[2,3]/* T */,[4,7]/* H */,[5]/* W */,[]/* A */], // 이상,
  [[1]/* Z */,[3,5,7]/* T */,[2,4,8]/* H */,[6]/* W */,[]/* A */], // 파우스트,
  [[1]/* Z */,[4,5,6]/* T */,[2,3,8]/* H */,[7]/* W */,[]/* A */], // 돈키호테,
  [[1,5]/* Z */,[3,6]/* T */,[2,4,8]/* H */,[7]/* W */,[]/* A */], // 료슈,
  [[1]/* Z */,[2,5,6]/* T */,[3,4]/* H */,[7]/* W */,[]/* A */], // 뫼르소,
  [[1]/* Z */,[2,4,6,7]/* T */,[3,5]/* H */,[8]/* W */,[]/* A */], // 홍루,
  [[1,5]/* Z */,[3,7]/* T */,[2,4,8]/* H */,[6]/* W */,[]/* A */], // 히스클리프,
  [[1,9]/* Z */,[2,4,7]/* T */,[3,6,8]/* H */,[5]/* W */,[]/* A */], // 이스마엘,
  [[1]/* Z */,[3,4]/* T */,[2,5,7]/* H */,[6,8]/* W */,[]/* A */], // 로쟈,
  [[1,6]/* Z */,[2,3,7]/* T */,[4,5]/* H */,[8]/* W */,[]/* A */], // 싱클레어,
  [[1]/* Z */,[3,4]/* T */,[2,5,7,8]/* H */,[6]/* W */,[]/* A */], // 오티스,
  [[1,2]/* Z */,[3,6]/* T */,[4,7,8]/* H */,[5]/* W */,[]/* A */] // 그레고르
];

const getEgo = (id) => {
  const list = [];
  for (let i = 0; i < 5; ++i) {
    const egoList = ego[id][i];
    if (egoList.length > 0) {
      const egoId = egoList[Math.floor(Math.random() * egoList.length)];
      list.push(egoId);
    } else {
      list.push(0);
    }
  }

  return list;
}

const sinnerOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const createDeck = () => {
  const isDefaultEgo = document.getElementById('defaultego').checked;
  const randomOrder = document.getElementById('randomordercheck').checked;
  const selection = document.getElementById('randomorder').value;

  if (randomOrder) sinnerOrder.sort(() => Math.random() - 0.5);

  let binary = '';
  for (let i = 0; i < idCount.length; i++) {
    const id = Math.floor(Math.random() * idCount[i]) + 1;
    const order = sinnerOrder.indexOf(i + 1);

    binary += makeSinnerBinary(
      id,
      isDefaultEgo ? [1, 0, 0, 0, 0] : getEgo(i),
      randomOrder && order < selection ? order + 1 : 0
    );
  }

  binary += '00000000';

  let hash = '';

  for (let i = 0; i < binary.length; i += 8) {
    const ascii = String.fromCharCode(parseInt(binary.slice(i, i + 8), 2));
    hash += ascii;
  }

  hash = btoa(hash);

  const cs = pako.gzip(hash, { level: 9, mtime: 0 });
  hash = btoa(String.fromCharCode(...cs));

  document.getElementById('hash').innerText = hash;
  document.getElementById('result').style.display = 'block';

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