'use client';

import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import {
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from 'firebase/storage';
import { storage } from '@/data/firebase';
import { Quill } from 'react-quill';
import registerQuillSpellChecker from 'react-quill-spell-checker';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    return function comp({ forwardedRef, ...props }: any) {
      return <RQ ref={forwardedRef} {...props} />;
    };
  },
  { ssr: false, loading: () => <div>wait</div> },
);

// registerQuillSpellChecker(Quill);

export default function TextEditor() {
  const { data: session, update } = useSession();
  const isMounted = useRef(null);
  const param = useSearchParams();
  const router = useRouter();
  const quillElement = useRef();
  const [title, setTitle] = useState('');
  const [dom, setDom] = useState('');
  // const { register, handleSubmit } = useForm();
  const [img, setImg] = useState([] as any);

  const quillRef = useRef<any>();

  const imageHandler = () => {
    const input = document.createElement('input');

    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');

    input.click();

    input.onchange = async (event: any) => {
      const file: File = event?.target?.files[0];

      const path =
        'images/community/' +
        new Date().getFullYear() +
        '년/' +
        (new Date().getMonth() + 1) +
        '월/';
      const fileNm = Date.now() + file.name;
      const storageRef = ref(storage, path + fileNm);

      uploadBytes(storageRef, file).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downUrl) => {
          quillRef.current?.editor?.insertEmbed(
            quillRef.current.getEditor().getSelection().index,
            'image',
            downUrl,
          );

          // setImg((prev: []) => [...prev, downUrl]);
        });
      });
    };
  };

  // const quillImage = useMemo(() => {
  //   const result = Array.from(
  //     dom.replace(/amp;/g, '').matchAll(/<img[^>]+src=["']([^'">]+)['"]/gi),
  //   );
  //   return result.map((item) => item.pop() || '');
  // }, [dom]);

  // useEffect(() => {
  //   const dellFile = img?.filter((item: any) => !quillImage.includes(item));
  //   if (dellFile.length) {
  //     dellFile.forEach((item: any) => {
  //       const desertRef = ref(storage, item);
  //       deleteObject(desertRef).then(() => {
  //         const chageFile = img?.filter((item: any) =>
  //           quillImage.includes(item),
  //         );
  //         setImg(chageFile);
  //       });
  //     });
  //   }
  // }, [img, quillImage]);

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'align',
    'strike',
    'script',
    'blockquote',
    'background',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'color',
    'code-block',
  ];

  const modules = useMemo(
    () => ({
      // spellChecker: {
      //   disableNativeSpellcheck: true,
      // },
      toolbar: {
        container: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],

          [{ header: 1 }, { header: 2 }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ direction: 'rtl' }],

          [{ size: ['small', false, 'large', 'huge'] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],

          [{ color: [] }, { background: [] }],
          [{ font: [] }],
          [{ align: [] }],

          ['clean'],
          ['image', 'video'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [],
  );

  const onValid = () => {
    const requestObj = {
      id: Date.now(),
      title: title,
      content: quillRef.current?.editor.getText(),
      img: JSON.stringify(img),
      dom: dom,
    };
    // communityWrite(requestObj);
  };

  const linkify = (text: any) => {
    const urlPattern =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    let message = urlPattern.test(text.text)
      ? `<a href="${text.text}" target="_blank">${text.text}</a>`
      : `<p>${text.text}</p>`;
    return message;
  };

  const postConfirm = async () => {
    if (!title) {
      alert('제목을 입력해주세요');
      return;
    }
    if (title.length > 60) {
      alert('제목길이를 줄여주세요 (최대 60자)');
      return;
    }
    if (!dom) {
      alert('내용을 입력해주세요');
      return;
    }
    let result = await fetch(`http://localhost:3000/api/post`, {
      method: 'POST',
      body: JSON.stringify({
        boardName: decodeURIComponent(param.get('id') as string),
        content: dom,
        title: title,
        writer: session?.user.name,
        email: session?.user.email,
        profileImage: session?.user.image,
      }),
      cache: 'no-store',
    });
    const res = await result.json();
    if (res.message === '성공') {
      alert('글을 작성하셨습니다');
      router.push(`/post-page?id=${param.get('id')}&num=${res.data.postNum}`);
    } else {
      alert('해당 게시판은 존재하지 않습니다');
      router.push(`/community`);
    }
  };

  // useEffect(() => {
  //   console.log(dom);
  //   if (dom.includes('<p>http://')) {
  //     let copy = dom.split('<p>').join('').split('</p>');
  //     let copy2 = dom;
  //     copy.forEach((x) => {
  //       if (x.includes('http://')) {
  //         console.log(x);
  //         copy2.replace(`<p>${x}</p>`, `<a href='${x}'>${x}</a>`);
  //         setDom(copy2);
  //       }
  //       console.log(copy2);
  //     });
  //   }
  // }, [dom]);

  useEffect(() => {
    if (isMounted) {
      if (!session?.user) {
        alert('로그인을 해야 글 작성이 가능합니다');
        router.push(`/community/${param.get('id')}`);
      }
    }
  }, [isMounted]);

  return (
    <div>
      <div className="post-title-area">
        <input
          className="post-title"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          placeholder="제목"
        ></input>
        <button
          className="post-confirm-button font-insert"
          onClick={postConfirm}
        >
          작성
        </button>
      </div>
      <div>
        <ReactQuill
          ref={quillElement}
          placeholder="내용"
          forwardedRef={quillRef}
          modules={modules}
          formats={formats}
          theme="snow"
          style={{ height: '400px' }}
          value={dom}
          onChange={setDom}
        />
      </div>
      <br></br>
      <br></br>
      <br></br>
    </div>
  );
}
