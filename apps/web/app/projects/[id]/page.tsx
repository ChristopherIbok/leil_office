import { ProjectWorkspace } from "../../../components/project-workspace";

type PageProps = {
  params: {
    id: string;
  };
};

export default function ProjectWorkspacePage({ params }: PageProps) {
  return <ProjectWorkspace projectId={params.id} />;
}
