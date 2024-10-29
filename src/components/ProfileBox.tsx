'use client';

import { GlobalStore } from '@/data/store';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { IoIosClose } from 'react-icons/io';

export default function ProfileBox(props: any) {
  const { chat, setChat } = GlobalStore();
  const { data: session } = useSession();
  let [show, setShow] = useState('');
  console.log(props.props);
  const obj = props.props;

  return (
    <div
      className="profile-box font-insert-2"
      style={{ display: obj.show ? 'block' : 'none' }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'end',
        }}
      >
        <div
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            obj.func('');
          }}
        >
          <IoIosClose />
        </div>
      </div>
      <div>{obj.writer}</div>
      <div style={{ fontSize: '8px' }}>{obj.email}</div>
      <br></br>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setChat(`${obj.email}:${session?.user.email}`);
          obj.func('');
        }}
      >
        메세지 보내기
      </div>
      <div>프로필 보기</div>
      <div>작성글 보기</div>
      <div>리플레이 보기</div>
    </div>
  );
}
