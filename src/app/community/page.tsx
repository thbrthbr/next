'use client';
import Image from 'next/image';
import { Upload } from '@/func/upload';
import { useEffect, useRef, useState } from 'react';
import { GlobalStore } from '@/data/store';
import SideBar from '@/components/Sidebar';
import bannerImg from '@/asset/pk-logo.png';
import CarouselComponent from '@/components/Carousel';
import defaultImage from '@/asset/psk-logo.png';
import { useRouter } from 'next/navigation';
import { todayChecker } from '@/func/date-checker';

export default function Home() {
  const [boards, setBoards] = useState<any>([]);
  const router = useRouter();
  const data = [
    defaultImage.src,
    defaultImage.src,
    defaultImage.src,
    defaultImage.src,
    defaultImage.src,
    defaultImage.src,
    defaultImage.src,
    defaultImage.src,
    defaultImage.src,
  ];

  // const getHotPosts = async () => {
  //   let result = await fetch('http://localhost:3000/api/community', {
  //     method: 'GET',
  //     cache: 'no-store',
  //   });
  // }

  const getBoards = async () => {
    let result = await fetch('http://localhost:3000/api/community', {
      method: 'GET',
      cache: 'no-store',
    });
    let datas = await result.json();
    console.log(datas);
    let broughtData = [];
    for (let data in datas.data) {
      broughtData.push({
        boardName: data,
        posts: datas.data[data],
      });
    }
    setBoards(broughtData);
  };

  // const todayChecker = (date: string) => {
  //   let today = new Date();
  //   const year = today.getFullYear();
  //   const month = (today.getMonth() + 1).toString().padStart(2, '0');
  //   const day = today.getDate().toString().padStart(2, '0');
  //   const todayDate = year + '-' + month + '-' + day;
  //   if (date.split(' ')[0] == todayDate) {
  //     return date.split(' ')[1].slice(0, 5);
  //   } else if (
  //     parseInt(date.split(' ')[0].split('-')[2]) + 1 ==
  //     parseInt(day)
  //   ) {
  //     return '1일 전';
  //   } else if (
  //     parseInt(date.split(' ')[0].split('-')[2]) + 2 ==
  //     parseInt(day)
  //   ) {
  //     return '2일 전';
  //   } else if (
  //     parseInt(date.split(' ')[0].split('-')[2]) + 3 ==
  //     parseInt(day)
  //   ) {
  //     return '3일 전';
  //   } else {
  //     if (parseInt(date.split(' ')[0].split('-')[0]) == year) {
  //       let exceptYear = date.split(' ')[0].split('-');
  //       return exceptYear[1] + '.' + exceptYear[2];
  //     } else {
  //       return date.split(' ')[0].split('-').join('.');
  //     }
  //   }
  // };

  const forTest = async () => {
    //이건 나중에 관리자게시판에서 게시판 추가할 때 재활용하기
    //board 컬렉션 쪽에 데이터 추가하는 건 수작업으로
    let result = await fetch(`http://localhost:3000/api/post`, {
      method: 'POST',
      body: JSON.stringify({
        boardName: 'test',
        content: '제발용',
        title: 'test',
        writer: 'test',
        email: 'test',
      }),
      cache: 'no-store',
    });
    const res = await result.json();
    if (res.message === '성공') {
      alert('글을 작성하셨습니다');
    } else {
      alert('해당 게시판은 존재하지 않습니다');
      router.push(`/community`);
    }
  };

  useEffect(() => {
    getBoards();
  }, []);

  return (
    <div className="main-page font-insert">
      <CarouselComponent data={data} />
      <div className="middle-area">
        <div className="board-list">
          {boards.map((eachBoard: any) => {
            return (
              <div className="each-board-posts" key={eachBoard?.boardName}>
                <div className="board-title-line">
                  <span
                    className="font-insert-2"
                    style={{ cursor: 'pointer', color: 'black' }}
                    onClick={() => {
                      router.push(`/community/${eachBoard?.boardName}`);
                    }}
                  >
                    {eachBoard?.boardName}
                  </span>
                </div>
                <div style={{ width: '100%' }}>
                  {eachBoard?.posts.map((post: any, index: number) => {
                    return (
                      <div
                        key={index}
                        className="each-post-layout"
                        onClick={() => {
                          // console.log(post);
                          router.push(
                            `/post-page?id=${eachBoard?.boardName}&num=${post.postNum}`,
                          );
                        }}
                      >
                        <div style={{ display: 'flex', width: '80%' }}>
                          <div className="each-board-post-title-limit">
                            {post.title}
                          </div>
                          <span style={{ fontWeight: 900 }}>
                            [{post.comment}]
                          </span>
                        </div>
                        <div className="font-insert-2">
                          {todayChecker(post.date)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div
          onClick={() => {
            forTest();
          }}
        >
          안녕
        </div>
      </div>
      {/* 커뮤
      <div>등급 user iron bronze silver admin</div> */}
    </div>
  );
}
