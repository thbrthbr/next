import { NextRequest, NextResponse } from 'next/server';
import dummyTodos from '@/data/dummy.json';
import {
  fetchTodos,
  addTodo,
  editProfileImage,
  editNick,
  changePassword,
} from '@/data/firebase';

export async function POST(request: NextRequest) {
  const { email, pw } = await request.json();
  if (email === null || pw === null) {
    const errMessage = {
      message: '해치웠나',
    };
    return NextResponse.json(errMessage, { status: 422 });
  }
  let data = await changePassword({ email, pw });
  const response = {
    message: '무라사키',
    data,
  };
  return Response.json(response, { status: 200 });
}
