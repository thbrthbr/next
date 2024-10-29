import {
  boardCheck,
  deletePost,
  editPost,
  getSearchPosts,
  getSearchPosts2,
  getSpecificBoard,
} from '@/data/firebase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const boardId = params.id.split(':')[0];
  const boardPage = Number(params.id.split(':')[1]);
  const searchParams = request.nextUrl.searchParams;
  const check = await boardCheck();
  let response = {};
  if (check.includes(boardId)) {
    const option = searchParams.get('option');
    const value = searchParams.get('value');
    const page = searchParams.get('page');
    if (option && value && page) {
      const fetchedSearchPosts = await getSearchPosts({
        id: boardId,
        option,
        value,
        page,
      });
      if (fetchedSearchPosts === null) {
        return new Response(null, { status: 204 });
      }
      response = {
        message: '성공',
        data: fetchedSearchPosts,
      };
    } else {
      const fetchedReplay = await getSpecificBoard({
        id: boardId,
        page: boardPage ? boardPage : 1,
      });
      if (fetchedReplay === null) {
        return new Response(null, { status: 204 });
      }
      response = {
        message: '성공',
        data: fetchedReplay,
      };
    }
  } else {
    response = {
      message: '실패',
      data: [],
    };
  }

  return NextResponse.json(response, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const deleteAPost = await deletePost(params.id);
  const response = {
    message: '성공',
    data: deleteAPost,
  };
  if (deleteAPost === null) return new Response(null, { status: 204 });
  return NextResponse.json(response, { status: 201 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const data = await request.json();
  const editedTodo = await editPost(params.id, data);
  if (editedTodo === null) {
    return new Response(null, { status: 204 });
  }
  const response = {
    message: '성공',
    data: editedTodo,
  };
  return NextResponse.json(response, { status: 201 });
}
