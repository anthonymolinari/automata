import Window from './components/Window';
import GlobalProvider from './context/GlobalProvider';

function App() {
  return (
    <GlobalProvider>
      <Window />
    </GlobalProvider>
  );
}

export default App;
