import { useState, memo } from 'react';
function LargeChildren() {
  let i = 1e9;
  console.log('LargeChildren render');
  while (i--);
  return <div>LargeChildren</div>;
}

// use memo to avoid the large children component unexpected update by parent component
const MemoLargeChildren = memo(LargeChildren);


function ParentMakeChildrenUpdate() {
  const [count, setCount] = useState(0);
  const [isMemo, setMemo] = useState(false);
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>updateCount {count}</button>
      <button onClick={() => setMemo(!isMemo)}>{isMemo ? 'close memo' : 'open memory'}</button>
      {
        isMemo ? <MemoLargeChildren /> : <LargeChildren />
      }
    </div>
  );
}
ParentMakeChildrenUpdate.meta = {
  tags: ['memo'],
};

export default ParentMakeChildrenUpdate;