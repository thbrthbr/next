'use client';
import Image from 'next/image';
import { Upload } from '@/func/upload';
import { useEffect, useRef, useState } from 'react';
import { GlobalStore } from '@/data/store';
import SideBar from '@/components/Sidebar';
import bannerImg from '@/asset/pk-logo.png';
import emailjs from 'emailjs-com';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [code, setCode] = useState('');
  const [pwSwitch, setPwSwitch] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const newPwRef = useRef<HTMLInputElement>(null);
  const newPwRef2 = useRef<HTMLInputElement>(null);

  const handleEmailProperty = () => {
    let emailCheck = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailCheck.test(emailRef.current?.value as string)) {
      alert('올바른 이메일 양식을 입력해주세요');
      return false;
    }
    return true;
  };

  const makeCode = (length: number) => {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  };

  const handleVerification = () => {
    if (handleEmailProperty() == false) {
      return;
    }

    const codeMake = makeCode(5);
    setCode(codeMake);
    const templateParams = {
      sending_email: emailRef.current?.value,
      code: codeMake,
      reply_to: '1212',
    };
    setVerifiedEmail(emailRef.current?.value as string);

    emailjs
      .send(
        'pk-place', // 서비스 ID
        'pk-place_pw_finder', // 템플릿 ID
        templateParams,
        process.env.NEXT_PUBLIC_AUTH_EMAIL_PUBLIC_KEY,
      )
      .then((response) => {
        alert('이메일이 성공적으로 보내졌습니다:');
        setIsEmailSent(true);
      })
      .catch((error) => {
        console.error('이메일 보내기 실패:', error);
      });
  };

  const codeChecker = () => {
    if (codeRef?.current?.value == code) {
      setPwSwitch(true);
    } else {
      alert('인증코드를 확인해주세요');
      return;
    }
  };

  const pwChanger = async () => {
    let pwCheck = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;
    if (!pwCheck.test(newPwRef?.current?.value as string)) {
      alert('영문과 특수문자를 포함한 8글자 이상의 비밀번호로 설정해주세요');
      return false;
    }
    if (newPwRef?.current?.value == newPwRef2?.current?.value) {
      let result = await fetch(`http://localhost:3000/api/pw-changer`, {
        method: 'POST',
        body: JSON.stringify({
          email: verifiedEmail,
          pw: newPwRef?.current?.value,
        }),
        cache: 'no-store',
      });

      const final = await result.json();
      if (final.data.status == '변경됨') {
        alert('비밀번호가 정상적으로 변경되었습니다');
        router.push('/login');
      }
    } else {
      alert('비밀번호를 확인해주세요');
      return;
    }
  };

  return (
    <div className="login-page font-insert-2">
      <br></br>
      <div style={{ maxWidth: '300px', width: '60vw' }}>
        <Link href="/login">
          <FaArrowLeft />
        </Link>
      </div>
      <div>비밀번호 찾기</div>
      <br></br>
      <div>
        <div className="resposive-input-inform">이메일</div>
        <input className="resposive-input" ref={emailRef}></input>
        <br></br>
        <br></br>
        <button className="responsive-button3" onClick={handleVerification}>
          이메일 인증코드 보내기
        </button>
        <br></br>
        <br></br>
        <div className="resposive-input-inform">인증코드</div>
        <input className="resposive-input" ref={codeRef}></input>
        <br></br>
        <br></br>
        <button className="responsive-button3" onClick={codeChecker}>
          인증확인
        </button>
        <br></br>
        <br></br>
        {pwSwitch && (
          <div>
            <div className="resposive-input-inform">새 비밀번호 입력</div>
            <input
              type="password"
              className="resposive-input"
              ref={newPwRef}
            ></input>
            <br></br>
            <div className="resposive-input-inform">비밀번호 확인</div>
            <input
              type="password"
              className="resposive-input"
              ref={newPwRef2}
            ></input>
            <br></br>
            <br></br>
            <button className="responsive-button3" onClick={pwChanger}>
              변경
            </button>
            <br></br>
            <br></br>
          </div>
        )}
      </div>
    </div>
  );
}
