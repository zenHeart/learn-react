import React from "react";

let a = 1

export function Counter() {
   const [count, setCount] = React.useState(0);
   

   React.useEffect(() => {
      debugger;
      console.log("lifecycle useEffect");
   }, [count]);

   React.useLayoutEffect(() => {
      debugger;
      console.log("lifecycle useLayoutEffect");
   });

   const add = () => {
      debugger
      setCount(count + 1);
      a++;
      console.log("add count :%d, a:%d", count, a);
   };

   const add1 = () => {
      console.log("nothing change");
   };

   //  try {
   if (count > 10000) {
      throw new Error("I crashed!");
   }
   //  } catch (error) {
   //     console.error(error);
   //     return <h1>Caught an error.</h1>;
   //  }
   //  let i = 1e9;
   //  while(i--);
   return (
      <div>
         <button onClick={add}>Count:{count}</button>
         <button onClick={add1}>not change</button>
      </div>
   );
}

class App extends React.Component {
   state = { time: new Date().toLocaleTimeString(), error: false };
   // 挂载钩子
   UNSAFE_componentWillMount() {
      debugger;
      console.log("lifecycle UNSAFE_componentWillMount");
   }

   componentWillMount() {
      debugger;
      console.log("lifecycle componentWillMount");
   }

   componentDidMount() {
      debugger;
      console.log("lifecycle componentDidMount");
   }

   // 属性变更钩子
   UNSAFE_componentWillReceiveProps(nextProps: any) {
      debugger;
      console.log("lifecycle UNSAFE_componentWillReceiveProps");
   }

   componentWillReceiveProps(nextProps: any) {
      debugger;
      console.log("lifecycle componentWillReceiveProps");
   }

   // 判断是否更新钩子
   shouldComponentUpdate(nextProps: any, nextState: any) {
      debugger;
      console.log("lifecycle shouldComponentUpdate");
      return true;
   }

   // 更新钩子
   UNSAFE_componentWillUpdate() {
      debugger;
      console.log("lifecycle UNSAFE_componentWillUpdate");
   }

   static getDerivedStateFromProps(props: any, state: any) {
      debugger;
      console.log("lifecycle getDerivedStateFromProps");
      return null;
   }

   getSnapshotBeforeUpdate(prevProps: any, prevState: any) {
      debugger;
      console.log("lifecycle getSnapshotBeforeUpdate");
      return null;
   }
   componentWillUpdate() {
      debugger;
      console.log("lifecycle componentWillUpdate");
   }

   componentDidUpdate() {
      debugger;
      console.log("lifecycle componentDidUpdate");
   }

   // 卸载钩子
   componentWillUnmount() {
      debugger;
      console.log("lifecycle componentWillUnmount");
   }

   // 错误处理钩子
   componentDidCatch(error: any, info: any) {
      console.error(error, info);
      this.setState({ error: true });
   }

   render() {
      debugger;

      return this.state.error ? (
         "error"
      ) : (
         <div>
            <Counter />
            {this.state.time}
            <p>a: {a}</p>
         </div>
      );
   }
}

export default App;
