# 🎯 Step 1 Exercise: React vs ReactDOM Separation

## 🎯 Learning Objectives
By the end of this exercise, you'll understand:
- What React core does vs what ReactDOM does
- Why the separation exists
- How to distinguish between React and ReactDOM operations

## 📋 Prerequisites
- Basic knowledge of React.createElement
- Understanding of JavaScript objects
- Familiarity with DOM manipulation

## 🔥 Challenge 1: Identify the Package (Easy)

Look at the following code snippets and identify whether they use **React** or **ReactDOM**:

```javascript
// Snippet A
const element = React.createElement('div', null, 'Hello World');

// Snippet B
const root = ReactDOM.createRoot(document.getElementById('root'));

// Snippet C
const [state, setState] = React.useState(0);

// Snippet D
root.render(<App />);

// Snippet E
React.memo(MyComponent);

// Snippet F
ReactDOM.flushSync(() => {
    setState(newValue);
});
```

**Your Task:** 
Create a text file called `answers-challenge1.txt` and write:
- "React" or "ReactDOM" for each snippet
- One sentence explaining why

## 🔥 Challenge 2: Element Creation Deep Dive (Medium)

Create an HTML file called `challenge2.html` with the following requirements:

1. **Create React elements** (don't render them yet) for:
   - A button with text "Click me" and an onClick handler
   - A div containing an h1 with "Welcome" and a p with "This is a paragraph"
   - A nested structure: div > ul > li (with 3 list items)

2. **Log the element structures** to console and observe:
   - What properties does each element have?
   - How are children represented?
   - What happens with nested elements?

3. **Answer these questions** in comments:
   - Are these elements visible on the page? Why or why not?
   - What's the difference between the element and actual DOM?

## 🔥 Challenge 3: Rendering Experiments (Medium)

Create an HTML file called `challenge3.html` that demonstrates:

1. **Multiple Roots**: Create 3 different root containers and render different content to each
2. **Conditional Rendering**: Create a button that toggles between rendering different elements to the same root
3. **No ReactDOM**: Try to make React elements interactive without using ReactDOM (hint: it's impossible!)

**Questions to Answer:**
- Can you have multiple ReactDOM roots on one page?
- What happens when you render to the same root multiple times?
- Why can't React elements be interactive without ReactDOM?

## 🔥 Challenge 4: Alternative Renderers (Advanced)

Research and experiment:

1. **React Native**: Look up how React Native uses React without ReactDOM
2. **React Testing Library**: Find out how testing libraries render React elements
3. **Server-Side Rendering**: Research ReactDOMServer and how it's different from ReactDOM

**Your Task:**
Write a short explanation (200-300 words) about:
- Why React's separation enables these different use cases
- What would happen if React and ReactDOM were one package

## 🔥 Challenge 5: Build Your Own Mini-Renderer (Expert)

This is advanced! Try to build a simple "renderer" that takes React elements and outputs to something other than DOM:

```javascript
// Your goal: implement this function
function renderToConsole(element) {
    // Take a React element and "render" it to console.log
    // Handle nested elements and props
}

// Example usage:
const element = React.createElement('div', 
    { className: 'container' },
    React.createElement('h1', null, 'Hello'),
    React.createElement('p', null, 'World')
);

renderToConsole(element);
// Should output something like:
// <div className="container">
//   <h1>Hello</h1>
//   <p>World</p>
// </div>
```

## 🎯 Self-Check Questions

Before moving to the next step, make sure you can answer:

1. **What is React's primary job?**
2. **What is ReactDOM's primary job?**
3. **Why doesn't React directly manipulate the DOM?**
4. **Name 3 different "renderers" that can work with React core**
5. **What happens if you create React elements but don't render them?**
6. **Can you use React without ReactDOM? Give an example.**

## 🏆 Bonus Challenge

Create a comparison table:

| Operation | React | ReactDOM | Why? |
|-----------|-------|----------|------|
| createElement | ✅ | ❌ | React's job is element creation |
| useState | ? | ? | ? |
| createRoot | ? | ? | ? |
| render | ? | ? | ? |
| memo | ? | ? | ? |
| flushSync | ? | ? | ? |

Fill in the table and provide explanations!

## 📚 Resources for This Step

- [React Documentation: React.createElement](https://react.dev/reference/react/createElement)
- [ReactDOM Documentation](https://react.dev/reference/react-dom)
- [React Reconciliation](https://react.dev/learn/preserving-and-resetting-state)

## ✅ Ready for Next Step?

You're ready for **Step 2: Element to Fiber** when you can:
- Clearly explain the difference between React and ReactDOM
- Create React elements programmatically
- Understand why the separation exists
- Identify which package different React APIs belong to

---

💡 **Tip:** The key insight is that React is about **describing** what you want, while ReactDOM is about **making it happen** in the browser! 