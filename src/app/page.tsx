'use client';
import Image from 'next/image';
import { Upload } from '@/func/upload';
import { useEffect, useRef } from 'react';
import { GlobalStore } from '@/data/store';
import SideBar from '@/components/Sidebar';
import bannerImg from '@/asset/pk-logo.png';
import { useSession } from 'next-auth/react';
import PocketBase from 'pocketbase';

export default function Home() {
  return (
    <div className="main-page">
      <div className="banner">
        <img className="banner-img" src={bannerImg.src}></img>
      </div>
      <div>PK-PLACE에 어서오세요</div>
    </div>
  );
}
