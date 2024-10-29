'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import {
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from 'firebase/storage';
import { storage } from '@/data/firebase';
import { Quill } from 'react-quill';
import registerQuillSpellChecker from 'react-quill-spell-checker';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaRegThumbsUp } from 'react-icons/fa';
import { MdOutlinePreview } from 'react-icons/md';
import ProfileBox from '@/components/ProfileBox';
import { FaRegThumbsDown } from 'react-icons/fa';
import { MdAddPhotoAlternate } from 'react-icons/md';
import { RiArrowRightSLine } from 'react-icons/ri';
import { RiArrowLeftSLine } from 'react-icons/ri';

export default function PostPage() {
  const { data: session, update } = useSession();
  const [commentId, setCommentId] = useState('');
  const [commentPw, setCommentPw] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [editCommentContent, setEditCommentContent] = useState('');
  const [commentPage, setCommentPage] = useState(1);
  const [totalComment, setTotalComment] = useState(0);
  const [currentCommentPage, setCurrentCommentPage] = useState(1);
  const [commentRefresh, setCommentRefresh] = useState<any>({
    act: '',
    num: 0,
  });
  const [currentClickedUser, setCurrentClickedUser] = useState('');
  const [currentClickedComment, setCurrentClickedComment] = useState('');
  const [editCommentSwitch, setEditCommentSwitch] = useState(-1);
  const [beforeArrow, setBeforeArrow] = useState(false);
  const [afterArrow, setAfterArrow] = useState(false);
  const router = useRouter();
  const [post, setPost] = useState<any>({
    postId: '',
    title: '',
    writer: '',
    likes: '',
    views: '',
    content: '',
    email: '',
  });
  const [comments, setComments] = useState<any>([]);
  const params = useSearchParams();

  const linkify = (content: string) => {
    let html = content
      .replace(/<\/?p[^>]*>/gi, '') // <p> 및 </p> 태그 제거
      .replace(/<\/?span[^>]*>/gi, '') // <span> 및 </span> 태그 제거
      .split(/(<br\s*\/?>)/gi) // <br> 태그를 기준으로 분할
      .map((text: string) => text.trim()) // 공백 제거
      .filter((text: string) => text !== '');
    const regex = /(?<!src=")https?:\/\/[^\s/$.?#].[^\s]*/;
    const afterTask = html
      .map((line: string) => {
        return regex.test(line)
          ? `<p><a target="_blank" style="color:blue;" href="${line}">${line}</a></p>`
          : `<p>${line}</p>`;
      })
      .join('');
    return afterTask;
  };

  const dateMaker = (num: number) => {
    const date = new Date(num);

    // 각 요소를 추출
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // "년도-월-일 시:분" 형식으로 변환
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
    return formattedDate;
  };

  const getPost = async () => {
    let result = await fetch(
      `http://localhost:3000/api/post-page/${params.get('num')}`,
      {
        method: 'GET',
        cache: 'no-store',
      },
    );
    let final = await result.json();
    if (final.data.length > 0) {
      let afterTask = linkify(final.data[0].content);
      let date = dateMaker(final.data[0].postNum);
      console.log(final.data[0]);
      setPost({
        postId: final.data[0].id,
        boardName: final.data[0].boardName,
        title: final.data[0].title,
        writer: final.data[0].writer,
        likes: final.data[0].likes,
        hates: final.data[0].hates,
        views: final.data[0].views,
        image: final.data[0].profileImage,
        content: afterTask,
        date: date,
        email: final.data[0].email,
      });
    } else {
      alert('해당 게시글이 존재하지 않습니다');
      router.back();
      return;
    }
  };

  const editPost = async () => {
    router.push(`/edit-page?id=${params.get('id')}&num=${params.get('num')}`);
  };

  const deletePost = async () => {
    let confirm = window.confirm('글을 삭제하시겠습니까?');
    if (confirm) {
      let result = await fetch(
        `http://localhost:3000/api/post/${params.get('num')}`,
        {
          method: 'DELETE',
          cache: 'no-store',
        },
      );
      let final = await result.json();
      if (final.message == '성공') {
        alert('글이 삭제되었습니다');
        router.push(`/community/${params.get('id')}`);
      } else {
        alert('글 삭제에 실패했습니다');
      }
    }
  };

  // const paginationTask = (page : string, posts : any, type : string) => {
  //   if(type==)
  //   setPosts(posts);
  //   let now = params.get('page');
  //   if (Number(now) < 11) {
  //     setBeforeArrow(false);
  //   } else {
  //     setBeforeArrow(true);
  //   }
  //   if (page % 10 == 1) {
  //     afterArrowHandling(page, final.data[1]);
  //   } else {
  //     if (page % 10 == 0) {
  //       let newPages = [];
  //       for (let i = page; i > page - 10; i--) {
  //         newPages.push(i);
  //       }
  //       setPostsNum(newPages.reverse());
  //       let leftQuantity = page * 10;
  //       if (final.data[1] - leftQuantity > 0) {
  //         setAfterArrow(true);
  //       }
  //     }
  //   }
  // }

  // const afterArrowHandling = (page: number, quantity: number) => {
  //   let frontQuantity = 10 * (page - 1);
  //   let leftQuantity = quantity - frontQuantity;
  //   if (leftQuantity >= 100) {
  //     setPostsNum(
  //       Array(10)
  //         .fill(0)
  //         .map((num, idx) => {
  //           return idx + page;
  //         }),
  //     );
  //     if (leftQuantity < 101) {
  //       setAfterArrow(false);
  //     }
  //   } else {
  //     let leftPages = Math.ceil(leftQuantity / 10);
  //     let newPages = [];
  //     for (let i = 0; i < leftPages; i++) {
  //       newPages.push(page + i);
  //     }
  //     setPostsNum(newPages);
  //     setAfterArrow(false);
  //   }
  // };

  // const movePage = async (direction: string) => {
  //   let now = searchParams.get('page');
  //   if (!now) now = '1';
  //   let realNow = pageNumReplacer(+now, direction);
  //   updateQuery(realNow);
  // };

  // const pageNumReplacer = (num: number, direction: string) => {
  //   let realNow;
  //   if (direction == 'next') {
  //     if (num % 10 == 0) {
  //       realNow = num + 1;
  //     } else {
  //       realNow = Math.ceil(num / 10) * 10 + 1;
  //     }
  //   } else {
  //     if (num % 10 == 0) {
  //       realNow = Math.floor(num / 10) * 10 - 10;
  //     } else {
  //       realNow = Math.floor(num / 10) * 10;
  //     }
  //     console.log(realNow);
  //   }
  //   return realNow;
  // };

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

  const addComment = async () => {
    if (!session?.user?.name && !commentId) {
      alert('아이디를 입력해주세요');
      return;
    }
    if (!session?.user?.name && !commentPw) {
      alert('비밀번호를 입력해주세요');
      return;
    }
    if (!commentContent) {
      alert('내용을 입력해주세요');
      return;
    }
    let contentArr = [];
    if (commentContent.includes('\n')) {
      contentArr = commentContent.split('\n');
    } else {
      contentArr.push(commentContent);
    }
    let stringifiedCommentArr = JSON.stringify(contentArr);
    const postingComment = {
      email: session?.user?.email ? session?.user?.email : 'none',
      id: commentId ? commentId : session?.user?.name,
      pw: commentPw ? commentPw : ':logined',
      content: stringifiedCommentArr,
      pageid: post.postId,
    };
    let result = await fetch(`http://localhost:3000/api/comment`, {
      method: 'POST',
      body: JSON.stringify(postingComment),
      cache: 'no-store',
    });
    const final = await result.json();
    if (final.message == '성공') {
      setCommentRefresh({ act: 'add', num: commentRefresh.num + 1 });
      setCommentContent('');
    }
  };

  const getComments = async (num: number) => {
    setCurrentCommentPage(num ? num : 1);
    let result = await fetch(
      `http://localhost:3000/api/comment/${post.postId}:${num}`,
      {
        method: 'GET',
        cache: 'no-store',
      },
    );
    const dbCommentData = await result.json();
    if (dbCommentData.data.length > 0) {
      let parsed = dbCommentData.data[0].map((x: any) => {
        let temp = JSON.parse(x.content);
        temp = temp.map((y: string) => linkify(y));
        x.content = JSON.stringify(temp);
        return x;
      });
      setComments(parsed);
      setCommentPage(Math.ceil(dbCommentData.data[1] / 10));
      setTotalComment(dbCommentData.data[1]);
      // 이거 나중에 100으로 바꾸기
    } else {
      setCommentPage(1);
      setTotalComment(0);
      setComments([]);
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

  const deleteComment = async (email: any, commentId: string, pw: string) => {
    if (pw == ':logined') {
      // 내 댓글인지 유동댓글인지 체크하는거 필요
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
        setEditCommentSwitch(-1);
        setEditCommentContent('');
        setCommentRefresh({ act: 'delete', num: commentRefresh.num + 1 });
      }
    } else {
      if (checker !== null) {
        alert('비밀번호를 확인해주세요');
      }
    }
  };

  // const clickLikeOrHate = async (type: string) => {
  //   let packet = {
  //     mediaId: post.postId,
  //     type: type,
  //     userId: session?.user.email,
  //   };
  //   await fetch(`http://localhost:3000/api/like-hate/${post.postId}`, {
  //     method: 'POST',
  //     body: JSON.stringify(packet),
  //     cache: 'no-store',
  //   });
  // };

  const handlePrefer = async (type: string) => {
    if (session?.user?.name) {
      let result = await fetch(
        `http://localhost:3000/api/like-hate/${post.postId}`,
        {
          method: 'POST',
          body: JSON.stringify({
            userId: session?.user?.email,
            type: 'post',
            which: type,
          }),
          cache: 'no-store',
        },
      );
      const final = await result.json();
      let newPost = { ...post };
      if (final.data.status == '좋아요변경') {
        newPost.likes = final.data.likes;
        setPost(newPost);
      } else {
        newPost.hates = final.data.hates;
        setPost(newPost);
      }
    } else {
      alert('로그인 후 가능합니다');
      return;
    }
  };

  useEffect(() => {
    getPost();
  }, []);

  useEffect(() => {
    if (post.postId) {
      getComments(1);
    }
  }, [post]);

  useEffect(() => {
    if (post.postId && commentRefresh.num > 0) {
      if (commentRefresh.act == 'delete') {
        let now = Math.ceil((totalComment - 1) / 10);
        getComments(now);
      }
      if (commentRefresh.act == 'edit') {
        getComments(currentCommentPage);
      }
      if (commentRefresh.act == 'add') {
        let now = Math.ceil((totalComment + 1) / 10);
        getComments(now);
      }
    }
  }, [commentRefresh]);

  // useEffect(() => {
  //   setEditCommentContent('');
  // }, [editCommentContent]);
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="each-post-page font-insert">
        <button
          style={{ fontWeight: 900 }}
          className="each-post-category-title font-insert-2"
          onClick={() => {
            router.push(`/community/${post.boardName}`);
          }}
        >
          {post.boardName} 게시판
        </button>
        <div className="each-post-title-wrapper">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {/* <div className="each-post-profile-image-wrapper"> */}
            <img className="each-post-profile-image" src={post.image} />
            {/* </div> */}
            <div>
              <div className="each-post-title" style={{ fontWeight: 900 }}>
                {post.title}
              </div>
              <div className="each-post-title-below-wrapper">
                <div
                  style={{ cursor: 'pointer', fontWeight: 900 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentClickedUser) {
                      setCurrentClickedUser('');
                    } else {
                      setCurrentClickedUser(post?.postId);
                    }
                  }}
                >
                  {post.writer}
                </div>
                {currentClickedUser == post?.postId && (
                  <ProfileBox
                    props={{
                      ...post,
                      show: currentClickedUser,
                      func: setCurrentClickedUser,
                    }}
                  />
                )}
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'end',
            }}
          >
            <div className="each-post-view-like-wrapper">
              {session?.user?.email == post.email && (
                <div style={{ display: 'flex' }}>
                  <button
                    className="each-post-edit-button font-insert-2"
                    style={{ paddingLeft: '0px' }}
                    onClick={editPost}
                  >
                    수정
                  </button>
                  <button
                    className="each-post-edit-button font-insert-2"
                    onClick={deletePost}
                  >
                    삭제
                  </button>
                </div>
              )}
              {/* <div className="each-post-data-item">
                  <FaRegThumbsUp />
                  {post.likes}
                </div> */}
              <div className="each-post-data-item font-insert-2">
                조회 {post.views}
              </div>
            </div>
            <div className="each-post-data-item-date font-insert-2">
              {post.date}
            </div>
          </div>
        </div>
        <div className="each-post-content">
          <div dangerouslySetInnerHTML={{ __html: post.content }}></div>
          <div className="each-post-like-hate-wrapper">
            <div className="each-post-like-hate">
              <div
                className="each-post-like-hate-button"
                onClick={(e) => {
                  handlePrefer('like');
                }}
              >
                <FaRegThumbsUp />{' '}
                <div className="font-insert-2">추천 {post.likes}</div>
              </div>
              <div
                className="each-post-like-hate-button"
                onClick={(e) => {
                  handlePrefer('hate');
                }}
              >
                <FaRegThumbsDown />{' '}
                <div className="font-insert-2">비추 {post.hates}</div>
              </div>
            </div>
          </div>
        </div>
        {/* <div>{post.email}</div> */}
        <div className="each-post-comments-wrapper">
          <div className="each-post-comment-upperline font-insert-2">
            <div>댓글 {totalComment}</div>
            {totalComment > 10 && (
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
          {comments.map((comment: any) => {
            let commentArr = JSON.parse(comment.content);
            return (
              <div className="each-post-comment">
                <span
                  style={{
                    cursor: 'pointer',
                    fontWeight: comment.email !== 'none' ? 900 : 400,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentClickedComment) {
                      setCurrentClickedComment('');
                    } else {
                      setCurrentClickedComment(comment?.id);
                    }
                  }}
                >
                  {comment.nick}
                </span>
                {currentClickedComment == comment?.id && (
                  <ProfileBox
                    props={{
                      ...comment,
                      show: currentClickedComment,
                      writer: comment.nick,
                      func: setCurrentClickedComment,
                    }}
                  />
                )}
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
                  <>
                    {commentArr.map((each: any, idx: number) => {
                      return (
                        <div>
                          <div dangerouslySetInnerHTML={{ __html: each }}></div>
                          {comment.isEdited == 'true' &&
                            idx == commentArr.length - 1 && (
                              <span className="each-post-comment-edited">
                                (수정됨)
                              </span>
                            )}
                        </div>
                      );
                    })}
                    {/* {comment.isEdited == 'true' && (
                      <div className="each-post-comment-edited">(수정됨)</div>
                    )} */}
                  </>
                )}
                {/* {commentArr.map((each: any) => {
                  return <div>{each}</div>;
                })} */}
                <div className="each-post-comment-date">
                  {comment.date.replace(/-/g, '.').split(' ')[1]}
                  &nbsp;&nbsp;&nbsp;
                  {comment.date.replace(/-/g, '.').split(' ')[0]}
                  &nbsp;&nbsp;&nbsp;
                  {(session?.user?.email == comment.email ||
                    comment.email == 'none') && (
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
                            if (session?.user.email !== comment.email) {
                              console.log(comment.pw);
                              let prompt =
                                window.prompt('비밀번호를 입력해주세요');
                              if (prompt !== comment.pw) {
                                if (prompt) {
                                  alert('비밀번호를 확인해주세요');
                                }
                                return;
                              }
                            }
                            console.log(comment.id);
                            setEditCommentSwitch(comment.id);
                            let forSort = commentArr.slice(0);
                            let htmlString = forSort.join(`\n`);
                            let parser = new DOMParser();
                            let doc = parser.parseFromString(
                              htmlString,
                              'text/html',
                            );
                            // 모든 p 태그를 선택하고 텍스트 내용을 배열로 변환
                            let textArray = Array.from(
                              doc.querySelectorAll('p'),
                            ).map((p) => p.textContent);
                            setEditCommentContent(textArray.join(`\n`));
                          }}
                        >
                          수정
                        </span>
                      )}
                      &nbsp;&nbsp;&nbsp;
                      <span
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          if (comment.pw == ':logined') {
                            deleteComment(
                              comment.email,
                              comment.id,
                              ':logined',
                            );
                          } else {
                            deleteComment('none', comment.id, comment.pw);
                          }
                        }}
                      >
                        삭제
                      </span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="each-post-comments">
          {!session?.user?.email && (
            <div className="each-post-comment-info-wrapper">
              <input
                style={{ outline: 'none' }}
                onChange={(e) => {
                  setCommentId(e.target.value);
                }}
                value={commentId}
                className="each-post-comment-info"
                placeholder="닉네임"
              ></input>
              <input
                style={{ outline: 'none' }}
                onChange={(e) => {
                  setCommentPw(e.target.value);
                }}
                value={commentPw}
                className="each-post-comment-info"
                placeholder="비밀번호"
              ></input>
            </div>
          )}

          <div className="each-post-comment-content-wrapper">
            <textarea
              className="each-post-comment-content"
              value={commentContent}
              onChange={(e) => {
                setCommentContent(e.target.value);
              }}
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
    </div>
  );
}
