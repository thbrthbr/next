'use client';

import firebase from 'firebase/compat/app';
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { storage } from '@/data/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addReplay } from '@/data/firebase';
import Link from 'next/link';
// import { useRouter } from 'next/router'
import { useInView } from 'react-intersection-observer';
import { Input } from '@/components/ui/input';
import { IoMdClose } from 'react-icons/io';
import { MdOutlineFileUpload } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { IoIosSearch } from 'react-icons/io';
import { IoMdRefresh } from 'react-icons/io';
import CryptoJS from 'crypto-js';
import { BiSolidCrown } from 'react-icons/bi';

export default function Replayzer() {
  const [reference, inView] = useInView();
  // const router = useRouter();
  const inputRef = useRef<any>();
  const buttonRef = useRef<any>();
  const isMounted = useRef<any>();
  const [warn, setWarn] = useState(false);
  const [checked, setChecked] = useState('true');
  const [searchChecked, setSearchChecked] = useState('true');
  const [modal, setModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [filePw, setFilePw] = useState('');
  const [fileset, setFileset] = useState<any>();
  const [datas, setDatas] = useState<any>([]);
  const [sortedDatas, setSortedDatas] = useState<any>([]);
  const [dataCount, setDataCount] = useState<number>(1);
  const [reload, setReload] = useState<number>(0);
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [isData, setIsData] = useState<string>('yes');
  const [search, setSearch] = useState<string>('');
  const [searchMode, setSearchMode] = useState<boolean>(false);
  const [searchCount, setSearchCount] = useState<number>(1);

  const handleFileName = (e: ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
  };
  const handleFilePw = (e: ChangeEvent<HTMLInputElement>) => {
    setFilePw(e.target.value);
  };

  const handleChecker = (e: ChangeEvent<HTMLInputElement>) => {
    setChecked(e.target.value);
    if (e.target.value == 'false') {
      setWarn(true);
    } else {
      setWarn(false);
    }
  };

  const handleSearchChecker = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchChecked(e.target.value);
  };

  //   const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  //     if (event.target.files) {
  //       const file = event.target.files[0];
  //       if (file) {
  //         const reader = new FileReader();

  //         reader.onload = (e: ProgressEvent<FileReader>) => {
  //           const htmlContent = e.target?.result as string;

  //           // 여기서 iframe 생성 및 콘텐츠 설정
  //           const iframe = document.getElementById(
  //             'resultIframe',
  //           ) as HTMLIFrameElement;
  //           const iframeDocument =
  //             iframe.contentDocument || iframe.contentWindow?.document;
  //           if (iframeDocument) {
  //             iframeDocument.open();
  //             iframeDocument.write(htmlContent);
  //             iframeDocument.close();
  //           }
  //         };

  //         reader.readAsText(file);
  //       }
  //     }
  //   };

  //   const handleUpload = () => {
  //     if (htmlFile) {
  //       const reader = new FileReader();

  //       reader.onload = (e: ProgressEvent<FileReader>) => {
  //         const htmlContent = e.target?.result as string;

  //         // 여기서 iframe 생성 및 콘텐츠 설정
  //         const iframe = document.getElementById(
  //           'resultIframe',
  //         ) as HTMLIFrameElement;
  //         const iframeDocument =
  //           iframe.contentDocument || iframe.contentWindow?.document;
  //         if (iframeDocument) {
  //           iframeDocument.open();
  //           iframeDocument.write(htmlContent);
  //           iframeDocument.close();
  //         }
  //       };

  //       reader.readAsText(htmlFile);
  //     }
  //   };

  const handleUpload = () => {
    setModal(!modal);
  };

  const handleUploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    try {
      if (event.target.files) {
        if (event.target.files[0].type !== 'text/html') {
          alert('리플레이 파일만 올릴 수 있습니다');
          inputRef.current.value = '';
          return;
        }
        const READER = new FileReader();
        READER.readAsText(event.target.files[0], 'UTF-8');
        let blob;
        let str = '';
        READER.onload = function (e: any) {
          str = e.target.result;
          if (
            str.includes(
              'html,body {font-family:Verdana, sans-serif;font-size:10pt;margin:0;padding:0;}body{padding:12px 0;} .battle-log {font-family:Verdana, sans-serif;font-size:10pt;} .battle-log-inline {border:1px solid #AAAAAA;background:#EEF2F5;color:black;max-width:640px;margin:0 auto 80px;padding-bottom:5px;} .battle-log .inner {padding:4px 8px 0px 8px;} .battle-log .inner-preempt {padding:0 8px 4px 8px;} .battle-log .inner-after {margin-top:0.5em;} .battle-log h2 {margin:0.5em -8px;padding:4px 8px;border:1px solid #AAAAAA;background:#E0E7EA;border-left:0;border-right:0;font-family:Verdana, sans-serif;font-size:13pt;} .battle-log .chat {vertical-',
            )
          ) {
            if (event.target.files) {
              if (event.target.files.length > 0) {
                //색깔변하게
                buttonRef.current.style.cssText = `
                background-color : orange;
                color: white;
                border-color: yellow;
                `;
              }
              let updated = str.replace(
                /.subtle {color:#3A4A66;}/,
                `.subtle {color:#3A4A66;} .replay-controls{@media (max-width: 482px) {display: flex;flex-direction: column;width: 90vw;margin-top: -20px;}} .replay-controls-2{@media (max-width: 482px) {display: flex;flex-direction: column;width: 90vw;margin-top: -150px;}}`,
              );
              updated = updated.replace(
                /<h1 style="font-weight:normal;text-align:center"><strong>/,
                `<br><br><br><br><br><br><br><h1 style="font-weight:normal;text-align:center"><strong>`,
              );
              updated = updated.replace(
                /body{padding:12px 0;}/,
                `body{ padding:12px 0; overflow: hidden; -ms-overflow-style: none; scrollbar-width: none;} ::-webkit-scrollbar {display: none;}`,
              );
              blob = new Blob(['\ufeff' + updated], {
                type: 'text/html; charset=utf-8;',
              });
              const modifiedFile = new File(
                [blob],
                `${event.target.files[0].name}`,
                { type: 'text/html; charset=utf-8;' },
              );
              const file = event.target.files[0];
              const fileNm = file.name;
              setFileset({
                file: modifiedFile,
                title: '',
                fileName: fileNm,
                filePassword: '',
                locked: '',
                privateURL: '',
              });
            }
          } else {
            alert('리플레이 파일만 올릴 수 있습니다');
            inputRef.current.value = '';
          }
        };
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleStorage = () => {
    if (!fileset) {
      alert('파일을 선택해주세요');
      return;
    }
    if (!fileName) {
      alert('파일의 제목을 지어주세요');
      return;
    }
    if (checked === 'false') {
      if (!filePw.length) {
        alert('비공개하기 위해선 비밀번호를 설정하셔야 합니다');
        return;
      }
    }
    const path = 'replay/' + Date.now() + ':' + fileset.fileName;

    // 파일 경로 설정
    const storageRef = ref(storage, path);
    uploadBytes(storageRef, fileset.file).then(async (snapshot) => {
      getDownloadURL(snapshot.ref).then(async (downUrl) => {
        let privateURL = CryptoJS.AES.encrypt(
          JSON.stringify(fileName),
          String(Date.now()),
        )
          .toString()
          .replace('/', 'Qw');
        await fetch('http://localhost:3000/api/replay', {
          method: 'POST',
          body: JSON.stringify({
            title: fileName,
            fileName: path,
            filePassword: filePw ? filePw : privateURL,
            locked: checked == 'false' ? 'true' : 'false',
            privateURL: checked == 'false' ? privateURL : '',
            path: downUrl,
            order: Date.now(),
          }),
          cache: 'no-store',
        });
        if (checked == 'false') {
          window.prompt(
            `업로드 되었습니다 \n고유코드를 복사해두세요`,
            privateURL,
          );
        } else {
          alert('업로드 되었습니다');
        }
        window.location.reload();
        // setReload(reload + 1);
        // setModal(false);
      });
    });
  };

  const handleGetReplays = async () => {
    let result = await fetch('http://localhost:3000/api/replay', {
      method: 'GET',
      cache: 'no-store',
    });
    const dbReplayDatas = await result.json();
    let sorted = dbReplayDatas.data.sort((x: any, y: any) => y.likes - x.likes);
    // console.log(sorted);
    setSortedDatas(sorted);
  };

  const handleGetMoreReplays = async () => {
    if (searchMode == false) {
      let result = await fetch(
        `http://localhost:3000/api/replay-plus/${dataCount}`,
        {
          method: 'GET',
          cache: 'no-store',
        },
      );
      const dbReplayDatas = await result.json();
      if (dbReplayDatas.data.length > 0) {
        setDatas([...datas, ...dbReplayDatas.data]);
        setDataCount(dataCount + 1);
      } else {
        if (datas.length > 0) {
          setIsData('no');
        } else {
          setIsData('empty');
        }
      }
    } else {
      let result = await fetch(
        `http://localhost:3000/api/search/${search}?page=${searchCount + 1}`,
        {
          method: 'GET',
          cache: 'no-store',
        },
      );
      const searchedReplay = await result.json();
      setDatas([...datas, ...searchedReplay.data]);
      setSearchCount(searchCount + 1);
      if (searchedReplay.data.length < 10) {
        if (datas.length > 0) {
          setIsData('no');
        } else {
          setIsData('empty');
        }
      }
    }
  };

  const handleDeleteReplays = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: string,
    pw: string,
  ) => {
    e.preventDefault();
    let passTest = window.prompt('비밀번호를 입력하세요');
    if (passTest === pw) {
      await fetch(`http://localhost:3000/api/replay/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({
          id,
        }),
        cache: 'no-store',
      });
      alert('리플레이 파일을 삭제하였습니다');
      // setReload(reload + 1);
      window.location.reload();
    } else {
      if (passTest !== null) {
        alert('비밀번호를 확인해주세요');
      }
    }
  };

  const searchReplay = async () => {
    if (searchChecked == 'true') {
      if (search) {
        let result = await fetch(
          `http://localhost:3000/api/search/${search}?page=${1}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );
        const searchedReplay = await result.json();
        setDatas([...searchedReplay.data]);
        setSearchCount(1);
        setSearchMode(true);
        if (searchedReplay.data == 0) {
          setIsData('empty');
        } else {
          setIsData('yes');
        }
      }
    } else {
      // privateurl로 검색했을 때 fetch하기
      if (search) {
        let result = await fetch(
          `http://localhost:3000/api/search/${search}?mode=code`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );
        const searchedReplay = await result.json();
        setDatas([...searchedReplay.data]);
        setIsData('no');
      }
    }
  };

  useEffect(() => {
    handleGetReplays();
  }, []);

  useEffect(() => {
    if (inView) {
      handleGetMoreReplays();
    }
  }, [inView]);

  useEffect(() => {
    if (datas.length < 10) {
      handleGetMoreReplays();
    }
  }, [dataCount]);

  return (
    <div className="replayzer-container">
      {modal && (
        <div
          style={{
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            zIndex: 2,
          }}
        >
          <div className="cover">
            <div className="section-top-area">
              <div style={{ cursor: 'pointer' }} onClick={handleUpload}>
                <IoMdClose />
              </div>
            </div>
            <div
              className="centering"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <input
                ref={inputRef}
                type="file"
                id="replay-upload"
                name="replay-upload"
                onChange={handleUploadFile}
              />
              <label htmlFor="replay-upload">
                <div className="uploader">
                  <p className="file-text">SELECT</p>
                </div>
              </label>
              <div>제목</div>
              <Input
                style={{ backgroundColor: 'white', borderColor: '#accfff' }}
                id="filename"
                type="text"
                value={fileName}
                onChange={handleFileName}
              />
              <br />
              <div>비밀번호 설정</div>
              <div>(주의: 미설정시 랜덤값 지정)</div>
              <Input
                style={{ backgroundColor: 'white', borderColor: '#accfff' }}
                id="filepassword"
                type="password"
                value={filePw}
                onChange={handleFilePw}
              />
              <br />
              잠금 설정
              <div>
                <span>
                  공개
                  <input
                    name="private"
                    value="true"
                    type="radio"
                    checked={checked == 'true'}
                    onChange={handleChecker}
                  />
                </span>{' '}
                <span>
                  비공개
                  <input
                    name="private"
                    value="false"
                    type="radio"
                    checked={checked == 'false'}
                    onChange={handleChecker}
                  />
                </span>
              </div>
              {warn && (
                <div className="warn">
                  <div className="warn-item">
                    비공개전환시 고유코드가 발급되며
                  </div>
                  <div className="warn-item">
                    고유코드로 검색시에만 표시됩니다
                  </div>
                  <div className="warn-item">
                    비밀번호와 발급코드를 모두 저장해두세요
                  </div>
                  <div className="warn-item">
                    (비밀번호: 삭제용 / 발급코드: 검색용)
                  </div>
                </div>
              )}
              <br />
              <button
                id="upload-button"
                className="upload-button"
                type="button"
                onClick={handleStorage}
                ref={buttonRef}
              >
                <p className="file-text">UPLOAD</p>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="replayzer-wrapper font-insert-2">
        <br></br>
        <div style={{ fontSize: '24px', display: 'flex' }}>
          <div className="crown-wrapper">
            <BiSolidCrown />
          </div>
          <div>인기 리플레이</div>
          <div className="crown-wrapper">
            <BiSolidCrown />
          </div>{' '}
        </div>
        <div className="replay-list-wrapper">
          <div style={{ width: '50%', padding: '5px' }}>
            {sortedDatas.map((data: any, idx: number) => {
              if (idx < 5 && data.likes > 0) {
                return (
                  <Link href={`replayzer/${data.id}`}>
                    <div className="replay-list-item">
                      <span
                        style={{
                          color:
                            idx + 1 == 1
                              ? 'yellow'
                              : idx + 1 == 2
                              ? 'silver'
                              : idx + 1 == 3
                              ? 'brown'
                              : 'blue',
                        }}
                      >
                        {idx + 1}
                      </span>{' '}
                      ({data.likes}) {data.title}
                    </div>
                  </Link>
                );
              }
            })}
          </div>
          <div style={{ width: '50%', padding: '5px' }}>
            {sortedDatas.map((data: any, idx: number) => {
              if (idx > 4 && idx < 10 && data.likes > 0) {
                return (
                  <Link href={`replayzer/${data.id}`}>
                    <div className="replay-list-item">
                      <span style={{ color: 'blue' }}>{idx + 1}</span> (
                      {data.likes}) {data.title}
                    </div>
                  </Link>
                );
              }
            })}
          </div>
        </div>

        <br></br>
        <div>
          <button className="uploader" onClick={handleUpload}>
            <MdOutlineFileUpload />
          </button>
        </div>
        <div>
          <span>
            <span>텍스트검색 </span>
            <input
              name="search-mode"
              value="true"
              type="radio"
              checked={searchChecked == 'true'}
              onChange={handleSearchChecker}
            />
          </span>{' '}
          <span>
            <span>코드검색 </span>
            <input
              name="search-mode"
              value="false"
              type="radio"
              checked={searchChecked == 'false'}
              onChange={handleSearchChecker}
            />
          </span>
        </div>
        <div className="search-wrapper">
          <button
            className="searcher search-button"
            onClick={() => {
              window.location.reload();
            }}
          >
            <IoMdRefresh />
          </button>
          <Input
            placeholder="Search..."
            className="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            onKeyUp={(e) => {
              if (e.key == 'Enter') {
                searchReplay();
              }
            }}
          />
          <button
            className="searcher search-button"
            onClick={(e) => {
              searchReplay();
            }}
          >
            <IoIosSearch />
          </button>
        </div>
        <div>
          {datas.map((replay: any) => {
            return (
              <Link href={`replayzer/${replay.id}`} key={replay.id}>
                <div className="item">
                  <div className="item-title">{replay.title}</div>
                  <span className="item-delete">
                    <div
                      onClick={(e: any) => {
                        handleDeleteReplays(e, replay.id, replay.filePassword);
                      }}
                    >
                      <IoMdClose style={{ paddingTop: '5px' }} />
                    </div>
                    <div style={{ display: 'flex' }}>
                      <div className="item-comment">추천 {replay.likes}</div>
                      <div className="item-comment">
                        댓글 {replay.commentNum}
                      </div>
                    </div>
                  </span>
                </div>
              </Link>
            );
          })}
          {isData == 'yes' ? (
            <div ref={reference} className="item2">
              Load...
            </div>
          ) : (
            isData == 'empty' && (
              <div ref={reference} className="item2">
                Nothing Found
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
