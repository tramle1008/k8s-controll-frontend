import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import AdminDashboard from './components/Pages/Admin/AdminDashboard';
import NodesPage from './components/Pages/Nodes/NodesPage';
import AdminLayout from './components/Pages/Layouts/AdminLayout';
import CreateClusterStepper from './components/Pages/Cluster/CreateClusterStepper';
import PodsPage from './components/Pages/Pods/PodPage';
import DeploymentPage from './components/Pages/Deployment/DeploymentPage';
import ServicePage from './components/Pages/Service/ServicePage';
import HpaPage from './components/Pages/Hpa/HpaPage';
import ConfigMapPage from './components/Pages/ConfigMap/ConfigMapPage';
import StatefulsetPage from './components/Pages/Statefulsets/StatefulsetPage';
import SecretPage from './components/Pages/Secrets/SecretPage';
import NameSpacePage from './components/Pages/NameSpace/NameSpacePage';
import CreateClusterLog from './components/Pages/Cluster/CreateClusterLog';
import Login from './components/Pages/Identity/Login';
import { Navigate } from "react-router-dom";

import PVPage from './components/Pages/PV/PVPage';
import PVCPage from './components/Pages/PVC/PVCPage';
import IngressPage from './components/Pages/Ingress/IngressPage';
import ClusterManagerPage from './components/Pages/Manager/ClusterManagerPage';
import UsersPage from './components/Pages/Manager/UsersPage';
import UserPage from './components/Pages/User/UserPage';
import InfoUser from './components/Pages/User/InfoUser';
import DeploymentInfo from './components/Pages/User/DeploymentInfo';
import RegistryReposPage from './components/Pages/Manager/RegistryReposPage';
import MetalLBPage from './components/Pages/Manager/MetalLBPage';
import AddonsPage from './components/Pages/Manager/AddonsPage';



function ProtectedRoute({ children, allowedRoles }) {
  const user = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  // chưa login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // có login nhưng không đúng role
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppContent() {
  return (
    <Routes>

      {/* public */}
      <Route path="/login" element={<Login />} />


      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        {/* ===== DÙNG CHUNG ===== */}
        <Route
          path="/"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ================= USER + ADMIN ================= */}
        <Route
          path="/workloads/pods"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
              <PodsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workloads/deployments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
              <DeploymentPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workloads/hpa"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
              <HpaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workloads/configmap"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
              <ConfigMapPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/workloads/secrets"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
              <SecretPage />
            </ProtectedRoute>
          }
        />

        {/* ================= CHỈ ADMIN ================= */}
        <Route
          path="/nodes"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <NodesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/networking/services"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
              <ServicePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/networking/ingress"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
              <IngressPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/storage/pv"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
              <PVPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workloads/statefulset"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
              <StatefulsetPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workloads/namespace"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
              <NameSpacePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/storage/pvc"
          element={
            <ProtectedRoute allowedRoles={["ADMIN", "USER"]}>
              <PVCPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cluster/manager"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ClusterManagerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cluster/create"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <CreateClusterStepper />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cluster/registry"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              < RegistryReposPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cluster/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cluster/lb"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <MetalLBPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cluster/addons"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <AddonsPage />
            </ProtectedRoute>
          }
        />

        {/* ================= USER riêng ================= */}
        <Route
          path="/user/info"
          element={
            <ProtectedRoute allowedRoles={["USER"]}>
              <InfoUser />
            </ProtectedRoute>
          }
        />

      </Route>

    </Routes>
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