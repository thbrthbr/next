'use client';

import { deleteReplay } from '@/data/firebase';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { RiArrowRightSLine } from 'react-icons/ri';
import { RiArrowLeftSLine } from 'react-icons/ri';

export default function Show() {
  const { data: session, update } = useSession();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [commentId, setCommentId] = useState('');
  const [commentPw, setCommentPw] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [editCommentContent, setEditCommentContent] = useState('');
  const [editCommentSwitch, setEditCommentSwitch] = useState(-1);
  const [commentRefresh, setCommentRefresh] = useState<any>({
    act: '',
    num: 0,
  });
  const [replay, setReplay] = useState('');
  const [likes, setLikes] = useState('');
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);

  const [commentPage, setCommentPage] = useState(1);
  const [currentCommentPage, setCurrentCommentPage] = useState(1);

  const isMounted = useRef(false);
  const param = useParams();

  const handleId = (e: ChangeEvent<HTMLInputElement>) => {
    if (session?.user?.name) {
      return;
    }
    setCommentId(e.target.value);
  };
  const handlePw = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.includes(':')) {
      alert('해당문자는 사용하실 수 없습니다');
      return;
      // e.target.value = e.target.value.replace(/:/, '');
      // console.log(e.target.value);
    }
    setCommentPw(e.target.value);
  };
  const handleContent = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCommentContent(e.target.value);
  };

  // const handleEnter = (e: any) => {
  //   if (e.key == 'Enter') {
  //     setCommentContent(commentContent + '\n');
  //   }
  // };

  const getReplay = async () => {
    let result = await fetch(`http://localhost:3000/api/replay/${param.id}`, {
      method: 'GET',
      cache: 'no-store',
    });
    const dbReplayData = await result.json();
    setReplay(dbReplayData.data.path);
    setLikes(dbReplayData.data.likes);
  };

  const commentPageMover = async (direction: string) => {
    let curPage = currentCommentPage;
    if (direction == 'past') {
      if (curPage !== 1) {
        curPage -= 1;
        getComments(curPage);
      }
    } else {
      if (curPage < commentPage) {
        curPage += 1;
        getComments(curPage);
      }
    }
  };

  const getComments = async (num: number) => {
    setCurrentCommentPage(num ? num : 1);
    setCommentId('');
    setCommentPw('');
    setCommentContent('');
    let result = await fetch(
      `http://localhost:3000/api/comment/${param.id}:${num}`,
      {
        method: 'GET',
        cache: 'no-store',
      },
    );
    const dbCommentData = await result.json();
    if (dbCommentData.data.length > 0) {
      setCommentPage(Math.ceil(dbCommentData.data[1] / 10));
      setCommentCount(dbCommentData.data[1]);
      setComments(dbCommentData.data[0]);
    } else {
      setCommentPage(1);
      setCommentCount(0);
      setComments([]);
    }
  };

  const addComment = async () => {
    if (!session?.user) {
      if (!commentId) {
        alert('아이디를 입력해주세요');
        return;
      }
      if (!commentPw) {
        alert('비밀번호를 입력해주세요');
        return;
      }
    }
    if (!commentContent) {
      alert('댓글 내용을 입력해주세요');
      return;
    }

    if (commentContent.length > 500) {
      alert('글자 수 제한을 넘어섰습니다');
      return;
    }
    let contentArr = [];
    if (commentContent.includes('\n')) {
      contentArr = commentContent.split('\n');
    } else {
      contentArr.push(commentContent);
    }
    if (contentArr.length > 6) {
      alert('글자 수 제한을 넘어섰습니다');
      return;
    }
    let stringifiedCommentArr = JSON.stringify(contentArr);
    let result = await fetch(`http://localhost:3000/api/comment`, {
      method: 'POST',
      body: JSON.stringify({
        email: session?.user?.email ? session?.user?.email : 'none',
        id: commentId ? commentId : session?.user?.name,
        pw: commentPw ? commentPw : ':logined',
        content: stringifiedCommentArr,
        pageid: param.id,
      }),
      cache: 'no-store',
    });
    const dbCommentData = await result.json();
    if (dbCommentData.data.status == '성공') {
      setCommentRefresh({ act: 'add', num: commentRefresh.num + 1 });
    }
  };

  const editComment = async (email: any, commentId: string, pw: string) => {
    if (!editCommentContent) {
      alert('내용을 입력해주세요');
      return;
    }
    setEditCommentSwitch(-1);
    setEditCommentContent('');
    let contentArr = [];
    if (editCommentContent.includes('\n')) {
      contentArr = editCommentContent.split('\n');
    } else {
      contentArr.push(editCommentContent);
    }
    let stringifiedCommentArr = JSON.stringify(contentArr);
    const editingComment = {
      id: commentId,
      content: stringifiedCommentArr,
    };
    if (pw == ':logined') {
      if (session && session?.user?.email == email) {
        await fetch(`http://localhost:3000/api/comment/${commentId}`, {
          method: 'POST',
          body: JSON.stringify(editingComment),
          cache: 'no-store',
        });
        setCommentRefresh({ act: 'edit', num: commentRefresh.num + 1 });
        return;
      }
    }
    let checker = window.prompt('비밀번호를 입력해주세요');
    if (checker == pw) {
      await fetch(`http://localhost:3000/api/comment/${commentId}`, {
        method: 'POST',
        body: JSON.stringify(editingComment),
        cache: 'no-store',
      });
      setCommentRefresh({ act: 'edit', num: commentRefresh.num + 1 });
    } else {
      if (checker !== null) {
        alert('비밀번호를 확인해주세요');
      }
    }
  };

  const deleteComment = async (
    email: string,
    commentId: string,
    pw: string,
  ) => {
    // 삭제 로직 만들기
    if (pw == ':logined') {
      if (session && session?.user?.email == email) {
        let result = await fetch(
          `http://localhost:3000/api/comment/${commentId}`,
          {
            method: 'DELETE',
            body: JSON.stringify({
              test: 'test',
            }),
            cache: 'no-store',
          },
        );
        const dbCommentResult = await result.json();
        if (dbCommentResult.data.status == '성공') {
          alert('댓글을 삭제했습니다');
          setCommentRefresh({ act: 'delete', num: commentRefresh.num + 1 });
        }
        return;
      }
    }
    let checker = window.prompt('비밀번호를 입력해주세요');
    if (checker == pw) {
      let result = await fetch(
        `http://localhost:3000/api/comment/${commentId}`,
        {
          method: 'DELETE',
          body: JSON.stringify({
            test: 'test',
          }),
          cache: 'no-store',
        },
      );
      const dbCommentResult = await result.json();
      if (dbCommentResult.data.status == '성공') {
        alert('댓글을 삭제했습니다');
        setCommentRefresh({ act: 'delete', num: commentRefresh.num + 1 });
      }
    } else {
      if (checker !== null) {
        alert('비밀번호를 확인해주세요');
      }
    }
  };

  const handleLike = async () => {
    if (session?.user?.name) {
      let result = await fetch(
        `http://localhost:3000/api/like-hate/${param.id}`,
        {
          method: 'POST',
          body: JSON.stringify({
            userId: session?.user?.email,
            type: 'replay',
            which: 'like',
          }),
          cache: 'no-store',
        },
      );
      const final = await result.json();
      console.log(final);
      setLikes(final.data.likes);
    } else {
      alert('로그인 후 추천 가능합니다');
      return;
    }
  };

  useEffect(() => {
    getReplay();
    getComments(1);
  }, [replay]);

  useEffect(() => {
    if (param.id && commentRefresh.num > 0) {
      if (commentRefresh.act == 'delete') {
        let now = Math.ceil((commentCount - 1) / 10);
        console.log(now);
        getComments(now);
      }
      if (commentRefresh.act == 'edit') {
        getComments(currentCommentPage);
      }
      if (commentRefresh.act == 'add') {
        let now = Math.ceil((commentCount + 1) / 10);
        getComments(now);
      }
    }
  }, [commentRefresh]);

  return (
    <div className="replayzer-container">
      <button className="arrow-wrapper">
        <Link href="/replayzer">
          <FaArrowLeft />
        </Link>
      </button>
      <div className="cinema-box">
        <iframe
          className="cinema"
          ref={iframeRef}
          src={replay}
          id="resultIframe"
          title="Result iframe"
        />
      </div>
      <br></br>
      {/* 여기에 댓글창 인터페이스 만들기 */}
      <div className="like-button font-insert-2" onClick={handleLike}>
        <div>추천</div> <div>{likes}</div>
      </div>
      <br></br>
      <div className="replay-upper-line font-insert-2">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          댓글 {commentCount}
        </div>
        {commentCount > 10 && (
          <div style={{ display: 'flex' }}>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => {
                commentPageMover('past');
              }}
            >
              <RiArrowLeftSLine />
            </span>
            <span>
              {currentCommentPage}/{commentPage}
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => {
                commentPageMover('next');
              }}
            >
              <RiArrowRightSLine />
            </span>
          </div>
        )}
      </div>
      <div
        style={{
          width: '100%',
        }}
      >
        {comments &&
          comments.map((comment: any, idx: number) => {
            let commentArr = JSON.parse(comment.content);
            return (
              <div className="each-comment">
                {/* {idx !== 0 && <hr></hr>} */}
                <div className="comment-part comment-titleline">
                  <span
                    style={{
                      fontWeight: comment.email !== 'none' ? 900 : 400,
                      cursor: comment.email !== 'none' ? 'pointer' : 'default',
                    }}
                  >
                    {comment.nick}{' '}
                  </span>
                  {/* <ProfileBox></ProfileBox> */}
                </div>
                <div className="comment-part">
                  {comment.id == editCommentSwitch ? (
                    <div style={{ display: 'flex' }}>
                      <textarea
                        style={{
                          resize: 'none',
                          width: '80%',
                          maxWidth: '300px',
                        }}
                        value={editCommentContent}
                        onChange={(e) => {
                          setEditCommentContent(e.target.value);
                        }}
                      ></textarea>
                      <button
                        className="font-insert-2"
                        style={{
                          backgroundColor: 'red',
                          color: 'white',
                          padding: '5px',
                        }}
                        onClick={() => {
                          if (session?.user) {
                            editComment(
                              session?.user.email,
                              comment.id,
                              ':logined',
                            );
                          } else {
                            editComment('none', comment.id, comment.pw);
                          }
                        }}
                      >
                        완료
                      </button>
                    </div>
                  ) : (
                    <div>
                      {commentArr.map((each: any) => {
                        return <div>{each}</div>;
                      })}
                      {comment.isEdited == 'true' && (
                        <span className="each-post-comment-edited">
                          (수정됨)
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="comment-part-date">
                  {comment.date.replace(/-/g, '.').split(' ')[1]}
                  &nbsp;&nbsp;&nbsp;
                  {comment.date.replace(/-/g, '.').split(' ')[0]}
                  &nbsp;&nbsp;&nbsp;
                  {session?.user?.email == comment.email ? (
                    <span>
                      {editCommentSwitch == comment.id ? (
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            setEditCommentSwitch(-1);
                            setEditCommentContent('');
                          }}
                        >
                          취소
                        </span>
                      ) : (
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            setEditCommentSwitch(comment.id);
                            let forSort = commentArr.slice(0);
                            setEditCommentContent(forSort.join(`\n`));
                          }}
                        >
                          수정
                        </span>
                      )}
                      &nbsp;&nbsp;
                      <span
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          deleteComment(comment.email, comment.id, comment.pw);
                        }}
                      >
                        삭제
                      </span>
                    </span>
                  ) : (
                    comment.pw !== ':logined' && (
                      <span>
                        {editCommentSwitch == comment.id ? (
                          <span
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                              setEditCommentSwitch(-1);
                              setEditCommentContent('');
                            }}
                          >
                            취소
                          </span>
                        ) : (
                          <span
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                              let prompt =
                                window.prompt('비밀번호를 입력해주세요');
                              if (prompt !== comment.pw) {
                                if (prompt) {
                                  alert('비밀번호를 확인해주세요');
                                }
                                return;
                              }
                              setEditCommentSwitch(comment.id);
                              let forSort = commentArr.slice(0);
                              setEditCommentContent(forSort.join(`\n`));
                            }}
                          >
                            수정
                          </span>
                        )}
                        &nbsp;&nbsp;
                        <span
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            deleteComment(
                              comment.email,
                              comment.id,
                              comment.pw,
                            );
                          }}
                        >
                          삭제
                        </span>
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })}
      </div>
      <br></br>
      <div className="comment">
        <div className="each-post-comments">
          <div className="each-post-comment-info-wrapper">
            {session?.user ? (
              <span style={{ fontWeight: 900 }}>{session?.user.name}</span>
            ) : (
              <input
                value={commentId}
                onChange={handleId}
                className="each-post-comment-info"
                type="text"
                placeholder="아이디"
                maxLength={8}
              ></input>
            )}
            {!session?.user && (
              <input
                value={commentPw}
                onChange={handlePw}
                className="each-post-comment-info"
                type="password"
                placeholder="****"
                maxLength={8}
              ></input>
            )}
          </div>
        </div>
        <div className="each-post-comment-content-wrapper">
          <textarea
            className="each-post-comment-content"
            style={{ width: '70%' }}
            value={commentContent}
            onChange={handleContent}
          ></textarea>
          <button
            className="each-post-comment-sumbit font-insert-2"
            onClick={addComment}
          >
            작성
          </button>
        </div>
      </div>
    </div>
  );
}
