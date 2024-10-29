'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { GlobalStore, LoginStore } from '@/data/store';
import defaultImage from '@/asset/psk-logo.png';
import { useRouter } from 'next/navigation';
import googleLogin from '@/asset/google.png';
import kakao_th from '@/asset/kakaothumbnail.png';
import google_th from '@/asset/googlethumbnail.png';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/data/firebase';
import { FaPen } from 'react-icons/fa';
import { MdOutlineCancel } from 'react-icons/md';

export default function SideBar() {
  const router = useRouter();
  const [isLogged, setIsLogged] = useState(false);
  const [isImage, setIsImage] = useState('default');
  const { loggedin, setLoggedin, sessionNick, sessionId, sessionImage } =
    LoginStore();
  const [authNick, setAuthNick] = useState('');
  const [nickSwitch, setNickSwitch] = useState(true);
  const [currentNick, setCurrentNick] = useState('');
  const { sidebar, setSidebar, setChat } = GlobalStore();
  const sidebarRef = useRef<any>(null);
  // const pathname = usePathname();

  const { data: session, update } = useSession(); //세션 정보를 가져옴
  // console.log(session);

  const handleSidebar = () => {
    setSidebar(!sidebar);
  };

  const handleLogOut = () => {
    signOut();
  };

  const handleSignOut = () => {
    handleSidebar();
    router.push('/signout');
  };

  const handleAdminPage = () => {
    handleSidebar();
    router.push('/admin');
  };

  const handleProfileImage = () => {
    if (session) {
      // if (
      //   session?.user?.image?.includes('http://k.kakaocdn.net') ||
      //   session?.user?.image?.includes('https://lh3.googleusercontent.com')
      // ) {
      //   return;
      // }
      let file: any = document.createElement('input');
      file.type = 'file';
      file.accept = '.jpg, .png, .gif, .webp';
      file.addEventListener('change', async (file: any) => {
        let image = file.target.files[0];
        const path = 'profileImage/' + Date.now() + ':' + image.name;
        const storageRef = ref(storage, path);
        uploadBytes(storageRef, image).then(async (snapshot) => {
          getDownloadURL(snapshot.ref).then(async (downUrl) => {
            await fetch('http://localhost:3000/api/profile', {
              method: 'POST',
              body: JSON.stringify({
                id: session?.user?.email,
                image: downUrl,
                nick: null,
              }),
              cache: 'no-store',
            });
            update({ image: downUrl, name: '' });
          });
        });
      });
      file.click();
    } else {
      alert('먼저 로그인을 해주세요');
    }
  };

  const handleNick = async () => {
    await fetch('http://localhost:3000/api/profile', {
      method: 'POST',
      body: JSON.stringify({
        id: session?.user?.email,
        image: null,
        nick: currentNick,
      }),
      cache: 'no-store',
    });
    update({ image: '', name: String(currentNick) });
  };

  useEffect(() => {
    if (sidebarRef.current) {
      if (!sidebar) {
        sidebarRef.current.style.transform = 'translateX(0px)';
      } else {
        sidebarRef.current.style.transform = 'translateX(-110%)';
      }
    }
  }, [sidebar]);

  return (
    <div ref={sidebarRef} className="sidebar-wrapper" onClick={handleSidebar}>
      <div
        className="sidebar"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="profile-image" onClick={handleProfileImage}>
          <img
            className="profile-image-content"
            src={
              !session || session?.user?.image == 'default'
                ? defaultImage.src
                : (session?.user?.image as string)
            }
          ></img>
        </div>
        {isLogged === false && session == undefined ? (
          <button
            className="font-insert-2 social-login"
            onClick={() => signIn()}
            style={{ width: '200px' }}
          >
            <div>로그인하기</div>
            <div>(로그아웃 상태)</div>
          </button>
        ) : (
          <div className="font-insert-2" style={{ textAlign: 'center' }}>
            {nickSwitch ? (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="sidebar-nick">
                  {session?.user && session?.user.name}{' '}
                </div>
                <FaPen
                  onClick={() => {
                    if (session) {
                      setNickSwitch(!nickSwitch);
                      if (session?.user) {
                        setCurrentNick(session.user.name as string);
                      }
                    }
                  }}
                  className="sidebar-nick-pen"
                />
                {/* {!session?.user?.image?.includes('http://k.kakaocdn.net') &&
                  !session?.user?.image?.includes(
                    'https://lh3.googleusercontent.com',
                  ) && (
                    <FaPen
                      onClick={() => {
                        if (session) {
                          setNickSwitch(!nickSwitch);
                          if (session?.user) {
                            setCurrentNick(session.user.name as string);
                          }
                        }
                      }}
                      className="sidebar-nick-pen"
                    />
                  )} */}
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <input
                  spellCheck="false"
                  style={{
                    outline: 'none',
                    width: '80%',
                  }}
                  type="text"
                  maxLength={16}
                  value={currentNick}
                  onChange={(e) => {
                    if (e.target.value.length > 16) {
                      return;
                    }
                    setCurrentNick(e.target.value);
                  }}
                  onKeyUp={(e) => {
                    if (e.key == 'Enter') {
                      if (currentNick.length > 16) {
                        alert('최대 16글자까지 가능합니다');
                        return;
                      }
                      handleNick();
                      setNickSwitch(!nickSwitch);
                    }
                  }}
                />
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '10%',
                    color: 'white',
                  }}
                  onClick={(e) => {
                    setNickSwitch(!nickSwitch);
                  }}
                >
                  <MdOutlineCancel />
                </button>
              </div>
            )}
            <div className="sidebar-nick">
              등급: {session?.user && session?.user?.role}{' '}
            </div>
            <div className="sidebar-nick">
              포인트: {session?.user && session?.user?.point}{' '}
            </div>
            <br></br>
            <div>
              <div>
                <button
                  onClick={() => {
                    setChat('inlist');
                    setSidebar(!sidebar);
                  }}
                >
                  채팅
                </button>
              </div>
              <div>
                <button onClick={handleLogOut}>로그아웃</button>
              </div>
              <div>
                <button onClick={handleSignOut}>회원탈퇴</button>
              </div>
              {session?.user &&
                (session?.user?.role == 'staff' ||
                  session?.user?.role == 'admin') && (
                  <div>
                    <button onClick={handleAdminPage}>관리자페이지</button>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
