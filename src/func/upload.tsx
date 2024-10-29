'use client';

import firebase from 'firebase/compat/app';
import React, { useState, ChangeEvent } from 'react';
import { storage } from '@/data/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addReplay } from '@/data/firebase';
export function Upload() {
  const [htmlFile, setHtmlFile] = useState<File | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setHtmlFile(file);
    }
  };

  const handleUpload = () => {
    if (htmlFile) {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const htmlContent = e.target?.result as string;

        // 여기서 iframe 생성 및 콘텐츠 설정
        const iframe = document.getElementById(
          'resultIframe',
        ) as HTMLIFrameElement;
        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDocument) {
          iframeDocument.open();
          iframeDocument.write(htmlContent);
          iframeDocument.close();
        }
      };

      reader.readAsText(htmlFile);
    }
  };

  const handleStorage = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      console.log(event.target.files);
      const file = event.target.files[0];
      const fileNm = file.name;
      const path = 'replay/' + Date.now() + ':' + fileNm;

      // 파일 경로 설정
      const storageRef = ref(storage, path);

      uploadBytes(storageRef, file).then(async (snapshot) => {
        console.log('Uploaded a blob or file!');

        let result = await fetch('http://localhost:3000/api/replay', {
          method: 'POST',
          body: JSON.stringify({
            title: 'temp',
            fileName: path,
            filePassword: '1234',
            locked: 'false',
            privateURL: 'test',
          }),
          cache: 'no-store',
        });
        console.log(result);
        getDownloadURL(snapshot.ref).then((downUrl) => {
          console.log(downUrl);
        });
      });
    }
  };

  return (
    <div>
      <div>
        @@@@@@@@@@@
        <div>
          <input type="file" onChange={handleStorage} />
        </div>
        @@@@@@@@@@@
      </div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload HTML</button>
      <iframe
        id="resultIframe"
        title="Result iframe"
        width="100%"
        height="400px"
      />
    </div>
  );
}
