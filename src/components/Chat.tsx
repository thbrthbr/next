'use client';

import { GlobalStore } from '@/data/store';
import { useRef, useState, useEffect } from 'react';
import defaultImage from '@/asset/psk-logo.png';
import PocketBase from 'pocketbase';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { IoIosClose } from 'react-icons/io';
import { IoMdArrowBack } from 'react-icons/io';
import { createHash } from 'crypto';
import { useInView } from 'react-intersection-observer';

export default function Chat() {
  const pb = new PocketBase('https://pk-place.pockethost.io/');
  const [sendingFail, setSendingFail] = useState(false);
  const [sendingRoomId, setSendingRoomId] = useState('');
  const [messageSets, setMessageSet] = useState<any>([]);
  const { chat, setChat, chatList, setChatList } = GlobalStore();
  const { data: session } = useSession();
  const chatSpaceRef = useRef<any>(null);
  const messageRef = useRef<any>(null);
  const chatRef = useRef<any>(null);
  const lastChatRef = useRef<any>(null);
  const [reference, inView] = useInView();

  const handleChatOff = () => {
    if (chatRef.current) {
      chatRef.current.style.transform = 'translateY(200%)';
      setTimeout(() => {
        setChat('');
      }, 800);
    }
  };

  const linkify = (text: any) => {
    const urlPattern =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    let message = urlPattern.test(text.text)
      ? `<a href="${text.text}" target="_blank">${text.text}</a>`
      : `<p>${text.text}</p>`;
    return message;
  };

  const TextWithLinks = (text: any) => {
    return <div dangerouslySetInnerHTML={{ __html: linkify(text) }} />;
  };

  const getUserProfile = async (email: string) => {
    try {
      let res = await fetch(`http://localhost:3000/api/profile/${email}`, {
        method: 'GET',
        cache: 'no-store',
      });
      const result = await res.json();
      getOneChat(
        chat.split(':')[0],
        chat.split(':')[1],
        result.data?.userNick,
        result.data?.userImage,
      );
    } catch (e) {}
  };

  const getMessages = async (id: string) => {
    try {
      const record = await pb.collection('test').getOne(id);
      setMessageSet(record.field);
    } catch (e) {}
  };

  const getOneChat = async (
    target: string,
    me: string,
    targetNick: string,
    targetImage: string,
  ) => {
    try {
      const resultList = await pb.collection('user_each_chat').getList(1, 50, {
        filter: `field.people ~ "${target}" && field.people ~ "${me}"`,
      });
      if (resultList.items.length > 0) {
        // 이미 방이 있는 경우
        const chatID = resultList.items[0].field.roomid;
        setSendingRoomId(chatID);
        getMessages(chatID);
        //구독하는 건 다른 타이밍에 할 수도 있음 -> 아마 로그인 된 순간 전부 구독해두는 걸로
        pb.collection('test').subscribe(chatID, async function (e: any) {
          //   console.log(e.action);
          //   console.log(e.record);
          try {
            setMessageSet(e.record?.field);
            // let newData = resultList.items[0].field;
            // newData.lastChat = e.record?.field[e.record?.field.length - 1].chat;
            // await pb
            //   .collection('user_each_chat')
            //   .update(resultList.items[0].field.chatid, {
            //     field: JSON.stringify(newData),
            //   });
          } catch (e: any) {
            console.log(e.status);
          }
        });
      } else {
        // 방만들기 (채팅데이터)
        const constantRoomId = createHash('sha256')
          .update(String(Date.now()) + String(Date.now()))
          .digest('hex')
          .slice(1, 16);

        setSendingRoomId(constantRoomId);

        const record_proto = await pb
          .collection('test')
          .create({ field: [], id: constantRoomId });

        // 방데이터만들기
        const date = new Date();
        const id = createHash('sha256')
          .update(String(Date.now()))
          .digest('hex')
          .slice(1, 16);
        let tempData = {
          roomName: String(Date.now()),
          chatid: id, // 이 방 하나의 아이디
          roomid: constantRoomId, // 그 방의 컨텐츠 아이디
          people: [
            {
              userName: session?.user.name,
              userEmail: session?.user.email,
              userImage: session?.user.image,
            },
            {
              userName: targetNick,
              userEmail: target,
              userImage: targetImage,
            },
          ],
          lastDate: format(date, 'yyyy-MM-dd'),
          roomImage: targetImage,
          chatOwner: {
            userName: session?.user.name,
            userEmail: session?.user.email,
          },
          lastChat: '-',
        };
        const record = await pb
          .collection('user_each_chat')
          .create({ field: tempData, id: id });
        setChatList([record.field, ...chatList]);
        //   setIsList(false);
        getMessages(constantRoomId);
        //구독하는 건 다른 타이밍에 할 수도 있음
        pb.collection('test').subscribe(
          constantRoomId,
          async function (e: any) {
            try {
              //   console.log(e.action);
              //   console.log(e.record);
              setMessageSet(e.record?.field);
              //   let newData = resultList.items[0].field;
              //   newData.lastChat =
              //     e.record?.field[e.record?.field.length - 1].chat;
              //   await pb
              //     .collection('user_each_chat')
              //     .update(resultList.items[0].field.chatid, {
              //       field: JSON.stringify(newData),
              //     });
            } catch (e) {}
          },
        );
      }
    } catch (e) {}
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const sendMessage = async (retry: null) => {
    try {
      const newMessage = messageRef.current?.value || retry;
      if (newMessage === null) return;
      try {
        if (messageRef.current && newMessage) {
          messageRef.current.value = '';
          const record = await pb.collection('test').getOne(sendingRoomId);
          const date = new Date();
          const formattedDate = format(date, 'yyyy-MM-dd HH:mm:ss');
          const message = {
            // people : [],
            user: session?.user?.name,
            email: session?.user?.email,
            receiver: chat.split(':')[0],
            date: formattedDate,
            chat: newMessage,
          };
          await pb.collection('test').update(sendingRoomId, {
            field: JSON.stringify([...record.field, message]),
          });
          messageRef.current.readOnly = false;
        } else {
          if (!newMessage) {
            console.log('이미증발함ㅅㄱ');
          }
        }
      } catch (error: any) {
        console.log(error.status);
        messageRef.current.readOnly = true;
        await delay(1000);
        await sendMessage(newMessage);
      }
    } catch (e) {}
  };

  const getPlaceholder = () => {
    if (sendingFail) {
      return '메세지 전송실패';
    } else {
      return '메세지를 입력해주세요';
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      if (chat) {
        if (chat.split(':')[1] == 'undefined') {
          alert('로그인해주세요.');
          return;
        }
        if (chat.split(':')[0] == chat.split(':')[1]) {
          alert('자신과는 대화를 할 수 없습니다.');
          return;
        }
        chatRef.current.style.transform = 'translateY(0px)';
        if (chat !== 'inlist') {
          getUserProfile(chat.split(':')[0]);
        }
      } else {
        chatRef.current.style.transform = 'translateY(200%)';
      }
    }
  }, [chat]);

  useEffect(() => {
    if (messageSets[messageSets.length - 1]?.email == session?.user.email) {
      if (chatSpaceRef.current) {
        chatSpaceRef.current.scrollTop = chatSpaceRef.current.scrollHeight;
      }
    } else {
      if (chatSpaceRef.current) {
        if (lastChatRef.current) {
          if (
            Math.ceil(chatSpaceRef.current.scrollTop) +
              chatSpaceRef.current.clientHeight +
              100 <
            chatSpaceRef.current.scrollHeight
          ) {
            lastChatRef.current.style.display = 'block';
          } else {
            lastChatRef.current.style.display = 'none';
            chatSpaceRef.current.scrollTop = chatSpaceRef.current.scrollHeight;
          }
        }
      }
    }
  }, [messageSets]);

  useEffect(() => {
    if (inView) {
      if (lastChatRef.current) {
        lastChatRef.current.style.display = 'none';
      }
    }
  }, [inView]);

  return (
    <div ref={chatRef} className="chat">
      <div className="chat-up-part">
        {chat == 'inlist' ? (
          <div></div>
        ) : (
          <IoMdArrowBack
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setChat('inlist');
              //   setIsList(true);
            }}
          />
        )}

        <div></div>
        {/* <div onClick={tempenviro}>안녕</div> */}
        <IoIosClose
          style={{ fontSize: '24px', cursor: 'pointer' }}
          onClick={handleChatOff}
        />
      </div>
      {chat !== 'inlist' ? (
        <div style={{ height: '95%' }}>
          <div ref={chatSpaceRef} className="chat-window font-insert">
            {messageSets.map((each: any, index: number) => {
              return (
                <div
                  key={index}
                  style={{
                    padding: '5px 0px',
                    color: 'black',
                    textAlign:
                      each.email == session?.user.email ? 'end' : 'start',
                  }}
                >
                  <div className="message-writer">{each.user}</div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        each.email == session?.user.email ? 'end' : 'start',
                    }}
                  >
                    {each.email == session?.user.email ? (
                      <div className="chat-time">
                        <div>{each.date.split(' ')[1].substring(0, 5)}</div>
                      </div>
                    ) : null}
                    <div
                      className="message-content"
                      style={{
                        backgroundColor:
                          each.email == session?.user.email
                            ? 'rgba(255, 0, 0, 0.3)'
                            : 'lavender',
                        textAlign: 'start',
                      }}
                    >
                      <TextWithLinks text={each.chat} />
                    </div>
                    {each.email == session?.user.email ? null : (
                      <div className="chat-time">
                        <div>{each.date.split(' ')[1].substring(0, 5)}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="chat-invisible" ref={reference}></div>
          </div>
          <div className="chat-below-part">
            <div
              ref={lastChatRef}
              className="chat-last font-insert"
              onClick={() => {
                if (chatSpaceRef.current)
                  chatSpaceRef.current.scrollTop =
                    chatSpaceRef.current.scrollHeight;
              }}
            >
              {messageSets[messageSets.length - 1]?.user} :{' '}
              {messageSets[messageSets.length - 1]?.chat}
            </div>
            <div className="chat-below-set">
              <input
                className="chat-input"
                ref={messageRef}
                onKeyDown={(e: any) => {
                  if (e.key == 'Enter') {
                    sendMessage(null);
                  }
                }}
                placeholder={getPlaceholder()}
              ></input>
              <button
                className="chat-button font-insert"
                style={{ color: 'black' }}
                onClick={() => {
                  sendMessage(null);
                }}
              >
                작성
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="chat-window-list font-insert">
          {chatList.map((chat: any) => {
            let image = '';
            let nick = '';
            let email = '';
            chat.people.map((name: any) => {
              if (name?.userEmail !== session?.user.email) {
                image = name?.userImage;
                nick = name?.userName;
                email = name?.userEmail;
              }
            });
            return (
              <div
                key={email}
                className="chat-window-list-each"
                onClick={(e) => {
                  setChat(email + ':' + session?.user.email);
                }}
              >
                <div
                  className="profile-image-inchat"
                  style={{
                    backgroundImage:
                      image !== 'default'
                        ? `url(${image})`
                        : `url(${defaultImage.src})`,
                  }}
                ></div>
                <div>
                  <div>{nick}</div>
                  <div>{chat.lastChat}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
