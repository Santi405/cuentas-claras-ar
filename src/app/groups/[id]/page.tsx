import Link from "next/link";
import { notFound } from "next/navigation";
import GroupDetail from "@/components/GroupDetail";
import { getGroup } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function GroupPage({ params }: PageProps<"/groups/[id]">) {
  const { id } = await params;
  const group = getGroup(id);
  if (!group) notFound();

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-sky-600 hover:underline">
        ← Volver a los grupos
      </Link>
      <GroupDetail id={id} />
    </div>
  );
}
