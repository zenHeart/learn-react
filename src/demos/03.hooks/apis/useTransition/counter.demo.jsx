import  { useState, useTransition, useDeferredValue } from "react";

async function apiGennerateId() {
  console.log("触发异步请求");
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Math.random().toString(36).substring(2, 15));
    }, (~~(Math.random() * 1000) + 500));
  });
}


function GetId() {
  const [id, setId] = useState(null);
  const [isPending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const newId = await apiGennerateId();
    setId(newId);
    setPending(false);
  }

  return (
    <div>
      <button onClick={handleClick}>获取 ID</button>
      {isPending ? <p>生成中...</p> : id && <p>生成的 ID: {id}</p>}
    </div>
  );
}

function GetIdWithTransition() {
  const [id, setId] = useState(null);
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    startTransition(async () => {
     const id =  await apiGennerateId()
     startTransition(() => {
      setId(id);
     })
    });
  }

  return (
    <div>
      <button onClick={handleClick}>获取 ID</button>
      {isPending ? <p>生成中...</p> : id && <p>生成的 ID: {id}</p>}
    </div>
  );
}


function GetIdDemo() {
  return (
    <div>
      <h2>获取 ID 示例</h2>
      <GetId />
      <p>这个示例展示了如何使用 useTransition 来处理异步操作。</p>
      <GetIdWithTransition />
    </div>
  );
}

GetIdDemo.meta = {
  tags: ["hooks", "useTransition"],
  disableSandpack: true,
};

export default GetIdDemo;