import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import AdminDashboard from './components/Pages/Admin/AdminDashboard';
import CreateNS from './components/Pages/NameSpace/CreateNS';
import NodesPage from './components/Pages/Nodes/NodesPage';
import AdminLayout from './components/Pages/Layouts/AdminLayout';
import CreateClusterStepper from './components/Pages/Cluster/CreateClusterStepper';
import PodsPage from './components/Pages/Pods/PodPage';
function AppContent() {
  return (
    <>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<AdminDashboard />} />           {/* Dashboard chính */}
          <Route path="/nodes" element={<NodesPage />} />
          <Route path="/workloads/pods" element={<PodsPage />} />
          <Route path="/cluster/create" element={< CreateClusterStepper />} />
          <Route path="namespaces /create" element={<CreateNS />} />


        </Route>


      </Routes>
    </>
  );
}


function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;