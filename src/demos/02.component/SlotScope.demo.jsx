import React from 'react'

function List(props) {
  return (
    <div>
      <h2>slot scope in react test</h2>
      <ul>
        {
          props.lists.map(el => {
            if(props.item) {
            return (props.item({
                item: el
              }))
            } else {
              return (<li>{JSON.stringify(el)}</li>)
            }
          }) 
        }
      </ul>
    </div>
  )
}
function ShowList() {
  return <List item={Item} lists={[{a:1}, {a:2}]}/>
}

function Item(props) {
  return <span>{props.item.a}<br/></span>

}
ShowList.meta = {
  tags: [
    'slot-scope',
  ]
}

export default ShowList


