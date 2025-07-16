import React from 'react'

function D1 () {
  return (
    <div>
      <h2> props 赋值方式</h2>
      <ul>
        <li>
          <h3>采用 {`{}`} 赋值表达式 </h3>
          <p>
            {`<strong title="{'foo'+'bar'}">test</strong>`}:
            <strong title={'foo' + 'bar'}>test</strong>
          </p>
        </li>
        <li>
          <h3>采用字符串字面量</h3>
          <p>
            {`<strong title='<3'>test</strong>`} :
            <strong title='<3'>test</strong>
          </p>
          <p>
            {`<strong title={'<3'}>test</strong>`} :
            <strong title={'<3'}>test</strong>
          </p>
        </li>
        <li>
          <h3>布尔值</h3>
          <p>
            {` <input type='checkbox' checked></input>`} :
            <input type='checkbox' checked></input>
          </p>
          <p>
            {` <input type='checkbox' ></input>`} :
            <input type='checkbox'></input>
          </p>
          <p>
            {`<input type='checkbox' checked={true}></input>`} :
            <input type='checkbox' checked={true}></input>
          </p>
          <p>
            {`<input type='checkbox' checked={false}></input>`} :
            <input type='checkbox' checked={false}></input>
          </p>
        </li>
        <li>
          <h3>...会自动扩展属性赋值</h3>
        </li>
      </ul>
    </div>
  )
}
D1.text = 'props 赋值方式'

export default D1
