import FormBuilder from './pages/FormBuilder';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';

function App() {

  return (
    <React.Fragment>
      <ToastContainer/>
      <FormBuilder/>
    </React.Fragment>
  );
}

export default App;
