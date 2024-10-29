import {
  addPost,
  addPost2,
  boardCheck,
  getSpecificBoard,
} from '@/data/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const data = await request.json();
  let response = {};
  const check = await boardCheck();
  if (check.includes(data.boardName)) {
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    if (data.content == '제발용') {
      console.log('여기거덩');
      const addedPost = await addPost2(data);
      response = {
        message: '성공',
        data: addedPost,
      };
      return Response.json(response, { status: 200 });
    }
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    const addedPost = await addPost(data);
    response = {
      message: '성공',
      data: addedPost,
    };
  } else {
    response = {
      message: '실패',
      data: [],
    };
  }
  return Response.json(response, { status: 200 });
}
