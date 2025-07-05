import { useState, memo, useMemo, useRef } from 'react';

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

const Items = [{ id: 1, name: 'test' }, { id: 2, name: 'jack' }];

function UseMemoAvoidRefChangeMemoNotWork() {
  const [filterName, setFilterName] = useState('');
  const prevFilteredItemRef = useRef([]);

  const filteredItem = useMemo(() => {
    const newFilteredItem = Items.filter((item) => item.name.includes(filterName)) || [];
    if (JSON.stringify(newFilteredItem) === JSON.stringify(prevFilteredItemRef.current)) {
      return prevFilteredItemRef.current;
    }
    prevFilteredItemRef.current = newFilteredItem;
    return newFilteredItem;
  }, [filterName]);

  return (
    <div>
      <input value={filterName} onChange={(e) => setFilterName(e.target.value)} />
      <MemoLargeChildren items={filteredItem} />
    </div>
  );
}

UseMemoAvoidRefChangeMemoNotWork.meta = {
  tags: ['memo'],
};

export default UseMemoAvoidRefChangeMemoNotWork;