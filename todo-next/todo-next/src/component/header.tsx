'use client';

import logo from '../asset/Size=Large.png';
import logo2 from '../asset/Size=small.png';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  const goMain = () => {
    router.push('/');
  };
  return (
    <div className="header">
      <div className="logo">
        <img className="logo-image" src={logo.src} onClick={goMain}></img>
      </div>
      <div className="logo2">
        <img className="logo-image" src={logo2.src} onClick={goMain}></img>
      </div>
    </div>
  );
}
