import React from 'react';
import { createContext, useContext, useState } from 'react';
import './style.css';
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  Link,
  Outlet,
  useNavigate,
} from 'react-router-dom';

const TransitionContext = createContext();
window.addEventListener("pageswap", async (e) => {
  console.log({ e })
})
export function TransitionProvider({ children }) {
  const [transition, setTransition] = useState('');

  return (
    <TransitionContext.Provider value={{ transition, setTransition }}>
      {children}
    </TransitionContext.Provider>
  );
}

const TransitionStyles = () => {
  const { transition } = useContext(TransitionContext);
  const TRANSITION_STYLES = {
    push: `
      ::view-transition-old(root) {
        animation: 0.25s ease-in-out both push-move-out-left; 
      }
      ::view-transition-new(root) {
        animation: 0.25s ease-in-out both push-move-in-from-right;
      }
    `,
    pop: `
      ::view-transition-old(root) {
        animation: 0.25s ease-in-out both pop-move-out-right;
        z-index: 2;
      }
      ::view-transition-new(root) {
        animation: 0.25s ease-in-out both pop-move-in-from-left;
        z-index: 1;
      }
    `,
  };

  const transitionStyles = TRANSITION_STYLES[transition] || '';

  return <style>{transitionStyles}</style>;
};

const TransitioningLink = ({ to, transition, children, ...props }) => {
  const { setTransition } = useContext(TransitionContext);
  const navigate = useNavigate();
  const viewTransitionSupported = Boolean(document.startViewTransition);

  const handleNavigation = (event) => {
    event.preventDefault();

    setTransition(transition);

    if (to === '-1') to = -1; // is equivalent to hitting the back button; @see: https://reactrouter.com/6.28.1/hooks/use-navigate#usenavigate

    if (viewTransitionSupported) {

      document.startViewTransition(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));

//        console.log(event)
//        window.scrollTo(0, 0);
        const prevBodyHeight = document.body.scrollHeight;
        navigate(to);
        requestAnimationFrame(_ => {
          const newBodyHeight = document.body.scrollHeight;
          console.log({prevBodyHeight, newBodyHeight})
          //if(newBodyHeight <= prevBodyHeight) return;
          //console.log('fixing viewtransition bug')
          //document.body.style.height = `${prevBodyHeight}px`;
          window.scrollTo(0, 0);

          setTimeout(_ => {
            //document.body.style = '';
          }, 300)
        })
      });
      return;
    }

    navigate(to);
  };

  return (
    <Link to={to} {...props} onClick={handleNavigation}>
      {children}
    </Link>
  );
};

const Layout = () => {
  return (
    <div>
      <TransitionStyles/>
      <header>
        <Link index to="/page1">
          {' '}
          {/* regular Link without transition */}
          Page1
        </Link>
        <Link to="/page2">Page2</Link>
        <Link to="/page3">Page3</Link>
      </header>

      <Outlet />
    </div>
  );
};

const Page1 = () => {
  return (
    <div className="page page1">
      <h1>Page1 (React Router)</h1>
      <ul>
        {Array.from({ length: 20 }, (_, index) => (
          <li key={index}>Loem Ipsum Dolor {index + 1}</li>
        ))}
      </ul>
      <TransitioningLink to="/page2" transition="push">
        weiter
      </TransitioningLink>
      {/* ^^^^^^^^^^^^^ Link with transition */}
    </div>
  );
};

const Page2 = () => {
  return (
    <div className="page page2">
      <div className="ruler"></div>
      <h1>Page2 (React Router)</h1>

      <div className="row">
        <TransitioningLink to="/page1" transition="pop">
          zurück
        </TransitioningLink>

        <TransitioningLink to="/page3" transition="push">
          weiter
        </TransitioningLink>
      </div>

      <ul>
        {Array.from({ length: 20}, (_, index) => (
          <li key={index}>Loem Ipsum Dolor {index + 1}</li>
        ))}
      </ul>

      <div className="row">
        <TransitioningLink to="/page1" transition="pop">
          zurück
        </TransitioningLink>

        <TransitioningLink to="/page3" transition="push">
          weiter
        </TransitioningLink>
      </div>

      <ul>
        {Array.from({ length: 270 }, (_, index) => (
          <li key={index}>Loem Ipsum Dolor {index + 1}</li>
        ))}
      </ul>

      <div className="row">
        <TransitioningLink to="/page1" transition="pop">
          zurück
        </TransitioningLink>

        <TransitioningLink to="/page3" transition="push">
          weiter
        </TransitioningLink>
      </div>
    </div>
  );
};

const Page3 = () => {
  /*
  const location = useLocation();
  useEffect(() => {
    console.log('MyPage ist sichtbar!');
    window.scrollTo(0, 0);
  }, [location.pathname]);
  */
  return (
    <div className="page page3">
      <TransitioningLink to="-1" transition="pop">
        zurück
      </TransitioningLink>


     <h1>Page3 (React Router)</h1>

      <TransitioningLink to="-1" transition="pop">
        zurück
      </TransitioningLink>
    </div>
  );
};

const RoutesJSX = (
  <Route path="/" element={<Layout />}>
    <Route index element={<Page1 />}></Route>
    <Route path="page1" element={<Page1 />}></Route>
    <Route path="page2" element={<Page2 />}></Route>
    <Route path="page3" element={<Page3 />}></Route>
  </Route>
)

const routes = createRoutesFromElements(RoutesJSX);

const router = createBrowserRouter(routes);

export default function App() {
  return (
    <TransitionProvider>
      <RouterProvider router={router} />
    </TransitionProvider>
  );
}
