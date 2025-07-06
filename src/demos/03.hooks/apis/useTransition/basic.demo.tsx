import { useState, useTransition, useEffect } from "react";


async function searchList(query) {
  await new Promise(resolve => setTimeout(resolve, 3000)); // 模拟网络延迟
  const allItems = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`);
  if (!query) return allItems;
  return allItems.filter(item => item.toLowerCase().includes(query.toLowerCase()));
}

function NoTransitionDemo() {
  const [input, setInput] = useState("");
  const [list, setList] = useState([]);

  useEffect(() => {
    searchList(input).then(setList);
  }, [input]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    // 直接同步更新大列表，输入会卡顿
  };

  return (
    <div>
      <h3>无 useTransition 示例</h3>
      <input value={input} onChange={handleChange} placeholder="输入内容" />
      <ul>
        {list.slice(0, 100).map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function UseTransitionDemo() {
  const [input, setInput] = useState("");
  const [list, setList] = useState([]);
  const [isPending, startTransition] = useTransition();

   useEffect(() => {
    startTransition(() => {
      searchList(input).then(setList);
    });
  }, [input]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
  };

  return (
    <div>
      <h3>useTransition 示例</h3>
      <input value={input} onChange={handleChange} placeholder="输入内容" />
      {isPending ? <p>Loading...</p> : (
         <ul>
        {list.slice(0, 100).map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      )}
     
    </div>
  );
}

function App() {
  return (
    <>
      <h2>useTransition 使用场景示例</h2>
      <NoTransitionDemo />
      <UseTransitionDemo />
    </>
  );
}

App.meta = {
  tags: ["hooks", "useTransition"],
};

export default App;
