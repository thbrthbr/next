'use client';

import { useEffect, useRef, useState } from 'react';
import plusIcon from '../asset/Frame 2610256.png';
import checkIcon from '../asset/check.png';
import xIcon from '../asset/X.png';

interface Todo {
  id: number;
  imageUrl: string;
  isCompleted: boolean;
  memo: string;
  name: string;
  tenantId: string;
}

interface Props {
  newTodo: Todo;
  func: () => void;
  type: string;
}

export default function Button(props: Props) {
  const activateRef = useRef<HTMLButtonElement>(null);
  const isMounted = useRef(false);
  const [typeText, setTypeText] = useState('');
  const [typeIcon, setTypeIcon] = useState(plusIcon.src);
  const [original, setOriginal] = useState('');
  const { newTodo, func, type } = props;

  const chooseFunction = () => {
    if (type == 'add') addTodo();
    if (type == 'edit') editTodo();
    if (type == 'delete') deleteTodo();
  };

  const addTodo = async () => {
    await fetch(`https://assignment-todolist-api.vercel.app/api/thbr/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTodo.name }),
      cache: 'no-store',
    });
    func();
  };

  const editTodo = async () => {
    await fetch(
      `https://assignment-todolist-api.vercel.app/api/thbr/items/${newTodo.id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newTodo.name,
          memo: newTodo.memo,
          imageUrl: newTodo.imageUrl,
          isCompleted: newTodo.isCompleted,
        }),
        cache: 'no-store',
      },
    );
    func();
  };

  const deleteTodo = async () => {
    await fetch(
      `https://assignment-todolist-api.vercel.app/api/thbr/items/${newTodo.id}`,
      {
        method: 'DELETE',
        cache: 'no-store',
      },
    );
    func();
  };

  const detectActivate = () => {
    if (activateRef.current) {
      if (type == 'edit') {
        if (original && JSON.parse(original).id !== -1) {
          if (JSON.stringify(newTodo) !== original) {
            activateRef.current.style.backgroundColor = '#BEF264';
          }
        }
      }
    }
  };

  useEffect(() => {
    if (type == 'add') {
      setTypeText('추가하기');
      setTypeIcon(plusIcon.src);
    }
    if (type == 'edit') {
      setTypeText('수정 완료');
      setTypeIcon(checkIcon.src);
    }
    if (type == 'delete') {
      setTypeText('삭제하기');
      setTypeIcon(xIcon.src);
    }
  }, []);

  useEffect(() => {
    setOriginal(JSON.stringify(newTodo));
    if (isMounted.current) {
      detectActivate();
    } else {
      isMounted.current = true;
    }
  }, [newTodo]);

  return (
    <button
      ref={activateRef}
      className={`button ${type == 'add' && 'add-button'} ${
        type == 'edit' && 'edit-button'
      } ${type == 'delete' && 'delete-button'}`}
      onClick={chooseFunction}
    >
      <img className="button-icon" src={typeIcon} />
      &nbsp;
      <div>{typeText}</div>
    </button>
  );
}
