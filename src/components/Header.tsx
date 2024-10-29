'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';
import { ModeToggle } from './dark-mode-toggle';
import { MenuToggle } from './menu-toggle';
import { CiUser } from 'react-icons/ci';
import styled from 'styled-components';
import { GlobalStore } from '@/data/store';
import { useStore } from 'zustand';
import { CiMenuBurger } from 'react-icons/ci';
import logo from '@/asset/psk-logo.png';
import defaultImage from '@/asset/psk-logo.png';
import BalloonAlert from './BalloonAlert';
import { useSession } from 'next-auth/react';
import PocketBase from 'pocketbase';

export default function Header() {
  const pb = new PocketBase('https://pk-place.pockethost.io/');
  const { data: session } = useSession();
  const { sidebar, setSidebar } = GlobalStore();
  const { chat, setChat, newMessage, setNewMessage, chatList, setChatList } =
    GlobalStore();

  const handleSidebar = () => {
    setSidebar(!sidebar);
  };

  const subscribeChats = async (target: string) => {
    try {
      pb.collection('test').subscribe('*', async function (e) {
        if (
          e.record.field[e.record.field.length - 1]?.receiver ==
            session?.user.email ||
          e.record.field[e.record.field.length - 1]?.email ==
            session?.user.email
        ) {
          // 보내는 사람이거나 받는 사람일 때 발동함
          try {
            let oneLastChat: any = await getLists(
              target,
              [
                e.record.field[e.record.field.length - 1]?.receiver,
                e.record.field[e.record.field.length - 1]?.email,
              ],
              e.record.field[e.record.field.length - 1]?.chat,
            );
            if (
              e.record.field[e.record.field.length - 1]?.receiver ==
              session?.user.email
            ) {
              // 받는 사람에게만 발동
              setNewMessage(e.record.field[e.record.field.length - 1]);
            }
            if (
              e.record.field[e.record.field.length - 1]?.email ==
              session?.user.email
            ) {
              try {
                await pb.collection('user_each_chat').update(oneLastChat?.id, {
                  field: JSON.stringify(oneLastChat?.chatData),
                });
              } catch (e) {
                console.log('컬렉션업데이트실패');
              }
            }
          } catch (e) {}
        }
      });
      // 이건 처음 로그인 했을 때만
      try {
        getLists(target, [], '');
      } catch (e) {}
    } catch (e) {
      console.log('좀 그만떠');
    }
  };

  const getLists = async (target: string, members: any, chat: string) => {
    try {
      // target의 모든 채팅의 목록을 가져옴
      const resultList = await pb.collection('user_each_chat').getList(1, 50, {
        filter: `field.people ~ "${target}"`,
      });
      const list = resultList.items;
      let listOfChat = [];
      let onlyOne = { id: '', chatData: {} };
      for (let i = 0; i < list.length; i++) {
        const newTargetProfile = await changeTargetsProfile(list[i].field);
        if (
          members.includes(list[i].field.people[0].userEmail) &&
          members.includes(list[i].field.people[1].userEmail)
        ) {
          // 나와 상대방이 이 채팅방에 있을 경우에
          newTargetProfile.lastChat = chat;
          onlyOne.id = list[i].field.chatid;
          onlyOne.chatData = newTargetProfile;
        }
        listOfChat.push(newTargetProfile);
      }
      setChatList(listOfChat);
      return onlyOne;
    } catch (e: any) {
      console.log(e.status);
    }
  };

  const changeTargetsProfile = async (profile: any) => {
    try {
      // 가져온 채팅들의 프로필을 전부 수정하는 영역
      let target = '';
      for (let i = 0; i < profile.people.length; i++) {
        if (profile.people[i].userEmail !== session?.user.email) {
          target = profile.people[i].userEmail;
        }
      }
      let result = await fetch(`http://localhost:3000/api/profile/${target}`, {
        method: 'GET',
        cache: 'no-store',
      });
      let res = await result.json();
      for (let j = 0; j < profile.people.length; j++) {
        if (profile.people[j].userEmail !== session?.user.email) {
          profile.people[j].userName = res.data.userNick;
          profile.people[j].userImage = res.data.userImage;
        }
      }
      return profile;
    } catch (e: any) {
      console.log(e.status);
      return {};
    }
  };

  useEffect(() => {
    if (session) {
      const id = session?.user.email;
      try {
        subscribeChats(id as string);
      } catch (e) {}
    }
  }, [session]);

  return (
    <>
      <header>
        <div>
          <Link className="link" href="/">
            <div style={{ padding: '5px' }}>
              <img style={{ width: '30px' }} src={logo.src}></img>
            </div>
          </Link>
        </div>
        <div className="link-each">
          <Link className="link" href="/community">
            COMMUNITY
          </Link>
        </div>
        <div className="link-each">
          <Link className="link" href="/replayzer">
            REPLAYZER
          </Link>
        </div>
        <div className="link-each">
          <Link className="link" href="/prefer-diagram">
            PREFER-DIAGRAM
          </Link>
        </div>
        <div className="link-each">
          <Link className="link" href="/tier">
            TIER-GENERATOR
          </Link>
        </div>
        <div className="link-each">
          <Link className="link" href="/ladder">
            LADDER
          </Link>
        </div>
        <div className="link-each">
          <Link className="link" href="/fame">
            HALL-OF-FAME
          </Link>
        </div>
        <div className="header-button-wrapper">
          <button className="login" onClick={handleSidebar}>
            {session ? (
              <div className="profile-image2">
                <img
                  className="profile-image-content"
                  src={
                    !(session?.user?.image as string) ||
                    (session?.user?.image as string) == 'default'
                      ? defaultImage.src
                      : (session?.user?.image as string)
                  }
                ></img>
                <BalloonAlert></BalloonAlert>
              </div>
            ) : (
              <CiUser style={{ color: 'red' }} />
            )}
          </button>
          <ModeToggle />
        </div>
      </header>
      <div className="header2">
        <div className="header-left-side">
          {/* <div className="menu">
            <CiMenuBurger />
            <div className="menu-drop">
              <div className="menu-each-link">
                <Link href="/replayzer">COMMUNITY</Link>
              </div>
              <div className="menu-each-link">
                <Link href="/replayzer">COMMUNITY</Link>
              </div>
              <div className="menu-each-link">
                <Link href="/replayzer">COMMUNITY</Link>
              </div>
              <div className="menu-each-link">
                <Link href="/replayzer">COMMUNITY</Link>
              </div>
              <div className="menu-each-link">
                <Link href="/replayzer">COMMUNITY</Link>
              </div>
            </div>
          </div> */}
          <MenuToggle />
        </div>
        <div>
          <Link className="link" href="/">
            <div style={{ padding: '5px' }}>
              <img style={{ width: '30px' }} src={logo.src}></img>
            </div>
          </Link>
        </div>
        <div>
          <div className="header-button-wrapper font-insert">
            <button className="login" onClick={handleSidebar}>
              {session ? (
                <div className="profile-image2">
                  <img
                    className="profile-image-content"
                    src={
                      !(session?.user?.image as string) ||
                      (session?.user?.image as string) == 'default'
                        ? defaultImage.src
                        : (session?.user?.image as string)
                    }
                  ></img>
                  <BalloonAlert></BalloonAlert>
                </div>
              ) : (
                <CiUser style={{ color: 'red' }} />
              )}
            </button>
            <ModeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
