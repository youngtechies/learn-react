import './App.css'
import Header from './components/Header'
import Registration from './components/Registration'
import ReactHooks from './pages/reactHooks/ReactHooks'
import {Routes, Route} from 'react-router-dom'

function App() {

  return (
    <>
    <Header />
    <Routes>
      <Route path='/' element= {<ReactHooks />} />
      <Route path='/register' element={ <Registration />}/>
    </Routes>
      
    </>
  )
}

export default App
