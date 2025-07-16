import { TREE_COMPONENTS, TAGS_COLOR } from "./const";
import Nav from "./components/Nav";
import { SearchProvider } from "./components/SearchProvider";
import { SearchModal } from "./components/SearchModal";

function App() {
  return (
    <SearchProvider>
      <div className="App">
        {/* @ts-ignore */}
        <Nav children={TREE_COMPONENTS} tagsColor={TAGS_COLOR}></Nav>
        <SearchModal />
      </div>
    </SearchProvider>
  );
}

export default App;
