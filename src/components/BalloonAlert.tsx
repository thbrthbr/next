'use client';

import { GlobalStore } from '@/data/store';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

export default function BalloonAlert() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(false);
  const { chat, setChat, newMessage, setNewMessage } = GlobalStore();
  const handleChat = () => {
    // setChat(true);
    setChat(newMessage.email + ':' + session?.user.email);
  };

  useEffect(() => {
    if (newMessage) {
      setIsVisible(true);
    }
  }, [newMessage]);

  useEffect(() => {
    let timer: any;
    if (isVisible) {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 2900);
    }
    return () => clearTimeout(timer);
  }, [isVisible]);
  return (
    <>
      {isVisible && !chat.includes(session?.user.email as string) && (
        <div
          className={`balloon-alert`}
          onClick={(e) => {
            e.stopPropagation();
            // e.preventDefault();
            handleChat();
          }}
        >
          <div className="balloon-alert-property">{newMessage?.user}</div>
          <div className="balloon-alert-property">{newMessage?.chat}</div>
        </div>
      )}
    </>
  );
}
