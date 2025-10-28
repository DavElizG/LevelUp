import AppRoutes from './routes/routes';
import NotificationContainer from './components/shared/NotificationContainer';

function App() {
  return (
    <div className="App">
      <AppRoutes />
      <NotificationContainer />
    </div>
  );
}

export default App;
