import { useState } from "react";

/**
 * 
 * 每次刷新都会触发重新请求导致重复渲染，
 * 
 */


// 模拟异步请求
async function updateQuantity(newQuantity) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(newQuantity);
    }, ~~(Math.random() * 2000));
  });
}


function Item({onUpdateQuantity}) {
  function handleChange(event) {
    onUpdateQuantity(event.target.value);
  }
  return (
    <div className="item">
      <span>演唱会门票</span>
      <label htmlFor="name">数量: </label>
      <input
        type="number"
        onChange={handleChange}
        defaultValue={1}
        min={1}
      />
    </div>
  )
}

const intl = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "CNY",
});

function Total({quantity, isPending}) {
  return (
    <div className="total">
      <span>总计:</span>
      <span>
        {isPending ? "🌀 更新中..." : `${intl.format(quantity * 9999)}`}
      </span>
    </div>
  )
}



function App({}) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, setIsPending] = useState(false);

  const onUpdateQuantity = async newQuantity => {
    // 手动设置 isPending 状态
    setIsPending(true);
    const savedQuantity = await updateQuantity(newQuantity);
    setIsPending(false);
    // 每次数量更新都会触发重新渲染
    setQuantity(savedQuantity);
  };

  return (
    <div>
      <h1>结账</h1>
      <Item onUpdateQuantity={onUpdateQuantity}/>
      <hr />
      <Total quantity={quantity} isPending={isPending} />
    </div>
  );
}

App.meta = {
  tags: ["hooks", "useTransition"],
};

export default App;
