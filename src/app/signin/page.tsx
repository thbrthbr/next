'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import emailjs from 'emailjs-com';
import { FaCheck } from 'react-icons/fa';

export default function Signin() {
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const codeRef = useRef<HTMLInputElement>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [code, setCode] = useState('');
  const [codeChecked, setCodeChecked] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  const handleEmailProperty = () => {
    let emailCheck = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailCheck.test(emailRef.current?.value as string)) {
      alert('올바른 이메일 양식을 입력해주세요');
      return false;
    }
    return true;
  };

  const handlePwProperty = () => {
    let pwCheck = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,15}$/;
    if (!pwCheck.test(passwordRef.current?.value as string)) {
      alert('영문과 특수문자를 포함한 8글자 이상의 비밀번호로 설정해주세요');
      return false;
    }
    return true;
  };

  const handleSignin = async () => {
    if (handlePwProperty() == false) {
      return;
    }
    if (codeChecked) {
      let result = await fetch(`http://localhost:3000/api/signin`, {
        method: 'POST',
        body: JSON.stringify({
          email: verifiedEmail,
          password: passwordRef.current?.value,
        }),
        cache: 'no-store',
      });
      const final = await result.json();
      if (final.data.status == '성공') {
        alert('회원가입 되셨습니다');
        router.push('/login');
      } else if (final.data.status == '중복') {
        alert('이미 가입되어있는 이메일입니다');
      }
    } else {
      alert('이메일 인증을 해주세요');
    }
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

  const handleVerification = async () => {
    if (handleEmailProperty() == false) {
      return;
    }
    let result = await fetch(`http://localhost:3000/api/member-check`, {
      method: 'POST',
      body: JSON.stringify({
        email: emailRef.current?.value,
      }),
      cache: 'no-store',
    });
    const final = await result.json();
    if (final.data.isMember == 'no') {
      const codeMake = makeCode(5);
      setCode(codeMake);
      const templateParams = {
        sending_email: emailRef.current?.value,
        code: codeMake,
        reply_to: '1212',
      };

      emailjs
        .send(
          'pk-place', // 서비스 ID
          'pk-place', // 템플릿 ID
          templateParams,
          process.env.NEXT_PUBLIC_AUTH_EMAIL_PUBLIC_KEY,
        )
        .then((response) => {
          console.log('이메일이 성공적으로 보내졌습니다:', response);
          setIsEmailSent(true);
          // 이메일 전송 성공 처리 로직 추가
        })
        .catch((error) => {
          console.error('이메일 보내기 실패:', error);
          // 이메일 전송 실패 처리 로직 추가
        });
    } else {
      alert('이미 가입되어 있는 이메일입니다');
      return;
    }
  };

  const handleCodeCheck = () => {
    if (codeRef.current?.value === code) {
      setCodeChecked(true);
      codeRef.current.readOnly = true;
      if (emailRef.current) {
        emailRef.current.readOnly = true;
        setVerifiedEmail(emailRef.current?.value);
      }
    } else {
      alert('인증번호가 맞지 않습니다');
    }
  };

  return (
    <div className="login-page font-insert-2">
      <br></br>

      <br></br>
      <div style={{ maxWidth: '300px', width: '60vw' }}>
        <Link href="/login">
          <FaArrowLeft />
        </Link>
      </div>
      <div className="login-inform">Signin</div>
      <br></br>
      <br></br>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <div className="resposive-input-wrapper">
          <span className="resposive-input-inform">이메일</span>
          <div>
            <input
              className="resposive-input"
              type="text"
              ref={emailRef}
              onKeyDown={(e) => {
                if (e.key == 'Enter') {
                  handleVerification();
                }
              }}
            ></input>
            {!isEmailSent && (
              <div style={{ textAlign: 'center' }}>
                <button style={{ margin: '5px' }} onClick={handleVerification}>
                  인증
                </button>
              </div>
            )}
          </div>
        </div>
        {isEmailSent && <div>이메일이 송신되었습니다</div>}
      </div>
      <br></br>
      {isEmailSent && (
        <div>
          <div>코드 확인</div>{' '}
          <div style={{ display: 'flex' }}>
            <input className="resposive-input" ref={codeRef}></input>{' '}
            {codeChecked && (
              <div style={{ padding: '5px' }}>
                <FaCheck style={{ color: 'green' }} />
              </div>
            )}
          </div>
          {!codeChecked && (
            <div style={{ textAlign: 'center' }}>
              <button onClick={handleCodeCheck}>확인</button>
            </div>
          )}
          <br></br>
          <br></br>
        </div>
      )}
      <div className="resposive-input-wrapper">
        <span className="resposive-input-inform">비밀번호 </span>
        <input
          className="resposive-input"
          type="password"
          ref={passwordRef}
          onKeyDown={(e) => {
            if (e.key == 'Enter') {
              handleSignin();
            }
          }}
        ></input>
      </div>
      <br></br>
      <button className="responsive-button" onClick={handleSignin}>
        가입하기
      </button>
    </div>
  );
}
