import React from "react";
import {useQuery} from "react-query";
import useAxios from "../../context/auth/axios.ts";
import {isOk} from "../../utils/axios.ts";

interface OrganizationDTO {
  id: number;
  name: string;
}

export const OrganizationsPage: React.FC = () => {

    const axios = useAxios();
    const listOrgsQuery = useQuery({
      queryKey: 'listOrgs', queryFn: async () => {
        const response = await axios.get<OrganizationDTO[]>('/v1/gh/orgs');
        // ok
        if (!isOk(response)) {
          throw new Error('Network response was not ok');
        }
        return response.data;
      }
    })

    return (
      <div>
        <h1>Organizations</h1>

        {listOrgsQuery.isLoading && <div>Loading...</div>}
        {listOrgsQuery.isError && <div>Error: {listOrgsQuery.error.message}</div>}
        {listOrgsQuery.isSuccess && <div>
            <ul>
              {listOrgsQuery.data.map((org: OrganizationDTO) => (
                <li key={org.id}>{org.name}</li>
              ))}
            </ul>
        </div>}
      </div>
    )
  }
;
