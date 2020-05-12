import React from "react";
import "./App.css";
import List from "./List";
import items from "./seeds";

function App() {
  return (
    <div className="App">
      <List items={items} />
    </div>
  );
}

export default App;
