'use client';
import Image from 'next/image';
import { Upload } from '@/func/upload';
import { useEffect, useRef, useState } from 'react';
import { GlobalStore } from '@/data/store';
import SideBar from '@/components/Sidebar';
import bannerImg from '@/asset/pk-logo.png';
import emailjs from 'emailjs-com';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Fame() {
  return <div className="login-page font-insert-2">안녕</div>;
}
