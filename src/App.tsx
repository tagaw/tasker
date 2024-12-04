import { useState } from 'react'
import Root,{loader as RootLoader, action as RootAction} from './routes/root';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Note, {loader as NoteLoader, action as PinAction} from './routes/note';
import EditNote, {action as EditAction} from './routes/edit';

const router = createBrowserRouter([
  {
    path:'/',
    element: <Root/>,
    loader: RootLoader,
    action: RootAction,
    children: [
      {
      path: ':year',
      children: [
        {
          index: true,
        },
        {
          path: ':month',
          children: [
            {
              index: true,
            },
            {
              path: ':day',
              children: [
                {
                  index: true,
                },
                {
                  path: ':id',
                  element: <Note/>,
                  loader: NoteLoader,
                  action: PinAction
                },
                {
                  path:':id/edit',
                  element: <EditNote/>,
                  loader: NoteLoader,
                  action: EditAction
                }
              ]
            }
          ]
        }
      ]
      }
    ]
  }
])

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App
