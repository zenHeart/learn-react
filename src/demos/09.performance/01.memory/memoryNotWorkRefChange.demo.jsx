import { useState, memo } from 'react';
function LargeChildren({ items }) {
  let i = 1e9;
  console.log('LargeChildren render');
  while (i--);
  return (
    <div>
      {items.map((item) => <div key={item.id}>{`${item.id}.${item.name}`}</div>)}
    </div>
  );
}

// use memo to avoid the large children component unexpected update by parent component
const MemoLargeChildren = memo(LargeChildren);
const MemoLargeChildren2 = memo(LargeChildren, (prevProps, nextProps) => {
  // use this way to avoid the memo not work
  return JSON.stringify(prevProps.items) === JSON.stringify(nextProps.items);
});

const Items = [{ id: 1, name: 'test' }, { id: 2, name: 'jack' }];
function ParentChangeChildrenMemoNotWorkRefChange() {
  const [filterName, setFilterName] = useState('');
  const [isMemoDiffRule, setMemoDiffRule] = useState(false);
  // even filterName maybe output same result, but the filteredItem is a new array, so the memo will not work
  const filteredItem = Items.filter((item) => item.name.includes(filterName)) || []
  return (
    <div>
      <input value={filterName} onChange={(e) => setFilterName(e.target.value)} />
      <button onClick={() => setMemoDiffRule(!isMemoDiffRule)}>{isMemoDiffRule ? 'close memo diff rule' : 'open memo diff rule'}</button>
      {
        isMemoDiffRule ? <MemoLargeChildren2 items={filteredItem} /> : <MemoLargeChildren items={filteredItem} />
      }
    </div>
  );
}
ParentChangeChildrenMemoNotWorkRefChange.meta = {
  tags: ['memo'],
};

export default ParentChangeChildrenMemoNotWorkRefChange;