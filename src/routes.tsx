import {Navigate, Route, Routes} from "react-router";
import {LoginPage} from "./pages/login/Login.tsx";
import {LoginSuccessPage} from "./pages/login/Success.tsx";
import {OrganizationsPage} from "./pages/organizations/OrganizationsPage.tsx";
import RunResultPage from "./pages/run_result/RunResult.tsx";
import {RepositoriesPage} from "./pages/repositories/RepositoriesPage.tsx";
import {RepositoryPage} from "./pages/repository/RepositoryPage.tsx";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/login/success" element={<LoginSuccessPage/>}/>
      <Route path="/:provider/orgs" element={<OrganizationsPage/>}/>
      <Route path="/:provider/:org" element={<RepositoriesPage/>}/>
      <Route path="/:provider/:org/:repo" element={<RepositoryPage/>}/>
      <Route path="/:provider/:org/:repo/run/:run" element={<RunResultPage/>}/>
      <Route path="/results" element={<RunResultPage/>}/>
      <Route path="*" element={<div>Not Found</div>}/>
    </Routes>
  )
}
