'use client';
import Image from 'next/image';
import { Upload } from '@/func/upload';
import { useEffect, useRef, useState } from 'react';
import { GlobalStore } from '@/data/store';
import SideBar from '@/components/Sidebar';
import bannerImg from '@/asset/pk-logo.png';
import CarouselComponent from '@/components/Carousel';
import defaultImage from '@/asset/psk-logo.png';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { todayChecker } from '@/func/date-checker';
import { FaPen } from 'react-icons/fa';
import { FaSearch } from 'react-icons/fa';
import ClipLoader from 'react-spinners/ClipLoader';
import ProfileBox from '@/components/ProfileBox';
import { useSession } from 'next-auth/react';
import { MdAddPhotoAlternate } from 'react-icons/md';
import { RiArrowRightSLine } from 'react-icons/ri';
import { RiArrowLeftSLine } from 'react-icons/ri';
import PocketBase from 'pocketbase';

export default function Home() {
  // const pb = new PocketBase('https://pk-place.pockethost.io/');
  const { data: session, update } = useSession();
  const [currentClickedUser, setCurrentClickedUser] = useState('');
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [postsNum, setPostsNum] = useState<any>([]);
  // const [realPostsNum, setRealPostsNum] = useState(0);
  //   const [searchKeyword, setSearchKeyword] = useState('');
  const searchKeyword = useRef<any>(null);
  const [isSearched, setIsSearched] = useState(false);
  const [searchOption, setSearchOption] = useState('all');
  const [beforeArrow, setBeforeArrow] = useState(false);
  const [afterArrow, setAfterArrow] = useState(false);
  const [pageColor, setPageColor] = useState(0);
  const param = useParams();
  const searchParams = useSearchParams();

  const getPosts = async () => {
    let result = await fetch(`http://localhost:3000/api/post/${param.id}`, {
      method: 'GET',
      cache: 'no-store',
    });
    const final = await result.json();
    if (final.message == '성공') {
      setPosts(final.data[0]);
      let now = searchParams.get('page');
      if (Number(now) < 11) {
        setBeforeArrow(false);
      } else {
        setBeforeArrow(true);
      }
      if (final.data[1] > 100) {
        setPostsNum(
          Array(10)
            .fill(0)
            .map((num, idx) => {
              return idx + 1;
            }),
        );
        setAfterArrow(true);
      } else {
        let realPagesNum = Math.ceil(final.data[1] / 10);
        setPostsNum(
          Array(realPagesNum)
            .fill(0)
            .map((num, idx) => {
              return idx + 1;
            }),
        );
      }
    } else {
      alert('해당 게시판은 존재하지 않습니다');
      router.push('/');
    }
  };

  const getSpecificPagePosts = async (page: number) => {
    let result = await fetch(
      `http://localhost:3000/api/post/${param.id}:${page}`,
      {
        method: 'GET',
        cache: 'no-store',
      },
    );
    const final = await result.json();
    if (final.message == '성공') {
      setPosts(final.data[0]);
      let now = searchParams.get('page');
      if (Number(now) < 11) {
        setBeforeArrow(false);
      } else {
        setBeforeArrow(true);
      }
      if (page % 10 == 1) {
        afterArrowHandling(page, final.data[1]);
      } else {
        if (page % 10 == 0) {
          let newPages = [];
          for (let i = page; i > page - 10; i--) {
            newPages.push(i);
          }
          setPostsNum(newPages.reverse());
          let leftQuantity = page * 10;
          if (final.data[1] - leftQuantity > 0) {
            setAfterArrow(true);
          }
        }
      }
    } else {
      alert('해당 게시판은 존재하지 않습니다');
      router.push('/');
    }
  };

  const afterArrowHandling = (page: number, quantity: number) => {
    let frontQuantity = 10 * (page - 1);
    let leftQuantity = quantity - frontQuantity;
    if (leftQuantity >= 100) {
      setPostsNum(
        Array(10)
          .fill(0)
          .map((num, idx) => {
            return idx + page;
          }),
      );
      if (leftQuantity < 101) {
        setAfterArrow(false);
      }
    } else {
      let leftPages = Math.ceil(leftQuantity / 10);
      let newPages = [];
      for (let i = 0; i < leftPages; i++) {
        newPages.push(page + i);
      }
      setPostsNum(newPages);
      setAfterArrow(false);
    }
  };

  const movePage = async (direction: string) => {
    let now = searchParams.get('page');
    if (!now) now = '1';
    let realNow = pageNumReplacer(+now, direction);
    updateQuery(realNow);
  };

  const pageNumReplacer = (num: number, direction: string) => {
    let realNow;
    if (direction == 'next') {
      if (num % 10 == 0) {
        realNow = num + 1;
      } else {
        realNow = Math.ceil(num / 10) * 10 + 1;
      }
    } else {
      if (num % 10 == 0) {
        realNow = Math.floor(num / 10) * 10 - 10;
      } else {
        realNow = Math.floor(num / 10) * 10;
      }
      console.log(realNow);
    }
    return realNow;
  };

  // const getPosts = async () => {
  //   let result = await fetch(`http://localhost:3000/api/post/${param.id}`, {
  //     method: 'GET',
  //     cache: 'no-store',
  //   });
  //   const final = await result.json();
  //   if (final.message == '성공') {
  //     console.log(final.data);
  //     setPosts(final.data);
  //   } else {
  //     alert('해당 게시판은 존재하지 않습니다');
  //     router.push('/');
  //   }
  // };

  const chooseSearchOption = (e: any) => {
    // console.log(e.target.value);
    setSearchOption(e.target.value);
  };

  const searchPosts = async () => {
    try {
      let result = await fetch(
        `http://localhost:3000/api/post/${param.id}?option=${searchOption}&value=${searchKeyword.current?.value}&page=1`,
        {
          method: 'GET',
          cache: 'no-store',
        },
      );
      const final = await result.json();
      console.log(final);
      if (final.message == '성공') {
        setPosts(final.data);
        setIsSearched(true);
      }
    } catch (e) {}
  };

  const updateQuery = (num: number) => {
    router.push(
      `/community/${decodeURIComponent(param.id as string)}?page=${num}`,
    );
    setPageColor(num);
  };

  const forTest = async () => {
    let result = await fetch(`http://localhost:3000/api/post`, {
      method: 'POST',
      body: JSON.stringify({
        boardName: 'test',
        content: '제발용',
        title: 'test',
        writer: session?.user.name,
        email: session?.user.email,
      }),
      cache: 'no-store',
    });
    const res = await result.json();
    if (res.message === '성공') {
      alert('글을 작성하셨습니다');
      getPosts();
    } else {
      alert('해당 게시판은 존재하지 않습니다');
      router.push(`/community`);
    }
  };

  useEffect(() => {
    getPosts();
    setPageColor(1);
  }, []);

  useEffect(() => {
    if (searchParams.get('page')) {
      let num = Number(searchParams.get('page'));
      getSpecificPagePosts(num);
      setPageColor(num);
    }
  }, [searchParams]);

  return (
    <div className="main-page font-insert">
      <div
        style={{ fontWeight: 900 }}
        className="board-title font-insert-2"
        onClick={() => {
          router.push(`/community/${param.id}?page=1`);
          getSpecificPagePosts(1);
          setPageColor(1);
        }}
      >
        {decodeURIComponent(param.id as string)} 게시판
      </div>
      {/* <div>
        <button
          onClick={() => {
            forTest();
          }}
        >
          temp
        </button>
      </div> */}
      <br></br>
      <div className="board-upperpart">
        <button
          className="post-button"
          onClick={() => {
            if (session?.user) {
              router.push(`/post?id=${param.id}`);
            } else {
              alert('로그인을 해주세요');
            }
            // 비로그인 글쓰기를 풀 경우 이걸로
            // router.push(`/post?id=${param.id}`);
          }}
        >
          <FaPen />
        </button>
        <div className="post-search-area">
          <select className="post-search-option" onChange={chooseSearchOption}>
            <option value="all">전체</option>
            <option value="title">제목</option>
            <option value="content">내용</option>
            <option value="title_content">제목+내용</option>
            <option value="writer">작성자</option>
          </select>
          <input className="post-search-bar" ref={searchKeyword}></input>
          <button className="post-search-button" onClick={searchPosts}>
            <FaSearch />
          </button>
        </div>
      </div>
      <div className="middle-area board-layout">
        <div className="post">
          {posts.length > 0 ? (
            posts.map((item: any) => {
              return (
                <div
                  key={item?.postNum}
                  className="board-post"
                  onClick={() => {
                    router.push(
                      `/post-page?id=${item?.boardName}&num=${item?.postNum}`,
                    );
                  }}
                >
                  <div className="board-post-title">
                    <div
                      style={{
                        display: 'flex',
                        maxWidth: '100%',
                      }}
                    >
                      {item?.content.includes('<img src') && (
                        <MdAddPhotoAlternate style={{ color: 'red' }} />
                      )}

                      <div className="board-post-title-limit">
                        {item?.title}
                      </div>
                    </div>{' '}
                    <div style={{ fontWeight: 900 }}>[{item?.comment}]</div>
                  </div>
                  <div className="board-post-info-layout">
                    <div className="board-post-info-each board-post-info-writer">
                      <div
                        style={{
                          fontWeight: item?.email != 'none' ? 900 : 400,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentClickedUser) {
                            setCurrentClickedUser('');
                          } else {
                            setCurrentClickedUser(item?.postNum);
                          }
                        }}
                      >
                        {item?.writer}
                      </div>
                      {currentClickedUser == item?.postNum && (
                        <ProfileBox
                          props={{
                            ...item,
                            show: currentClickedUser,
                            func: setCurrentClickedUser,
                          }}
                        />
                      )}
                    </div>
                    <div className="board-post-info font-insert-2">
                      <div className="board-post-info-each">
                        ({todayChecker(item?.postNum)})
                      </div>
                      <span> </span>
                      <div className="board-post-info-each">
                        조회 {item?.views}
                      </div>
                      <div className="board-post-info-each">
                        추천 {item?.likes}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : !isSearched ? (
            <div style={{ textAlign: 'center' }}>
              <br></br>
              <ClipLoader
                color="red"
                size={50}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <br></br>
              해당 결과가 없습니다
              <br></br>
            </div>
          )}
          <div className="board-pagination">
            {beforeArrow && (
              <div
                className="board-pagination-arrow"
                onClick={() => {
                  movePage('past');
                }}
              >
                <RiArrowLeftSLine />
              </div>
            )}
            {postsNum.map((num: number) => {
              return (
                <div
                  style={{ color: num == pageColor ? 'blue' : 'inherit' }}
                  className="board-pagination-each"
                  onClick={() => {
                    updateQuery(num);
                  }}
                >
                  {num}
                </div>
              );
            })}
            {afterArrow && (
              <div
                className="board-pagination-arrow"
                onClick={() => {
                  movePage('next');
                }}
              >
                <RiArrowRightSLine />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
