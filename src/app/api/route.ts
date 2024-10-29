import { NextRequest, NextResponse } from 'next/server';
export async function GET(request: NextRequest) {
  const response = {
    message: '아오',
    data: '아카',
  };
  return NextResponse.json(response, { status: 201 });
}
