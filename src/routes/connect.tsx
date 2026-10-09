import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/connect")({
  component: () => <Navigate to="/node" />,
});
