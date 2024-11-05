'use client';

import empty from '../asset/Type=Todo, Size=Large.png';
import empty2 from '../asset/Type=Done, Size=Large.png';

interface Props {
  type: string;
}
export default function Empty(props: Props) {
  const { type } = props;
  return (
    <div className="done-empty">
      <img src={type == 'yet' ? empty.src : empty2.src}></img>
      <div>{type == 'yet' ? '할 일이 없어요.' : '아직 다 한 일이 없어요.'}</div>
      <div>
        {type == 'yet'
          ? 'TODO를 새롭게 추가해주세요!'
          : '해야 할 일을 체크해보세요!'}
      </div>
    </div>
  );
}
