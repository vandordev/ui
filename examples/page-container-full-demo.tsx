import { PageContainer } from "@/registry/new-york/page-container";

export const PageContainerFullDemo = () => (
  <PageContainer size="full">
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-medium">Projects</h3>
      <div className="min-w-0 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Project status</caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="p-2">
                Project
              </th>
              <th scope="col" className="p-2">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">Website</td>
              <td className="p-2">Active</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </PageContainer>
);
