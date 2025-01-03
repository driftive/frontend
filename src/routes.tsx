import {Route, Routes} from "react-router";
import {LoginPage} from "./pages/login/Login.tsx";
import {LoginSuccessPage} from "./pages/login/Success.tsx";
import {OrganizationsPage} from "./pages/organizations/OrganizationsPage.tsx";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="/login/success" element={<LoginSuccessPage/>}/>
      <Route path="/:provider/orgs" element={<OrganizationsPage/>}/>
      <Route path="*" element={<div>Not Found</div>}/>
    </Routes>
  )
}
