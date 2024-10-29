'use client';
import Image from 'next/image';
import { Upload } from '@/func/upload';
import { useEffect, useRef, useState } from 'react';
import { GlobalStore } from '@/data/store';
import SideBar from '@/components/Sidebar';
import bannerImg from '@/asset/pk-logo.png';
import { useSession } from 'next-auth/react';
import ClipLoader from 'react-spinners/ClipLoader';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import { CiSearch } from 'react-icons/ci';
import styled from 'styled-components';

export default function Home() {
  const router = useRouter();
  const option = [
    { value: 'user', label: '일반유저' },
    { value: 'user-iron', label: '아이언' },
    { value: 'user-bronze', label: '브론즈' },
    { value: 'user-silver', label: '실버' },
    { value: 'user-gold', label: '골드' },
    { value: 'user-emerald', label: '에메랄드' },
    { value: 'user-diamond', label: '다이아몬드' },
    { value: 'user-epic', label: '에픽' },
    { value: 'user-master', label: '마스터' },
    { value: 'user-grandmaster', label: '그랜드마스터' },
    { value: 'user-legend', label: '레전드' },
    { value: 'staff', label: '스태프' },
    { value: 'admin', label: '관리자' },
  ];
  const newBoardRef = useRef<any>(null);
  const [verified, setVerified] = useState(false);
  const [userAuth, setUserAuth] = useState('user');
  const [searched, setSearched] = useState<any>({ id: '', status: 'none' });
  const [userEmail, setUserEmail] = useState('');
  const [boardNames, setBoardNames] = useState<any>([]);
  const [boards, setBoards] = useState<any>([{ value: '', label: '' }]);
  const [targetBoard, setTargetBoard] = useState('');
  const [seasonData, setSeasonData] = useState<any>([]);
  let { data: session } = useSession();

  const boardChecker = async () => {
    let result = await fetch(`http://localhost:3000/api/admin/board-check`, {
      method: 'GET',
      cache: 'no-store',
    });
    let final = await result.json();
    let boards: any = [];
    let boardNames: any = [];
    final.data.forEach((board: string) => {
      boards.push({ value: board, label: board });
    });
    setBoardNames(final.data);
    setBoards(boards);
  };

  const getLadderData = async () => {
    let result = await fetch(`http://localhost:3000/api/ladder`, {
      method: 'GET',
      cache: 'no-store',
    });
    let final = await result.json();
    let seasons = final.data.sort((x: any, y: any) => y.season - x.season);
    console.log(seasons);
    let temp: any = [];
    setSeasonData(
      seasons.map((each: any) => {
        temp.push({ season: each.season, banner: each.banner });
        return { value: each.season, label: '시즌 ' + each.season };
      }),
    );
  };

  const verify = async () => {
    if (session?.user.role) {
      if (session?.user.role == 'staff' || session?.user.role == 'admin') {
        // 여기에 보드 이름들 가져오는 api 삽입
        boardChecker();
        getLadderData();
        setVerified(true);
      } else {
        alert('접근할 수 없습니다');
        router.push('/');
        return;
      }
    } else {
      alert('접근할 수 없습니다');
      router.push('/');
      return;
    }
  };

  const isUser = async () => {
    setSearched({ id: '', status: 'spinning' });
    let result = await fetch(`http://localhost:3000/api/admin/user-find`, {
      method: 'POST',
      body: JSON.stringify({
        userEmail,
      }),
      cache: 'no-store',
    });
    let final = await result.json();
    if (final.data.length > 0) {
      console.log(final.data);
      setSearched({ id: final.data[0].id, status: 'exsist' });
    } else {
      setSearched({ id: '', status: 'non-exsist' });
    }
  };

  const changeRole = async () => {
    if (searched.status == 'none') {
      alert('먼저 유저 이메일을 검색해주세요');
      return;
    }
    if (searched.status == 'non-exsist') {
      alert('해당 이메일의 유저는 존재하지 않습니다');
      return;
    }
    if (searched.status == 'exsist') {
      let result = await fetch(`http://localhost:3000/api/admin/role-change`, {
        method: 'POST',
        body: JSON.stringify({
          userEmail,
          role: userAuth,
          id: searched.id,
        }),
        cache: 'no-store',
      });
      if (result.ok) {
        alert('유저변경성공');
      }
    }
  };

  const createBoard = async () => {
    if (newBoardRef.current && newBoardRef?.current.value) {
      if (boardNames.includes(newBoardRef?.current.value)) {
        alert('해당 이름의 게시판이 이미 존재합니다');
        return;
      }
      let warn = window.confirm('해당 이름의 게시판을 만드시겠습니까?');
      if (warn) {
        console.log(newBoardRef?.current.value as string);
        let result = await fetch(
          `http://localhost:3000/api/admin/board-create`,
          {
            method: 'POST',
            body: JSON.stringify({
              newBoardName: newBoardRef?.current.value,
            }),
            cache: 'no-store',
          },
        );
        if (result.ok) {
          alert('생성성공');
          return;
        }
      }
    }
  };

  const deleteBoard = async () => {
    if (targetBoard) {
      let warn = window.confirm('해당 이름의 게시판을 삭제하시겠습니까?');
      if (warn) {
        let result = await fetch(
          `http://localhost:3000/api/admin/board-delete`,
          {
            method: 'POST',
            body: JSON.stringify({
              boardName: targetBoard,
            }),
            cache: 'no-store',
          },
        );
        if (result.ok) {
          alert(' 삭제성공');
          boardChecker();
        }
      }
    } else {
      alert('게시판을 선택해주세요');
      return;
    }
  };

  useEffect(() => {
    if (session) {
      verify();
    } else {
      alert('접근할 수 없습니다');
      router.push('/');
    }
  }, [session]);

  return (
    <div className="main-page font-insert-2">
      <div>
        {verified ? (
          <div className="auth-wrapper font-insert-2">
            {session?.user.role == 'admin' && (
              <>
                <br></br>
                유저임명
                <div className="auth-changer-wrapper">
                  <div className="auth-changer">
                    <div className="auth-changer-input-wrapper">
                      <input
                        className="auth-changer-input"
                        placeholder="이메일입력"
                        value={userEmail}
                        onChange={(e: any) => {
                          setUserEmail(e.target.value);
                        }}
                      ></input>

                      <div
                        className="auth-changer-search-icon"
                        onClick={isUser}
                      >
                        <CiSearch />
                      </div>
                    </div>
                    {searched.status !== 'none' ? (
                      <div>
                        {searched.status == 'exsist' ? (
                          <div style={{ color: 'green' }}>존재함</div>
                        ) : searched.status == 'spinning' ? (
                          <div>
                            <ClipLoader
                              size={15}
                              color="red"
                              aria-label="Loading Spinner"
                              data-testid="loader"
                            />
                          </div>
                        ) : (
                          <div style={{ color: 'red' }}>존재하지않음</div>
                        )}
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                  <div className="auth-changer-select-responsive2">
                    <$Select
                      options={option}
                      onChange={(e: any) => {
                        setUserAuth(e.value);
                      }}
                      placeholder={'권한선택'}
                      styles={{
                        control: (baseStyles) => ({
                          ...baseStyles,
                          // display: 'flex',
                          border: '3px solid #ccccc',
                          borderRadius: '5px',
                          width: '100%',
                          // minWidth: '140px',
                          maxWidth: '100%',
                          height: '38px',
                          margin: 0,
                        }),
                        placeholder: (baseStyles) => ({
                          ...baseStyles,
                          color: 'black',
                          fontSize: '16px',
                        }),
                      }}
                    ></$Select>
                  </div>
                  <div className="auth-changer-select-responsive">
                    <$Select
                      options={option}
                      onChange={(e: any) => {
                        setUserAuth(e.value);
                      }}
                      placeholder={'권한선택'}
                      styles={{
                        control: (baseStyles) => ({
                          ...baseStyles,
                          // display: 'flex',
                          border: '2px solid black',
                          borderRadius: '5px',
                          width: '100%',
                          // minWidth: '140px',
                          maxWidth: '100%',
                          height: '38px',
                          margin: 0,
                        }),
                        placeholder: (baseStyles) => ({
                          ...baseStyles,
                          color: 'black',
                          fontSize: '16px',
                        }),
                      }}
                    ></$Select>
                  </div>
                  <button className="auth-changer-button" onClick={changeRole}>
                    결정
                  </button>
                </div>
              </>
            )}
            <br></br>
            게시판관리
            <div className="auth-changer-wrapper">
              <div>게시판생성</div>
              <div className="auth-changer">
                <div className="auth-changer-input-wrapper">
                  <input
                    placeholder="생성할 게시판의 이름을 입력"
                    className="auth-changer-input"
                    ref={newBoardRef}
                  ></input>
                </div>
              </div>
              <button className="auth-changer-button" onClick={createBoard}>
                생성
              </button>
            </div>
            <div className="auth-changer-wrapper">
              <div>게시판삭제</div>
              <div className="auth-changer">
                <$Select
                  options={boards}
                  onChange={(e: any) => {
                    setTargetBoard(e.value);
                  }}
                  placeholder={'게시판선택'}
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      // display: 'flex',
                      border: '3px solid #ccccc',
                      borderRadius: '5px',
                      width: '100%',
                      // minWidth: '140px',
                      maxWidth: '100%',
                      height: '38px',
                      margin: 0,
                    }),
                    placeholder: (baseStyles) => ({
                      ...baseStyles,
                      color: 'black',
                      fontSize: '16px',
                    }),
                  }}
                ></$Select>
              </div>
              <button className="auth-changer-button" onClick={deleteBoard}>
                삭제
              </button>
            </div>
            <br></br>
            래더시즌관리
            <div className="auth-changer-wrapper">
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <button
                  className="auth-changer-button"
                  style={{ width: '50%' }}
                >
                  추가
                </button>
                <$Select
                  options={seasonData}
                  onChange={(e: any) => {
                    setSeasonData(e.value);
                    // 여기다 시즌 삭제 로직 추가
                  }}
                  placeholder={'시즌삭제'}
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      border: '3px solid #ccccc',
                      borderRadius: '5px',
                      width: '100%',
                      maxWidth: '100%',
                      height: '38px',
                      margin: 0,
                    }),
                    placeholder: (baseStyles) => ({
                      ...baseStyles,
                      color: 'black',
                      fontSize: '16px',
                    }),
                  }}
                ></$Select>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <br></br>
            <div>관리자 인증 중입니다</div>
            <br></br>
            <ClipLoader
              size={150}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        )}
        {/* 커뮤
      <div>등급 user iron bronze silver admin</div> */}
      </div>
    </div>
  );
}

const $Select = styled(Select)`
  color: black;
  width: 100%;
`;
