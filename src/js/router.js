import axios from 'axios';
import Home from './pages/Home.js';
import Mydrawings from './pages/Mydrawings.js';
import Ranking from './pages/Ranking.js';
import Draw from './pages/Draw.js';
import Result from './pages/Result.js';
import NotFound from './pages/NotFound.js';
import Unauthorized from './pages/Unauthorized.js';

const routes = [
  { path: '/', component: Home },
  { path: '/mydrawings', needAuth: true, component: Mydrawings },
  { path: '/ranking', needAuth: true, component: Ranking },
  { path: '/draw', needAuth: true, component: Draw },
  { path: '/result', needAuth: true, component: Result },
  { path: '***', component: Unauthorized },
  { path: '**', component: NotFound }
];

const getComponent = path =>
  (routes.find(route => route.path === path) || routes.find(route => route.path === '**')).component();

const getNeedAuth = path => routes.find(route => route.path === path)?.needAuth || false;

const router = async (el, path, query) => {
  const needAuth = getNeedAuth(path);
  const { data: userId } = await axios.get('/auth');
  path = needAuth && !userId ? '***' : path;

  const page = getComponent(path);
  const { data } = await page.getData(query);
  el.innerHTML = page.getHtml({ ...data, userId });
  page.eventBinding(el, userId);
};

export default router;
