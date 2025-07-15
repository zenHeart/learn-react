import React from 'react'

function Fragment () {
  return (
    <div>
      <h2>采用 fragment 包裹片段代码</h2>
      <ul>
        <li>
          <h3>使用 {`<>片段...</>`} 包裹内容</h3>
          <F1></F1>
        </li>
        <li>
          <h3>使用 {`<React.Fragment>片段...</React.Fragment>`} 效果相同</h3>
          <F2></F2>
        </li>
        <li>
          <h3>同样支持传入 key</h3>
          <Glossary
            items={[
              { id: 1, term: 'foo', description: 'test' },
              { id: 2, term: 'foo1', description: 'test1' }
            ]}
          ></Glossary>
        </li>
      </ul>
    </div>
  )
}
function F1 () {
  return (
    <>
      <p>这是一个片段没有根元素</p>
      <p>这是一个片段没有根元素</p>
    </>
  )
}

function F2 () {
  return (
    <React.Fragment>
      <p>这是一个片段没有根元素</p>
      <p>这是一个片段没有根元素</p>
    </React.Fragment>
  )
}

function Glossary (props) {
  return (
    <dl>
      {props.items.map(item => (
        //   Fragment 支持传入 key
        <React.Fragment key={item.id}>
          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </React.Fragment>
      ))}
    </dl>
  )
}
export default Fragment
