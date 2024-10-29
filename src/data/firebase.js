// Import the functions you need from the SDKs you need

import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  writeBatch,
  doc,
  limit,
  Timestamp,
  query,
  orderBy,
  startAt,
  where,
  getCountFromServer,
  increment,
  endAt,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import CryptoJS from 'crypto-js';

// import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: 'next-app-fbdce.appspot.com',
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export function dateChanger(time) {
  const date = new Date(time);

  // 년, 월, 일 추출
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
  const day = date.getDate().toString().padStart(2, '0'); // 1일부터 시작
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  // yyyy-mm-dd hh:mm:ss 형식으로 포맷팅
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}

// const analytics = getAnalytics(app);

export async function fetchTodos() {
  const querySnapshot = await getDocs(collection(db, 'todos'));
  if (querySnapshot.empty) {
    return [];
  }
  const fetchedTodos = [];
  querySnapshot.forEach((doc) => {
    console.log(doc.id);
    console.log(doc.data());
    const aTodo = {
      id: doc.id,
      title: doc.data()['title'],
      id_done: doc.data()['is_done'],
      created_at: doc.data()['created_at'].toDate(),
    };
    // .toLocaleTimeString('ko')
    fetchedTodos.push(aTodo);
  });
  return fetchedTodos;
}

export async function fetchATodo(id) {
  if (id === null) return null;
  const todoRef = doc(db, 'todos', id);
  const todoSnap = await getDoc(todoRef);
  if (todoSnap.exists()) {
    console.log(todoSnap.data());
    const fetchedTodo = {
      id: todoSnap.id,
      title: todoSnap.data()['title'],
      id_done: todoSnap.data()['is_done'],
      created_at: todoSnap.data()['created_at'].toDate(),
    };
    return fetchedTodo;
  } else {
    console.log('범부여');
    return null;
  }
}

export async function addTodo({ title }) {
  const newTodo = doc(collection(db, 'todos'));
  const createdAtTimestamp = Timestamp.fromDate(new Date());
  const newTodoData = {
    id: newTodo.id,
    title: title,
    is_done: false,
    created_at: createdAtTimestamp,
  };
  await setDoc(newTodo, newTodoData);
  return {
    id: newTodo.id,
    title: title,
    is_done: false,
    created_at: createdAtTimestamp.toDate(),
  };
}

export async function deleteATodo(id) {
  const fetchedTodo = await fetchATodo(id);
  if (fetchedTodo === null) return null;
  await deleteDoc(doc(db, 'todos', id));
  return fetchedTodo;
}

export async function editATodo(id, { title, is_done }) {
  const fetchedTodo = await fetchATodo(id);
  if (fetchedTodo === null) return null;
  const todoRef = doc(db, 'todos', id);
  await updateDoc(todoRef, {
    title,
    is_done,
  });
  return {
    id: id,
    title,
    is_done,
    created_at: fetchedTodo.created_at,
  };
}

export async function getMoreSeveralData({ email }) {
  const querySnapshot = await getDocs(query(collection(db, 'user')));
  if (querySnapshot.empty) {
    return null;
  }
  let plus = { point: '', role: '' };
  querySnapshot.forEach((doc) => {
    if (email == doc.data()['userEmail']) {
      plus['point'] = doc.data()['point'];
      plus['role'] = doc.data()['role'];
      //추가 데이터들이 생기면 여기서 관리
    }
  });

  return plus;
}

export async function isMember({ email, pw }) {
  const querySnapshot = await getDocs(query(collection(db, 'user')));
  if (querySnapshot.empty) {
    return null;
  }
  let logined = {};
  let cryptedPW = CryptoJS.PBKDF2(pw, process.env.NEXT_PUBLIC_SALT, {
    keySize: 512 / 32,
    iterations: 1000,
  });
  const encrypted = CryptoJS.AES.encrypt(pw, cryptedPW, {
    iv: CryptoJS.enc.Hex.parse(process.env.NEXT_PUBLIC_SALT),
  });

  console.log('이거용', encrypted.toString());
  querySnapshot.forEach((doc) => {
    if (
      email == doc.data()['userEmail'] &&
      encrypted.toString() == doc.data()['userPw']
    ) {
      // logined['pw'] = doc.data()['userPw'];
      logined['email'] = doc.data()['userEmail'];
      logined['nick'] = doc.data()['userNick'];
      logined['profileImg'] = doc.data()['userImage'];
      logined['point'] = doc.data()['point'];
    }
  });
  console.log(logined);
  return logined;
}

export async function isAlreadyMember({ email }) {
  const querySnapshot = await getDocs(query(collection(db, 'user')));
  if (querySnapshot.empty) {
    return null;
  }
  let status = { isMember: 'no' };
  querySnapshot.forEach((doc) => {
    if (email == doc.data()['userEmail']) {
      status['isMember'] = 'yes';
    }
  });
  console.log(status);
  return status;
}

export async function addOrNotMember({ email, password, name, image }) {
  console.log(email);
  console.log(password);
  let cryptedPW = CryptoJS.PBKDF2(password, process.env.NEXT_PUBLIC_SALT, {
    keySize: 512 / 32,
    iterations: 1000,
  });
  const encrypted = CryptoJS.AES.encrypt(password, cryptedPW, {
    iv: CryptoJS.enc.Hex.parse(process.env.NEXT_PUBLIC_SALT),
  });
  const querySnapshot = await getDocs(collection(db, 'user'));
  const newReplay = doc(collection(db, 'user'));
  let check = 0;
  querySnapshot.forEach((doc) => {
    if (doc.data()['userEmail'] === email) {
      check = 2;
    }
  });
  if (check === 0) {
    await setDoc(newReplay, {
      id: newReplay.id,
      userEmail: email,
      userPw: encrypted.toString(),
      userNick: name,
      userImage: image,
      role: 'user',
      point: '0',
    });
    return { status: '성공' };
  } else if (check === 2) {
    return { status: '중복' };
  }
}

export async function replaceToInSiteMember({ email }) {
  const querySnapshot = await getDocs(collection(db, 'user'));
  let replaced = { email: '', name: '', image: '', point: '' };
  querySnapshot.forEach((doc) => {
    if (doc.data()['userEmail'] === email) {
      replaced.email = doc.data()['userEmail'];
      replaced.name = doc.data()['userNick'];
      replaced.image = doc.data()['userImage'];
      replaced.point = doc.data()['point'];
    }
  });
  return replaced;
}

export async function changePassword({ email, pw }) {
  let cryptedPW = CryptoJS.PBKDF2(pw, process.env.NEXT_PUBLIC_SALT, {
    keySize: 512 / 32,
    iterations: 1000,
  });
  const encrypted = CryptoJS.AES.encrypt(pw, cryptedPW, {
    iv: CryptoJS.enc.Hex.parse(process.env.NEXT_PUBLIC_SALT),
  });
  const querySnapshot = await getDocs(query(collection(db, 'user')));
  if (querySnapshot.empty) {
    return [];
  }
  let theId = '';
  querySnapshot.forEach((doc) => {
    if (doc.data()['userEmail'] == email) {
      theId = doc.id;
    }
  });
  const todoRef = doc(db, 'user', theId);
  await updateDoc(todoRef, {
    userPw: encrypted.toString(),
  });
  return { status: '변경됨' };
}

export async function addMember({ email, password }) {
  const querySnapshot = await getDocs(collection(db, 'user'));
  const newReplay = doc(collection(db, 'user'));
  // 0 -> 가입
  // 2 -> 이미 가입돼있음
  let check = 0;
  querySnapshot.forEach((doc) => {
    if (doc.data()['userEmail'] === email) {
      check = 2;
    }
  });
  if (check === 0) {
    let cryptedPW = CryptoJS.PBKDF2(password, process.env.NEXT_PUBLIC_SALT, {
      keySize: 512 / 32,
      iterations: 1000,
    });
    const encrypted = CryptoJS.AES.encrypt(password, cryptedPW, {
      iv: CryptoJS.enc.Hex.parse(process.env.NEXT_PUBLIC_SALT),
    });
    await setDoc(newReplay, {
      id: newReplay.id,
      userEmail: email,
      userPw: encrypted.toString(),
      userNick: '유저' + Date.now(),
      userImage: 'default',
      role: 'user',
      point: '0',
    });
    return { status: '성공' };
  } else if (check === 2) {
    return { status: '중복' };
  }
}

export async function deleteMember({ email, pw }) {
  const querySnapshot = await getDocs(collection(db, 'user'));
  const newReplay = doc(collection(db, 'user'));
  // 1 -> 성공
  // -1 -> 그딴 아이디 없는데? or 비밀번호 틀리신듯
  let check = -1;
  let theId = '';
  querySnapshot.forEach(async (doc) => {
    if (doc.data()['userEmail'] === email && doc.data()['userPw'] === pw) {
      theId = doc.data()['id'];
      check = 1;
    }
  });

  if (check == 1) {
    await deleteDoc(doc(db, 'user', theId));
    return { status: '성공' };
  } else {
    return { status: '실패' };
  }
}

export async function getUserProfile(email) {
  const querySnapshot = await getDocs(
    query(collection(db, 'user'), where('userEmail', '==', email)),
  );
  if (querySnapshot.empty) {
    return [];
  }
  const sendData = {};
  querySnapshot.forEach((doc) => {
    sendData.id = doc.data()['id'];
    sendData.point = doc.data()['point'];
    sendData.role = doc.data()['role'];
    sendData.userEmail = doc.data()['userEmail'];
    sendData.userImage = doc.data()['userImage'];
    sendData.userNick = doc.data()['userNick'];
  });

  return sendData;
}

export async function editProfileImage({ email, image }) {
  const querySnapshot = await getDocs(query(collection(db, 'user')));
  if (querySnapshot.empty) {
    return [];
  }
  let theId = '';
  querySnapshot.forEach((doc) => {
    if (doc.data()['userEmail'] == email) {
      theId = doc.id;
    }
  });
  const todoRef = doc(db, 'user', theId);
  await updateDoc(todoRef, {
    userImage: image,
  });

  return;
}

export async function editNick({ email, nick }) {
  const querySnapshot = await getDocs(query(collection(db, 'user')));
  if (querySnapshot.empty) {
    return [];
  }
  let theId = '';
  querySnapshot.forEach((doc) => {
    if (doc.data()['userEmail'] == email) {
      theId = doc.id;
    }
  });
  const todoRef = doc(db, 'user', theId);
  await updateDoc(todoRef, {
    userNick: nick,
  });
  return;
}

export async function getReplays() {
  const querySnapshot = await getDocs(
    query(collection(db, 'replay'), orderBy('order', 'desc')),
  );
  if (querySnapshot.empty) {
    return [];
  }
  // 최신 데이터 안에서만 찾고 싶다면 여기서 컨트롤
  const fetchedReplays = [];
  querySnapshot.forEach((doc) => {
    const aTodo = {
      id: doc.id,
      fileName: doc.data()['fileName'],
      filePassword: doc.data()['filePassword'],
      title: doc.data()['title'],
      locked: doc.data()['locked'],
      privateURL: doc.data()['privateURL'],
      path: doc.data()['path'],
      order: doc.data()['order'],
      likes: doc.data()['likes'],
    };
    fetchedReplays.push(aTodo);
  });
  return fetchedReplays;
}

export async function getMoreReplays(id) {
  const querySnapshot = await getDocs(
    query(collection(db, 'replay'), orderBy('order', 'desc')),
  );
  if (querySnapshot.empty) {
    return [];
  }
  const fetchedReplays = [];
  let count = 0;
  let start = 10 * (id - 1);
  let limit = 10 * id - 1;
  querySnapshot.forEach((doc) => {
    if (count >= start && count <= limit && doc.data()['locked'] == 'false') {
      const aTodo = {
        id: doc.id,
        fileName: doc.data()['fileName'],
        filePassword: doc.data()['filePassword'],
        title: doc.data()['title'],
        locked: doc.data()['locked'],
        privateURL: doc.data()['privateURL'],
        path: doc.data()['path'],
        order: doc.data()['order'],
        likes: doc.data()['likes'],
      };
      // .toLocaleTimeString('ko')
      fetchedReplays.push(aTodo);
    }
    count++;
  });
  return fetchedReplays;
}

export async function getReplay(id) {
  if (id === null) return null;
  const replayRef = doc(db, 'replay', id);
  const replaySnap = await getDoc(replayRef);
  if (replaySnap.exists()) {
    const fetchedReplay = {
      id: replaySnap.id,
      fileName: replaySnap.data()['fileName'],
      filePassword: replaySnap.data()['filePassword'],
      title: replaySnap.data()['title'],
      locked: replaySnap.data()['locked'],
      privateURL: replaySnap.data()['privateURL'],
      path: replaySnap.data()['path'],
      order: replaySnap.data()['order'],
      likes: replaySnap.data()['likes'],
    };

    return fetchedReplay;
  } else {
    console.log('범부여');
    return null;
  }
}

export async function getComments(id, page) {
  const querySnapshot = await getDocs(
    query(
      collection(db, 'comment'),
      where('pageid', '==', id),
      orderBy('order', 'asc'),
    ),
  );
  if (querySnapshot.empty) {
    console.log('하?');
    return [];
  }
  let count = 0;
  let start = page * 10 - 9;
  let end = page * 10;
  const fetchedComments = [];
  querySnapshot.forEach((doc) => {
    count++;
    if (start <= count && end >= count) {
      const aTodo = {
        id: doc.id,
        email: doc.data()['email'],
        nick: doc.data()['nick'],
        content: doc.data()['content'],
        pw: doc.data()['pw'],
        date: doc.data()['date'],
        isEdited: doc.data()['isEdited'],
      };
      // .toLocaleTimeString('ko')
      fetchedComments.push(aTodo);
    }
  });
  return [fetchedComments, querySnapshot.size];
}

export async function getCommentsNum() {
  const querySnapshot = await getDocs(
    query(collection(db, 'comment'), orderBy('order', 'desc')),
  );
  if (querySnapshot.empty) {
    return [];
  }
  const fetchedComments = [];
  querySnapshot.forEach((doc) => {
    fetchedComments.push({
      pageid: doc.data()['pageid'],
    });
  });
  return fetchedComments;
}

export async function addComment({ email, id, pw, content, pageid }) {
  const newComment = doc(collection(db, 'comment'));
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const hours = String(currentDate.getHours()).padStart(2, '0');
  const minutes = String(currentDate.getMinutes()).padStart(2, '0');
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;
  let data = {
    email: email,
    id: newComment.id,
    pageid: pageid,
    nick: id,
    pw: pw,
    content: content,
    order: Date.now(),
    date: formattedDateTime,
    isEdited: 'false',
  };
  await setDoc(newComment, data);
  //pageid
  const querySnapshot = await getDocs(
    query(collection(db, 'post'), where('id', '==', pageid)),
  );
  if (!querySnapshot.empty) {
    const todoRef = doc(db, 'post', pageid);
    await updateDoc(todoRef, {
      comment: increment(1),
    });
  }
  return { data: data, status: '성공' };
}

export async function editComment(id, data) {
  const querySnapshot = await getDocs(query(collection(db, 'comment')));
  if (querySnapshot.empty) {
    return [];
  }
  let theId = '';
  querySnapshot.forEach((doc) => {
    if (doc.data()['id'] == id) {
      theId = doc.id;
    }
  });
  const todoRef = doc(db, 'comment', theId);
  await updateDoc(todoRef, {
    content: data.content,
    isEdited: 'true',
  });
  return;
}

export async function deleteComment(id) {
  const docRef = doc(db, 'comment', id);
  const docSnapshot = await getDoc(docRef);
  if (docSnapshot.exists()) {
    const todoRef = doc(db, 'post', docSnapshot.data()['pageid']);
    const isIt = await getDoc(todoRef);
    if (isIt.exists()) {
      await updateDoc(todoRef, {
        comment: increment(-1),
      });
    }
  }
  await deleteDoc(docRef);
  return { status: '성공' };
}

export async function likeControl(id, userId, type, which) {
  let replayRef;
  if (type == 'replay') {
    replayRef = doc(db, 'replay', id);
  } else if (type == 'post') {
    replayRef = doc(db, 'post', id);
  }
  if (which == 'like') {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'isLiked'),
        where('mediaId', '==', id),
        where('userId', '==', userId),
      ),
    );
    const replaySnap = await getDoc(replayRef);
    let likes = replaySnap.data()['likes'];
    if (querySnapshot.empty) {
      //좋아요 누른적이 없다는뜻
      await updateDoc(replayRef, {
        likes: increment(+1),
      });
      const newIsLiked = doc(collection(db, 'isLiked'));
      await setDoc(newIsLiked, {
        id: newIsLiked.id,
        mediaId: id,
        userId,
      });
      return { status: '좋아요변경', likes: likes + 1 };
    } else {
      //좋아요 취소
      let isLikedId = '';
      querySnapshot.forEach((doc) => {
        isLikedId = doc.data()['id'];
      });
      await updateDoc(replayRef, {
        likes: increment(-1),
      });
      await deleteDoc(doc(db, 'isLiked', isLikedId));
      return { status: '좋아요변경', likes: likes - 1 };
    }
  } else {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'isHated'),
        where('mediaId', '==', id),
        where('userId', '==', userId),
      ),
    );
    const replaySnap = await getDoc(replayRef);
    let hates = replaySnap.data()['hates'];
    if (querySnapshot.empty) {
      //싫어요 누른적이 없다는뜻
      await updateDoc(replayRef, {
        hates: increment(+1),
      });
      const newIsLiked = doc(collection(db, 'isHated'));
      await setDoc(newIsLiked, {
        id: newIsLiked.id,
        mediaId: id,
        userId,
      });
      return { status: '싫어요변경', hates: hates + 1 };
    } else {
      //좋아요 취소
      let isHatedId = '';
      querySnapshot.forEach((doc) => {
        isHatedId = doc.data()['id'];
      });
      await updateDoc(replayRef, {
        hates: increment(-1),
      });
      await deleteDoc(doc(db, 'isHated', isHatedId));
      return { status: '싫어요변경', hates: hates - 1 };
    }
  }
}

// export async function hateControl(id, userId) {
//   const replayRef = doc(db, 'replay', id);
//   const querySnapshot = await getDocs(
//     query(
//       collection(db, 'isHated'),
//       where('mediaId', '==', id),
//       where('userId', '==', userId),
//     ),
//   );
//   const replaySnap = await getDoc(replayRef);
//   let likes = Number(replaySnap.data()['likes']);
//   if (querySnapshot.empty) {
//     //싫어요 누른적이 없다는뜻
//     await updateDoc(replayRef, {
//       likes: String(likes + 1),
//     });
//     const newIsLiked = doc(collection(db, 'isLiked'));
//     await setDoc(newIsLiked, {
//       id: newIsLiked.id,
//       mediaId: id,
//       userId,
//     });
//     return { status: '추가성공', likes: String(likes + 1) };
//   } else {
//     //좋아요 취소
//     let isLikedId = '';
//     querySnapshot.forEach((doc) => {
//       isLikedId = doc.data()['id'];
//     });
//     await updateDoc(replayRef, {
//       likes: String(likes - 1),
//     });
//     await deleteDoc(doc(db, 'isLiked', isLikedId));
//     return { status: '취소성공', likes: String(likes - 1) };
//   }
// }

export async function searchReplay(title, page) {
  if (title === null) return null;
  const querySnapshot = await getDocs(
    query(collection(db, 'replay'), orderBy('order', 'desc')),
  );
  if (querySnapshot.empty) {
    return [];
  }
  const fetchedReplays = [];
  let count = 0;
  let start = 10 * (page - 1);
  let limit = 10 * page - 1;
  querySnapshot.forEach((doc) => {
    if (
      count >= start &&
      count <= limit &&
      doc.data()['title'].includes(title)
    ) {
      const aTodo = {
        id: doc.id,
        fileName: doc.data()['fileName'],
        filePassword: doc.data()['filePassword'],
        title: doc.data()['title'],
        locked: doc.data()['locked'],
        privateURL: doc.data()['privateURL'],
        path: doc.data()['path'],
        order: doc.data()['order'],
        likes: doc.data()['likes'],
      };
      // .toLocaleTimeString('ko')
      fetchedReplays.push(aTodo);
    }
    if (doc.data()['title'].includes(title)) {
      count++;
    }
  });
  return fetchedReplays;
}

export async function searchCodeReplay(code) {
  if (code === null) return null;

  const querySnapshot = await getDocs(
    query(collection(db, 'replay'), where('privateURL', '==', code)),
  );
  if (querySnapshot.empty) {
    return [];
  }
  const fetchedReplay = [];
  querySnapshot.forEach((doc) => {
    const aTodo = {
      id: doc.id,
      fileName: doc.data()['fileName'],
      filePassword: doc.data()['filePassword'],
      title: doc.data()['title'],
      locked: doc.data()['locked'],
      privateURL: doc.data()['privateURL'],
      path: doc.data()['path'],
      order: doc.data()['order'],
      likes: doc.data()['likes'],
    };
    fetchedReplay.push(aTodo);
  });

  return fetchedReplay;
}

export async function addReplay({
  title,
  fileName,
  filePassword,
  locked,
  privateURL,
  path,
  order,
}) {
  const newReplay = doc(collection(db, 'replay'));
  await setDoc(newReplay, {
    id: newReplay.id,
    title,
    fileName,
    filePassword,
    locked,
    privateURL,
    path,
    order,
    likes: '0',
  });
  return {
    id: newReplay.id,
    title,
    fileName,
    filePassword,
    locked,
    privateURL,
    path,
    order,
    likes: '0',
  };
}

export async function deleteReplay(id) {
  await deleteDoc(doc(db, 'replay', id));
  return { status: '성공' };
}

export async function boardCheck() {
  const querySnapshot = await getDocs(query(collection(db, 'board')));
  if (querySnapshot.empty) {
    return [];
  }
  let boardLists = [];
  querySnapshot.forEach(async (doc) => {
    boardLists.push(doc.data()['boardName']);
  });
  return boardLists;
}

export async function getBoards() {
  const coll = collection(db, 'board');
  const boardList = await boardCheck();
  const snapshot = await getCountFromServer(coll);
  let boardCount = snapshot.data().count;
  const querySnapshot2 = await getDocs(
    query(collection(db, 'post'), orderBy('postNum', 'desc')),
  );
  let boards = {};
  if (!querySnapshot2.empty) {
    let count = 0;
    for (const post of querySnapshot2.docs) {
      if (!boardList.includes(post.data()['boardName'])) continue;
      if (!boards[post.data()['boardName']]) {
        boards[post.data()['boardName']] = [
          {
            // boardName: post.data()['boardName'],
            postNum: post.data()['postNum'],
            date: dateChanger(post.data()['postNum']),
            likes: post.data()['likes'],
            hates: post.data()['hates'],
            title: post.data()['title'],
            views: post.data()['views'],
            writer: post.data()['writer'],
            email: post.data()['email'],
            comment: post.data()['comment'],
          },
        ];
        count++;
      } else {
        if (boards[post.data()['boardName']].length < 5) {
          boards[post.data()['boardName']] = [
            ...boards[post.data()['boardName']],
            {
              // boardName: post.data()['boardName'],
              postNum: post.data()['postNum'],
              date: dateChanger(post.data()['postNum']),
              likes: post.data()['likes'],
              hates: post.data()['hates'],
              title: post.data()['title'],
              views: post.data()['views'],
              writer: post.data()['writer'],
              email: post.data()['email'],
              comment: post.data()['comment'],
            },
          ];
          count++;
        }
      }
      if (count == boardCount * 5) {
        break;
      }
    }
  }
  return boards;
}
// export async function getBoards() {
//   const querySnapshot = await getDocs(query(collection(db, 'board')));
// if (querySnapshot.empty) {
//   return [];
// }
//   const fetchedPosts = [];
//   querySnapshot.forEach(async (doc) => {
//     fetchedPosts.push({
//       id: doc.data()['id'],
//       boardName: doc.data()['boardName'],
//       // posts: JSON.stringify(posts),
//     });
//     console.log(fetchedPosts);
//   });

//   return fetchedPosts;
// }

export async function getSpecificBoard({ id, page }) {
  const querySnapshot = await getDocs(
    query(
      collection(db, 'post'),
      where('boardName', '==', id),
      orderBy('postNum', 'desc'),
    ),
  );

  if (querySnapshot.empty) {
    return [];
  }
  const fetchedPosts = [];
  let idx = 0;
  querySnapshot.forEach((doc) => {
    if (idx >= page * 10 - 10 && idx < page * 10) {
      fetchedPosts.push({
        id: doc.data()['id'],
        boardName: doc.data()['boardName'],
        content: doc.data()['content'],
        likes: doc.data()['likes'],
        hates: doc.data()['hates'],
        postNum: doc.data()['postNum'],
        title: doc.data()['title'],
        views: doc.data()['views'],
        writer: doc.data()['writer'],
        email: doc.data()['email'],
        comment: doc.data()['comment'],
      });
    }
    idx++;
  });
  return [fetchedPosts, querySnapshot.size];
}

export async function getSearchPosts({ id, option, value, page }) {
  const querySnapshot = await getDocs(
    query(
      collection(db, 'post'),
      where('boardName', '==', id),
      orderBy('postNum', 'desc'),
    ),
  );

  if (querySnapshot.empty) {
    return [];
  }
  const fetchedPosts = [];
  if (option == 'all') {
    querySnapshot.forEach(async (doc) => {
      if (
        doc.data()['content'].includes(value) ||
        doc.data()['writer'].includes(value) ||
        doc.data()['title'].includes(value)
      ) {
        fetchedPosts.push({
          id: doc.data()['id'],
          boardName: doc.data()['boardName'],
          content: doc.data()['content'],
          likes: doc.data()['likes'],
          hates: doc.data()['hates'],
          postNum: doc.data()['postNum'],
          title: doc.data()['title'],
          views: doc.data()['views'],
          writer: doc.data()['writer'],
          email: doc.data()['email'],
          comment: doc.data()['comment'],
        });
      }
    });
  } else if (option == 'title') {
    querySnapshot.forEach(async (doc) => {
      if (doc.data()['title'].includes(value)) {
        fetchedPosts.push({
          id: doc.data()['id'],
          boardName: doc.data()['boardName'],
          content: doc.data()['content'],
          likes: doc.data()['likes'],
          hates: doc.data()['hates'],
          postNum: doc.data()['postNum'],
          title: doc.data()['title'],
          views: doc.data()['views'],
          writer: doc.data()['writer'],
          email: doc.data()['email'],
          comment: doc.data()['comment'],
        });
      }
    });
  } else if (option == 'writer') {
    querySnapshot.forEach(async (doc) => {
      if (doc.data()['writer'].includes(value)) {
        fetchedPosts.push({
          id: doc.data()['id'],
          boardName: doc.data()['boardName'],
          content: doc.data()['content'],
          likes: doc.data()['likes'],
          hates: doc.data()['hates'],
          postNum: doc.data()['postNum'],
          title: doc.data()['title'],
          views: doc.data()['views'],
          writer: doc.data()['writer'],
          email: doc.data()['email'],
          comment: doc.data()['comment'],
        });
      }
    });
  } else if (option == 'content') {
    querySnapshot.forEach(async (doc) => {
      if (doc.data()['content'].includes(value)) {
        fetchedPosts.push({
          id: doc.data()['id'],
          boardName: doc.data()['boardName'],
          content: doc.data()['content'],
          likes: doc.data()['likes'],
          hates: doc.data()['hates'],
          postNum: doc.data()['postNum'],
          title: doc.data()['title'],
          views: doc.data()['views'],
          writer: doc.data()['writer'],
          email: doc.data()['email'],
          comment: doc.data()['comment'],
        });
      }
    });
  } else if (option == 'title_content') {
    querySnapshot.forEach(async (doc) => {
      if (
        doc.data()['content'].includes(value) ||
        doc.data()['title'].includes(value)
      ) {
        fetchedPosts.push({
          id: doc.data()['id'],
          boardName: doc.data()['boardName'],
          content: doc.data()['content'],
          likes: doc.data()['likes'],
          hates: doc.data()['hates'],
          postNum: doc.data()['postNum'],
          title: doc.data()['title'],
          views: doc.data()['views'],
          writer: doc.data()['writer'],
          email: doc.data()['email'],
          comment: doc.data()['comment'],
        });
      }
    });
  }
  return fetchedPosts;
}

export async function getSearchPosts2({ id, option, value, page }) {
  let querySnapshot;
  const fetchedPosts = [];
  if (option == 'all') {
    querySnapshot = await getDocs(
      query(
        collection(db, 'post'),
        where('boardName', '==', id),
        where('content', '==', value),
        where('writer', '==', value),
        where('title', '==', value),
        orderBy('postNum', 'desc'),
      ),
    );
  } else if (option == 'title') {
    querySnapshot = await getDocs(
      query(
        collection(db, 'post'),
        where('boardName', '==', id),
        where('title', '==', value),
        orderBy('postNum', 'desc'),
      ),
    );
  } else if (option == 'writer') {
    querySnapshot = await getDocs(
      query(
        collection(db, 'post'),
        where('boardName', '==', id),
        where('writer', '==', value),
        orderBy('postNum', 'desc'),
      ),
    );
  } else if (option == 'content') {
    querySnapshot = await getDocs(
      query(
        collection(db, 'post'),
        where('boardName', '==', id),
        where('writer', '==', value),
        orderBy('postNum', 'desc'),
      ),
    );
  } else if (option == 'title_content') {
    querySnapshot = await getDocs(
      query(
        collection(db, 'post'),
        where('boardName', '==', id),
        where('content', '==', value),
        where('title', '==', value),
        orderBy('postNum', 'desc'),
      ),
    );
  }

  if (querySnapshot.empty) {
    return [];
  }
  querySnapshot.forEach((doc) => {
    fetchedPosts.push({
      id: doc.data()['id'],
      boardName: doc.data()['boardName'],
      content: doc.data()['content'],
      likes: doc.data()['likes'],
      hates: doc.data()['hates'],
      postNum: doc.data()['postNum'],
      title: doc.data()['title'],
      views: doc.data()['views'],
      writer: doc.data()['writer'],
      email: doc.data()['email'],
      comment: doc.data()['comment'],
    });
  });
  return fetchedPosts;
}

export async function addPost(data) {
  let { boardName, content, title, writer, email, profileImage } = data;
  const newPost = doc(collection(db, 'post'));
  const newPostData = {
    id: newPost.id,
    postNum: Date.now(),
    boardName,
    title,
    content,
    comment: 0,
    views: 0,
    likes: 0,
    hates: 0,
    writer,
    email,
    profileImage,
  };
  await setDoc(newPost, newPostData);
  return newPostData;
}

//시험용
export async function addPost2(data) {
  let { boardName, content, title, writer, email } = data;
  const superduper = [];
  const batch = writeBatch(db);
  for (let i = 0; i < 100; i++) {
    const newPost = doc(collection(db, 'post')); // 매번 새로운 문서 참조 생성
    const newPostData = {
      id: newPost.id,
      postNum: Date.now() + i,
      boardName,
      title: i,
      content,
      comment: 0,
      views: 0,
      likes: 0,
      hates: 0,
      writer,
      email,
    };

    newPostData.id = i + Date.now() + 'gogo'; // 각 문서에 고유한 ID 부여
    superduper.push({ ...newPostData }); // 객체를 복사하여 배열에 푸시
  }

  // 배치로 문서 생성
  superduper.forEach((item) => {
    const docRef = doc(collection(db, 'post'), item.id); // 각 문서 참조 생성
    batch.set(docRef, item); // batch로 set 작업 추가
  });

  await batch.commit(); // 배치 커밋
  return superduper; // 모든 문서 데이터 반환
}

export async function getPost({ num }) {
  const querySnapshot = await getDocs(
    query(collection(db, 'post'), where('postNum', '==', parseInt(num))),
  );

  if (querySnapshot.empty) {
    return [];
  }
  const fetchedPosts = [];
  let addviews;
  let tempid;
  querySnapshot.forEach((doc) => {
    addviews = doc.data()['views'] + 1;
    tempid = doc.data()['id'];
    fetchedPosts.push({
      id: doc.data()['id'],
      boardName: doc.data()['boardName'],
      content: doc.data()['content'],
      likes: doc.data()['likes'],
      hates: doc.data()['hates'],
      postNum: doc.data()['postNum'],
      title: doc.data()['title'],
      views: addviews,
      writer: doc.data()['writer'],
      email: doc.data()['email'],
      profileImage: doc.data()['profileImage'],
      comment: doc.data()['comment'],
    });
  });

  const todoRef = doc(db, 'post', tempid);
  const isIt = await getDoc(todoRef);
  if (isIt.exists()) {
    await updateDoc(todoRef, {
      views: increment(1),
    });
  }

  return fetchedPosts;
}

export async function getEditPost({ num, id }) {
  const querySnapshot = await getDocs(
    query(collection(db, 'post'), where('postNum', '==', parseInt(num))),
  );

  if (querySnapshot.empty) {
    return [];
  }
  const fetchedPosts = [];
  querySnapshot.forEach((doc) => {
    if (id == doc.data()['email']) {
      fetchedPosts.push({
        id: doc.data()['id'],
        boardName: doc.data()['boardName'],
        content: doc.data()['content'],
        likes: doc.data()['likes'],
        hates: doc.data()['hates'],
        postNum: doc.data()['postNum'],
        title: doc.data()['title'],
        views: doc.data()['views'],
        writer: doc.data()['writer'],
        email: doc.data()['email'],
        comment: doc.data()['comment'],
      });
    }
  });
  return fetchedPosts;
}

export async function deletePost(num) {
  const querySnapshot = await getDocs(collection(db, 'post'));
  let theId = '';
  querySnapshot.forEach(async (doc) => {
    if (doc.data()['postNum'] == num) {
      theId = doc.data()['id'];
    }
  });
  console.log(theId);
  await deleteDoc(doc(db, 'post', theId));
  return { status: '성공' };
}

export async function editPost(num, data) {
  const querySnapshot = await getDocs(query(collection(db, 'post')));
  if (querySnapshot.empty) {
    return [];
  }
  let theId = '';
  querySnapshot.forEach((doc) => {
    if (doc.data()['postNum'] == num) {
      theId = doc.id;
    }
  });
  const todoRef = doc(db, 'post', theId);
  await updateDoc(todoRef, {
    title: data.title,
    content: data.content,
    profileImage: data.profileImage,
  });
  return;
}

export async function getLadder({ season }) {
  const querySnapshot = await getDocs(
    query(collection(db, 'ladder'), where('season', '==', +season)),
  );

  if (querySnapshot.empty) {
    return [];
  }
  const fetchedPosts = [];
  querySnapshot.forEach((doc) => {
    fetchedPosts.push({
      id: doc.data()['id'],
      user: doc.data()['user'],
      score: doc.data()['score'],
      decay: doc.data()['decay'],
      lastUpdate: doc.data()['lastUpdate'],
      decayUpdate: doc.data()['decayUpdate'],
      season: doc.data()['season'],
      timestamp: doc.data()['timestamp'],
    });
  });

  return fetchedPosts;
}

export async function addLadder(data) {
  const batch = writeBatch(db);
  let todayData = data[0];
  let season = data[1];
  const querySnapshot = await getDocs(
    query(collection(db, 'ladder'), where('season', '==', season)),
  );
  const utcDate = new Date();
  const koreaTime = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
  const koreaTimeString = koreaTime
    .toISOString()
    .replace('T', ' ')
    .replace('.000Z', '');
  let todayString = koreaTimeString.split(' ')[0];
  let membersToday = Object.keys(todayData);
  let existingUsers = new Set();
  querySnapshot.forEach((doc) => {
    const user = doc.data()['user'];
    if (membersToday.includes(user)) {
      const docRef = doc.ref;
      batch.update(docRef, {
        score: todayData[user],
        decay: 0,
        lastUpdate: todayString,
        decayDate: todayString,
        timestamp: Date.now(),
      });
      existingUsers.add(user);
    }
  });
  membersToday.forEach((user) => {
    if (!existingUsers.has(user)) {
      const newDocRef = doc(collection(db, 'ladder'));
      batch.set(newDocRef, {
        id: newDocRef.id,
        user: user,
        score: todayData[user],
        season: season,
        decay: 0,
        lastUpdate: todayString,
        decayDate: todayString,
        timestamp: Date.now(),
      });
    }
  });

  await batch.commit();
  return [];
}

// const newPost = doc(collection(db, 'ladder'));
// const newPostData = {
//   id: newPost.id,
//   user,
//   score,
//   decay,
//   lastUpdate,
//   decayUpdate,
//   season,
// };
// await setDoc(newPost, newPostData);

export async function tempAddLadder(data) {
  let { user, score, decay, lastUpdate, decayUpdate, season } = data;
  const newPost = doc(collection(db, 'ladder'));
  const newPostData = {
    id: newPost.id,
    user,
    score,
    decay,
    lastUpdate,
    decayUpdate,
    season,
  };
  await setDoc(newPost, newPostData);
  return newPostData;
}

export async function getSeasonData() {
  const querySnapshot = await getDocs(query(collection(db, 'ladder-season')));

  if (querySnapshot.empty) {
    return [];
  }
  const fetchedData = [];
  querySnapshot.forEach((doc) => {
    fetchedData.push({
      season: doc.data()['season'],
      banner: doc.data()['banner'],
    });
  });

  return fetchedData;
}

export async function decay(season) {
  const batch = writeBatch(db);
  const querySnapshot = await getDocs(
    query(
      collection(db, 'ladder'),
      where('season', '==', season),
      orderBy('score', 'desc'),
      limit(4),
    ),
  );
  if (querySnapshot.empty) {
    return [];
  }
  const utcDate = new Date();
  const koreaTime = new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
  const koreaTimeString = koreaTime
    .toISOString()
    .replace('T', ' ')
    .replace('.000Z', '');
  let todayString = koreaTimeString.split(' ')[0];
  querySnapshot.forEach((doc) => {
    let userLastDecay = doc.data()['decayDate'];
    const date1 = new Date(todayString);
    const date2 = new Date(doc.data()['lastUpdate']);
    const timeDifference = Math.abs(date1 - date2);
    const daysDifference = timeDifference / (1000 * 60 * 60 * 24);
    if (
      daysDifference >= 7 &&
      userLastDecay !== todayString &&
      doc.data()['score'] > 1500
    ) {
      let decayAmount2 = (doc.data()['decay'] + 3) * 6;
      const docRef = doc.ref;
      batch.update(docRef, {
        score:
          doc.data()['score'] - decayAmount2 >= 1500
            ? doc.data()['score'] - decayAmount2
            : 1500,
        decay: doc.data()['decay'] + 1,
        decayDate: todayString,
      });
    }
  });
  await batch.commit();
  return [];
}

export async function isUser(email) {
  const querySnapshot = await getDocs(
    query(collection(db, 'user'), where('userEmail', '==', email)),
  );
  if (querySnapshot.empty) {
    return [];
  }
  const fetchedData = [];
  querySnapshot.forEach((doc) => {
    fetchedData.push({
      id: doc.data()['id'],
      point: doc.data()['point'],
      role: doc.data()['role'],
      userEmail: doc.data()['userEmail'],
      userNick: doc.data()['userNick'],
    });
  });

  return fetchedData;
}

export async function changeRole(data) {
  const todoRef = doc(db, 'user', data.id);
  await updateDoc(todoRef, {
    role: data.role,
  });
  return [{ status: '변경성공' }];
  //  return fetchedData;
}

export async function addBoard(data) {
  // function hasFinalConsonant(char) {
  //   const charCode = char.charCodeAt(0); // 문자의 유니코드 값
  //   if (charCode < 0xac00 || charCode > 0xd7a3) {
  //     // 한글이 아닌 경우 처리
  //     return false;
  //   }

  //   const finalConsonantIndex = (charCode - 0xac00) % 28; // 종성 확인
  //   return finalConsonantIndex !== 0; // 나머지가 0이면 받침이 없음
  // }
  const batch = writeBatch(db);
  const newDocRef1 = doc(collection(db, 'board'));
  batch.set(newDocRef1, {
    id: newDocRef1.id,
    boardName: data.newBoardName,
  });

  // 두 번째 컬렉션에 문서 추가
  const newDocRef2 = doc(collection(db, 'post'));
  batch.set(newDocRef2, {
    boardName: data.newBoardName,
    email: 'pkplaceofficial@gmail.com', //git.ignore로 숨길수도있음
    comment: 0,
    content: `<p>게시판 주제에 무관할 글일 시 무통보 삭제될 수 있습니다.</p>`,
    hates: 0,
    id: newDocRef2.id,
    likes: 0,
    postNum: Date.now(),
    profileImage: 'https://i.ibb.co/r5sMCLj/2024-10-20-015253.png',
    title: `${data.newBoardName}에 관련된 글을 써주세요`,
    views: 0,
    writer: '포켓플레이스',
  });
  await batch.commit();
  return [];
}

export async function deleteBoard(data) {
  console.log(data.boardName);
  // 게시판만 삭제할지 게시판 내 모든 글을 삭제할지 정해야함
  // 게시판만 삭제하자 -> 사유 : 게시판 내 글이 500개 이상일 경우 처리가 너무 힘듬
  const querySnapshot = await getDocs(
    query(collection(db, 'board'), where('boardName', '==', data.boardName)),
  );
  let theId = '';
  querySnapshot.forEach((doc) => {
    theId = doc.id;
  });
  console.log(theId);
  await deleteDoc(doc(db, 'board', theId));
  return { status: '성공' };
}
