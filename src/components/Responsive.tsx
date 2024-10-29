'use client';
import styled from 'styled-components';

export default function Responsive({ children, ...props }: any) {
  return <div className="responsive">{children}</div>;
}
