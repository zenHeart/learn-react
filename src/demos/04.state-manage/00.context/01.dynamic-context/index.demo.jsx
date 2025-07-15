import React from 'react'
import ThemeContext, { themes } from './theme-context.js'


function ThemeButton(props) {
  return <ThemeContext.Consumer>
    {theme => <button {...props} style={theme}></button>}
  </ThemeContext.Consumer>
}
function Toolbar(props) {
  return <ThemeButton onClick={props.changeTheme}>change theme</ThemeButton>
}
class App extends React.Component {
  constructor() {
    super();
    this.state = {
      theme: themes.light
    }
  }
  changeTheme = () => {
    this.setState(state => ({
      theme: state.theme === themes.light ? themes.dark : themes.light
    })
    )
  }

  render() {
    return (
      <div>
        <ThemeContext.Provider value={this.state.theme}>
          <Toolbar changeTheme={this.changeTheme}></Toolbar>
        </ThemeContext.Provider>
        <ThemeButton>demo---</ThemeButton>
        <p>{JSON.stringify(this.state.theme)}</p>
      </div>)
  }
}


export default () => <App />