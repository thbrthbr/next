'use client';

import { LoginStore } from '@/data/store';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

export default function Signout() {
  const router = useRouter();
  const [pw, setPw] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);
  let { data: session } = useSession();

  const handleSignout = async () => {
    if (!emailRef?.current?.value) {
      alert('이메일을 입력해주세요');
      return;
    }
    if (!pwRef?.current?.value) {
      alert('비밀번호를 입력해주세요');
      return;
    }
    let confirm = window.confirm('정말 탈퇴하시겠습니까?');
    if (confirm) {
      let result = await fetch(`http://localhost:3000/api/signout`, {
        method: 'POST',
        body: JSON.stringify({
          email: emailRef?.current?.value,
          pw: pwRef?.current?.value,
        }),
        cache: 'no-store',
      });
      let final = await result.json();
      if (final.data.status == '성공') {
        alert('회원 탈퇴되셨습니다');
        signOut();
        router.push('/');
      } else {
        alert('이메일이나 비밀번호를 확인해주세요');
      }
    }
  };

  if (!session) {
    router.push('/');
  }

  // useEffect(() => {
  //   if (!session) {
  //     router.push('/');
  //   }
  // }, []);

  return (
    <div className="login-page font-insert-2">
      <br></br>
      <div className="login-inform">Signout</div>
      <div className="resposive-input-wrapper">
        <div className="resposive-input-inform">이메일 </div>
        <input className="resposive-input" type="text" ref={emailRef}></input>
      </div>
      <br></br>
      <div className="resposive-input-wrapper">
        <div className="resposive-input-inform">비밀번호 </div>
        <input className="resposive-input" type="password" ref={pwRef}></input>
      </div>
      <br></br>
      <button
        className="responsive-button"
        style={{
          backgroundColor: '#ccc',
          border: 'none',
          color: 'black',
          fontSize: '16px',
        }}
        onClick={handleSignout}
      >
        탈퇴하기
      </button>
    </div>
  );
}
