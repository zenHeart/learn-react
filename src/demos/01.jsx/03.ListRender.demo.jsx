import React from 'react'

function D1 () {
  let a = [1, 2, 3, 4]
  return (
    <div>
      <ul>
        <li>
          <h2>采用 map 迭代渲染</h2>
          {a.map(ele => {
            let spans = []
            for (let i = 1; i < 10; i++) {
              spans.push(<span key={i}>{i}</span>)
            }
            return (
              <p key={ele}>
                行{ele} {spans}{' '}
              </p>
            )
          })}
        </li>
      </ul>
    </div>
  )
}

D1.text = '列表熏染'

export default D1
