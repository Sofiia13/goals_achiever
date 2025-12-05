import { Button } from "../shared/components/ui/Button";
import { Header } from "../shared/components/ui/Header";
import "./App.css";

function App() {
  return (
    <>
      <Header />
      <Button buttonText="Some text" onClick={() => alert("Button clicked!")} />
    </>
  );
}

export default App;
