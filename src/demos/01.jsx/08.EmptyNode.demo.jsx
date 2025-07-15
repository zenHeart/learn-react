import React from 'react'

function D1 () {
  return (
    <div>
      <h2>jsx 支持的子节点</h2>
      <ul>
        <li>
          <h3>布尔,null,undefined 是无效的子节点,表示内容为空 </h3>
          <p>
            {`<strong>{true}</strong>`}:<strong>{true}</strong>
            <br />
            {`<strong>{false}</strong>`}:<strong>{false}</strong>
            <br />
            {`<strong>{null}</strong>`}:<strong>{null}</strong>
            <br />
            {`<strong>{undefined}</strong>`}:<strong>{undefined}</strong>
            <br />
            {`<strong>{0}</strong>`}: 注意 0 是有效子节点<strong>{0}</strong>
            <br />
          </p>
        </li>
      </ul>
    </div>
  )
}
D1.text = 'jsx 子节点'

export default D1
