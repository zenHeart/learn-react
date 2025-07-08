import { HashRouter as Router } from 'react-router';
import { TREE_COMPONENTS, TAGS_COLOR } from './const'
import Nav from './components/Nav';

function App() {
  return (
    <div className="App">
      <Router>
        {/* @ts-ignore */}
        <Nav children={TREE_COMPONENTS} tagsColor={TAGS_COLOR}></Nav>
      </Router>
    </div>
  )
}

export default App
