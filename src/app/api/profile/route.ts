import { NextRequest, NextResponse } from 'next/server';
import dummyTodos from '@/data/dummy.json';
import {
  fetchTodos,
  addTodo,
  editProfileImage,
  editNick,
} from '@/data/firebase';

export async function POST(request: NextRequest) {
  const { id, image, nick } = await request.json();
  if (id === null) {
    const errMessage = {
      message: '해치웠나',
    };
    return NextResponse.json(errMessage, { status: 422 });
  }
  let data;
  if (image !== null) {
    data = await editProfileImage({ email: id, image });
  } else {
    data = await editNick({ email: id, nick });
  }
  const response = {
    message: '무라사키',
    data,
  };
  return Response.json(response, { status: 200 });
}
