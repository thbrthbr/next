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
import { useSession } from 'next-auth/react';
import { CiMenuBurger } from 'react-icons/ci';
import logo from '@/asset/psk-logo.png';
import defaultImage from '@/asset/psk-logo.png';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader
import { Carousel } from 'react-responsive-carousel';

export default function CarouselComponent2({ data }: any) {
  return (
    <>
      <Carousel
        showArrows={true}
        centerMode={true}
        centerSlidePercentage={30}
        showThumbs={false}
        infiniteLoop={true}
        showStatus={false}
        showIndicators={false}
        autoPlay={true}
        swipeable={true}
        width={'80vw'}
      >
        {data.map((item: any, idx: any) => {
          return (
            <div style={{ margin: '0px 10px' }}>
              <h1>{idx}</h1>
            </div>
          );
        })}
      </Carousel>
    </>
  );
}
