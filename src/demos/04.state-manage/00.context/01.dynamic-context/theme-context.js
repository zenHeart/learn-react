import React from 'react'
export const themes = {
  light: {
    background: '#fefefe',
    color: '#888',
    padding: '10px'
  },
  dark: {
    background: '#333',
    color: '#f3f3f3',
    padding: '10px'
  }
}

export default React.createContext(themes.light)
