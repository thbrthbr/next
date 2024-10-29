'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { CiMenuBurger } from 'react-icons/ci';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

export function MenuToggle() {
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  return (
    <div className="test">
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <Button variant="outline" size="icon">
            <CiMenuBurger style={{ color: 'black', fontSize: '20px' }} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="font-insert-2">
          <DropdownMenuItem
            onClick={() => {
              router.push('/');
            }}
          >
            PK-PLACE
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push('/community');
            }}
          >
            COMMUNITY
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push('/replayzer');
            }}
          >
            REPLAYZER
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push('/prefer-diagram');
            }}
          >
            PREFER-DIAGRAM
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push('/tier');
            }}
          >
            TIER-GENERATOR
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push('/ladder');
            }}
          >
            LADDER
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              router.push('/fame');
            }}
          >
            HALL-OF-FAME
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
