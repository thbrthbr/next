// 'use client';
// import Link from 'next/link';
// import React, { useEffect, useState, useRef } from 'react';
// import { LoginStore } from '@/data/store';
// import { useRouter } from 'next/navigation';

// export default function Login() {
//   const router = useRouter();
//   const {
//     loggedin,
//     setLoggedin,
//     setSessionId,
//     setSessionNick,
//     setSessionImage,
//   } = LoginStore();
//   const [id, setId] = useState('');
//   const [pw, setPw] = useState('');
//   const handleId = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setId(e.target.value);
//   };
//   const handlePw = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setPw(e.target.value);
//   };
//   const handleLogin = async () => {
//     if (!id) {
//       alert('아이디를 입력해주세요');
//       return;
//     }
//     if (!pw) {
//       alert('비밀번호를 입력해주세요');
//       return;
//     }
//     let result = await fetch(`http://localhost:3000/api/login`, {
//       method: 'POST',
//       body: JSON.stringify({ id, pw }),
//       cache: 'no-store',
//     });
//     const loginedData = await result.json();
//     console.log(loginedData);
//     if (loginedData.data.id == id && loginedData.data.pw == pw) {
//       alert('로그인 성공');
//       setLoggedin(true);
//       setSessionId(loginedData.data.id);
//       setSessionNick(loginedData.data.nick);
//       setSessionImage(loginedData.data.profileImg);
//       window.location.reload();
//     } else {
//       alert('아이디나 비밀번호를 확인해주세요');
//     }
//   };

//   useEffect(() => {
//     if (loggedin === true) {
//       router.push('/');
//     }
//   }, []);

//   return (
//     <div className="login-page">
//       <br></br>
//       <span>
//         <span>아이디 </span>
//         <input type="text" value={id} onChange={handleId}></input>
//       </span>
//       <br></br>
//       <span>
//         <span>비밀번호 </span>
//         <input type="password" value={pw} onChange={handlePw}></input>
//       </span>
//       <br></br>
//       <button onClick={handleLogin}>로그인</button>
//       <Link href="/signin">
//         <button>회원가입</button>
//       </Link>
//     </div>
//   );
// }
'use client';
import Link from 'next/link';
import React, { useEffect, useState, useRef } from 'react';
import { LoginStore } from '@/data/store';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import googleLogin from '@/asset/googlethumbnail.png';
import emailjs from 'emailjs-com';

export default function Login() {
  const { data: session } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    loggedin,
    setLoggedin,
    setSessionId,
    setSessionNick,
    setSessionImage,
  } = LoginStore();
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };
  const handlePw = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPw(e.target.value);
  };
  const handleLogin = async (type: string) => {
    try {
      if (type == 'basic') {
        const result = await signIn('credentials', {
          username: id,
          password: pw,
          redirect: false,
        });
        if (result?.ok) {
          router.push('/');
        } else {
          alert('아이디나 비밀번호를 확인해주세요');
          setId('');
          setPw('');
        }
      } else if (type == 'kakao') {
        const result = await signIn('kakao', {
          username: id,
          password: pw,
          redirect: true,
          callbackUrl: '/',
        });
      } else {
        const result = await signIn('google', {
          username: id,
          password: pw,
          redirect: true,
          callbackUrl: '/',
        });
      }
    } catch (e) {}
  };

  // useEffect(() => {
  //   if (session) {
  //     console.log(session);
  //     alert('뜨는거맞음ㅇㅇ');
  //     // router.push('/');
  //   }
  // }, [session]);

  return (
    <div className="login-page font-insert-2">
      <br></br>
      <div className="login-inform">Login</div>
      <br></br>
      <div className="resposive-input-wrapper">
        <span className="resposive-input-inform">이메일</span>
        <input
          className="resposive-input"
          type="text"
          value={id}
          onChange={handleId}
          onKeyDown={(e) => {
            if (e.key == 'Enter') {
              if (inputRef.current) inputRef.current.focus();
            }
          }}
        ></input>
      </div>
      <br></br>
      <div className="resposive-input-wrapper">
        <span className="resposive-input-inform">비밀번호 </span>
        <input
          className="resposive-input"
          ref={inputRef}
          type="password"
          value={pw}
          onChange={handlePw}
          onKeyDown={(e) => {
            if (e.key == 'Enter') {
              handleLogin('basic');
            }
          }}
        ></input>
      </div>
      <br></br>
      <button
        className="responsive-button"
        onClick={() => {
          handleLogin('basic');
        }}
      >
        로그인
      </button>
      <button
        className="responsive-button2"
        style={{
          display: 'flex',
          fontSize: '16px',
          justifyContent: 'center',
          alignItems: 'center',
          border: '0.5px solid black',
          maxWidth: '220px',
          width: '60vw',
          backgroundColor: 'white',
          color: 'black',
        }}
        onClick={() => {
          handleLogin('google');
        }}
      >
        <img
          style={{
            width: '25px',
            borderRadius: '50%',
          }}
          src={googleLogin.src}
        />
        &nbsp;
        <div>구글계정으로 접속</div>
      </button>
      {/* 비즈앱으로 전환하고 사업자번호 받은 뒤에 수정하든지함 */}
      {/* <button
        onClick={() => {
          handleLogin('kakao');
        }}
      >
        카카오로그인
      </button> */}
      <div>
        <button
          className="responsive-button2"
          onClick={() => {
            router.push('/signin');
          }}
        >
          회원가입
        </button>
        |
        <button
          className="responsive-button2"
          onClick={() => {
            router.push('/find_pw');
          }}
        >
          비밀번호찾기
        </button>
      </div>
    </div>
  );
}
