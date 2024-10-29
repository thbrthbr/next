import {
  addBoard,
  boardCheck,
  changeRole,
  deleteBoard,
  getLadder,
  isUser,
  tempAddLadder,
} from '@/data/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (params.id == 'board-check') {
    const check = await boardCheck();
    console.log(check);
    if (check === null) {
      return new Response(null, { status: 204 });
    }
    const response = {
      message: '성공',
      data: check,
    };
    return NextResponse.json(response, { status: 201 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  if (params.id == 'user-find') {
    const data = await request.json();
    const userFind = await isUser(data.userEmail);
    if (userFind === null) {
      return new Response(null, { status: 204 });
    }
    const response = {
      message: '성공',
      data: userFind,
    };
    return NextResponse.json(response, { status: 201 });
  }
  if (params.id == 'role-change') {
    const data = await request.json();
    const changedUser = await changeRole(data);
    if (changedUser === null) {
      return new Response(null, { status: 204 });
    }
    const response = {
      message: '성공',
      data: changedUser,
    };
    return NextResponse.json(response, { status: 201 });
  }
  if (params.id == 'board-create') {
    const data = await request.json();
    const createdBoard = await addBoard(data);
    if (createdBoard === null) {
      return new Response(null, { status: 204 });
    }
    const response = {
      message: '성공',
      data: createdBoard,
    };
    return NextResponse.json(response, { status: 201 });
  }
  if (params.id == 'board-delete') {
    const data = await request.json();
    const deletedBoard = await deleteBoard(data);
    if (deletedBoard === null) {
      return new Response(null, { status: 204 });
    }
    const response = {
      message: '성공',
      data: deletedBoard,
    };
    return NextResponse.json(response, { status: 201 });
  }
}
