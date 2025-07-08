import { TREE_COMPONENTS, TAGS_COLOR } from "./const";
import Nav from "./components/Nav";

function App() {
  return (
      <div className="App">
        {/* @ts-ignore */}
        <Nav children={TREE_COMPONENTS} tagsColor={TAGS_COLOR}></Nav>
      </div>
  );
}

export default App;
