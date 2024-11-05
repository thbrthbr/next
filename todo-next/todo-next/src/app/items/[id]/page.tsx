'use client';

import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import EachItem from '@/component/each-item';
import Img from '../../../asset/img.png';
import plusIcon from '../../../asset/Group 33702.png';
import Button from '../../../component/button';
import editIcon from '../../../asset/edit.png';

interface Item {
  id: number;
  imageUrl: string;
  isCompleted: boolean;
  memo: string;
  name: string;
  tenantId: string;
}

export default function Detail() {
  const router = useRouter();
  const imageRef = useRef<HTMLInputElement | null>(null);
  const memoRef = useRef<HTMLTextAreaElement | null>(null);

  const [item, setItem] = useState<Item>({
    id: -1,
    imageUrl: '',
    isCompleted: false,
    memo: '',
    name: '',
    tenantId: '',
  });
  const param = useParams();

  const getItemDetail = async () => {
    let result = await fetch(
      `https://assignment-todolist-api.vercel.app/api/thbr/items/${param.id}`,
      {
        method: 'GET',
        cache: 'no-store',
      },
    );
    const res = await result.json();
    const { id, imageUrl, isCompleted, memo, name, tenantId } = res;
    setItem({
      id,
      imageUrl: imageUrl ? imageUrl : '',
      isCompleted,
      memo: memo ? memo : '',
      name,
      tenantId,
    });
  };

  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const imageFile: File | undefined = event.target.files?.[0];
    if (imageFile) {
      const koreanRegex = /[가-힣]/;
      if (koreanRegex.test(imageFile.name)) {
        alert('파일 이름은 영어로만 해주세요');
        return;
      }
      if (imageFile.size > 5 * 1024 * 1024) {
        alert('파일이 너무 커요.');
        return;
      }
      const formData = new FormData();
      formData.append('image', imageFile);
      let result = await fetch(
        `https://assignment-todolist-api.vercel.app/api/thbr/images/upload`,
        {
          method: 'POST',
          body: formData,
          cache: 'no-store',
        },
      );
      const res = await result.json();
      setItem({ ...item, imageUrl: res.url });
    }
  };

  const goBack = () => {
    router.push('/');
  };

  const handleResizeHeight = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setItem({ ...item, memo: event.target.value });
  };

  useEffect(() => {
    getItemDetail();
  }, []);

  useEffect(() => {
    if (memoRef.current) {
      memoRef.current.style.height = 'auto';
      memoRef.current.style.height =
        Math.min(memoRef.current.scrollHeight, 200) + 'px';
    }
  }, [item.memo]);

  return (
    <div className="detail-page">
      <EachItem
        id={item.id}
        name={item}
        setName={setItem}
        status={item.isCompleted ? 'already' : 'yet'}
        isDetail={true}
        func={() => {}}
      />
      <div className="detail-page-contents">
        <div className="detail-page-image">
          {item.imageUrl ? (
            <img
              className="detail-page-image-slot"
              src={item.imageUrl as string}
            ></img>
          ) : (
            <img src={Img.src}></img>
          )}

          <input
            ref={imageRef}
            type="file"
            className="detail-page-select-file"
            id="detail-page-select-file"
            onChange={selectFile}
            accept="image/*"
          />
          <label htmlFor="detail-page-select-file">
            <div
              className="detail-page-image-insert"
              style={{
                backgroundColor: item.imageUrl
                  ? 'rgb(15, 23, 42, 0.5)'
                  : '#e2e8f0',
              }}
            >
              <img
                style={{ cursor: 'pointer' }}
                src={item.imageUrl ? editIcon.src : plusIcon.src}
              ></img>
            </div>
          </label>
        </div>
        <div className="detail-page-memo">
          <div>Memo</div>
          <div className="detail-page-memo-content-wrapper">
            <textarea
              value={item.memo as string}
              onChange={handleResizeHeight}
              ref={memoRef}
              spellCheck="false"
              className="detail-page-memo-content"
            ></textarea>
          </div>
        </div>
      </div>
      <div className="button-wrapper">
        <Button newTodo={item} func={goBack} type="edit" />
        <Button newTodo={item} func={goBack} type="delete" />
      </div>
    </div>
  );
}
