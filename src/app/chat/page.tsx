'use client';
import { useEffect, useRef, useState } from 'react';
import PocketBase from 'pocketbase';

export default function Home() {
  //   const pb = new PocketBase(
  //     'https://pk-place.pockethost.io/api/collections/test/records',
  //   );

  const testPOST = async () => {
    const a = await fetch(
      'https://pk-place.pockethost.io/api/collections/test/records',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field: '테스트d용',
        }),
      },
    );
    let final = await a.json();
    console.log(final);
  };

  return (
    <div className="main-page font-insert">
      <button onClick={testPOST}>테스트</button>
    </div>
  );
}
