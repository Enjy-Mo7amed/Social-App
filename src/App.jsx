import { useEffect, useRef } from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./Components/Layout/Layout";
import Notfound from "./Components/Notfound/Notfound";
import Home from './Components/Home/Home';
import Register from './Auth/Register/Register';
import Login from './Auth/Login/Login';
import TokenContextProvider from "./Context/TokenContext";
import ProtrctedRout from "./Components/ProtrctedRout/ProtrctedRout";
import Profile from "./Components/Profile/Profile";
import AuthRout from "./Components/AuthRout/AuthRout";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PostDetails from "./Components/PostDetails/PostDetails";
import { Slide, toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNetworkState } from "react-use";
import Changepass from "./Components/Changepass/Changepass";
import Feeds from "./Components/Feeds/Feeds";
import SavedBM from "./Components/SavedBM/SavedBM";
import Suggestedfollowers from "./Components/Suggestedfollowers/Suggestedfollowers";

const query = new QueryClient()
const router = createBrowserRouter([
  {
    path: "",
    element: <Layout />,
    children: [
      { index: true, element: <AuthRout><Register /></AuthRout> },
      { path: "login", element: <AuthRout><Login /></AuthRout> },
      { path: "home", element: <ProtrctedRout><Home /></ProtrctedRout> },
      { path: "profile", element: <ProtrctedRout><Profile /></ProtrctedRout> },
      { path: "profile/:id", element: <ProtrctedRout><Profile /></ProtrctedRout> },
      { path: "changepass", element: <ProtrctedRout><Changepass /></ProtrctedRout> },
      { path: "postDetails/:id", element: <ProtrctedRout><PostDetails /></ProtrctedRout> },
      { path: "feeds", element: <ProtrctedRout><Feeds /></ProtrctedRout> },
      { path: "bookmarks", element: <ProtrctedRout><SavedBM /></ProtrctedRout> },
      { path: "suggestedfollowers", element: <ProtrctedRout><Suggestedfollowers /></ProtrctedRout> },
      { path: "*", element: <Notfound /> },
    ],
  },
], {
});

function App() {
  const { online } = useNetworkState()
  const previousOnline = useRef(online)

  useEffect(() => {
    if (online === undefined || online === previousOnline.current) {
      previousOnline.current = online
      return
    }

    if (!online) {
      toast.error('You are offline now..!!', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Slide,
      });
    } else {
      toast.success('You are online now..!!', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Slide,
      });
    }
    previousOnline.current = online
  }, [online])

  return (
    <>
      <QueryClientProvider client={query}>
        <TokenContextProvider>
          <RouterProvider router={router}></RouterProvider>
          <ToastContainer />
        </TokenContextProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
